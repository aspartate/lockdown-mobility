/*
Module to draw line plot
 */

class LinePlot {

    constructor(parentElement, data, metric) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.metric = metric;
        this.clickstatus = 'None'

        this.initVis();
    }


    /*
     * Initialize visualization (static content; e.g. SVG area, axes, brush component)
     */

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

        vis.tool_tip.append('line')
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
        console.log(vis.displayData)

        // Create dictionary object of state colors
        vis.keys = Array.from(vis.displayData.keys())
        vis.values = ['#c0c0c0',
            '#2f4f4f',
            '#556b2f',
            '#a0522d',
            '#2e8b57',
            '#228b22',
            '#800000',
            '#708090',
            '#808000',
            '#483d8b',
            '#cd853f',
            '#4682b4',
            '#9acd32',
            '#20b2aa',
            '#cd5c5c',
            '#4b0082',
            '#32cd32',
            '#daa520',
            '#8fbc8f',
            '#8b008b',
            '#9932cc',
            '#ff4500',
            '#ff8c00',
            '#ffd700',
            '#ffff00',
            '#0000cd',
            '#deb887',
            '#00ff00',
            '#00ff7f',
            '#e9967a',
            '#dc143c',
            '#00ffff',
            '#00bfff',
            '#0000ff',
            '#a020f0',
            '#adff2f',
            '#ff7f50',
            '#ff00ff',
            '#db7093',
            '#f0e68c',
            '#6495ed',
            '#dda0dd',
            '#90ee90',
            '#ff1493',
            '#7b68ee',
            '#afeeee',
            '#ee82ee',
            '#7fffd4',
            '#ff69b4',
            '#ffb6c1']
        vis.colors = {}
        for (let i=0; i < vis.keys.length; i++) {
            vis.colors[vis.keys[i]] = vis.values[i]
        }
        // Update the visualization
        vis.updateVis();
    }



    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

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
            // On mouseover, highlight line under mouse
            .on('mouseover', function(event, d){
                if (vis.clickstatus == 'None'){
                    vis.lines.attr('stroke', '#d4d4d4')
                    d3.select(this)
                        .attr("stroke", function(d){return vis.colors[d[0]] })
                        .raise()
                } else {
                    d3.select(this)
                        .attr("stroke", function(d){return vis.colors[d[0]] })
                        .raise()
                    // console.log(vis.clickstatus)
                }
            })
            // On mouseout, restore colors of all lines
            .on('mouseout', function(event, d){
                // console.log(vis.clickstatus)
                if (vis.clickstatus == 'None'){
                    vis.lines.attr("stroke", function(d){return vis.colors[d[0]] })
                } else {
                    // console.log(`#${vis.metric}_${d[0]}`)
                    vis.lines.attr('stroke', '#d4d4d4')
                    d3.select(`#${vis.metric}_${vis.clickstatus}`).attr("stroke", vis.colors[vis.clickstatus]).raise()
                }
            })
            // On clicking line, highlight line
            .on('click', function(event, d){
                vis.lines.attr('stroke', '#d4d4d4')
                d3.select(this)
                    .attr("stroke", function(d){return vis.colors[d[0]] })
                    .raise()
                vis.clickstatus = d[0]
                // console.log(`Selected ${vis.clickstatus}`)
            })

        vis.field
            // On clicking whitespace, unselect line and restore colors of all lines
            .on('click', function(event, d){
                if (vis.clickstatus != 'None') {
                    // console.log('Unselect all')
                    vis.lines.attr("stroke", function (d) {
                        return vis.colors[d[0]]
                    })
                    vis.clickstatus = 'None'
                }
            })
            .on('mouseover', function () {
                if (vis.clickstatus != 'None') {
                    d3.select('.tool_tip').attr('display', null)
                }})
            .on('mouseout', function () {d3.select('.tool_tip').attr('display', 'none')})
            .on('mousemove', function(event, d) {
                d3.select('.tool_tip')
                    .attr('transform', 'translate('+ (d3.pointer(event)[0] + 3) +', 0)') // 1 pixel offset to prevent mouseout from triggering when mouse is over tooltip
                    .raise()
                // console.log(vis.clickstatus)
                vis.tooltip_date = vis.x.invert(d3.pointer(event)[0])
                // console.log(vis.displayData.get(vis.clickstatus))
                vis.bisectDate = d3.bisector( function(d) {return d.date}).left
                vis.data_index = vis.bisectDate(vis.displayData.get(vis.clickstatus), vis.tooltip_date)
                console.log(vis.displayData.get(vis.clickstatus))
                d3.select('.tool_tip_state').text(vis.clickstatus)
                d3.select('.tool_tip_date').text(d3.timeFormat('%e %B %Y')(vis.tooltip_date))
                d3.select('.tool_tip_metric').text(d3.format(',')(vis.displayData.get(vis.clickstatus)[vis.data_index][vis.metric]))
            })

        //
        // // D3 area path generator
        // vis.area = d3.area()
        //     .curve(d3.curveCardinal)
        //     .x(function (d) {
        //         return vis.x(d[0]);
        //     })
        //     .y0(vis.height)
        //     .y1(function (d) {
        //         return vis.y(d[1]);
        //     });
        //
        //
        // // Call the area function and update the path
        // // D3 uses each data point and passes it to the area function. The area function translates the data into positions on the path in the SVG.
        // vis.timePath
        //     .datum(vis.displayData)
        //     .attr("d", vis.area);


        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);

        foo = vis

    }

}

