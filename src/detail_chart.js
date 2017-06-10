var svg_width = 960, svg_height = 500,
    margin = {top: 40, right: 150, bottom: 100, left: 50},
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
var province_data = [];

d3.csv("csv/TS_DL_AVG.csv", function(data) {

  data.forEach(function (d) {
    if(d.LOC == province_name) {
      // console.log(d.DATE1);
      d.date = parseTime(d.DATE1);
      d.a_pm10 = Number(d.a_pm10);
      d.a_pm25 = Number(d.a_pm25);
      province_data.push(d);
    }
  });

  var x = d3.time.scale()
        .range([0, width])
        .domain([
          d3.time.month.offset(d3.max(province_data, function(d) { return d.date; }), -3),
          // d3.min(province_data, function(d) { return d.date; }),
          d3.max(province_data, function(d) { return d.date; })
        ]);

  console.log(d3.min(province_data, function(d) { return d.date; }));
  console.log(d3.time.month.offset(d3.max(province_data, function(d) { return d.date; }), -3));
  console.log(d3.max(province_data, function(d) { return d.date; }));

  var y1 = d3.scale.linear()
      .range([height, 0])
      .domain([
        d3.min(province_data, function(d){return d.a_pm10;}),
        d3.max(province_data, function(d){return d.a_pm10;})
      ]);

  var y2 = d3.scale.linear()
      .range([height, 0])
      .domain([
        d3.min(province_data, function(d){return d.a_pm25;}),
        d3.max(province_data, function(d){return d.a_pm25;})
      ]);

  var line1 = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y1(d.a_pm10); });

  var line2 = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y2(d.a_pm25); });

  chart.append("defs").append("clipPath")
      .attr("id", "clip")
        .append("rect")
      .attr("width", width)
      .attr("height", height);

  chart.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis().scale(x).orient('bottom'))
      .selectAll("text")
        .attr("x", 9)
        .attr("y", -9)
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
    // .append("text")
    //   .attr("transform", "translate(" + width +", 0)")
    //   .attr("dy", "0.71em")
    //   .attr("fill", "#000")
    //   .text("date");

  chart.append("g")
      .attr("class", "axis axis--y")
      .call(d3.svg.axis().scale(y1).orient('left'))
    .append("text")
      // .attr("transform", "rotate(-90)")
      .attr("transform", "translate(-40, -30)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("PM10");

  chart.append("g")
      .attr("transform", "translate(" + width + ", 0)")
      .attr("class", "axis axis--y2")
      .call(d3.svg.axis().scale(y2).orient('right'))
    .append("text")
      // .attr("transform", "rotate(-90)")
      .attr("transform", "translate(0, -30)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("PM2.5");

  chart.append("path")
    .attr("class", "line")
    .attr("d", line1(province_data))
    .style("stroke", "#0f0")
    .attr("clip-path", "url(#clip)");

  chart.append("path")
    .attr("class", "line")
    .attr("d", line2(province_data))
    .style("stroke", "#f00")
    .attr("clip-path", "url(#clip)");

  var legend = chart.append('g')
    .attr('class', 'legend');

  legend.append('rect')
    .attr('x', width + 40)
    .attr('y', 30)
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', '#0f0');
  legend.append('text')
      .text('PM10')
      .attr('x', width + 40)
      .attr('y', 30)
      .attr('transform', 'translate(15, 10)');

  legend.append('rect')
    .attr('x', width + 40)
    .attr('y', 50)
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', '#f00');
  legend.append('text')
      .text('PM2.5')
      .attr('x', width + 40)
      .attr('y', 50)
      .attr('transform', 'translate(15, 10)');
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
