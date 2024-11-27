/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

//#region import
import React from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
//localfiles
import Videocall from './src/screens/Videocall';
import VideoCallWithOurServer from './src/screens/VideoCallWithOurServer';
import DemoWebRtcWithName from './src/screens/DemoWebRtcWithName';
import VideoCallWithModule from './src/screens/VideoCallWithModule';
import VideoCallWithModulePush from './src/screens/VideoCallWithModulePush';
//#endregion

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="DemoWebRtcWithName"
          component={DemoWebRtcWithName}
        />

        <Stack.Screen
          name="VideoCallWithModulePush"
          component={VideoCallWithModulePush}
        />

        <Stack.Screen
          name="VideoCallWithModule"
          component={VideoCallWithModule}
        />
        <Stack.Screen
          name="VideoCallWithOurServer"
          component={VideoCallWithOurServer}
        />

        <Stack.Screen name="Videocall" component={Videocall} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
