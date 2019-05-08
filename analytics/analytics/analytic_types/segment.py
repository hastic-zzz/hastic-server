from typing import Optional

class Segment:
    '''
    Used for segment manipulation instead of { 'from': ..., 'to': ... } dict
    '''

    def __init__(self, start_timestamp: int, end_timestamp: int, params: Optional[dict] = None):
        if end_timestamp < start_timestamp:
            raise ValueError(f'Can`t create segment with to < from: {end_timestamp} < {start_timestamp}')
        self.start_timestamp = start_timestamp
        self.end_timestamp = end_timestamp
        self.params = params

    def to_json(self):
        return {
            'from': self.start_timestamp,
            'to': self.end_timestamp,
            'params': self.params
        }
