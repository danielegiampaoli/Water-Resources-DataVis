var dati_;
var dati2;

d3.csv("data/water_exploitation_index_v2.csv", function(error, csv){
    if (error) { 
        console.log(error); 
	throw error;
    }
	
	csv.forEach(function (d) {
		d.OBS_VALUE = +d.OBS_VALUE;
	});
	
    dati_=csv;	
	drawLine("all");
});

function drawLine(value){ 
	
	dati2 = dati_;
	dati2 = dati2.filter(function(row) {
	return row['geo'] == 'EU Average' || row['geo'] == 'Cyprus' || row['geo'] == 'Spain' || row['geo'] == 'Greece' || row['geo'] == 'Turkey';
	});
	//console.log(dati2);

	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 30, left: 70},
		width = 430 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;

	// group the data: I want to draw one line per group
	var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.geo;})
		.entries(dati2);

	// Add X axis --> it is a date format
	var anni = ['2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017'];
	var x = d3.scaleLinear()
		.domain(d3.extent(dati2, function(d) { return d.TIME_PERIOD; }))
		//.domain(anni)
		.range([0, width]);
		
	//var xAxis = d3.axisBottom(x);
	
	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(dati2, function(d) { return +d.OBS_VALUE; })+1])
		.range([height, 0]);
		
	//var yAxis = d3.axisLeft(y);

	// color palette for lines
	var colori = ["#003f5c","#7c1158","#00bfa0","#e60049","#ffa600"];
	//var colori = ['#003f5c','#58508d','#bc5090','#ff6361','#ffa600'];
	var res = sumstat.map(function(d){ return d.key }) // list of group names
	var color = d3.scaleOrdinal()
		.domain(res)
		.range(colori);

	//console.log(res[0]);

	var tooltip = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);

	//move highlighted line to front
	d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
		this.parentNode.appendChild(this);
	  });
	};

	// select
	var lines = d3.select("#lines").selectAll("path").data(sumstat);

	//enter
	lines.enter()
		.append("path")
		.attr("class","l")
		.attr("transform","translate("+(margin.left-10)+"," + (margin.top-10) + ")")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.key +"L"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return x(d.TIME_PERIOD); })
			.y(function(d) { return y(+d.OBS_VALUE); })
			(d.values)
		})
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.moveToFront()
				//.style("stroke", "red")
				.style("opacity",1)
				.attr("stroke-width", 6);
			d3.selectAll("[id='" + d.key + "l']")
				.attr("stroke-width", 6);
			tooltip.transition()    
				.duration(200)    
				.style("opacity", .9);
			tooltip.html("<strong>" +d.key+"</strong>")
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 3)
				.style("stroke", function(d){ return color(d.key)});
			d3.selectAll("[id='" + d.key + "l']")
				.attr("stroke-width", 3);
			tooltip.transition()    
				.duration(200)    
				.style("opacity", 0);			
		});
		
	//update
	lines.transition()
		.duration(500)
		.attr("transform","translate("+(margin.left-10)+"," + (margin.top-10) + ")")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.geo+"L"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return x(d.TIME_PERIOD); })
			.y(function(d) { return y(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	lines.exit().remove();
	
	d3.select('#yAxis')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate("+(margin.left-10)+",0)")   
        .call(d3.axisLeft(y));
		
	d3.select('#xAxis')
		.attr("transform", "translate("+(margin.left-10)+","+(height)+")")  
        .call(d3.axisBottom(x).ticks(18).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
			
	//creo legenda
	var colori_ = ["#003f5c","#7c1158","#00bfa0","#ffa600","#e60049"];
    var legenda = d3.select("#legend")
                        .selectAll(".colore")
                        .data(colori_);

    legenda
        .enter()
        .append("rect")
        .attr("class",function(d,i){return "colore";})
        .attr("x", 20)
        .attr("y",function(d,i){return i*20+10;})
        .attr("width",20)
        .attr("height",5)
        .attr("fill", function(d){return d});

    legenda.transition()
        .duration(1000)
        .style("fill", function(d){return d});

	var labels_ = ['Cyprus','Greece','Spain','Turkey','EU Average'];
    var etichette =  d3.select("#legend ")
                    .selectAll("text")
                    .data(labels_);
   
    etichette.enter()
        .append("text")
        .attr("x", 45)
        .attr("y",function(d,i){return i*20+16;})
        .text(function(d){return d;})
        .attr("font-size","12px");

    etichette.transition()
        .duration(1000).text(function(d){return d;})
		
	// multiples for Cyprus, Greece, Turkey, Spain
	
	// Cyprus
	datiC = dati_;
	datiC = datiC.filter(function(row) {
	return row['geo'] == 'EU Average' || row['geo'] == 'Cyprus'});
	//console.log(dati2);

	// set the dimensions and margins of the graph
	var marginC = {top: 10, right: 30, bottom: 30, left: 60},
		widthC = 320 - margin.left - margin.right,
		heightC = 190 - margin.top - margin.bottom;

	// group the data: I want to draw one line per group
	var sumstatC = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.geo;})
		.entries(datiC);

	// Add X axis --> it is a date format
	var xC = d3.scaleLinear()
		.domain(d3.extent(datiC, function(d) { return d.TIME_PERIOD; }))
		//.domain(anni)
		.range([0, widthC]);
	
	// Add Y axis
	var yC = d3.scaleLinear()
		.domain([0, d3.max(datiC, function(d) { return +d.OBS_VALUE; })+1])
		.range([heightC, 0]);

	// select
	var linesC = d3.select("#linesC").selectAll("path").data(sumstatC);

	//enter
	linesC.enter()
		.append("path")
		.attr("transform","translate(40," + (marginC.top-10) + ")")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.key +"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return xC(d.TIME_PERIOD); })
			.y(function(d) { return yC(+d.OBS_VALUE); })
			(d.values)
		})
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.moveToFront()
				//.style("stroke", "red")
				.style('opacity',5)
				.attr("stroke-width", 6);
			d3.select("[id='" + d.key + "L']")
				.moveToFront()
				.attr("stroke-width", 6);
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 3)
				.style('opacity',1)
				.style("stroke", function(d){ return color(d.key)});
			d3.select("[id='" + d.key + "L']")
				.moveToFront()
				.attr("stroke-width", 3);	
		});
		
	//update
	linesC.transition()
		.duration(500)
		.attr("transform","translate(40," + (marginC.top-10) + ")")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.geo+"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return x(d.TIME_PERIOD); })
			.y(function(d) { return y(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	linesC.exit().remove();
	
	d3.select('#yAxisC')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate(40,0)")   
        .call(d3.axisLeft(yC).ticks(6))
		.selectAll("text")
		.attr("font-size","10px");
		
	d3.select('#xAxisC')
		.attr("transform", "translate(40,"+(heightC)+")")  
        .call(d3.axisBottom(xC).ticks(6).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("font-size","10px")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
			
	// Greece
	datiG = dati_;
	datiG = datiG.filter(function(row) {
	return row['geo'] == 'EU Average' || row['geo'] == 'Greece'});
	//console.log(dati2);

	// set the dimensions and margins of the graph
	var marginG = {top: 10, right: 30, bottom: 30, left: 60},
		widthG = 340 - margin.left - margin.right,
		heightG = 150 - margin.top - margin.bottom;

	// group the data: I want to draw one line per group
	var sumstatG = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.geo;})
		.entries(datiG);

	// select
	var linesG = d3.select("#linesG").selectAll("path").data(sumstatG);

	//enter
	linesG.enter()
		.append("path")
		.attr("transform","translate(40," + (marginG.top-10) + ")")
		.attr("width", widthG + marginG.left + marginG.right)
		.attr("height", heightG + marginG.top + marginG.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.key +"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return xC(d.TIME_PERIOD); })
			.y(function(d) { return yC(+d.OBS_VALUE); })
			(d.values)
		})
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.moveToFront()
				//.style("stroke", "red")
				.style('opacity',5)
				.attr("stroke-width", 6);
			d3.select("[id='" + d.key + "L']")
				.moveToFront()
				.attr("stroke-width", 6);
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 3)
				.style('opacity',1)
				.style("stroke", function(d){ return color(d.key)});
			d3.select("[id='" + d.key + "L']")
				.moveToFront()
				.attr("stroke-width", 3);	
		});
		
	//update
	linesG.transition()
		.duration(500)
		.attr("transform","translate(40," + (marginG.top-10) + ")")
		.attr("width", widthG + marginG.left + marginG.right)
		.attr("height", heightG + marginG.top + marginG.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.geo+"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return xC(d.TIME_PERIOD); })
			.y(function(d) { return yC(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	linesG.exit().remove();
	
	d3.select('#yAxisG')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate(40,0)")   
        .call(d3.axisLeft(yC).ticks(6))
		.selectAll("text")
		.attr("font-size","10px");
		
	d3.select('#xAxisG')
		.attr("transform", "translate(40,"+(heightC)+")")  
        .call(d3.axisBottom(xC).ticks(6).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("font-size","10px")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
	
	// Spain
	datiS = dati_;
	datiS = datiS.filter(function(row) {
	return row['geo'] == 'EU Average' || row['geo'] == 'Spain'});
	//console.log(dati2);

	// set the dimensions and margins of the graph
	var marginS = {top: 10, right: 30, bottom: 30, left: 60},
		widthS = 340 - margin.left - margin.right,
		heightS = 200 - margin.top - margin.bottom;

	// group the data: I want to draw one line per group
	var sumstatS = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.geo;})
		.entries(datiS);

	// select
	var linesS = d3.select("#linesS").selectAll("path").data(sumstatS);

	//enter
	linesS.enter()
		.append("path")
		.attr("transform","translate(40," + (marginS.top-10) + ")")
		.attr("width", widthS + marginS.left + marginS.right)
		.attr("height", heightS + marginS.top + marginS.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.key +"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return xC(d.TIME_PERIOD); })
			.y(function(d) { return yC(+d.OBS_VALUE); })
			(d.values)
		})
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.moveToFront()
				//.style("stroke", "red")
				.style('opacity',5)
				.attr("stroke-width", 6);
			d3.select("[id='" + d.key + "L']")
				.moveToFront()
				.attr("stroke-width", 6);
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 3)
				.style('opacity',1)
				.style("stroke", function(d){ return color(d.key)});
			d3.select("[id='" + d.key + "L']")
				.moveToFront()
				.attr("stroke-width", 3);		
		});
		
	//update
	linesS.transition()
		.duration(500)
		.attr("transform","translate(40," + (marginS.top-10) + ")")
		.attr("width", widthS + marginS.left + marginS.right)
		.attr("height", heightS + marginS.top + marginS.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.geo+"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return xC(d.TIME_PERIOD); })
			.y(function(d) { return yC(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	linesS.exit().remove();
	
	d3.select('#yAxisS')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate(40,0)")   
        .call(d3.axisLeft(yC).ticks(6))
		.selectAll("text")
		.attr("font-size","10px");
		
	d3.select('#xAxisS')
		.attr("transform", "translate(40,"+(heightC)+")")  
        .call(d3.axisBottom(xC).ticks(6).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("font-size","10px")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
			
	// Turkey
	datiM = dati_;
	datiM = datiM.filter(function(row) {
	return row['geo'] == 'EU Average' || row['geo'] == 'Turkey'});
	//console.log(dati2);

	// group the data: I want to draw one line per group
	var sumstatM = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.geo;})
		.entries(datiM);
		
	// select
	var linesM = d3.select("#linesM").selectAll("path").data(sumstatM);

	//enter
	linesM.enter()
		.append("path")
		.attr("transform","translate(40," + (margin.top-10) + ")")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.key +"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return xC(d.TIME_PERIOD); })
			.y(function(d) { return yC(+d.OBS_VALUE); })
			(d.values)
		})
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.moveToFront()
				//.style("stroke", "red")
				.style('opacity',5)
				.attr("stroke-width", 6);
			d3.select("[id='" + d.key + "L']")
				.moveToFront()
				.style("opacity",1)
				.attr("stroke-width", 6);
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 3)
				.style('opacity',1)
				.style("stroke", function(d){ return color(d.key)});
			d3.select("[id='" + d.key + "L']")
				.moveToFront()
				.attr("stroke-width", 3);			
		});
		
	//update
	linesM.transition()
		.duration(500)
		.attr("transform","translate(40," + (margin.top-10) + ")")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.geo+"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return xC(d.TIME_PERIOD); })
			.y(function(d) { return yC(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	linesM.exit().remove();
	
	d3.select('#yAxisM')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate(40,0)")   
        .call(d3.axisLeft(yC).ticks(6))
		.selectAll("text")
		.attr("font-size","10px");
		
	d3.select('#xAxisM')
		.attr("transform", "translate(40,"+(heightC)+")")  
        .call(d3.axisBottom(xC).ticks(6).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("font-size","10px")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");


}