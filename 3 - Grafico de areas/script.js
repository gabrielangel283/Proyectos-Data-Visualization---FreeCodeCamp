document.addEventListener('DOMContentLoaded', () => {
    const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
    const height = 500;
    const width = 1400;
    const margin_x = 130;
    const margin_y = 30;
    let data = null;

    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    const legendData = [
        { label: "0–10%", color: "#7bccc4" },
        { label: "10–20%", color: "#4eb3d3" },
        { label: "20–30%", color: "#2b8cbe" },
        { label: "30–40%", color: "#0868ac" },
        { label: "40%+", color: "#084081" }
    ];

    let req = new XMLHttpRequest();
    req.open('GET', URL, true);
    req.onload = function () {
        data = JSON.parse(req.responseText).monthlyVariance;

        const tempBase = 8.66;
        const tooltip = d3.select('#tooltip');
        const minYear = new Date(d3.min(data, d => d.year), 0);
        const maxYear = new Date(d3.max(data, d => d.year), 0);

        const tempExtent = d3.extent(data, d => tempBase + d.variance);

        // Escala de colores
        const colorScale = d3.scaleSequential()
            .domain([tempExtent[1], tempExtent[0]])  // invertido
            .interpolator(d3.interpolateRdYlBu);

        // Escala en el eje x
        const xScale = d3.scaleTime()
            .domain([minYear, maxYear])
            .range([margin_x, width - margin_x]);

        // Escala en el eje y
        const yScale = d3.scaleBand()
            .domain(months)                       // dominios son categorías (meses)
            .range([margin_y, height - margin_y]);  // eje Y va de abajo a arriba

        // Eje x con 26 divisiones
        const xAxis = d3.axisBottom(xScale)
            .ticks(26);

        // Eje x con 12 divisiones
        const yAxis = d3.axisLeft(yScale)
            .ticks(12);

        // Agregar svg a al contenedor del grafico
        const svg = d3.select('#grafico')
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        // Agregar un svg para la legenda en el contenedor del grafico
        const legenda = d3.select('#grafico')
            .append('svg')
            .attr('id', 'legend')
            .attr('height', 120)
            .attr('width', 250)
            .attr('style', 'margin-left: 130px')

        svg.append('g')
            .attr("transform", `translate(0, ${height - margin_y})`)
            .attr('id', 'x-axis')
            .call(xAxis);

        svg.append('g')
            .attr("transform", `translate(${margin_x}, 0)`)
            .attr('id', 'y-axis')
            .call(yAxis);

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('data-month', d => d.month - 1)
            .attr('data-year', d => d.year)
            .attr('data-temp', d => tempBase + d.variance)
            .attr('height', yScale.bandwidth())
            .attr('width', 4)
            .attr('x', d => xScale(new Date(d.year, 0)))
            .attr('y', d => yScale(months[d.month - 1]))
            .attr('fill', d => colorScale(tempBase + d.variance))
            .on('mouseover', function (event, d) {
                const xValue = d3.select(this).attr('data-year');
                tooltip
                    .style('opacity', 1)
                    .attr('data-year', xValue)
                    .attr('class', 'text-center')
                    .html(`<strong>${d.year} - ${months[d.month - 1]}</strong><br>
                            <strong>${(tempBase + d.variance).toFixed(1)}</strong><br>
                            <strong>${d.variance.toFixed(1)}</strong>`);
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

        const numColors = 9;
        const colorDomain = d3.range(numColors).map(i =>
            tempExtent[0] + (i / (numColors - 1)) * (tempExtent[1] - tempExtent[0])
        );

        legenda.selectAll('rect')
            .data(colorDomain)
            .enter()
            .append('rect')
            .attr('x', (d, i) => i * (190 / numColors))  // distribuir horizontalmente
            .attr('y', 20)
            .attr('width', 190 / numColors)
            .attr('height', 30)
            .attr('fill', d => colorScale(d));

        const legendScale = d3.scaleLinear()
            .domain(tempExtent)       // [minTemp, maxTemp]
            .range([0, 190]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(numColors);


        const legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(30, ${height - 150})`); // Posición en el SVG

    };

    req.send();
})