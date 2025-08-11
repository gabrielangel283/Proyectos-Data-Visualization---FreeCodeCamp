document.addEventListener('DOMContentLoaded', () => {
    const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    const height = 450;
    const width = 690;
    const padding = 38;
    let data = undefined;
    let req = new XMLHttpRequest();
    req.open("GET", URL, true);
    req.onload = function () {
        data = JSON.parse(req.responseText);

        const tooltip = d3.select('#tooltip');

        // Escala en el eje x
        const xScale = d3.scaleTime()
            .domain([new Date(d3.min(data, d => d.Year), 0), new Date(d3.max(data, d => d.Year), 0)]) // valor original de data
            .range([padding, width - padding]); // valor visual de data

        // Escala en el eje y
        const yScale = d3.scaleLinear()
            .domain([d3.max(data, (d) => d.Seconds), d3.min(data, (d) => d.Seconds)])
            .range([height - padding, padding]);

        // Eje x con 12 divisiones
        const xAxis = d3.axisBottom(xScale)
            .ticks(12);

        // Eje x con 12 divisiones
        const yAxis = d3.axisLeft(yScale)
            .tickFormat(formatTime)
            .ticks(12);

        const svg = d3.select('#grafico')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        svg.append('g')
            .attr("transform", `translate(0, ${height - padding})`)
            .attr("id", "x-axis")
            .call(xAxis);

        svg.append('g')
            .attr("transform", `translate(${padding}, 0)`)
            .attr("id", "y-axis")
            .call(yAxis);

        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('data-xvalue', d => new Date(d.Year, 0))
            .attr('data-yvalue', d => parseTimeToDate(d.Time))
            .attr('cx', (d) => xScale(new Date(d.Year, 0)))
            .attr('cy', (d) => yScale(d.Seconds))
            .attr('r', 5)
            .attr('fill', (d) => d.Doping == "" ? 'orange' : 'rgb(84, 84, 226)')
            .on('mouseover', function (event, d) {
                const xValue = d3.select(this).attr('data-xvalue');
                tooltip
                    .style('opacity', 1)
                    .attr('data-year', xValue)
                    .html(`<strong>${d.Name}: ${d.Nationality}</strong><br>
                            <strong>Year: ${d.Year}, Time: ${d.Time}</strong><br><br>
                            <strong>${d.Doping}</strong>`);
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

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    function parseTimeToDate(timeStr) {
        const [min, sec] = timeStr.split(':').map(Number);
        const date = new Date(0);
        date.setMinutes(min);
        date.setSeconds(sec);
        return date;
    }

    req.send();
})