// Initialize map
var map = L.map('map').setView([55.704660, 13.191007], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Add GeoServer WMS layer
var wmsLayer = L.tileLayer.wms('http://geoserver.gis.lu.se/geoserver/KenLund/wms', {
    layers: 'KenLund:bike_path',
    format: 'image/png',
    transparent: true,
    attribution: 'Your attribution here' // Add attribution if required by GeoServer
});
wmsLayer.addTo(map);

// Add a marker
var marker = L.marker([55.704660, 13.191007]).addTo(map);

// Initialize a popup
var popup = L.popup();

// Function to handle map click event
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

// Attach the click event listener to the map
map.on('click', onMapClick);
