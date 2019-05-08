from typing import Optional

class Segment:
    '''
    Used for segment manipulation instead of { 'from': ..., 'to': ... } dict
    '''

    def __init__(self, from_timestamp: int, to_timestamp: int, params: Optional[dict] = None):
        if to_timestamp < from_timestamp:
            raise ValueError(f'Can`t create segment with to < from: {to_timestamp} < {from_timestamp}')
        self.from_timestamp = from_timestamp
        self.to_timestamp = to_timestamp
        self.params = params

    def to_json(self):
        return {
            'from': self.from_timestamp,
            'to': self.to_timestamp,
            'params': self.params
        }
