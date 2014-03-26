/**
 * Created by hen on 3/8/14.
 */

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1060 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;
var centered;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:350,
    height:200
})

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);
var dataSet = {};

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}



function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){

        //tooltip function created
        var tip = d3.tip() 
    
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return d.STATION;
        })


        svg.call(tip);

        // add circles
        var circle = svg.selectAll(".circles")
        .data(data).enter()
        .append("circle")
        .attr("r",2) 
        .attr("transform", function(d){return "translate(" + projection([d.NSRDB_LON,d.NSRDB_LAT]) + ")";})
        .on("mouseover",tip.show)
        .on("mouseout",tip.hide)
        .on("click",clicked);
        //console.log(data.station);//....map every station to a circle on the map
    });
}


function loadStats() {

  //   d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
  //       completeDataSet= data;

		// //....
		
  //       loadStations();
  //   })

}


d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features
    console.log(usMap);
    
    //var screencoord = projection([-71.060168, 42.360024]);
    //console.log(screencoord);


    svg.selectAll(".country").data(usMap).enter()
    .append("path")
    .attr("d",path)
    .attr("fill","purple")
    .on("click",clicked);
    // see also: http://bl.ocks.org/mbostock/4122298

    loadStats();
    loadStations();
});



// ALL THESE FUNCTIONS are just a RECOMMENDATION !!!!
var createDetailVis = function(){

}


var updateDetailVis = function(data, name){
  
}



// ZOOMING
function zoomToBB() {


}

function resetZoom() {
    
}


