# route-traps


## Installation

1. Clone the project

2. Goto the directory and run `npm i` or `npm install`

3. Create a `.env` file with content `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "Here is the API KEY"`

4. Run `npm start` or `npx expo start`

  

## Solution Overview

1. **User Location Acquisition**: Utilize `expo-location` to obtain the user's location (latitude and longitude), followed by using Google Geocode for reverse geocoding to get the corresponding address.

2. **Address Input Assistance**: Implement `react-native-google-places-autocomplete` to assist users in prompting addresses, combined with `GooglePlacesDetailsQuery` to retrieve both location data and address. These data are then sent back to the main screen.

3. **Map Markers Display**: Use `react-native-maps` to display the entire map with markers for both the initial and the destination points.

4. **Polyline Route Display**: Employ `MapViewDirections` from `react-native-maps-directions` to show the polyline on the map, representing the route.

5. **Route Data Retrieval**: The `onReady` method of `MapViewDirections` will return the result from the Google Direction endpoint, containing data about "steps", "distance", and "duration" (assuming the user is in driver mode).

6. **Trap Points Display**: Store the "steps" data in the state, then display trap points on the map using the `Marker` from `react-native-maps`.

7. **Trap Point Interaction**: When the user clicks on a trap point, it will show the maneuver, instruction (rendered by `react-native-render-html`), and the distance from the start point (calculated by `geolib`).

## Advanced Features

1. **Automatic Region Adjustment**: The region will automatically adjust to provide an overview of the polyline.

2. **Enhanced Marker Interaction**: When clicking on a Marker, the map view will also adjust to center on the point, enhancing the user experience.

