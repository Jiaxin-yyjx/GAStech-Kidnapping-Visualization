d3.queue()
  .defer(d3.csv, "data/employee-type-total-data.csv")
  .defer(d3.json, "data/employee-email-contact-data.json")
  .await(ready);

// Global
let globalData1;
let globalData2;

function ready(error, data1, data2) {
  if (error) throw error;

  globalData1 = data1;
  globalData2 = data2;

  drawNetworkChart(null);
}

function drawNetworkChart(nodeId){
  const typeTotalData = globalData1;
  const emailNetworkData = globalData2;
  if (nodeId) {
    let existingNodes = [];
    let links = [];
    let nodes = [];
    for(let i = 0; i < emailNetworkData.links.length; i ++) {
      if (emailNetworkData.links[i].source.id == nodeId || emailNetworkData.links[i].target.id == nodeId) {
        existingNodes.push(emailNetworkData.links[i].source.id);
        existingNodes.push(emailNetworkData.links[i].target.id);
        links.push(emailNetworkData.links[i]);
      }
    }
    for(let i = 0; i < emailNetworkData.nodes.length; i ++) {
      if (emailNetworkData.nodes[i].id == nodeId || existingNodes.includes(emailNetworkData.nodes[i].id)) {
        nodes.push(emailNetworkData.nodes[i]);
      }
    }
    emailNetworkData.links = links;
    emailNetworkData.nodes = nodes;
  }
  const links = emailNetworkData.links;
  const nodes = emailNetworkData.nodes;

  const innerWidth = window.innerWidth;
  const margin = {top: 30, right: 30, bottom: 30, left: 30},
    padding = {top: 30, right: 30, bottom: 30, left: 30},
    width = innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    legendWidth = 250,
    graph1Height = 600;
  const legendMarkRadius = 12;
  const circleDefaultRadius = 10;
  const circleDefaultRadiusBase = 10;
  const rowHeight = 25;
  const rowPadding = 10;
  const linkDistance = 150;

  let groups = typeTotalData.map(x => x["INDEX"]);  
  groups.push("-1");
  let types = typeTotalData.map(x => x["TYPE"]);  
  types.push("Undefined");

  const cScale = d3.scaleOrdinal().domain(groups).range(d3.schemeTableau10);

  // Create a tooltip
  const tooltip = d3
    .select('#employeeEmailContactDistributionTooltip')
    .style("opacity", 0);
    
  // Mouse functions
  const mouseLeave = function (d) {
    tooltip.style("opacity", 0);
  }   

  const mouseOver = function (d) {
    tooltip.style("opacity", 1);
  }

  let mouseMove = function(event, d) {
    const array = d.name.split("@");
    let str = array[0].split(".").join(" ")
    tooltip.html(str)
      .style("left", (event.x + 20) + "px")
      .style("top", (event.y + graph1Height) + "px")
      .style("color", "black")
      .style("z-index", 99)
  }

  const forceLink = d3.forceLink()
    .id(function(d) { 
      return d.id; 
    })
    .links(links)
    .distance(linkDistance);

  let simulation = d3.forceSimulation(nodes) 
    .force("link", forceLink)
    .force("charge", d3.forceManyBody().strength(-width / 2))     
    .force('x', d3.forceX().x(function(d) {
      if (d.group > 0) {
        return legendWidth + (width - legendWidth) / groups.length * (parseInt(d.group));
      }
      return width / groups.length;
    }))
    .force('y', d3.forceY().y(function(d) {
      return height / 2;
    }))
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
    .append("g")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "gray");

  if (nodeId == null) {
    link.style("stroke-width", function (d) {
      return d["number"] / 10;
    });
  } 

  // Initialize the nodes
  let node = svg
    .append("g")
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node");

  let circle = node.append("circle")
    .attr("fill", function(d) {
      return cScale(d.group);
    })
    .on("mouseover", mouseOver)
    .on("mousemove", mouseMove)
    .on("mouseleave", mouseLeave)
    .call(drag(simulation))
    .on("click", function(event, d) {
      updateNetworkGraph(d.id); 
    });

  if (nodeId) {
    circle.attr("r", function(d) {
      if (nodeId == d.id) {
        return circleDefaultRadius;
      } else {
        for(let i = 0; i < links.length; i ++) {
          if (d.id == links[i].source.id || d.id == links[i].target.id) {
            return parseInt(links[i].number + circleDefaultRadiusBase);
          }
        }
      }
    });
  } else {
    circle.attr("r", circleDefaultRadius);
  }

  simulation.on("tick", function() {
     link
      .attr("x1", function(d) { 
        let x1 = legendWidth + d.source.x < width ? legendWidth + d.source.x : width;
        return x1; 
      })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { 
        let x2 = legendWidth + d.target.x < width ? legendWidth + d.target.x : width;
        return x2; 
      })
      .attr("y2", function(d) { return d.target.y; });
  
    node
      .attr("transform", function(d) { 
        let x = legendWidth + d.x < width ? legendWidth + d.x : width;
        return "translate(" + x + "," + d.y + ")"; 
      });
  });

  // Legend
  const legend = svg
    .append("g")
    .selectAll(".legend") 
    .data(groups)
    .enter()
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
    .attr("class", "legend");   

  legend.append("circle")
    .attr("cy", function(d, i) {
      return height / groups.length + (rowHeight + rowPadding) * i;
    })
    .attr("r", legendMarkRadius)
    .attr("fill", function(group) {
      return cScale(group);
    });

  // Add the text
  legend.append("text") 
    .text(function(group){
      if (group == -1) {
        return types[types.length - 1];
      }
      return types[group];
    })
    .attr("class", "fs-6")
    .attr("y", function (d, i) {
      return height / groups.length + (rowHeight + rowPadding) * i;
    })
    .attr("x", margin.left);  

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