import {Image, Platform, StyleSheet} from 'react-native';
import TouchableDebounce from './TouchableDebounce';

export default function RoundButton({
  onPress,
  icon,
  iconSize,
  buttonSize = undefined,
  style,
  disabled = false,
}) {
  return (
    <TouchableDebounce
      debounceTime={100}
      disabled={disabled}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: 'black',
          width: buttonSize?.width ? buttonSize?.width : 60,
          height: buttonSize?.height ? buttonSize?.height : 60,
          borderRadius: buttonSize?.radius ? buttonSize?.radius : 30,
        },
        {...style},
        {...styles.shadow},
      ]}
      onPress={onPress}>
      <Image
        style={{
          height: iconSize.height,
          width: iconSize.width,
        }}
        resizeMode="contain"
        source={icon}
      />
    </TouchableDebounce>
  );
}

const styles = StyleSheet.create({
  shadow:
    Platform.OS === 'ios'
      ? {
          shadowColor: '#171717',
          shadowOffset: {width: -2, height: 4},
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }
      : {
          elevation: 4,
          shadowColor: '#000000',
        },
});
