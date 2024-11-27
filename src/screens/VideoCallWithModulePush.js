import React, {useState, useRef, useEffect} from 'react';
import {View, Button, StyleSheet, Text} from 'react-native';
import {mediaDevices, RTCView, MediaStream} from 'react-native-webrtc';
export default function VideoCallWithModulePush({navigation, route}) {
  const [stream, setStream] = useState(null); // Video and Audio stream
  const [isRecording, setIsRecording] = useState(false); // Push-to-talk status
  const [audioEnabled, setAudioEnabled] = useState(true); // To control audio

  const cameraRef = useRef(null); // To reference RTCView

  // Use WebRTC to capture video and audio
  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await mediaDevices.getUserMedia({
          video: true,
          audio: true, // Capture both video and audio
        });
        setStream(mediaStream);
      } catch (error) {
        console.error('Error getting media stream:', error);
      }
    };

    getMedia();

    return () => {
      if (stream) {
        // Stop all tracks when the component is unmounted
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle audio enable/disable (push-to-talk)
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        if (isRecording) {
          // Stop audio track (mute)
          audioTrack.enabled = false;
        } else {
          // Start audio track (unmute)
          audioTrack.enabled = true;
        }
        setIsRecording(!isRecording);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Display Video */}
      {stream && (
        <RTCView
          streamURL={stream.toURL()}
          style={styles.video}
          objectFit="cover"
          mirror={true}
        />
      )}

      <View style={styles.controls}>
        <Button
          title={isRecording ? 'Release to Stop Talking' : 'Press to Talk'}
          onPress={toggleAudio}
        />
        <Text style={styles.status}>
          {isRecording ? 'Talking' : 'Not Talking'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 400,
  },
  controls: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    marginTop: 10,
    fontSize: 18,
    color: 'gray',
  },
});
