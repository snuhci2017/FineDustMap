var width = 960,
    height = 500,
    centered;

var playing = false;
var pm = "pm10";
console.log(pm);
$("#pm_chbx").prop("checked", false);
$( function() {
		$( "#slider-range" ).slider({
			range: true,
			min: 0,
			max: 500,
			values: [ 75, 300 ],
			slide: function( event, ui ) {
				$( "#clock" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			}
		});
		$( "#clock" ).val( $( "#slider-range" ).slider( "values", 0 ) +
			" - " + $( "#slider-range" ).slider( "values", 1 ) );
} );

var svg = d3.select("#map").append("svg")
    .attr("width", width)
	.attr("height", height);

var map = svg.append("g")
	.attr("id", "map");
	//append 'g', with 'id' 'plants' - 공장 위치 시각화

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
//			console.log(d);
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

  d3.json("json/skorea_provinces_topo_simple.json", function(error, data) {
  	var features = topojson.feature(data, data.objects["skorea_provinces_geo"]).features;

  	d3.csv("csv/" + pm + ".csv", function(data) {
  		var rateById = {};
  		data.forEach(function(d) {
  			rateById[d.province] = +d.value;
  		});

  		map.selectAll("path")
        .data(features)
  		  .style("fill", function(d) {
          return getcolor(rateById[d.properties.name]);
        });
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

function animateMap() {
  var timer;  
  d3.select('#play-button')  
    .on('click', function() {  
      if(playing == false) {  // if the map is currently playing
        timer = setInterval(function(){   // set a JS interval
          if(currentAttribute < attributeArray.length-1) {  
              currentAttribute +=1;  // increment the current attribute counter
          } else {
              currentAttribute = 0;  // or reset it to zero
          }
          sequenceMap();  // update the representation of the map 
          d3.select('#clock').html(attributeArray[currentAttribute]);  // update the clock
        }, 2000);
      
        d3.select(this).html('stop');  // change the button label to stop
        playing = true;   // change the status of the animation
      } else {    // else if is currently playing
        clearInterval(timer);   // stop the animation by clearing the interval
        d3.select(this).html('play');   // change the button label to play
        playing = false;   // change the status again
      }
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
