// Implement violin plot with jitter (https://www.d3-graph-gallery.com/graph/violin_jitter.html)

// Date parser to convert strings to date objects
class ViolinPlot {

    constructor(parentElement, data, lockdowns, metric){
        this.parentElement = parentElement;
        this.data = data;
        this.lockdowns = lockdowns;
        this.metric = metric;
        this.displayData = [];

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 30, right: 160, bottom: 20, left: 80};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        console.log(`Fig3-Right Width: ${vis.width}`)
        vis.height = window.innerHeight*0.7 - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Transparent field to allow clickout
        vis.field = vis.svg.append('rect')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', vis.width)
            .attr('height', vis.height)

        // Build and Show the Y scale
        vis.y = d3.scaleLinear()
            .domain([0,600])          // Note that here the Y scale is set manually
            .range([vis.height, 0])
        vis.svg.append("g").call(d3.axisLeft(vis.y))

        // Build and Show the X scale
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .domain(['Lockdown', 'No Lockdown']) // Input column names here?
            .padding(0.05)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
        vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.x))

        vis.svg.append('text')
            .attr('class', 'violinplot-title')
            .attr("transform",`translate(${vis.width/2}, 0)`)
            .attr("fill", "#FFFFFF")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .text('Drop in DEX from February to April')

        // tooltip init
        vis.tooltip = d3.select('body').append('div')
            .attr('class', "tooltip")
            .attr('id', 'fig3_violinplotTooltip')

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // construct JSON object
        vis.data = d3.group(vis.data, d => d.state) // group data by state

        // For each state, push object to vis.displayData array
        for (let index in Array.from(vis.data.keys())) {
            let state = Array.from(vis.data.keys())[index] // get state name
            // Get maximum and minimum values of chosen metric
            let max_value = Math.max.apply(Math, vis.data.get(state)
                // filter data to February only
                .filter(obj => {return parseDate(obj.date).getTime() >= new Date('02/01/2020').getTime() && parseDate(obj.date).getTime() < new Date('03/01/2020').getTime()})
                .map( obj => {return +obj[vis.metric]})) // max value of metric for that state
            let min_value = Math.min.apply(Math, vis.data.get(state)
                // filter data to April only
                .filter(obj => {return parseDate(obj.date).getTime() >= new Date('04/01/2020').getTime() && parseDate(obj.date).getTime() < new Date('05/01/2020').getTime()})
                .map( obj => {return +obj[vis.metric]})) // min value of metric for that state
            // Get indices of max and min values in data for each state
            let max_index = vis.data.get(state).map( obj => {return +obj[vis.metric]}).indexOf(max_value)
            let min_index = vis.data.get(state).map( obj => {return +obj[vis.metric]}).indexOf(min_value)
            // Get dates of max and min values in data for each state
            let max_date = parseDate(vis.data.get(state)[max_index].date)
            let min_date = parseDate(vis.data.get(state)[min_index].date)
            // console.log(vis.lockdowns.filter(obj => {return obj.State == stateAbbrev[state]})[0].Start == 0)
            let lockdown_status
            if (vis.lockdowns.filter(obj => {return obj.State == stateAbbrev[state]})[0].Start == 0) {
                lockdown_status = 'No Lockdown'
            } else {
                lockdown_status = 'Lockdown'
            }

            // Load data into object and push
            let state_data = {
                state: state,
                delta: max_value - min_value,
                max_value: max_value,
                min_value: min_value,
                max_date: max_date,
                min_date: min_date,
                max_index: max_index,
                min_index: min_index,
                lockdown_status: lockdown_status
            }
            vis.displayData.push(state_data)
        }

        vis.updateVis()
    }

    updateVis() {
        let vis = this

        // Features of the histogram
        let histogram = d3.histogram()
            .domain(vis.y.domain())
            .thresholds(vis.y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d)

        // Compute the binning for each group of the dataset
        let sumstat = //d3.group(vis.displayData, d => {return d.lockdown_status})
            Array.from(d3.rollup(vis.displayData, function (d) {
                let input = d.map(function(d) { return d.delta})
                let bins = histogram(input)   // And compute the binning on it.
                return bins
            },
            d => {return d.lockdown_status}))

        // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
        let maxNum = 0
        for (let i in sumstat ){
            let allBins = sumstat[i][1]
            let lengths = allBins.map(function(a){return a.length;})
            let longest = d3.max(lengths)
            if (longest > maxNum) { maxNum = longest }
        }

        // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
        let xNum = d3.scaleLinear()
            .range([0, vis.x.bandwidth()])
            .domain([-maxNum,maxNum])

        // Color scale for dots
        let myColor = d3.scaleSequential()
            .interpolator(d3.interpolateReds)
            .domain([0,600])

        // Add the shape to this svg
        vis.svg
            .selectAll("myViolin")
            .data(sumstat)
            .enter()        // So now we are working group per group
            .append("g")
            .attr("transform", function(d){ return("translate(" + vis.x(d[0]) +" ,0)") } ) // Translation on the right to be at the group position
            .append("path")
            .datum(function(d){ return(d[1])})     // So now we are working bin per bin
            .style("stroke", "none")
            .style("fill",colorArray[0])
            .attr("d", d3.area()
                .x0( xNum(0) )
                .x1(function(d){ return(xNum(d.length)) } )
                .y(function(d){ return(vis.y(d.x0)) } )
                .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            )

        // Add individual points with jitter
        vis.points = vis.svg
            .selectAll("indPoints")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("cx", function(d){return(vis.x(d.lockdown_status) + vis.x.bandwidth()/2 - Math.random()*40)})
            .attr("cy", function(d){return(vis.y(d.delta))})
            .attr("r", 5)
            .style("fill", function(d){ return(myColor(d.delta))})
            .attr("stroke", "gray")
            .attr('id', function(d) {return `violinplot_${d.state}`})
            .on('mouseover', function(event, d){
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .style('display', null)
                    .html(`
                         <div style="border: #383838; border-radius: 0px; background: #383838; padding: 20px; font-family: Roboto Slab; color: #e5e5e5">
                             <h4> <b>${stateAbbrev[d.state]}</b><h3>
                             <h6> <b>Population:</b> ${d3.format(",")(state_populations.filter(function (obj) {
                        return obj.state === stateAbbrev[d.state]
                    })[0].population)}</h6>
                             <h6> <b>Max DEX in February:</b> ${Math.floor(d.max_value)} </h6>
                             <h6> <b>Date of max DEX:</b> ${d3.timeFormat('%Y %B %d')(d.max_date)} </h6>
                             <h6> <b>Min DEX in April:</b> ${Math.floor(d.min_value)} </h6>
                             <h6> <b>Date of max DEX:</b> ${d3.timeFormat('%Y %B %d')(d.min_date)} </h6>
                             <h6> <b>DEX drop:</b> ${Math.floor(d.delta)} </h6>
                         </div>`);

                // Trigger state highlight in line chart
                vis.hoverState = d.state
                if (fig3_lineplot.displayStates.includes(stateAbbrev[vis.hoverState])) {
                    fig3_highlight(vis.hoverState)
                } else {
                    fig3_switchCategory() // see fig3_utils.js
                    fig3_highlight(vis.hoverState)
                }
            })
            .on('mouseout', function(event, d){
                fig3_unhighlight(vis.hoverState)
            })
            .on('click', function(event, d){
                if (fig3_lineplot.displayStates.includes(stateAbbrev[vis.hoverState])) {
                    fig3_select(vis.hoverState)
                } else {
                    fig3_switchCategory() // see fig3_utils.js
                    fig3_select(vis.hoverState)
                }

            })

        vis.field
            .on('click', function(event, d){
                fig3_deselect(fig3_selection)
            })
    }

}