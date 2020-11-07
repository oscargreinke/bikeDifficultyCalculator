//"use strict"
var resar, rubuth;
var testing=false;
function CycleModel() {
	var lastPos, name, skill, routes, userPos;
	this.loadData = function(){
		lastPos = JSON.parse(localStorage.getItem('lastPos'));
		name = localStorage.getItem('name');
		skill = localStorage.getItem('skill');
		routes = JSON.parse(localStorage.getItem('routes'));
		if (!routes){
			routes = {};
		}
		else{
			for (var i in routes) {
				if (routes.hasOwnProperty(i)) {
					routes[i].line = this.makePolyLine(routes[i].points, routes[i].color);
					routes[i].outline = this.makePolyOutLine(routes[i].points, 'black');
				}
			} 
		}
		if (!skill){
			skill = 1;
		}
	};
	
	this.saveLastPos = function(){
		localStorage.setItem('lastPos',JSON.stringify(lastPos));
	};
	this.saveName = function(){
		localStorage.setItem('name',name);
	};
	this.saveSkill = function(){
		localStorage.setItem('skill',skill);
	};
	this.saveRoutes = function(){
		var froutes = {};
		for (var i in routes) {
			if (routes.hasOwnProperty(i) ) {
				var frout = {};
				for (var j in routes[i]){
					if (j != "line" && j != "outline"){
						frout[j] = routes[i][j];
					}
				}
				froutes[i] = frout;
			}
		}
		localStorage.setItem('routes',JSON.stringify(froutes));
	};
	this.retrieveRoute = function (rna) {
		if(routes[rna]){
			return routes[rna];
		}
	}
	this.removeRoute = function(rna){
		if (routes[rna]){
			delete routes[rna];
			//alert("deleted "+rna+"!");
		}
	}
	this.renameRoute = function(oldname,newname){
		routes[newname] = routes[oldname];
		delete routes[oldname];
	}
	
	this.getSavedLocation = function () {
		if (lastPos) {
			console.log("Last position: " + lastPos);
			userPos = lastPos;
		} else {
			userPos = [53.57905, -0.65437];
		}
		return userPos;
	}
	
	this.getSkill = function(){
		return skill;
	};
	this.setSkill = function(sk){
		skill = sk;
	};
	this.setLastPos = function(ps){
		lastPos = ps;
	};
	this.setName = function (nm) {
		name = nm;
	};
	this.getName = function(){
		return name;
	};
	this.addRoute = function (route,name) {
		routes[name] = route;
	};
	this.getRoutes = function(){
		return routes;
	}
	
	this.calculateScore = function (steepness, surface, suitability, waytype) { // returns difficulty at a single
		var score = (steepness * -1) + suitability;
		if (surface === 1 || surface === 3 || surface === 4 || surface === 14) {
			score += 3
		}
		else if (surface === 5 || surface === 6 || surface === 7 || surface === 8 || surface === 11 || surface === 12) {
			score += 2
		}
		else {
			score += 1
		}
		if (waytype === 1 || waytype === 2 || waytype === 3 || waytype === 6) {
			score += 2
		}
		else {
			score += 1
		}
		score = (score / 2).toFixed(0);
		console.log("Before: " + score)
		if(score < 5){
			score = ((4-score)+0.5)*2;
		}
		else if(score >= 5) {
			score -= ((score-5)+0.5)*2
		}
		console.log("After: " + score);
		return score;
	};
	this.getSteepness = function (steepness) { //Every entry in this array represents the steepness between points i and i+1,
		var steepnessPoints = [];  				   //meaning 0 would be slope between 0 and 1
		for (var i = 0; i < steepness.values.length; i++) {
			var point = steepness.values[i];
			for (var j = point[0]; j < point[1]; j++) {
				steepnessPoints[j] = point[2];
			}
		}
		//console.log(steepnessPoints);
		return steepnessPoints
	};
	this.getSurface = function (surface) { // same note for steepness applies here
		var surfacePoints = [];
		for (var i = 0; i < surface.values.length; i++) {
			var point = surface.values[i];
			for (var j = point[0]; j < point[1]; j++) {
				surfacePoints[j] = point[2];
			}
		}
		//console.log(surfacePoints);
		return surfacePoints;
	};
	this.getSuitability = function (suit) { // same note for steepness applies here
		var suitPoints = [];
		for (var i = 0; i < suit.values.length; i++) {
			var point = suit.values[i];
			for (var j = point[0]; j < point[1]; j++) {
				suitPoints[j] = point[2];
			}
		}
		//console.log(suitPoints);
		return suitPoints;
	};
	this.getWaytypes = function (waytypes) { // same note for steepness applies here
		var wayTypePoints = [];
		for (var i = 0; i < waytypes.values.length; i++) {
			var point = waytypes.values[i];
			for (var j = point[0]; j < point[1]; j++) {
				wayTypePoints[j] = point[2];
			}
		}
		//console.log(wayTypePoints);
		return wayTypePoints;
	};

	this.getRoute = async function (points, skill, roundDist) {
		if (skill === undefined) {
			skill = 2;
		}
		if (roundDist === undefined) {
			var circ = '';
		}
		else {
			circ = '"round_trip":{"length":' + roundDist + '},';
			if (points.length > 1) {
				points = [points[0]];
				console.log("circular route with more than one point! this shouldn't have happened!");
			}
		}
		var plist = '';
		var radlist = '';
		var i;
		for (i = 0; i < points.length; i++) {
			if (i > 0) {
				plist += ',';
				radlist += ',';
			}
			plist += '[' + points[i].lng + ',' + points[i].lat + ']';
			radlist += '-1';
		}
		const reqBody = '{"coordinates":[' + plist + '],"elevation":"true","extra_info":["steepness","suitability","surface","waytype"],"id":"cycling_request","instructions":"true","instructions_format":"text","language":"en","preference":"fastest","units":"m","options":{' + circ + '"profile_params":{"weightings":{"steepness_difficulty":' + skill + '}}},"radiuses":[' + radlist + ']}';
		console.log("GetRoute\n" + reqBody);

		if (testing) {
			var hardResult = {
				"routes": [{
					"summary": {
						"distance": 3521.7,
						"duration": 734.0,
						"ascent": 22.1,
						"descent": 34.3
					},
					"segments": [{
						"distance": 3521.7,
						"duration": 734.0,
						"steps": [{
							"distance": 54.2,
							"duration": 10.8,
							"type": 11,
							"instruction": "Head west on Alexandra Parade, A8",
							"name": "Alexandra Parade, A8",
							"way_points": [0, 2]
						}, {
							"distance": 96.5,
							"duration": 19.3,
							"type": 0,
							"instruction": "Turn left onto Marne Street",
							"name": "Marne Street",
							"way_points": [2, 4]
						}, {
							"distance": 558.5,
							"duration": 111.7,
							"type": 1,
							"instruction": "Turn right onto Craigpark Drive",
							"name": "Craigpark Drive",
							"way_points": [4, 15]
						}, {
							"distance": 30.8,
							"duration": 6.2,
							"type": 0,
							"instruction": "Turn left onto Craigpark",
							"name": "Craigpark",
							"way_points": [15, 16]
						}, {
							"distance": 129.4,
							"duration": 25.9,
							"type": 1,
							"instruction": "Turn right onto Circus Drive",
							"name": "Circus Drive",
							"way_points": [16, 20]
						}, {
							"distance": 79.9,
							"duration": 16.0,
							"type": 0,
							"instruction": "Turn left onto Broompark Street",
							"name": "Broompark Street",
							"way_points": [20, 22]
						}, {
							"distance": 36.2,
							"duration": 7.2,
							"type": 1,
							"instruction": "Turn right onto Broompark Drive",
							"name": "Broompark Drive",
							"way_points": [22, 23]
						}, {
							"distance": 265.2,
							"duration": 53.0,
							"type": 0,
							"instruction": "Turn left onto Cardross Street",
							"name": "Cardross Street",
							"way_points": [23, 35]
						}, {
							"distance": 24.8,
							"duration": 11.0,
							"type": 0,
							"instruction": "Turn left",
							"name": "-",
							"way_points": [35, 37]
						}, {
							"distance": 59.3,
							"duration": 11.9,
							"type": 1,
							"instruction": "Turn right onto McIntosh Court",
							"name": "McIntosh Court",
							"way_points": [37, 40]
						}, {
							"distance": 96.0,
							"duration": 19.2,
							"type": 0,
							"instruction": "Turn left onto McIntosh Street",
							"name": "McIntosh Street",
							"way_points": [40, 45]
						}, {
							"distance": 1144.6,
							"duration": 228.9,
							"type": 1,
							"instruction": "Turn right onto Duke Street",
							"name": "Duke Street",
							"way_points": [45, 72]
						}, {
							"distance": 91.3,
							"duration": 20.5,
							"type": 0,
							"instruction": "Turn left onto Montrose Street",
							"name": "Montrose Street",
							"way_points": [72, 73]
						}, {
							"distance": 369.6,
							"duration": 79.4,
							"type": 1,
							"instruction": "Turn right onto Cochrane Street",
							"name": "Cochrane Street",
							"way_points": [73, 81]
						}, {
							"distance": 326.9,
							"duration": 65.4,
							"type": 6,
							"instruction": "Continue straight onto St Vincent Place",
							"name": "St Vincent Place",
							"way_points": [81, 87]
						}, {
							"distance": 105.3,
							"duration": 23.7,
							"type": 0,
							"instruction": "Turn left onto Renfield Street",
							"name": "Renfield Street",
							"way_points": [87, 93]
						}, {
							"distance": 53.2,
							"duration": 23.9,
							"type": 1,
							"instruction": "Turn right onto Gordon Street",
							"name": "Gordon Street",
							"way_points": [93, 95]
						}, {
							"distance": 0.0,
							"duration": 0.0,
							"type": 10,
							"instruction": "Arrive at Gordon Street, straight ahead",
							"name": "-",
							"way_points": [95, 95]
						}],
						"ascent": 22.14333333333333,
						"descent": 34.27666666666667
					}],
					"bbox": [-4.257813, 55.85865, 16.6, -4.212092, 55.863226, 46.16],
					"geometry": "uw}sIptuXoeGI~A?EjA?pA??zA?vBApFbB?fAD?\\?AzBg@@rDeDB`@u@DZ{@CxNsS?p@M?h@KC~Ms@v@@T?~AHA|BSDd@IXrCHz@@\\rAJf@ArBdALB\\f@F~@RDb@zBZhIv@JjHd@HnFn@HnFJJnCDThCG~BdOEf@~CAPxCPZpCRFjCEr@dCKrAtFKj@bBj@`@jCJFz@x@\\bGVJdAXHdAKlAjCOjBrDKjAnAW~CfEIbAlBEj@z@QrBvBAF\\]xE`HStC`FYpE`IQhC~CIdA`AOvBv@c@rGwBI`AiAOtBgEC\\oAKbB{Eg@bHwMCf@a@MvByAUlDFa@lHo@CXIK~A]k@lJyE`Dx@x@q@`KnNKjBbBC`@GE|@MKxAiA[jFeKWjE}FCd@]MbCmBG|@S_@lGBOlCNMbCiBa@~G_JdAXqDVF}@NF_An@L_AB?KVACE`CCAf@F",
					"way_points": [0, 95],
					"extras": {
						"surface": {
							"values": [[0, 35, 3], [35, 36, 0], [36, 93, 3], [93, 95, 5]],
							"summary": [{"value": 3.0, "distance": 3454.9, "amount": 98.1}, {
								"value": 5.0,
								"distance": 53.2,
								"amount": 1.51
							}, {"value": 0.0, "distance": 13.6, "amount": 0.39}]
						},
						"waytypes": {
							"values": [[0, 2, 1], [2, 35, 3], [35, 36, 7], [36, 45, 3], [45, 95, 2]],
							"summary": [{"value": 2.0, "distance": 2090.9, "amount": 59.37}, {
								"value": 3.0,
								"distance": 1363.0,
								"amount": 38.7
							}, {"value": 1.0, "distance": 54.2, "amount": 1.54}, {
								"value": 7.0,
								"distance": 13.6,
								"amount": 0.39
							}]
						},
						"steepness": {
							"values": [[0, 46, -1], [46, 95, 0]],
							"summary": [{"value": 0.0, "distance": 2085.5, "amount": 59.22}, {
								"value": -1.0,
								"distance": 1436.2,
								"amount": 40.78
							}]
						},
						"suitability": {
							"values": [[0, 2, 5], [2, 35, 7], [35, 36, 6], [36, 95, 7]],
							"summary": [{"value": 7.0, "distance": 3453.9, "amount": 98.08}, {
								"value": 5.0,
								"distance": 54.2,
								"amount": 1.54
							}, {"value": 6.0, "distance": 13.6, "amount": 0.39}]
						}
					}
				}],
				"bbox": [-4.257813, 55.85865, 16.6, -4.212092, 55.863226, 46.16],
				"metadata": {
					"id": "cycling_request",
					"attribution": "openrouteservice.org | OpenStreetMap contributors",
					"service": "routing",
					"timestamp": 1586549458654,
					"query": {
						"coordinates": [[-4.212087392807008, 55.86316895454438], [-4.257813692092896, 55.86059501423685]],
						"profile": "cycling-regular",
						"id": "cycling_request",
						"preference": "fastest",
						"format": "json",
						"units": "m",
						"language": "en",
						"instructions": true,
						"instructions_format": "text",
						"elevation": true,
						"extra_info": ["steepness", "suitability", "surface", "waytype"]
					},
					"engine": {
						"version": "6.1.0",
						"build_date": "2020-04-06T03:39:51Z",
						"graph_date": "2020-03-09T01:00:00Z"
					}
				}
			};
			if (!(roundDist == undefined)) {
				hardResult = {
					"routes": [{
						"summary": {
							"distance": 1603.8,
							"duration": 653.9,
							"ascent": 4.5,
							"descent": 4.4
						},
						"segments": [{
							"distance": 1603.8,
							"duration": 653.9,
							"steps": [{
								"distance": 152.3,
								"duration": 60.9,
								"type": 11,
								"instruction": "Head southeast on Ashby Road, A159",
								"name": "Ashby Road, A159",
								"way_points": [0, 10]
							}, {
								"distance": 485.2,
								"duration": 194.1,
								"type": 1,
								"instruction": "Turn right onto Lloyds Avenue",
								"name": "Lloyds Avenue",
								"way_points": [10, 17]
							}, {
								"distance": 158.2,
								"duration": 63.3,
								"type": 0,
								"instruction": "Turn left onto Peveril Avenue",
								"name": "Peveril Avenue",
								"way_points": [17, 19]
							}, {
								"distance": 0.0,
								"duration": 0.0,
								"type": 6,
								"instruction": "Continue straight",
								"name": "-",
								"way_points": [19, 20]
							}, {
								"distance": 104.9,
								"duration": 42.0,
								"type": 6,
								"instruction": "Continue straight onto Thomas Road",
								"name": "Thomas Road",
								"way_points": [20, 21]
							}, {
								"distance": 257.4,
								"duration": 102.9,
								"type": 0,
								"instruction": "Turn left onto Glanville Avenue",
								"name": "Glanville Avenue",
								"way_points": [21, 25]
							}, {
								"distance": 15.5,
								"duration": 18.5,
								"type": 6,
								"instruction": "Continue straight",
								"name": "-",
								"way_points": [25, 26]
							}, {
								"distance": 377.9,
								"duration": 151.1,
								"type": 1,
								"instruction": "Turn right onto Kingsway, A18",
								"name": "Kingsway, A18",
								"way_points": [26, 30]
							}, {
								"distance": 52.5,
								"duration": 21.0,
								"type": 7,
								"instruction": "Enter the roundabout and take the 1st exit onto Queensway Roundabout",
								"name": "Queensway Roundabout",
								"exit_number": 1,
								"way_points": [30, 38]
							}, {
								"distance": 0.0,
								"duration": 0.0,
								"type": 10,
								"instruction": "Arrive at Queensway Roundabout, on the right",
								"name": "-",
								"way_points": [38, 38]
							}],
							"ascent": 4.516666666666666,
							"descent": 4.439080459770082
						}],
						"bbox": [-0.662184, 53.576342, 48.73, -0.654314, 53.579151, 53.25],
						"geometry": "ot_fIjy~BgqHDK?HM?XC?TN?HV?BT??P?`@F?zAPj@^?H@|@?@fBG@n@IBpFmBRxTyL@bDe@CtCm@xCMsCbCCeBD}Hp@s@Cb@gBLtAeCJ~@kDT~@[DHE_E~AUsZzJ?c@D?_@DA?DOEDOSBEMDCOB?OB@c@BBEB",
						"way_points": [0, 37],
						"extras": {
							"surface": {
								"values": [[0, 24, 3], [24, 25, 0], [25, 37, 3]],
								"summary": [{"value": 3.0, "distance": 1588.3, "amount": 99.04}, {
									"value": 0.0,
									"distance": 15.5,
									"amount": 0.96
								}]
							},
							"waytypes": {
								"values": [[0, 10, 1], [10, 24, 3], [24, 25, 7], [25, 37, 1]],
								"summary": [{"value": 3.0, "distance": 1005.7, "amount": 62.71}, {
									"value": 1.0,
									"distance": 582.6,
									"amount": 36.33
								}, {"value": 7.0, "distance": 15.5, "amount": 0.96}]
							},
							"steepness": {
								"values": [[0, 37, 0]],
								"summary": [{"value": 0.0, "distance": 1603.8, "amount": 100.0}]
							},
							"suitability": {
								"values": [[0, 10, 5], [10, 24, 7], [24, 25, 6], [25, 37, 5]],
								"summary": [{"value": 7.0, "distance": 1005.7, "amount": 62.71}, {
									"value": 5.0,
									"distance": 582.6,
									"amount": 36.33
								}, {"value": 6.0, "distance": 15.5, "amount": 0.96}]
							}
						}
					}],
					"bbox": [-0.662184, 53.576342, 48.73, -0.654314, 53.579151, 53.25],
					"metadata": {
						"id": "cycling_request",
						"attribution": "openrouteservice.org | OpenStreetMap contributors",
						"service": "routing",
						"timestamp": 1586672498134,
						"query": {
							"coordinates": [[-0.6545448303222657, 53.579053825265085]],
							"profile": "cycling-regular",
							"id": "cycling_request",
							"preference": "fastest",
							"format": "json",
							"units": "m",
							"language": "en",
							"instructions": true,
							"instructions_format": "text",
							"radiuses": [-1.0],
							"elevation": true,
							"extra_info": ["steepness", "suitability", "surface", "waytype"],
							"options": {
								"profile_params": {"weightings": {"steepness_difficulty": 1}},
								"round_trip": {"length": 2000.0}
							}
						},
						"engine": {
							"version": "6.1.0",
							"build_date": "2020-04-06T03:39:51Z",
							"graph_date": "2020-03-09T01:00:00Z"
						}
					}
				};
			}
			return hardResult.routes;
		}
		else {
			let result = await fetch("https://api.openrouteservice.org/v2/directions/cycling-regular", {
				method: 'POST',
				headers: {
					'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
					'Content-Type': 'application/json',
					'Authorization': '5b3ce3597851110001cf62489c07bca5f65c4580a8e30aa481289e90',
				},
				body: reqBody
			})
				.then(this.resolveStatus)
				.then(this.resolveJson)
			rubuth = result.routes;
			//alert(rubuth);
			return rubuth;
		}
	};

	this.getDirections = function (segment) {
		var i;
		var dirList = [];
		for (i = 0; i < segment.steps.length; i++) {
			dirList.push({"title": segment.steps[i].name, "instruction": segment.steps[i].instruction});
		}
		return dirList;
	};

	this.decodePoints = function (geo) {
		// This returns an array of waypoints as [lat, lon, elevation] triples
		//based VERY HEAVILY on example code found at https://github.com/GIScience/openrouteservice-docs
		//It's the format their API hands back, and no utility is provided to resolve it other than this example code...
		var polyline = [];
		var index = 0;
		var lat = 0;
		var lng = 0;
		var ele = 0;
		while (index < geo.length) {
			var b;
			var shift = 0;
			var result = 0;
			do {
				b = geo.charAt(index++).charCodeAt(0) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);

			lat += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
			shift = 0;
			result = 0;
			do {
				b = geo.charAt(index++).charCodeAt(0) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			lng += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));

			shift = 0;
			result = 0;
			do {
				b = geo.charAt(index++).charCodeAt(0) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			ele += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
			try {
				var location = [(lat / 1E5), (lng / 1E5), (ele / 100)];
				polyline.push(location);
			} catch (e) {
				console.log("DecodePoints\n" + e);
			}
		}
		return polyline
	};

	this.makePolyLine = function (points, col) {
		var line = new L.polyline(points, {
			color: col,
			weight: 3,
			opacity: 1,
			smoothFactor: 1
		});
		return line;
	};
	this.makePolyOutLine = function (points, col) {
        var line = new L.polyline(points, {
            color: col,
            weight: 5,
            opacity: 0.9,
            smoothFactor: 1
        });
        return line;
    };

	this.makeRoute = async function (points,maxr) {
		//one stop shop route object. this is what we'll save and pass around
		var routeData = await this.getRoute(points,skill,maxr);
		var route = {};
		console.log("MakeRoute\n" + routeData);
		//alert("!!!");
		var raw = routeData[0];
		route.directions = this.getDirections(raw.segments[0]);
		route.points = this.decodePoints(raw.geometry);
		route.steepness = this.getSteepness(routeData[0].extras.steepness);
		route.surface = this.getSurface(routeData[0].extras.surface);
		route.suitability = this.getSuitability(routeData[0].extras.suitability);
		route.waytypes = this.getWaytypes(routeData[0].extras.waytypes);
		route.distance = raw.summary.distance;
		route.duration = Math.round(raw.summary.duration/60);
		route.ascent = raw.summary.ascent;
		route.descent = raw.summary.descent;
		route.score = [];

		let startLat = route.points[0][0],
			startLon = route.points[0][1];
		let endLat = route.points[route.points.length-1][0],
			endLon = route.points[route.points.length-1][1];
		let hardStartData = {"geocoding":{"version":"0.2","attribution":"https:\/\/openrouteservice.org\/terms-of-service\/#attribution-geocode","query":{"size":10,"private":false,"point.lat":55.86315,"point.lon":-4.21209,"boundary.circle.lat":55.86315,"boundary.circle.lon":-4.21209,"lang":{"name":"English","iso6391":"en","iso6393":"eng","defaulted":false},"querySize":20},"engine":{"name":"Pelias","author":"Mapzen","version":"1.0"},"timestamp":1586791735600},"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.212084,55.863029]},"properties":{"id":"node\/1600288350","gid":"openstreetmap:venue:node\/1600288350","layer":"venue","source":"openstreetmap","source_id":"node\/1600288350","name":"Ever Clinic","housenumber":"636","street":"Alexandra Parade","confidence":0.8,"distance":0.013,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Ever Clinic, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.212084,55.863029]},"properties":{"id":"node\/1600288350","gid":"openstreetmap:address:node\/1600288350","layer":"address","source":"openstreetmap","source_id":"node\/1600288350","name":"636 Alexandra Parade","housenumber":"636","street":"Alexandra Parade","confidence":0.8,"distance":0.013,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"636 Alexandra Parade, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.212221,55.863041]},"properties":{"id":"node\/1600288292","gid":"openstreetmap:venue:node\/1600288292","layer":"venue","source":"openstreetmap","source_id":"node\/1600288292","name":"Day-Today express","confidence":0.8,"distance":0.015,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Day-Today express, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.211989,55.863021]},"properties":{"id":"node\/6830792638","gid":"openstreetmap:address:node\/6830792638","layer":"address","source":"openstreetmap","source_id":"node\/6830792638","name":"638 Alexandra Parade","housenumber":"638","street":"Alexandra Parade","confidence":0.8,"distance":0.016,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"638 Alexandra Parade, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.211943,55.863017]},"properties":{"id":"node\/2147916033","gid":"openstreetmap:venue:node\/2147916033","layer":"venue","source":"openstreetmap","source_id":"node\/2147916033","name":"Hair","housenumber":"640","street":"Alexandra Parade","postalcode":"G31 3BU","confidence":0.8,"distance":0.017,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Hair, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.211943,55.863017]},"properties":{"id":"node\/2147916033","gid":"openstreetmap:address:node\/2147916033","layer":"address","source":"openstreetmap","source_id":"node\/2147916033","name":"640 Alexandra Parade","housenumber":"640","street":"Alexandra Parade","postalcode":"G31 3BU","confidence":0.8,"distance":0.017,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"640 Alexandra Parade, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.212143,55.862996]},"properties":{"id":"way\/204817546","gid":"openstreetmap:address:way\/204817546","layer":"address","source":"openstreetmap","source_id":"way\/204817546","name":"634 Alexandra Parade","housenumber":"634","street":"Alexandra Parade","confidence":0.8,"distance":0.017,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"634 Alexandra Parade, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.211864,55.86301]},"properties":{"id":"node\/1600288295","gid":"openstreetmap:venue:node\/1600288295","layer":"venue","source":"openstreetmap","source_id":"node\/1600288295","name":"McLeans Funeral Services","housenumber":"644","street":"Alexandra Parade","postalcode":"G31 3BU","confidence":0.8,"distance":0.021,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"McLeans Funeral Services, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.211864,55.86301]},"properties":{"id":"node\/1600288295","gid":"openstreetmap:address:node\/1600288295","layer":"address","source":"openstreetmap","source_id":"node\/1600288295","name":"644 Alexandra Parade","housenumber":"644","street":"Alexandra Parade","postalcode":"G31 3BU","confidence":0.8,"distance":0.021,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"644 Alexandra Parade, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.211911,55.862976]},"properties":{"id":"way\/204817549","gid":"openstreetmap:address:way\/204817549","layer":"address","source":"openstreetmap","source_id":"way\/204817549","name":"642 Alexandra Parade","housenumber":"642","street":"Alexandra Parade","confidence":0.8,"distance":0.022,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Anwoth","neighbourhood_gid":"whosonfirst:neighbourhood:85785321","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"642 Alexandra Parade, Glasgow, Scotland, United Kingdom"}}],"bbox":[-4.212221,55.862976,-4.211864,55.863041]}
		let hardEndData = {"geocoding":{"version":"0.2","attribution":"https:\/\/openrouteservice.org\/terms-of-service\/#attribution-geocode","query":{"size":10,"private":false,"point.lat":55.8606,"point.lon":-4.25781,"boundary.circle.lat":55.8606,"boundary.circle.lon":-4.25781,"lang":{"name":"English","iso6391":"en","iso6393":"eng","defaulted":false},"querySize":20},"engine":{"name":"Pelias","author":"Mapzen","version":"1.0"},"timestamp":1586792046521},"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.257835,55.860709]},"properties":{"id":"node\/5001278112","gid":"openstreetmap:venue:node\/5001278112","layer":"venue","source":"openstreetmap","source_id":"node\/5001278112","name":"Sainsbury's Local","confidence":0.8,"distance":0.012,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Sainsbury's Local, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.25801,55.86066]},"properties":{"id":"node\/2092452821","gid":"openstreetmap:venue:node\/2092452821","layer":"venue","source":"openstreetmap","source_id":"node\/2092452821","name":"Gordon Street \/ Central Station","street":"Gordon Street","confidence":0.8,"distance":0.014,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Gordon Street \/ Central Station, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.258079,55.860721]},"properties":{"id":"node\/1596714834","gid":"openstreetmap:venue:node\/1596714834","layer":"venue","source":"openstreetmap","source_id":"node\/1596714834","name":"William Hill","confidence":0.8,"distance":0.022,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"William Hill, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.257469,55.860686]},"properties":{"id":"node\/5001278102","gid":"openstreetmap:venue:node\/5001278102","layer":"venue","source":"openstreetmap","source_id":"node\/5001278102","name":"News 24","confidence":0.8,"distance":0.023,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"News 24, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.257944,55.860387]},"properties":{"id":"way\/116869690","gid":"openstreetmap:venue:way\/116869690","layer":"venue","source":"openstreetmap","source_id":"way\/116869690","name":"Virgin Travel Centre","confidence":0.8,"distance":0.025,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Virgin Travel Centre, Glasgow, Scotland, United Kingdom"},"bbox":[-4.2581933,55.8603036,-4.2578138,55.860476]},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.257615,55.860401]},"properties":{"id":"node\/647091314","gid":"openstreetmap:venue:node\/647091314","layer":"venue","source":"openstreetmap","source_id":"node\/647091314","name":"Glasgow City Centre Map","confidence":0.8,"distance":0.025,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Glasgow City Centre Map, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.25817,55.860723]},"properties":{"id":"node\/1596714799","gid":"openstreetmap:venue:node\/1596714799","layer":"venue","source":"openstreetmap","source_id":"node\/1596714799","name":"Ladbrokes","confidence":0.8,"distance":0.026,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Ladbrokes, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.257504,55.860435]},"properties":{"id":"node\/5001278104","gid":"openstreetmap:venue:node\/5001278104","layer":"venue","source":"openstreetmap","source_id":"node\/5001278104","name":"Gordon Street Coffee","housenumber":"79","street":"Gordon Street","postalcode":"G1 3SQ","confidence":0.8,"distance":0.027,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Gordon Street Coffee, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.257384,55.860474]},"properties":{"id":"node\/1596714762","gid":"openstreetmap:venue:node\/1596714762","layer":"venue","source":"openstreetmap","source_id":"node\/1596714762","name":"Blue Lagoon","confidence":0.8,"distance":0.03,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Blue Lagoon, Glasgow, Scotland, United Kingdom"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-4.257343,55.860681]},"properties":{"id":"node\/5001278110","gid":"openstreetmap:venue:node\/5001278110","layer":"venue","source":"openstreetmap","source_id":"node\/5001278110","name":"Currency exchange","confidence":0.8,"distance":0.031,"accuracy":"point","country":"United Kingdom","country_gid":"whosonfirst:country:85633159","country_a":"GBR","macroregion":"Scotland","macroregion_gid":"whosonfirst:macroregion:404227471","region":"City of Glasgow","region_gid":"whosonfirst:region:1360698707","county":"Glasgow City","county_gid":"whosonfirst:county:1360698797","county_a":"GLG","localadmin":"Glasgow City","localadmin_gid":"whosonfirst:localadmin:404430153","locality":"Glasgow","locality_gid":"whosonfirst:locality:1175612707","neighbourhood":"Glasgow Central","neighbourhood_gid":"whosonfirst:neighbourhood:85792619","continent":"Europe","continent_gid":"whosonfirst:continent:102191581","label":"Currency exchange, Glasgow, Scotland, United Kingdom"}}],"bbox":[-4.2581933,55.8603036,-4.257343,55.860723]}

		if(!testing) {
			route.autoName = await fetch("https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf62489c07bca5f65c4580a8e30aa481289e90&point.lat=" + startLat + "&point.lon=" + startLon, {
				method: 'get',
				headers: {
					'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
					'Content-Type': 'application/json'
				}

			})
				.then(this.resolveStatus)
				.then(this.resolveJson)
				.then(this.getAddress);
			route.autoName += " to "
			route.autoName += await fetch("https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf62489c07bca5f65c4580a8e30aa481289e90&point.lat=" + endLat + "&point.lon=" + endLon, {
				method: 'get',
				headers: {
					'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
					'Content-Type': 'application/json'
				}

			})
				.then(this.resolveStatus)
				.then(this.resolveJson)
				.then(this.getAddress);
		}
		else{
			route.autoName = "Alexandra Parade to Gordon Street";
		}

		console.log("route name " + route.autoName);

		for(var i=0; i < route.steepness.length; i++){
			route.score[i] = this.calculateScore(route.steepness[i], route.surface[i], route.suitability[i], route.waytypes[i]);
		}
		route.averageScore = route.score.reduce((a, b) => parseFloat(a) + parseFloat(b), 0); //Ignore the errors, this line sums up the array
		(route.score.length===0 ? route.averageScore=9 : route.averageScore /= route.score.length)
		route.averageScore = Math.round(route.averageScore);
        if(route.averageScore <= 2){
			route.color = 'green';
        }
        else if(route.averageScore > 2 && route.averageScore <= 4){
			route.color = 'yellow';
        }
		else if(route.averageScore >= 5 && route.averageScore <= 6 ){
            route.color = 'orange';
        }
        else if (route.averageScore >= 7 && route.averageScore <= 8){
			route.color = 'red';
        }
        else if(route.averageScore >=9){
            route.color = 'black';
        }

        route.line = this.makePolyLine(route.points, route.color);
        route.outline = this.makePolyOutLine(route.points, "black");
		//console.log("Average Score: " + route.averageScore);
		//console.log("Color: " + route.color);
		return route;
	};

	this.getRouteWeather = async function (route){
		return await this.getWeather([route.points[0][0],route.points[0][1]]);
	};
	this.getWeather = async function (coords) {
		var lat = coords[0],
			lon = coords[1];
		const APIKEY = "091dc7f35fcb911cc984aa58fdc266f7";
		var apiCall = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + APIKEY;
		const sampleData = {"lat":55.86,"lon":-4.23,"timezone":"Europe/London","current":{"dt":1586779948,"sunrise":1586754932,"sunset":1586805523,"temp":7.95,"feels_like":2.46,"pressure":1034,"humidity":49,"dew_point":-1.86,"uvi":3.7,"clouds":20,"visibility":10000,"wind_speed":4.6,"wind_deg":110,"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02d"}]},"hourly":[{"dt":1586779200,"temp":7.95,"feels_like":4,"pressure":1034,"humidity":49,"dew_point":-1.86,"clouds":20,"wind_speed":2.4,"wind_deg":72,"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02d"}]},{"dt":1586782800,"temp":9.62,"feels_like":6.26,"pressure":1033,"humidity":46,"dew_point":-1.26,"clouds":9,"wind_speed":1.68,"wind_deg":64,"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}]},{"dt":1586786400,"temp":10.89,"feels_like":8.06,"pressure":1033,"humidity":43,"dew_point":-1.05,"clouds":4,"wind_speed":0.97,"wind_deg":86,"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}]},{"dt":1586790000,"temp":11.33,"feels_like":8.72,"pressure":1032,"humidity":42,"dew_point":-0.98,"clouds":1,"wind_speed":0.67,"wind_deg":141,"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}]},{"dt":1586793600,"temp":11.12,"feels_like":8.46,"pressure":1032,"humidity":43,"dew_point":-0.86,"clouds":0,"wind_speed":0.77,"wind_deg":229,"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}]},{"dt":1586797200,"temp":10.44,"feels_like":6.96,"pressure":1032,"humidity":45,"dew_point":-2.42,"clouds":0,"wind_speed":1.94,"wind_deg":243,"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}]},{"dt":1586800800,"temp":9.15,"feels_like":5.27,"pressure":1032,"humidity":51,"dew_point":-0.62,"clouds":3,"wind_speed":2.61,"wind_deg":256,"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}]},{"dt":1586804400,"temp":6.83,"feels_like":3.51,"pressure":1032,"humidity":60,"dew_point":-0.76,"clouds":36,"wind_speed":1.83,"wind_deg":258,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}]},{"dt":1586808000,"temp":5.85,"feels_like":2.79,"pressure":1032,"humidity":63,"dew_point":-1.27,"clouds":49,"wind_speed":1.4,"wind_deg":255,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}]},{"dt":1586811600,"temp":5.77,"feels_like":2.57,"pressure":1032,"humidity":64,"dew_point":-1.49,"clouds":66,"wind_speed":1.63,"wind_deg":243,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},{"dt":1586815200,"temp":5.46,"feels_like":2.23,"pressure":1032,"humidity":65,"dew_point":-1.68,"clouds":75,"wind_speed":1.65,"wind_deg":231,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},{"dt":1586818800,"temp":4.77,"feels_like":1.44,"pressure":1032,"humidity":68,"dew_point":-1.81,"clouds":79,"wind_speed":1.79,"wind_deg":243,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},{"dt":1586822400,"temp":3.91,"feels_like":0.55,"pressure":1032,"humidity":72,"dew_point":-2.11,"clouds":75,"wind_speed":1.83,"wind_deg":224,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},{"dt":1586826000,"temp":3.38,"feels_like":-0.14,"pressure":1031,"humidity":74,"dew_point":-2.28,"clouds":64,"wind_speed":2.03,"wind_deg":235,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},{"dt":1586829600,"temp":2.99,"feels_like":-0.54,"pressure":1030,"humidity":76,"dew_point":-2.23,"clouds":68,"wind_speed":2.04,"wind_deg":240,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},{"dt":1586833200,"temp":3.04,"feels_like":-0.72,"pressure":1030,"humidity":77,"dew_point":-1.86,"clouds":78,"wind_speed":2.42,"wind_deg":234,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},{"dt":1586836800,"temp":3.02,"feels_like":-0.88,"pressure":1030,"humidity":77,"dew_point":-1.49,"clouds":84,"wind_speed":2.61,"wind_deg":233,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},{"dt":1586840400,"temp":3.22,"feels_like":-0.65,"pressure":1029,"humidity":76,"dew_point":-1.41,"clouds":87,"wind_speed":2.57,"wind_deg":236,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586844000,"temp":3.35,"feels_like":-0.62,"pressure":1029,"humidity":76,"dew_point":-1.31,"clouds":89,"wind_speed":2.74,"wind_deg":238,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586847600,"temp":4.72,"feels_like":0.42,"pressure":1029,"humidity":69,"dew_point":-1.04,"clouds":100,"wind_speed":3.21,"wind_deg":239,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586851200,"temp":6.47,"feels_like":1.79,"pressure":1028,"humidity":61,"dew_point":-0.74,"clouds":87,"wind_speed":3.75,"wind_deg":242,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586854800,"temp":7.77,"feels_like":2.88,"pressure":1028,"humidity":57,"dew_point":-0.21,"clouds":89,"wind_speed":4.1,"wind_deg":243,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586858400,"temp":8.66,"feels_like":3.79,"pressure":1028,"humidity":55,"dew_point":0.48,"clouds":92,"wind_speed":4.15,"wind_deg":235,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586862000,"temp":9.47,"feels_like":4.41,"pressure":1028,"humidity":54,"dew_point":0.95,"clouds":94,"wind_speed":4.53,"wind_deg":240,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586865600,"temp":10.49,"feels_like":5.56,"pressure":1027,"humidity":51,"dew_point":0.96,"clouds":94,"wind_speed":4.38,"wind_deg":242,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586869200,"temp":10.74,"feels_like":5.55,"pressure":1027,"humidity":50,"dew_point":1.09,"clouds":100,"wind_speed":4.74,"wind_deg":234,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586872800,"temp":10.95,"feels_like":5.57,"pressure":1026,"humidity":50,"dew_point":1.08,"clouds":100,"wind_speed":5.05,"wind_deg":235,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586876400,"temp":10.61,"feels_like":5.17,"pressure":1026,"humidity":50,"dew_point":0.77,"clouds":100,"wind_speed":5.06,"wind_deg":234,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586880000,"temp":10.06,"feels_like":4.74,"pressure":1025,"humidity":51,"dew_point":0.68,"clouds":100,"wind_speed":4.85,"wind_deg":234,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586883600,"temp":9.53,"feels_like":4.77,"pressure":1025,"humidity":54,"dew_point":0.83,"clouds":100,"wind_speed":4.11,"wind_deg":235,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586887200,"temp":8.55,"feels_like":4.18,"pressure":1025,"humidity":58,"dew_point":0.88,"clouds":100,"wind_speed":3.57,"wind_deg":238,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586890800,"temp":7.12,"feels_like":2.9,"pressure":1026,"humidity":63,"dew_point":0.79,"clouds":100,"wind_speed":3.31,"wind_deg":238,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586894400,"temp":5.99,"feels_like":1.87,"pressure":1025,"humidity":68,"dew_point":0.84,"clouds":100,"wind_speed":3.17,"wind_deg":238,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586898000,"temp":5.48,"feels_like":1.48,"pressure":1025,"humidity":72,"dew_point":1,"clouds":100,"wind_speed":3.06,"wind_deg":237,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586901600,"temp":5.27,"feels_like":1.29,"pressure":1025,"humidity":73,"dew_point":1.01,"clouds":100,"wind_speed":3.02,"wind_deg":238,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586905200,"temp":5.04,"feels_like":1.14,"pressure":1025,"humidity":74,"dew_point":1.04,"clouds":100,"wind_speed":2.91,"wind_deg":237,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586908800,"temp":4.85,"feels_like":1.02,"pressure":1025,"humidity":75,"dew_point":1,"clouds":100,"wind_speed":2.8,"wind_deg":239,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586912400,"temp":4.46,"feels_like":0.61,"pressure":1024,"humidity":77,"dew_point":0.93,"clouds":100,"wind_speed":2.83,"wind_deg":241,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586916000,"temp":4.19,"feels_like":0.34,"pressure":1024,"humidity":77,"dew_point":0.81,"clouds":100,"wind_speed":2.77,"wind_deg":241,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586919600,"temp":3.93,"feels_like":0.16,"pressure":1023,"humidity":78,"dew_point":0.7,"clouds":100,"wind_speed":2.65,"wind_deg":240,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586923200,"temp":3.89,"feels_like":0.06,"pressure":1023,"humidity":79,"dew_point":0.72,"clouds":100,"wind_speed":2.76,"wind_deg":238,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586926800,"temp":3.79,"feels_like":-0.1,"pressure":1023,"humidity":81,"dew_point":0.99,"clouds":99,"wind_speed":2.9,"wind_deg":240,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}]},{"dt":1586930400,"temp":4.43,"feels_like":0.7,"pressure":1023,"humidity":81,"dew_point":1.66,"clouds":98,"wind_speed":2.81,"wind_deg":239,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586934000,"temp":6.74,"feels_like":3,"pressure":1023,"humidity":77,"dew_point":3.13,"clouds":98,"wind_speed":3.2,"wind_deg":243,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586937600,"temp":8.4,"feels_like":4.46,"pressure":1023,"humidity":75,"dew_point":4.35,"clouds":92,"wind_speed":3.8,"wind_deg":250,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586941200,"temp":9.88,"feels_like":5.77,"pressure":1023,"humidity":70,"dew_point":4.9,"clouds":88,"wind_speed":4.17,"wind_deg":260,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586944800,"temp":10.47,"feels_like":6.19,"pressure":1023,"humidity":68,"dew_point":5.13,"clouds":90,"wind_speed":4.46,"wind_deg":260,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]},{"dt":1586948400,"temp":10.81,"feels_like":6.53,"pressure":1023,"humidity":69,"dew_point":5.47,"clouds":91,"wind_speed":4.61,"wind_deg":261,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}]}],"daily":[{"dt":1586779200,"sunrise":1586754932,"sunset":1586805523,"temp":{"day":7.95,"min":3.9,"max":11,"night":3.9,"eve":8.99,"morn":7.95},"feels_like":{"day":4,"night":0.54,"eve":5.09,"morn":4},"pressure":1034,"humidity":49,"dew_point":-1.86,"wind_speed":2.4,"wind_deg":72,"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02d"}],"clouds":20,"uvi":3.7},{"dt":1586865600,"sunrise":1586841181,"sunset":1586892044,"temp":{"day":10.49,"min":3.35,"max":10.61,"night":4.85,"eve":8.55,"morn":3.35},"feels_like":{"day":5.56,"night":1.02,"eve":4.18,"morn":-0.62},"pressure":1027,"humidity":51,"dew_point":0.96,"wind_speed":4.38,"wind_deg":242,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"clouds":94,"uvi":3.74},{"dt":1586952000,"sunrise":1586927431,"sunset":1586978566,"temp":{"day":11.56,"min":4.43,"max":13.71,"night":6.25,"eve":11.92,"morn":4.43},"feels_like":{"day":7.33,"night":4.72,"eve":8.97,"morn":0.7},"pressure":1022,"humidity":67,"dew_point":5.86,"wind_speed":4.62,"wind_deg":259,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"clouds":91,"uvi":3.66},{"dt":1587038400,"sunrise":1587013681,"sunset":1587065088,"temp":{"day":14.57,"min":5.83,"max":14.57,"night":7,"eve":10.46,"morn":5.83},"feels_like":{"day":11.16,"night":2.21,"eve":5.97,"morn":3.24},"pressure":1016,"humidity":58,"dew_point":6.65,"wind_speed":3.68,"wind_deg":65,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"clouds":91,"uvi":3.7},{"dt":1587124800,"sunrise":1587099932,"sunset":1587151610,"temp":{"day":10.01,"min":3.68,"max":10.47,"night":3.68,"eve":8.71,"morn":6.42},"feels_like":{"day":5,"night":-0.36,"eve":3.84,"morn":1.46},"pressure":1022,"humidity":56,"dew_point":1.97,"wind_speed":4.68,"wind_deg":75,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"clouds":99,"uvi":3.61},{"dt":1587211200,"sunrise":1587186184,"sunset":1587238132,"temp":{"day":8.39,"min":2.88,"max":9.12,"night":3.18,"eve":7,"morn":2.88},"feels_like":{"day":2.38,"night":-2.01,"eve":1.13,"morn":-1.54},"pressure":1024,"humidity":56,"dew_point":0.32,"wind_speed":5.77,"wind_deg":72,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"clouds":49,"uvi":3.5},{"dt":1587297600,"sunrise":1587272437,"sunset":1587324654,"temp":{"day":10.73,"min":3.13,"max":11.61,"night":3.97,"eve":9.2,"morn":3.13},"feels_like":{"day":5.01,"night":-1.01,"eve":3.78,"morn":-1.71},"pressure":1025,"humidity":51,"dew_point":1.17,"wind_speed":5.55,"wind_deg":71,"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}],"clouds":3,"uvi":3.62},{"dt":1587384000,"sunrise":1587358690,"sunset":1587411176,"temp":{"day":11.83,"min":3.49,"max":11.83,"night":4.35,"eve":9.12,"morn":3.49},"feels_like":{"day":4.64,"night":-1.19,"eve":2.69,"morn":-1.63},"pressure":1029,"humidity":46,"dew_point":0.83,"wind_speed":7.56,"wind_deg":77,"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}],"clouds":1,"uvi":3.81}]};

		if(!testing) {
			result = await fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + APIKEY, {
				method: 'POST',
				headers: {
					'Accept': 'application/json; charset=utf-8',
				}
			})
				.then(this.resolveStatus)
				.then(this.resolveJson)
				.then(this.parseWeather);
			return result;
		}
		else {
			var result = sampleData;
			var temp = result.current.feels_like,
				weather = result.current.weather,
				wind = result.current.wind_speed,
				icon = result.current.weather[0].icon;
			console.log("Weather Data" + [temp, wind, weather]);
			return [temp, wind, weather, icon]
		}
	};
	this.parseWeather = function (data) { //takes as input the output of getWeather ([temperature, windSpeed, weather conditions])
		var temp = data.current.feels_like,
			weather = data.current.weather,
			wind = data.current.wind_speed,
			icon = data.current.weather[0].icon;
		resar = [temp, wind, weather, icon];
		//console.log(resar);
		return [temp, wind, weather, icon];
	};

	this.getWeatherString = async function (weather) { //takes as input the output of getWeather ([temperature, windSpeed, weather conditions])
		let weatherString = "It is "+weather[0]+"°C, with "+weather[1] + " km/h wind";
		for(let i=0; i<=weather[2].length-2; i++){
			weatherString += ", ";
			if(i === weather[2].length-2){
				weatherString += "and ";
			}
			weatherString+= weather[2][i].description;
		}
		weatherString += ".";
		console.log(weatherString);
		return weatherString;
	};

	this.weatherPic = async function(weather) {
		return weather[3];
	}

	this.getAddress = function (data) {
		console.log("GetAddress Data" + data);
		if(data.features[0] !== undefined) {
			for (let i = 0; i < data.features.length; i++) {
				if (data.features[i].properties.street !== undefined) {
					//console.log(data.features[i].properties.street);
					return data.features[i].properties.street;
				}
			}
			//console.log(data.features[0].properties.label);
			return data.features[0].properties.label;
		}
		else {
			return "Unknown road"
		}
	}

	this.resolveStatus = function (response) {
		if (response.status >= 200 && response.status < 300) {
			return Promise.resolve(response);
		} else {
			return Promise.reject(new Error(response.statusText));
		}

	}

	this.resolveJson = function (response) {
		console.log('Status:', response.status);
		console.log('Headers:', response.headers);
		return response.json();
	}
}
