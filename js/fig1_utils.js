let fig1_selection = 'None'

// Called to update Figure 1 on mouseover
function fig1_highlight(selection) {
    if (fig1_selection == 'None') { // When no state is selected
        // Set all lines to grey
        fig1_lineplot.lines.style('stroke', '#424242')
        // Highlight selection
        d3.select('.fig1_line_' + selection)
            .style("stroke", function(d){return fig1_lineplot.colors[d[0]]})
            .style("stroke-width", 4)
            .raise()
    } else { // when state is selected
        // Expose selected line and bring to highest of non-selected states, but no higher
        d3.select('.fig1_line_' + selection)
            .style("stroke", function(d){return fig1_lineplot.colors[d[0]]})
            .style("stroke-width", 2)//d => {if (type == 'strong') {return 4} else if (type == 'weak') {return 2}})
            .raise()
        // fig1_lineplot.lockdown_rect.raise()
        // fig1_lineplot.lockdown_text.raise()
        d3.select(`.fig1_line_${fig1_selection}`).raise()
        fig1_lineplot.field.raise()
    }
    // highlight state in dexmap
    d3.select('#fig1_map_' + selection)
        .style("fill-opacity", "80%")
    // Raise y-axis
    fig1_lineplot.yax.raise()
    // Update automenu
    document.getElementById("fig1_automenu").value = stateAbbrev[selection]
}

// Called to update Figure 1 on click selection
function fig1_select(selection) {
    // Grey out all lines
    fig1_lineplot.lines
        .style('stroke', '#424242')
    // Recolor old selected state in dexmap
    d3.select('#fig1_map_' + fig1_selection)
        .style("fill-opacity", "100%")
    // // Get rid of lockdown overlay
    // fig1_lineplot.lockdown_rect.attr('display', 'none')
    // fig1_lineplot.lockdown_text.attr('display', 'none')
    // // Show lockdown rect if lockdown period exists
    // if (fig1_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].Start != 0) {
    //     fig1_lineplot.lockdown_start = fig1_lineplot.x(parseDate(fig1_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].Start))
    //     fig1_lineplot.lockdown_end = Math.min(fig1_lineplot.x(parseDate(fig1_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].End)), fig1_lineplot.width)
    //     fig1_lineplot.lockdown_rect
    //         .attr('width', fig1_lineplot.lockdown_end - fig1_lineplot.lockdown_start)
    //         .attr('x', fig1_lineplot.lockdown_start)
    //         .attr('display', null)
    //         .raise()
    //     fig1_lineplot.lockdown_text
    //         .attr('y', fig1_lineplot.lockdown_start + (fig1_lineplot.lockdown_end - fig1_lineplot.lockdown_start)/2 + 10)
    //         .attr('display', null)
    //         .raise()
    //     fig1_lineplot.titles.raise()
    // }
    // highlight state in dexmap
    d3.select('#fig1_map_' + selection)
        .style("fill-opacity", "50%")
    // Raise transparent field to enable clickout
    fig1_lineplot.field.raise()
    // Highlight selected line and thicken & raise
    d3.select('.fig1_line_' + selection)
        .style("stroke", function(d){return fig1_lineplot.colors[d[0]] })
        .style("stroke-width", 4)
        .raise()
    // Raise y-axis
    fig1_lineplot.yax.raise()
    fig1_selection = selection // Record selected state
}

function fig1_unhighlight(selection) {
    // Recolor selected state in dexmap
    d3.select('#fig1_map_' + selection)
        .style("fill-opacity", "100%")
    // Hide tooltips
    d3.select('#fig1_mapTooltip').style('display', 'none')
    // Clear automenu
    document.getElementById("fig1_automenu").value = ''
    if (fig1_selection == 'None') { // When no state is selected
        // Recolor all lines
        fig1_lineplot.lines
            .style("stroke", function(d) {return fig1_lineplot.colors[d[0]] })
            .style("stroke-width", 2)
            .raise()
        // // Restore linechart subtitle2
        // lineplot_all.subtitle2.text(function() {
        //     if (selectedCategory == 'bottom10') {
        //         return 'Bottom 10 States by Population'
        //     } else if (selectedCategory == 'top10') {
        //         return 'Top 10 States by Population'
        //     } else if (selectedCategory == 'lockdown') {
        //         return 'States with Lockdown'
        //     } else if (selectedCategory == 'nolockdown') {
        //         return 'States without Lockdown'
        //     } else {
        //         return 'All States'
        //     }
        // })
    } else { // when state is selected
        // Set all lines to grey
        fig1_lineplot.lines.style('stroke', '#424242')
        // Highlight selected line and thicken & raise
        d3.select('.fig1_line_' + fig1_selection)
            .style("stroke", function(d){return fig1_lineplot.colors[d[0]] })
            .style("stroke-width", 4)
            .raise()
        // highlight selected state in dexmap
        d3.select('#fig1_map_' + fig1_selection)
            .style("fill-opacity", "50%")
        // Update automenu
        document.getElementById("fig1_automenu").value = stateAbbrev[fig1_selection]
    }
    // Raise y-axis
    fig1_lineplot.yax.raise()
}

function fig1_deselect(selection) {
    // Clear automenu
    document.getElementById("fig1_automenu").value = ''
    // // Hide lockdown rect
    // fig1_lineplot.lockdown_rect.attr('display', 'none')
    // fig1_lineplot.lockdown_text.attr('display', 'none')
    // Hide tooltips
    d3.select('.fig1_tool_tip').attr('display', 'none')
    d3.select('#fig1_mapTooltip').style('display', 'none')
    // Recolor all lines
    fig1_lineplot.lines
        .style("stroke", function(d) {return fig1_lineplot.colors[d[0]] })
        .style("stroke-width", 2)
        .raise()
    // Recolor selected state in dexmap
    d3.select('#fig1_map_' + selection)
        .style("fill-opacity", "100%")
    // Raise y-axis
    fig1_lineplot.yax.raise()
    // Reset selected state
    fig1_selection = 'None'
}
