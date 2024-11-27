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
//#endregion

//#region GetingCall
export default GetingCall = props => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuTK8bXjobRPRzoTUs45uxrNNnh5Dt_nOrlg&s',
        }} // URL to your image
        style={styles.image}
      />
      <View style={styles.bContainer}>
        <Button
          iconName="Answer"
          backgroundColor="green"
          onPress={props.join}
          style={{marginRight: 30}}
        />

        <Button
          iconName="Cancel"
          backgroundColor="red"
          onPress={props.hangup}
          style={{marginRight: 30}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bContainer: {
    flexDirection: 'row',
    bottom: 30,
  },
});
//#endregion
