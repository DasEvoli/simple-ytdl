import os
import glob

files = glob.glob("./output/*")
for f in files:
    os.remove(f)