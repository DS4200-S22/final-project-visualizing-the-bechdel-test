// Set margins and dimensions
const headerMargin = { top: 50, right: 50, bottom: 50, left: 150 };
const headerWidth = window.innerWidth; // - margin.left - margin.right;
const headerHeight = 500 - margin.top - margin.bottom;

//Create space for the sticky linechart header on the page
const header_holder = d3
  .select("#line-chart")
  .append("svg")
  .attr("width", headerWidth)
  .attr("height", headerHeight - headerMargin.top - headerMargin.bottom)
  .attr("viewBox", [0, 0, headerWidth, headerHeight + headerMargin.bottom]);

//initializes the brush for the line graph header
let year_brush;

//loads in the data from the cleaned CSV file of our movie dataset
//Read the data
d3.csv("data/data_bechdel_newer.csv").then((data) => {
  // citation: https://observablehq.com/@d3/d3-group

  const pass_count = d3.rollup(
    data,
    (v) => v.length,
    (d) => d.year,
    (d) => d.passed
  );
  const pass_count_sorted = new Map(
    [...pass_count].sort((a, b) => String(a[0]).localeCompare(b[0]))
  );

  //citation: https://d3-graph-gallery.com/graph/line_basic.html
  const xTitle = "Year"
  const yTitle = "Percent of movies that pass the Bechdel Test"

  // Add X axis --> it is a date format
  const x = d3
    .scaleTime()
    .domain(d3.extent(pass_count_sorted, (d) => new Date(d[0])))
    .range([0, headerWidth]);

  xAxis = header_holder
    .append("g")
    .attr("transform", "translate(0," + headerHeight + ")")
    .call(d3.axisBottom(x))
    .style("font", "20px arial")
    .call((g) =>
    g
      .append("text")
      .attr("x", headerWidth / 2)
      .attr("y", headerMargin.bottom - 4)
      .attr("fill", "black")
      .attr("text-anchor", "center")
      .text(xTitle)
  );

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 100]).range([headerHeight, headerMargin.top]);

  yAxis = header_holder
    .append("g")
    .call(d3.axisLeft(y))
    .style("font", "20px arial")
    .call((g) =>
    g
      .append("text")
      .attr("x", 5)
      .attr("y", headerMargin.top - 15)
      .attr("fill", "black")
      .attr("text-anchor", "end")
      .text(yTitle)
  );

  // Add a clipPath: everything out of this area won't be drawn.
  const clip = header_holder
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", headerWidth)
    .attr("height", headerHeight)
    .attr("x", 0)
    .attr("y", 0);

  // Add brushing
  const brush = d3
    .brushX() // Add the brush feature using the d3.brush function
    .extent([
      [0, headerMargin.top],
      [headerWidth, headerHeight],
    ])
    .on("end", updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

  // Create the line variable: where both the line and the brush take place
  const line = header_holder.append("g").attr("clip-path", "url(#clip)");

  //citation: https://d3-graph-gallery.com/graph/line_brushZoom.html

  // Add the line
  line
    .append("path")
    .datum(pass_count_sorted)
    .attr("class", "line") // I add the class line to be able to modify this line later on.
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(new Date(d[0])))
        .y((d) => {
          const passed = d[1].get("Pass") ?? 0;
          const failed = d[1].get("Fail") ?? 0;
          return y((passed / (passed + failed)) * 100);
        })
    );

  // Add the brushing
  line.append("g").attr("class", "brush").call(brush);

  // A function that set idleTimeOut to null
  let idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  // A function that update the chart for given boundaries
  function updateChart(event, d) {
    // What are the selected boundaries?
    extent = event.selection;

    let minYear;
    let maxYear;
    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!extent) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      x.domain([4, 8]);
    } else {
      minYear = x.invert(extent[0]);
      maxYear = x.invert(extent[1]);
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);

      line.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and line position
    xAxis.transition().duration(1000).call(d3.axisBottom(x));
    line
      .select(".line")
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(new Date(d[0])))
          .y((d) => {
            const passed = d[1].get("Pass") ?? 0;
            const failed = d[1].get("Fail") ?? 0;
            return y((passed / (passed + failed)) * 100);
          })
      );

    window.barChart(minYear?.getFullYear(), maxYear?.getFullYear());
    window.violinPlot(minYear?.getFullYear(), maxYear?.getFullYear());
  }

  // If user double click, reinitialize the chart
  header_holder.on("dblclick", function () {
    x.domain(d3.extent(pass_count_sorted, (d) => new Date(d[0])));
    xAxis.transition().call(d3.axisBottom(x));
    line
      .select(".line")
      .transition()
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(new Date(d[0])))
          .y((d) => {
            const passed = d[1].get("Pass") ?? 0;
            const failed = d[1].get("Fail") ?? 0;
            return y((passed / (passed + failed)) * 100);
          })
      );
  });
});
