var width = 960,
    height = 500,
	centered;
	
var svg = d3.select("#map").append("svg")
    .attr("width", width)
	.attr("height", height);
	
var map = svg.append("g")
	.attr("id", "map");
	//append 'g', with 'id' 'plants' - 공장 위치 시각화

var projection = d3.geo.mercator()
    .scale(2500)
	.center([128,36])
	.translate([width/2, height/2]);
	
var path = d3.geo.path().projection(projection);

d3.json("json/skorea_provinces_topo_simple.json", function(error, data) {
	var features = topojson.feature(data, data.objects["skorea_provinces_geo"]).features;
	
	d3.csv("csv/pm10.csv", function(data) {
		var rateById = {};
		data.forEach(function(d) {
			console.log(d);
			rateById[d.province] = +d.value;
		});

		map.selectAll("path")
	    .data(features)
	  .enter().append("path")
	  //	.attr("transform", function(d){ return "translate("+path.centroid(d)+")"; })
	  	.attr("dy", ".35em")
		.attr("d", path)
		.attr("class", "municipality-label")
		.text(function(d){ return d.properties.name;})
		.style("fill", function(d) {
            return getcolor(rateById[d.properties.name]);
        })
		.on("click", myclick)
		.on("mouseenter", mymouseenter)
		.on("mouseleave", mymouseleave);
	})
});

d3.csv("csv/electric.csv", function(data) {
	map.selectAll("circle")
		.data(data)
		.enter().append("circle")
			.attr("cx", function(d) { return projection([d.lon, d.lat])[0]; })
			.attr("cy", function(d) { return projection([d.lon, d.lat])[1]; })
			.attr("r", 2);
});

svg.append("text")
	.attr("x", 10)
	.attr("y", 20)
	.attr("font-size", "20px")
	.attr("id", "zoom-in");
	
function getcolor(val) {
	if(val >= 151) return "#d7191c";
	else if(val < 151 && val >= 81) return "#fdae61";
	else if(val < 81 && val >= 31) return "#a6d96a";
	else if(val < 31 && val >= 0) return "#1a9641";
	else return "#000";
}
	
function myclick(d) {
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
	detailpage(d.properties.name);
}

function mymouseenter(d) {
	var x, y;
	var text;
	var centroid = path.centroid(d);
	x = centroid[0];
	y = centroid[1];
	text = d.properties.name;

	map.append("text")
		.attr("x", x)
		.attr("y", y)
		.attr("font-size", "15px")
		.attr("id", "mouse-enter")
		.text(text);
}

function mymouseleave(d) {
	$("#mouse-enter").remove();
}

function detailpage(index) {
	setCookie("province", index, 0.5);
	p = "detail.html";
	window.location.href=p;
}

function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

//$(document).ready(main);
