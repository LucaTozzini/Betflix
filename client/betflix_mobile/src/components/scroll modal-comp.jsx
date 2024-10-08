import {useState, useEffect, useRef} from 'react';
import {
  Modal,
  Text,
  View,
  PanResponder,
  Dimensions,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const screenHeight = Dimensions.get('window').height;

export default function ScrollModal({header, children, visible, setVisible}) {
  const height = useRef(new Animated.Value(screenHeight / 2)).current;

  useEffect(() => {
    if (visible) {
      height.setValue(screenHeight / 2);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = screenHeight - gestureState.moveY + 35;
        height.setValue(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (height._value > screenHeight * 0.75) {
          Animated.spring(height, {
            toValue: screenHeight,
            useNativeDriver: false,
          }).start();
        } else if (height._value < screenHeight * 0.4) {
          setVisible(false);
        } else {
          Animated.spring(height, {
            toValue: screenHeight / 2,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        setVisible(false);
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={event => {
          if (event.target === event.currentTarget) {
            setVisible(false);
          }
        }}
        style={styles.container}>
        <Animated.View style={[styles.modal, {height}]}>
          <View style={styles.draggableHeader} {...panResponder.panHandlers}>
            <View style={styles.draggableIcon} />
            <Text style={styles.draggableText}>{header}</Text>
          </View>
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modal: {
    backgroundColor: 'rgb(20,20,20)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  draggableHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  draggableIcon: {
    height: 5,
    width: 70,
    borderRadius: 10,
    backgroundColor: 'grey',
  },
  draggableText: {color: 'white', fontSize: 18},
  openButton: {
    backgroundColor: 'white',
    fontSize: 30,
  },
});
