import {Image, Platform, TouchableOpacity} from 'react-native';

export default function RoundButton({
  onPress,
  icon,
  iconSize,
  buttonSize = undefined,
  style,
  disabled = false,
}) {
  let shadow;
  if (Platform.OS === 'ios') {
    shadow = {
      shadowColor: '#171717',
      shadowOffset: {width: -2, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 3,
    };
  } else if (Platform.OS === 'android') {
    shadow = {
      elevation: 4,
      shadowColor: '#000000',
    };
  }
  return (
    <TouchableOpacity
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
        {...shadow},
      ]}
      onPress={() => onPress()}>
      <Image
        style={{
          height: iconSize.height,
          width: iconSize.width,
        }}
        resizeMode="contain"
        source={icon}
      />
    </TouchableOpacity>
  );
}
