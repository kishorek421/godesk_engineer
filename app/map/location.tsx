// import React, { useEffect, useState, useRef } from 'react';
// import { StyleSheet, View, TextInput, TouchableOpacity, Alert, AppState, Text, Image, Linking } from 'react-native';
// import * as Location from 'expo-location';
// import * as TaskManager from 'expo-task-manager';
// import * as Notifications from 'expo-notifications';
// import MapView, { Marker } from 'react-native-maps';
// import MapViewDirections from 'react-native-maps-directions';
// import Geocoder from 'react-native-geocoding';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const LOCATION_TASK_NAME = 'background-location-task';
// const GOOGLE_MAPS_APIKEY = 'AIzaSyArnnwpKWaI9Rp_OSC9mn-L1gG0gtj8J5A';
// // Define interfaces for location and coordinates
// export interface LocationState {
//   latitude: number;
//   longitude: number;
// }

// interface Coordinates {
//   latitude: number;
//   longitude:number;
// }

// const RouteMap = () => {
//   const [location, setLocation] = useState<LocationState | null>(null);
//   const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
//   const [destination, setDestination] = useState('');
//   const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
//   const [duration, setDuration] = useState<number | null>(null);
//   const [distance, setDistance] = useState<number | null>(null);
//   const mapRef = useRef<MapView>(null);
//   const appState = useRef(AppState.currentState);

//   useEffect(() => {
  
//     Geocoder.init(GOOGLE_MAPS_APIKEY);

//     // Request location permissions and get the current location
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission to access location was denied');
//         return;
//       }

//       // Request background location permissions
//       const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
//       if (backgroundStatus !== 'granted') {
//         Alert.alert('Permission for background location tracking was denied');
//         return;
//       }

//       // Get current location
//       let location = await Location.getCurrentPositionAsync({});
//       const { latitude, longitude } = location.coords;
//       setCurrentLocation({ latitude, longitude });

//       // Watch location updates
//       Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 300000, // Every 5 minutes
//         },
//         (location) => {
//           const { latitude, longitude } = location.coords;
//           setCurrentLocation({ latitude, longitude });
//           console.log('Foreground location updated:', { latitude, longitude });
//         }
//       );

//       // Start background location updates
//       await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//         accuracy: Location.Accuracy.High,
//         timeInterval: 300000, // Every 5 minutes
//         showsBackgroundLocationIndicator: true,
//       });
//     })();
//   }, []);

//   // Request notification permissions
//   useEffect(() => {
//     (async () => {
//       const { status } = await Notifications.requestPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission for notifications was denied');
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     const subscription = AppState.addEventListener('change', (nextAppState) => {
//       if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
//         console.log('App has come to the foreground');
//       }
//       appState.current = nextAppState;
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   const handleDestinationSearch = async () => {
//     if (!destination) {
//       Alert.alert('Please enter a destination');
//       return;
//     }

//     try {
//       let geoResponse = await Geocoder.from(destination);
//       const location = geoResponse.results[0]?.geometry?.location;
//       if (!location) {
//         Alert.alert('Could not find location. Please enter a valid destination.');
//         return;
//       }

//       setDestinationCoords({
//         latitude: location.lat,
//         longitude: location.lng,
//       });

//       if (mapRef.current && currentLocation) {
//         mapRef.current.fitToCoordinates(
//           [
//             { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
//             { latitude: location.lat, longitude: location.lng },
//           ],
//           {
//             edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//             animated: true,
//           }
//         );
//       }
//     } catch (error) {
//       Alert.alert('Error finding the location. Please enter a valid destination.');
//       console.error('Geocoding error:', error);
//     }
//   };

//   const openGoogleMapsDirections = () => {
//     if (!currentLocation || !destinationCoords) {
//       Alert.alert('Please enter a valid destination and ensure current location is available');
//       return;
//     }

//     const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&travelmode=driving`;
//     Linking.openURL(googleMapsUrl);
//   };

//   const onDirectionsReady = (result: any) => {
//     setDuration(result.duration);
//     setDistance(result.distance);
//   };

//   return (
//     <View style={StyleSheet.absoluteFill}>
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={[styles.input, currentLocation ? styles.boldText : null]}
//           placeholder="Your Current Location"
//           value={currentLocation ? 'Your Current Location' : ''}
//           editable={false}
//         />
//         <TextInput
//           style={[styles.input, destination ? styles.boldText : null]}
//           placeholder="Enter Destination"
//           value={destination}
//           onChangeText={setDestination}
//         />

//         {duration && distance && (
//           <Text style={styles.routeInfo}>
//             Distance: {distance.toFixed(2)} km, Duration: {Math.floor(duration / 60) > 0
//               ? `${Math.floor(duration / 60)} hr ${Math.round(duration % 60)} min`
//               : `${Math.round(duration)} min`}
//           </Text>
//         )}

//         <TouchableOpacity style={styles.directionButton} onPress={handleDestinationSearch}>
//           <PrimaryText style={styles.buttonText}>Show Directions</PrimaryText>
//         </TouchableOpacity>
//       </View>

//       <MapView
//         ref={mapRef}
//         initialRegion={{
//           latitude: currentLocation ? currentLocation.latitude : 20.5937,
//           longitude: currentLocation ? currentLocation.longitude : 78.9629,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }}
//         style={StyleSheet.absoluteFill}
//       >
//         {currentLocation && (
//           <Marker
//             coordinate={currentLocation}
//             title="Your Current Location"
//           >
//             <Image source={require('../../assets/images/current_location.png')} style={{ width: 40, height: 40 }} />
//           </Marker>
//         )}

//         {destinationCoords && (
//           <Marker
//             coordinate={destinationCoords}
//             title={destination}
//           >
//             <Image source={require('../../assets/images/destination.png')} style={{ width: 40, height: 40 }} />
//           </Marker>
//         )}

//         {currentLocation && destinationCoords && (
//           <MapViewDirections
//             origin={currentLocation}
//             destination={destinationCoords}
//             mode="DRIVING"
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeColor="blue"
//             strokeWidth={5}
//             onReady={onDirectionsReady}
//           />
//         )}
//       </MapView>

//       <TouchableOpacity style={styles.fab} onPress={openGoogleMapsDirections}>
//         <Icon name="directions" size={30} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
//   if (error) {
//     console.error('Background location error:', error);
//     return;
//   }

//   if (data) {
//     const { locations } = data as { locations: { coords: { latitude: number; longitude: number } }[] };
//     const { latitude, longitude } = locations[0].coords;
//     console.log('Background location updated:', { latitude, longitude });

//     // Trigger a notification with the updated location
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: 'Background Location Update',
//         body: `Your current location is Latitude: ${latitude}, Longitude: ${longitude}`,
//       },
//       trigger: null,
//     });
//   }
// });

// const styles = StyleSheet.create({
//   inputContainer: {
//     position: 'absolute',
//     top: 40,
//     left: 10,
//     right: 10,
//     zIndex: 1,
//   },
//   input: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     backgroundColor: 'white',
//   },
//   boldText: {
//     fontWeight: 'bold',
//   },
//   directionButton: {
//     flexDirection: 'row',
//     backgroundColor: '#2196F3',
//     padding: 10,
//     borderRadius: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     marginLeft: 5,
//     fontSize: 16,
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 40,
//     right: 20,
//     backgroundColor: '#2196F3',
//     borderRadius: 50,
//     width: 60,
//     height: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   routeInfo: {
//     marginVertical: 5,
//     color: 'black',
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// export default RouteMap;
