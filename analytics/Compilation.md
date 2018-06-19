# Compilation

We use (pyinstaller)[https://www.pyinstaller.org/] to compile analytics unit into binary file supported by *nix systems with all the dependencies.

```bash
pip install pyinstaller
echo "hiddenimports=['pandas._libs.tslibs.timedeltas', 'scipy._lib.messagestream']" | cat > $PYTHON_SITE_PACKAGES/PyInstaller/hooks/hook-pandas.py
cd $HASTIC_SERVER_PATH/analytics
pyinstaller worker.py
```

On Ubuntu 16.04 $PYTHON_SITE_PACKAGES directory located at `~/.local/lib/python3.5/site-packages`
