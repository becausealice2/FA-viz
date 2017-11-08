// Get target element's width and use aspect ratio to set height
var div_id  = "choropleth",
		width   = document.getElementById(div_id).clientWidth,
		height  = width*(2/3),
		center  = [-113.3010264, 39.7287941],
		// Set margins around rendered map
		margins = {"top": 0, "bottom": 0, "left": 0, "right": 0};

var projection = d3.geoMercator().scale(5000).center(center).translate([width/2.75, height/2.2]);
// Geo-paths take a GeoJSON geometry/feature object and generate an SVG path data string or render the path to a Canvas
var path = d3.geoPath().projection(projection);

function ready(error, utah, suicide_rates){
	if(error) console.error(error);

	var min = d3.min(suicide_rates, function(d){ return +d.rate_per_100k; }),
			max = d3.max(suicide_rates, function(d){ return +d.rate_per_100k; });

	var color = d3.scaleQuantize()
								.domain([min, max])
								.range(d3.schemeReds[9]);

	function color_fill(data){
		var element = suicide_rates.find(function(element){ return element.county == data.properties.name; });
		data.rate = element.rate_per_100k;
		console.log(data.rate);
		return color(data.rate);
	}

	// Select target element and attach <svg> and <g> elements
	var svg = d3.select("#" + div_id)
		.append("svg")
			// Set SVG element's top left corner and width/height attributes
			.attr("viewBox",margins.top + " " + margins.left + " " + (width - margins.right) + " " + (height - margins.bottom))
			// Supposed to make map responsive. Works sometimes.
			.attr("preserveAspectRatio", "xMidYMid meet")
			// Group together map paths and location markers	
		.append('g')
			.attr('class', div_id + "_group");

	// Group together country shape paths and enter data
	svg.append("g")
		 .attr("class", div_id + "_counties")
		 .selectAll("path")
		 .data(utah.features)
		 .enter()
		 // Render and style map
		 .append("path")
			 .attr("d", path)
			 .attr("stroke", "#fff")
			 .attr("fill", function(d) { return color_fill(d); })
			 .attr("stroke-width", "0.5px")
		 .append("title")
			 .text(function(d) { return d.rate + "%"; });

} // Close function ready(error, utah, suicide_rates){...

d3.queue()
	.defer(d3.json, "https://rawgit.com/becausealice2/FA-viz/master/suicide_rates/utah-counties.json")
	.defer(d3.csv, "https://rawgit.com/becausealice2/FA-viz/master/suicide_rates/suicide-by-health-district.csv")
	.await(ready);