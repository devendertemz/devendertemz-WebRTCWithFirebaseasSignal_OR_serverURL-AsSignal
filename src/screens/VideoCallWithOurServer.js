import React, {useEffect, useState, useRef} from 'react';
import {View, Button, StyleSheet, FlatList, Text} from 'react-native';
import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import {HubConnectionBuilder} from '@microsoft/signalr';
import 'react-native-url-polyfill/auto';

import Utils from '../utils/Utils';

// const configuration = {
//   iceServers: [
//     {
//       url: 'turn:numb.viagenie.ca',
//       credential: 'muazkh',
//       username: 'webrtc@live.com',
//     },
//   ],
// };

const configuration = {
  iceServers: [
    {
      url: 'stun:stun.l.google.com:19302',
    },
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
    {urls: 'stun:stun3.l.google.com:19302'},
    {urls: 'stun:stun4.l.google.com:19302'},
  ],
};

export default function VideoCallWithOurServer({navigation, route}) {
  const {userName} = route.params;

  // const SIGNALING_SERVER_URL =
  //   'https://7625-103-168-4-82.ngrok-free.app/signalingHub';

  const SIGNALING_SERVER_URL =
    'https://me-after-dotnet-api-742556745677.us-central1.run.app/signalingHub?userName=' +
    userName;

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);
  const connection = useRef(null);
  const [arrUserOnline, setarrUserOnline] = useState([]);
  const receiverConnectionId = useRef(null);
  const callerConnectionId = useRef(null);
  const connectedID = useRef(null);
  const connecting = useRef(false);

  useEffect(() => {
    const setupConnection = async () => {
      try {
        console.log('SIGNALING_SERVER_URL:- ' + SIGNALING_SERVER_URL);
        // Initialize SignalR connection
        connection.current = new HubConnectionBuilder()
          .withUrl(SIGNALING_SERVER_URL)
          .build();

        // Start the connection
        await connection.current.start();
        console.log('Connected to signaling server');
        connecting.current = true;

        // Listen for incoming signals

        connection.current.on('OnConnected', OnConnected => {
          console.log('---------OnConnected ---------:', OnConnected);
          connectedID.current = OnConnected;
        });
        connection.current.on('UserDisconnected', (UserName, userId) => {
          console.log('UserDisconnected--------------UserName>>' + UserName);
          console.log('UserDisconnected--------------userId>>' + userId);

          if (userId == receiverConnectionId.current) {
            console.log('Id Match-------------->>');
            hangup();
          }
        });

        connection.current.on(
          'ReceiveOffer',
          async (ReceiveOffer, connectionID) => {
            callerConnectionId.current = connectionID;
            console.log(
              'ReceiveOffer:---ReceiveOffer id' + JSON.stringify(ReceiveOffer),
            );
            await handleOffer(JSON.parse(ReceiveOffer));
          },
        );

        connection.current.on('ReceiveAnswer', async ReceiveAnswer => {
          console.log('---------ReceiveAnswer ---------:');
          console.log(
            'ReceiveAnswer:---ReceiveAnswer ' + JSON.stringify(ReceiveAnswer),
          );

          // console.log('ReceiveAnswer :', ReceiveAnswer);
          await handleAnswer(JSON.parse(ReceiveAnswer));
        });

        connection.current.on(
          'ReceiveIceCandidate',
          async ReceiveIceCandidate => {
            console.log(
              'ReceiveIceCandidate :' + JSON.stringify(ReceiveIceCandidate),
            );

            //console.log('ReceiveIceCandidate :', ReceiveIceCandidate);
            await handleCandidate(JSON.parse(ReceiveIceCandidate));
          },
        );

        // Handle connection close
        connection.current.onclose(error => {
          console.error(
            'SignalR connection closed:',
            error?.message || error || 'No error provided',
          );
          connecting.current = false;

          // Optional: Attempt to reconnect after a delay
          setTimeout(() => setupConnection(), 5000);
        });
      } catch (connectionError) {
        console.log('connectionError:--' + connectionError);

        console.error(
          'Error initializing SignalR connection:',
          connectionError.message || connectionError,
        );
        // Optionally retry the connection
        setTimeout(() => setupConnection(), 5000);
      }
    };

    // Start the connection setup
    setupConnection();

    // Cleanup
    return () => {
      if (connection.current) {
        connection.current
          .stop()
          .then(() => console.log('SignalR connection stopped'))
          .catch(stopError =>
            console.error(
              'Error stopping SignalR connection:',
              stopError.message || stopError,
            ),
          );
      }
    };
  }, []);

  const refreshUserList = async () => {
    try {
      const response = await connection.current.invoke(
        'GetConnections',
        userName,
      );
      setarrUserOnline(JSON.parse(response));
      // console.log('Response:---------', response.length);
      return response;
    } catch (error) {
      console.error('Error invoking GetConnections:', error);
    }
  };

  const hangup = async () => {
    connecting.current = false;
    streamCleanUp();
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    navigation.goBack();
  };

  const streamCleanUp = async () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream.release();
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  const sendIceCandidate = async receiverConnectionId => {
    //On new ICE candiate send as signalserver
    if (peerConnection.current) {
      peerConnection.current.onicecandidate = event => {
        if (event.candidate) {
          sendSignal('SendIceCandidate', event.candidate, receiverConnectionId);
        }
      };
    }
  };

  const setupWebrtc = async () => {
    peerConnection.current = new RTCPeerConnection(configuration);
    const stream = await Utils.getStream();
    console.log('setupWebrtc ' + JSON.stringify(stream));

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

  // Initialize WebRTC and get local media

  const hangupClick = async () => {
    // console.log('hanguphanguphangup:--------' + connectedID.current);

    await connection.current.invoke('DisconnectClient', connectedID.current);
    hangup();
  };
  const startCall = async () => {
    await setupWebrtc();
  };

  // Handle WebRTC Offer
  const createOffer = async () => {
    sendIceCandidate(receiverConnectionId.current);

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    sendSignal('SendOffer', offer, receiverConnectionId.current);
  };

  const handleOffer = async offer => {
    
    await setupWebrtc();
    //Exchange the ICE candiidates
    // check the parameters,Its reversed,since the joining part of callee

    sendIceCandidate(callerConnectionId.current);

    //Set remote description and create an answer

    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
    } catch (error) {
      console.error('Error setting remote description:', error);
      return; // Exit if setRemoteDescription fails
    }

    // Create an answer to the offer
    const answer = await peerConnection.current.createAnswer();

    // Set the local description (answer)
    peerConnection.current.setLocalDescription(answer);
    //console.log('SendAnswer OBJ' + JSON.stringify(answer));

    // Send the answer via signaling server
    sendSignal('SendAnswer', answer, callerConnectionId.current);
  };

  const handleAnswer = async answer => {
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  };

  const handleCandidate = async candidate => {
    await peerConnection.current.addIceCandidate(
      new RTCIceCandidate(candidate),
    );
  };

  const sendSignal = async (actionType, payload, connectionId) => {
    console.log('payload:-' + JSON.stringify(payload));
    console.log('type:- ' + JSON.stringify(actionType));

    console.log('connectionId --' + JSON.stringify(connectionId));
    try {
      if (connecting.current) {
        await connection.current.invoke(
          actionType,
          JSON.stringify(payload),
          connectionId,
        );
        console.log(`---------Signal sent:--------- ${actionType}`);
      } else {
        console.error('Not connected to the signaling server.');
      }
    } catch (error) {
      console.error('Error sending signal:', error.message || error);
      // Optional: You can add retry logic or notify the user of the issue
    }
  };

  const handleSendOffer = item => {
    receiverConnectionId.current = item.Value;

    createOffer();
    //alert(`Offer sent to user with ID: ${item.Value}`);
  };
  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item?.Key}</Text>
        <Text style={styles.id}>ID: {item?.Value}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Send Offer" onPress={() => handleSendOffer(item)} />
      </View>
    </View>
  );

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
      <View style={styles.streamContainer}>
        <FlatList
          data={arrUserOnline}
          renderItem={renderItem}
          keyExtractor={item => item.Value}
          contentContainerStyle={styles.listContainer}
        />
      </View>
      <Button title="Refresh User Online List" onPress={refreshUserList} />
      <Button title="Start Call" onPress={startCall} />
      <Button title="hangup" onPress={hangupClick} />
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

  listContainer: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  id: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginLeft: 10,
  },
});
