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
from analytic_types.detectors_typing import DetectionResult


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

    async def do_detect(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> dict:

        window_size = self._detector.get_window_size(cache)
        chunk_size = window_size * self.CHUNK_WINDOW_SIZE_FACTOR
        chunk_intersection = window_size * self.CHUNK_INTERSECTION_FACTOR

        chunks = []
        # XXX: get_chunks(data, chunk_size) == get_intersected_chunks(data, 0, chunk_size)
        if self._detector.is_detection_intersected():
            chunks = get_intersected_chunks(data, chunk_intersection, chunk_size)
        else:
            chunks = get_chunks(data, chunk_size)

        detections: List[DetectionResult] = []
        for chunk in chunks:
            await asyncio.sleep(0)
            chunk_dataframe = prepare_data(chunk)
            detected: DetectionResult = self._detector.detect(chunk_dataframe, cache)
            detections.append(detected)

        detection_result = self._detector.concat_detection_results(detections)

        return detection_result.to_json()

    def cancel(self):
        if self._training_future is not None:
            self._training_future.cancel()

    async def consume_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        window_size = self._detector.get_window_size(cache)

        detections: List[DetectionResult] = []
        for chunk in get_chunks(data, window_size * self.CHUNK_WINDOW_SIZE_FACTOR):
            await asyncio.sleep(0)
            chunk_dataframe = prepare_data(chunk)
            detected: DetectionResult = self._detector.consume_data(chunk_dataframe, cache)
            detections.append(detected)

        detection_result = self._detector.concat_detection_results(detections)

        if detection_result.lastDetectionTime is None:
            return None
        else:
            return detection_result.to_json()
