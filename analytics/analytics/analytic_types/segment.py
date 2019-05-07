from typing import Optional

class Segment:

    def __init__(self, start_timestamp: int, end_timestamp: int, params: Optional[dict] = None):
        self.start_timestamp = start_timestamp
        self.end_timestamp = end_timestamp
        self.params = params

    def to_json(self):
        return {
            'from': self.start_timestamp,
            'to': self.end_timestamp
        }
