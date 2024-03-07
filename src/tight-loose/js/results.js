(function (exports) {
    // Declare the chart dimensions and margins.
    const width = 640;
    const height = 400;
    const barHeight = height/10;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    let _addMark = function (context){
        context.moveTo(5,0)
        context.lineTo(10,10)
        context.lineTo(0,10)
        context.closePath()
        return context
    }
    let draw = function(divID) {
        // Create the SVG container.
        const svg = d3.select(`#${divID}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Add bar
        svg.append("rect")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', barHeight)
            .attr('stroke', 'black')
            .attr('fill', '#6A9341')
            .attr('transform', `translate(${0}, ${height/2-(barHeight/2)})`);

        svg.append("path")
            .style("stroke", "black")
            .style("fill", "none")
            .attr('d', _addMark(d3.path()))
    }

    exports.results = {};
    exports.results.drawGraphic = draw;

})( window.LITW = window.LITW || {} );