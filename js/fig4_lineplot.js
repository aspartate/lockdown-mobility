/*
Module to draw line plot
 */

class LinePlotSingle {

    constructor(parentElement, data, lockdowns, metric, state) {
        this.parentElement = parentElement;
        this.data = data;
        this.lockdowns = lockdowns
        this.displayData = [];
        this.metric = metric;
        this.state = state
        this.st = Object.keys(stateAbbrev).find(key => stateAbbrev[key] === state)

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 100, right: 120, bottom: 220, left: 120};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        console.log(`Fig4 Width: ${vis.width}`)
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

        vis.yax = vis.svg.append("g")
            .attr("class", "y-axis axis")

        vis.xax = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        // Titles
        vis.titles = vis.svg.append('g')
            .attr("transform",`translate(${vis.width/2}, 0)`)

        vis.titles.append('text')
            .attr('class', 'areachart-title')
            .attr("fill", "#FFFFFF")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .text('Device Exposure Index for Nevada, 7-Day Moving Average')

        vis.titles.append('text')
            .attr('class', 'areachart-subtitle')
            .attr("transform",`translate(0, 25)`)
            .attr("fill", "#FFFFFF")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .text('January 20th, 2020 to December 31st, 2020')

        // vis.titles.append('text')
        //     .attr('class', 'areachart-subtitle')
        //     .attr("transform",`translate(0, 110)`)
        //     .attr("fill", "#d76868")
        //     .attr('text-anchor', 'middle')
        //     .style('font-family', 'Roboto Slab')
        //     .text('Mouseover to highlight, click for tooltip')

        // Timeline
        vis.timeline = vis.svg.append('g')
            .attr("transform",`translate(${vis.width/2}, ${vis.height + 120})`)
        vis.timeline
            .append('text')
            .attr('x', -500)
            .attr("fill", "#d76868")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 20)
            .text('March 5');
        vis.timeline
            .append('text')
            .attr('x', -500)
            .attr('y', 30)
            .attr("fill", "#d7d7d7")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 18)
            .text('First COVID case reported in Nevada')
            .call(wrap, 120)
        vis.timeline
            .append('text')
            .attr('x', -300)
            .attr("fill", "#d76868")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 20)
            .text('March 12');
        vis.timeline
            .append('text')
            .attr('x', -300)
            .attr('y', 30)
            .attr("fill", "#d7d7d7")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 18)
            .text('Governor declares state of emergency')
            .call(wrap, 120)
        vis.timeline
            .append('text')
            .attr('x', -100)
            .attr("fill", "#d76868")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 20)
            .text('March 15');
        vis.timeline
            .append('text')
            .attr('x', -100)
            .attr('y', 30)
            .attr("fill", "#d7d7d7")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 18)
            .text('First COVID death in Nevada, all schools close')
            .call(wrap, 120)
        vis.timeline
            .append('text')
            .attr('x', 100)
            .attr("fill", "#d76868")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 20)
            .text('March 18');
        vis.timeline
            .append('text')
            .attr('x', 100)
            .attr('y', 30)
            .attr("fill", "#d7d7d7")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 18)
            .text('All casinos close')
            .call(wrap, 120)
        vis.timeline
            .append('text')
            .attr('x', 300)
            .attr("fill", "#d76868")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 20)
            .text('March 24');
        vis.timeline
            .append('text')
            .attr('x', 300)
            .attr('y', 30)
            .attr("fill", "#d7d7d7")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 18)
            .text('Indoor gatherings of >10 people are banned')
            .call(wrap, 120)
        vis.timeline
            .append('text')
            .attr('x', 500)
            .attr("fill", "#d76868")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 20)
            .text('April 1');
        vis.timeline
            .append('text')
            .attr('x', 500)
            .attr('y', 30)
            .attr("fill", "#d7d7d7")
            .attr('text-anchor', 'middle')
            .style('font-family', 'Roboto Slab')
            .style('font-size', 18)
            .text('Statewide lockdown begins')
            .call(wrap, 120)

        // Transparent field to allow clickout
        vis.field = vis.svg.append('rect')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', vis.width)
            .attr('height', vis.height)

        // Tooltip components
        vis.tool_tip = vis.svg.append('g')
            .attr('class', 'fig4_tool_tip')
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
            .attr('class', 'fig4_tool_tip_state')
            .attr("fill", "#FFFFFF")
            .style('font-family', 'Roboto Slab')
            .style('font-weight', 'bold')

        vis.tool_tip.append('text')
            .attr('y', 140)
            .attr('class', 'fig4_tool_tip_date')
            .attr("fill", "#FFFFFF")
            .style('font-family', 'Roboto Slab')

        vis.tool_tip.append('text')
            .attr('y', 160)
            .attr('class', 'fig4_tool_tip_metric')
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

        // Create dictionary object of state colors, using colorArray found in fig4_utils.js
        vis.keys = Array.from(vis.displayData.keys())
        vis.colors = {}
        for (let i=0; i < vis.keys.length; i++) {
            vis.colors[vis.keys[i]] = colorArray[i]
        }

        vis.displayStates = state_populations.map(a => a.state)

        vis.displayData = new Map(Array.from(vis.displayData).filter(function([key, value]) {return vis.displayStates.includes(stateAbbrev[key])}))

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        // Clear chart
        vis.svg.selectAll('path').remove()

        // Update domain
        vis.x.domain(d3.extent(vis.filteredData, d => parseDate(d.date)));
        vis.y.domain([0, d3.max(vis.filteredData, d => +d[vis.metric])]);

        // Draw the lines
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
            .attr('class', function(d) {return `fig4_line_${stateAbbrev[d[0]]}`})

        // Mouse interaction
        // vis.lines
        //     // On mouseover, highlight line under mouse, also thicken line if no state is selected
        //     .on('mouseover', function(event, d){
        //         fig4_highlight(d[0])
        //     })
        //     // On mouseout, restore colors and thickness of all lines except selected one (if any)
        //     .on('mouseout', function(event, d){
        //         fig4_unhighlight(d[0])
        //     })

        vis.field
            // On mouseover of chart, if line selected, display tooltip in color of selected line
            .on('mouseover', function () {
                if (vis.st != 'None') {
                    d3.select('.fig4_tool_tip').attr('display', null)
                    vis.tool_tip_line.attr('stroke', vis.colors[vis.st])
                    vis.tool_tip_dot.attr('stroke', vis.colors[vis.st])
                }})
            // On mouseout of chart, hide tooltip
            .on('mouseout', function () {d3.select('.fig4_tool_tip').attr('display', 'none')})
            // On moving mouse within chart, if line selected, make tooltip follow mouse and show information for selected state
            .on('mousemove', function(event, d) {
                if (vis.st != 'None') {
                    d3.select('.fig4_tool_tip')
                        .attr('transform', 'translate(' + (d3.pointer(event)[0] + 3) + ', 0)') // 1 pixel offset to prevent mouseout from triggering when mouse is over tooltip
                        .raise()
                    // Move tooltip dot
                    vis.tooltip_date = vis.x.invert(d3.pointer(event)[0])
                    vis.bisectDate = d3.bisector(function (d) {return parseDate(d.date)}).left
                    vis.data_index = vis.bisectDate(vis.displayData.get(vis.st), vis.tooltip_date)
                    d3.select('.fig4_tool_tip_state').text(stateAbbrev[vis.st]).attr('text-anchor', 'start').attr('x', 10)
                    d3.select('.fig4_tool_tip_date').text(`${weekDays[vis.tooltip_date.getDay()]}, ${d3.timeFormat('%e %B %Y')(vis.tooltip_date)}`).attr('text-anchor', 'start').attr('x', 10)
                    d3.select('.fig4_tool_tip_metric').text(`${'DEX (7-Day Moving Average)'}: ${Math.round(d3.format(',')(vis.displayData.get(vis.st)[vis.data_index][vis.metric]))}`).attr('text-anchor', 'start').attr('x', 10)
                    if (vis.data_index > 270) {
                        d3.select('.fig4_tool_tip_state').attr('text-anchor', 'end').attr('x', -10)
                        d3.select('.fig4_tool_tip_date').attr('text-anchor', 'end').attr('x', -10)
                        d3.select('.fig4_tool_tip_metric').attr('text-anchor', 'end').attr('x', -10)
                    }
                    vis.tool_tip_dot.attr('cy', vis.y(vis.displayData.get(vis.st)[vis.data_index][vis.metric]))
                }
            })

        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis).raise();
        vis.svg.select(".x-axis").call(vis.xAxis).raise();

        // Bezier curves for timeline
        vis.timeline.append('path')
            .attr('id', 'beziertest')
            .attr('stroke', '#949494')
            .attr('stroke-width', 2)
            .attr('fill-opacity', 0)
            .attr('d', timeline_curve([[Math.round(vis.x(parseDate('2020-03-05')) - vis.width/2), -120], [-500, -20]]))
        vis.timeline.append('path')
            .attr('id', 'beziertest')
            .attr('stroke', '#949494')
            .attr('stroke-width', 2)
            .attr('fill-opacity', 0)
            .attr('d', timeline_curve([[Math.round(vis.x(parseDate('2020-03-12')) - vis.width/2), -120], [-300, -20]]))
        vis.timeline.append('path')
            .attr('id', 'beziertest')
            .attr('stroke', '#949494')
            .attr('stroke-width', 2)
            .attr('fill-opacity', 0)
            .attr('d', timeline_curve([[Math.round(vis.x(parseDate('2020-03-15')) - vis.width/2), -120], [-100, -20]]))
        vis.timeline.append('path')
            .attr('id', 'beziertest')
            .attr('stroke', '#949494')
            .attr('stroke-width', 2)
            .attr('fill-opacity', 0)
            .attr('d', timeline_curve([[Math.round(vis.x(parseDate('2020-03-18')) - vis.width/2), -120], [100, -20]]))
        vis.timeline.append('path')
            .attr('id', 'beziertest')
            .attr('stroke', '#949494')
            .attr('stroke-width', 2)
            .attr('fill-opacity', 0)
            .attr('d', timeline_curve([[Math.round(vis.x(parseDate('2020-03-24')) - vis.width/2), -120], [300, -20]]))
        vis.timeline.append('path')
            .attr('id', 'beziertest')
            .attr('stroke', '#949494')
            .attr('stroke-width', 2)
            .attr('fill-opacity', 0)
            .attr('d', timeline_curve([[Math.round(vis.x(parseDate('2020-04-01')) - vis.width/2), -120], [500, -20]]))


    }

}

