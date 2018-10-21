// Define satellite layer
var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

// Define grayscale layer
var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.light",
    accessToken: API_KEY
});

// Define a baseMaps object to hold our base layers
var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": grayscalemap,
};

// Create our map, giving it the satellite map, earthquakes and faultline layers to display on load
var myMap = L.map("map-timeline", {
    center: [
        //37.09, -95.71
        0, 0
    ],
    zoom: 1.5,
    layers: [grayscalemap],
    /*timeDimension: true,
    timeDimensionOptions: {
        timeInterval: "1850-01-01/2013-01-01",
        period: "P1Y",
        currentTime: '1850-01-01',
    },
    timeDimensionControl: true,*/
});

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, '', {
    collapsed: false
}).addTo(myMap);

var url = "/timeline/geoJSON";

d3.json(url).then(function(geoJSON) {

    var heatArray = [];

    geoJSON.features.forEach(r => {
        heatArray.push([
            r.geometry.coordinates[0],
            r.geometry.coordinates[1],
            r.properties.average_temperature,
         ]);
    })

    var heat = L.heatLayer(heatArray, {
        radius: 15,
        blur: 25
    }).addTo(myMap);

});
