(function (exports) {
    const MAX_SCORE = 15;
    let height = 0;
    let width = 0;
    let margin = 0;
    let svg = null;
    let lastMarkCoordinate = null;
    let barHeight = () => {return height/10};

    //TODO: This only works for two sequential points.
    // We need to implement a check for multiple points
    let _isTooClose = function (mark1_x, mark2_x) {
        let dist = Math.abs(mark1_x-mark2_x);
        return dist < (2.5*barHeight());
    }

    let _calculateMarkX = function (score) {
        return (width/MAX_SCORE*score)+margin;
    }
    let _addMark = function (context){
        context.moveTo(barHeight()/2,barHeight())
        context.lineTo(0,0)
        context.lineTo(barHeight(), 0)
        context.closePath()
        return context
    }

    let drawMark = function(score, legend, fill= false) {
        let mark_x = _calculateMarkX(score);
        let mark_y = height/2-(3/2*barHeight());
        let tooClose = false;
        if(lastMarkCoordinate && _isTooClose(mark_x, lastMarkCoordinate.x)){
            tooClose = true;
        }

        let mark = svg.append("g");
        let fill_color = "none";
        let y_pos = tooClose ? -(barHeight()/2) : -(barHeight()/10);
        let text_weight = "normal";
        if(fill) {
            fill_color = "black";
            y_pos = -barHeight()*1.5;
            text_weight = "bold";
        }
        mark.append("path")
            .style("stroke", "black")
            .style("fill", fill_color)
            .attr('d', _addMark(d3.path()))
        mark.append("text")
            .attr('x', barHeight()/2)
            .attr('y', y_pos )
            .attr('text-anchor', 'middle')
            .attr('font-weight', text_weight)
            .attr('font-size', '1.5em')
            .text(legend)

        lastMarkCoordinate = {x: mark_x, y: mark_y};
        mark.attr('transform', `translate(${mark_x}, ${mark_y})`);
    }

    let draw = function(divID) {
        const PAGE_CONTENT_WIDTH = document.getElementById(divID).offsetWidth;
        width = PAGE_CONTENT_WIDTH-(2*margin);
        height = width/3;
        margin = height/10;

        // Create the SVG container.
        svg = d3.select(`#${divID}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Add bar
        let bar = svg.append("g");
        bar.append("rect")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width-(2*margin))
            .attr('height', barHeight())
            .attr('stroke', 'black')
            .attr('fill', '#6A9341')
        bar.append("text")
            .attr('x', 0)
            .attr('y', barHeight()*2)
            .text($.i18n('study-tl-results-expl-tight1'))
        bar.append("text")
            .attr('x', width-(2*margin))
            .attr('y', barHeight()*2)
            .attr('text-anchor', 'end')
            .text($.i18n('study-tl-results-expl-loose1'))
        bar.attr('transform', `translate(${margin}, ${height/2-(barHeight()/2)})`);
    }

    exports.results = {};
    exports.results.drawGraphic = draw;
    exports.results.drawMark = drawMark;

})( window.LITW = window.LITW || {} );