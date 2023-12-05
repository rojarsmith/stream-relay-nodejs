# Stream Relay Nodejs

Push stream

```shell
./ffmpeg -i "rtsp://169.254.113.84:554/user=admin_password=tlJwpbo6_channel=1_stream=0&amp;onvif=0.sdp?real_st" -q 0 -f mpegts -codec:v mpeg1video -s 1920x1080 http://127.0.0.1:9091/
```

## Local RTSP

Use OBS RTSP Server.

## Mediamtx

Local MP4 push to RTSP server `Mediamtx`.

```shell
./node_modules/ffmpeg-static/ffmpeg.exe -re -stream_loop -1 -i src/accets/file_example_mp4_480_1_5mg.mp4 -rtsp_transport tcp -vcodec copy -f rtsp rtsp://127.0.0.1:8554/test
```

Mediamtx will auto generate the relay stream URL `rtsp://127.0.0.1:8554/test` that can play with `VLC`.
