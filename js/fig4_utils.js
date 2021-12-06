function fig4_select(selection) {
    // Grey out all lines
    fig4_lineplot.lines
        .style('stroke', '#424242')
    // Get rid of lockdown overlay
    fig4_lineplot.lockdown_rect.attr('display', 'none')
    fig4_lineplot.lockdown_text.attr('display', 'none')
    // Show lockdown rect if lockdown period exists
    if (fig4_lineplot.lockdowns.filter(obj => {return obj.State == selection})[0].Start != 0) {
        fig4_lineplot.lockdown_start = fig4_lineplot.x(parseDate(fig4_lineplot.lockdowns.filter(obj => {return obj.State == selection})[0].Start))
        fig4_lineplot.lockdown_end = Math.min(fig4_lineplot.x(parseDate(fig4_lineplot.lockdowns.filter(obj => {return obj.State == selection})[0].End)), fig4_lineplot.width)
        fig4_lineplot.lockdown_rect
            .attr('width', fig4_lineplot.lockdown_end - fig4_lineplot.lockdown_start)
            .attr('x', fig4_lineplot.lockdown_start)
            .attr('display', null)
            .raise()
        fig4_lineplot.lockdown_text
            .attr('y', fig4_lineplot.lockdown_start + (fig4_lineplot.lockdown_end - fig4_lineplot.lockdown_start)/2 + 10)
            .attr('display', null)
            .raise()
        fig4_lineplot.titles.raise()
    }
    // Raise transparent field to enable clickout
    fig4_lineplot.field.raise()
    // Highlight selected line and thicken & raise
    d3.select('.fig4_line_' + selection)
        .style("stroke", function(d){return fig4_lineplot.colors[d[0]] })
        .style("stroke-width", 4)
        .raise()
    // Raise y-axis
    fig4_lineplot.yax.raise()
    fig4_selection = selection // Record selected state
}

// For text wrapping https://stackoverflow.com/questions/24784302/wrapping-text-in-d3
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}

// Timeline curves https://stackoverflow.com/questions/55231234/d3-vx-react-chart-curve-flat-at-each-data-point/55251182#55251182
let timecurve = function(context) {
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
                var y1 = this.y0 * 0.3 + y * 0.8;
                this._context.bezierCurveTo(this.x0,y1,x,y1,x,y);
                this.x0 = x; this.y0 = y;
                break;
        }
    }
    return custom;
}

let timeline_curve = d3.line()
    .curve(timecurve)