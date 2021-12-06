// Selectbox function for lineplot
let fig3_selectedCategory = d3.select("#categorySelector").property("value")
function fig3_categoryChange() {
    fig1_deselect(fig3_selection)
    fig3_selectedCategory = d3.select("#categorySelector").property("value");
    fig3_lineplot.wrangleData();
}
function fig3_switchCategory() {
    if (fig3_selectedCategory == 'lockdown') {
        fig3_selectedCategory = 'nolockdown'
    } else {
        fig3_selectedCategory = 'lockdown'
    }
    document.getElementById("categorySelector").value = fig3_selectedCategory
    fig3_lineplot.wrangleData()
}

let fig3_selection = 'None'

// Called to update Figure 1 on mouseover
function fig3_highlight(selection) {
    if (fig3_selection == 'None') { // When no state is selected
        // Set all lines to grey
        fig3_lineplot.lines.style('stroke', '#424242')
        // Show lockdown rect if lockdown period exists
        if (fig3_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].Start != 0) {
            fig3_lineplot.lockdown_start = fig3_lineplot.x(parseDate(fig3_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].Start))
            fig3_lineplot.lockdown_end = Math.min(fig3_lineplot.x(parseDate(fig3_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].End)), fig3_lineplot.width)
            fig3_lineplot.lockdown_rect
                .attr('width', fig3_lineplot.lockdown_end - fig3_lineplot.lockdown_start)
                .attr('x', fig3_lineplot.lockdown_start)
                .attr('display', null)
                .raise()
            fig3_lineplot.lockdown_text
                .attr('y', fig3_lineplot.lockdown_start + (fig3_lineplot.lockdown_end - fig3_lineplot.lockdown_start)/2 + 10)
                .attr('display', null)
                .raise()
            fig3_lineplot.titles.raise()
        }
        // Highlight selection
        d3.select('.fig3_line_' + selection)
            .style("stroke", function(d){return fig3_lineplot.colors[d[0]]})
            .style("stroke-width", 4)
            .raise()
        // Strong highlight state in violinplot
        d3.select('#violinplot_' + selection)
            .attr('r', 10)
            .raise()
    } else { // when state is selected
        // Expose selected line and bring to highest of non-selected states, but no higher
        d3.select('.fig3_line_' + selection)
            .style("stroke", function(d){return fig3_lineplot.colors[d[0]]})
            .style("stroke-width", 2)//d => {if (type == 'strong') {return 4} else if (type == 'weak') {return 2}})
            .raise()
        fig3_lineplot.lockdown_rect.raise()
        fig3_lineplot.lockdown_text.raise()
        d3.select(`.fig3_line_${fig3_selection}`).raise()
        fig3_lineplot.field.raise()
        // Weak highlight state in violinplot
        d3.select('#violinplot_' + selection)
            .attr('r', 7)
            .raise()
    }
    // Raise y-axis
    fig3_lineplot.yax.raise()
    // Update automenu
    document.getElementById("fig3_automenu").value = stateAbbrev[selection]
}

// Called to update Figure 1 on click selection
function fig3_select(selection) {
    // Grey out all lines
    fig3_lineplot.lines
        .style('stroke', '#424242')
    // Resize old selected state in violinplot
    d3.select('#violinplot_' + fig3_selection)
        .attr('r', 5)
    // Get rid of lockdown overlay
    fig3_lineplot.lockdown_rect.attr('display', 'none')
    fig3_lineplot.lockdown_text.attr('display', 'none')
    // Show lockdown rect if lockdown period exists
    if (fig3_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].Start != 0) {
        fig3_lineplot.lockdown_start = fig3_lineplot.x(parseDate(fig3_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].Start))
        fig3_lineplot.lockdown_end = Math.min(fig3_lineplot.x(parseDate(fig3_lineplot.lockdowns.filter(obj => {return obj.State == stateAbbrev[selection]})[0].End)), fig3_lineplot.width)
        fig3_lineplot.lockdown_rect
            .attr('width', fig3_lineplot.lockdown_end - fig3_lineplot.lockdown_start)
            .attr('x', fig3_lineplot.lockdown_start)
            .attr('display', null)
            .raise()
        fig3_lineplot.lockdown_text
            .attr('y', fig3_lineplot.lockdown_start + (fig3_lineplot.lockdown_end - fig3_lineplot.lockdown_start)/2 + 10)
            .attr('display', null)
            .raise()
        fig3_lineplot.titles.raise()
    }
    // highlight state in violinplot
    d3.select('#violinplot_' + selection)
        .attr('r', 10)
        .raise()
    // Raise transparent field to enable clickout
    fig3_lineplot.field.raise()
    // Highlight selected line and thicken & raise
    d3.select('.fig3_line_' + selection)
        .style("stroke", function(d){return fig3_lineplot.colors[d[0]] })
        .style("stroke-width", 4)
        .raise()
    // Raise y-axis
    fig3_lineplot.yax.raise()
    fig3_selection = selection // Record selected state
}

function fig3_unhighlight(selection) {
    // Recolor selected state in violinplot
    d3.select('#violinplot_' + selection)
        .attr('r', 5)
    // Hide tooltips
    d3.select('#fig3_violinplotTooltip').style('display', 'none')
    // Clear automenu
    document.getElementById("fig3_automenu").value = ''
    if (fig3_selection == 'None') { // When no state is selected
        // Get rid of lockdown overlay
        fig3_lineplot.lockdown_rect.attr('display', 'none')
        fig3_lineplot.lockdown_text.attr('display', 'none')
        // Recolor all lines
        fig3_lineplot.lines
            .style("stroke", function(d) {return fig3_lineplot.colors[d[0]] })
            .style("stroke-width", 2)
            .raise()
    } else { // when state is selected
        // Set all lines to grey
        fig3_lineplot.lines.style('stroke', '#424242')
        // Highlight selected line and thicken & raise
        d3.select('.fig3_line_' + fig3_selection)
            .style("stroke", function(d){return fig3_lineplot.colors[d[0]] })
            .style("stroke-width", 4)
            .raise()
        // Strong highlight selected state in violinplot
        d3.select('#violinplot_' + fig3_selection)
            .attr('r', 10)
            .raise()
        // Update automenu
        document.getElementById("fig3_automenu").value = stateAbbrev[fig3_selection]
    }
    // Raise y-axis
    fig3_lineplot.yax.raise()
}

function fig3_deselect(selection) {
    // Clear automenu
    document.getElementById("fig3_automenu").value = ''
    // Hide lockdown rect
    fig3_lineplot.lockdown_rect.attr('display', 'none')
    fig3_lineplot.lockdown_text.attr('display', 'none')
    // Hide tooltips
    d3.select('.fig3_tool_tip').attr('display', 'none')
    d3.select('fig3_violinplotTooltip').style('display', 'none')
    // Recolor all lines
    fig3_lineplot.lines
        .style("stroke", function(d) {return fig3_lineplot.colors[d[0]] })
        .style("stroke-width", 2)
        .raise()
    // Recolor selected state in violinplot
    d3.select('#violinplot_' + selection)
        .attr('r', 5)
    // Raise y-axis
    fig3_lineplot.yax.raise()
    // Reset selected state
    fig3_selection = 'None'
}
