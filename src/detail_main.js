var width = 960,
    height = 500,
	centered;
	
var pm = "pm10";
	
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

var province_name = getCookie("province");
var map_path = "json/" + "gang" + "-topo.json";
console.log(map_path);

d3.json(map_path, function(error, data) {
	var features = topojson.feature(data, data.objects["TL_SCCO_SIG_crs84-m2s"]).features;

	d3.csv("csv/" + "gang" + "_" + pm + ".csv", function(data) {
		var rateById = {};
		data.forEach(function(d) {
			console.log(d);
			rateById[d.gungu] = +d.value;
		});

		map.selectAll("path")
	    .data(features)
	  .enter().append("path")
	  //	.attr("transform", function(d){ return "translate("+path.centroid(d)+")"; })
	  	.attr("dy", ".35em")
		.attr("d", path)
		.attr("class", "municipality-label")
		.text(function(d){ return d.properties.SIG_KOR_NM;})
		.style("fill", function(d) {
			console.log(d.properties.SIG_KOR_NM + ":" +rateById[d.properties.SIG_KOR_NM]);
            return getcolor(rateById[d.properties.SIG_KOR_NM]);
        })
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

function getcolor(val) {
	if(val >= 151) return "#d7191c";
	else if(val < 151 && val >= 81) return "#fdae61";
	else if(val < 81 && val >= 31) return "#a6d96a";
	else if(val < 31 && val >= 0) return "#1a9641";
	else return "#000";
}

function pm_switch(chbx) {
  if (chbx.checked == true)
    pm = "pm25";
  else
    pm = "pm10";
  console.log(pm);


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
              return getcolor(rateById[d.properties.SIG_KOR_NM]);
          });
  	});
  });
}

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
		.attr("font-size", "15px")
		.attr("id", "mouse-enter")
		.text(text);
}

function mymouseleave(d) {
	$("#mouse-enter").remove();
}