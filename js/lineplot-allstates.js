/*
Module to draw line plot
 */

class LinePlotAll {

    constructor(parentElement, data, lockdowns, metric) {
        this.parentElement = parentElement;
        this.data = data;
        this.lockdowns = lockdowns
        this.displayData = [];
        this.metric = metric;
        this.clickstatus = 'None'

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 100, right: 60, bottom: 20, left: 80};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        console.log(`CHART WIDTH: ${vis.width}`)
        vis.height = 800 - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(12);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append('text')
            .attr('class', 'areachart-title')
            .attr("transform",`translate(${vis.width/2}, -50)`)
            .attr("fill", "black")
            .attr('text-anchor', 'middle')
            .text('DEX over time')

        // Tooltip
        vis.field = vis.svg.append('rect')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', vis.width)
            .attr('height', vis.height)

        vis.tool_tip = vis.svg.append('g')
            .attr('class', 'tool_tip')
            .attr('display', 'none')

        vis.tool_tip_line = vis.tool_tip.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', vis.height)
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('class', 'tool_tip_line')

        vis.tool_tip.append('text')
            .attr('x', 10)
            .attr('y', 20)
            .attr('class', 'tool_tip_state')

        vis.tool_tip.append('text')
            .attr('x', 10)
            .attr('y', 40)
            .attr('class', 'tool_tip_date')

        vis.tool_tip.append('text')
            .attr('x', 10)
            .attr('y', 60)
            .attr('class', 'tool_tip_metric')

        // Lockdown markers
        vis.lockdown_rect = vis.svg.append('rect')
            .attr('fill', 'red')
            .style('opacity', 0.3)
            .attr('y', 0)
            .attr('height', vis.height)
            .attr('display', 'none')

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // construct JSON object
        // console.log(vis.data)
        vis.data[vis.metric] = +vis.data[vis.metric]
        vis.data.date = parseDate(vis.data.date)
        vis.displayData = d3.group(vis.data, d => d.state) // group data by state

        // Create dictionary object of state colors, using colorArray found in utils.js
        vis.keys = Array.from(vis.displayData.keys())
        vis.colors = {}
        for (let i=0; i < vis.keys.length; i++) {
            vis.colors[vis.keys[i]] = colorArray[i]
        }

        if (selectedCategory == 'bottom10') {
            state_populations.sort((a,b) => a.population - b.population)
            vis.displayStates = state_populations.slice(0, 10).map(a => a.state)
        } else if (selectedCategory == 'top10') {
            state_populations.sort((a,b) => b.population - a.population)
            vis.displayStates = state_populations.slice(0, 10).map(a => a.state)
        } else {
            vis.displayStates = state_populations.map(a => a.state)
        }

        console.log(vis.displayStates)
        vis.displayData = new Map(Array.from(vis.displayData).filter(function([key, value]) {return vis.displayStates.includes(stateAbbrev[key])}))
        console.log(vis.displayData)

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        foo = vis

        // Clear chart
        d3.selectAll('path').remove()

        // Update domain
        vis.x.domain(d3.extent(vis.data, d => parseDate(d.date)));
        vis.y.domain([0, d3.max(vis.data, d => +d[vis.metric])]);

        // Draw the line
        vis.lines = vis.svg.selectAll(".line")
            .data(vis.displayData)
            // .attr('class', 'plot-lines')
            .join("path")
                .attr("fill", "none")
                .attr("stroke", function(d){return vis.colors[d[0]] })
                .attr("stroke-width", 2)
                .attr("d", function(d) {
                    return d3.line()
                        .x(function (d) {return vis.x(parseDate(d.date))})
                        .y(function (d) {return vis.y(+d[vis.metric])})
                        (d[1])
                })
                .attr('id', function(d) {return `${vis.metric}_${d[0]}`})

        // Mouse interaction
        vis.lines
            // On mouseover, highlight line under mouse, also thicken line if no state is selected
            .on('mouseover', function(event, d){
                if (vis.clickstatus == 'None'){
                    vis.lines.attr('stroke', '#d4d4d4')
                    d3.select(this)
                        .attr("stroke", function(d){return vis.colors[d[0]] })
                        .attr("stroke-width", 4)
                        .raise()
                } else {
                    d3.select(this)
                        .attr("stroke", function(d){return vis.colors[d[0]] })
                        .attr("stroke-width", 2)
                        .raise()
                    // console.log(vis.clickstatus)
                }
            })
            // On mouseout, restore colors and thickness of all lines except selected one (if any)
            .on('mouseout', function(event, d){
                // console.log(vis.clickstatus)
                if (vis.clickstatus == 'None'){
                    vis.lines.attr("stroke", function(d){return vis.colors[d[0]] })
                        .attr("stroke-width", 2)
                } else {
                    // console.log(`#${vis.metric}_${d[0]}`)
                    vis.lines.attr('stroke', '#d4d4d4')
                    d3.select(`#${vis.metric}_${vis.clickstatus}`)
                        .attr("stroke", vis.colors[vis.clickstatus])
                        .attr("stroke-width", 4)
                        .raise()
                }
            })
            // On clicking line, highlight line and thicken, show lockdown period for that state
            .on('click', function(event, d){
                vis.lines.attr('stroke', '#d4d4d4') // Grey out all lines
                vis.clickstatus = d[0] // Record selected state
                // Show lockdown rect if lockdown period exists
                if (vis.lockdowns.filter(obj => {return obj.State == stateAbbrev[vis.clickstatus]})[0].Start == 0) {
                    vis.lockdown_start = 0
                    vis.lockdown_end = 0
                } else {
                    vis.lockdown_start = vis.x(parseDate(vis.lockdowns.filter(obj => {return obj.State == stateAbbrev[vis.clickstatus]})[0].Start))
                    vis.lockdown_end = vis.x(parseDate(vis.lockdowns.filter(obj => {return obj.State == stateAbbrev[vis.clickstatus]})[0].End))
                }
                vis.lockdown_rect
                    .attr('width', vis.lockdown_end - vis.lockdown_start)
                    .attr('x', vis.lockdown_start)
                    .attr('display', null)
                    .raise()
                vis.field.raise()
                // Highlight selected line and thicken
                d3.select(this)
                    .attr("stroke", function(d){return vis.colors[d[0]] })
                    .attr("stroke-width", 4)
                    .raise()

            })

        vis.field
            // On clicking whitespace, unselect any selected lines and restore colors and thicknesses of all lines
            .on('click', function(event, d){
                if (vis.clickstatus != 'None') {
                    // Hide lockdown rect
                    vis.lockdown_rect.attr('display', 'none')
                    // Restore colors and thicknesses of all lines
                    vis.lines.attr("stroke", function (d) {return vis.colors[d[0]]})
                        .attr("stroke-width", 2)
                        .raise()
                    // Hide tooltip
                    d3.select('.tool_tip').attr('display', 'none')
                    // Reset selected state
                    vis.clickstatus = 'None'
                }
            })
            // On mouseover of chart, if line selected, display tooltip in color of selected line
            .on('mouseover', function () {
                if (vis.clickstatus != 'None') {
                    d3.select('.tool_tip').attr('display', null)
                    vis.tool_tip_line.attr('stroke', vis.colors[vis.clickstatus])
                }})
            // On mouseout of chart, hide tooltip
            .on('mouseout', function () {d3.select('.tool_tip').attr('display', 'none')})
            // On moving mouse within chart, if line selected, make tooltip follow mouse and show information for selected state
            .on('mousemove', function(event, d) {
                if (vis.clickstatus != 'None') {
                    d3.select('.tool_tip')
                        .attr('transform', 'translate(' + (d3.pointer(event)[0] + 3) + ', 0)') // 1 pixel offset to prevent mouseout from triggering when mouse is over tooltip
                        .raise()
                    vis.tooltip_date = vis.x.invert(d3.pointer(event)[0])
                    vis.bisectDate = d3.bisector(function (d) {return parseDate(d.date)}).left
                    vis.data_index = vis.bisectDate(vis.displayData.get(vis.clickstatus), vis.tooltip_date)
                    d3.select('.tool_tip_state').text(stateAbbrev[vis.clickstatus])
                    d3.select('.tool_tip_date').text(`${weekDays[vis.tooltip_date.getDay()]}, ${d3.timeFormat('%e %B %Y')(vis.tooltip_date)}`)
                    d3.select('.tool_tip_metric').text(`DEX: ${d3.format(',')(vis.displayData.get(vis.clickstatus)[vis.data_index]['dex'])}`)
                }
            })

        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);

        foo = vis

    }

}

