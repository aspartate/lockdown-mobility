/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    // constructor method to initialize Timeline object
    constructor(parentElement, data, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.data = data;
        this.displayData = [];

        this.initVis()
    }

    initVis() {
        let vis = this

        vis.margin = {top: 20, right: 40, bottom: 20, left: 0};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        console.log(`Fig1-Right Width: ${vis.width}`)
        vis.height = window.innerHeight*0.8 - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.projection = d3.geoAlbersUsa().translate([vis.width / 2, vis.height / 2]).scale([vis.width*1.2]);
        vis.path = d3.geoPath().projection(vis.projection);
        vis.convertedData = topojson.feature(vis.geoData, vis.geoData.objects.states).features

        // Transparent field to allow clickout
        vis.field = vis.svg.append('rect')
            .attr('fill', 'transparent')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', vis.width)
            .attr('height', vis.height)

        // Plot states
        vis.states = vis.svg.selectAll(".state")
            .data(vis.convertedData)
            .enter()
            .append("path")
            .attr('class', 'state')
            .attr('id', function(d) {return `fig1_map_${Object.keys(stateAbbrev).find(key => stateAbbrev[key] === d.properties.name)}`})
            .attr("d", vis.path)

        // tooltip init
        vis.tooltip = d3.select('body').append('div')
            .attr('class', "tooltip")
            .attr('id', 'fig1_mapTooltip')

        // Simple slider from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
        vis.sliderTime = vis.svg.append('text')
            .attr('x', 70)
            .attr('y', 107)
            .style('fill', 'white')
            .style('font-family', 'Roboto Slab')


        vis.selectedDate = dateListDex[0]
        vis.slider = d3
            .sliderBottom()
            .min(d3.min(dateListDex))
            .max(d3.max(dateListDex))
            .step(1000 * 60 * 60 * 24)
            .width(300)
            .tickFormat(d3.timeFormat('%b'))
            .ticks(6)
            .default(new Date(2020, 0, 20))
            .on('onchange', val => {
                vis.sliderTime.text(d3.timeFormat('%Y %b %d')(val));
                vis.selectedDate = dateListDex[(val.getTime() - d3.min(dateListDex).getTime())/(1000 * 60 *60 *24)]
                vis.displayData = []
                vis.wrangleData()
            });

        vis.gTime = vis.svg
            .append('g')
            .attr('transform', 'translate(200,100)');

        vis.gTime.call(vis.slider);
        // Initialize date
        vis.sliderTime.text(d3.timeFormat('%Y %b %d')(vis.slider.value()))

        // Define colorscale
        vis.colorScale = d3.scaleLinear()
            .domain([0, d3.max(vis.data, function(d) { return +d.dex_7dma})])
            .range(["#ffffff", "#8f1616", "#280000"])
        //.interpolate(d3.interpolateHcl);

        // Gradient-fill legend from http://bl.ocks.org/nbremer/62cf60e116ae821c06602793d265eaf6
        //Extra scale since the color scale is interpolated
        vis.countScale = d3.scaleLinear()
            .domain([0, d3.max(vis.data, function(d) {return +d.dex_7dma; })])
            .range([0, vis.width])

        //Calculate the variables for the temp gradient
        vis.numStops = 10;
        vis.countRange = vis.countScale.domain();
        vis.countRange[2] = vis.countRange[1] - vis.countRange[0];
        vis.countPoint = [];
        for(let i = 0; i < vis.numStops; i++) {
            vis.countPoint.push(i * vis.countRange[2]/(vis.numStops-1) + vis.countRange[0]);
        }

        //Create the gradient
        vis.svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-dex")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%")
            .selectAll("stop")
            .data(d3.range(vis.numStops))
            .enter().append("stop")
            .attr("offset", function(d,i) {
                return vis.countScale( vis.countPoint[i] )/vis.width;
            })
            .attr("stop-color", function(d,i) {
                return vis.colorScale( vis.countPoint[i] );
            });

        vis.legendWidth = vis.width*0.9;
        //Color Legend container
        vis.legendsvg = vis.svg.append("g")
            .attr("class", "legendWrapper")
            .attr('transform', `translate(${vis.width/2}, ${vis.height - 50})`)

        //Draw the Rectangle
        vis.legendsvg.append("rect")
            .attr("class", "legendRect")
            .attr("x", -vis.legendWidth/2)
            .attr("y", 0)
            .attr("width", vis.legendWidth)
            .attr("height", 10)
            .style("fill", "url(#legend-dex)");

        //Append title
        vis.legendsvg.append("text")
            .attr("class", "legendTitle")
            .attr("x", 0)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .style('fill', 'white')
            .style('font-family', 'Roboto Slab')
            .text("DEX (7-day moving average)");

        //Set scale for x-axis
        vis.xScale = d3.scaleLinear()
            .range([-vis.legendWidth/2, vis.legendWidth/2])
            .domain([ 0, d3.max(vis.data, function(d) { return +d.dex_7dma})] );

        //Define x-axis
        vis.xAxis = d3.axisBottom()
            .ticks(5)
            //.tickFormat(formatPercent)
            .scale(vis.xScale);

        //Set up X axis
        vis.legendsvg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (10) + ")")
            .call(vis.xAxis);


        // wrangleData
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this

        // first, filter according to vis.selectedDate
        // iterate over all rows of dex data
        vis.data.forEach(row => {
            // and push rows with proper dates into displayData
            if (parseDate(row.date).getTime() == vis.selectedDate.getTime()) {
                vis.displayData.push(row);
            }
        });

        // console.log('final data structure for map', vis.displayData);

        vis.updateVis()

    }

    updateVis() {
        let vis = this;

        vis.states
            .style("fill", function(d) {
                try {
                    return vis.colorScale(vis.displayData.filter(function (obj) {
                        return stateAbbrev[obj.state] === d.properties.name
                    })[0]['dex'])
                } catch {
                    // console.log(`${d.properties.name} does not exist in data`)
                }
            })
            .on('mouseover', function(event, d){
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .style('display', null)
                    .html(`
                         <div style="border: #383838; border-radius: 0px; background: #383838; padding: 20px; font-family: Roboto Slab; color: #e5e5e5">
                             <h4> <b>${stateAbbrev[vis.displayData.filter(function (obj) {
                        return stateAbbrev[obj.state] === d.properties.name
                    })[0].state]}</b><h4>
                             <h6> <span style="color: #d76868"><b>Population:</b></span> ${d3.format(",")(state_populations.filter(function (obj) {
                        return obj.state === d.properties.name
                    })[0].population)}</h6>
                             <h6> <span style="color: #d76868"><b>DEX (7-day moving average):</b></span> ${Math.round(vis.displayData.filter(function (obj) {
                        return stateAbbrev[obj.state] === d.properties.name
                    })[0].dex_7dma)}</h6>
                             <h6> <span style="color: #d76868"><b>DEX (normalized per 100,000 residents):</b></span> ${Math.round(vis.displayData.filter(function (obj) {
                        return stateAbbrev[obj.state] === d.properties.name
                    })[0].dex_7dma * 100000 / state_populations.filter(function (obj) {
                        return obj.state === d.properties.name
                    })[0].population * 100)/100}</h6>
                         </div>`);

                // Trigger state highlight in line chart
                vis.hoverState = Object.keys(stateAbbrev).find(key => stateAbbrev[key] === d.properties.name);
                fig1_highlight(vis.hoverState)

            })
            .on('mouseout', function(event, d){
                fig1_unhighlight(vis.hoverState)

            })
            .on('click', function(event, d){
                fig1_select(vis.hoverState)
            })

        vis.field
            .on('click', function(event, d){
                fig1_deselect(fig1_selection)
            })

    }
}