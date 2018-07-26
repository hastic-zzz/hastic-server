from services.server_service import ServerService

import asyncio


LOCK_WAIT_SLEEP_TIMESPAN = 100 # mc

class FileDescriptor:
    def __init__(self, filename: str, data_service):
        self.filename = filename
        self.data_service = data_service

    async def write(self, text: str):
        # TODO raise exception if not in lock
        await self.data_service.save_file(self, text)

    async def load(self) -> str:
        # TODO raise exception if not in lock
        return await self.data_service.load_file(self)

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

    async def save_file(self, file_descriptor: FileDescriptor, text: str):
        self.__check_lock(file_descriptor)
        await self.server_service.send_request({
            method: 'saveFile',
            paylod: { text: text }
        })

    async def load_file(self, file_descriptor: FileDescriptor) -> str:
        self.__check_lock(file_descriptor)
        return 'txt'

    def __check_lock(self, file_descriptor: FileDescriptor):
        filename = file_descriptor.filename
        if filename not in self.locks:
            raise RuntimeError('Can save to file %s without lock' % filename)


