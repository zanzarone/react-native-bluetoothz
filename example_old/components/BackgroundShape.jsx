import {Platform, StyleSheet, View} from 'react-native';

export default function BackgroundShape({bleStatus}) {
  return (
    <View
      style={[
        styles.oval,
        {backgroundColor: bleStatus === true ? '#D4F174' : 'coral'},
      ]}
    />
  );
}

const styles = StyleSheet.create({
  oval: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 0 : -40,
    left: '20%',
    zIndex: -1,
    width: '130%',
    height: '70%',
    borderRadius: 240,
    transform: [{scaleX: 2}],
  },
});
