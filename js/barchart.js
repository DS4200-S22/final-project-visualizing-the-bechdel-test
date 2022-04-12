// Set margins and dimensions
const margin = { top: 50, right: 50, bottom: 50, left: 200 };
const width = window.innerWidth; //- margin.left - margin.right;
const height = 650; //- margin.top - margin.bottom;

// Append SVG object to the body of the page to house bar chart .
const svg3 = d3
  .select("#stackedbar-chart")
  .append("svg")
  .attr("width", width - margin.left - margin.right)
  .attr("height", height - margin.top - margin.bottom)
  .attr("viewBox", [0, 0, width, height]);

// Color scale
const color = d3
  .scaleOrdinal()
  .range(["#94DBBC", "#59B69F", "#3E9C8A", "#2A856F"]);

// Plotting
d3.csv("data/data_bechdel_newer.csv").then((data) => {
  let genreCounts;
  let stackFormatted;
  let stacked;
  let currentlyFilteredGenres = new Set();
  let selectedMinYear;
  let selectedMaxYear;

  // Assign global function accessible to other scripts
  window.barChart = function (filteredGenres, minYear, maxYear) {
    // Clear existing bar chart
    svg3.selectAll("*").remove();

    // Assign properties
    currentlyFilteredGenres = filteredGenres ?? currentlyFilteredGenres
    selectedMinYear = minYear;
    selectedMaxYear = maxYear;

    // Create map of counts
    genreCounts = new Map();
    stackFormatted = [];
    data.forEach((d) => {
      const year = Number.parseInt(d.year);
      if (year < selectedMinYear || year > selectedMaxYear) return;
      const bechdel_rating = d.bechdel_rating;
      d.genres.split(",").forEach((genre) => {
        genreCounts.set(genre, genreCounts.get(genre) || new Map());
        genreCounts
          .get(genre)
          .set(
            bechdel_rating,
            (genreCounts.get(genre).get(bechdel_rating) || 0) + 1
          );
      });
    });

    // Sort by sum
    genreCounts = new Map(
      [...genreCounts]
      .filter((g) => !currentlyFilteredGenres.has(g[0]))
      .sort(
        (a, b) =>
          d3.sum(Array.from(a[1].values())) < d3.sum(Array.from(b[1].values()))
      )
    );

    // Format for stacking
    genreCounts.forEach((v, k) => {
      stackFormatted.push({
        genre: k,
        0: v.get("0") || 0,
        1: v.get("1") || 0,
        2: v.get("2") || 0,
        3: v.get("3") || 0,
      });
    });

    stacked = d3.stack().keys(["0", "1", "2", "3"])(stackFormatted);

    // Axis labels
    const xKey3 = "Genre";
    const yKey3 = "Number of Movies";

    // Create x scale
    const x3 = d3
      .scaleBand()
      .domain(d3.range(genreCounts.size))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    // Add x axis
    svg3
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x3).tickFormat((d) => Array.from(genreCounts.keys())[d])
      )
      .attr("font-size", "14px")
      .call((g) =>
        g
          .append("text")
          .attr("x", width / 2)
          .attr("y", margin.bottom - 4)
          .attr("fill", "black")
          .attr("text-anchor", "center")
          .text(xKey3)
      );

    // Find max y
    const maxY3 = d3.max(genreCounts, (d) => {
      const valuesArray = Array.from(d[1].values());
      return d3.sum(valuesArray);
    });

    // Create y scale
    const y3 = d3
      .scaleLinear()
      .domain([0, maxY3])
      .range([height - margin.bottom, margin.top]);

    // Add y axis
    svg3
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y3))
      .attr("font-size", "20px")
      .call((g) =>
        g
          .append("text")
          .attr("x", 0)
          .attr("y", margin.top - 10)
          .attr("fill", "black")
          .attr("text-anchor", "end")
          .text(yKey3)
      );

    // Show the bars
    svg3
      .append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stacked)
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
  };

  // Draw the initial bar chart
  barChart();

  //citation: https://www.javascripttutorial.net/javascript-dom/javascript-radio-button/

  const checkboxes = document.querySelectorAll('input[name="genres"]');

  for (i of checkboxes) {
    i.addEventListener("click", () => {
      const filtered = new Set();
      for (const cb of checkboxes) {
        if (!cb.checked) {
          filtered.add(cb.value);
        }
      }
      // show the output:
      barChart(filtered, selectedMinYear, selectedMaxYear);
    });
  }
});
