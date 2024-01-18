var map = L.map('map').setView([55.704660, 13.191007], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Add WMS layer to the map
var wmsLayer = L.tileLayer.wms('https://geodata.skane.se/geoserver/rs_geodata/wms', {
    layers: 'rs_geodata_cykelbarhetsklassning_v2',
    format: 'image/png',
    transparent: true,
    attribution: 'WMS Service provided by Skåne Regional Council'
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