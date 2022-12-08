d3.queue()
  .defer(d3.csv, "data/employee-type-total-data.csv")
  .defer(d3.json, "data/employee-email-contact-data.json")
  .await(ready);

function ready(error, typeTotalData, data) {
  if (error) throw error;

  const innerWidth = window.innerWidth;
  const margin = {top: 30, right: 30, bottom: 30, left: 30},
    padding = {top: 30, right: 30, bottom: 30, left: 30},
    width = innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  const groups = typeTotalData.map(x => x["INDEX"]);  
  const cScale = d3.scaleOrdinal().domain(groups).range(d3.schemeTableau10);

  // Create a tooltip
  const tooltip = d3.select('#employeeEmailContactDistribution')
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
    const array = d.name.split("@");
    let str = array[0];
    tooltip.html(str)
      .style("left", (d3.event.x + 20) + "px")
      .style("top", (d3.event.y + 500) + "px")
      .style("color", "black")
      .style("z-index", 99)
  }

  let simulation = d3.forceSimulation(data.nodes) 
    .force("link", d3.forceLink().id(function(d) { return d.id; }).links(data.links))
    .force("charge", d3.forceManyBody().strength(-600))     
    .force("center", d3.forceCenter(width / 2, height / 2))
  ;

  // Build basic graph
  let svg = d3.select('#employeeEmailContactDistribution')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + padding.top + padding.bottom + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(0," + (margin.top + padding.top) + ")");

  // Initialize the links
  let link = svg
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", function (d) {
      if (d["number"] < 10) {
        return "gray";
      } else if (d["number"] < 20) {
        return "blue";
      } else if (d["number"] < 30) {
        return "orange";
      } else {
        return "red";
      }
    })

  // Initialize the nodes
  let node = svg.selectAll(".node")
    .data(data.nodes)
    .enter()
    .append("g")
    .attr("class", "node");

  node.append("circle")
    .attr("x", -8)
    .attr("y", -8)
    .attr("r", 16)
    .attr("fill", function(d) {
      return cScale(d.group);
    })
    .on("mouseover", mouseOver)
    .on("mousemove", mouseMove)
    .on("mouseleave", mouseLeave)
    .call(drag(simulation));

  simulation.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });

  function drag(simulation) {    
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
}