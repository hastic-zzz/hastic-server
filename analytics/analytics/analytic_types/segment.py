from typing import Optional

import utils.meta

@utils.meta.JSONClass
class Segment:
    '''
    Used for segment manipulation instead of { 'from': ..., 'to': ... } dict
    '''

    def __init__(
        self,
        from_timestamp: int,
        to_timestamp: int,
        _id: Optional[str] = None,
        analytic_unit_id: Optional[str] = None,
        labeled: Optional[bool] = None,
        deleted: Optional[bool] = None,
        message: Optional[str] = None
    ):
        if to_timestamp < from_timestamp:
            raise ValueError(f'Can`t create segment with to < from: {to_timestamp} < {from_timestamp}')
        self.from_timestamp = from_timestamp
        self.to_timestamp = to_timestamp
        self._id = _id
        self.analytic_unit_id = analytic_unit_id
        self.labeled = labeled
        self.deleted = deleted
        self.message = message

@utils.meta.JSONClass
class AnomalyDetectorSegment(Segment):
    '''
    Used for segment manipulation instead of { 'from': ..., 'to': ..., 'data': ... } dict
    '''

    def __init__(
        self,
        from_timestamp: int,
        to_timestamp: int,
        data = [],
        _id: Optional[str] = None,
        analytic_unit_id: Optional[str] = None,
        labeled: Optional[bool] = None,
        deleted: Optional[bool] = None,
        message: Optional[str] = None
    ):
        super().__init__(
            from_timestamp,
            to_timestamp,
            _id,
            analytic_unit_id,
            labeled,
            deleted,
            message
        )
        self.data = data
