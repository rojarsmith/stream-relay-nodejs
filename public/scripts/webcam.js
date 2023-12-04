navigator.getUserMedia(
    { video: true, audio: true },
    stream => {
        const localVideo = document.getElementById("local-video");
        if (localVideo) {
            localVideo.srcObject = stream;

            let videoTrack = stream.getVideoTracks();
            console.log(`Video Device => ${videoTrack[0].label}`);

            let audioTrack = stream.getAudioTracks();
            console.log(`Audio Devide => ${audioTrack[0].label}`);
        }
    },
    error => {
        console.warn(error.message);
    }
);