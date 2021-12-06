// Initialize variables to save the charts later
let foo, dateListDex, dateListLex
let fig1_lineplot, fig1_map, fig3_lineplot, fig3_violinplot, fig2_map, fig2_matrix, fig4_lineplot

// Load all data into data array as promises
let promises = [
	d3.csv("data/state_dex_processed.csv"), // dex data
	d3.csv('data/state_lockdowns.csv'), // lockdown dates
	d3.csv("data/state_lex_processed.csv"), // lex data
	d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json") // geo paths
]
Promise.all(promises).then(data => {
	// List of dates represented in DEX data
	dateListDex = [...new Set(data[0].map(item => item.date))]
		.map(d => parseDate(d))
		.filter(d => {return d.getTime() <= parseDate('2020-12-31').getTime()})
	// List of dates represented in LEX data
	dateListLex = [...new Set(data[2].map(item => item.DATE))]
		.map(d => parseDateLex(d))
		.filter(d => {return d.getTime() <= parseDateLex('12/31/2020').getTime()})
		.sort(function (a, b) {
			return a.getTime() - b.getTime()
		})
	selectedDateLex = dateListLex[0] // selected date for fig2

	// Figure 1
	fig1_lineplot = new LinePlotAll('fig1_lineplot', data[0], data[1], 'dex_7dma')
	fig1_map = new MapVis('fig1_map', data[0], data[3])

	// Figure 2
	fig2_matrix = new matrixVis('fig2_matrix', data[2], selectedDateLex)
	fig2_map = new flowmapVis('fig2_map', data[3], data[2], data[0], selectedDateLex)

	// Figure 3
	fig3_lineplot = new LinePlotViolin('fig3_lineplot', data[0], data[1], 'dex_7dma')
	fig3_violinplot = new ViolinPlot('fig3_violinplot', data[0], data[1], 'dex_7dma')

	// Figure 4
	fig4_lineplot = new LinePlotSingle('fig4_lineplot', data[0], data[1], 'dex_7dma', 'Nevada')
	fig4_select('Nevada')
})