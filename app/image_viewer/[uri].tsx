import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Animated, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { PinchGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

const ImageViewer = () => {
  const { uri } = useLocalSearchParams();
  const [scale, setScale] = useState(new Animated.Value(1));
  console.log("Image URI: ", uri);


  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: true } 
  );

  
  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.closeButtonContainer}>
        <Pressable onPress={() => router.back()}>
          <AntDesign name="closecircle" size={20} color="#9ca3af" />
        </Pressable>
      </View>

      <View style={styles.imageWrapper}>
        {uri ? (
          <PinchGestureHandler
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
          >
            <Animated.View
              style={[
                styles.imageContainer,
                {
                  transform: [{ scale }],
                },
              ]}
            >
              <Image
                source={{ uri: uri.toString() }}
                style={styles.image}
              />
            </Animated.View>
          </PinchGestureHandler>
        ) : (
          <Text>No image found</Text>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 10,
    zIndex: 1,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', 
  },
});

export default ImageViewer;
