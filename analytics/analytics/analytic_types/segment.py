from typing import Optional

class Segment:
    '''
    Used for segment manipulation instead of { 'from': ..., 'to': ... } dict
    '''

    def __init__(self, from_timestamp: int, to_timestamp: int, labeled: bool = None, deleted: bool = None, message: str = None):
        if to_timestamp < from_timestamp:
            raise ValueError(f'Can`t create segment with to < from: {to_timestamp} < {from_timestamp}')
        self.from_timestamp = from_timestamp
        self.to_timestamp = to_timestamp
        self.labeled = labeled
        self.deleted = deleted
        self.message = message

    def to_json(self):
        return {
            'from': self.from_timestamp,
            'to': self.to_timestamp,
            'labeled': self.labeled,
            'deleted': self.deleted,
            'message': self.message
        }
