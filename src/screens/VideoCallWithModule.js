import React, {useState, useEffect, useRef} from 'react';
import {View, Button, StyleSheet, Text} from 'react-native';
import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import {HubConnectionBuilder} from '@microsoft/signalr';
import 'react-native-url-polyfill/auto'; // Polyfill for WebRTC in React Native
import Utils from '../utils/Utils';

// WebRTC Configuration (STUN servers)
const configuration = {
  iceServers: [
    {url: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
    {urls: 'stun:stun3.l.google.com:19302'},
    {urls: 'stun:stun4.l.google.com:19302'},
  ],
};

export default function VideoCallWithModule({navigation, route}) {
  const {userName} = route.params;
  const SIGNALING_SERVER_URL = `https://e906-103-168-4-82.ngrok-free.app/signalingHub?userName=${userName}`;

  // const SIGNALING_SERVER_URL =
  //   'https://me-after-dotnet-api-742556745677.us-central1.run.app/signalingHub?userName=' +
  //   userName;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const peerConnection = useRef(null);
  const connection = useRef(null);
  const connectedID = useRef(null);
  const connecting = useRef(false);

  // Setup signaling server connection
  useEffect(() => {
    const setupConnection = async () => {
      try {
        setConnectionStatus('Connecting...');
        connection.current = new HubConnectionBuilder()
          .withUrl(SIGNALING_SERVER_URL)
          .build();
        await connection.current.start();
        setConnectionStatus('Connected to signaling server');
        connecting.current = true;

        connection.current.on('OnConnected', OnConnected => {
          connectedID.current = OnConnected;
          setConnectionStatus('Connected to client');
        });

        connection.current.on('ReceiveAnswer', async answer => {
          console.log('ReceiveAnswer------------->>' + JSON.stringify(answer));
          await handleAnswer(answer);
          setConnectionStatus('Answer received');
        });

        connection.current.on('ReceiveIceCandidate', async candidate => {
          console.log(
            'ReceiveIceCandidate------------->>' + JSON.stringify(candidate),
          );

          await handleCandidate(candidate);
          setConnectionStatus('ICE Candidate received');
        });

        connection.current.onclose(error => {
          console.error('SignalR connection closed:', error);
          setConnectionStatus('Connection closed');
          connecting.current = false;
          setTimeout(() => setupConnection(), 5000); // Attempt to reconnect
        });
      } catch (connectionError) {
        console.error(
          'Error initializing SignalR connection:',
          connectionError,
        );
        setConnectionStatus('Failed to connect');
        setTimeout(() => setupConnection(), 5000); // Retry after delay
      }
    };

    setupConnection();

    return () => {
      if (connection.current) {
        connection.current
          .stop()
          .then(() => {
            console.log('SignalR connection stopped');
          })
          .catch(stopError => {
            console.error('Error stopping SignalR connection:', stopError);
          });
      }
    };
  }, []);

  // Listen to peer connection state changes
  useEffect(() => {
    if (peerConnection.current) {
      // console.log(
      //   'peerConnection.current :',
      //   JSON.stringify(peerConnection.current),
      // );

      peerConnection.current.oniceconnectionstatechange = () => {
        console.log(
          'ICE Connection oniceconnectionstatechange :',
          JSON.stringify(peerConnection.current),
        );

        const iceConnectionState = peerConnection.current.iceConnectionState;
        console.log('ICE Connection State:', iceConnectionState);

        // Update connection status based on iceConnectionState
        switch (iceConnectionState) {
          case 'new':
            setConnectionStatus('Connection initializing...');
            break;
          case 'checking':
            setConnectionStatus('Checking connection...');
            break;
          case 'connected':
            setConnectionStatus('Connected');
            break;
          case 'completed':
            setConnectionStatus('Connection completed');
            break;
          case 'disconnected':
            setConnectionStatus('Connection disconnected');
            break;
          case 'failed':
            setConnectionStatus('Connection failed');
            break;
          case 'closed':
            setConnectionStatus('Connection closed');
            break;
          default:
            setConnectionStatus('Unknown state');
            break;
        }
      };
    }
  }, [peerConnection.current]);

  // Hangup function to clean up the connection and stop the stream
  const hangup = async () => {
    connecting.current = false;
    streamCleanUp();
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    navigation.goBack();
  };

  // Cleanup the media stream
  const streamCleanUp = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream.release();
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  // Send ICE candidates to the signaling server
  const sendIceCandidate = async receiverConnectionId => {
    if (peerConnection.current) {
      peerConnection.current.onicecandidate = event => {
        if (event.candidate) {
          sendSignal('SendIceCandidate', event.candidate, receiverConnectionId);
        }
      };
    }
  };

  // Setup the WebRTC peer connection
  const setupWebrtc = async () => {
    peerConnection.current = new RTCPeerConnection(configuration);
    const stream = await Utils.getStream();
    if (stream) {
      setLocalStream(stream);
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });
    }

    peerConnection.current.ontrack = event => {
      setRemoteStream(event.streams[0]);
    };
  };

  // Function to start the call
  const startCall = async () => {
    await setupWebrtc();
    createOffer();
    setConnectionStatus('Calling...');
  };

  // Create and send an offer to the peer
  const createOffer = async () => {
    sendIceCandidate(connectedID.current);
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    sendSignal('SendOffer', offer, connectedID.current);
    setConnectionStatus('Offer sent');
  };

  // Handle the answer from the remote peer
  const handleAnswer = async answer => {
    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      console.log('Remote description set successfully');
    } catch (error) {
      console.error('Failed to set remote description:', error);
    }

    console.log('Answer set------------->>');

    setConnectionStatus('Answer set');
  };

  // Handle ICE candidate from the remote peer
  const handleCandidate = async candidate => {
    await peerConnection.current.addIceCandidate(
      new RTCIceCandidate(candidate),
    );
    setConnectionStatus('ICE Candidate added');
  };

  // Send signaling data (offer, answer, ICE candidates)
  const sendSignal = async (actionType, payload, connectionId) => {
    console.log('payload:-------->>' + JSON.stringify(payload));
    console.log('type-------->> ' + JSON.stringify(actionType));

    console.log('connectionId -------->>' + JSON.stringify(connectionId));
    try {
      if (connecting.current) {
        await connection.current.invoke(
          actionType,
          JSON.stringify(payload),
          connectionId,
        );
        console.log(`---------Signal sent:------------->> ${actionType}`);
      } else {
        setConnectionStatus('Not connected to signaling server');
      }
    } catch (error) {
      console.error('Error sending signal:', error);
      setConnectionStatus('Error sending signal');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.streamContainer}>
        {localStream && (
          <RTCView streamURL={localStream.toURL()} style={styles.localStream} />
        )}
        {remoteStream && (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteStream}
          />
        )}
      </View>

      <Text style={styles.status}>{connectionStatus}</Text>

      <View style={{gap: 10}}>
        <Button title="Start Call" onPress={startCall} />
        <Button title="Hangup" onPress={hangup} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  streamContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  localStream: {
    width: 150,
    height: 200,
    backgroundColor: 'gray',
  },
  remoteStream: {
    width: 150,
    height: 200,
    backgroundColor: 'gray',
  },
  status: {
    color: 'white',
    marginVertical: 10,
    fontSize: 16,
  },
});
