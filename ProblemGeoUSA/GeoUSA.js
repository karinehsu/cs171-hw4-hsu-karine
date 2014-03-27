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

// for bar chart detail Vis
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%Y-%m"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);


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

function zoom() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function loadStations(complete) {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){
        console.log(complete);
        //tooltip function created

        //summed
        summation = function(d){
            result = 0;
            arrayOfMonths = new Array(12);
            arrayOfMonths[0] =  complete["Jan"][d.USAF]
            arrayOfMonths[1] =  complete["Feb"][d.USAF]
            arrayOfMonths[2] =  complete["Mar"][d.USAF]
            arrayOfMonths[3] =  complete["Apr"][d.USAF]
            arrayOfMonths[4] =  complete["May"][d.USAF]
            arrayOfMonths[5] =  complete["Jun"][d.USAF]
            arrayOfMonths[6] =  complete["Jul"][d.USAF]
            arrayOfMonths[7] =  complete["Aug"][d.USAF]
            arrayOfMonths[8] =  complete["Sep"][d.USAF]
            arrayOfMonths[9] =  complete["Oct"][d.USAF]
            arrayOfMonths[10] =  complete["Nov"][d.USAF]
            arrayOfMonths[11] =  complete["Dec"][d.USAF]
   
            for (t=0; t<arrayOfMonths.length; t++){
               if (arrayOfMonths[t] != undefined){
                result += arrayOfMonths[t].sum;
                } 
            }
            
            return result;
            
        }

        console.log(summation(data[0]), data[0]);


        var tip = d3.tip() 
    
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return d.STATION + '<br/>' + "sum = " + summation(d);
        })


        svg.call(tip);

        // add circles
        var circle = svg.selectAll(".circles")
        .data(data).enter()
        .append("circle")
        .attr("r", 2 ) //function(d,i){return d}
        .attr("transform", function(d){return "translate(" + projection([d.NSRDB_LON,d.NSRDB_LAT]) + ")";})
        .on("mouseover",tip.show)
        .on("mouseout",tip.hide)
        .on("click",clicked);
       
        // circle.append("g")
        // .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
        // .append("g");

        // svg.append("rect")
        // .attr("class", "overlay")
        // .attr("width", width)
        // .attr("height", height);

        // svg.attr("transform", function(d) { return "translate(" + d + ")"; });
        //console.log(data.station);//....map every station to a circle on the map
    });
}


function loadStats() {

     d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
        completeDataSet= data;
        console.log(completeDataSet);

	   
		
        loadStations(completeDataSet);
     })

}


d3.json("../data/us-named.json", function(error, data) {
    //creates map
    var usMap = topojson.feature(data,data.objects.states).features
    //console.log(usMap);
    
    //var screencoord = projection([-71.060168, 42.360024]);
    //console.log(screencoord);


    svg.selectAll(".country").data(usMap).enter()
    .append("path")
    .attr("d",path)
    .attr("fill","purple")
    .on("click",clicked);
    
    loadStats();
    
    //zoomToBB();
});



//creates bar chart
var createDetailVis = function(){

//     x.domain(data.map(function(d) { return d.date; }));
//     y.domain([0, d3.max(data, function(d) { return d.value; })]);

//     //var chart = d3.select("body")

  //   svg.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis)
  //   .selectAll("text")
  //     .style("text-anchor", "end")
  //     .attr("dx", "-.8em")
  //     .attr("dy", "-.55em")
  //     .attr("transform", "rotate(-90)" );

  // svg.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxis)
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", ".71em")
  //     .style("text-anchor", "end")
  //     .text("Value ($)");

  // svg.selectAll("bar")
  //     .data(data)
  //   .enter().append("rect")
  //     .style("fill", "steelblue")
  //     .attr("x", function(d) { return x(d.date); })
  //     .attr("width", x.rangeBand())
  //     .attr("y", function(d) { return y(d.value); })
  //     .attr("height", function(d) { return height - y(d.value); });

}


var updateDetailVis = function(data, name){
  
}



// ZOOMING
function zoomToBB() {
    


}

function resetZoom() {
    
}


