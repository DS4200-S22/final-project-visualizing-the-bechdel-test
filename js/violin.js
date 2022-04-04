// https:d3-graph-gallery.com/graph/violin_basicHist.html

// set the dimensions and margins of the graph
const violinMargin = { top: 10, right: 30, bottom: 30, left: 40 };
const violinWidth = 460 - violinMargin.left - violinMargin.right;
const violinHeight = 400 - violinMargin.top - violinMargin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#violin-chart")
  .append("svg")
  .attr("width", violinWidth + violinMargin.left + violinMargin.right)
  .attr("height", violinHeight + violinMargin.top + violinMargin.bottom)
  .attr(
    "transform",
    "translate(" + violinMargin.left + "," + violinMargin.top + ")"
  );

// Read the data and compute summary statistics for each specie
d3.csv("data/data_bechdel_new - data_bechdel.csv").then(data => {
  // Build and Show the Y scale
  const y = d3
    .scaleLinear()
    .domain([0, 5000]) // Note that here the Y scale is set manually
    .range([violinHeight, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
  const x = d3
    .scaleBand()
    .range([0, violinWidth])
    .domain(["Pass", "Fail"])
    .padding(0.05); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
  svg
    .append("g")
    .attr("transform", "translate(0," + violinHeight + ")")
    .call(d3.axisBottom(x));

  // Features of the histogram
  const histogram = d3
    .histogram()
    .domain(y.domain())
    .thresholds(y.ticks(20)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
    .value((d) => d);

  // Compute the binning for each group of the dataset
  console.log(data)
  const sumstat = d3.rollup(
    data,
    (v) => v.length,
    d => d.passed,
    (d) => {
      return d.imdb_rating;
      // For each key..
      // input = d.map(function (g) {
      //   return g.Sepal_Length;
      // }); // Keep the variable called Sepal_Length
      // bins = histogram(input); // And compute the binning on it.
      // return bins;
    }
  );
  console.log(sumstat)

  // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
  const maxNum = 100;
  // for (i in sumstat) {
  //   allBins = sumstat[i].value;
  //   lengths = allBins.map(function (a) {
  //     return a.length;
  //   });
  //   longuest = d3.max(lengths);
  //   if (longuest > maxNum) {
  //     maxNum = longuest;
  //   }
  // }

  // // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
  // const xNum = d3
  //   .scaleLinear()
  //   .range([0, x.bandwidth()])
  //   .domain([-maxNum, maxNum]);

  // // Add the shape to this svg!
  // svg
  //   .selectAll("myViolin")
  //   .data(sumstat)
  //   .enter() // So now we are working group per group
  //   .append("g")
  //   .attr("transform", function (d) {
  //     return "translate(" + x(d.key) + " ,0)";
  //   }) // Translation on the right to be at the group position
  //   .append("path")
  //   .datum(function (d) {
  //     return d.value;
  //   }) // So now we are working bin per bin
  //   .style("stroke", "none")
  //   .style("fill", "#69b3a2")
  //   .attr(
  //     "d",
  //     d3
  //       .area()
  //       .x0(function (d) {
  //         return xNum(-d.length);
  //       })
  //       .x1(function (d) {
  //         return xNum(d.length);
  //       })
  //       .y(function (d) {
  //         return y(d.x0);
  //       })
  //       .curve(d3.curveCatmullRom) // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
  //   );
});
