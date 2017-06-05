var svg_width = 960, svg_height = 500,
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg_width - margin.left - margin.right,
    height = svg_height - margin.top - margin.bottom;

var province_name = getCookie("province");

var svg = d3.select("#chart").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height);

var chart = svg.append("g")
          .attr("id", "chart")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.time.format("%Y%m%d").parse;

d3.csv("csv/TS_DL_AVG.csv", function(data) {
  var province_data = [];

  data.forEach(function (d) {
    if(d.LOC == province_name) {
      // console.log(d.DATE1);
      d.date = parseTime(d.DATE1);
      province_data.push(d);
    }
  });
  console.log(province_data);

  var x = d3.time.scale()
        .range([0, width])
        .domain(d3.extent(province_data, function(d) { return d.date; }));

  var y1 = d3.scale.linear()
      .range([height, 0])
      .domain([0, 200
        // d3.min(province_data, function(d){return d.a_pm10;}),
        // d3.max(province_data, function(d){return d.a_pm10;})
      ]);

  var y2 = d3.scale.linear()
      .range([height, 0])
      .domain([0, 80
        // d3.min(province_data, function(d){return d.a_pm25;}),
        // d3.max(province_data, function(d){return d.a_pm25;})
      ]);

  console.log("min" + d3.min(province_data, function(d){return d.a_pm10;}));
  console.log("max" + d3.max(province_data, function(d){return d.a_pm10;}));


  var line1 = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y1(d.a_pm10); });


  var line2 = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y2(d.a_pm25); });

  chart.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis().scale(x).orient('bottom'))
    .append("text")
      .attr("transform", "translate(" + width +", 0)")
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("date");

  chart.append("g")
      .attr("class", "axis axis--y")
      .call(d3.svg.axis().scale(y1).orient('left'))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("PM10");

  chart.append("g")
      .attr("transform", "translate(" + width + ", 0)")
      .attr("class", "axis axis--y2")
      .call(d3.svg.axis().scale(y2).orient('right'))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("PM25");

  chart.append("path")
    .attr("class", "line")
    .attr("d", line1(province_data))

  chart.append("path")
    .attr("class", "line")
    .attr("d", line2(province_data))
    .style("stroke", "#f00");

  // var city = g.selectAll(".city")
  //   .data(cities)
  //   .enter().append("g")
  //     .attr("class", "city");
  //
  // city.append("path")
  //     .attr("class", "line")
  //     .attr("d", function(d) { return line(d.values); })
  //     .style("stroke", function(d) { return z(d.id); });
  //
  // city.append("text")
  //     .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
  //     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
  //     .attr("x", 3)
  //     .attr("dy", "0.35em")
  //     .style("font", "10px sans-serif")
  //     .text(function(d) { return d.id; });
});

function getCookie(c_name) {
  var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name) {
			return unescape(y);
		}
	}
}
