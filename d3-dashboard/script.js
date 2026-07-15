/**
 * D3.js Analytics Dashboard Script
 * Demonstrates: Core D3 selection, Scales, Axes, Paths (Line), Bars, and Pies.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─── 1. INITIAL DATA GENERATION ───
    const generateTimeseries = (count) => {
        const data = [];
        const now = new Date();
        for (let i = count; i >= 0; i--) {
            data.push({
                date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
                value: Math.floor(Math.random() * 500) + 200
            });
        }
        return data;
    };

    const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];
    const generateCategorical = () => categories.map(c => ({
        label: c,
        value: Math.floor(Math.random() * 400) + 100
    }));

    const segments = ['Consumer', 'Corporate', 'Home Office'];
    const generateProportional = () => segments.map(s => ({
        label: s,
        value: Math.floor(Math.random() * 300) + 100
    }));

    let timeseriesData = generateTimeseries(30);
    let barData = generateCategorical();
    let donutData = generateProportional();

    // ─── 2. COMMON UTILS ───
    const tooltip = d3.select("#tooltip");

    // ─── 3. LINE CHART (Revenue Trend) ───
    const renderLineChart = (data) => {
        const container = d3.select("#lineChart");
        container.selectAll("*").remove(); // Clear previous

        const width = container.node().clientWidth;
        const height = container.node().clientHeight;
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        // Gradient for the line
        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "line-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");

        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#c084fc");

        // Scales
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) * 1.2])
            .range([height - margin.bottom, margin.top]);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .attr("class", "axis")
            .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %d")))
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(5))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr("x2", width - margin.left - margin.right).attr("stroke-opacity", 0.05));

        // Line generator
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value))
            .curve(d3.curveBasis); // Smooth curve

        // Path
        const path = svg.append("path")
            .datum(data)
            .attr("class", "chart-line")
            .attr("d", line);

        // Animation
        const length = path.node().getTotalLength();
        path.attr("stroke-dasharray", length + " " + length)
            .attr("stroke-dashoffset", length)
            .transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);

        // Tooltip interaction area
        const bisect = d3.bisector(d => d.date).left;
        const overlay = svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all");

        overlay.on("mousemove", (event) => {
            const x0 = x.invert(d3.pointer(event)[0]);
            const i = bisect(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            tooltip.style("opacity", 1)
                .html(`<strong>${d3.timeFormat("%b %d")(d.date)}</strong><br/>Revenue: $${d.value}`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        }).on("mouseout", () => tooltip.style("opacity", 0));
    };

    // ─── 4. BAR CHART (Sales by Category) ───
    const renderBarChart = (data) => {
        const container = d3.select("#barChart");
        container.selectAll("*").remove();

        const width = container.node().clientWidth;
        const height = container.node().clientHeight;
        const margin = { top: 10, right: 10, bottom: 30, left: 40 };

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([margin.left, width - margin.right])
            .padding(0.4);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .attr("class", "axis")
            .call(d3.axisBottom(x))
            .call(g => g.select(".domain").remove());

        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label))
            .attr("y", height - margin.bottom)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .transition()
            .duration(800)
            .attr("y", d => y(d.value))
            .attr("height", d => height - margin.bottom - y(d.value));
    };

    // ─── 5. DONUT CHART (Segment Distribution) ───
    const renderDonutChart = (data) => {
        const container = d3.select("#donutChart");
        container.selectAll("*").remove();

        const width = container.node().clientWidth;
        const height = container.node().clientHeight;
        const radius = Math.min(width, height) / 2 - 10;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(['#3b82f6', '#8b5cf6', '#ec4899']);

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(radius * 0.6) // Donut hole
            .outerRadius(radius);

        const arcs = svg.selectAll(".arc")
            .data(pie(data))
            .enter()
            .append("g");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.label))
            .attr("stroke", "#1c2128")
            .attr("stroke-width", 2)
            .transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) { return arc(i(t)); };
            });
            
        // Labels in center
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#9ca3af")
            .attr("y", -5)
            .text("TOTAL");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .attr("fill", "#fff")
            .attr("y", 15)
            .text(d3.sum(data, d => d.value));
    };

    // ─── 6. INIT & UPDATE ───
    const refreshDash = () => {
        renderLineChart(timeseriesData);
        renderBarChart(barData);
        renderDonutChart(donutData);
    };

    refreshDash();

    // Handle button click
    d3.select("#updateData").on("click", () => {
        timeseriesData = generateTimeseries(30);
        barData = generateCategorical();
        donutData = generateProportional();
        refreshDash();
    });

    // Handle window resize
    window.addEventListener('resize', refreshDash);
});
