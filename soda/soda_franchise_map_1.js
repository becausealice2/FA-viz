var config  = {},
		width   = 0,
		height  = 0,
		margins = {};

config.div_id = "soda_franchise_map",
config.map_shift_horizontal = 2,
config.map_shift_vertical = 2,
config.states = [04, 16, 32, 49];

d3.queue()
	.defer(d3.json, "https://d3js.org/us-10m.v1.json")
	.defer(d3.csv, "https://rawgit.com/becausealice2/FA-viz/master/soda/soda_data.csv")
	.awaitAll(render_map);


// Load world map topojson
function render_map(error, result_data){
	if (error) { console.error(error) };

	var topology  = result_data[0],
			locations = result_data[1];

	var states = topology["objects"]["states"]

	// Filter through all states to isolate selected states
	states["geometries"] = states["geometries"].filter(function select_states(state_obj){
																									return config.states.filter(function(state_id){
																										return state_id == state_obj["id"];
																									}).length !== 0;
																								});

	// Use world map's bounding box array to calculate the map's aspect ratio
	var bbox             = topojson.bbox(topology),
			map_aspect_ratio = (bbox[2]-bbox[0]) / (bbox[3]-bbox[1]);

	// Get target element's width and use aspect ratio to set height
	width  = document.getElementById(config.div_id).clientWidth,
	height = width/map_aspect_ratio,
	// Set margins around rendered map
	margins.top    = 0,
	margins.bottom = 0,
	margins.left   = 0,
	margins.right  = 0;

	// Select target element and attach <svg> and <g> elements
	var svg = d3.select("#"+config.div_id)
		.append("svg")
			// Set SVG element's top left corner and width/height attributes
			.attr("viewBox",margins.top+" "+margins.left+" "+(width-margins.right)+" "+(height-margins.bottom))
			// Supposed to make map responsive. Works sometimes.
			.attr("preserveAspectRatio", "xMidYMid meet")
			// Group together map paths and location markers	
		.append('g')
			.attr('class', config.div_id+"_group");



	var projection = d3.geoAlbersUsa();
	// Geo-paths take a GeoJSON geometry/feature object and generate an SVG path data string or render the path to a Canvas
	var path = d3.geoPath();

	topology = topojson.feature(topology,states).features;
	// Group together country shape paths and enter data
	svg.append("g")
			 .attr("class", config.div_id+"_states")
			 .selectAll("path")
			 // Convert TopoJSON file to GeoJSON for rendering
			 .data(topology)
			 .enter()
			 // Render and style map
			 .append("path")
				 .attr("d", path)
				 .style("fill", "#FFF")
				 .style("stroke", "#000")
				 .style("stroke-width", "1px");

	// Variables for reuse
	var lon = "Longitude",
			lat = "Latitude";

	console.log(locations);

// Render and style circle location marker for each observation in reviews dataset
svg.selectAll("circle")
   .data(locations)
   .enter()
   .append("circle")
     .attr("cx", function(d) { return projection([d[lon], d[lat]])[0]; })
     .attr("cy", function(d) { return projection([d[lon], d[lat]])[1]; })
     .attr("r", 1)
     .style("fill", "blue");

}; // Close d3.json("https://d3js.org/us-10m.v1.json", function render_map(topology){