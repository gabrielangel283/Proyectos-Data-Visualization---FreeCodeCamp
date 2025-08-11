document.addEventListener('DOMContentLoaded', () => {
    const width = 1000;
    const height = 760;
    const margin_x = 60;
    const margin_y = 10;
    const URL_geoJSON = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
    const URL_data = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

    const legendData = [
        { label: "0–10%", color: "#7bccc4" },
        { label: "10–20%", color: "#4eb3d3" },
        { label: "20–30%", color: "#2b8cbe" },
        { label: "30–40%", color: "#0868ac" },
        { label: "40%+", color: "#084081" }
    ];

    Promise.all([
        fetch(URL_geoJSON).then(res => res.json()),
        fetch(URL_data).then(res => res.json())
    ])
        .then(([us, educationData]) => {
            const svg = d3.select('#grafico')
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            const path = d3.geoPath();

            const tooltip = d3.select('#tooltip');

            const counties = topojson.feature(us, us.objects.counties).features;

            const educationMap = new Map(educationData.map(d => [d.fips, d]));

            // Dibujar condados
            svg.selectAll('path')
                .data(counties)
                .enter()
                .append('path')
                .attr('data-fips', d => d.id)
                .attr('data-education', d => {
                    const edu = educationMap.get(d.id);
                    return edu !== undefined ? edu.bachelorsOrHigher : 0;
                })
                .attr('class', 'county')
                .attr('d', path)
                .attr('fill', d => {
                    const edu = educationMap.get(d.id);
                    if (!edu) return '#ccc';

                    const pct = edu.bachelorsOrHigher;

                    if (pct > 40) return '#084081';
                    else if (pct > 30) return '#0868ac';
                    else if (pct > 20) return '#2b8cbe';
                    else if (pct > 10) return '#4eb3d3';
                    else return '#7bccc4';
                })
                .on('mouseover', function (event, d) {
                    const info = educationMap.get(d.id);
                    tooltip
                        .style('opacity', 1)
                        .attr('data-education', info ? info.bachelorsOrHigher : 0)
                        .html(() => {
                            if (info) {
                                return `<strong>${info.area_name}, ${info.state}: ${info.bachelorsOrHigher}%</strong>`;
                            } else {
                                return "Sin datos";
                            }
                        });
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

            const legend = svg.append("g")
                .attr("id", "legend")
                .attr("transform", `translate(900, 260)`);

            legend.selectAll("rect")
                .data(legendData)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => i * 25)
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", d => d.color);

            legend.selectAll("text")
                .data(legendData)
                .enter()
                .append("text")
                .attr("x", 30)
                .attr("y", (d, i) => i * 25 + 15)
                .text(d => d.label)
                .attr("font-size", "14px");


        })
        .catch(error => console.error("Error cargando los datos:", error));
})