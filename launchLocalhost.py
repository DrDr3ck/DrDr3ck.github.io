import sys
import os

if sys.version_info[0] < 3:
    print("python -m SimpleHTTPServer")
    os.system("python -m SimpleHTTPServer")
else:
    print("python -m http.server")
    os.system("python -m http.server")