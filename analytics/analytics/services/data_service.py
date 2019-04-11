from services.server_service import ServerMessage, ServerService

import json
import asyncio

"""
This is how you can save a file:

async def test_file_save():
    async with data_service.open('filename') as f:
        print('write content')
        await f.write('test string')

    async with data_service.open('filename') as f:
        content = await f.load()
        print(content)
    print('test file ok')
"""


LOCK_WAIT_SLEEP_TIMESPAN = 100 # mc

class FileDescriptor:
    def __init__(self, filename: str, data_service):
        self.filename = filename
        self.data_service = data_service

    async def write(self, content: str):
        await self.data_service.save_file_content(self, content)

    async def load(self) -> str:
        return await self.data_service.load_file_content(self)

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

    async def save_file_content(self, file_descriptor: FileDescriptor, content: str):
        """ Saves json - serializable obj with file_descriptor.filename """
        self.__check_lock(file_descriptor)
        message_payload = {
            'filename': file_descriptor.filename,
            'content': content
        }
        message = ServerMessage('FILE_SAVE', message_payload)
        await self.server_service.send_request_to_server(message)

    async def load_file_content(self, file_descriptor: FileDescriptor) -> str:
        self.__check_lock(file_descriptor)
        message_payload = { 'filename': file_descriptor.filename }
        message = ServerMessage('FILE_LOAD', message_payload)
        return await self.server_service.send_request_to_server(message)

    def __check_lock(self, file_descriptor: FileDescriptor):
        filename = file_descriptor.filename
        if filename not in self.locks:
            raise RuntimeError('No lock for file %s' % filename)
