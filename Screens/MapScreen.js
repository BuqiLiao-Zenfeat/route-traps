import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Icon } from '@rneui/themed';
import * as Location from 'expo-location';
import MapView, { Marker, MarkerAnimated, PROVIDER_GOOGLE } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions';
import { getDistance } from 'geolib';

import { getAddressFromLatLng } from '../Utils/locationUtils';

import BottomPanel from '../Components/BottomPanel';
import TopPanel from '../Components/TopPanel';
import MarkerCallout from '../Components/MarkerCallout';
import SearchBarButton from '../Components/SearchBarButton';
import Divider from '../Components/Divider';

import {
  LATITUDE_DELTA, LONGITUDE_DELTA,
  MARKER_LATITUDE_DELTA, MARKER_LONGITUDE_DELTA,
  POLYLINE_COLOR, POLYLINE_WIDTH,
  TRAP_POINT_MARKER_SIZE, TRAP_POINT_MARKER_COLOR,
} from '../Constants/mapConstants';


const { width, height } = Dimensions.get('window');

export default function MapScreen({ route, navigation }){
  const mapViewRef = useRef(null);
  const { startLocation, startAddress, endLocation, endAddress } = route?.params || {};

  const [userLocation, setUserLocation] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null); 
  const [initialAddress, setInitialAddress] = useState(null);
  const [destination, setDestination] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState(null);

  const [trapPoints, setTrapPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);


  useEffect(() => {
    if (startLocation && startAddress) {
      console.log('startLocation and startAddress are set');
      console.log(startLocation, startAddress);
      setInitialLocation(startLocation);
      setInitialAddress(startAddress);
    }
  }, [startLocation, startAddress]);
  useEffect(() => {
    if (endLocation && endAddress) {
      console.log('endLocation and endAddress are set');
      console.log(endLocation, endAddress);
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
      setUserLocation({ latitude, longitude });
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
          <MarkerAnimated
            key={0}
            coordinate={initialLocation}
            title={initialAddress}
            description="Starting point"
            onPress={() => handleMarkerPress(initialLocation)}
          />
        )}
        {destination && (
          <MarkerAnimated
            key={1}
            coordinate={destination}
            title={destinationAddress}
            description="Destination"
            onPress={() => handleMarkerPress(destination)}
          />
        )}
        {trapPoints.map((trapPoint, index) => (
          <Marker
            key={index+2}
            coordinate={trapPoint.location}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => handleMarkerPress(trapPoint.location)}
          >
            <Icon 
              type='material-community' 
              name="circle"
              size={TRAP_POINT_MARKER_SIZE} 
              color={TRAP_POINT_MARKER_COLOR} 
            />
            <MarkerCallout
              title={trapPoint.maneuver}
              description={trapPoint.instruction+' ('+trapPoint.distanceFromStart+' m)'}
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
            setTrapPoints([]);
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
                distanceFromStart: getDistance(initialLocation, step.start_location)
              };
              setTrapPoints(prevState => [...prevState, trapPoint]);
            });
            setDistance(result.distance);
            setDuration(result.duration);

            mapViewRef.current?.fitToCoordinates(result.coordinates, {
              edgePadding: {
                right: (width / 10),
                bottom: (height / 3),
                left: (width / 10),
                top: (height / 3),
              },
            });
          }}
          onError={(errorMessage) => { console.log(errorMessage) }}
        />
      </MapView>
      {distance && duration && (
        <TopPanel>
          <View style={styles.detailsGroupContainer}>
            <View style={styles.detailsContainer}>
              <Icon type='material' name="directions" size={24} color="black" />
              <Text style={styles.detailsText}>{distance} km</Text>
            </View>
            <Divider type='vertical' />
            <View style={styles.detailsContainer}>
              <Icon type='material' name="timer" size={24} color="black" />
              <Text style={styles.detailsText}>{duration.toFixed(2)} min</Text>
            </View>
          </View>
        </TopPanel>
      )}
      <BottomPanel>
        <View style={styles.searchBarGroupContainer}>
          <SearchBarButton
            buttonText={initialAddress || 'Choose starting point'}
            onPress={() => navigation.navigate('Location Search',{ 
              type: 'start',
              userLocation,
              promptedAddress: initialAddress,
            })}
            leftIcon={<Icon type='octicon' name="dot-fill" size={24} color="#06D028" />}
            rightIcon={
              <TouchableOpacity onPress={fetchUserLocation}>
                <Icon type='material' name="my-location" size={24} color="black" />
              </TouchableOpacity>
            }
          />
          <Divider type='horizontal' />
          <SearchBarButton
            buttonText={destinationAddress || 'Choose destination'}
            onPress={() => navigation.navigate('Location Search',{
              type : 'end',
              userLocation,
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
  detailsGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  detailsText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
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