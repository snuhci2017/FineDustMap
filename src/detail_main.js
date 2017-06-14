var width = 800,
    height = 400,
	centered;

var playing = false;	// true: animation is playing
var pm = "pm10";		// pm mode: pm10 or pm2.5
var start_date = new Date("2016-01-01");	// slider start date
var end_date = new Date("2016-12-31");		// slider end date
var attributeArray = [];					// array that stores prev dust data
var curr_date = new Date(start_date);		// current playing date in the animation
var timer;									// timer to count the date
var sigungu = "";

var pm10_data = {}, pm25_data = {};

// receive pm mode, province name(eng/kor) from the previous page
pm = getCookie("pm");
var province_name = getCookie("province");
var kor_province = getCookie("kor_nm");

// change page's province name text
$("#prov_name").text(kor_province);

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
});

// play button click event
$("#play-button").click(function(d) {
	// set the timer and start animation
	if(playing === false) {
		d3.select(this).attr('src', 'stop-circle.png');
		timer = setInterval(function(){
			sequenceMap();
			sequenceChart();
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
				
				// 화면을 최신 데이터에 맞도록 맞춤
				firstMap();
				redraw_chart();
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
		firstMap();
		redraw_chart();
    }
});

// map svg object
var svg = d3.select("#map").append("svg")
    .attr("width", "100%")
    .attr("height", height);

var map = svg.append("g")
	.attr("id", "map");

var projection = d3.geo.mercator()
	.translate([width/2, height/2]);

var path = d3.geo.path().projection(projection);

var map_path = "json/" + province_name + "-topo.json";

// control projection location with the data
d3.csv("csv/projection_data.csv", function(data) {
  var projection_data = {};
  data.forEach(function(d) {
    projection_data[d.province] = d;
  });

  // draw map with topo json file
  d3.json(map_path, function(error, data) {
    projection.scale(projection_data[province_name].scale)
    	.center([projection_data[province_name].center_x, projection_data[province_name].center_y]);

  	var features = topojson.feature(data, data.objects["TL_SCCO_SIG_crs84-m2s"]).features;

	// get dust data to color the map
  	d3.csv("csv/" + province_name + "_" + pm + ".csv", function(data) {
  		var rateById = {};
  		data.forEach(function(d) {
  			rateById[d.gungu] = +d.value;
  		});

  		map.selectAll("path")
  	    .data(features)
  	  .enter().append("path")
  	  	.attr("dy", ".35em")
  		.attr("d", path)
  		.attr("class", "municipality-label")
  		.text(function(d){ return d.properties.SIG_KOR_NM;})
  		.style("fill", function(d) {
            return getcolor(rateById[d.properties.SIG_KOR_NM]);
          })
  		.on("mouseenter", mymouseenter)
  		.on("mouseleave", mymouseleave)
		.on("click", myclick);
  	})

	// 화력 발전소 데이터를 사용하여 지도 위에 위치를 표시한다
    d3.csv("csv/electric.csv", function(data) {
	  var elec = [];
      data.forEach(function(d) {
        if(d.province === province_name)
          elec.push(d);
      })

    	map.selectAll("circle")
    		.data(elec)
    		.enter().append("circle")
    			.attr("cx", function(d) { return projection([d.lon, d.lat])[0]; })
    			.attr("cy", function(d) { return projection([d.lon, d.lat])[1]; })
    			.attr("r", 4)
          .style("fill","#f00")
          .on("mouseenter", elecmouseenter)
          .on("mouseleave", elecmouseleave);
    });
  });
});

// add legend to the map (화력발전소, 풍향)
var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("cx", width - 10)
	  .attr("cy", 40)
      .attr("r", 4)
	  .style("fill", "#f00");

  legend.append("text")
      .attr("x", width - 20)
	  .attr("y", 40)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("화력 발전소");

// 미세먼지 색상 기준
var ref = d3.select("#refer").append("svg")
	.attr("width", "100%")
	.attr("height", height);

var ref_data = [{"status":"좋음", "color":"#1a9641", "min":0, "max":31},
				{"status":"보통", "color":"#a6d96a", "min":31, "max":81},
				{"status":"나쁨", "color":"#fdae61", "min":81, "max":151},
				{"status":"매우 나쁨", "color":"#d7191c", "min":151, "max":-1}];
ref.append("g")
	.attr("id", "ref")
	.attr("transform", "translate(100,20)");

ref.selectAll("rect")
	.data(ref_data)
	.enter().append("rect")
	.attr("x", function(d, i) { return (i+1) * 115; })
	.attr("y", 30)
	.attr("width", 40)
	.attr("height", 40)
	.style("fill", function(d, i) {
		return d.color;
	});

ref.selectAll("text")
	.data(ref_data)
	.enter().append("text")
	.attr("x", function(d, i) { return (i+1) * 130 + 20; })
	.attr("y", 80)
	.attr("dy", ".72em")
	.style("text-anchor", "end")
	.text(function(d, i) {
		var st;
		if(d.max !== -1)
			st = d.status + " : " + d.min + "~" + d.max;
		else
			st = d.status + " : " + d.min + "~"
		return st;
	});

/*
drawPlantInfo();
function drawPlantInfo() {
	d3.csv("csv/electric.csv", function(data) {
		var elec = [];
		data.forEach(function(d) {
			if(d.province === province_name) {
				var name_div = $('<div>'+d.name+'</div>')
					.prop('class', "plant_detail");
				$('#plant').append(name_div);
			}
		});
		  
		if(elec.length !== 0) {
			$('#plant').append("<div class='plant_detail'>발전소가 없습니다" + "</div>");
		}
	});
}
*/

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

// decide colors according to dust density
function getcolor(val) {
	if(val >= 151) return "#d7191c";
	else if(val < 151 && val >= 81) return "#fdae61";
	else if(val < 81 && val >= 31) return "#a6d96a";
	else if(val < 31 && val >= 0) return "#1a9641";
	else return "#FFF";
}

// change map coloring according to pm mode
function pm_switch(chbx) {
  if (chbx.checked == true)
    pm = "pm25";
  else
    pm = "pm10";

  d3.json(map_path, function(error, data) {
  	var features = topojson.feature(data, data.objects["TL_SCCO_SIG_crs84-m2s"]).features;

  	d3.csv("csv/" + province_name + "_" + pm + ".csv", function(data) {
  		var rateById = {};
  		data.forEach(function(d) {
  			rateById[d.gungu] = +d.value;
  		});

  		map.selectAll("path")
  	    .data(features)
  		.style("fill", function(d) {
              return getcolor(rateById[d.properties.SIG_KOR_NM]);
          });
  	});
  });
}

// map mouse enter event: show detail information
function mymouseenter(d) {
	var x, y;
	var text;
	var centroid = path.centroid(d);
	x = centroid[0];
	y = centroid[1];
	text = d.properties.SIG_KOR_NM;

	map.append("text")
		.attr("x", x)
		.attr("y", y)
    .attr("dy", "0em")
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
  if(pm10 === -900)
    pm10 = "No data";
  else
    pm10 = pm10 + '(㎍/㎥)';

  var pm25 = pm25_data[text];
  if(pm25 === -900)
    pm25 = "No data";
  else
    pm25 = pm25 + '(㎍/㎥)';

	map.append("text")
		.attr("x", x)
		.attr("y", y)
    .attr("dy", "1em")
		.attr("class", "mouse-enter")
		.text('PM10: ' + pm10 + '');

	map.append("text")
		.attr("x", x)
		.attr("y", y)
    .attr("dy", "2em")
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

// map click event: move to the detail page: 
// should stop the animation and change chart data
function myclick(d) {
	var x, y, k;
	var text;
	if (d && centered !== d) {
		var centroid = path.centroid(d);
		x = centroid[0];
		y = centroid[1];
		k = 4;
		centered = d;
		sigungu = d.properties.SIG_KOR_NM;
		$("#prov_name").text(kor_province + " - " + sigungu);
    // $(".mouseenter").css('font-size', '20px');
		// text = "zoom in " + d.properties.name;
	} else {
		x = width / 2;
		y = height / 2;
		k = 1;
		centered = null;
		sigungu = "";
		$("#prov_name").text(kor_province);
    // $(".mouseenter").css('font-size', '20px');
	}

  clearInterval(timer);
  $("#play-button").attr('src', 'play-circle.png');
  playing = false;
  start_date = new Date("2016-01-01");
  end_date = new Date("2016-12-31");
  curr_date = new Date(start_date);
  $( "#slider-range" )
  .slider('values', [start_date.getTime()/1000, end_date.getTime()/1000]);
  $( "#clock" ).text(start_date.toDateString() + " - " + end_date.toDateString());

  remake_province_data();

	map.transition()
		.duration(750)
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		.style("stroke-width", 1.5 / k + "px");
	// $("#zoom-in").text(text);
}

// get past data after the page has loaded
function getData() {
	d3.csv("csv/TS_DLL_AVG.csv", function(data) {
		data.forEach(function(d) {
			if(province_name === d.LOC) {
				attributeArray.push(d);
			}
		});
	});

  d3.csv("csv/" + province_name + "_pm10.csv", function(data) {
    data.forEach(function(d) {
      pm10_data[d.gungu] = +d.value;
    });
  });

	d3.csv("csv/" + province_name + "_pm25.csv", function(data) {
		data.forEach(function(d) {
      pm25_data[d.gungu] = +d.value;
		});
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

// sequence map (animation): change color, wind arrow according to the current date
function sequenceMap() {
	var result = $.grep(attributeArray, function(e){
		var date = curr_date.yyyymmdd();
		return date === e["DATE1"];
	});
	
	map.selectAll("path")
		.style("fill", function(d2) {
			var val = $.grep(result, function(c) {
				return c.LOC_1 === d2.properties.SIG_KOR_NM;
			});
			if(val.length > 0) {
				if(pm === "pm10") {
					return getcolor(val[0].a_pm10);
				} else {
					return getcolor(val[0].a_pm25);
				}
			}
		});
}

// 화면을 최신 데이터에 기반하여 처음으로 돌려놓는다(after the animation)
function firstMap() {
	d3.csv("csv/" + province_name + "_" + pm + ".csv", function(data) {
		var rateById = {};
  		data.forEach(function(d) {
  			rateById[d.gungu] = +d.value;
  		});

		map.selectAll("path")
			.style("fill", function(d) {
				return getcolor(rateById[d.properties.SIG_KOR_NM]);
			});
	});
}

$(document).ready(getData);
