import sys
import os

if sys.version_info[0] == 2:
    print("python -m SimpleHTTPServer")
    os.system("python -m SimpleHTTPServer")
elif sys.version_info[0] == 3:
    print("python -m http.server")
    os.system("python -m http.server")
else:
    print("You need to install python 2 or python 3")