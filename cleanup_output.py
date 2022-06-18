import os
import glob
import time


while True:  
    time.sleep(300)
    files = glob.glob("./output/*")
    for f in files:
        os.remove(f)