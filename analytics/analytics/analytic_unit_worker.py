import config
import detectors
import logging
import pandas as pd
from typing import Optional, Union, Generator, List
from models import ModelCache
import concurrent.futures
import asyncio
import utils
from utils import get_intersected_chunks, get_chunks, prepare_data

from analytic_types.detector_typing import DetectionResult

logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    CHUNK_WINDOW_SIZE_FACTOR = 100
    CHUNK_INTERSECTION_FACTOR = 2

    assert CHUNK_WINDOW_SIZE_FACTOR > CHUNK_INTERSECTION_FACTOR, \
        'CHUNK_INTERSECTION_FACTOR should be less than CHUNK_WINDOW_SIZE_FACTOR'

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector, executor: concurrent.futures.Executor):
        self.analytic_unit_id = analytic_unit_id
        self._detector = detector
        self._executor: concurrent.futures.Executor = executor
        self._training_future: asyncio.Future = None

    async def do_train(
        self, payload: Union[list, dict], data: list, cache: Optional[ModelCache]
    ) -> Optional[ModelCache]:

        dataframe = prepare_data(data)

        cfuture: concurrent.futures.Future = self._executor.submit(
            self._detector.train, dataframe, payload, cache
        )
        self._training_future = asyncio.wrap_future(cfuture)
        try:
            new_cache: ModelCache = await asyncio.wait_for(self._training_future, timeout = config.LEARNING_TIMEOUT)
            return new_cache
        except asyncio.CancelledError:
            return None
        except asyncio.TimeoutError:
            raise Exception('Timeout ({}s) exceeded while learning'.format(config.LEARNING_TIMEOUT))

    async def do_detect(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> DetectionResult:

        window_size = self._detector.get_window_size(cache)
        chunk_size = window_size * self.CHUNK_WINDOW_SIZE_FACTOR
        chunk_intersection = window_size * self.CHUNK_INTERSECTION_FACTOR

        detection_result = DetectionResult()

        for chunk in get_intersected_chunks(data, chunk_intersection, chunk_size):
            await asyncio.sleep(0)
            chunk_dataframe = prepare_data(chunk)
            detected = self._detector.detect(chunk_dataframe, cache)
            self.__append_detection_result(detection_result, detected)
        detection_result.segments = self._detector.get_intersections(detection_result.segments)
        return detection_result.to_json()

    def cancel(self):
        if self._training_future is not None:
            self._training_future.cancel()

    async def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[DetectionResult]:
        window_size = self._detector.get_window_size(cache)

        detection_result = DetectionResult()

        for chunk in get_chunks(data, window_size * self.CHUNK_WINDOW_SIZE_FACTOR):
            await asyncio.sleep(0)
            chunk_dataframe = prepare_data(chunk)
            detected = self._detector.consume_data(chunk_dataframe, cache)
            self.__append_detection_result(detection_result, detected)
        
        detection_result.segments = self._detector.get_intersections(detection_result.segments)

        if detection_result.last_detection_time is None:
            return None
        else:
            return detection_result.to_json()

    # TODO: move result concatination to detector's classes
    def __append_detection_result(self, detection_result: DetectionResult, new_chunk: dict):
        if new_chunk is not None:
            detection_result.cache = new_chunk.cache
            detection_result.last_detection_time = new_chunk.last_detection_time
            detection_result.segments.extend(new_chunk.segments)
