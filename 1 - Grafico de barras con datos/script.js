document.addEventListener("DOMContentLoaded", () => {
    const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
    const req = new XMLHttpRequest();
    const padding = 35;
    const width = 800;
    const height = 390;
    let data = undefined;
    req.open('GET', URL, true);
    req.onload = function () {
        data = JSON.parse(req.responseText).data;

        // Escala en el eje x
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d[0]))) // valor original de data
            .range([padding, width - padding]); // valor visual de data

        // Escala en el eje y
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d) => d[1])]) // valor original de data
            .range([height - padding, padding]) // valor visual de data

        // Eje x con 10 divisiones y formato de fecha
        const xAxis = d3.axisBottom(xScale)
            .ticks(10)
            .tickFormat(d3.timeFormat("%Y"));

        // Eje x con 10 divisiones
        const yAxis = d3.axisLeft(yScale)
            .ticks(10);

        const tooltip = d3.select('#tooltip');

        const svg = d3
            .select('#grafico')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Eje X (abajo)
        svg.append("g")
            .attr("transform", `translate(0, ${height - padding})`) // mover al fondo
            .attr("id", "x-axis")
            .call(xAxis);

        // Eje Y (izquierda)
        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`) // mover al lado izq
            .attr("id", "y-axis")
            .call(yAxis);

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('data-date', (d, i) => d[0])
            .attr('data-gdp', (d, i) => d[1])
            .attr('x', (d) => xScale(new Date(d[0])))
            .attr('y', (d) => yScale(d[1]))
            .attr('width', 2.68)
            .attr('height', d => height - padding - yScale(d[1]))
            .on('mouseover', (event, d) => {
                tooltip
                    .style('opacity', 1)
                    .html(`<strong>${d[0]}</strong><br/>GDP: $${d[1]} B`)
                    .attr('data-date', d[0]);
            })
            .on('mousemove', (event) => {
                tooltip
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 40) + 'px');
            })
            .on('mouseout', () => {
                tooltip
                    .style('opacity', 0);
            });;
    }
    req.send();
})