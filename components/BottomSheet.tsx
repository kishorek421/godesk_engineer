import React, { useRef, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

interface BottomSheetProps {
  children: any;
  initialHeight: number;
}

const BottomSheet = forwardRef(
  ({ children, initialHeight = 300 }: BottomSheetProps, ref) => {
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const maxHeight = useRef(initialHeight).current;
    const [visible, setVisible] = React.useState(false);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => false, // Prevent from setting it on touch start
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy !== 0, // Only respond to vertical movements
        onPanResponderMove: (event, gestureState) => {
          const newHeight = maxHeight - gestureState.dy;
          if (newHeight < screenHeight && newHeight > 0) {
            animatedHeight.setValue(newHeight);
          }
        },
        onPanResponderRelease: (event, gestureState) => {
          if (gestureState.dy > 0) {
            hide();
          } else {
            show();
          }
        },
      }),
    ).current;

    useImperativeHandle(ref, () => ({
      show: () => {
        setVisible(true);
        Animated.timing(animatedHeight, {
          toValue: maxHeight,
          duration: 300,
          useNativeDriver: false,
        }).start();
      },
      hide: () => {
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start(() => setVisible(false));
      },
    }));

    const show = () => {
      Animated.timing(animatedHeight, {
        toValue: maxHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const hide = () => {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setVisible(false));
    };

    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={hide}
      >
        <TouchableWithoutFeedback onPress={hide}>
          <View style={styles.overlay}>
            <Animated.View
              pointerEvents="box-none"
              {...panResponder.panHandlers}
              style={[
                styles.bottomSheet,
                { height: animatedHeight, maxHeight: screenHeight },
              ]}
            >
              <View style={styles.handle} />
              {children}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  },
);

BottomSheet.displayName = "BottomSheet";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    color: "red",
  },
  handle: {
    width: 60,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 10,
  },
});

export default BottomSheet;
