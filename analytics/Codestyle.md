# Type hints

Please use: https://www.python.org/dev/peps/pep-0484/

# Line endings

We use LF everywhere

# Imports

You import local files first, than spesific liba and then standart libs.
So you import from something very scecific to something very common.
It allows you to pay attention on most important things from beginning.

```

from data_provider import DataProvider
from anomaly_model import AnomalyModel
from pattern_detection_model import PatternDetectionModel

import numpy as np

from scipy.signal import argrelextrema

import pickle

```