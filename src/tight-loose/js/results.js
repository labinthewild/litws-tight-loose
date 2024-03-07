(function (exports) {
    // Declare the chart dimensions and margins.
    const width = 640;
    const height = 400;
    const barHeight = height/10;
    const scoreMax = 13;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    let _calculateMarkX = function (score) {
        return (width/scoreMax*score)
    }
    let _addMark = function (context){
        context.moveTo(barHeight/2,barHeight)
        context.lineTo(0,0)
        context.lineTo(barHeight, 0)
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
        let bar = svg.append("g");
        bar.append("rect")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', barHeight)
            .attr('stroke', 'black')
            .attr('fill', '#6A9341')
        bar.append("text")
            .attr('x', 0)
            .attr('y', barHeight*2)
            .text($.i18n('study-tl-results-legend-loose'))
        bar.append("text")
            .attr('x', width)
            .attr('y', barHeight*2)
            .attr('text-anchor', 'end')
            .text($.i18n('study-tl-results-legend-tight'))
        bar.attr('transform', `translate(${0}, ${height/2-(barHeight/2)})`);

        let mark = svg.append("g");
        mark.append("path")
            .style("stroke", "black")
            .style("fill", "none")
            .attr('d', _addMark(d3.path()))
        mark.append("text")
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'start')
            .attr('font-size', '1.5em')
            .text($.i18n('study-tl-results-legend-usa'))
        mark.attr('transform', `translate(${_calculateMarkX(5.1)}, ${height/2-(3/2*barHeight)})`)
    }

    exports.results = {};
    exports.results.drawGraphic = draw;

})( window.LITW = window.LITW || {} );