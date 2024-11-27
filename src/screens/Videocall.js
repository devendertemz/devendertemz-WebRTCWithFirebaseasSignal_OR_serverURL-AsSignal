import {Dimensions, Text, SafeAreaView, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
const {height, width} = Dimensions.get('window');
import Button from '../component/Button';
import GetingCall from '../component/GetingCall';
import Video from '../component/Video';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';
import Utils from '../utils/Utils';
import firestore from '@react-native-firebase/firestore';

const configuration = {
  iceServers: [
    {
      url: 'stun:stun.l.google.com:19302',
    },
  ],
};

export default function Videocall({navigation, route}) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [gettingCall, setGettingCall] = useState(false);
  const pc = useRef(null);
  const connecting = useRef(false);

  useEffect(() => {
    const cRef = firestore().collection('meet').doc('chatId');

    const subscribe = cRef.onSnapshot(snapshot => {
      const data = snapshot.data();
      if (pc.current && !pc.current.remoteDescription && data && data.answer) {
        pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
      if (data && data.offer && !connecting.current) {
        setGettingCall(true);
      }
    });

    const subscribeDelete = cRef.collection('callee').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'removed') {
          hangup();
        }
      });
    });

    return () => {
      subscribe();
      subscribeDelete();
    };
  }, []);

  const setupWebrtc = async () => {
    pc.current = new RTCPeerConnection(configuration);
    const stream = await Utils.getStream();
    console.log('setupWebrtc ' + JSON.stringify(stream));

    if (stream) {
      setLocalStream(stream);
      stream.getTracks().forEach(track => {
        pc.current.addTrack(track, stream);
      });


    }

    pc.current.ontrack = event => {
      setRemoteStream(event.streams[0]);
    };
  };

  const create = async () => {
    console.log('Calling...');
    connecting.current = true;

    await setupWebrtc();
    const cRef = firestore().collection('meet').doc('chatId');
    collectIceCandidates(cRef, 'caller', 'callee');

    if (pc.current) {
      //create the offer for the call
      //store the offer under the document
      const offer = await pc.current.createOffer();
      pc.current.setLocalDescription(offer);

      const cWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      };

      console.log('cWithOffer:- ' + JSON.stringify(cWithOffer));

      cRef.set(cWithOffer);
    }
  };

  const join = async () => {
    console.log('Joining the call...');
    connecting.current = true;
    setGettingCall(false);
    const cRef = firestore().collection('meet').doc('chatId');
    const offer = (await cRef.get()).data()?.offer;

    if (offer) {
      //setup webrtc
      await setupWebrtc();
      //Exchange the ICE candiidates
      // check the parameters,Its reversed,since the joining part of callee

      collectIceCandidates(cRef, 'callee', 'caller');

      if (pc.current) {
        pc.current.setRemoteDescription(new RTCSessionDescription(offer));
        //create the answer for the call
        //udpate documents with answer
        const answer = await pc.current.createAnswer();
        pc.current.setLocalDescription(answer);
        const cWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        };
        cRef.update(cWithAnswer);
      }
    }
  };

  /** 
   * for disconnecting thee call close the connection , release the stream
   * And delete the document for the call
   */
  
  const hangup = async () => {
    setGettingCall(false);
    connecting.current = false;
    streamCleanUp();
    firestoreCleanUp();
    if (pc.current) {
      pc.current.close();
    }
  };

  const streamCleanUp = async () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream.release();
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  const firestoreCleanUp = async () => {
    const cRef = firestore().collection('meet').doc('chatId');
    if (cRef) {
      const calleeCandidate = await cRef.collection('callee').get();
      calleeCandidate.forEach(async candidate => {
        await candidate.ref.delete();
      });

      const callerCandidate = await cRef.collection('caller').get();
      callerCandidate.forEach(async candidate => {
        await candidate.ref.delete();
      });
      cRef.delete();
    }
  };

  const collectIceCandidates = async (cRef, localName, remoteName) => {
    //On new ICE candiate add it to firestore
    const candidateCollection = cRef.collection(localName);
    if (pc.current) {
      pc.current.onicecandidate = event => {
        if (event.candidate) {
          candidateCollection.add(event.candidate);
        }
      };
    }

    //Get the ICE candidate added to firestore and update local pc

    cRef.collection(remoteName).onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type == 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current?.addIceCandidate(candidate);
        }
      });
    });
  };

  if (gettingCall) {
    return <GetingCall hangup={hangup} join={join} />;
  }

  if (localStream) {
    return (
      <Video
        hangup={hangup}
        localStream={localStream}
        remoteStream={remoteStream}
      />
    );
  }

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button iconName="start" backgroundColor="gray" onPress={create} />
    </View>
  );
}
