var dati;
var data;

d3.csv("data/abstraction_sector1.csv", function(error,csv) {
	
	if(error){
		console.log(error);
	}
	
	dati = csv;
	//console.log(dati);
	drawCharts("Croatia");
});

//drawCharts("Germany");

function drawCharts(value){
	
	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 50, left: 80},
		width = 600 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	//filter year
	data = dati;
	data = data.filter(function(row) {
		return row['geo'] == value;
		});
	data = data.map((d) => {
		return {TIME_PERIOD: d.TIME_PERIOD, Agriculture: +d.ABS_AGR, Electricity: +d.ABS_ELC_CL, Industry: +d.ABS_IND, Cooling: +d.ABS_IND_CL, Public: +d.ABS_PWS}
		});
	
	// List of subgroups = header of the csv files = soil condition here
	var subgroups = ['Agriculture','Electricity','Industry','Cooling','Public'];
	//console.log(subgroups);

	// List of groups = species here = value of the first column called group -> I show them on the X axis
	//var groups = d3.map(data, function(d){return(d.geo)}).keys();
	//console.log(groups);
	//var groups = ["Albania","Austria","Belgium","Bosnia and Herzegovina","Bulgaria","Croatia","Cyprus","Czechia","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Iceland","Ireland","Italy","Kosovo","Latvia","Liechtenstein","Lithuania","Luxembourg","Macedonia","Malta","Moldova","Montenegro","Netherlands","Norway","Poland","Portugal","Romania","Russia","Serbia","Slovakia","Slovenia","Spain","Sweden","Switzerland"];
	var groups = ["2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018"];

	//console.log(data.length);

	var ct = [];
	for(let i=0;i<groups.length;i++){
		var temp = data.filter(function(row) {
				return row['TIME_PERIOD'] == groups[i];});
		temp = d3.map(temp, function(d){return d.Agriculture + d.Electricity + d.Industry + d.Cooling + d.Public}).keys().map(Number);
		ct.push(temp[0]);
	}

	// Add X axis
	var x = d3.scaleBand()
	  .domain(groups)
	  .range([0, width])
	  .padding([0.2])

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(ct)])
		.range([ height, 0 ]);

	// color palette = one color per subgroup
	var colori = ["rgb(236, 190, 180)", "rgb(197, 201, 164)","rgb(126, 176, 155)","rgb(81, 158, 138)","rgb(71, 106, 111)"];
	var color = d3.scaleOrdinal()
	.domain(subgroups)
	.range(colori);

	//stack the data? --> stack per subgroup
	var stackedData = d3.stack()
	.keys(subgroups)
	(data)
	//console.log(stackedData);

	//tooltip
	var tooltip = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);

	// Show the bars
	var bars = d3.select("#bars").selectAll("g").data(stackedData);
	
	//enter
	bars.enter()
	.append("g")
	  .attr("transform",
          "translate(" + margin.left + ",15)")
	  .attr("fill", function(d) { return color(d.key); })
	  .selectAll("rect")
	  // enter a second time = loop subgroup per subgroup to add all rectangles
	  .data(function(d) { return d; })
	  .enter().append("rect")
		.attr("x", function(d) { return x(d.data.TIME_PERIOD); })
		.attr("y", function(d) { return y(d[1]); })
					/*function(d) {
					if(isNaN(y(d[1]))){ return 0;}
					else{ return y(d[1]);}
					})*/
		.attr("height", function(d) { return y(d[0]) - y(d[1]); })
					/* if(isNaN(y(d[0]) - y(d[1]))){ return 0;}
					else{ return y(d[0]) - y(d[1]);}
					})*/
		.attr("width",x.bandwidth())
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.attr("opacity", 0.8);
			var subgroupName = d3.select(this.parentNode).datum().key;
			var subgroupValue = d.data[subgroupName];
			tooltip.transition()    
				.duration(200)    
				.style("opacity", 0.9);
			tooltip.html("<strong id='textlab'> Sector: </strong><strong>" +subgroupName+ "</strong><br>" + "<strong id='textlab'>Value: </strong><strong>" + subgroupValue + " mill. m³</strong>")
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.attr("opacity", 1);
			tooltip.transition()    
				.duration(200)    
				.style("opacity", 0);			
		});
		
	//update
	bars.selectAll("rect").data(function(d) { return d; }).transition()
		.duration(500)
		.attr("x", function(d) { return x(d.data.TIME_PERIOD); })
		.attr("y", function(d) { return y(d[1]); })
		.attr("height", function(d) { return y(d[0]) - y(d[1]); })
		.attr("width",x.bandwidth());
		
	//exit
	bars.selectAll("rect").exit().remove();
	
	d3.select('#yAxis')
		.attr("transform", "translate("+(margin.left)+",15)")   
		//.attr("transform", "translate(0,0)")   
        .call(d3.axisLeft(y).ticks(6))
		.selectAll("text")
			.style("font-size", "14px")
			.style("text-anchor", "end");
		
	d3.select('#xAxis')
		.attr("transform", "translate("+(margin.left)+","+(height+15)+")")  
        .call(d3.axisBottom(x))
		.selectAll("text")
			.attr("y","12")
			.style("font-size", "14px")
			.style("text-anchor", "middle");
		
	//creo legenda
    var legenda = d3.select("#legend")
                        .selectAll("rect.colore")
                        .data(colori);

    legenda
        .enter()
        .append("rect")
        .attr("class",function(d,i){return "colore " + colori[i];})
        .attr("x", 40)
        .attr("y",function(d,i){return i*50+13;})
        .attr("width",40)
        .attr("height",20)
		.attr("stroke", "black")
        .attr("fill", function(d){return d});

    legenda.transition()
        .duration(1000)
        .style("fill", function(d){return d});

	var labels = ["Agriculture", "Electricity", "Industry", "Cooling", "Public"];
    var etichette =  d3.select("#legend")
                    .selectAll("text")
                    .data(labels);
   
    etichette.enter()
        .append("text")
        .attr("x", 90)
        .attr("y",function(d,i){return i*50+29;})
        .text(function(d){return d;})
        .attr("font-size","18px");

    etichette.transition()
        .duration(1000).text(function(d){return d;})
}

function numberWithCommas(x) {
    return x.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}