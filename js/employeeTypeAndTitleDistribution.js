d3.queue()
  .defer(d3.csv, "data/employee-type-title-total-data.csv")
  .defer(d3.csv, "data/employee-type-total-data.csv")
  .await(ready);

function ready(error, typeTitleTotalData, typeTotalData) {
  if (error) throw error;
  
  // Initial
  const innerWidth = window.innerWidth / 2;
  const margin = {top: 30, right: 30, bottom: 30, left: 30},
    padding = {top: 30, right: 30, bottom: 30, left: 30},
    width = innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
  const paddingInner = 0.33;
  const paddingOuter = 0.33;
  const totalDomain = [0, d3.max(typeTotalData, function(d) {
    return parseInt(d["TOTAL"]);
  })];

  var typeDomain = [];
  for(let i = 0; i < typeTotalData.length; i ++) {
    const type = typeTotalData[i]["TYPE"];
    if (!typeDomain.includes(type)) {
      typeDomain.push(type);
    }
  }

  // Create a tooltip
  const tooltip = d3.select('#employeeTypeAndTitleDistribution')
    .append("div")
    .style("opacity", 0)
    .attr("class", "position-absolute bg-white border border-dark border-2 rounded-1 p-2");

  // Mouse functions
  const mouseLeave = function (d) {
    tooltip.style("opacity", 0);
  }   

  const mouseOver = function (d) {
    tooltip.style("opacity", 1);
  }

  let mouseMove = function(d) {
    let str = "";
    for(let i = 0; i < typeTitleTotalData.length; i ++) {
      if ((typeTitleTotalData[i]["TYPE"]) == d["TYPE"]) {
        const title = typeTitleTotalData[i]["TITLE"];
        const total = typeTitleTotalData[i]["TOTAL"];
        str += "<div>" + title + ": " + total + "</div>"
      }
    }
    str += "<div>Total: " + d["TOTAL"] + "</div>";

    tooltip.html(str).style("left", (d3.event.x + 30) + "px").style("top", (d3.event.y) + "px")
  }
  
  // Build scales 
  const xScaleBand = d3.scaleBand()
    .domain(typeDomain)
    .range([0, width - padding.left - padding.right - margin.left - margin.right])
    .paddingOuter(paddingOuter).paddingInner(paddingInner);
  const yScale = d3.scaleLinear()
    .domain(totalDomain)
    .rangeRound([height - padding.top - margin.top, 0]);
    
  // Build basic graph  
  const svg = d3.select("#employeeTypeAndTitleDistribution")
    .append("svg")
    .attr("width", width + margin.left + margin.right + padding.left + padding.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (margin.left + padding.left + 50) + "," + (margin.top + padding.top) + ")");

  // x
  const xAxis = svg.append("g")
    .attr("class", "x-axis fs-6")
    .attr("transform", "translate(0," + (height - padding.top - padding.bottom) + ")")
    .call(d3.axisBottom(xScaleBand));

  // y
  const yAxis = svg.append("g")
    .attr("class", "y-axis fs-6")
    .call(d3.axisLeft(yScale));
    
  const rects = svg.selectAll("rect")
    .data(typeTotalData)
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return xScaleBand(d["TYPE"]);
    }).attr("y", function(d) {
      return yScale(d["TOTAL"]);
    })
    .attr("height", function(d) {
      return height - padding.top - padding.bottom - yScale(d["TOTAL"]);
    })
    .attr("width", xScaleBand.bandwidth())
    .style("fill", "steelblue")
    .on("mouseover", mouseOver)
    .on("mousemove", mouseMove)
    .on("mouseleave", mouseLeave);  
}