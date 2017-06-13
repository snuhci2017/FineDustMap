var width = 780,
    height = 700,
    centered;

var playing = false;
var pm = "pm10";
var start_date = new Date("2016-01-01");
var end_date = new Date("2016-12-31");
var attributeArray = [];
var windArray = [];
var curr_date = new Date(start_date);
var timer;
var wind_name = ["Buan", "Chilbaldo", "Chujado", "Deokjeokdo", "Donghae", "Geojaedo", "Geomundo",
				"Incheon", "Marado", "Oeyeondo", "Pohang", "Seogwipo", "Sinan", "Tongyoung",
				"Uljin", "Ulleungdo", "Ulsan"];

var pm10_data = {}, pm25_data = {};

$("#pm_chbx").prop("checked", false);
$( function() {
		$( "#slider-range" ).slider({
			range: true,
			min: new Date("2016-01-01").getTime()/1000,
			max: new Date("2016-12-31").getTime()/1000,
			values: [new Date("2016-01-01").getTime()/1000, new Date("2016-12-31").getTime()/1000],
			slide: function( event, ui ) {
				start_date = new Date(ui.values[ 0 ] *1000);
				end_date = new Date(ui.values[ 1 ] *1000);
				curr_date = new Date(start_date);
				$( "#clock" ).text(start_date.toDateString() + " - " + end_date.toDateString());
			}
		});
} );

$("#play-button").click(function(d) {
	if(playing === false) {
		d3.select(this).attr('src', 'stop-circle.png');
		timer = setInterval(function(){
			sequenceMap();
			if(curr_date < end_date) {
				curr_date.setDate(curr_date.getDate() + 1);
				$( "#slider-range" )
					.slider('values', [curr_date.getTime()/1000, end_date.getTime()/1000]);
				$( "#clock" ).text(curr_date + " - " + end_date);
			} else {
				clearInterval(timer);
				$("#play-button").attr('src', 'play-circle.png');
				playing = false;
				start_date = new Date("2016-01-01");
				end_date = new Date("2016-12-31");
				curr_date = new Date(start_date);
				$( "#slider-range" )
					.slider('values', [start_date.getTime()/1000, end_date.getTime()/1000]);
				$( "#clock" ).text(start_date + " - " + end_date);
			}

        }, 1000);
        playing = true;
    } else {
        clearInterval(timer);
        $("#play-button").attr('src', 'play-circle.png');
        playing = false;
		start_date = new Date("2016-01-01");
		end_date = new Date("2016-12-31");
		curr_date = new Date(start_date);
		$( "#slider-range" )
			.slider('values', [start_date.getTime()/1000, end_date.getTime()/1000]);
		$( "#clock" ).text("");

		// 화면을 최신 데이터에 맞도록 맞춤
    }
});

var svg = d3.select("#map").append("svg")
    .attr("width", width)
	.attr("height", height)
	.attr("align","center");

var map = svg.append("g")
	.attr("id", "map");

// arrow header 등록
map.append("svg:defs").append("svg:marker")
    .attr("id", "arrow-header")
    .attr("refX", 3)
    .attr("refY", 3)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L0,6 L6,3 L0,0")
    .style("fill", "blue");

var projection = d3.geo.mercator()
    .scale(5500)
	.center([128,36])
	.translate([width/2, height/2]);

var path = d3.geo.path().projection(projection);

d3.json("json/skorea_provinces_topo_simple.json", function(error, data) {
	var features = topojson.feature(data, data.objects["skorea_provinces_geo"]).features;

	d3.csv("csv/" + pm + ".csv", function(data) {
		var rateById = {};
		data.forEach(function(d) {
			rateById[d.province] = +d.value;
		});

  	map.selectAll("path")
      .data(features)
    .enter().append("path")
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

	d3.csv("csv/electric.csv", function(data) {
		map.selectAll("circle")
			.data(data)
			.enter().append("circle")
				.attr("cx", function(d) { return projection([d.lon, d.lat])[0]; })
				.attr("cy", function(d) { return projection([d.lon, d.lat])[1]; })
				.attr("r", 4)
			.style("fill","#f00")
      .on("mouseenter", elecmouseenter)
      .on("mouseleave", elecmouseleave);
	});

	d3.csv("csv/wind.csv", function(data) {

		map.selectAll("line")
			.data(data)
			.enter().append("line")
				.attr("class", "line")
				.attr("x1", function(d) { return projection([d.lon, d.lat])[0]; })
				.attr("y1", function(d) { return projection([d.lon, d.lat])[1]; })
				.attr("x2", function(d) {
					var x = +d.lon + (+d.speed * Math.cos(toRadians(+d.direction)) * 0.08);
					var y = +d.lat + (+d.speed * Math.sin(toRadians(+d.direction)) * 0.08);
					return projection([x, y])[0];
				})
				.attr("y2", function(d) {
					var x = +d.lon + (+d.speed * Math.cos(toRadians(+d.direction)) * 0.08);
					var y = +d.lat + (+d.speed * Math.sin(toRadians(+d.direction)) * 0.08);
					return projection([x, y])[1];
				})
			  .attr("stroke-width", 0.8)
			  .attr("stroke", "blue")
			  .attr("marker-end", "url(#arrow-header)");
	});
});

svg.append("text")
	.attr("x", 10)
	.attr("y", 20)
	.attr("font-size", "20px")
	.attr("id", "zoom-in");

/*
var legend = svg.selectAll(".legend")
  .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("cx", width + margin.left)
	  .attr('cy', 3)
      .attr("width", 5)
	  .attr('height', 5)
      .style("fill", function(d) {return color(d.location);});

  legend.append("text")
      .attr("x", width - 10 + margin.left)
	  .attr('y', 5)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) {return d.location;});
*/

function getcolor(val) {
	if(val >= 151) return "#d7191c";
	else if(val < 151 && val >= 81) return "#fdae61";
	else if(val < 81 && val >= 31) return "#a6d96a";
	else if(val < 31 && val >= 0) return "#1a9641";
	else return "#FFF";
}

function myclick(d) {
	// var x, y, k;
  //
	// if (d && centered !== d) {
	// 	var centroid = path.centroid(d);
	// 	x = centroid[0];
	// 	y = centroid[1];
	// 	k = 4;
	// 	centered = d;
	// } else {
	// 	x = width / 2;
	// 	y = height / 2;
	// 	k = 1;
	// 	centered = null;
	// }
  //
	// map.transition()
	// 	.duration(750)
	// 	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
	// 	.style("stroke-width", 1.5 / k + "px");
	detailpage(d.properties.name_eng, pm);
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
    .attr("dy", "0em")
		.attr("font-size", "15px")
		.attr("class", "mouse-enter")
		.text(text);

	map.append("text")
		.attr("x", x)
		.attr("y", y)
    .attr("dy", "1em")
		.attr("font-size", "15px")
		.attr("class", "mouse-enter")
		.text('PM10: ' + pm10_data[text]);

	map.append("text")
		.attr("x", x)
		.attr("y", y)
    .attr("dy", "2em")
		.attr("font-size", "15px")
		.attr("class", "mouse-enter")
		.text('PM2.5: ' + pm25_data[text]);
}

function mymouseleave(d) {
	$(".mouse-enter").remove();
}

function elecmouseenter(d) {
	map.append("text")
		.attr("x", projection([d.lon, d.lat])[0])
		.attr("y", projection([d.lon, d.lat])[1])
		.attr("font-size", "15px")
		.attr("id", "elec-mouse-enter")
		.text(d.name);
}

function elecmouseleave(d) {
	$("#elec-mouse-enter").remove();
}

function detailpage(index1, index2) {
	setCookie("province", index1, 0.5);
	setCookie("pm", index2, 0.5);
	p = "detail.html";
	window.location.href=p;
}

function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function pm_switch(chbx) {
  if (chbx.checked == true)
    pm = 'pm25';
  else
    pm = 'pm10';

	map.selectAll("path")
	  .style("fill", function(d) {
      if(pm === 'pm10')
        return getcolor(pm10_data[d.properties.name]);
      else
        return getcolor(pm25_data[d.properties.name]);
    });
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function getData() {
	d3.csv("csv/TS_DL_AVG.csv", function(data) {
		data.forEach(function(d) {
			attributeArray.push(d);
		});
	});

	for(var i = 0; i < wind_name.length; i++) {
		var wind_path = "csv/" + wind_name[i] + "_wind.csv";
		d3.csv(wind_path, function(data) {
			data.forEach(function(d) {
				windArray.push(d);
			});
		});
	}

  d3.csv("csv/pm10.csv", function(data) {
    data.forEach(function(d) {
      pm10_data[d.province] = +d.value;
    })
  });

  d3.csv("csv/pm25.csv", function(data) {
    data.forEach(function(d) {
      pm25_data[d.province] = +d.value;
    })
  });
}

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

Date.prototype.dashform = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
}

function sequenceMap() {
	var result = $.grep(attributeArray, function(e){
		var date = curr_date.yyyymmdd();
		return date === e["DATE1"];
	});

	//result.forEach(function(d1) {
		map.selectAll("path")
			.style("fill", function(d2) {
				var val = $.grep(result, function(c) {
					return c.LOC === d2.properties.name_eng;
				});
				if(val.length > 0) {
					if(pm === "pm10") {
						return getcolor(val[0].a_pm10);
					} else {
						return getcolor(val[0].a_pm25);
					}
				}
			});
	var wind_result = $.grep(windArray, function(e){
		var date = curr_date.dashform();
		return date === e["date"];
	});

		map.selectAll("line")
			.attr("x2", function(d) {
				var val = $.grep(wind_result, function(c) {
					return c.buoy === d.buoy;
				});
				var x, y;
				if(val.length === 0) {
					x = +d.lon + (+d.speed * Math.cos(toRadians(+d.direction)) * 0.08);
					y = +d.lat + (+d.speed * Math.sin(toRadians(+d.direction)) * 0.08);
				} else {
					x = +d.lon + (+val[0].speed * Math.cos(toRadians(+val[0].direction)) * 0.08);
					y = +d.lat + (+val[0].speed * Math.sin(toRadians(+val[0].direction)) * 0.08);
				}
				return projection([x, y])[0];
			})
			.attr("y2", function(d) {
				var val = $.grep(wind_result, function(c) {
					return c.buoy === d.buoy;
				});
				var x, y;
				if(val.length === 0) {
					x = +d.lon + (+d.speed * Math.cos(toRadians(+d.direction)) * 0.08);
					y = +d.lat + (+d.speed * Math.sin(toRadians(+d.direction)) * 0.08);
				} else {
					x = +d.lon + (+val[0].speed * Math.cos(toRadians(+val[0].direction)) * 0.08);
					y = +d.lat + (+val[0].speed * Math.sin(toRadians(+val[0].direction)) * 0.08);
				}
				return projection([x, y])[1];
			})

		map.select("#arrow-header")
			.selectAll("path")
				.style("fill", "blue");
			//.attr("stroke-width", 0.8)
			//.attr("stroke", "blue")
			//.attr("marker-end", "url(#arrow-header)");

	//});
}

$(document).ready(getData);
