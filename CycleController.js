//"use strict"

var model = new CycleModel(),
	view = new CycleView(),
	controller;
var points = [];
var markerOne,
	markerTwo;
var currentRoute;
var state = "home";
var routeBuffer;
var potentialRoute = {};
var selectedName = "";
var route;

function CycleController() {
	this.init = async function() {
		model.loadData();
		setupAsHome();
		view.setSkillLevel(model.getSkill());
		view.setName(model.getName());
		view.setMapFunction('click',onMapClick);
		view.setRemoveFunction(deleteMarker);
		view.setViewRouteFunction(handleShowRoute);
		view.setMapFunction('moveend',function(){model.setLastPos(view.getPosition()); model.saveLastPos()});
		await view.setUpRouteButton(async function(){ await handleRBPress()});
		view.setUpNameButton(function(){promptUname()});
		view.setUpHomeButton(function(){setupAsHome()});
		view.setfirstGPSFunc(function(ev){handleFirstTimeGPS(ev)});
		view.setUpGPSButton(function(ev){handleGPS(ev)});
		view.setUpCancelRouteButton(function(){handleCancelRoute()});
		view.setUpSaveButton(function(){handleSaveRoute()});
		view.setUpDelButton(handleDeleteRoute);
		view.setUpShowButton(handleShowDirections);
		view.setUpUpdateButton(handleRename);
		view.setSkillChange(function(){handleSkillChange()});
		await view.setWeatherIcon(await model.weatherPic(await model.getWeather(model.getSavedLocation())));
		//view.setWeatherText(model.parseWeather(model.getWeather(location)));
	};

	this.setHome = function () {
		if(markerOne == null){
			alert("You must specify a point!");
		}
		else if(markerTwo == null){
			model.setHome(markerOne.getLatLng());
			model.saveHome();
		}
		else{
			model.setHome(markerTwo.getLatLng());
			model.saveHome();
		}
	}
	this.saveRoute = function () {
		model.addRoute(currentRoute);
		model.saveRoutes()
	}
}

function handleFirstTimeGPS(cord){
	//alert(cord);
	view.setWeatherIcon(model.weatherPic(model.getWeather(cord)));
}

function handleSkillChange(){
	model.setSkill(view.getSkillLevel());
	model.saveSkill();
}

async function handleRBPress(){
	console.log(state);
	if (state == "home"){
		state = "routing";
		view.drawAddPage();
		view.setMainButton("Generate Route",true);
		flushTempRoute();
		hideRoutes();
	}
	else if (state == "routing"){
		var spoints = [];
		var i;
		routeBuffer = [];
		for (i=0;i<points.length;i++){
			var longlat = points[i].getLatLng(); 
			spoints.push(longlat);
			routeBuffer.push(longlat);
		} 
		var valid = false;
		if (spoints.length == 1){
			var len = prompt("Ideal Route length (kM):", 5+(5*model.getSkill()));
			valid = !isNaN(len);
			if (valid){
				valid = (len>0);
			}
			if (valid){
				len *= 1000;
				route = await model.makeRoute(spoints,len);
			}
			console.log(valid);
		}
		else{
			valid = true;
			route = await model.makeRoute(spoints);
		}
		if (valid){
			flushTempRoute();
			state = "review";
			view.generateRoutePage();
			view.drawLine(route.line,route.outline);
			view.focusOn(route.line);

			view.populateSummary(route.autoName,route.averageScore,route.distance,route.duration,route.ascent,route.descent);
			potentialRoute = route;
		}
	}
}

function setupAsHome(){
	flushTempRoute();
	state = "home";
	view.setMainButton("add routes",false);
	if (potentialRoute.line){
		view.removeLine(potentialRoute.line);
		view.removeLine(potentialRoute.outline);
	}
	populateExistingRoutes();
	redrawRoutes();
	view.drawHomePage();
}

function populateExistingRoutes(){
	view.populateExistingRoutes(Object.keys(model.getRoutes()));
}

function handleCancelRoute(){
	view.removeLine(potentialRoute.line);
	view.removeLine(potentialRoute.outline);
	rebuildTempRoute();
	state = "routing";
	view.drawAddPage();
}

function hideRoutes(){
	var routes = model.getRoutes();
	for (var i in routes) {
		view.removeLine(routes[i].line);
		view.removeLine(routes[i].outline);
	}
}

function handleDeleteRoute(){
	if (confirm("Are you sure you want to delete this route?")) {
		view.removeLine(model.retrieveRoute(selectedName).line);
		view.removeLine(model.retrieveRoute(selectedName).outline);
		model.removeRoute(selectedName);
		model.saveRoutes();
		setupAsHome();
	}
}

function handleRename(){
	var newname = prompt("New name:", selectedName);
	var valid = true;
	for (var i in model.getRoutes()){
		if (i == newname && i != selectedName){
			alert("There's already a route named '"+newname+"'!");
			valid = false;
			break;
		}
	}
	if (newname != selectedName && newname && valid){
		model.renameRoute(selectedName,newname);
		model.saveRoutes();
		handleShowRoute(newname);
	}
}

function handleSaveRoute(){
	var line = potentialRoute.line;
	var outline = potentialRoute.outline;
	var valid = true;
	for (var i in model.getRoutes()) {
		if (i === view.getRouteName()){
			alert("There is already a route named '"+view.getRouteName()+"'!");
			valid = false;
			break;
		}
	}
	if (valid){ 
		model.addRoute(potentialRoute,view.getRouteName());
		model.saveRoutes();
		view.focusOn(line);
		view.removeLine(line);
		view.removeLine(outline);
		flushTempRoute();
		setupAsHome();
	}
}

function handleShowDirections(sroute){
	var source;
	if (sroute){
		source = sroute;
	}
	else{
		source = potentialRoute.directions;
	}
	var i;
	var out = "";
	for (i=0;i<source.length;i++){
		if (out != ""){
			out += "\n";
		}
		var title = source[i].title;
		var inst = source[i].instruction;
		if (title != "-"){
			out += title+":\n";
		}
		out += " "+inst;
	}
	alert(out);
}

async function  handleShowRoute(arouteName){
	var route = model.getRoutes()[arouteName];
	if (route){
		view.focusOn(route.line)
		view.drawRoutePage();
		//try {
			text = await model.getRouteWeather(route);
			weather = await model.getWeatherString(text);
			image = model.weatherPic(text);
		//} catch(e){
		//	console.log(e);
		//}

		console.log(weather);
		selectedName = arouteName;
		view.populateReview(arouteName,route.averageScore,route.distance,route.duration,route.ascent,route.descent,route.directions, weather, text[3]);
	}
}

function handleGPS(event){
	 view.focusOnGPS();
}

function redrawRoutes(){
	var routes = model.getRoutes();
	for (var i in routes) {
		if ( routes.hasOwnProperty(i) ) {
			var outline = routes[i].outline;
			var line = routes[i].line;
			view.drawLine(line,outline);
		} 
	}
}

function flushTempRoute(){
	var i;
	for (i=0;i<points.length;i++){
		view.removeMarker(points[i]);
	} 
	points = [];
}

function rebuildTempRoute(){
	var i;
	points = []
	for (i=0;i<routeBuffer.length;i++){
		var marker = view.addMarker(routeBuffer[i]);
		points.push(marker);
	}
	if (points.length > 1){
		view.setMainButton("Generate Route",false);
		}
	else{
		view.setMainButton("Generate Circular Route",false);
	}	
}

function deleteMarker(lat,lng){
	var i;
	for (i=0;i<points.length;i++){
		if (points[i].getLatLng().lat === lat && points[i].getLatLng().lng === lng){
			view.removeMarker(points[i]);
			points.splice(i,1);
			break;
		}
	} 
	if (points.length == 0){
		view.setMainButton("Generate Route",true);
	}
	else if (points.length == 1){
		view.setMainButton("Generate Circular Route",false);
	}
}

function onMapClick(e) {
	if (state == "routing"){
		var marker = view.addMarker(e.latlng);
		points.push(marker);
		if (points.length > 1){
			view.setMainButton("Generate Route",false);
		}
		else{
			view.setMainButton("Generate Circular Route",false);
		}
	}

}

function promptUname(){
	var name = prompt("Username: ", "");
	if (name === "" || name === null){
		name = "Enter Name";
	}
	view.setName(name);
	model.setName(name);
	model.saveName();
}

controller = new CycleController();
window.addEventListener("load", controller.init);