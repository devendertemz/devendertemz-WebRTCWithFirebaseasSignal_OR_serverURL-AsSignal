import React, {useState} from 'react';
import {View, TextInput, Button, Alert, StyleSheet} from 'react-native';

export default function DemoWebRtcWithName({navigation, route}) {
  const [text, setText] = useState('');

  const handlePress = () => {
    if (text.length > 2) {
      navigation.navigate('VideoCallWithModule', {
        userName: text.trim(),
      });
      // navigation.navigate('VideoCallWithOurServer', {
      //   userName: text.trim(),
      // });
    } else {
      Alert.alert('Enter name');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter UserName"
        value={text}
        onChangeText={setText}
      />
      <Button title="Submit" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});
