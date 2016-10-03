var barchart = function(data, id){
    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 1024 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom,
        comma = d3.format(","),
        months = data.map(function(d){ return d.month; });

    var xBars = d3.scale.ordinal()
        .domain(months)
        .rangeBands([0, width], .1);

    var yBars = d3.scale.linear()
        .domain([0, d3.max(data.map(function(d){ return d.followers; }))])
        .range([height, margin.top]);

    var xAxisBars = d3.svg.axis()
        .scale(xBars)
        .orient("bottom")

    var yAxisBars = d3.svg.axis()
        .scale(yBars)
        .orient("left")
        .ticks(5)
        .innerTickSize(-width)
        .outerTickSize(0);

    var tip_bar = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-5, 0])
            .html(function(d){
                return d.followers != undefined ?
                        "<div> Month: "+ d.month +"<div>"+
                        "<div style='margin-top:5px'> Followers gained: "+ comma(d.followers) +"</div>" : d.month;
            });

    var svg_bar = d3.select(id).append("svg")
            //.style("border", "1px solid #ddd")
            .attr("width", "100%")
            .attr("viewBox", "0 0 "+(width + margin.left + margin.right)+" "+(height + margin.bottom))
            .attr("preserveAspectRatio", "xMidYMin meet");

        svg_bar.call(tip_bar);

        svg_bar.append("g")
            .attr("transform", "translate("+ (margin.left) +","+ 0 +")")
            .call(yAxisBars)
            .attr("class", "yBars axisBars")
                .selectAll("text")
                    .text(function(d){ return d3.format(",s")(d); });

        svg_bar.append("g")
            .attr("transform", "translate("+ (margin.left) +","+ (height) +")")
            .call(xAxisBars)
            .attr("class", "xBars axisBars");

        month_bars = svg_bar.selectAll('.month_follow_bars')
             .data(data);

        month_bars.enter().append('rect')
            .attr("x", function(d, i){ return xBars(d.month)+xBars.rangeBand()*0.65; })
            .attr("y", function(d){ return yBars(d.followers);  })
            .attr("width", function(d){ return xBars.rangeBand()*0.5; })
            .attr("height", function(d){ return height - yBars(d.followers); })
            .attr("fill", "steelblue")
            .on("mouseover", tip_bar.show)
            .on("mouseout", tip_bar.hide);

};