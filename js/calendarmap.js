var calendarmap = function(data, id){
    var margin = {top: 60, right: 40, bottom: 30, left: 20},
        width = 950,
        height = 185,
        cellSize = 17,
        weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        years = d3.range(data[0].date.getFullYear(), data.slice(-1)[0].date.getFullYear()+1);

    var percent = d3.format(".1%"),
        comma = d3.format(","),
        format = d3.time.format("%Y-%m-%d"),
        formatDate = d3.time.format("%d"),
        formatMonth = d3.time.format("%b-%Y");

    var color = d3.scale.linear()
            .range(["#fee6ce", "#e6550d"]);

    var hor_barWidth = d3.scale.linear()
            .range([1, 60]);

    var ver_barWidth = d3.scale.linear()
            .range([1, 60]);

    var followers = {};

    data.forEach(function(d){ followers[format(d.date)] = d.followers; });

    color.domain(d3.extent(d3.values(followers)));

    weekly_average = [], hb_min = 0, hb_max = 0, week_on_week_average = [], vb_min = 0, vb_max = 0;

    years.map(function(y){
        var wa = [], wb = [];
        weekDays.map(function(w){
            var val = [];
            data.filter(function(d){
                d.date.getFullYear() == y && weekDays[d.date.getDay()] == w ? val.push(d.followers): null;
            });
            mn = Math.ceil(d3.mean(val));
            hb_max = d3.max([hb_max, mn]);
            hb_min = d3.min([hb_min, d3.max([0, mn])]);
            wa.push(mn || 0);
        });
        weekly_average.push(wa);
        d3.range(0, 53).map(function(w){
            var val = [];
            data.filter(function(d){
               d.date.getFullYear() == y && d3.time.weekOfYear(d.date) == w ? val.push(d.followers): null;
            });
            mn = Math.ceil(d3.mean(val));
            vb_max = d3.max([vb_max, mn]);
            vb_min = d3.min([vb_min, mn]);
            wb.push(mn || 0);
        });
        week_on_week_average.push(wb);
    });

    hor_barWidth.domain([hb_min, hb_max]);
    ver_barWidth.domain([vb_min, vb_max]);

    var tip_cal = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-5, 0])
            .html(function(d){
                return followers[format(d)] != undefined ?
                        "<div> Date: "+ format(d) +" ("+weekDays[d.getDay()]+")<div>"+
                        "<div style='margin-top:5px'> Followers gained: "+ comma(followers[format(d)]) +"</div>" : format(d);
            });

    var svg_cal = d3.select(id).selectAll("svg")
            .data(years)
            .enter().append("svg")
            //.style("border", "1px solid #ddd")
            .attr("width", "100%")
            .attr("viewBox", "0 0 "+(width + margin.left + margin.right)+" "+(height + margin.bottom))
            .attr("preserveAspectRatio", "xMidYMin meet");

        svg_cal.call(tip_cal);

        // svg_cal.append("text")
        //         .attr("transform", "translate("+(width+margin.right+2)+"," + (cellSize * 7) + ") rotate(90)")
        //         .style("text-anchor", "middle")
        //         .text(function(d) { return d; });

    var calender = svg_cal.append("g")
            .attr("transform", "translate(" + ((width - cellSize * 45) / 2) + "," + (height - cellSize * 7 - 1) + ")");

    var weekly_bars = svg_cal.append("g")
            .attr("transform", "translate(" + margin.left + "," + (height - cellSize * 7 - 1) + ")");

    var wow_bars = svg_cal.append("g")
            .attr("transform", "translate(" + ((width - cellSize * 45) / 2) + ", 0)");

    var horiz_bars = weekly_bars.selectAll(".weekly_bar")
            .data(function(d, i){ return weekly_average[i]; });

        horiz_bars.enter().append("rect")
            .attr("class", "weekly_bars_rects")
            .attr("x", function(d){ return d > 0 ? hor_barWidth.range()[1] - hor_barWidth(d) - margin.left : margin.left;})
            .attr("y", function(d, i){ return i*cellSize; })
            .attr("width", function(d){ return d > 0 ? hor_barWidth(d) : 0;})
            .attr("height", cellSize - 2);

        horiz_bars.enter().append("text")
            .attr("class", "weekly_bars_vals")
            .attr("x", function(d){ return hor_barWidth.range()[1] - margin.left*2 - 12; })
            .attr("y", function(d, i){ return i*cellSize+12; })
            .text(function(d){ return d > 0 ? comma(d) : ''; });

    var vert_bars = wow_bars.selectAll(".wow_bar")
            .data(function(d, i){ return week_on_week_average[i]; });

        vert_bars.enter().append("rect")
            .attr("class", "wow_bars_rects")
            .attr("x", function(d, i){ return i*cellSize; })
            .attr("y", function(d){ return ver_barWidth.range()[1] - ver_barWidth(d); })
            .attr("width", cellSize - 2)
            .attr("height", function(d){ return d > 0 ? ver_barWidth(d) : 0; });

        vbtexts = vert_bars.enter().append("text")
            .attr("class", "wow_bars_vals")
            .attr("x", function(d){ return -margin.top+2; })
            .attr("y", function(d, i){ return i*cellSize+12; })
            .text(function(d){ return d > 0 ? comma(d) : ''; })
            .attr("transform", "rotate(-90)");

    var day = calender.selectAll(".day")
            .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); });

        day.enter().append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
            .attr("y", function(d) { return d.getDay() * cellSize; })
            .style("fill", function(d){ return followers[format(d)] != 'undefined' ? color(followers[format(d)]) : '#fff'; })
            .datum(format);

        day.enter().append("text")
            .attr("class", "dayLable")
            .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize + 2; })
            .attr("y", function(d) { return d.getDay() * cellSize + cellSize/2 + 4; })
            .text(function(d){ return formatDate(d); })
            .on("mouseover", tip_cal.show)
            .on("mouseout", tip_cal.hide);

    var months = calender.selectAll(".month")
            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); });

        calender.selectAll(".weeks")
            .data(weekDays)
            .enter().append("text")
            .attr("x", -30)
            .attr("y", function(d, i){ return i*cellSize+12})
            .text(String)
            .style("font-size", "0.8em");

        months.enter().append("path")
            .attr("class", "month")
            .attr("d", monthPath);

        months.enter().append("text")
            .attr("class", "monthNames")
            .attr("x", function(d, i){ return d3.time.weekOfYear(d) * cellSize; })
            .attr("y", height-50)
            .text(function(d){ return formatMonth(d); })
            .style("font-size", "0.8em");

    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
            d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
            + "H" + w0 * cellSize + "V" + 7 * cellSize
            + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
            + "H" + (w1 + 1) * cellSize + "V" + 0
            + "H" + (w0 + 1) * cellSize + "Z";
    }
};