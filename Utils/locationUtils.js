import axios from "axios"


export const getAddressFromLatLng = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    return null;
  }
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json",{
      params: {
        latlng: `${latitude},${longitude}`,
        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      }
    });
    
    return response.data.results[0].formatted_address;
  } catch (error) {
    console.log(error.response.data);
  }
}