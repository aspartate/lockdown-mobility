class matrixVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];


        this.initVis()
    }

    initVis() {
        let vis = this

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = 1100 - vis.margin.left - vis.margin.right;
        vis.height = 1100 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.displayData = []

        vis.displayNumber = []
        vis.data.forEach((d0, i0) => {
            delete d0.INDEX
            delete d0.DC
            let length = Object.keys(d0).length
            let row = []
            for (let i=0; i < length; i++) {
                let state = Object.keys(d0)[i]
                row.push(d0[state])
            }
            // delete d.STATE_PRE


            if (d0.DATE === "3/24/2021" && d0.STATE_PRE !== "DC") {
                delete d0.DATE
                vis.displayNumber.push(row)
                vis.displayData.push(d0)
            }


        })

        // vis.dataFamily.forEach((d, i) => {
        //     let businessValues = vis.dataBusiness[i]
        //     let marriageValues = vis.dataMarriages[i]
        //     let businessTies = businessValues.reduce(add,0)
        //     let marriages = marriageValues.reduce(add,0)
        //     let allRelations = businessTies + marriages
        //     let family = {
        //         "index": i,
        //         "name": d.Family,
        //         "allRelations": allRelations,
        //         "businessTies": businessTies,
        //         "businessValues": businessValues,
        //         "marriages": marriages,
        //         "marriageValues": marriageValues,
        //         "numberPriorates": +d.Priorates,
        //         "wealth": +d.Wealth
        //     }
        //
        //     vis.data.push(family)
        // })
        console.log(vis.displayData, 'display data')
        console.log(vis.displayNumber, 'display number')
        // vis.displayData = Array.from(vis.data)

        vis.wrangleData("name");
    }

    wrangleData(selectedValue) {
        let vis = this
        // console.log(selectedValue)
        // let filteredData = []
        // if (selectedValue === "name") {
        //     filteredData = Array.from(vis.data)
        // } else {
        //     filteredData = vis.displayData.sort(function (a, b) {
        //         return (b[selectedValue] - a[selectedValue]);
        // })}
        // console.log(filteredData)
        // console.log(vis.data)

        // Add x labels
        let xlabels = vis.svg.selectAll(".xlabels")
            .data(vis.displayNumber)

        xlabels.enter().append("text")
            .attr("class", "xlabels")
            .merge(xlabels)
            .attr("transform", function(d, i) {
                return `rotate(270, ${i*20+83}, 60)`
            })
            .attr("y", function (d, i) {
                return 60
            })
            .attr("x", function (d, i) {
                return i * 20+83
            })
            .text(function (d, i) {
                return d[0]
            })
            .attr("font-size", 10)

            xlabels.exit().remove()

        // Add y labels
        let ylabels = vis.svg.selectAll(".ylabels")
            .data(vis.displayNumber)

        ylabels.enter().append("text")
            .attr("class", "ylabels")
            .merge(ylabels)
            .attr("x", function (d, i) {
                return 60
            })
            .attr("y", function (d, i) {
                return i * 20+83
            })
            .text(function (d, i) {
                return d[0]
            })
            .attr("font-size", 10)
            .style("text-anchor", "end")

        ylabels.exit().remove()

        // add triangles for business values

        let correlation = vis.svg.selectAll(".correlation").enter()
            .data(vis.displayNumber)


        vis.displayData.forEach( (d0, i0) => {
            correlation.enter().append("rect")
                .attr("class", "correlation")
                .merge(correlation)
                .attr("x", function (d,i) { return i*20+70})
                .attr("y", function (d,i) { return i0*20+70})
                .attr("width", 20)
                .attr("height", 20)
                .style("fill", function (d,i) {
                        let state = Object.keys(d0)[i+1]
                        let val = Math.round(d0[state]*100)
                        if (isNaN(val)) {
                            val = 0
                        }
                    return `rgb(${255 - val},${255 - val},${255 - val})`
                    }
                )
            correlation.exit().remove()
        })


    }

}