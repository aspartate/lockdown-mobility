function reset_view() {
    d3.selectAll(".centroid").remove();
    d3.selectAll(".to-line").remove();
    d3.selectAll(".from-line").remove();
    d3.selectAll("#lex_id").remove();
    fig2_map.linkLegend
        .attr('display', 'none')
    for (let key in stateAbbrev) {
        let state = stateAbbrev[key].replaceAll(' ', '')
        document.getElementById(state).setAttribute("fill-opacity", "100%")
    }
}

function plot_centroid(state_name, state_path) {
    let state_bb = state_path.getBBox()
    let centroid = [state_bb.x + state_bb.width / 2, state_bb.y + state_bb.height / 2]
    if (state_name === "Alaska") {
        centroid[0] += 30;
        centroid[1] += -15
    }
    if (state_name === "California") {
        centroid[0] += -10;
        centroid[1] += 15
    }
    if (state_name === "Michigan") {
        centroid[0] += 28;
        centroid[1] += 25
    }
    if (state_name === "Idaho") {
        centroid[0] += -10;
        centroid[1] += 30
    }
    if (state_name === "Louisiana") {
        centroid[0] += -20
    }
    if (state_name === "Florida") {
        centroid[0] += 45
    }
    if (state_name === "Virginia") {
        centroid[0] += 20
    }
    if (state_name === "Maryland") {
        centroid[0] += 5;
        centroid[1] += -5
    }
    if (state_name === "Kentucky") {
        centroid[0] += 15
    }
    if (state_name === "Oklahoma") {
        centroid[0] += 20
    }
    if (state_name === "Minnesota") {
        centroid[0] += -15
    }

    let radius = 5

    fig2_map.svg.append("circle")
        .attr("class", "centroid")
        .attr("cx", centroid[0])
        .attr("cy", centroid[1])
        .attr("r", radius)
        .style("fill", "#d76868")

    return centroid
}

function plot_single(abbr_from, abbr_to, val) {
    let selected_state = stateAbbrev[abbr_from]

    fig2_map.selected_state_path = document.getElementById(selected_state.replaceAll(' ', ''))

    let selected_centroid = plot_centroid(selected_state, fig2_map.selected_state_path)

    let state_name = stateAbbrev[abbr_to]
    let state_id = state_name.replaceAll(' ', '')
    let state_path = document.getElementById(state_id)
    let state_centroid = plot_centroid(state_name, state_path)
    fig2_map.svg.append("path")
        .attr("class", "to-line")
        .style("stroke", "#d76868")
        .style("stroke-width", "3")
        .style('fill-opacity', '0')
        .attr('d', function(d) {
            return line_to([[selected_centroid[0],selected_centroid[1]],[state_centroid[0],state_centroid[1]]])
        })
        .on('mouseover', function (event, d) {
            fig2_map.lex_tooltip.text(`${selected_state} -> ${state_name}: ${val}`)
            return fig2_map.lex_tooltip.style("visibility", "visible");
        })
        .on("mousemove", function (event, d) {
            return fig2_map.lex_tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function (event, d) {
            return fig2_map.lex_tooltip.style("visibility", "hidden")
        })
    plot_centroid(state_name, state_path)
    plot_centroid(selected_state, fig2_map.selected_state_path)
}

// Curve generator https://stackoverflow.com/questions/56784097/d3-v4-how-to-make-a-path-being-curved-when-only-start-and-end-point-are-known
function curve_from(context) {
    var custom = d3.curveLinear(context);
    custom._context = context;
    custom.point = function(x,y) {
        x = +x, y = +y;
        switch (this._point) {
            case 0: this._point = 1;
                this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
                this.x0 = x; this.y0 = y;
                break;
            case 1: this._point = 2;
            default:
                var x1 = this.x0 * 0.5 + x * 0.5;
                var y1 = this.y0 * 0.5 + y * 0.5;
                var m = 1/(y1 - y)/(x1 - x);
                var r = -50; // offset of mid point.
                var k = r / Math.sqrt(1 + (m*m) );
                if (m == Infinity) {
                    y1 += r;
                }
                else {
                    y1 += k;
                    x1 += m*k;
                }
                this._context.quadraticCurveTo(x1,y1,x,y);
                this.x0 = x; this.y0 = y;
                break;
        }
    }
    return custom;
}

function curve_to(context) {
    var custom = d3.curveLinear(context);
    custom._context = context;
    custom.point = function(x,y) {
        x = +x, y = +y;
        switch (this._point) {
            case 0: this._point = 1;
                this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
                this.x0 = x; this.y0 = y;
                break;
            case 1: this._point = 2;
            default:
                var x1 = this.x0 * 0.5 + x * 0.5;
                var y1 = this.y0 * 0.5 + y * 0.5;
                var m = 1/(y1 - y)/(x1 - x);
                var r = -20; // offset of mid point.
                var k = r / Math.sqrt(1 + (m*m) );
                if (m == Infinity) {
                    y1 += r;
                }
                else {
                    y1 += k;
                    x1 += m*k;
                }
                this._context.quadraticCurveTo(x1,y1,x,y);
                this.x0 = x; this.y0 = y;
                break;
        }
    }
    return custom;
}

let line_from = d3.line()
    .curve(curve_from)
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })

let line_to = d3.line()
    .curve(curve_to)
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })