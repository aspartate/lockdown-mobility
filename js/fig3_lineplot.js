/*
Module to draw line plot
 */

class LinePlotViolin {

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

        vis.margin = {top: 30, right: 0, bottom: 20, left: 180};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        console.log(`Fig3-Left Width: ${vis.width}`)
        vis.height = window.innerHeight*0.7 - vis.margin.top - vis.margin.bottom;


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

        vis.yax = vis.svg.append("g")
            .attr("class", "y-axis axis")

        vis.xax = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        // // Autocomplete search box
        //
        // // Add searchbox
        // vis.search = vis.svg
        //     .append("foreignObject")
        //     .attr("transform",`translate(${vis.width/2 - 100}, 70)`)
        //     .attr("width", 200)
        //     .attr("height", 500)
        //     .html(function(d) {
        //         return '<div>' + '<form autoComplete="off" action="/action_page.php">' + '<div className="autocomplete" >' + '<input id="myInput" type="text" name="myCountry" placeholder="Search for a state">' + '</div>' + '</form>' + '</div>'
        //     })

        // Titles
        vis.titles = vis.svg.append('g')
            .attr("transform",`translate(${vis.width/2}, 0)`)

        vis.titles.append('text')
            .attr('class', 'areachart-title')
            .attr("fill", "#FFFFFF")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .text('Device Exposure Index, 7-Day Moving Average')

        vis.titles.append('text')
            .attr('class', 'areachart-subtitle')
            .attr("transform",`translate(0, 25)`)
            .attr("fill", "#FFFFFF")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .text('January 20th, 2020 to December 31st, 2020')

        vis.titles.append('text')
            .attr('class', 'areachart-subtitle')
            .attr("transform",`translate(0, 110)`)
            .attr("fill", "#d76868")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .text('Mouseover to highlight, click for tooltip')

        // Transparent field to allow clickout
        vis.field = vis.svg.append('rect')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', vis.width)
            .attr('height', vis.height)

        // Tooltip components
        vis.tool_tip = vis.svg.append('g')
            .attr('class', 'fig3_tool_tip')
            .attr('display', 'none')

        vis.tool_tip_line = vis.tool_tip.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', vis.height)
            .attr('stroke-width', 2)

        vis.tool_tip_dot = vis.tool_tip.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('stroke-width', 3)
            .attr('fill', '#d9d9d9')
            // .attr('fill-opacity', '0')
            .attr('r', 8)

        vis.tool_tip.append('text')
            .attr('y', 120)
            .attr('class', 'fig3_tool_tip_state')
            .attr("fill", "#FFFFFF")
            .style('font-family', 'Roboto Slab')
            .style('font-weight', 'bold')

        vis.tool_tip.append('text')
            .attr('y', 140)
            .attr('class', 'fig3_tool_tip_date')
            .attr("fill", "#FFFFFF")
            .style('font-family', 'Roboto Slab')

        vis.tool_tip.append('text')
            .attr('y', 160)
            .attr('class', 'fig3_tool_tip_metric')
            .attr("fill", "#FFFFFF")
            .style('font-family', 'Roboto Slab')

        // Lockdown marker
        vis.lockdown_rect = vis.svg.append('rect')
            .attr('fill', '#b03535')
            .style('opacity', 0.3)
            .attr('y', 0)
            .attr('height', vis.height)
            .attr('display', 'none')

        vis.lockdown_text = vis.svg.append('text')
            .attr('fill', '#de8b8b')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(0, 200) rotate(-90)`)
            .text('LOCKDOWN')
            .style('font-size', 30)
            .style('font-family', 'Roboto Slab')
            .style('font-weight', 'bold')
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

        // Filter to dates of interest:
        vis.filteredData = []
        vis.data.forEach(row => {
            // and push rows with proper dates into displayData
            if (parseDate(row.date).getTime() < parseDate('2020-12-31').getTime()) {
                vis.filteredData.push(row);
            }
        });

        // group data by state, in preparation for filtering data by state
        vis.displayData = d3.group(vis.filteredData, d => d.state)

        // Create dictionary object of state colors, using colorArray found in fig3_utils.js
        vis.keys = Array.from(vis.displayData.keys())
        vis.colors = {}
        for (let i=0; i < vis.keys.length; i++) {
            vis.colors[vis.keys[i]] = colorArray[i]
        }

        if (fig3_selectedCategory == 'lockdown') {
            vis.displayStates = vis.lockdowns.filter(obj => {return +obj.Start != 0}).map(a => a.State)
        } else if (fig3_selectedCategory == 'nolockdown') {
            vis.displayStates = vis.lockdowns.filter(obj => {return +obj.Start == 0}).map(a => a.State)
        } else {
            vis.displayStates = state_populations.map(a => a.state)
        }

        // Autocomplete menu (https://www.w3schools.com/howto/howto_js_autocomplete.asp)
        autocomplete("fig3_automenu", vis.displayStates);
        // autocomplete function lives in main_utils.js

        // console.log(vis.displayStates)
        vis.displayData = new Map(Array.from(vis.displayData).filter(function([key, value]) {return vis.displayStates.includes(stateAbbrev[key])}))

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        foo = vis

        // Clear chart
        vis.svg.selectAll('path').remove()

        // vis.subtitle2.text(function() {
        //         if (selectedCategory == 'bottom10') {
        //             return 'Bottom 10 States by Population'
        //         } else if (selectedCategory == 'top10') {
        //             return 'Top 10 States by Population'
        //         } else if (selectedCategory == 'lockdown') {
        //             return 'States with Lockdown'
        //         } else if (selectedCategory == 'nolockdown') {
        //             return 'States without Lockdown'
        //         } else {
        //             return 'All States'
        //         }
        //     })

        // Update domain
        vis.x.domain(d3.extent(vis.filteredData, d => parseDate(d.date)));
        vis.y.domain([0, d3.max(vis.filteredData, d => +d[vis.metric])]);

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
            .attr('class', function(d) {return `fig3_line_${d[0]}`})

        // Mouse interaction
        vis.lines
            // On mouseover, highlight line under mouse, also thicken line if no state is selected
            .on('mouseover', function(event, d){
                fig3_highlight(d[0])
            })
            // On mouseout, restore colors and thickness of all lines except selected one (if any)
            .on('mouseout', function(event, d){
                fig3_unhighlight(d[0])
            })
            // On clicking line, highlight line and thicken, show lockdown period for that state
            .on('click', function(event, d){
                fig3_select(d[0])
            })

        vis.field
            // On clicking whitespace, unselect any selected lines and restore colors and thicknesses of all lines
            .on('click', function(event, d){
                fig3_deselect(fig3_selection)
            })
            // On mouseover of chart, if line selected, display tooltip in color of selected line
            .on('mouseover', function () {
                if (fig3_selection != 'None') {
                    d3.select('.fig3_tool_tip').attr('display', null)
                    vis.tool_tip_line.attr('stroke', vis.colors[fig3_selection])
                    vis.tool_tip_dot.attr('stroke', vis.colors[fig3_selection])
                }})
            // On mouseout of chart, hide tooltip
            .on('mouseout', function () {d3.select('.fig3_tool_tip').attr('display', 'none')})
            // On moving mouse within chart, if line selected, make tooltip follow mouse and show information for selected state
            .on('mousemove', function(event, d) {
                if (fig3_selection != 'None') {
                    d3.select('.fig3_tool_tip')
                        .attr('transform', 'translate(' + (d3.pointer(event)[0] + 3) + ', 0)') // 1 pixel offset to prevent mouseout from triggering when mouse is over tooltip
                        .raise()
                    // Move tooltip dot
                    vis.tooltip_date = vis.x.invert(d3.pointer(event)[0])
                    vis.bisectDate = d3.bisector(function (d) {return parseDate(d.date)}).left
                    vis.data_index = vis.bisectDate(vis.displayData.get(fig3_selection), vis.tooltip_date)
                    d3.select('.fig3_tool_tip_state').text(stateAbbrev[fig3_selection]).attr('text-anchor', 'start').attr('x', 10)
                    d3.select('.fig3_tool_tip_date').text(`${weekDays[vis.tooltip_date.getDay()]}, ${d3.timeFormat('%e %B %Y')(vis.tooltip_date)}`).attr('text-anchor', 'start').attr('x', 10)
                    d3.select('.fig3_tool_tip_metric').text(`${'DEX (7-Day Moving Average)'}: ${Math.round(d3.format(',')(vis.displayData.get(fig3_selection)[vis.data_index][vis.metric]))}`).attr('text-anchor', 'start').attr('x', 10)
                    if (vis.data_index > 270) {
                        d3.select('.fig3_tool_tip_state').attr('text-anchor', 'end').attr('x', -10)
                        d3.select('.fig3_tool_tip_date').attr('text-anchor', 'end').attr('x', -10)
                        d3.select('.fig3_tool_tip_metric').attr('text-anchor', 'end').attr('x', -10)
                    }
                    vis.tool_tip_dot.attr('cy', vis.y(vis.displayData.get(fig3_selection)[vis.data_index][vis.metric]))
                }
            })

        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis).raise();
        vis.svg.select(".x-axis").call(vis.xAxis).raise();

    }

    activate(state) {

    }

}