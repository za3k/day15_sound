#!/bin/python3
import flask, flask_login
from flask import url_for, request, render_template, redirect
from flask_login import current_user
import collections, json, random
from datetime import datetime
from base import app,load_info,ajax,DBDict,DBList,random_id,hash_id,full_url_for

# -- Info for every Hack-A-Day project --
load_info({
    "project_name": "Hack-A-Sound",
    "source_url": "https://github.com/za3k/day15_sound",
    "subdir": "/hackaday/sound",
    "description": "sound toy",
    "instructions": "Click a button or press a keyboard key to play a sample/track. Hold shift to record both samples and tracks. Control-click samples to replace them with a new random noise.",
    "login": False,
})

# -- Routes specific to this Hack-A-Day project --

@app.route("/")
def index():
    return flask.render_template('index.html')
