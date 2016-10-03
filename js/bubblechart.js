var bubblechart = function(data, legends, id){
    var margin = {top: 10, right: 50, bottom: 10, left: 20},
        width = 550 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom,
        //user = decodeURIComponent(window.location.search.split('=')[1]),
        user = 'narendramodi',
        color1 = d3.scale.category10();
        color = d3.scale.ordinal()
                .domain(legends)
                .range(color1.range().slice(0, legends.length));

    var convertTime = function(serverdate) { return new Date(serverdate + " UTC"); },
        parseDate = d3.time.format("%A %d %b %Y"),
        fromDate  = parseDate(convertTime(data[0].created_at)),
        toDate = parseDate(convertTime(data.slice(-1)[0].created_at));

        d3.selectAll(".fromDate1kTweets").text(fromDate);
        d3.selectAll(".toDate1kTweets").text(toDate);

    var leg_div = d3.select("#bubblechart_legend");

        leg_div.selectAll(".bub_legs")
            .data(legends)
            .enter().append("span")
            .attr("class", "badge")
            .style("background-color", color)
            .text(String);

        leg_svg1 = leg_div.append("span").append("svg")
            .attr({"width": 50, "height": 15});

        leg_svg1.append("rect")
                .attr({"x": 0, "y": 5, "width": 8, "height": 8, "fill": "#969696"});

        leg_svg1.append("text")
                .attr({"x": 11, "y": 12})
                .text("Retweet")
                .style({"font-size": "0.7em", "fill": "#969696"});

        leg_svg2 = leg_div.append("span").append("svg")
            .attr({"width": 50, "height": 15});

        leg_svg2.append("polygon")
                .attr({"points": "8.75,2.75 4.5,14.375 13.875,6.875 2.75,6.875 12,13.875", "fill":"#969696"});

        leg_svg2.append("text")
                .attr({"x": 16, "y": 12})
                .text("Reply")
                .style({"font-size": "0.7em", "fill": "#969696"});

    var tip_bub = d3.tip()
            .attr('class', 'd3-tip-bubble')
            .offset([-5, 0])
            .html(function(d){
                return d.text;
            });

    var svg_bub = d3.select(id).append("svg")
            .attr("width", "100%")
            //.attr("height", "100%")
            //.style("border", "1px solid #ddd")
            .attr("viewBox", "0 0 "+(width + margin.left + margin.right)+" "+(height + margin.bottom))
            .attr("preserveAspectRatio", "xMidYMin meet");

        svg_bub.call(tip_bub);

    sorted_retweets_count = _.sortBy(data, 'retweet_count');
    sorted_favorites_count = _.sortBy(data, 'favorite_count');

    buckets = [100, 500, 1000, 2500, 5000, 7500, 10000, 15000, 20000, 25000]
    bucket_dict = ['< 99', '100 - 499', '500 - 999', '1000 - 2499', '2500 - 4999', '5000 - 7499',
                   '7500 - 9999', '10000 - 14999', '15000 - 19999', '20000 - 24999', '> 25000'];

    tweets_buckets = {};

    bucket_dict.map(function(b, i){
        if(i == 0){
            temp = sorted_retweets_count.filter(function(d){
                return d.retweet_count < buckets[i];
            });
            if(temp.length > 0) tweets_buckets[bucket_dict[i]] = temp;
        }else if(i < bucket_dict.length-1){
            temp = sorted_retweets_count.filter(function(d){
                return d.retweet_count >= buckets[i-1] && d.retweet_count < buckets[i];
            });
            if(temp.length > 0) tweets_buckets[bucket_dict[i]] = temp;
        }else{
            temp = sorted_retweets_count.filter(function(d){
                return d.retweet_count > buckets[i-1];
            });
            if(temp.length > 0) tweets_buckets[bucket_dict[i]] = temp;
        }
    });

    new_buckets = _.keys(tweets_buckets).reverse();

    x_pos = 120, y_pos = 30, new_y_pos = 0, radius = 4.5, max_bubbles_in_row = 32;

    legend_line = svg_bub.append("g")
           .attr("transform", "translate("+(x_pos-10)+","+margin.top+")")
           .append("line")
           .attr("class", "legend_line")
           .attr("x1", 0)
           .attr("y1", 0)
           .attr("x2", 0);

    new_buckets.map(function(b, i){
        svg_bub.append("g")
            .attr("transform", "translate("+(x_pos-15)+","+(new_y_pos+y_pos+4)+")")
            .append("text")
            .attr("class", "bubblechart_legend_label")
            .text(b);

        svg_bub.append("g")
            .attr("transform", "translate("+x_pos+","+new_y_pos+")")
            .selectAll(".bubbles")
            .data(tweets_buckets[b])
            .enter().append("circle")
            .attr("cx", function(d, i){ if(d.text.split(" ")[0] != 'RT') return (i % max_bubbles_in_row) * radius * 2.5; })
            .attr("cy", function(d, i){ if(d.text.split(" ")[0] != 'RT') return Math.floor(i/max_bubbles_in_row) * radius * 2.5 + y_pos; })
            .attr("r", radius)
            .attr("fill", function(d){ return color(_.sample(d3.range(legends.length))); })
            .attr("stroke", "none")
            .attr("class", "btn")
            .attr("data-placement", "bottom")
            .attr("data-toggle", "popover")
            .attr("data-content", function(d){
                return "<blockquote class='twitter-tweet' lang='en' width='100%' height='100%' data-link-color='blue' data-theme='light'" +
                       "data-conversation='none' data-cards='hidden' align='left' datachrome='noborders transparent'>"+
                       "<a href='https://twitter.com/"+user+"/statuses/"+d['id']+"'></a></blockquote>"+
                       "<script src='//platform.twitter.com/widgets.js' charset='utf-8'></script>";
            })
            .attr("data-text", function(d){ return d.text; })
            .attr("data-favorite", function(d){ return d.favorites_count; })
            .attr("data-retweet", function(d){ return d.retweet_count; })
            .on("mouseover", tip_bub.show)
            .on("mouseout", tip_bub.hide);


        svg_bub.append("g")
            .attr("transform", "translate("+x_pos+","+new_y_pos+")")
            .selectAll(".bubbles_rect")
            .data(tweets_buckets[b])
            .enter().append("rect")
            .attr("x", function(d, i){ if(d.text.split(" ")[0] == 'RT') return (i % max_bubbles_in_row) * radius * 2.5 - 4; })
            .attr("y", function(d, i){ if(d.text.split(" ")[0] == 'RT') return Math.floor(i/max_bubbles_in_row) * radius * 2.5 + y_pos - 4; })
            .attr("width", function(d){ if(d.text.split(" ")[0] == 'RT') return 8;})
            .attr("height", function(d){ if(d.text.split(" ")[0] == 'RT') return 8;})
            .attr("fill", "#969696")
            .attr("stroke", "none")
            .on("mouseover", tip_bub.show)
            .on("mouseout", tip_bub.hide);


        new_y_pos += Math.floor(tweets_buckets[b].length/max_bubbles_in_row) * radius * 2.5 + y_pos;

        legend_line.attr("y2", new_y_pos+10);
    });

};