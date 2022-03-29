// Set margins and dimensions 
const margin = { top: 50, right: 50, bottom: 50, left: 200 };
const width = 900; //- margin.left - margin.right;
const height = 650; //- margin.top - margin.bottom;

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

  //d3.rollups(data, v => v.length, d => d.year)
   var year_count = d3.rollup(d, v => v.length, d => data.year);
   console.log(year_count);

   var pass_count = d3.rollup(d, v => v.length, d=> data.passed, d => data.year);
   console.log(pass_count);

   var dict = { year: year_count, percentage: (pass_count/year_count)*100}
  
    //citation: https://d3-graph-gallery.com/graph/line_basic.html

    xKey = "year";
    yKey = "passed";

     //sets max year value 
     let maxX = d3.max(data, (d) => { return d[xKey]; });

    //creates x-axis (years)
    x_axis = d3.scaleLinear()
    .domain([0,maxX])
    .range([margin.left, width-margin.right]); 

    //adds x-axis (years) to the header graph    
    header_holder.append("g")
    //maybe keeps the scale proportionate even if height increases?
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x_axis));

    /*//adds y-axis (percentages) 
    var y_axis = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.value; })])
      .range([ height, 0]);
    header_holder.append("g")
      .call(d3.axisLeft(y_axis));*/

     // Add the line
     header_holder.append("path")
     .datum(data)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", d3.line())
      .call((g) => g.append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.bottom - 4)
      .attr("fill", "black")
      .attr("text-anchor", "end")
      .text(xKey3)
      );
  });
  
  