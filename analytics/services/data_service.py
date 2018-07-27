from services.server_service import ServerMessage, ServerService

import json
import asyncio


LOCK_WAIT_SLEEP_TIMESPAN = 100 # mc

class FileDescriptor:
    def __init__(self, filename: str, data_service):
        self.filename = filename
        self.data_service = data_service

    async def write(self, obj: object):
        # TODO raise exception if not in lock
        await self.data_service.save_file_obj(self, text)

    async def load(self) -> object:
        # TODO raise exception if not in lock
        return await self.data_service.load_file_obj(self)

    async def __aenter__(self):
        await self.data_service.wait_and_lock(self)
        return self

    async def __aexit__(self, *exc):
        await self.data_service.unlock(self)


class DataService:

    def __init__(self, server_service: ServerService):
        """Creates fs over network via server_service"""
        self.server_service = server_service
        self.locks = set()

    def open(self, filename: str) -> FileDescriptor:
        return FileDescriptor(filename, self)

    async def wait_and_lock(self, file_descriptor: FileDescriptor):
        filename = file_descriptor.filename
        while True:
            if filename in self.locks:
                asyncio.sleep(LOCK_WAIT_SLEEP_TIMESPAN)
                continue
            else:
                self.locks.add(filename)
                break

    async def unlock(self, file_descriptor: FileDescriptor):
        filename = file_descriptor.filename
        self.locks.remove(filename)

    async def save_file_obj(self, file_descriptor: FileDescriptor, obj: object):
        """ Saves json - serializable obj with file_descriptor.name """
        self.__check_lock(file_descriptor)
        message_payload = {
            'name': file_descriptor.filename,
            'data': json.dumps(obj)
        }
        message = ServerMessage('saveFile', message_payload)
        await self.server_service.send_request(message)

    async def load_file_obj(self, file_descriptor: FileDescriptor) -> str:
        self.__check_lock(file_descriptor)
        message_payload = { 'name': file_descriptor.filename }
        message = ServerMessage('getFile', message_payload)
        data = await self.server_service.send_request(message)
        return json.loads(data)

    def __check_lock(self, file_descriptor: FileDescriptor):
        filename = file_descriptor.filename
        if filename not in self.locks:
            raise RuntimeError('No lock for file %s' % filename)


