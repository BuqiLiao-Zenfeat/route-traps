import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Icon } from '@rneui/themed';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions';

import { getAddressFromLatLng } from '../Utils/locationUtils';

import BottomPanel from '../Components/BottomPanel';
import MarkerCallout from '../Components/MarkerCallout';
import SearchBarButton from '../Components/SearchBarButton';

import {
  LATITUDE_DELTA, LONGITUDE_DELTA,
  MARKER_LATITUDE_DELTA, MARKER_LONGITUDE_DELTA,
  POLYLINE_COLOR, POLYLINE_WIDTH,
  TRAP_POINT_MARKER_SIZE, TRAP_POINT_MARKER_COLOR,
} from '../Constants/mapConstants';


const { width, height } = Dimensions.get('window');

export default function MapScreen({ route, navigation }){
  const mapViewRef = useRef(null);

  const [initialLocation, setInitialLocation] = useState(null); 
  const [initialAddress, setInitialAddress] = useState(null);
  const [destination, setDestination] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState(null);

  const [trapPoints, setTrapPoints] = useState([]);
  const { startLocation, startAddress, endLocation, endAddress } = route?.params || {};

  useEffect(() => {
    if (startLocation && startAddress) {
      setInitialLocation(startLocation);
      setInitialAddress(startAddress);
    }
  }, [startLocation, startAddress]);
  useEffect(() => {
    if (endLocation && endAddress) {
      setDestination(endLocation);
      setDestinationAddress(endAddress);
    }
  }, [endLocation, endAddress]);

  useEffect(() => {
    fetchUserLocation();
  }, []);


  const fetchUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setInitialLocation({ latitude, longitude });
      const address = await getAddressFromLatLng(latitude, longitude);
      setInitialAddress(address);
    } catch (error) {
      console.log(error);
    }
  }

  const handleMarkerPress = (location) => {
    mapViewRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: MARKER_LATITUDE_DELTA,
      longitudeDelta: MARKER_LONGITUDE_DELTA,
    }, 1000);
  }


  return(
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: initialLocation?.latitude,
          longitude: initialLocation?.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation
        style={{...StyleSheet.absoluteFillObject}}
      >
        {initialLocation && (
          <Marker
            coordinate={initialLocation}
            title={initialAddress}
            description="Starting point"
            onPress={() => handleMarkerPress(initialLocation)}
          />
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title={destinationAddress}
            description="Destination"
            onPress={() => handleMarkerPress(destination)}
          />
        )}
        {trapPoints.map((trapPoint, index) => (
          <Marker
            key={index}
            coordinate={trapPoint.location}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => handleMarkerPress(trapPoint.location)}
          >
            <Icon type='material-community' name="circle" size={TRAP_POINT_MARKER_SIZE} color={TRAP_POINT_MARKER_COLOR} />
            <MarkerCallout
              title={trapPoint.maneuver}
              description={trapPoint.instruction}
            />
          </Marker>
        ))}
        <MapViewDirections
          origin={initialLocation}
          destination={destination}
          apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
          strokeWidth={POLYLINE_WIDTH}
          strokeColor={POLYLINE_COLOR}
          onStart={(params) => {
            console.log(params);
            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
          }}
          onReady={result => {
            result.legs[0].steps.forEach(step => {
              if(!step.maneuver) return;
              const trapPoint = {
                location: {
                  latitude: step.start_location.lat,
                  longitude: step.start_location.lng,
                },
                maneuver: step.maneuver,
                instruction: step.html_instructions,
              };
              setTrapPoints(prevState => [...prevState, trapPoint]);
            });
            console.log(`Distance: ${result.distance} km`)
            console.log(`Duration: ${result.duration} min.`)

            mapViewRef.current?.fitToCoordinates(result.coordinates, {
              edgePadding: {
                right: (width / 10),
                bottom: (height / 10),
                left: (width / 10),
                top: (height / 10),
              },
            });
          }}
          onError={(errorMessage) => {
            console.error(errorMessage);
          }}
        />
      </MapView>
      <BottomPanel>
        <View style={styles.searchBarGroupContainer}>
          <SearchBarButton
            buttonText={initialAddress || 'Choose starting point'}
            onPress={() => navigation.navigate('Location Search',{ 
              type: 'start',
              promptedAddress: initialAddress,
            })}
            leftIcon={<Icon type='octicon' name="dot-fill" size={24} color="#06D028" />}
            rightIcon={
              <TouchableOpacity onPress={fetchUserLocation}>
                <Icon type='material' name="my-location" size={24} color="black" />
              </TouchableOpacity>
            }
          />
          <View style={styles.divider} />
          <SearchBarButton
            buttonText={destinationAddress || 'Choose destination'}
            onPress={() => navigation.navigate('Location Search',{
              type : 'end',
              promptedAddress: destinationAddress,
            })}
            leftIcon={<Icon type='octicon' name={destination ? "dot-fill" : "dot"} size={24} color="#F3250E" />}
          />
        </View>
      </BottomPanel>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarGroupContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 2,
  },
});