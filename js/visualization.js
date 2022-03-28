// Set margins and dimensions 
const margin = { top: 50, right: 50, bottom: 50, left: 200 };
const width = 1000; //- margin.left - margin.right;
const height = 650; //- margin.top - margin.bottom;

// Append svg object to the body of the page to house bar chart .
const svg3 = d3.select("#vis-container")
                .append("svg")
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.bottom)
                .attr("viewBox", [0, 0, width, height]); 

// Initialize bars. We will need these to be global.
let bars;

let bar_lengths = [{Species: "setosa", score: 50},
                   {Species: "versicolor", score: 50},
                   {Species: "virginica", score: 50}];

// Define color scale
const color = d3.scaleOrdinal()
                .domain(["setosa", "versicolor", "virginica"])
                .range(["#FF7F50", "#21908dff", "#fde725ff"]);

// Plotting 
d3.csv("data/data_bechdel_new - data_bechdel.csv").then((data) => {

  function singleGenre(genres) {
    return genres.split(',')[0]
  }
  const moviesbygenre = d3.group(data, d => d.genres.split(',')[0])
  console.log(moviesbygenre)
  const moviesrollup = d3.rollup(data, v => v.length, d => d.genres.split(',')[0])
  console.log(moviesrollup)
  
  // We will need scales for all of the following charts to be global
  let x3, y3;  

  // We will need keys to be global
  let xKey3, yKey3;
  

  // Barchart with counts of different species
   {
    xKey3 = "Genres";
    yKey3 = "Count";

    // Find max x

    // Create X scale
    x3 = d3.scaleBand()
                .domain(d3.range(data.columns.length))
                .range([margin.left, width-margin.right])
                .padding(0.1); 
    
    // Add x axis 
    svg3.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`) 
        .call(d3.axisBottom(x3)
          .tickFormat(i => data[i].genres.split(',')[0]))   
        .attr("font-size", '20px')
        .call((g) => g.append("text")
                      .attr("x", width - margin.right)
                      .attr("y", margin.bottom - 4)
                      .attr("fill", "black")
                      .attr("text-anchor", "end")
                      .text(xKey3)
      );

    // Find max y 
    let maxY3 = 100;
    //let maxY3 = d3.max(bar_lengths, (d) => { return d.score; });
    //let maxY3 = d3.max(moviesrollup, (d, i) => { return moviesrollup[i]; });

    // Create Y scale
    y3 = d3.scaleLinear()
                .domain([0, maxY3])
                .range([height - margin.bottom, margin.top]); 

    // Add y axis 
    svg3.append("g")
        .attr("transform", `translate(${margin.left}, 0)`) 
        .call(d3.axisLeft(y3)) 
        .attr("font-size", '20px') 
        .call((g) => g.append("text")
                      .attr("x", 0)
                      .attr("y", margin.top)
                      .attr("fill", "black")
                      .attr("text-anchor", "end")
                      .text(yKey3)
      );

    // Add points
    bars = svg3.selectAll(".bar")
                            .data(data)
                            .enter()
                              .append("rect")
                              .attr("class", "bar")
                              .attr("x", (d, i) => x3(i))
                              .attr("y", (d) => y3(d.bechdel_rating))
                              .attr("height", (d) => (height - margin.bottom) - y3(d.bechdel_rating)) 
                              .attr("width", x3.bandwidth())
                              //.style("fill", (d) => color(d.genres))
                              .style("opacity", 0.5);

  }
});
