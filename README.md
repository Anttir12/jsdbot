# jsdbot

jsdbot is a Discord bot that can play sounds from dbot and music/whatever from youtube. It can also listen to voice and send that information to dbot for
further analysis. This bot can be controlled using the dbot, which is a web interface where users can save sound clips for later use. 

## Features
Play sounds stored in dbot
Play sounds/music directly from YouTube
Listen to voice input (sent to dbot via websocket)
## Known Bugs
Voice listening does not properly work due to a change in codecs. This should be fixable.

# NOTE:
This is basically useless without dbot. Basically every feature uses dbot under the hood (This bot used to be included inside dbot project and created using discord.py)
