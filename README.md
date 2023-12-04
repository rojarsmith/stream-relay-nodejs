# Stream Relay Nodejs

Push stream

```shell
./ffmpeg -i "rtsp://169.254.113.84:554/user=admin_password=tlJwpbo6_channel=1_stream=0&amp;onvif=0.sdp?real_st" -q 0 -f mpegts -codec:v mpeg1video -s 1920x1080 http://127.0.0.1:9091/
```

## Local RTSP

Use OBS RTSP Server.
