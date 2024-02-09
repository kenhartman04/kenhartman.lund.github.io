/***********************************************LOAD LAYERS**************************************************************************************************/
// Define custom icons for start and end points
var startIcon = L.icon({
    iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',  // Green leaf icon
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76]
});

var endIcon = L.icon({
    iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',  // Red leaf icon
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76]
});
// Initialize current markers to null
var currentStartMarker = null;
var currentEndMarker = null;
var currentRoutingControl = null;

// Initialize startMarker and endMarker to null
var startMarker = null;
var endMarker = null;

// Initialize the map
var map = L.map('map').setView([55.704660, 13.191007], 13);

// Add the click event listener
map.on('click', function(e) {
    // e.latlng contains the coordinates of the clicked point
    var startPoint = e.latlng;

    // Find the closest pump to the clicked point
    var closestPump = findClosestPump(startPoint, pumpLayer);

    if (closestPump) {
        var endPoint = closestPump.latlng;

        // Remove current markers from the map
        if (currentStartMarker) {
            map.removeLayer(currentStartMarker);
        }
        if (currentEndMarker) {
            map.removeLayer(currentEndMarker);
        }
        if (currentRoutingControl) {
            map.removeControl(currentRoutingControl);
        }
        // Create new markers and add them to the map
        currentStartMarker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }).addTo(map);
        currentEndMarker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }).addTo(map);
        
        calculateAndDisplayRoute(startPoint, endPoint);
    }
});

// Function to load base layer
function loadBaseLayer() {
    var baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    baseLayer.addTo(map);

    return baseLayer;
}

// Function to load road layer
function loadRoadLayer() {
    var roadLayer = new L.GeoJSON.AJAX('http://geoserver.gis.lu.se/geoserver/KenLund/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=KenLund:bike_path&outputFormat=application%2Fjson', {
        attribution: 'Road Layer Attribution'
    });
  
    roadLayer.addTo(map);
  
    return roadLayer;
}

// Function to load pump layer
function loadPumpLayer() {
    var pumpLayer = new L.GeoJSON.AJAX('http://geoserver.gis.lu.se/geoserver/LundBike/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=LundBike:BikePumps&maxFeatures=50&outputFormat=application%2Fjson', {
        attribution: 'pump Layer Attribution'
    });

    pumpLayer.addTo(map);

    return pumpLayer;
}

// Call the function to load the base layer
var baseLayer = loadBaseLayer();

// Call the function to load the road layer
var roadLayer = loadRoadLayer();

// Call the function to load the pump layer
var pumpLayer = loadPumpLayer();

// Function to find the closest pump
function findClosestPump(clickedPoint, pumpLayer) {
    var closestPump = null;
    var minDistance = Infinity;

    pumpLayer.eachLayer(function (layer) {
        var pumpLatLng = layer.getLatLng();
        var distance = clickedPoint.distanceTo(pumpLatLng);

        if (distance < minDistance) {
            minDistance = distance;
            closestPump = {
                latlng: pumpLatLng,
                feature: layer.feature
            };
        }
    });

    return closestPump;
}

// Keep a reference to the routing control outside of the function
var routingControl = null;

document.getElementById('locate').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLocation = L.latLng(position.coords.latitude, position.coords.longitude);
            var pumpLayer = loadPumpLayer();
            var closestPump = findClosestPump(userLocation, pumpLayer);
            // Calculate the path to the closest pump here
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});
/*// Function to calculate and display the route with custom icons
function calculateAndDisplayRoute(startPoint, endPoint) {
    // If a routing control already exists, remove it from the map
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Define custom icons for start and end points
    var startIcon = L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',  // Green leaf icon
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    });

    var endIcon = L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',  // Red leaf icon
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    });

    // Create a new routing control with custom icons
    routingControl = L.Routing.control({
        waypoints: [
            L.Routing.waypoint(startPoint.lat, startPoint.lng, '<b>Start</b>', { icon: startIcon }),
            L.Routing.waypoint(endPoint.lat, endPoint.lng, '<b>End</b>', { icon: endIcon })
        ],
    }).addTo(map);
}

// Call the function to load the base layer
var baseLayer = loadBaseLayer();

// Call the function to load the road layer
var roadLayer = loadRoadLayer();

// Call the function to load the pump layer
var pumpLayer = loadPumpLayer();

// Event handler for a click on the road layer
roadLayer.on('click', function (e) {
    console.log('roadLayer clicked');
    var roadClickedPoint = e.latlng;
    var closestPump = findClosestPump(roadClickedPoint, pumpLayer);
    console.log(closestPump);
    calculateAndDisplayRoute(roadClickedPoint, closestPump.latlng);
});
*/


// Function to calculate and display the route with custom markers
function calculateAndDisplayRoute(startPoint, endPoint) {
    // If a routing control already exists, remove it from the map
    if (routingControl) {
        map.removeControl(routingControl);
    }
    // Clear existing markers from the map
    if (startMarker) {
        map.removeLayer(startMarker);
    }
    if (endMarker) {
        map.removeLayer(endMarker);
    }

    // Create markers with custom colors for start and end points
    var startMarker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }).addTo(map);
    var endMarker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }).addTo(map);

    // Define the OpenRouteService API URL
    var orsAPI = 'https://api.openrouteservice.org/v2/directions/cycling-regular?api_key=5b3ce3597851110001cf624833a08186c127419f986c3d1af4433daf&start=' + startPoint.lng + ',' + startPoint.lat + '&end=' + endPoint.lng + ',' + endPoint.lat;

    // Make a GET request to the OpenRouteService API
    fetch(orsAPI)
        .then(response => response.json())
        .then(data => {
            // The coordinates of the route are in the 'geometry' property of the first feature
            var routeCoordinates = data.features[0].geometry.coordinates;

            // The coordinates are in [longitude, latitude] format, but Leaflet expects [latitude, longitude] format, so we need to reverse them
            routeCoordinates = routeCoordinates.map(coordinate => coordinate.reverse());

            // Create a polyline for the route and add it to the map
            var routePolyline = L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);

            // Add the route polyline to the routing control
            routingControl = L.Routing.control({
                lineOptions: {
                    styles: [{ color: 'blue', opacity: 1, weight: 5 }]
                },
                createMarker: function (i, waypoint, n) {
                    // Use custom markers for the start and end points
                    return i === 0 ? startMarker : endMarker;
                },
                addWaypoints: false
            }).addTo(map);
        })
        .catch(error => console.error('Error:', error));
}
