// Define SVG area dimensions
var svgWidth = 500;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 100,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select('#pollutant-scatter')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Default to Axis label
var currentXAxis = 'date';
var currentYAxis = 'co2_ppm';

var parseTime = d3.timeParse('%Y');

// Load data from miles-walked-this-month.csv
d3.json('/global/pollutant').then(function(data) {

    // Cast the hours value to a number for each piece of data
    data.forEach(function(d) {
        d.co2_ppm = +d.co2_ppm;
        d.ch4_ppb = +d.ch4_ppb;
        d.n2o_ppb = +d.n2o_ppb;
        var temp_d = Date.parse(d.date);
        var temp_d = new Date(temp_d);
        d.date = parseTime(temp_d.getUTCFullYear());
    });

    // xScale
    var xScale = getXScaleForAxis(data, currentXAxis);

    // yScale
    var yScale = getYScaleForAxis(data, currentYAxis);

    // create axes
    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);

    // set x to the bottom of the chart
    var xAxis = chartGroup.append('g')
                .attr('transform', `translate(0, ${chartHeight})`)
                .call(xAxis);

    // set y to the y axis
    var yAxis = chartGroup.append('g')
                .call(yAxis);

    // Create group for 3 x- axis labels
    var xLabelsGroup = chartGroup.append('g')
                        .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 10})`);

    // Year Label
    var yearLabel = xLabelsGroup.append('text')
                        .attr('x', 0)
                        .attr('y', 20)
                        .attr('value', 'date') // value to grab for event listener
                        .classed('active-x', true)
                        .text('Year');

    // Average Temperature Label
    var avgTempLabel = xLabelsGroup.append('text')
                        .attr('x', 0)
                        .attr('y', 40)
                        .attr('value', 'average_temperature') // value to grab for event listener
                        .classed('inactive-x', true)
                        .text('Average Temperature');

    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append('g')
                        .attr('transform', 'rotate(-90)');

    // CO2 Label
    var co2Label = yLabelsGroup.append('text')
                        .attr('y', 0 - 60)
                        .attr('x', 0 - (svgHeight / 2))
                        .attr('dy', '1em')
                        .attr('value', 'co2_ppm')
                        .classed('active-y', true)
                        .text('Carbon dioxide CO2 (ppm)');

    // CH4 Label
    var ch4Label = yLabelsGroup.append('text')
                        .attr('y', 0 - 80)
                        .attr('x', 0 - (svgHeight / 2))
                        .attr('dy', '1em')
                        .attr('value', 'ch4_ppb')
                        .classed('inactive-y', true)
                        .text('Methane CH4 (ppb)');

    // N2O Label
    var n2oLabel = yLabelsGroup.append('text')
                        .attr('y', 0 - 100)
                        .attr('x', 0 - (svgHeight / 2))
                        .attr('dy', '1em')
                        .attr('value', 'n2o_ppb')
                        .classed('inactive-y', true)
                        .text('Nitrous oxide N2O (ppb)');

    // Create code to build the scatter chart using the data.
    var circlesGroup = chartGroup.selectAll('circle')
                        .data(data)
                        .enter()
                            .append('circle')
                            .classed('stateCircle', true)
                            .attr('r', d => 5)
                            .attr('cx', (d, i) => xScale(d[currentXAxis]))
                            .attr('cy', d => yScale(d[currentYAxis]));

    circlesGroup = updateToolTip(currentXAxis, currentYAxis, circlesGroup);

    // Configure a line function which will plot the x and y coordinates using our scales
    var drawLine = d3.line()
        .x(d => xScale(d[currentXAxis]))
        .y(d => yScale(d[currentYAxis]));

    // Append an SVG path and plot its points using the line function
    var pathGroup = chartGroup.selectAll('path')
        .data(data)
        .enter()
            .append('path')
            // The drawLine function returns the instructions for creating the line for data
            .attr('d', drawLine(data))
            .classed('line', true);

     // x axis labels event listener
    xLabelsGroup.selectAll('text')
        .on('click', function() {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value !== currentXAxis) {

                // replaces currentXAxis with value
                currentXAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                xScale = getXScaleForAxis(data, currentXAxis);

                // updates x axis with transition
                xAxis.transition()
                    .duration(1000)
                    .call(d3.axisBottom(xScale));

                // updates circles with new x values
                circlesGroup.transition()
                    .duration(1000)
                    .attr('cx', d => xScale(d[currentXAxis]));

                // updates tooltips with new info
                circlesGroup = updateToolTip(currentXAxis, currentYAxis, circlesGroup);

                // Configure a line function which will plot the x and y coordinates using our scales
                var drawLine = d3.line()
                    .x(d => xScale(d[currentXAxis]))
                    .y(d => yScale(d[currentYAxis]));

                // Append an SVG path and plot its points using the line function
                pathGroup.transition()
                    .duration(1000)
                        // The drawLine function returns the instructions for creating the line for data
                        .attr('d', drawLine(data));

                // changes classes to change bold text
                if (currentXAxis === 'average_temperature') {
                    yearLabel
                        .classed('active-x', false)
                        .classed('inactive-x', true);
                    avgTempLabel
                        .classed('active-x', true)
                        .classed('inactive-x', false);
                } else {
                    yearLabel
                        .classed('active-x', true)
                        .classed('inactive-x', false);
                    avgTempLabel
                        .classed('active-x', false)
                        .classed('inactive-x', true);
                }
            }
        });

    // y axis labels event listener
    yLabelsGroup.selectAll('text')
        .on('click', function() {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value !== currentYAxis) {

                // replaces currentYAxis with value
                currentYAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                yScale = getYScaleForAxis(data, currentYAxis);

                // updates x axis with transition
                yAxis.transition()
                    .duration(1000)
                        .call(d3.axisLeft(yScale));

                // updates circles with new x values
                circlesGroup.transition()
                    .duration(1000)
                        .attr('cy', d => yScale(d[currentYAxis]));

                // updates tooltips with new info
                circlesGroup = updateToolTip(currentXAxis, currentYAxis, circlesGroup);

                // Configure a line function which will plot the x and y coordinates using our scales
                var drawLine = d3.line()
                    .x(d => xScale(d[currentXAxis]))
                    .y(d => yScale(d[currentYAxis]));

                // Append an SVG path and plot its points using the line function
                pathGroup.transition()
                    .duration(1000)
                        // The drawLine function returns the instructions for creating the line for data
                        .attr('d', drawLine(data));

                // changes classes to change bold text
                if (currentYAxis === 'ch4_ppb') {
                    co2Label
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                    ch4Label
                        .classed('active-y', true)
                        .classed('inactive-y', false);
                    n2oLabel
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                } else if (currentYAxis === 'n2o_ppb') {
                    co2Label
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                    ch4Label
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                    n2oLabel
                        .classed('active-y', true)
                        .classed('inactive-y', false);
                } else {
                    co2Label
                        .classed('active-y', true)
                        .classed('inactive-y', false);
                    ch4Label
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                    n2oLabel
                        .classed('active-y', false)
                        .classed('inactive-y', true);
                }
            }
        });

});

// function used for updating x-scale var upon click on axis label
function getXScaleForAxis(data, currentXAxis) {

    var xmin = d3.min(data, d => d[currentXAxis]);
    var xmax = d3.max(data, d => d[currentXAxis]);

    var xScale = d3.scaleLinear()
      //.domain([ymin, ymax])
      .domain(d3.extent(data, d => d[currentXAxis]))
      .range([0, chartWidth]);

    if (currentXAxis == 'date') {
        // create scales
        xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, chartWidth]);
    }

    return xScale;
}

// function used for updating y-scale var upon click on axis label
function getYScaleForAxis(data, currentYAxis) {

    var ymin = d3.min(data, d => d[currentYAxis]);
    var ymax = d3.max(data, d => d[currentYAxis]);

    // Adjust the min and max
    ymin = ymin - 2;
    ymax = ymax + 4;

    // create scales
    var yScale = d3.scaleLinear()
      //.domain([ymin, ymax])
      .domain(d3.extent(data, d => d[currentYAxis]))
      .range([chartHeight, 0]);

    return yScale;
}

// function to get the label for given axis value
function getLabel(currentAxis) {
    label = '';

    if (currentAxis === 'date') {
        label = 'Year';
    } else if (currentAxis === 'co2_ppm') {
        label = 'Carbon dioxide CO2 (ppm)';
    } else if (currentAxis === 'ch4_ppb') {
        label = 'Methane CH4 (ppb)';
    } else if (currentAxis === 'n2o_ppb') {
        label = 'Nitrous oxide N2O (ppb)';
    } else if (currentAxis == 'average_temperature') {
        label = 'Average Temperature';
    }

    return label;
}

// function used for updating circles/text group with new tooltip
function updateToolTip(currentXAxis, currentYAxis, circlesGroup) {
    var xlabel = getLabel(currentXAxis);
    var ylabel = getLabel(currentYAxis);

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => `${xlabel}: ${d[currentXAxis]}<br>${ylabel}: ${d[currentYAxis]}`);

    circlesGroup.call(toolTip);
    circlesGroup
        .on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    return circlesGroup;
}