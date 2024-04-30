import {Text, View} from 'react-native';

export default function Progress({
  progress,
  trackColor = 'goldenrod',
  textColor = 'black',
}) {
  return (
    <View
      style={{
        backgroundColor: 'snow',
        borderColor: 'black',
        borderRadius: 10,
        minHeight: 30,
        width: '90%',
      }}>
      <View
        style={{
          backgroundColor: trackColor,
          borderRadius: 10,
          borderColor: 'black',
          borderWidth: progress > 0 ? 1 : 0,
          height: 30,
          width: progress ? `${progress}%` : '0%',
        }}
      />
      <Text
        style={{
          position: 'absolute',
          fontFamily: 'Nunito-Black',
          color: textColor,
          fontSize: 16,
          top: 2,
          left: 0,
          right: 0,
          bottom: 0,
          textAlign: 'center',
        }}>
        {progress >= 0 ? `${progress}%` : '0%'}
      </Text>
    </View>
  );
}
