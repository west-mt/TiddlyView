#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import urllib2
import simplejson as json
import tempfile
import zipfile


if os.path.exists('.git'):
    print 'This directory is git repository!'
    print 'Try to use "git pull".'
    sys.exit(3)

info_fname = 'update_info.json'

url = json.load(open(info_fname))

#print url
if not isinstance(url, list):
    print "Cannot get update information."
    sys.exit(1)

tempf = tempfile.NamedTemporaryFile(delete=True)
#print tempf.name

try:
    response = urllib2.urlopen(url[0])
    data = response.read()
except URLError, e:
    print "Download error occurred:"
    print "    " + e.reason
    sys.exit(2)

tempf.write(data)
tempf.seek(0)
zipf = zipfile.ZipFile(tempf)

top_dir_len = -1

for info in zipf.infolist():
    if top_dir_len < 0:
        top_dir_len = len(info.filename)
    else:
        fname = info.filename[top_dir_len:]
        if fname[-1] == '/':
            if not os.path.exists(fname):
                os.mkdir(fname)
                print 'Create: ' + fname
        else:
            print fname + ":", info.file_size
    
zipf.close()
tempf.close()
