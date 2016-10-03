var wordcloud = function(data, id){
    var margin = {top: 10, right: 50, bottom: 10, left: 20},
        width = 550 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    var svg_wc = d3.select(id).append("svg")
            .attr("width", "100%")
            //.attr("height", "100%")
            //.style("border", "1px solid #ddd")
            .attr("viewBox", "0 0 "+(width + margin.left + margin.right)+" "+(height + margin.bottom))
            .attr("preserveAspectRatio", "xMidYMin meet");





};