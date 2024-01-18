var map = L.map('map').setView([55.704660, 13.191007], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Add Lantmäteriet's INSPIRE basemap WMS layer
var wmsLayer = L.tileLayer.wms('https://maps.lantmateriet.se/inspire/basemap/wms/v1', {
    layers: 'inspire_basemap',
    format: 'image/png',
    transparent: true,
    attribution: 'Map data: Lantmäteriet'
}).addTo(map);

var marker = L.marker([55.704660, 13.191007]).addTo(map);

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);