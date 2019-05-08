from typing import Optional

class Segment:
    '''
    Used for segment manipulation instead of { 'from': ..., 'to': ... } dict
    '''

    def __init__(self, from_timestamp: int, to_timestamp: int):
        if to_timestamp < from_timestamp:
            raise ValueError(f'Can`t create segment with to < from: {to_timestamp} < {from_timestamp}')
        self.from_timestamp = from_timestamp
        self.to_timestamp = to_timestamp

    def to_json(self):
        return {
            'from': self.from_timestamp,
            'to': self.to_timestamp
        }
