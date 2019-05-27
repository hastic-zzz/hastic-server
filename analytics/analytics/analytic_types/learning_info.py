import utils.meta

@utils.meta.JSONClass
class LearningInfo:

    def __init__(self):
        super().__init__()
        self.confidence = []
        self.patterns_list = []
        self.pattern_width = []
        self.pattern_height = []
        self.pattern_timestamp = []
        self.segment_center_list = []
        self.patterns_value = []

    def __str__(self):
        return str(self.to_json())