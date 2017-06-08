var width = 960,
    height = 500,
    centered;

var playing = false;
var pm = "pm10";
var start_date = new Date("2016-01-01");
var end_date = new Date("2016-12-31");
var attributeArray = [];
var curr_date = new Date(start_date);

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
		/*
		$( "#clock" ).val( $( "#slider-range" ).slider( "values", 0 ) +
			" - " + $( "#slider-range" ).slider( "values", 1 ) );
		*/
} );

$("#play-button").click(function(d) {
	var timer;
	if(playing == false) { 
		//getData();
		d3.select(this).attr('src', 'pause-circle.png');
		timer = setInterval(function(){
			sequenceMap();
			if(curr_date < end_date) {  
				curr_date.setDate(curr_date.getDate() + 1);
			} else {
				curr_date.setDate(start_date.getDate()); 
			}
			
			$( "#slider-range" )
					.slider('values', [curr_date.getTime()/1000, end_date.getTime()/1000]);
			$( "#clock" ).text(curr_date + " - " + end_date);
        }, 1000);
        playing = true; 
      } else {    
        clearInterval(timer);   
        d3.select(this).attr('src', 'play-circle.png');   
        playing = false;
		
		// reset the slider and the clock values
		d1 = new Date("2016-01-01"); 
		d2 = new Date("2016-12-31");
		$( "#slider-range" ).slider('values', d1.getTime()/1000, d2.getTime()/1000);
		$( "#clock" ).text(d1 + " - " + d2);
		
		// 화면을 최신 데이터에 맞도록 맞춤
      }
});

var svg = d3.select("#map").append("svg")
    .attr("width", width)
	.attr("height", height);

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
    .scale(2500)
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
				.attr("r", 2)
			.style("fill","#f00");
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

getData();
	
function getcolor(val) {
	if(val >= 151) return "#d7191c";
	else if(val < 151 && val >= 81) return "#fdae61";
	else if(val < 81 && val >= 31) return "#a6d96a";
	else if(val < 31 && val >= 0) return "#1a9641";
	else return "#FFF";
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
		.attr("font-size", "15px")
		.attr("id", "mouse-enter")
		.text(text);
}

function mymouseleave(d) {
	$("#mouse-enter").remove();
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
    pm = "pm25";
  else
    pm = "pm10";

  d3.csv("csv/" + pm + ".csv", function(data) {
    var rateById = {};
  	data.forEach(function(d) {
  		rateById[d.province] = +d.value;
  	});

  	map.selectAll("path")
  	  .style("fill", function(d) {
        return getcolor(rateById[d.properties.name]);
      });
  });
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function changeColor(elem) {
	elem.transition().duration(0)
      .style("fill", function(d) { return "#FFF"; })
    .transition().duration(5)
      .style("background", "yellow")
    .transition().delay(1000).duration(5000)
      .style("background", "red");
}

function getData() {
	d3.csv("csv/TS_DL_AVG.csv", function(data) {
		var cnt = 0;
		data.forEach(function(d) {
			attributeArray.push(d);
		});
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

function sequenceMap() {
	var result = $.grep(attributeArray, function(e){ 
		var date = curr_date.yyyymmdd();
		return date === e["DATE1"]; 
	});
	
	result.forEach(function(d1) {
		map.selectAll("path")
			.style("fill", function(d2) {
				var val = $.grep(result, function(c) {
					console.log(c["LOC"]);
					return c["LOC"] === d2.properties.name;
				});
				console.log(val);
				if(pm === "pm10")
					return getcolor(val["a_pm10"]);
				else
					return getcolor(val["a_pm25"]);
			});
	});
}

/*
  arrow.transition()
      .duration(2000)
      .ease("linear")
      .attrTween("transform", translateAlong(path.node()))
      //.each("end", transition);


// Returns an attrTween for translating along the specified path element.
function translateAlong(path) {
  var l = path.getTotalLength();
    var ps = path.getPointAtLength(0);
    var pe = path.getPointAtLength(l);
    var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI) - 90;
    var rot_tran = "rotate(" + angl + ")";
  return function(d, i, a) {
    console.log(d);
    
    return function(t) {
      var p = path.getPointAtLength(t * l);
      return "translate(" + p.x + "," + p.y + ") " + rot_tran;
    };
  };
}

var totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000)        
        .ease("linear")
        .attr("stroke-dashoffset", 0);
*/
//$(document).ready(main);
