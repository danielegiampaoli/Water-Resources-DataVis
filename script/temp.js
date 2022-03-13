var dati_;
var dati;

d3.csv("data/temperatures.csv", function(error, csv){
    if (error) { 
        console.log(error); 
	throw error;
    }
	
	csv.forEach(function (d) {
		d.OBS_VALUE = +d.OBS_VALUE;
	});
	
    dati_=csv;	
	drawLine();
});

function drawLine(){ 
	
	dati = dati_;

	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 30, left: 60},
		width = 430 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;

	// group the data: I want to draw one line per group
	var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.source;})
		.entries(dati);
		//(function(d){d3.values(d).map(function(d2) {return d2.OBS_VALUE; })}) //access variables in values

	// Add X axis --> it is a date format
	var anni = ['2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019'];
	var x = d3.scaleLinear()
		.domain(d3.extent(dati, function(d) { return d.TIME_PERIOD; }))
		//.domain(anni)
		.range([0, width]);
		
	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(dati, function(d) { return +d.OBS_VALUE; })+0.2])
		.range([height, 0]);
		

	// color palette for lines
	var colori = ['#003f5c','#bc5090','#ffa600'];
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
	var lines = d3.select("#linesT").selectAll("path").data(sumstat);

	//enter
	lines.enter()
		.append("path")
		.attr("class","l")
		.attr("transform","translate("+(margin.left)+","+(margin.top-10)+")")
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
			d3.select("[id='" + d.key + "l']")
				.attr("stroke-width", 6);
			if(d.key == "GISTEMP"){
				d3.select("[id='HADCRUT4L']")
					.style("opacity",.2);
				d3.select("[id='NOAAGLOBALTEMPL']")
					.style("opacity",.2);
			}
			else if(d.key == "HADCRUT4"){
				d3.select("[id='GISTEMPL']")
					.style("opacity",.2);
				d3.select("[id='NOAAGLOBALTEMPL']")
					.style("opacity",.2);
			}
			else if(d.key == "NOAAGLOBALTEMP"){
				d3.select("[id='GISTEMPL']")
					.style("opacity",.2);
				d3.select("[id='HADCRUT4L']")
					.style("opacity",.2);
			}					
			tooltip.transition()    
				.duration(200)    
				.style("opacity", .9);
				//d.key
			tooltip.html("<strong>" + d.key +"</strong>")
				.style("left", (d3.event.pageX) + "px")   
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 3)
				.style("stroke", function(d){ return color(d.key)});
			d3.select("[id='" + d.key + "l']")
				.attr("stroke-width", 3);
			if(d.key == "GISTEMP"){
				d3.select("[id='HADCRUT4L']")
					.style("opacity",1);
				d3.select("[id='NOAAGLOBALTEMPL']")
					.style("opacity",1);
			}
			else if(d.key == "HADCRUT4"){
				d3.select("[id='GISTEMPL']")
					.style("opacity",1);
				d3.select("[id='NOAAGLOBALTEMPL']")
					.style("opacity",1);
			}
			else if(d.key == "NOAAGLOBALTEMP"){
				d3.select("[id='GISTEMPL']")
					.style("opacity",1);
				d3.select("[id='HADCRUT4L']")
					.style("opacity",1);
			}
			tooltip.transition()    
				.duration(200)    
				.style("opacity", 0);			
		});
		
	//update
	lines.transition()
		.duration(500)
		.attr("transform","translate("+(margin.left)+","+ (margin.top-10) + ")")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.source+"L"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return x(d.TIME_PERIOD); })
			.y(function(d) { return y(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	lines.exit().remove();
	
	d3.select('#yAxisT')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate("+(margin.left)+",0)")   
        .call(d3.axisLeft(y));
		
	d3.select('#xAxisT')
		.attr("transform", "translate("+(margin.left)+","+(height)+")")  
        .call(d3.axisBottom(x).ticks(18).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
			
	//creo legenda
	var colori_ = ['#ffa600','#003f5c','#bc5090'];
    var legenda = d3.select("#legend_temp")
                        .selectAll("rect.colore")
                        .data(colori_);

    legenda
        .enter()
        .append("rect")
        .attr("x", 20)
        .attr("y",function(d,i){return i*20+10;})
        .attr("width",20)
        .attr("height",5)
        .attr("fill", function(d){return d});

    legenda.transition()
        .duration(1000)
        .style("fill", function(d){return d});

	var labels = ["NOAAGlobalTemp", "GISTEMP", "HadCRUT4"];
    var etichette =  d3.select("#legend_temp")
                    .selectAll("text")
                    .data(labels);
   
    etichette.enter()
        .append("text")
        .attr("x", 45)
        .attr("y",function(d,i){return i*20+16;})
        .text(function(d){return d;})
        .attr("font-size","12px");

    etichette.transition()
        .duration(1000).text(function(d){return d;})
		
	// multiples for GISTEMP, HADCRUT4, NOAAGLOBALTEMP
	
	// GISTEMP
	datiC = dati_;
	datiC = datiC.filter(function(row) {
	return row['source'] == 'GISTEMP'});

	// set the dimensions and margins of the graph
	var marginC = {top: 10, right: 30, bottom: 30, left: 60},
		widthC = 340 - marginC.left - marginC.right,
		heightC = 160 - marginC.top - marginC.bottom;

	// group the data: I want to draw one line per group
	var sumstatC = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.source;})
		.entries(datiC);

	// Add X axis --> it is a date format
	var xC = d3.scaleLinear()
		.domain(d3.extent(dati, function(d) { return d.TIME_PERIOD; }))
		//.domain(anni)
		.range([0, widthC]);
	
	// Add Y axis
	var yC = d3.scaleLinear()
		.domain([0, d3.max(dati, function(d) { return +d.OBS_VALUE; })+0.4])
		.range([heightC, 0]);

	//move highlighted line to front
	d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
		this.parentNode.appendChild(this);
	  });
	};

	// select
	var linesC = d3.select("#lines1").selectAll("path").data(sumstatC);

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
		.attr("id",function(d){ return d.source+"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return x(d.TIME_PERIOD); })
			.y(function(d) { return y(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	linesC.exit().remove();
	
	var tooltipC = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);		
	
	//circles for tooltip
	var graphC = d3.select("#lines1").selectAll("circle").data(datiC);
	  
	//.filter(function(d,i){return i<50})
	//enter
	graphC.enter()
		.append("circle")
		.attr("id", function(d){ return d.source +"p"})
		.attr("transform","translate(40,0)")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("cx", function (d) { return xC(d.TIME_PERIOD); } )
		.attr("cy", function (d) { return yC(d.OBS_VALUE); } )
		.attr("r", 4)
		.style("fill", function(d){ return color(d.source)})
		.style("opacity", 0)
		.style("stroke-width", 2)
		.style("stroke", "none")
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 0)
				.style('opacity',1);
			tooltipC.transition()    
				.duration(200)    
				.style("opacity", 0.9);
			tooltipC
			  .html("<strong><span class='textImp'>Year: </span>"+d.TIME_PERIOD+"</strong><br><strong><span class='textImp'>Deviation: </span>"+d.OBS_VALUE+" °C</strong>")
			  .style("left", (d3.event.pageX) + "px")
			  .style("top", (d3.event.pageY - 28) + "px");
			d3.select("[id='HADCRUT4L']")
					.style("opacity",.2);
			d3.select("[id='NOAAGLOBALTEMPL']")
					.style("opacity",.2);
			d3.select("[id='" + d.source + "L']")
				.attr("stroke-width", 6)
				.moveToFront();
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront()
				.style('opacity',0);
			tooltipC.transition()    
				.duration(200)    
				.style("opacity", 0);
			d3.select("[id='HADCRUT4L']")
					.style("opacity",1);
			d3.select("[id='NOAAGLOBALTEMPL']")
					.style("opacity",1);
			d3.select("[id='" + d.source + "L']")
					.attr("stroke-width", 3);
	    });
		
	//update
	graphC.transition()
		.duration(1000)
		.attr("transform","translate(40,0)")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("cx", function (d) { return xC(d.TIME_PERIOD); } )
		.attr("cy", function (d) { return yC(d.OBS_VALUE); } )
		.attr("r", 4)
		.style("fill", function(d){ return color(d.source)})
		.style("opacity", 0.7)
		.style("stroke-width", 2)
		.style("stroke", "black")
		//.attr("width", 0);
	
	//exit
	graphC.exit().remove();
	
	d3.select('#yAxis1')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate(40,0)")   
        .call(d3.axisLeft(yC).ticks(6))
		.selectAll("text")
		.attr("font-size","10px");
		
	d3.select('#xAxis1')
		.attr("transform", "translate(40,"+(heightC)+")")  
        .call(d3.axisBottom(xC).ticks(7).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("font-size","10px")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
			
	// HADCRUT4
	datiG = dati_;
	datiG = datiG.filter(function(row) {
	return row['source'] == 'HADCRUT4'});
	//console.log(dati);

	// group the data: I want to draw one line per group
	var sumstatG = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.source;})
		.entries(datiG);

	// select
	var linesG = d3.select("#lines2").selectAll("path").data(sumstatG);

	//enter
	linesG.enter()
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
		});
		
	//update
	linesG.transition()
		.duration(500)
		.attr("transform","translate(40," + (marginC.top-10) + ")")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.source+"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return x(d.TIME_PERIOD); })
			.y(function(d) { return y(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	linesG.exit().remove();		
	
	//circles for tooltip
	var graphG = d3.select("#lines2").selectAll("circle").data(datiG);
	  
	//.filter(function(d,i){return i<50})
	//enter
	graphG.enter()
		.append("circle")
		.attr("id", function(d){ return d.source+ "p"})
		.attr("transform","translate(40,0)")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("cx", function (d) { return xC(d.TIME_PERIOD); } )
		.attr("cy", function (d) { return yC(d.OBS_VALUE); } )
		.attr("r", 4)
		.style("fill", function(d){ return color(d.source)})
		.style("opacity", 0)
		.style("stroke-width", 2)
		.style("stroke", "none")
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 0)
				.style('opacity',1);
			tooltipC.transition()    
				.duration(200)    
				.style("opacity", 0.9);
			tooltipC
			  .html("<strong><span class='textImp'>Year: </span>"+d.TIME_PERIOD+"</strong><br><strong><span class='textImp'>Deviation: </span>"+d.OBS_VALUE+" °C</strong>")
			  .style("left", (d3.event.pageX) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
			  .style("top", (d3.event.pageY - 28) + "px");
			d3.select("[id='GISTEMPL']")
					.style("opacity",.2);
			d3.select("[id='NOAAGLOBALTEMPL']")
					.style("opacity",.2);
			d3.select("[id='" + d.source + "L']")
				.attr("stroke-width", 6)
				.moveToFront();
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront()
				.style('opacity',0);
			tooltipC.transition()    
				.duration(200)    
				.style("opacity", 0);
			d3.select("[id='GISTEMPL']")
					.style("opacity",1);
			d3.select("[id='NOAAGLOBALTEMPL']")
					.style("opacity",1);
			d3.select("[id='" + d.source + "L']")
					.attr("stroke-width", 3);
	    });
		
	//update
	graphG.transition()
		.duration(1000)
		.attr("transform","translate(40,0)")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("cx", function (d) { return xC(d.TIME_PERIOD); } )
		.attr("cy", function (d) { return yC(d.OBS_VALUE); } )
		.attr("r", 4)
		.style("fill", function(d){ return color(d.source)})
		.style("opacity", 0.7)
		.style("stroke-width", 2)
		.style("stroke", "black")
		//.attr("width", 0);
	
	//exit
	graphG.exit().remove();
	
	d3.select('#yAxis2')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate(40,0)")   
        .call(d3.axisLeft(yC).ticks(6))
		.selectAll("text")
		.attr("font-size","10px");
		
	d3.select('#xAxis2')
		.attr("transform", "translate(40,"+(heightC)+")")  
        .call(d3.axisBottom(xC).ticks(7).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("font-size","10px")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
	
	// NOAAGLOBALTEMP
	datiS = dati_;
	datiS = datiS.filter(function(row) {
	return row['source'] == 'NOAAGLOBALTEMP'});
	//console.log(dati);
	
	// group the data: I want to draw one line per group
	var sumstatS = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function(d) { return d.source;})
		.entries(datiS);

	// select
	var linesS = d3.select("#lines3").selectAll("path").data(sumstatS);

	//enter
	linesS.enter()
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
		});
		
	//update
	linesS.transition()
		.duration(500)
		.attr("transform","translate(40," + (marginC.top-10) + ")")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("fill", "none")
		.style("stroke", function(d){ return color(d.key)})
		.attr("stroke-width", 3)
		.attr("id",function(d){ return d.source+"l"})
		.attr("d", function(d){
		  return d3.line()
			.x(function(d) { return x(d.TIME_PERIOD); })
			.y(function(d) { return y(+d.OBS_VALUE); })
			(d.values)
		});
		
	//exit
	linesS.exit().remove();		
	
	//circles for tooltip
	var graphS = d3.select("#lines3").selectAll("circle").data(datiS);
	  
	//.filter(function(d,i){return i<50})
	//enter
	graphS.enter()
		.append("circle")
		.attr("id", function(d){ return d.source +"p"})
		.attr("transform","translate(40,0)")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("cx", function (d) { return xC(d.TIME_PERIOD); } )
		.attr("cy", function (d) { return yC(d.OBS_VALUE); } )
		.attr("r", 4)
		.style("fill", function(d){ return color(d.source)})
		.style("opacity", 0)
		.style("stroke-width", 2)
		.style("stroke", "none")
		.on("mouseover", function(d) {
			d3.select(this) //paint line
				.moveToFront() 
				.attr("stroke-width", 0)
				.style('opacity',1);
			tooltipC.transition()    
				.duration(200)    
				.style("opacity", 0.9);
			tooltipC
			  .html("<strong><span class='textImp'>Year: </span>"+d.TIME_PERIOD+"</strong><br><strong><span class='textImp'>Deviation: </span>"+d.OBS_VALUE+" °C</strong>")
			  .style("left", (d3.event.pageX) + "px")
			  .style("top", (d3.event.pageY - 28) + "px");
			d3.select("[id='HADCRUT4L']")
					.style("opacity",.2);
			d3.select("[id='GISTEMPL']")
					.style("opacity",.2);
			d3.select("[id='" + d.source + "L']")
				.attr("stroke-width", 6)
				.moveToFront();
		})
		.on("mouseout", function(d) {
			d3.select(this) //paint line
				.moveToFront()
				.style('opacity',0);
			tooltipC.transition()    
				.duration(200)    
				.style("opacity", 0);
			d3.select("[id='HADCRUT4L']")
					.style("opacity",1);
			d3.select("[id='GISTEMPL']")
					.style("opacity",1);
			d3.select("[id='" + d.source + "L']")
					.attr("stroke-width", 3);
	    });
		
	//update
	graphS.transition()
		.duration(1000)
		.attr("transform","translate(40,0)")
		.attr("width", widthC + marginC.left + marginC.right)
		.attr("height", heightC + marginC.top + marginC.bottom)
		.attr("cx", function (d) { return xC(d.TIME_PERIOD); } )
		.attr("cy", function (d) { return yC(d.OBS_VALUE); } )
		.attr("r", 4)
		.style("fill", function(d){ return color(d.source)})
		.style("opacity", 0.7)
		.style("stroke-width", 2)
		.style("stroke", "black")
		//.attr("width", 0);
	
	//exit
	graphS.exit().remove();
	
	d3.select('#yAxis3')
		//.attr("transform", "translate("+(margin.left)+",5)")   
		.attr("transform", "translate(40,0)")   
        .call(d3.axisLeft(yC).ticks(6))
		.selectAll("text")
		.attr("font-size","10px");
		
	d3.select('#xAxis3')
		.attr("transform", "translate(40,"+(heightC)+")")  
        .call(d3.axisBottom(xC).ticks(7).tickFormat(d3.format("d")))
		.selectAll("text")
			.attr("y", 10)
			.attr("x", 10)
			.attr("dy", ".35em")
			.attr("font-size","10px")
			.attr("transform", "rotate(45)")
			.style("text-anchor", "start");
			
}