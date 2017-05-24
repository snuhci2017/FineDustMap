var width = 960,
    height = 500,
	centered;
	
var svg = d3.select("#map").append("svg")
    .attr("width", width)
	.attr("height", height);
	
var map = svg.append("g").attr("id", "map");
	//append 'g', with 'id' 'plants' - 공장 위치 시각화

var projection = d3.geo.mercator()
    .scale(2500)
	.center([128,36])
	.translate([width/2, height/2]);
	
var path = d3.geo.path().projection(projection);

d3.json("json/country-topo.json", function(error, data) {
	var features = topojson.feature(data, data.objects["municipalities-geo"]).features;
	
	map.selectAll("path")
	    .data(features)
	  .enter().append("path")
		.attr("dy", ".35em")
		.attr("d", path)
		.attr("class", "municipality-label")
		.text(function(d){ return d.properties.name; })
		.on("click", myclicked)
});

svg.append("text")
	.attr("x", 10)
	.attr("y", 20)
	.attr("font-size", "20px")
	.attr("id", "zoom-in");

function myclicked(d) {
	var x, y, k;
	var text;

	if (d && centered !== d) {
		var centroid = path.centroid(d);
		x = centroid[0];
		y = centroid[1];
		k = 4;
		centered = d;
		text = "zoom in " + d.properties.name;
	} else {
		x = width / 2;
		y = height / 2;
		k = 1;
		centered = null;
		text = "";
	}

	map.transition()
		.duration(750)
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		.style("stroke-width", 1.5 / k + "px");
	$("#zoom-in").text(text);

}


//$(document).ready(main);
