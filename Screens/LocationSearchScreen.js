import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Icon } from '@rneui/themed';


export default function LocationSearchScreen({ route, navigation}) {
  const { type, promptedAddress } = route.params;
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (promptedAddress){
      searchInputRef.current?.setAddressText(promptedAddress);
    }
  }, [promptedAddress]);

  const handleLocationSelect = (data, details) => {
    const selectedLocation = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };
    const selectedAddress = details.formatted_address;

    if (type === 'start') {
      navigation.navigate('Map', {
        startLocation: selectedLocation,
        startAddress: selectedAddress,
      });
      return;
    }
    navigation.navigate('Map', {
      endLocation: selectedLocation,
      endAddress: selectedAddress,
    });
  }


  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <GooglePlacesAutocomplete
          ref={searchInputRef}
          onPress={handleLocationSelect}
          placeholder={type === "start" ? "Search for a starting location" : "Search for a destination"}
          fetchDetails={true}
          enablePoweredByContainer={false}
          GooglePlacesDetailsQuery={{
            fields: "formatted_address,geometry",
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          listViewDisplayed={'auto'}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            language: "en",
          }}
          styles={{
            container: styles.searchContainer,
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
          }}
          onFail={(error) => console.error(error)}
          renderLeftButton={() => (
            <Icon 
              type='octicon' 
              name={promptedAddress ? "dot-fill" : "dot"}
              size={24} 
              color={type === "start" ? "#06D028" : "#F3250E"}
            />
          )}
          renderRightButton={() => (
            type === "start" && (
              <TouchableOpacity>
                <Icon type='material' name="my-location" size={24} color="black" />
              </TouchableOpacity>
            )
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 2,
    marginHorizontal: 10,
    marginVertical: 20,
  },
  searchContainer: {
    flex: 1,
  },
  textInputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: 'transparent',
    marginHorizontal: 10,
    marginVertical: 0,
    marginBottom: 0,
    fontSize: 16,
  },
});