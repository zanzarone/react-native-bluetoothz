import {Image, Modal, StyleSheet, Text, View} from 'react-native';

export default function Toast({state}) {
  return (
    <Modal transparent animationType="fade" visible={state !== undefined}>
      <View style={styles.modalAlert.parent}>
        <View style={styles.modalAlert.container}>
          {state !== undefined && (
            <View style={styles.modalAlert.iconContainer}>
              <Image
                resizeMode="contain"
                style={{height: 35, width: 35}}
                source={require('../assets/icon/error-100.png')}
              />
            </View>
          )}
          <View style={[styles.modalAlert.messageContainer, {flexShrink: 1}]}>
            {state !== undefined && (
              <Text
                style={{
                  color: 'black',
                  fontFamily: 'Nunito-Bold',
                }}>
                {state?.text}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalAlert: {
    parent: {
      position: 'absolute',
      zIndex: 2000,
      top: '8%',
      width: '100%',
      paddingHorizontal: '5%',
      paddingBottom: 35,
    },
    container: {
      backgroundColor: '#FCC419',
      flexDirection: 'row',
      height: '100%',
      borderRadius: 15,
      paddingVertical: 15,
      paddingHorizontal: 5,
      gap: 5,
    },
    iconContainer: {
      backgroundColor: 'transparent',
      justifyContent: 'center',
    },
    messageContainer: {
      backgroundColor: 'transparent',
      justifyContent: 'center',
    },
  },
});

if (Platform.OS === 'ios') {
  styles.continueButton = {
    ...styles.continueButton,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  };
  styles.modalAlert.container = {
    ...styles.modalAlert.container,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  };
} else if (Platform.OS === 'android') {
  styles.continueButton = {
    ...styles.continueButton,
    elevation: 4,
    shadowColor: '#000000',
  };
  styles.modalAlert.container = {
    ...styles.modalAlert.container,
    elevation: 4,
    shadowColor: '#000000',
  };
}
