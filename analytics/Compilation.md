# Compilation

We use [pyinstaller](https://www.pyinstaller.org/) to compile analytics unit into binary file with all the dependencies.

Compiled module is supported by all *nix systems.

```bash
pip3 install pyinstaller
cd $HASTIC_SERVER_PATH/analytics
pyinstaller --additional-hooks-dir=pyinstaller_hooks bin/server
```

