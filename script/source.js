var dati;
var data;
var dati2;
d3.csv("./data/abstraction_source1.csv", function(error,csv) {
	
	if(error){
		console.log(error);
	}
	
	dati = csv;
	//console.log(dati);
	drawCharts("2018","all");
});

function drawCharts(value,type){
	
	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 20, bottom: 30, left: 85},
		width = 600 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;
		
	var ratio = 1;
	var offset = 0;
	
	var colori = ["rgb(222,235,247)", "rgb(158,202,225)", "rgb(66,146,198)","rgb(8,81,156)","rgb(8,30,107)","rgb(3,19,43)"];
	var valori = [100,1000,5000,10000,35000,70000];
	
	var mapColour = d3.scaleThreshold()
			.domain(valori)
			.range(colori); 
	
	if(type=="notop"){
		dati2 = dati;
		dati2 = dati2.filter(function(row) {
        return row['geo'] != 'Turkey' && row['geo'] != 'Poland' && row['geo'] != 'Netherlands' && row['geo'] != 'Greece' && row['geo'] != 'Serbia' && row['geo'] != 'France' && row['geo'] != 'Germany' && row['geo'] != 'Spain' && row['geo'] != 'United Kingdom';
		});
		//console.log(dati2);
		ratio = 100;
		offset = 1500;
	}
	else if(type=="top"){
		dati2 = dati;
		dati2 = dati2.filter(function(row) {
		return row['geo'] == 'Turkey' || row['geo'] == 'Poland' || row['geo'] == 'Netherlands' || row['geo'] == 'Greece' || row['geo'] == 'Serbia' || row['geo'] == 'France' || row['geo'] == 'Germany' || row['geo'] == 'Spain' || row['geo'] == 'United Kingdom';
		});
		//console.log(dati2);
		ratio = 1000;
		offset = 10000;
	}
	else{
		dati2 = dati;
		//console.log(dati2);
		ratio = 1000;
		offset = 10000;
	}
	
	//console.log(ratio);
	
	//filter year
	data = dati2;
	data = data.filter(function(row) {
		return row['TIME_PERIOD'] == value;
		});
	data = data.map((d) => { 
		return {geo: d.geo, FGW: +d.FGW, FRW: +d.FRW, FSW: +d.FSW}
		});
		
	// Add X axis
	var x = d3.scaleLinear()
		.domain([0, d3.max(data, function(d){return d.FGW;})])
		.range([ 0, width ]);

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function(d){return d.FSW;})+offset])
		.range([ height, 0]);
	
	
	// List of subgroups = header of the csv files = soil condition here
	var subgroups = ['FGW','FRW','FSW'];
	//console.log(subgroups);

	// List of groups = species here = value of the first column called group -> I show them on the X axis
	//var groups = d3.map(data, function(d){return(d.geo)}).keys();
	//console.log(groups);
	var groups =["Albania","Belgium","Bulgaria","Croatia","Cyprus","Czechia","Denmark","Estonia","France","Germany","Greece","Hungary","Ireland","Kosovo","Latvia","Lithuania","Luxembourg","Macedonia","Malta","Netherlands","Poland","Portugal","Romania","Serbia","Slovakia","Slovenia","Spain","Sweden","Switzerland","Turkey","United Kingdom"];
	
	// Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
	// Its opacity is set to 0: we don't see it by default.
	var tooltip = d3.select("body").append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("padding", "10px")
		
	//console.log(data);
	// select
	var graph = d3.select("#circles").selectAll("circle").data(data);
	  
	//.filter(function(d,i){return i<50})
	//enter
	graph.enter()
		.append("circle")
		.attr("transform",
			  "translate(" + (margin.left) + "," + (margin.top-5) + ")")
		.attr("cx", function (d) { return x(d.FGW); } )
		.attr("cy", function (d) { return y(d.FSW); } )
		.attr("r", function(d) {return d.FRW/ratio;})
		.style("fill", function(d){return mapColour(d.FRW);})
		.style("opacity", 0.7)
		.style("stroke-width", 2)
		.style("stroke", "black")
		.on("mouseover", function(d) {
			tooltip.transition()    
				.duration(200)    
				.style("opacity", 0.9);
			tooltip
			  .html("<strong> "+d.geo+"</strong><br><span id='textlab'> FGW: </span><strong>" + d.FGW+"</strong><br><span id='textlab'> FSW: </span><strong>" + d.FSW+"</strong><br><span id='textlab1'> FRW: </span><strong>" + d.FRW + "</strong>")
			  .style("left", (d3.event.pageX) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
			  .style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition()    
				.duration(200)    
				.style("opacity", 0);
	    });
		
	//update
	graph.transition()
		.duration(1000)
		.attr("cx", function (d) { return x(d.FGW); } )
		.attr("cy", function (d) { return y(d.FSW); } )
		.attr("r", function(d) {return d.FRW/ratio;})
		.style("fill", function(d){return mapColour(d.FRW);})
		.style("opacity", 0.7)
		.style("stroke-width", 2)
		.style("stroke", "black");
		//.attr("width", 0);
	
	//exit
	graph.exit().remove();
	
	d3.select('#xAxis')
		.attr("transform", "translate("+(margin.left)+","+(height+5)+")")
		.call(d3.axisBottom(x))
		.selectAll("text")
			.attr("y","12")
			.style("font-size", "14px")
			.style("text-anchor", "middle");
	
	d3.select('#yAxis')
		.attr("transform", "translate("+(margin.left)+",5)")
		.call(d3.axisLeft(y))
		.selectAll("text")
			.style("font-size", "14px")
			.style("text-anchor", "end");

	//legend
    var legenda = d3.select("#legend")
					.selectAll("rect.colore")
                    .data(colori);

    legenda.enter()
        .append("rect")
        .attr("class",function(d,i){return "colore";})
        .attr("x", 20)
        .attr("y",function(d,i){return i*25+1;})
        .attr("width",25)
        .attr("height",25)
		.style("opacity",0.8)
        .attr("fill", function(d){return d})
		.attr("stroke","black");

    legenda.transition()
        .duration(1000)
		.style("opacity",0.8)
		.attr("stroke","black")
        .style("fill", function(d){return d});
		
	legenda.exit().remove();

	var etichette = ["< 100","100 - 1 000","1 000 - 5 000","5 000 - 10 000","10 000 - 35 000","35 000 - 70 000"];
    var testi =  d3.select("#legend")
                    .selectAll(".etichette")
                    .data(etichette);
   
    testi.enter()
        .append("text")
		.attr("class","etichette")
        .attr("x", 50)
        .attr("y",function(d,i){return i*25+17})
        .text(function(d){return d;})
        .attr("font-size","12px");

    testi.transition()
        .duration(1000).text(function(d){return d;})
		
	testi.exit().remove();


}


