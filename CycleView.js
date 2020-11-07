//"use strict"

function CycleView() {
	var map = L.map('mapid').setView([53.57905, -0.65437], 13); //default location: Scunthorpe
	map.locate(true);
	var mainButton = document.getElementById("routeButton"),
		nameButton = document.getElementById("nameButton"),
		updateNameButton = document.getElementById("updateNameButton"),
		showButton = document.getElementById("direction"),
		homeButton	= document.getElementById("homeButton"),
		allBottom = document.getElementById("lower"),
		dicButton= document.getElementById("discard"),
		saveButton = document.getElementById("save"),
		GPSButton = document.getElementById("getGPS");
	var hBottom = document.getElementById("showRoutes"),
		rBottom = document.getElementById("routeInfo");
	var wthImg = document.getElementById("weatherImg");
	var routePage= document.getElementById("routePage");
	var firstGPSFunc;
	var gpsMarker;
	var gpsIcon = L.icon({iconUrl: 'gpsIcon.png'});
	GPSButton.disabled = true;
	var removeFunction,
		viewRouteFunction,
		showRouteFunction;
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

	map.on("locationfound",function(pos){
		var first = false;
		if (gpsMarker){
			gpsMarker.remove();
		}
		else{
			first = true;
			GPSButton.disabled = false;
		}
		gpsMarker = L.circleMarker([pos.latitude, pos.longitude]).bindPopup('You are here');
		gpsMarker.addTo(map);
		if (first){
			firstGPSFunc = ([pos.latitude, pos.longitude]);
			map.setView(gpsMarker.getLatLng(),13);
		}	
	}); //it refused to accept an existing function. stupid fussy map...
		
	this.setfirstGPSFunc = function(fun){
		firstGPSFunc = fun;
	}
	
	this.displayGPS = function(pos){
		if (gpsMarker){
			gpsMarker.remove();
		}
		gpsMarker = L.marker([pos.latitude, pos.longitude],{icon: gpsIcon}).bindPopup('You are here');
		gpsMarker.addTo(map);
	}
	
	this.focusOnGPS = function(){
		if (gpsMarker){
			map.setView(gpsMarker.getLatLng(),13);
		}
	}
	
	this.drawLine = function(line,outline) {
		outline.addTo(map);
		line.addTo(map);
	};
	this.focusOn = function(line){
		map.fitBounds(line.getBounds());
	};
	this.focusOnCoord = function(coord){
		var latLng = L.latLng(coord[0], coord[1]);
		map.setView(latLng,13);
	};
	this.setMapFunction = function(funame,fun){
		map.on(funame, fun);
	};
	this.setSkillLevel = function(rank){
		var ranks = ["Novice","Moderate","Amateur","Pro"];
		var rank = ranks[rank];
		var difBox = document.getElementById("difDrop");
		for (var i = 0; i < difBox.options.length; i++) {
			if (difBox.options[i].text== rank) {
				difBox.options[i].selected = true;
				break;
			}
		}
	};
	this.setSkillChange = function(fun){
		document.getElementById("difDrop").addEventListener("change", function(){fun();});
	}
	this.setName = function(name){
		document.getElementById("nameButton").innerText = name;
	};
	this.setWeatherIcon = async function (iconid) {
		document.getElementById("weatherImg").src = 'https://openweathermap.org/img/w/' + iconid + '.png';
	};
	this.setWeatherText = function (weather) {
		document.getElementById("weatherText").innerText = weather;
	};
	this.getWeatherText = function () {
		return document.getElementById("weatherText").innerText;
	};
	this.getSkillLevel = function(){
		return document.getElementById("difDrop").selectedIndex;
	}
	this.getRouteName = function(){
		var sumName= document.getElementById("rname");
		return sumName.value;
	};
	this.getPosition = function(){
		var mot = map.getCenter();
		return [mot.lat,mot.lng];
	};
	this.getZoom = function(){
		return map.getZoom();
	};
	this.addMarker = function(coord) {
		coord[0] = coord.lat;
		coord[1] = coord.lng;
		var marker = L.marker(coord).addTo(map);
		var button = L.DomUtil.create('button');
		button.setAttribute('type', 'button');
		button.innerHTML = "Delete";
		marker.bindPopup(button);
		L.DomEvent.on(button, 'click', function(){removeFunction(coord[0],coord[1]);});
		return marker;
	};

	this.removeMarker = function (marker) {
		var ltln = marker.getLatLng();
		marker.remove();
	}
	this.removeLine = function (line) {
		line.remove();
	}
	
	this.drawHomePage = function(){
		allBottom.style.display = "block";
        mainButton.innerText = 'add routes';
        homeButton.style.display = "none"
		routePage.style.display = "none";
        wthImg.style.display = "block"
        hBottom.style.display = "block";
        rBottom.style.display = "none";
    }
    this.drawAddPage = function(){
        mainButton.innerText = 'create route';
        homeButton.style.display = "block"
        wthImg.style.display = "none"
		routePage.style.display = "none";
        hBottom.style.display = "none";
        rBottom.style.display = "none";
    }
	this.drawRoutePage = function(){
        allBottom.style.display = "none";
        homeButton.style.display = "block"
		wthImg.style.display = "none"
		routePage.style.display = "block";
    }
	
	this.generateRoutePage = function(){
		mainButton.disabled = true;
		routePage.style.display = "none";
		rBottom.style.display = "block";
	}
	
	this.setMainButton = function(text,enab){
		mainButton.innerText = text;
		mainButton.disabled = enab;
	}
	this.setUpGPSButton = function(fun){
		GPSButton.addEventListener("click", function(ev){fun(ev);});
	}
	this.setUpRouteButton = async function(fun){
		mainButton.addEventListener("click", await fun);
	}
	this.setRemoveFunction = function(fun){
		removeFunction = fun;
	}
	this.setViewRouteFunction = function(fun){
		viewRouteFunction = fun;
	}
	
	this.populateSummary = function(name,dif,dis,time,as,de){
		var sumName= document.getElementById("rname");
		var sumDif= document.getElementById("i1");
		var sumDis= document.getElementById("i2");
		var sumTime= document.getElementById("i3");
		var sumAsc= document.getElementById("i4");
		var sumDes= document.getElementById("i5");
		sumName.value = name;
		sumDif.innerText = dif;
		sumDis.innerText = dis;
		sumTime.innerText = time;
		sumAsc.innerText = as;
		sumDes.innerText = de;
	}
	this.setUpHomeButton = function(fun){
		homeButton.addEventListener("click", fun);
	}
	this.populateExistingRoutes = function(routeIDs){
		var sect = document.getElementById("showRoutes");
		if (routeIDs.length === 0){
			sect.innerHTML = "<h2>No saved routes</h2>";
		}
		else{
			sect.innerHTML = "<h2>Saved Routes:</h2>";
		}
		var i;
		var naem;
		for (i=0;i<routeIDs.length;i++){
			var btn = null;
			btn = document.createElement("BUTTON");
			naem = routeIDs[i];
			btn.innerHTML = naem;
			btn.addEventListener("click", function(ev){viewRouteFunction((ev.srcElement || ev.originalTarget).innerHTML);});
			sect.appendChild(btn);
		}
	}

	this.populateReview = function(name,dif,dis,time,as,de,dirs, wea, img){
		var sumName= document.getElementById("rrname");
		var sumDif= document.getElementById("ri1");
		var sumDis= document.getElementById("ri2");
		var sumTime= document.getElementById("ri3");
		var sumAsc= document.getElementById("ri4");
		var sumDes= document.getElementById("ri5");
		var weather = document.getElementById("ri6");
		var weaImg = document.getElementById("wthRoute");
		sumName.innerText = name;
		sumDif.innerText = dif;
		sumDis.innerText = dis;
		sumTime.innerText = time;
		sumAsc.innerText = as;
		sumDes.innerText = de;
		weather.innerText = wea;
		weaImg.src = 'https://openweathermap.org/img/w/' + img + '.png';
		document.getElementById("rdirection").addEventListener("click", function(){showRouteFunction(dirs);});
	}
	this.setUpCancelRouteButton = function(fun){
		dicButton.addEventListener("click", fun);
	}
	this.setUpSaveButton = function(fun){
		saveButton.addEventListener("click", fun);
	}
	this.setUpNameButton = function(fun){
		nameButton.addEventListener("click", fun);
	}
	this.setUpShowButton = function(fun){
		showButton.addEventListener("click", function(){fun()});
		showRouteFunction = fun;
	}
	this.setUpUpdateButton = function(fun){
		updateNameButton.addEventListener("click", function(){fun()});
	}
	this.setUpDelButton = function(fun){
		document.getElementById("rdelete").addEventListener("click", function(){fun()});
	}
}