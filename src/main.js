var width = 960,
    height = 500;
	
var svg = d3.select("#map").append("svg")
    .attr("width", width)
	.attr("height", height);
	
var map = svg.append("g").attr("id", "map");
	//append 'g', with 'id' 'plants' - 공장 위치 시각화

var projection = d3.geo.mercator()
    .scale(4000)
	.center([128,36])
	.translate([width/2, height/2]);
	
var path = d3.geo.path().projection(projection);
d3.json("../json/country-topo.json", function(error, data) {
	var features = topojson.feature(data, data.objects["municipalities-geo"]).features;
	
	map.selectAll("path")
	    .data(features)
	  .enter().append("path")
//		.attr("transform", function(d){ return "translate("+path.centroid(d)+")"; })
		.attr("dy", ".35em")
		.attr("d", path)
		.attr("class", "manicipality-label")
		.text(function(d){ return d.properties.name; })
});


//$(document).ready(main);