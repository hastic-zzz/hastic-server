#!/bin/bash
cd ..
python3.6 -m PyInstaller --paths=analytics/ --additional-hooks-dir=pyinstaller_hooks bin/server
