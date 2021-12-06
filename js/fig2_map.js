// ALL LINES BELOW ARE NEW
class flowmapVis {

    constructor(parentElement, geoData, lex_data, dex_data, date) {
        this.parentElement = parentElement;
        this.lex_data = lex_data;
        this.dex_data = dex_data;
        this.geoData = geoData;
        this.selectedDate = date;
        this.displayDataDex = [];
        this.displayDataLex = []
        this.initVis()
    }


    initVis() {
        let vis = this

        vis.margin = {top: 0, right: 100, bottom: 5, left: -100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        console.log(`Fig2-Right Width: ${vis.width}`)
        vis.height = window.innerHeight*0.7 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)

        vis.svg.append("defs")
            .append("marker")
            .attr("id", "arrowhead")
            .attr("markerWidth", "7")
            .attr("markerHeight", "7")
            .attr("refX", "6")
            .attr("refY", "3.5")
            .attr("orient", "auto")
            .append("polygon")
            .attr("points", "0 0, 5 3.5, 0 7")
            .style("fill", "rgb(0,0,0)")

        vis.projection = d3.geoAlbersUsa().translate([vis.width / 2, vis.height / 2]).scale([vis.width*1]);
        vis.path = d3.geoPath().projection(vis.projection);
        vis.convertedData = topojson.feature(vis.geoData, vis.geoData.objects.states).features

        // Reset view when click on blank space
        vis.svg.on('click', function (event, d) {
            if (event.path[0].id === "") {
                reset_view()
            }
        })

        // Plot states
        vis.states = vis.svg.selectAll(".states")
            .data(vis.convertedData)
            .enter()
            .append("path")
            .attr('class', 'states')
            .attr('id', function (d) {
                return d.properties.name.replaceAll(' ', '')})
            .attr("d", vis.path)

        // tooltip init
        vis.tooltip = d3.select('body').append('div')
            .attr('class', "tooltip")
            .attr('id', 'fig2_mapTooltip')

        // Legend shown when state is clicked
        vis.linkLegend = vis.svg.append('g')
            .attr('transform', `translate(${vis.width/2 - 160},${vis.height - 135})`)
            .attr('display', 'none')
        vis.linkLegend.append('rect')
            .attr('width', 320)
            .attr('height', 63)
            .attr('fill', '#eaeaea')
        vis.linkLegend.append('text')
            .attr('x', 10)
            .attr('y', 25)
            .attr('font-family', 'Roboto Slab')
            .attr('fill', '#424242')
            .text('Top 5 Incoming Connections')
        vis.linkLegend.append('text')
            .attr('x', 10)
            .attr('y', 50)
            .attr('font-family', 'Roboto Slab')
            .attr('fill', '#424242')
            .text('Top 5 Outgoing Connections')
        vis.linkLegend.append('line')
            .attr("x1", 250)
            .attr("y1", 20)
            .attr("x2", 300)
            .attr("y2", 20)
            .style("stroke", "#6c6c6c")
            .style("stroke-width", "3")
        vis.linkLegend.append('circle')
            .attr('cx', 250)
            .attr('cy', 20)
            .attr('r', 5)
            .attr('fill', '#d76868')
        vis.linkLegend.append('circle')
            .attr('cx', 300)
            .attr('cy', 20)
            .attr('r', 5)
            .attr('fill', '#d76868')
        vis.linkLegend.append('line')
            .attr("x1", 250)
            .attr("y1", 45)
            .attr("x2", 300)
            .attr("y2", 45)
            .style("stroke", "#d76868")
            .style("stroke-width", "2")
        vis.linkLegend.append('circle')
            .attr('cx', 250)
            .attr('cy', 45)
            .attr('r', 5)
            .attr('fill', '#d76868')
        vis.linkLegend.append('circle')
            .attr('cx', 300)
            .attr('cy', 45)
            .attr('r', 5)
            .attr('fill', '#d76868')

        // Simple slider from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
        vis.sliderTime = vis.svg.append('text')
            .attr('x', 100)
            .attr('y', 77)
            .style('fill', 'white')
            .style('font-family', 'Roboto Slab')

        vis.slider = d3
            .sliderBottom()
            .min(d3.min(dateListLex))
            .max(d3.max(dateListLex))
            .step(1000 * 60 * 60 * 24)
            .width(300)
            .tickFormat(d3.timeFormat('%b'))
            .ticks(6)
            .default(new Date(2020, 0, 22))
            .on('onchange', val => {
                reset_view()
                vis.displayDataDex = []
                vis.displayDataLex = []
                vis.sliderTime.text(d3.timeFormat('%Y %b %d')(val));
                vis.bisect = d3.bisector(function (d) {return d}).left
                vis.bisect_index = vis.bisect(dateListLex, val)
                vis.selectedDate = dateListLex[vis.bisect_index]
                vis.wrangleData()

                fig2_matrix.wrangleData(vis.selectedDate)
            });

        vis.gTime = vis.svg
            .append('g')
            .attr('transform', 'translate(250,70)');

        vis.gTime.call(vis.slider);
        // Initialize date
        vis.sliderTime.text(d3.timeFormat('%Y %b %d')(vis.slider.value()))

        // Define colorscale
        vis.colorScale = d3.scaleLinear()
            .domain([0, d3.max(vis.dex_data, function(d) { return +d.dex_7dma})])
            .range(["#ffffff", "#8f1616", "#280000"])

        // Gradient-fill legend from http://bl.ocks.org/nbremer/62cf60e116ae821c06602793d265eaf6
        //Extra scale since the color scale is interpolated
        vis.countScale = d3.scaleLinear()
            .domain([0, d3.max(vis.dex_data, function(d) {return +d.dex_7dma; })])
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
            .attr('transform', `translate(${vis.width/2}, ${vis.height - 30})`)

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
            .domain([ 0, d3.max(vis.dex_data, function(d) { return +d.dex_7dma})] );

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

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this

        // Filter DEX data by selectedDate
        vis.dex_data.forEach(row => {
            // and push rows with proper dates into displayDataDex
            if (parseDate(row.date).getTime() === vis.selectedDate.getTime()) {
                vis.displayDataDex.push(row);
            }
        });

        // Filter LEX data by selected date
        vis.lex_data.forEach(row => {
            // and push rows with proper dates into displayDataLex
            if (parseDateLex(row.DATE).getTime() === vis.selectedDate.getTime()) {
                vis.displayDataLex.push(row);
            }
        });

        vis.states
            .style("fill", function(d) {
                try {
                    return vis.colorScale(vis.displayDataDex.filter(function (obj) {
                        return stateAbbrev[obj.state] === d.properties.name
                    })[0]['dex'])
                } catch {
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
                             <h4> <b>${d.properties.name}</b><h3>
                             <h6> <span style="color: #d76868"><b>Population:</b></span> ${d3.format(",")(state_populations.filter(function (obj) {
                                return obj.state === d.properties.name
                             })[0].population)}</h6>
                             <h6> <span style="color: #d76868"><b>DEX (7-day moving average):</b></span> ${Math.round(vis.displayDataDex.filter(function (obj) {
                        return stateAbbrev[obj.state] === d.properties.name
                    })[0].dex_7dma)}</h6>
                             <h6> Click to see top interstate connections </h6>
                         </div>`);
                d3.select(this).attr("fill-opacity", "80%")

            })
            .on('mouseout', function(event, d){
                vis.tooltip.style('display', 'none')
                if (vis.selected_state != d.properties.name) {
                    d3.select(this).attr("fill-opacity", "100%")
                }
            })
            .on('click', function (event, d) {
                reset_view()

                vis.selected_state = d.properties.name

                vis.selected_state_path = document.getElementById(vis.selected_state.replaceAll(' ', ''))
                vis.selected_state_path.setAttribute("fill-opacity", "50%")

                let selected_centroid = plot_centroid(vis.selected_state, vis.selected_state_path)


                vis.statesTo = []
                vis.statesFrom = []

                vis.state_abbr = Object.keys(stateAbbrev).find(key => stateAbbrev[key] === vis.selected_state)

                vis.displayDataLex.forEach((d0, i0) => {
                    delete d0.INDEX
                    delete d0.DC
                    let row = []
                    for (let i = 0; i < Object.keys(d0).length; i++) {
                        let state = Object.keys(d0)[i]
                        row.push(d0[state])


                    }
                    if (d0.STATE_PRE !== "DC") {
                        vis.statesFrom.push(d0)
                    }
                    if (d0.STATE_PRE === vis.state_abbr) {
                        vis.statesTo.push(d0)
                    }

                })

                let all_states_from = {}
                vis.statesFrom.forEach(d => {
                    for (let [key, val] of Object.entries(d)) {
                        if (key === vis.state_abbr && d.STATE_PRE !== vis.state_abbr) {
                            all_states_from[d.STATE_PRE] = val
                        }
                    }
                })

                let top_5_states_from = Object.assign(...Object
                    .entries(all_states_from)
                    .sort(({1: a}, {1: b}) => b - a)
                    .slice(0, 5)
                    .map(([k, v]) => ({[k]: v}))
                );

                let top_5_states_to = Object.assign(...Object
                    .entries(vis.statesTo[0])
                    .sort(({1: a}, {1: b}) => b - a)
                    .slice(2, 7)
                    .map(([k, v]) => ({[k]: v}))
                );

                // Tooltips
                vis.lex_tooltip = d3.select('body').append("div")
                    .attr("id", "lex_id")
                    .style("position", "absolute")
                    .style("z-index", "1000")
                    .style("visibility", "hidden")
                    .style("background", "#383838")
                    .style("border", "#383838")
                    .style('font-family', 'Roboto Slab')
                    .style("border-radius", "0px")
                    .style("padding", "10px")

                // Link Legend
                // let centroid = [document.getElementById(d.properties.name.replaceAll(' ', '')).getBBox().x + document.getElementById(d.properties.name.replaceAll(' ', '')).getBBox().width / 2, document.getElementById(d.properties.name.replaceAll(' ', '')).getBBox().y + document.getElementById(d.properties.name.replaceAll(' ', '')).getBBox().height / 2]
                vis.linkLegend
                    .attr('display', null)


                // Draw links
                for (let [abbr, val] of Object.entries(top_5_states_from)) {
                    let state_name = stateAbbrev[abbr]
                    let state_id = state_name.replaceAll(' ', '')
                    let state_path = document.getElementById(state_id)
                    let state_centroid = plot_centroid(state_name, state_path)
                    vis.svg.append("path")
                        .attr("class", "from-line")
                        .style("stroke", "#6c6c6c")
                        .style("stroke-width", "3")
                        .style('fill-opacity', '0')
                        .attr('d', function(d) {
                            return line_from([[selected_centroid[0],selected_centroid[1]],[state_centroid[0],state_centroid[1]]])
                        })
                        .on('mouseover', function (event, d) {
                            vis.lex_tooltip.text(`${state_name} → ${vis.selected_state}: ${val}`)
                            return vis.lex_tooltip.style("visibility", "visible");
                        })
                        .on("mousemove", function (event, d) {
                            return vis.lex_tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                        })
                        .on("mouseout", function (event, d) {
                            return vis.lex_tooltip.style("visibility", "hidden")
                        })
                        .on("click", function (event, d) {
                            return vis.lex_tooltip.style("visibility", "hidden")
                        })

                    //.attr("marker-end", "url(#arrowhead)")
                    plot_centroid(state_name, state_path)
                }

                for (let [abbr, val] of Object.entries(top_5_states_to)) {
                    let state_name = stateAbbrev[abbr]
                    let state_id = state_name.replaceAll(' ', '')
                    let state_path = document.getElementById(state_id)
                    let state_centroid = plot_centroid(state_name, state_path)
                    vis.svg.append("path")
                        .attr("class", "to-line")
                        .style("stroke", "#d76868")
                        .style("stroke-width", "2")
                        .style('fill-opacity', '0')
                        .attr('d', function(d) {
                            return line_to([[selected_centroid[0],selected_centroid[1]],[state_centroid[0],state_centroid[1]]])
                        })
                        .on('mouseover', function (event, d) {
                            vis.lex_tooltip
                                .text(`${vis.selected_state} → ${state_name}: ${val}`)
                                .style("visibility", "visible");
                        })
                        .on("mousemove", function (event, d) {
                            vis.lex_tooltip
                                .style("top", (event.pageY - 10) + "px")
                                .style("left", (event.pageX + 10) + "px");
                        })
                        .on("mouseout", function (event, d) {
                            vis.lex_tooltip
                                .style("visibility", "hidden")
                        })
                    plot_centroid(state_name, state_path)
                    plot_centroid(vis.selected_state, vis.selected_state_path)
                }
            })

    }

}