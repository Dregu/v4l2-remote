#!/bin/bash
# Example gstreamer command to use with Raspberry Pi camera module and Janus streaming plugin
modprobe bcm2835-v4l2
v4l2-ctl -v width=1280,height=720,pixelformat=H264
v4l2-ctl -p 25
v4l2-ctl -c video_bitrate=800000,h264_profile=0,h264_level=11,white_balance_auto_preset=0,red_balance=1000,blue_balance=1000,vertical_flip=0,horizontal_flip=0,auto_exposure=0
gst-launch-1.0 v4l2src ! video/x-h264,width=1280,height=720,framerate=25/1,profile=baseline,stream-format=byte-stream ! h264parse ! rtph264pay pt=126 config-interval=2 ! udpsink host=localhost port=8000 sync=false
