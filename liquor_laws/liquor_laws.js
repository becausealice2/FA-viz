/*** Code taken from Micah Stubbs on bl.ocks.org and customized ***/
/*** bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f ***/

// Config.txt file location
var config_txt = "https://gist.githubusercontent.com/becausealice2/c8c72dbe1f8e4da4beca4dd062bb612f/raw/35cd09e99f8e0e72ad5c87d9ed14f4f68cbc34c4/config.txt";

// Initialize variables
var config     = {},
    topology   = "",
    reviews    = "",
    width      = 0,
    height     = 0,
    svg        = null,
    projection = null,
    path       = null;

/*** Wrap everything in functions because async ***/

// Convert input from config.txt file to JSON and apply to config object
function create_config(file){
  lines = file.toString().split("\n");
  lines.forEach(function config_json(line){
  	if (line != "") {
	    line = line.split(":")
	    var key   = line[0].trim().toLowerCase();
	    var value = line[1].trim();
	  
	    config[key] = value;
	}
  });
  set_vars(config);
}

// Assign values to variables using config object
function set_vars(config){

  /*************************************************
  **DELETE "https://"+ WHEN USING LOCAL DATA FILES**
  *************************************************/
  // World map TopoJSON
  topology = "https://"+config.map_location;
  // Restaurant review CSV file
  reviews = "https://"+config.reviews_location;

  var containerWidth  = document.getElementById(config.div_id).offsetWidth,
      containerHeight = document.getElementById(config.div_id).offsetHeight;

  // Set size of rendered map
  var x = parseFloat(config.margin_top),
      y = parseFloat(config.margin_left);

  width  = containerWidth-parseFloat(config.margin_right);
  height = containerHeight-parseFloat(config.margin_bottom);

  // Target HTML element and prepare it for rendering SVG map and markers
  svg = d3.select("#"+config.div_id)
          .append("svg")
          	.attr("viewBox",x+" "+y+" "+width+" "+height)
          	.attr("preserveAspectRatio", "xMidYMid meet")
          .append('g')
            .attr('class', 'reviews_location_map');

  // Projections transform spherical polygonal geometry to planar polygonal geometry
  projection = d3.geoMercator()
                 .scale(config.map_scale);

  // take a GeoJSON geometry/feature object and generates an SVG path data string or renders the path to a Canvas
  path = d3.geoPath()
           .projection(projection);

  render(config, topology, reviews);
}

function render(config, topology, reviews){
  // Load world map TopoJSON
  d3.json(topology, function render_map(topology){
    // Convert TopoJSON to GeoJSON
    var geojson = topojson.feature(topology, topology.objects.countries);

    // Render and style SVG country shapes
    svg.append("g")
         .attr("class", "reviews_map_countries")
       .selectAll("path")
       .data(geojson.features)
       .enter()
       .append("path")
         .attr("d", path)
         .style("fill", config.country_fill_color)
         .style("stroke", config.counter_border_color)
         .style("stroke-width", parseFloat(config.country_border_width)+"px");

    // Load reviews dataset
    d3.csv(reviews, function render_review_location(reviews){

      // Variables for reuse
      var lon = config.reviews_longitude_column,
          lat = config.reviews_latitude_column;

      // Render and style circle location marker for each observation in reviews dataset
      svg.selectAll("circle")
         .data(reviews)
         .enter()
         .append("circle")
           .attr("cx", function(d) { return projection([d[lon], d[lat]])[0]; })
           .attr("cy", function(d) { return projection([d[lon], d[lat]])[1]; })
           .attr("r", config.location_marker_radius)
           .style("fill", config.location_marker_color);
    });

  });
}

// Load config file and start the domino chain of functions
d3.text(config_txt, create_config);	