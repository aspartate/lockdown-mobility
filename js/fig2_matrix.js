// ALL LINES BELOW ARE NEW
class matrixVis {

    constructor(parentElement, lex_data, date) {
        this.parentElement = parentElement;
        this.lex_data = lex_data;
        this.selectedDate = date;

        this.initVis()
    }

    initVis() {
        let vis = this

        vis.margin = {top: 30, right: -100, bottom: 10, left: 200};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        console.log(`Fig2-Left Width: ${vis.width}`)
        vis.height = window.innerHeight*0.7 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Reset view when click on blank space
        vis.svg.on('click', function (event, d) {
            if (event.path[0].id === "") {
                reset_view()
            }
        })

        // Square size
        vis.square_size = vis.height/54

        // Tooltip init
        vis.matrix_tooltip = d3.select('body').append("div")
            .style("position", "absolute")
            .style("z-index", "1000")
            .style("visibility", "hidden")
            .style("background", "#383838")
            .style("border", "#383838")
            .style("border-radius", "0px")
            .style('font-family', 'Roboto Slab')
            .style("padding", "10px")

        // Highlight overlays init
        vis.row_highlight = vis.svg.append("rect")
            .attr("height", vis.square_size)
            .attr("fill", "#d76868")
            .style("opacity", "25%")
            .style("visibility", "hidden")
        vis.col_highlight = vis.svg.append("rect")
            .attr("width", vis.square_size)
            .attr("fill", "#d76868")
            .style("opacity", "25%")
            .style("visibility", "hidden")

        // Color scale
        vis.colorScale = d3.scaleLinear().domain([0,100])
            .range(["white", "darkred"])

        // Add x labels
        vis.xlabels = vis.svg.selectAll(".xlabels")
            .data(Object.keys(stateAbbrev))
        vis.xlabels.enter().append("text")
            .attr("class", "xlabels")
            .merge(vis.xlabels)
            .attr("transform", function(d, i) {
                return `rotate(270, ${i*vis.square_size+(vis.square_size*3.7)}, ${vis.square_size*2.7})`
            })
            .attr("y", function (d, i) {
                return vis.square_size*2.7
            })
            .attr("x", function (d, i) {
                return i * vis.square_size+(vis.square_size*3.7)
            })
            .text(function (d, i) {
                return d
            })
            .attr("font-size", Math.round(vis.square_size/2))
            .style("fill", "rgb(255,255,255)")
        vis.xlabels.exit().remove()

        // Add y labels
        vis.ylabels = vis.svg.selectAll(".ylabels")
            .data(Object.keys(stateAbbrev))
        vis.ylabels.enter().append("text")
            .attr("class", "ylabels")
            .merge(vis.ylabels)
            .attr("x", function (d, i) {
                return vis.square_size*2.7
            })
            .attr("y", function (d, i) {
                return i * vis.square_size+(vis.square_size*3.7)
            })
            .text(function (d, i) {
                return d
            })
            .attr("font-size", Math.round(vis.square_size/2))
            .style("text-anchor", "end")
            .style("fill", "rgb(255,255,255)")
        vis.ylabels.exit().remove()

        vis.wrangleData(vis.selectedDate);
    }

    wrangleData(date) {
        let vis = this

        // Filter LEX data by selected date
        vis.displayDataLex = []
        vis.lex_data.forEach(row => {
            // and push rows with proper dates into displayDataLex
            if (parseDateLex(row.DATE).getTime() === date.getTime()) {
                vis.displayDataLex.push(row);
            }
        });

        vis.displayData = []
        vis.displayNumber = []
        vis.temp_data = JSON.parse(JSON.stringify(vis.displayDataLex))
        vis.temp_data.forEach((d0, i0) => {
            delete d0.INDEX
            delete d0.DC
            let row = []
            for (let i=0; i < Object.keys(d0).length; i++) {
                let state = Object.keys(d0)[i]
                row.push(d0[state])
            }
            if (d0.STATE_PRE !== "DC") {
                delete d0.DATE
                vis.displayNumber.push(row)
                vis.displayData.push(d0)
            }
        })

        vis.svg.selectAll(".correlation").remove() // Need to remove all garbage from before, or else this viz will slow down over time
        vis.correlation = vis.svg.selectAll(".correlation").enter()
            .data(vis.displayNumber)

        vis.displayData.forEach( (d0, i0) => {
            vis.correlation.enter().append("rect")
                .attr("class", "correlation")
                .merge(vis.correlation)
                .attr("x", function (d,i) { return i*vis.square_size+ (vis.square_size * 3)})
                .attr("y", i0*vis.square_size+ (vis.square_size * 3))
                .style("z-index", "1000")
                .attr("width", vis.square_size)
                .attr("height", vis.square_size)
                .attr("id", function (d, i) {
                    return "matrix_id_" + String(Object.keys(d0)[i+1])
                })
                .style("fill", function (d,i) {
                        let state = Object.keys(d0)[i+1]
                        let val = Math.round(d0[state]*1000)
                        if (isNaN(val)) {
                            val = 0
                        }
                        return vis.colorScale(val)
                    }
                )
                .on('mouseenter', function (event, d) {
                    plot_single(d0.STATE_PRE, d[0], d0[d[0]])
                    let from_index = Object.keys(stateAbbrev).indexOf(d0.STATE_PRE)
                    let to_index = Object.keys(stateAbbrev).indexOf(d[0])

                    vis.matrix_tooltip.text(`${stateAbbrev[d0.STATE_PRE]} → ${stateAbbrev[d[0]]}: ${d0[d[0]]}`)
                    vis.row_highlight
                        .attr("width", vis.square_size * to_index)
                        .attr("x", vis.square_size * 3)
                        .attr("y", (vis.square_size * 3) + from_index * vis.square_size)
                        .raise()
                    vis.col_highlight
                        .attr("height", vis.square_size * from_index)
                        .attr("x", (vis.square_size * 3) + to_index * vis.square_size)
                        .attr("y", vis.square_size * 3)
                        .raise()
                    vis.row_highlight.style("visibility", "visible"),
                        vis.col_highlight.style("visibility", "visible"),
                        vis.matrix_tooltip.style("visibility", "visible"),
                        vis.matrix_tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                })
                .on("mouseleave", function (event, d) {
                    reset_view()
                    vis.row_highlight.style("visibility", "hidden"),
                    vis.col_highlight.style("visibility", "hidden"),
                    vis.matrix_tooltip.style("visibility", "hidden");
                })
                // .on("click", function (event, d) {
                //     console.log(d)
                //     reset_view()
                //     plot_single(d0.STATE_PRE, d[0], d0[d[0]])
                // })

            vis.correlation.exit().remove()
        })
    }
}