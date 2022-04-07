// https://d3-graph-gallery.com/graph/violin_basicHist.html

// https://d3-graph-gallery.com/graph/boxplot_basic.html

// set the dimensions and margins of the graph
const violinMargin = { top: 10, right: 40, bottom: 30, left: 40 };
const violinWidth = 800;
const violinHeight = 400;

const titleMap = {
  imdb_rating: "IMDb Rating",
  runtime_minutes: "Runtime (minutes)",
};

// Append the svg object to the body of the page
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
d3.csv("data/data_bechdel_newer.csv").then((data) => {
  let sumstat;
  let sortedPass;
  let sortedFail;
  let selectedAttribute = "imdb_rating";

  window.violinPlot = function (minYear, maxYear, attribute) {
    // Clear existing violin plot
    svg.selectAll("*").remove();

    // Set selected attribute
    selectedAttribute = attribute ?? selectedAttribute;

    // Axis titles
    const xTitle = "Bechdel Test Success";
    const yTitle = titleMap[selectedAttribute];

    // Build and Show the Y scale
    let maxY = d3.max(data, (d) => Number.parseInt(d[selectedAttribute]));
    // Round up to the nearest whole number
    maxY = Math.ceil(maxY);

    const y = d3
      .scaleLinear()
      .domain([0, maxY]) // Note that here the Y scale is set manually
      .range([violinHeight - violinMargin.bottom, violinMargin.top]);
    svg
      .append("g")
      .attr("transform", `translate(${violinMargin.left}, 0)`)
      .call(d3.axisLeft(y))
      .attr("font-size", "16px")
      .call((g) =>
        g
          .append("text")
          .attr("x", 5)
          .attr("y", violinMargin.top + 10)
          .attr("fill", "black")
          .attr("text-anchor", "start")
          .text(yTitle)
      );

    // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
    const x = d3
      .scaleBand()
      .range([
        violinMargin.left,
        violinWidth - violinMargin.left - violinMargin.right,
      ])
      .domain(["Pass", "Fail"])
      .padding(0.05); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
    svg
      .append("g")
      .attr(
        "transform",
        "translate(0," + (violinHeight - violinMargin.bottom) + ")"
      )
      .call(d3.axisBottom(x))
      .attr("font-size", "16px")
      .call((g) =>
        g
          .append("text")
          .attr("x", violinWidth / 2)
          .attr("y", violinMargin.bottom - 4)
          .attr("fill", "black")
          .attr("text-anchor", "center")
          .text(xTitle)
      );

    // Compute the binning for each group of the dataset
    sumstat = d3.rollup(
      data,
      (v) => {
        // If no year range, return all years
        if (!minYear || !maxYear) return v.length;
        // Otherwise, filter it to that range
        const filtered = v.filter(
          (movie) =>
            Number.parseInt(movie.year) >= minYear &&
            Number.parseInt(movie.year) <= maxYear
        );
        return filtered.length;
      },
      (d) => d.passed,
      (d) => d[selectedAttribute]
    );

    // Sort by sum
    sortedPass = new Map(
      [...sumstat.get("Pass")].sort((a, b) => {
        return a[0].localeCompare(b[0], "en", { numeric: true });
      })
    );
    sortedFail = new Map(
      [...sumstat.get("Fail")].sort((a, b) => {
        return a[0].localeCompare(b[0], "en", { numeric: true });
      })
    );
    sumstat.set("Pass", sortedPass);
    sumstat.set("Fail", sortedFail);

    // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
    let maxNum = 0;
    sumstat.forEach((v) => {
      const maxInCategory = d3.max(Array.from(v.values()));
      maxNum = d3.max([maxNum, maxInCategory]);
    });

    // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
    const xNum = d3
      .scaleLinear()
      .range([0, x.bandwidth()])
      .domain([-maxNum, maxNum]);

    // Add the violin to this svg!
    svg
      .selectAll("myViolin")
      .data(sumstat)
      .enter()
      // So now we are working group per group
      .append("g")
      .attr("transform", (d) => "translate(" + x(d[0]) + " ,0)") // Translation on the right to be at the group position
      .append("path")
      .datum((d) => d[1])
      // So now we are working bin per bin
      .style("stroke", "none")
      .style("fill", "#69b3a2")
      .attr(
        "d",
        d3
          .area()
          .x0((d) => xNum(-d[1]))
          .x1((d) => xNum(d[1]))
          .y((d) => y(d[0]))
          .curve(d3.curveNatural) // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
      );

    // Generate the box plots
    x.domain().forEach((xBand) => {
      // Compute summary statistics used for the box:
      let expandedValues = [];
      sumstat.get(xBand).forEach((v, k) => {
        expandedValues = expandedValues.concat(Array(v).fill(k));
      });

      const q1 = d3.quantile(expandedValues, 0.25);
      const median = d3.quantile(expandedValues, 0.5);
      const q3 = d3.quantile(expandedValues, 0.75);
      const interQuantileRange = q3 - q1;
      const min = q1 - 1.5 * interQuantileRange;
      const max = q1 + 1.5 * interQuantileRange;

      // Positioning constants
      const center = x.bandwidth() / 2 + x(xBand);
      const width = 50;

      // Show the main vertical line
      svg
        .append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", y(min))
        .attr("y2", y(max))
        .attr("stroke", "black");

      // Show the box
      svg
        .append("rect")
        .attr("x", center - width / 2)
        .attr("y", y(q3))
        .attr("height", y(q1) - y(q3))
        .attr("width", width)
        .attr("stroke", "black")
        .style("fill", "gray");

      // Show median, min and max horizontal lines
      svg
        .selectAll("toto")
        .data([min, median, max])
        .enter()
        .append("line")
        .attr("x1", center - width / 2)
        .attr("x2", center + width / 2)
        .attr("y1", function (d) {
          return y(d);
        })
        .attr("y2", function (d) {
          return y(d);
        })
        .attr("stroke", "black");
    });
  };

  violinPlot();
});
