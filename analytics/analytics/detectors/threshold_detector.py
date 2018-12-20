import logging

from typing import Optional

from detectors import Detector
from models import ModelCache


logger = logging.getLogger('THRESHOLD_DETECTOR')


class ThresholdDetector(Detector):

    def __init__(self):
        pass

    def train(self, dataframe: pd.DataFrame, segments: list, cache: Optional[ModelCache]) -> ModelCache:
        pass

    def detect(self, dataframe: pd.DataFrame, cache: Optional[ModelCache]) -> dict:
        pass

    def recieve_data(self, data: pd.DataFrame, cache: Optional[ModelCache]) -> Optional[dict]:
        pass
