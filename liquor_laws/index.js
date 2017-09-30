// Polyfill for EventTarget.addEventListener()
(function() {
  if (!Event.prototype.preventDefault) {
    Event.prototype.preventDefault=function() {
      this.returnValue=false;
    };
  }
  if (!Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation=function() {
      this.cancelBubble=true;
    };
  }
  if (!Element.prototype.addEventListener) {
    var eventListeners=[];
    
    var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var self=this;
      var wrapper=function(e) {
        e.target=e.srcElement;
        e.currentTarget=self;
        if (typeof listener.handleEvent != 'undefined') {
          listener.handleEvent(e);
        } else {
          listener.call(self,e);
        }
      };
      if (type=="DOMContentLoaded") {
        var wrapper2=function(e) {
          if (document.readyState=="complete") {
            wrapper(e);
          }
        };
        document.attachEvent("onreadystatechange",wrapper2);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
        
        if (document.readyState=="complete") {
          var e=new Event();
          e.srcElement=window;
          wrapper2(e);
        }
      } else {
        this.attachEvent("on"+type,wrapper);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
      }
    };
    var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var counter=0;
      while (counter<eventListeners.length) {
        var eventListener=eventListeners[counter];
        if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
          if (type=="DOMContentLoaded") {
            this.detachEvent("onreadystatechange",eventListener.wrapper);
          } else {
            this.detachEvent("on"+type,eventListener.wrapper);
          }
          eventListeners.splice(counter, 1);
          break;
        }
        ++counter;
      }
    };
    Element.prototype.addEventListener=addEventListener;
    Element.prototype.removeEventListener=removeEventListener;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener=addEventListener;
      HTMLDocument.prototype.removeEventListener=removeEventListener;
    }
    if (Window) {
      Window.prototype.addEventListener=addEventListener;
      Window.prototype.removeEventListener=removeEventListener;
    }
  }
})(); // End EventTarget.addEventListener() polyfill



var map_url     = "https://gist.githubusercontent.com/becausealice2/2491a45b2b00451484be65a14f810a7b/raw/70209036e73080a11205664dedf75ce75c27763a/world-50m.json",
    reviews_url = "https://gist.githubusercontent.com/becausealice2/663243e3982136e391d53fb4150fecb1/raw/4cb35987a8a2a113ddd7809479850a4d88c5870f/restaurant_reviews.csv";

// Load world map topojson
d3.json(map_url, function render_map(topology){
	
	// Use world map's bounding box array to calculate the map's aspect ratio
	var geo_objects      = topology.objects.countries,
      bbox             = geo_objects.bbox,
      map_aspect_ratio = (bbox[2]-bbox[0]) / (bbox[3]-bbox[1]);

	// Get target element's width and use aspect ratio to set height
	var width   = document.getElementById("reviews_location_map").clientWidth,
      height  = width / map_aspect_ratio,
  		// Set margins around rendered map
  		margins = {"top": 0, "bottom": 0, "left": 0, "right": 0};

	// Select target element and attach <svg> and <g> elements
	var svg = d3.select("#reviews_location_map")
            	.append("svg")
            		// Set SVG element's top left corner and width/height attributes
              	.attr("viewBox",margins.top+" "+margins.left+" "+(width-margins.right)+" "+(height-margins.bottom))
              	// Supposed to make map responsive. Works sometimes.
              	.attr("preserveAspectRatio", "xMidYMid meet")
              	// Group together map paths and location markers	
            	.append('g')
                .attr('class', 'reviews_location_map');

	// Projections transform spherical polygonal geometry to planar polygonal geometry
	var projection = d3.geoEquirectangular()
				             // Center the map's center point
				             .translate([(width / 2), (height / 2)]);

	// Geo-paths take a GeoJSON geometry/feature object and generate an SVG path data string or render the path to a Canvas
	var path = d3.geoPath()
        	     .projection(projection);

	// Convert TopoJSON file to GeoJSON for rendering
	var topology = topojson.feature(topology, geo_objects);

	// Load reviews dataset
    d3.csv(reviews_url, function render_location_markers(reviews){

		// Group together country shape paths and enter data
	    svg.append("g")
	         .attr("class", "reviews_map_countries")
	       .selectAll("path")
	       .data(topology.features)
	       .enter()
	       // Render and style map
	       .append("path")
	         .attr("d", path)
	         .style("fill", "#CCC")
	         .style("stroke", "#FFF")
	         .style("stroke-width", "1.0px");
		
		// Variables for reuse
    	var lon = "longitude",
        	lat = "latitude";

		// Render and style circle location marker for each observation in reviews dataset
		svg.selectAll("circle")
		   .data(reviews)
		   .enter()
		   .append("circle")
		     .attr("cx", function(d) { return projection([d[lon], d[lat]])[0]; })
		     .attr("cy", function(d) { return projection([d[lon], d[lat]])[1]; })
		     .attr("r", 5)
		     .style("fill", "blue");

    }); // Close d3.csv(reviews_url, function render_location_markers(reviews){...

}); // Close d3.json(map_url, function render_map(topology){...