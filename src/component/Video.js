//#region import
import {
  Dimensions,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
const {height, width} = Dimensions.get('window');
import Button from './Button';
import {RTCView} from 'react-native-webrtc';
//#endregion

//#region Video
export default Video = props => {
  // On call we will just display the local stream
  console.log('VideoVideo:--' + JSON.stringify(props));

  const ButtonContainer = props => {
    return (
      <View style={styles.bContainer}>
        <Button
          iconName="Cancel"
          backgroundColor="red"
          onPress={props.hangup}
          style={{marginRight: 30}}
        />
      </View>
    );
  };
  
  if (props.localStream && !props.remoteStream) {
    console.log('localStream:--' + JSON.stringify(props.localStream));

    //return;
    return (
      <View style={styles.container}>
        <RTCView
          streamURL={props.localStream.toURL()}
          objectFit="cover"
          style={styles.video}
        />
                <ButtonContainer hangup={props.hangup} />

      </View>
    );
  }

  // once the call is connected we will display
  // local stream on top of remote stream

  if (props.localStream && props.remoteStream) {
    return (
      <View style={styles.container}>
        <RTCView
          streamURL={props.remoteStream.toURL()}
          objectFit="cover"
          style={styles.video}
        />
        <RTCView
          streamURL={props.localStream.toURL()}
          objectFit="cover"
          style={styles.videoLocal}
        />

        <ButtonContainer hangup={props.hangup} />
      </View>
    );
  }



  return <ButtonContainer hangup={props.hangup} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  bContainer: {
    flexDirection: 'row',
    bottom: 30,
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoLocal: {
    position: 'absolute',
    width: 100,
    height: 150,
    top: 0,
    left: 20,
    elevation: 10,
  },
});
//#endregion
