var width = 1000,
    height = 480,
    centered;

var playing = false;	// true: animation is playing
var pm = "pm10";		// pm mode: pm10 or pm2.5
var start_date = new Date("2016-01-01");	// slider start date
var end_date = new Date("2016-12-31");		// slider end date
var attributeArray = [];					// array that stores prev dust data
var windArray = [];							// array that stores prev wind data
var curr_date = new Date(start_date);		// current playing date in the animation
var timer;									// timer to count the date
var wind_name = ["Buan", "Chilbaldo", "Chujado", "Deokjeokdo", "Donghae", "Geojaedo", "Geomundo",
				"Incheon", "Marado", "Oeyeondo", "Pohang", "Seogwipo", "Sinan", "Tongyoung",
				"Uljin", "Ulleungdo", "Ulsan"];

var pm10_data = {}, pm25_data = {};

// default pm mode is selected as pm10
$("#pm_chbx").prop("checked", false);

// set slider min-max values and set the slide event
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

// play button click event
$("#play-button").click(function(d) {
	// set the timer and start animation
	if(playing === false) {
		d3.select(this).attr('src', 'stop-circle.png');
		timer = setInterval(function(){
			sequenceMap();
			if(curr_date < end_date) {
				curr_date.setDate(curr_date.getDate() + 1);
				$( "#slider-range" )
					.slider('values', [curr_date.getTime()/1000, end_date.getTime()/1000]);
				$( "#clock" ).text(curr_date.toDateString() + " - " + end_date.toDateString());
			} else {
				clearInterval(timer);
				$("#play-button").attr('src', 'play-circle.png');
				playing = false;
				start_date = new Date("2016-01-01");
				end_date = new Date("2016-12-31");
				curr_date = new Date(start_date);
				$( "#slider-range" )
					.slider('values', [start_date.getTime()/1000, end_date.getTime()/1000]);
				$( "#clock" ).text(start_date.toDateString() + " - " + end_date.toDateString());

				firstMap();
			}
        }, 1000);
        playing = true;
    } else {	// clear the timer and set the windows to the first state
      clearInterval(timer);
      $("#play-button").attr('src', 'play-circle.png');
      playing = false;
    	start_date = new Date("2016-01-01");
    	end_date = new Date("2016-12-31");
    	curr_date = new Date(start_date);
    	$( "#slider-range" )
    		.slider('values', [start_date.getTime()/1000, end_date.getTime()/1000]);
    	$( "#clock" ).text(start_date.toDateString() + " - " + end_date.toDateString());

    	// 화면을 최신 데이터에 맞도록 맞춤
        clearInterval(timer);
        $("#play-button").attr('src', 'play-circle.png');
        playing = false;
    		start_date = new Date("2016-01-01");
    		end_date = new Date("2016-12-31");
    		curr_date = new Date(start_date);
    		$( "#slider-range" )
    			.slider('values', [start_date.getTime()/1000, end_date.getTime()/1000]);
    		$( "#clock" ).text("");

    		firstMap();
    }
});

// map svg object
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
    .scale(4000)
	.center([127.3,35.89])
	.translate([width/2, height/2]);

var path = d3.geo.path().projection(projection);

// draw map with topo json file
d3.json("json/skorea_provinces_topo_simple.json", function(error, data) {
	var features = topojson.feature(data, data.objects["skorea_provinces_geo"]).features;

	// get dust data to color the map
	d3.csv("csv/" + pm + ".csv", function(data) {
		var rateById = {};
		data.forEach(function(d) {
			rateById[d.province] = +d.value;
		});

  	map.append("g")
	  .selectAll("path")
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

	// 화력 발전소 데이터를 사용하여 지도 위에 위치를 표시한다
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

	// 풍향/풍속 데이터를 사용하여 지도 위에 화살표를 표시한다.(line+marker)
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

// add legend to the map (화력발전소, 풍향)
var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("cx", width - 60)
	  .attr("cy", 40)
      .attr("r", 4)
	  .style("fill", "#f00");

  legend.append("text")
      .attr("x", width - 70)
	  .attr("y", 40)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("화력 발전소");

  legend.append("line")
    .attr("x1", width - 60)
	.attr("y1", 68)
	.attr("x2", width - 60)
	.attr("y2", 54)
	.style("stroke", "blue")
	.attr("marker-end", "url(#arrow-header)");

  legend.append("text")
    .attr("x", width - 70)
	.attr("y", 60)
	.attr("dy", ".35em")
	.style("text-anchor", "end")
	.text("풍향");

// 미세먼지 색상 기준
var ref = svg.append("g")
	.attr("id", "ref")
	.attr("transform", "translate(100,20)");

var ref_data = [{"status":"좋음", "color":"#1a9641", "min":0, "max":31},
				{"status":"보통", "color":"#a6d96a", "min":31, "max":81},
				{"status":"나쁨", "color":"#fdae61", "min":81, "max":151},
				{"status":"매우 나쁨", "color":"#d7191c", "min":151, "max":-1}];

ref.selectAll("rect")
	.data(ref_data)
	.enter().append("rect")
	.attr("x", 0)
	.attr("y", function(d, i) { return i * 40; })
	.attr("width", 40)
	.attr("height", 40)
	.style("fill", function(d, i) {
		return d.color;
	});

ref.selectAll("text")
	.data(ref_data)
	.enter().append("text")
	.attr("x", 60)
	.attr("y", function(d, i) { return i * 43 + 8; })
	.attr("dy", ".60em")
	.style("text-anchor", "start")
	.style("font-size", "18px")
	.text(function(d, i) {
		var st;
		if(d.max !== -1)
			st = d.status + " : " + d.min + "~" + d.max;
		else
			st = d.status + " : " + d.min + "~"
		return st;
	});

// decide colors according to dust density
function getcolor(val) {
	if(val >= 151) return "#d7191c";
	else if(val < 151 && val >= 81) return "#fdae61";
	else if(val < 81 && val >= 31) return "#a6d96a";
	else if(val < 31 && val >= 0) return "#1a9641";
	else return "#FFF";
}

// map click event: move to the detail page
function myclick(d) {
	detailpage(d.properties.name_eng, pm, d.properties.name);
}

// map mouse enter event: show detail information
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

  if(playing === true)
    return;

	var result = $.grep(attributeArray, function(e){
		var date = curr_date.yyyymmdd();
		return date === e["DATE1"];
	});

  var val = $.grep(result, function(c) {
    return c.LOC === d.properties.name_eng;
  });

  var pm10 = pm10_data[text];
  if(typeof(pm10) === "undefined" || pm10 === -900)
    pm10 = "No data";
  else
    pm10 = pm10 + '(㎍/㎥)';

  var pm25 = pm25_data[text];
  if(typeof(pm10) === "undefined" || pm25 === -900)
    pm25 = "No data";
  else
    pm25 = pm25 + '(㎍/㎥)';

	map.append("text")
		.attr("x", x)
		.attr("y", y)
    .attr("dy", "1em")
		.attr("font-size", "15px")
		.attr("class", "mouse-enter")
		// .text('PM10: ' + val[0].a_pm10);
		.text('PM10: ' + pm10);

	map.append("text")
		.attr("x", x)
		.attr("y", y)
    .attr("dy", "2em")
		.attr("font-size", "15px")
		.attr("class", "mouse-enter")
		.text('PM2.5: ' + pm25);
}

function mymouseleave(d) {
	$(".mouse-enter").remove();
}

// mouse enter event for 화력발전소
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

// set Cookie and move to the detail page
function detailpage(index1, index2, index3) {
	setCookie("province", index1, 0.5);
	setCookie("pm", index2, 0.5);
	setCookie("kor_nm", index3, 0.5);
	p = "detail.html";
	window.location.href=p;
}

function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

// change map coloring according to pm mode
function pm_switch(chbx) {
  if (chbx.checked == true)
    pm = 'pm25';
  else
    pm = 'pm10';

  map.selectAll("g").selectAll("path")
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

// get past data after the page has loaded
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

// change date format to yyyymmdd
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

// change date format to yyyy-mm-dd
Date.prototype.dashform = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
}

// sequence map (animation): change color, wind arrow according to the current date
function sequenceMap() {
	var result = $.grep(attributeArray, function(e){
		var date = curr_date.yyyymmdd();
		return date === e["DATE1"];
	});

	//result.forEach(function(d1) {
		map.selectAll("g").selectAll("path")
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
}

// 화면을 최신 데이터에 기반하여 처음으로 돌려놓는다(after the animation)
function firstMap() {
	d3.csv("csv/" + pm + ".csv", function(data) {
		var rateById = {};
		data.forEach(function(d) {
			rateById[d.province] = +d.value;
		});
		map.selectAll("g").selectAll("path")
			.style("fill", function(d) {
				return getcolor(rateById[d.properties.name]);
			});
	});

	d3.csv("csv/wind.csv", function(data) {
		map.selectAll("line")
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
			});

		map.select("#arrow-header")
			.selectAll("path")
				.style("fill", "blue");
	});
}

$(document).ready(getData);
