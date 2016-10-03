var linechart = function(data, id){
    var margin = {top: 0, right: 20, bottom: 30, left: 50},
        width = 1024 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var formatTime = d3.time.format("%I:%M %p"),
        formatTime1 = d3.time.format("%I:%M"),
        asOfFormatDate = d3.time.format("%d-%b-%Y (%A)");

    var forYaxis = d3.min(data, function(d) { return d.followers*0.8; }) ? d3.extent(data, function(d) { return d.followers*1.1; }) : [0, 10];

    var t1 = new Date(),
        t2 = new Date(),
        tx = new Date();
        t1.setHours(0,0,0);
        t2.setHours(23,0,0);
        tx.setDate(tx.getDate() - 1);
        tx.setHours(23,0,0);

    d3.select(".today").text(asOfFormatDate(t1));

    var x = d3.time.scale()
        .domain([t1, t2])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain(forYaxis)
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(24);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10)
        .innerTickSize(-width)
        .outerTickSize(0);

   var tip_line = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(function(d, i){
          if(i != 'null'){
            return "<div>"+i+" Followers: " + d.followers +"</div>";
          }else{
            return "<div>Time: " + formatTime(d.date) +"</div>" +
                 "<div style='margin-top:5px;'>Followers gained: " + d.followers +"</div>";
          }
        });

    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.followers); })
        .interpolate("cardinal");

    var svg_line = d3.select(id).append("svg")
        .attr("width", "100%")
        .attr("viewBox", "0 0 "+(width + margin.left+margin.right)+" "+(height + margin.top + margin.bottom))
        .attr("preserveAspectRatio", "xMidYMin meet")
        //.style("border", "1px solid #ddd")
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg_line.call(tip_line);

    svg_line.append("g").selectAll(".time_tooltip")
      .data(d3.time.hours(tx, t2))
      .enter().append("rect")
      .attr("x", function(d){ return x(d)-20; })
      .attr("y", 0)
      .attr("width", 40)
      .attr("height", y.domain()[1])
      .attr("fill", "#fff")
      .data(data)
      .on("mouseover", function(d){ tip_line.show(d,'null'); })
      .on("mouseout", tip_line.hide);


    svg_line.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 8)
        .attr("dy", "-4em")
        .attr("dx", "-9em")
        .style("text-anchor", "start")
        .text("Followers")
        .style("font-size","0.8em");

    svg_line.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
        .selectAll("text")
          .text(function(d){ return d.getHours() == 12 ? formatTime(d) : formatTime1(d); })
          .style("font-weight", function(d){ return d.getHours() == 12 ? "bold" : ""; });

    var line = svg_line.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var totalLength = line.node().getTotalLength();

    function transLine(){
      line
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
          .duration(5000)
          .ease("linear")
          .attr("stroke-dashoffset", 0);
    };
    transLine();

    setInterval(function(){ transLine() }, 10000);

    sorted_data = data.sort(function(a, b){ return a.followers - b.followers; });
    forMinMax = [sorted_data[0], sorted_data[sorted_data.length-1]];

    svg_line.append("g").selectAll(".dots")
      .data(forMinMax)
      .enter().append("circle")
      .attr("cx", function(d){ return d != undefined ? x(d.date) : x(0);})
      .attr("cy", function(d){ return d != undefined ? y(d.followers) : y(0);})
      .attr("r", 1.8)
      .attr("fill", "#000")
      .on("mouseover", function(d, i){ i==0 ? tip_line.show(d,'Minimum') : tip_line.show(d,'Maximum'); })
      .on("mouseout", tip_line.hide);
};