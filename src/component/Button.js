//#region import
import {
  Dimensions,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {height, width} = Dimensions.get('window');
//#endregion

//#region Main

export default Button = props => {
  return (
    <View>
      <TouchableOpacity
        onPress={props.onPress}
        style={[
          {backgroundColor: props.backgroundColor},
          props.style,
          styles.button,
        ]}>
        <Text style={{color: 'white'}}>{props.iconName}</Text>
      </TouchableOpacity>
    </View>
  );
};
//#endregion

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 100,
    padding: 10,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
});
