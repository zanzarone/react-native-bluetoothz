import {StyleSheet, View} from 'react-native';

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
    top: 0,
    left: '25%',
    zIndex: -1,
    width: '130%',
    height: '70%',
    borderRadius: 240,
    transform: [{scaleX: 2}],
  },
});
