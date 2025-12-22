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
  onClose?: () => void;
}

const BottomSheet = forwardRef(
  ({ children, initialHeight = 300, onClose }: BottomSheetProps, ref) => {
    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const maxHeight = useRef(initialHeight).current;
    const [visible, setVisible] = React.useState(false);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 5,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 50) {
            hide();
          } else {
            show();
          }
        },
      })
    ).current;

    useImperativeHandle(ref, () => ({
      show: () => {
        setVisible(true);
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      },
      hide: () => {
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          onClose?.();
        });
      },
    }));

    const show = () => {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    };

    const hide = () => {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onClose?.();
      });
    };

    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="none"
        onRequestClose={hide}
      >
        <TouchableWithoutFeedback onPress={hide}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.bottomSheet,
                  {
                    transform: [{ translateY: translateY }],
                  },
                ]}
              >
                <View style={styles.handle} />
                {children}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
);

BottomSheet.displayName = "BottomSheet";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    paddingBottom: 20,
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
