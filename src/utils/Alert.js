import React from 'react';
import {Alert, Text} from 'react-native';

export const showMsgAlert = (msg, title = 'Message') => {
  Alert.alert(title, msg + '', [{text: 'OK'}]);
};
