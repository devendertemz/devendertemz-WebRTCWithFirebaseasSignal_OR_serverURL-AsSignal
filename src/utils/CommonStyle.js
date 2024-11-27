import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
const {height, width} = Dimensions.get('window');
import {
  scaleXiPhone15,
  appFonts,
  appColors,
  checkForTablet,
} from './AppConstants';

const stylesCommon = StyleSheet.create({
  elvation: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: scaleXiPhone15.twoH},
    shadowOpacity: scaleXiPhone15.oneH,
    shadowRadius: scaleXiPhone15.twoH,
    elevation: scaleXiPhone15.twoH,
  },
  titleWelcome: {
    fontSize: scaleXiPhone15.twentyH,
    fontFamily: appFonts.bold,
    color: appColors.white,
    textAlign: 'center',
  },
});

export {stylesCommon};
