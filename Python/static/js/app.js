function buildGlobalCharts() {
    buildGlobalTemperatureChart()
}

function buildGlobalTemperatureChart () {

    // Use `d3.json` to fetch the sample data for the plots
    var temperature_data_url = '/global/temperature';

    d3.json(temperature_data_url).then(function(data) {

        var dates = data.date.map(function(d) {
            var temp_d = Date.parse(d);
            var temp_d = new Date(temp_d);
            return temp_d.getUTCFullYear()+'-'+temp_d.getUTCMonth()+'-'+temp_d.getUTCDate();
        });

        // Build a scatter Chart using the sample data
        var scatterTrace1 = {
            x: dates,
            y: data.avg_land_and_ocean_temperature,
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: data.avg_land_and_ocean_temperature,
                colorscale: 'RdBu',
            },
        };
        var scatterData = [scatterTrace1];
        var scatterLayout = {
            xaxis: { title: 'Year'},
            yaxis: { title: 'Average Temperature (C)'},
        };

        Plotly.newPlot('global-scatter', scatterData, scatterLayout);

    });
}

function buildCharts(city, country, period) {

    // Use `d3.json` to fetch the sample data for the plots
    var temperature_data_url = '/temperature/';

    if (city) {
        temperature_data_url = temperature_data_url + 'city/' + city + '/';
    }

    if (country) {
        temperature_data_url = temperature_data_url + 'country/' + country + '/';
    }

    temperature_data_url = temperature_data_url + 'period/' + period

    d3.json(temperature_data_url).then(function(data) {

        var dates = data.date.map(function(d) {
            var temp_d = Date.parse(d);
            var temp_d = new Date(temp_d);
            return temp_d.getUTCFullYear()+'-'+temp_d.getUTCMonth()+'-'+temp_d.getUTCDate();
        });

        // Build a scatter Chart using the sample data
        var scatterTrace1 = {
            x: dates,
            y: data.temperature,
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: data.temperature,
                colorscale: 'RdBu',
            },
        };
        var scatterData = [scatterTrace1];
        var scatterLayout = {
            title: 'Average Temperature (C)  over time period (1850 - 2013) ',
            xaxis: { title: 'Year'},
            yaxis: { title: 'Average Temperature (C)'},
        };

        Plotly.newPlot('scatter', scatterData, scatterLayout);

        var changesInTemperatures = getTemperatureChange(data.temperature)
        // Build a bar Chart using the sample data
        var barTrace1 = {
            x: dates,
            y: changesInTemperatures,
            type: 'bar',
            marker: {
                color: changesInTemperatures,
                colorscale: 'RdBu',
            },
        };
        var barData = [barTrace1];
        var barLayout = {
            title: 'Change in Temperature over time period (1850 - 2013) ',
            xaxis: { title: 'Year'},
            yaxis: { title: 'Change in Temperature (C)'},
        };

        Plotly.newPlot('bar', barData, barLayout);

    });
}

// Calculate a temperature change for an array
function getTemperatureChange(arr) {

  // change in temperature array
  var changeTemperatures = [];

  // Loop through all of the data
  for (var i = 0; i < arr.length; i++) {
    if (i != arr.length) {
        var change = arr[i+1] - arr[i];
        // calculate the change and push it to the changes array
        changeTemperatures.push(change);
    }
  }
  return changeTemperatures;
}


function getCitiesByCountry(country) {

    var citySelector = d3.select("#selCityDataset");
    citySelector.text('');
    d3.json("/cities/"+country).then((cityNames) => {
        cityNames.forEach((city) => {
            citySelector
                .append("option")
                .text(city)
                .property("value", city);
        });
        const firstCity = cityNames[0];

        return firstCity;
    });

}

function init() {

    // Grab a reference to the dropdown select element
    var selector = d3.select("#selCountryDataset");

    // Use the list of country name to populate the select options
    d3.json("/countries").then((countryNames) => {
        countryNames.forEach((country) => {
            selector
                .append("option")
                .text(country)
                .property("value", country);
        });

        // Use the first country from the list to build the initial plots
        const firstCountry = countryNames[0];
        const firstCity = getCitiesByCountry(firstCountry);

        buildCharts(firstCity, firstCountry, 'yearly');
    });

    buildGlobalCharts()
}

function optionCountryChanged(newCountry) {

    const firstCity = getCitiesByCountry(newCountry);

    buildCharts(firstCity, newCountry, 'yearly');
    // Fetch new data each time a new country is selected
    //buildCharts('', newCountry, 'yearly');
}

function optionCityChanged(newCity) {
  // Grab a reference to the dropdown select element
  var countrySelector = d3.select("#selCountryDataset");
  var country = countrySelector.property('value');

  // Fetch new data each time a new city is selected
  buildCharts(newCity, country, 'yearly');
}

// Initialize the dashboard
init();
