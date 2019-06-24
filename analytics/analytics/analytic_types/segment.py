from typing import Optional

class Segment:
    '''
    Used for segment manipulation instead of { 'from': ..., 'to': ... } dict
    '''

    def __init__(self, from_timestamp: int, to_timestamp: int, message: str = None):
        if to_timestamp < from_timestamp:
            raise ValueError(f'Can`t create segment with to < from: {to_timestamp} < {from_timestamp}')
        self.from_timestamp = from_timestamp
        self.to_timestamp = to_timestamp
        self.message = message

    def to_json(self):
        return {
            'from': self.from_timestamp,
            'to': self.to_timestamp,
            'message': self.message
        }
