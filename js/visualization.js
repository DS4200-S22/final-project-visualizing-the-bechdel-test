// Set margins and dimensions
const margin = { top: 50, right: 50, bottom: 50, left: 200 };
const width = 2000; //- margin.left - margin.right;
const height = 650; //- margin.top - margin.bottom;

// Append svg object to the body of the page to house bar chart .
const svg3 = d3
  .select("#vis-container")
  .append("svg")
  .attr("width", width - margin.left - margin.right)
  .attr("height", height - margin.top - margin.bottom)
  .attr("viewBox", [0, 0, width, height]);

// Define color scale
const color = d3
  .scaleOrdinal()
  .range(["#21908d88", "#21908d8c", "#21908dcf", "#21908dff"]);

// Plotting
d3.csv("data/data_bechdel_new - data_bechdel.csv").then((data) => {
  const moviesbygenre = d3.groups(data, (d) => d.genres.split(",")[0]);
  const moviesrollup = d3.rollups(
    data,
    (v) => v.length,
    (d) => d.genres.split(",")[0]
  );
  const moviesnestedrollup = d3.rollups(
    data,
    (v) => v.length,
    (d) => d.genres.split(",")[0],
    (d) => d.bechdel_rating
  );

  const groupedMap = d3.group(
    data,
    (d) => d["genres"].split(',')[0],
    (d) => d["bechdel_rating"]
  );

  const stackKeys = Array.from(
    new Set(data.map((d) => d["bechdel_rating"])).values()
  ).sort();

  const tableData = () => {
    return Array.from(groupedMap.entries()).map((g) => {
      const obj = {};
      obj["genres"] = g[0];
      for (let col of stackKeys) {
        const vals = g[1].get(col);
        obj[col] = vals?.length ?? 0;
      }
      return obj;
    });
  };

  const stackedData = d3.stack().keys(stackKeys)(tableData());

  // We will need scales for all of the following charts to be global
  let x3, y3;

  // We will need keys to be global
  let xKey3, yKey3;

  // Barchart with counts of different species

  xKey3 = "Genres";
  yKey3 = "Count";

  // Create X scale
  x3 = d3
    .scaleBand()
    .domain(d3.range(moviesrollup.length))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  // Add x axis
  svg3
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x3).tickFormat(((d, i) => moviesrollup[i][0])))
    .attr("font-size", "20px")
    .call((g) =>
      g
        .append("text")
        .attr("x", width - margin.right)
        .attr("y", margin.bottom - 4)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text(xKey3)
    );

  // Find max y
  let maxY3 = d3.max(moviesrollup, (d) => d[1]);

  // Create Y scale
  y3 = d3
    .scaleLinear()
    .domain([0, maxY3])
    .range([height - margin.bottom, margin.top]);

  //    Add y axis
  svg3
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y3))
    .attr("font-size", "20px")
    .call((g) =>
      g
        .append("text")
        .attr("x", 0)
        .attr("y", margin.top)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text(yKey3)
    );

  // Show the bars
  svg3
    .append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d, i) => x3(i))
    .attr("y", (d) => y3(d[1]))
    .attr("height", (d) => y3(d[0]) - y3(d[1]))
    .attr("width", x3.bandwidth());
});
