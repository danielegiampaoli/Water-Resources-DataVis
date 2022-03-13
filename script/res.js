var dati;
var world;
var dat;
var datiLTAA;
var dati1;

d3.csv("data/water_resources_v2.csv", function (error, csv) {
    if (error) { 
        console.log(error); 
	throw error;
    }
	
	csv.forEach(function (d) {
		// Convert to numbers
		d.OBS_VALUE = +d.OBS_VALUE;
	});
	
    //console.log(csv);
    dati = csv;
	//drawBar("Italy");
});

d3.csv("data/water_resources.csv", function (error, csv) {
    if (error) { 
        console.log(error); 
	throw error;
    }
	
	csv.forEach(function (d) {
		// Convert to numbers
		d.LTAA = +d.LTAA;
	});
	
    //console.log(csv);
    dati1 = csv;
});

d3.json("data/world2020_noAntarctica.json", function (error, w) {
    if (error) { 
        console.log(error); 
	throw error;
    }
    world = w;
	//drawMap("INFL_NBT");
	drawCharts("INFL_NBT","Italy");
});

function drawCharts(v,w){
	drawBar(v,w);
    drawMap(v);
}

function drawBar(value,dat){
	
	/* Bar chart */
	
	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 30, left: 100},
		width = 750 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;	
	
	var dati_;
	var variables = ["EVAP_TSP","INTFL","INFL_NBT","OUTFL","PRECIP","RFW_RES"];
	var variabili = ["Evaporation","Internal Flow","Total Inflow","Total Outflow","Precipitations","Renewable Freshwater"];
	
	dati_ = dati.filter(function(row) {
		return (row['wat_res'] == value) && (row['geo'] == dat) && (row['TIME_PERIOD'] >= 1998);
	});
	
	dati_ = dati_.map((d) => {
        return {GEO: d.geo, TIME_PERIOD: d.TIME_PERIOD, res: d.OBS_VALUE}
		});
		
	// asse y
	var yBars = d3.scaleLinear()
        .domain([0, d3.max(dati_, function(d){return d.res;})])
        .range([0, height-5]);

	// asse x
    var xBars = d3.scaleLinear()
        .domain([0,dati_.length])
        .range([margin.left,width]);

	//width
    var xWidth = d3.scaleBand()
        .domain(d3.range(dati_.length))
        .range([margin.left,width])
        .padding(0.1);

	//var colori = ["#0700C4","#0000FF","#0052FF","#007AFF","#00A3FF","#00CCFF"];
	var colori = ["rgb(206,219,231)", "rgb(158,202,225)", "rgb(66,146,198)","rgb(8,81,156)","rgb(8,30,107)","rgb(3,19,43)"];
	var valori = [5000,10000,50000,100000,250000,600000];

	var mapColour = d3.scaleThreshold()
				.domain(valori)
				.range(colori);    
    
    //tooltip
    var tooltip = d3.select("body").data(value).append("div") 
            .attr("class", "tooltip");
	
    //select
    var bars = d3.select("#bars").selectAll("rect").data(dati_);
  
    //enter
    bars.enter()
        .append("rect")
		.attr("id",function(d){ return d.TIME_PERIOD+"B"})
        .attr("y", function(d){return height - yBars(d.res);})
        .attr("x", function(d,i){return xBars(i);})
        .attr("height",function(d){ return yBars(d.res);})
        .attr("width",function(d){ return xWidth.bandwidth();})
		.style("fill",function(d){return mapColour(d.res);})
        .on("mouseover",function(d,i){
            d3.select(this).style("fill", "orange");
			tooltip.transition()    
					.duration(200)    
					.style("opacity", 1); 
			for(let i=0; i<(variables.length-1); i++){
				if (value == variables[i+1]){
					tooltip_label = variabili[i+1];
					console.log(tooltip_label);
					console.log(value);
				}
			}
			tooltip.html("<strong>"+ d.GEO +"</strong><br><span class='textImp'>Year: </span><strong>" + d.TIME_PERIOD + "</strong><br><span class='textImp'>Value: </span><strong>" + d.res + " mill. m³</strong>")
					.style("left", (d3.event.pageX + 10) + "px")   
					.style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d,i){
            d3.select(this).style("fill",  function(d){return mapColour(d.res);})
            .style("fill",function(d){return mapColour(d.res);});                
            tooltip.transition()    
            .duration(200)    
            .style("opacity", 0);  
        });		
    
	//update
	bars.transition()
		.duration(500)
		.attr("id",function(d){ return d.TIME_PERIOD+"B"})
		.attr("y", function(d){return height - yBars(d.res);})
		.attr("x", function(d,i){return xBars(i);})
		.attr("height",function(d){ return yBars(d.res); })
		.attr("width", function(d){ return xWidth.bandwidth();})
		.style("fill",function(d){return mapColour(d.res);});       
    
    //exit
    bars.exit().remove();

	//y axis
	var max_ = 10000;
	console.log(max_);
	if(d3.max(dati_, function(d) {return d.res;}) >= 0.1)
		max_ = d3.max(dati_, function(d) {return d.res;});
    var y = d3.scaleLinear()
        .domain([0, max_])
        .range([height-5, 0]);
    
    d3.select('#yAxis')
        .attr("transform", "translate("+(margin.left)+",5)")   
        .call(d3.axisLeft(y))
		.selectAll("text")
			.style("font-size", "14px");
		
	//x axis
	var anni = ['1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018'];
    var x = d3.scaleBand()
        .domain(anni)
        .range([margin.left,width])
        .padding(0.1);	
		
	d3.select('#xAxis')
		.attr("transform", "translate(0,"+(height)+")")  
        .call(d3.axisBottom(x))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.style("font-size", "14px")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
	
}

function drawMap(value) {
	
	datiLTAA = dati1.filter(function(row) {
		return row['wat_proc'] == value;
		});
	
	datiLTAA_ = datiLTAA.map((d) => {
        return {geo: d.geo, LTAA: d.LTAA}
		});

	//var colori = ["rgb(225,225,225","#FCFBF9", "#D7DCEA", "#A1B3D7","#6581BF","#2F57AB","#0B389D"];
	var colori = ["rgb(245,245,245","rgb(206,219,231)", "rgb(158,202,225)", "rgb(66,146,198)","rgb(8,81,156)","rgb(8,30,107)","rgb(3,19,43)"];
	var valori = [0.1,5000,10000,50000,100000,250000,600000];

	var mapColour = d3.scaleThreshold()
				.domain(valori)
				.range(colori);

    var tooltip = d3.select("body").append("div") 
            .attr("class", "tooltip")       
            .style("opacity", 0);

    projection = d3.geoMercator()
		.scale(400)
		.center([-20,65])
		.translate([20,90]);

    var path = d3.geoPath()
		.projection(projection);
	
    //select
    var map = d3.select("#map").selectAll("path").data(world.features);

    //enter
    map.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", "grey")
		.style("fill", function(d) { 
			var count = 0;
			datiLTAA.forEach(function (d2) {
				if(d2.geo == d.properties.name){
						count = d2.LTAA;
				}
			});
			return mapColour(count); 
		})
		.attr("id",function(d){ return d.properties.name})
		.on('mouseover', function(d, i) {
                d3.select(this).style("fill", "orange");
                var count = 0;
				datiLTAA.forEach(function (d2) {
					if(d2.geo == d.properties.name){
						count = d2.LTAA;
					}
				});
				if(count < 0.1){
						count = 'No Data';
				}				
                tooltip.transition()    
                    .duration(200)    
                    .style("opacity", 1);
				if(count != 'No Data'){
					tooltip.html("<strong>" +d.properties.name+"</strong>" + "<br> <span class='textImp'>"+ "Value: </span> <strong>" + count + " mill. m³</strong> ")  
						.style("left", (d3.event.pageX) + "px")   
						.style("top", (d3.event.pageY - 28) + "px");
				} else {
					tooltip.html("<strong>" +d.properties.name+"</strong>" + "<br><span class='textImp'>" + count + "</span> ")  
						.style("left", (d3.event.pageX) + "px")   
						.style("top", (d3.event.pageY - 28) + "px");
				}
            })
		.on('mouseout', function(d, i) {
			var count = 0;
			datiLTAA.forEach(function (d2) {
				if(d2.geo == d.properties.name){
					count = d2.LTAA;
				}
			});
			d3.select(this).style('fill',mapColour(count));
			tooltip.transition()    
				.duration(200)    
				.style("opacity", 0);
		});

    //update
    map.transition()
		.duration(1000)
		.attr("id",function(d){ return d.properties.name})
		.style("stroke", "grey")
		.style("fill", function(d) { 
			var count = 0;
			datiLTAA.forEach(function (d2) {
				if(d2.geo == d.properties.name){
						count = d2.LTAA;
				}
			});
			return mapColour(count); 
		});

	//exit
	map.exit().remove();

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
        .attr("fill", function(d){return d})
		.attr("stroke","grey");

    legenda.transition()
        .duration(1000)
        .style("fill", function(d){return d});
		
	legenda.exit().remove();

	var etichette = ['No Data',"< 5 000","5 000 - 10 000","10 000 - 50 000","50 000 - 100 000","100 000 - 250 000","250 000 - 500 000"];
    var testi =  d3.select("#legend")
                    .selectAll("text")
                    .data(etichette);
   
    testi.enter()
        .append("text")
        .attr("x", 50)
        .attr("y",function(d,i){return i*25+17})
        .text(function(d){return d;})
        .attr("font-size","12px");

    testi.transition()
        .duration(1000).text(function(d){return d;})
		
	testi.exit().remove();

}