/**
 * Created by hen on 3/8/14.
 */

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 30
};

var width = 1060 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;
var centered;
var barHeight = 20;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var bbDetail = {
    x: 50,
    y: 10,
    w: 250,
    h: 150
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:400,
    height:300
}
)

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

svg.append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)
  .on("click", clicked);

  
var detailsvg = detailVis.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    }).style('background-color',"red");


var x = d3.scale.linear().domain([0,23]).range([bbDetail.x,bbDetail.w]);

var y = d3.scale.linear().domain([0,50]).range([bbDetail.h, 0]);



var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    //.tickFormat(d3.time.format("%Y-%m"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var hourly_aggregate = {};


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

        // sums
        var summation = {};
        for (var month in completeDataSet) {

          for (var id in completeDataSet[month]) {

            if (!(id in summation)) {
              summation[id] = 0;
            }

            summation[id] += completeDataSet[month][id]["sum"];
          }
        }

        console.log(summation);

        //console.log(summation(data[0]), data[0]);

        //tooltip function created
        var tip = d3.tip() 
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return d.STATION + '<br/>' + "sum = " + summation[d.USAF];
        })


        svg.call(tip);

        var max_sum = 0;
        for (var id in summation) {
          if (summation[id] > max_sum) {
            max_sum = summation[id];
          }
        }

        var rScale = d3.scale.linear().domain([0,max_sum]).range([1, 4]);

        // add circles
        var circle = svg.selectAll(".circles")
        .data(data).enter()
        .append("circle")
        .attr("r", function (d) { if (!summation[d.USAF]) { return rScale(0); } return rScale(summation[d.USAF]); })
        .attr("fill", function (d) { if (!summation[d.USAF]) { return "gray"; } return "black"; }) //function(d,i){return d}
        .attr("transform", function(d){return "translate(" + projection([d.NSRDB_LON,d.NSRDB_LAT]) + ")";})
        .on("mouseover",tip.show)
        .on("mouseout",tip.hide)
        .on("click", function (d, i) {
          console.log(i);
          updateDetailVis(d);
        });

        console.log(completeDataSet);
      // aggregate hourly data by station
       for (var month in completeDataSet) {

           // grab each station
           for (var id in completeDataSet[month]) {

               // push station id into hourly aggregate if DNE
               if (!(id in hourly_aggregate)) {
                   hourly_aggregate[id] = [];
               }

               // sum up hourly data
               for (var hr in completeDataSet[month][id]["hourly"]) {

                   if (!(hr in hourly_aggregate[id])) {
                       hourly_aggregate[id][hr] = 0;
                   }

                   // include the value
                   hourly_aggregate[id][hr] += completeDataSet[month][id]["hourly"][hr];
               }
           }
       }
       console.log(hourly_aggregate);

        createDetailVis(data);
       //console.log(hourly_aggregate);
        //createDetailVis();
       
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
        completeDataSet = data;
        //createDetailVis(completeDataSet);
		
        loadStations(completeDataSet);
        
     })

}


d3.json("../data/us-named.json", function(error, data) {
    //creates map
    var usMap = topojson.feature(data,data.objects.states).features

    //add click to zoom 
    svg.selectAll(".country").data(usMap).enter()
    .append("path")
    .attr("d",path)
    .attr("fill","purple")
    .on("click",clicked);
    
    loadStats();


});



//creates bar chart
var createDetailVis = function(fulldata){



     detailVis.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bbDetail.h + ")")
      .call(xAxis)
    .append("text")
    .text("Hours");

   detailVis.append("g")
      .attr("class", "y axis")
       .attr("transform", "translate(" + bbDetail.x + ",0)")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Aggregated Hourly Values");

    

  // svg.selectAll("bar")
  //     .data(data)
  //   .enter().append("rect")
  //     .style("fill", "steelblue")
  //     .attr("x", function(d) { return x(d.date); })
  //     .attr("width", x.rangeBand())
  //     .attr("y", function(d) { return y(d.value); })
  //     .attr("height", function(d) { return height - y(d.value); });

//})
}


 var updateDetailVis = function(data){

  var station_id = data["USAF"];
  console.log(hourly_aggregate[station_id]);


 var max_hour = 0;

  for (hour in hourly_aggregate[station_id]) {
    if (max_hour < hourly_aggregate[station_id][hour])
      max_hour = hourly_aggregate[station_id][hour];
  }
      
    console.log(max_hour);

    //var x = d3.scale.linear().domain([0,23]).range([bbDetail.x,bbDetail.w]);

    y.domain([0, max_hour]);

    detailVis.selectAll(".y")
      .call(yAxis)

    //detailVis.append("rect")

    //create bars
    var bar = detailVis.selectAll("rect").remove();

    bar = detailVis.selectAll("rect")
    .data(hourly_aggregate[station_id])
    .enter().append("rect")
    .style("fill","steelblue")
    .attr("x", function(d,i){return bbDetail.w/24*i })
    .attr("y",function(d){return y(d)})
    .attr("width",function(d){return bbDetail.w/24})
    .attr("height",function(d){return bbDetail.h - y(d)});
    
 }



// // ZOOMING
// function zoomToBB() {
    


// }

// function resetZoom() {
    
// }


