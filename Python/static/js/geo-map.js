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

var currentTime = new Date('1850-01-01');

// Create our map, giving it the satellite map, earthquakes and faultline layers to display on load
var myMap = L.map("map-timeline", {
    center: [0, 0],
    zoom: 1.5,
    layers: [grayscalemap],
    timeDimension: true,
    timeDimensionOptions: {
        timeInterval: "1850-01-01/2013-01-01",
        period: "P1Y",
        currentTime: currentTime
    },
});

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, '', {
    collapsed: false
}).addTo(myMap);

// Customer HeatMap year with timeline
var testapiHeatLayer = L.timeDimension.layer.apiHeatMap({
    baseURL: 'timeline/data/1850-01-01',
});
testapiHeatLayer.addTo(myMap);

L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
    _getDisplayDateFormat: function(date){
        return 'Year '+date.getUTCFullYear();
    }
});
var timeDimensionControl = new L.Control.TimeDimensionCustom({
    playerOptions: {
        buffer: 1,
        minBufferReady: -1
    }
});
myMap.addControl(this.timeDimensionControl);