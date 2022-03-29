// Set margins and dimensions 
const margin = { top: 50, right: 50, bottom: 50, left: 150 };
const width = 1500; //- margin.left - margin.right;
const height = 1000; //- margin.top - margin.bottom;

//Create space for the sticky linechart header on the page
const header_holder = d3.select("#linechart-header")
.append("svg")
.attr("width", width - margin.left - margin.right)
.attr("height", height - margin.top - margin.bottom)
.attr("viewBox", [0, 0, width, height]); 

//initializes the brush for the line graph header
let year_brush; 

//loads in the data from the cleaned CSV file of our movie dataset
//Read the data
d3.csv("data/data_bechdel_new - data_bechdel.csv").then((data) => {

// citation: https://observablehq.com/@d3/d3-group

var pass_count = d3.rollup(data, v => v.length, d => d.year, d=> d.passed)
.sort(function(a, b){ return d3.ascending(a.year, b.year);})

console.log(pass_count);
 
   //citation: https://d3-graph-gallery.com/graph/line_basic.html

// Add X axis --> it is a date format
var x = d3.scaleLinear()
  .domain(d3.extent(pass_count, d=> d[0]))
  .range([ 0, width ]);

xAxis = header_holder.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, 100])
  .range([ height, 0 ]);

yAxis = header_holder.append("g")
  .call(d3.axisLeft(y));

// Add a clipPath: everything out of this area won't be drawn.
var clip = header_holder.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width )
    .attr("height", height )
    .attr("x", 0)
    .attr("y", 0);

// Add brushing
var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
    .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

// Create the line variable: where both the line and the brush take place
var line = header_holder.append('g')
  .attr("clip-path", "url(#clip)")

console.log("pass_count[1]:" + Object.values(pass_count)[1]);

//var pass_percentage = Object.values(pass_count)[1];
//pass_percentage/=

// Add the line
line.append("path")
  .datum(pass_count)
  .attr("class", "line")  // I add the class line to be able to modify this line later on.
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 1.5)
  .attr("d", d3.line()
    .x(d=> console.log(x(d[0])))
    .y(d=> { 
      const passed = d[1].get("Pass") ?? 0
      console.log(passed)
      const failed = d[1].get("Fail") ?? 0

      return (passed/(passed+failed))*100

    })
    //.y(d=> y(d.Pass/(d.Pass+d.Fail)))
    )

// Add the brushing
line
  .append("g")
    .attr("class", "brush")
    .call(brush);

// A function that set idleTimeOut to null
var idleTimeout
function idled() { idleTimeout = null; }

// A function that update the chart for given boundaries
function updateChart() {

  // What are the selected boundaries?
  extent = d3.event.selection

  // If no selection, back to initial coordinate. Otherwise, update X axis domain
  if(!extent){
    if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
    x.domain([ 4,8])
  }else{
    x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
    line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
  }

  // Update axis and line position
  xAxis.transition().duration(1000).call(d3.axisBottom(x))
  line
      .select('.line')
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(data.year)
        .y(pass_count)
      )
}

// If user double click, reinitialize the chart
header_holder.on("dblclick",function(){
  x.domain(d3.extent(data, data.year))
  xAxis.transition().call(d3.axisBottom(x))
  line
    .select('.line')
    .transition()
    .attr("d", d3.line()
      .x(data.year)
      .y(pass_count)
  )
});

})

  
  