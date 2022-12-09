function updateNetworkGraph(nodeId) {
    d3.select('#employeeEmailContactDistribution').select("svg").remove();

    drawNetworkChart(nodeId);
}