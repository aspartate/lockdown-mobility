// Initialize variables to save the charts later
let lineplot
let foo

// Date parser to convert strings to date objects
let parseDate = d3.timeParse("%Y-%m-%d");

// (1) Load CSV data
// 	(2) Convert strings to date objects
// 	(3) Create new bar chart objects
// 	(4) Create new are chart object

d3.csv("data/state_dex.csv").then(data => {
	lineplot = new LinePlot('lineplot', data, 'dex')
	lineplot = new LinePlot('lineplot', data, 'num_devices')
});

// Refresh page when window resized https://stackoverflow.com/questions/14915653/refresh-page-on-resize-with-javascript-or-jquery
window.onresize = function(){ location.reload(); }