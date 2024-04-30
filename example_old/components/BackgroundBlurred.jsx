import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Svg, Defs, Rect, Filter, FeGaussianBlur} from 'react-native-svg';
import {BlurView} from '@react-native-community/blur';

export default function BackgroundBlurred(props) {
  return (
    <View style={styles.container}>
      <Svg style={styles.absoluteFill}>
        <Defs>
          <Filter id="blurFilter">
            <FeGaussianBlur in="SourceGraphic" stdDeviation="10" />
          </Filter>
        </Defs>
        <Rect width="100%" height="100%" filter="url(#blurFilter)" />
      </Svg>
      <BlurView
        style={styles.absoluteFill}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      {/* Your content goes here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
