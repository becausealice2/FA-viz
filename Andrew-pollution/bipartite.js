
var data=[['Rio Tinto America', 'Lead', 164494268.0],
 ['Rio Tinto America', 'Copper', 63723556.0],
 ['Rio Tinto America', 'Zinc', 16005169.0],
 ['Rio Tinto America', 'Arsenic', 3058777.0],
 ['The Renco Group', 'Chlorine', 2094096.0],
 ['The Renco Group', 'Hydrochloric Acid', 2093393.0],
 ['Deseret Power', 'Barium', 1535370.7],
 ['Berkshire Hathaway', 'Barium', 1088204.0],
 ['Energysolutions', 'Copper', 946444.5],
 ['Materion', 'Ammonia', 924409.0],
 ['Clean Harbors', 'Aluminum Oxide', 799363.6],
 ['Energysolutions', 'Chromium', 746103.08],
 ['Clean Harbors', 'Polychlorinated Biphenyls', 634565.15],
 ['Rio Tinto America', 'Chromium', 506446.0],
 ['Intermountain Power', 'Barium', 440255.0],
 ['Westinghouse Electric', 'Nitrate', 400000.0],
 ['Clean Harbors', 'Asbestos', 393722.463],
 ['Energysolutions', 'Nickel', 388447.7],
 ['Energysolutions', 'Lead', 341249.5],
 ['Orbital Atk', 'Hydrochloric Acid', 316010.0],
 ['Energysolutions', 'Asbestos', 309658.07],
 ['Berkshire Hathaway', 'Manganese', 267396.0],
 ['Rio Tinto America', 'Nickel', 242837.0],
 ['Rio Tinto America', 'Manganese', 234134.0],
 ['Westinghouse Electric', 'Ammonia', 224370.0],
 ['Hexcel Corp', 'Hydrogen Cyanide', 200554.0],
 ['Deseret Power', 'Manganese', 194723.0],
 ['Berkshire Hathaway', 'Chromium', 194620.0],
 ['Rio Tinto America', 'Antimony', 185178.0],
 ['Autoliv', 'Nitrate', 182622.0],
 ['Nucor Corp', 'Barium', 172587.0],
 ['Nucor Corp', 'Lead', 154597.1],
 ['Hexcel Corp', 'Ammonia', 149610.0],
 ['Berkshire Hathaway', 'Nickel', 122987.0],
 ['Mcwane', 'Manganese', 114388.0],
 ['Materion', 'Zinc', 109151.0],
 ['Berkshire Hathaway', 'Zinc', 102213.0],
 ['Nucor Corp', 'Chromium', 101441.0],
 ['Chevron Corp', 'Nitrate', 101276.0]];

var colors = {"Autoliv":"#3366CC", "Berkshire Hathaway":"#DC3912", "Chevron Corp":"#FF9900", "Clean Harbors":"#109618", "Deseret Power":"#990099", "Energysolutions":"#0099C6", "Hexcel Corp":"#3366CC", "Intermountain Power":"#DC3912", "Materion":"#FF9900", "Mcwane":"#109618", "Nucor Corp":"#990099", "Orbital Atk":"#0099C6", "Rio Tinto America":"#3366CC", "The Renco Group":"#DC3912", "Westinghouse Electric":"#FF9900"};
var svg = d3.select("#bipartite").append("svg").attr("width", 780).attr("height", 525);

d3.select("#bipartite").insert("h4", ":first-child").html("Pollutants Released by Company (>100,000 pounds)<br><small>Measurements in Pounds</small>").style("text-align", "center");

var g = svg.append("g").attr("transform","translate(250,5)");

var bp=viz.bP()
		.data(data)
		.min(12)
		.pad(2)
		.height(svg.attr("height")-15)
		.width(svg.attr("width")-500)
		.barSize(30)
		.fill(d=>colors[d.primary]);
			
g.call(bp);

g.selectAll(".mainBars")
	.on("mouseover",mouseover)
	.on("mouseout",mouseout)

g.selectAll(".mainBars").append("text").attr("class","label")
	.attr("x",d=>(d.part=="primary"? -105: 105))
	.attr("y",d=>+6)
	.text(d=>d.key)
	.attr("text-anchor",d=>(d.part=="primary"? "end": "start"))
	.attr("font-size", 13);
	
g.selectAll(".mainBars").append("text").attr("class","perc")
	.attr("x",d=>(d.part=="primary"? -65: 65))
	.attr("y",d=>+6)
	.text(function(d){ return d3.format("0.0%")(d.percent)})
	.attr("text-anchor",d=>(d.part=="primary"? "end": "start"))
	.attr("font-size", 13);
  
g.selectAll(".mainBars").append("text").attr("class","total")
	.attr("x",d=>(d.part=="primary"? -25: 25))
	.attr("y",d=>+6)
	.text(d=>Math.round(d.value/1000000)+"M")
	.attr("text-anchor",d=>(d.part=="primary"? "end": "start"))
	.attr("font-size", 13);

function mouseover(d){
	bp.mouseover(d);
	g.selectAll(".mainBars")
	.select(".perc")
	.text(function(d){ return d3.format("0.0%")(d.percent)})
}
function mouseout(d){
	bp.mouseout(d);
	g.selectAll(".mainBars")
		.select(".perc")
	.text(function(d){ return d3.format("0.0%")(d.percent)})
}
d3.select(self.frameElement).style("height", svg.attr("height"));