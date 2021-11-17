// Initialize variables to save the charts later
let lineplot_all, lineplot_MA
let foo

// Load all data into data array as promises
let promises = [
	d3.csv("data/state_dex_processed.csv"),
	d3.csv('data/state_lockdowns.csv'),
	d3.csv("data/state_lex_processed.csv")
]
Promise.all(promises).then(data => {
	// Lineplot
	lineplot_all = new LinePlotAll('lineplot-all', data[0], data[1], 'dex_savgol')
	// lineplot_MA = new LinePlotOneState('lineplot-onestate', data, 'MA', 'dex')

	// Matrix
	let myMatrixVis = new matrixVis('matrixDiv', data[2])
	let groupNames = ["Name"];
	let groupValues = ["name"];

	d3.select("#selectButton")
		.selectAll("myOptions")
		.data(groupValues)
		.enter()
		.append("option")
		.text((d,i) => groupNames[i])
		.attr("value", (d => d));

	d3.select("#selectButton").on("change", function(event, d) {
		let selectedOption = d3.select(this).property("value")
		myMatrixVis.wrangleData(selectedOption);
	})
})

// Refresh page when window resized https://stackoverflow.com/questions/14915653/refresh-page-on-resize-with-javascript-or-jquery
window.onresize = function(){ location.reload(); }