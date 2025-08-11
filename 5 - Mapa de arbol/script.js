document.addEventListener('DOMContentLoaded', () => {
    const width = 1050;
    const height = 780;
    const margin_x = 60;
    const margin_y = 10;

    const URL_data = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

    const req = new XMLHttpRequest();
    req.open('GET', URL_data, true);

    req.onload = function () {
        const data = JSON.parse(req.responseText);
        console.log(data);

        const tooltip = d3.select('#tooltip');

        // Crear jerarquía
        const root = d3.hierarchy(data)
            .sum(d => d.value) // suma de valores (ventas)
            .sort((a, b) => b.value - a.value); // orden descendente

        // Crear layout de treemap
        d3.treemap()
            .size([width, height])
            .padding(1)
            (root);

        // Escala de color para categorías
        const categories = root.children.map(d => d.data.name);
        const color = d3.scaleOrdinal()
            .domain(categories)
            .range(d3.schemeCategory10);

        // Agregar svg al contenedor del grafico
        const svg = d3.select('#grafico')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const cell = svg.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

        cell.append('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('class', 'tile')
            .attr('data-name', d => d.data.name)
            .attr('data-category', d => d.data.category)
            .attr('data-value', d => d.data.value)
            .attr('fill', d => color(d.parent.data.name))
            .attr('stroke', '#141212ff')
            .on('mouseover', function (event, d) {
                tooltip
                    .style('opacity', 1)
                    .attr('data-value', d.data.value)
                    .html(() => (
                        `<p>Name: ${d.data.name}</p>
                 <p>Category: ${d.data.category}</p>
                 <p>Value: ${d.data.value}</p>`
                    ));
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

        // Agregar etiquetas
        cell.append('text')
            .selectAll('tspan')
            .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g)) // dividir en palabras
            .enter()
            .append('tspan')
            .attr('style', 'font-size: 10.5px')
            .attr('x', 4)
            .attr('y', (d, i) => 13 + i * 10)
            .text(d => d);

        const legenda = d3.select('#grafico')
            .append('svg')
            .attr('width', 420)
            .attr('height', 600)
            .attr('id', 'legend')

        const colum = 6;
        const size = 20;
        const espacio = 50;
        legenda.selectAll("rect")
            .data(categories)
            .enter()
            .append("rect")
            .attr('class', 'legend-item')
            .attr("x", (d, i) => (i % colum) * (size + espacio))
            .attr("y", (d, i) => Math.floor(i / colum) * (size + espacio))
            .attr("width", size)
            .attr("height", size)
            .attr("fill", d => color(d));

        legenda.selectAll("text")
            .data(categories)
            .enter()
            .append("text")
            .attr("x", (d, i) => (i % colum) * (size + espacio) + 25) // a la derecha del cuadro
            .attr("y", (d, i) => Math.floor(i / colum) * (size + espacio) + 15) // centrado verticalmente
            .text(d => d)
            .style("font-size", "14px")
            .style("fill", "#000");
    };
    req.send();
});
