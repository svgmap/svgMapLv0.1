// 3D Visualize Window for SVGMap Contents using CESIUM
//
// Assitant for SVGMapLv0.1_CesiumWrapper_r3.js
//
//  
//  Copyright (C) 2018 by Satoru Takagi @ KDDI CORPORATION
//
// License: (GPL v3)
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License version 3 as
//  published by the Free Software Foundation.
//  
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//  
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
// 
//
// Rev.1 : 2018/02/10 2D vector view
// Rev.2 : 2018/02/28 Raster and POI bar graph impl.
//         2018/04/05 Add getHeights Func

// ISSUES:
// 地理院のテレインでは、sampleTerrainMostDetailedが動かなくなった(Cesiumがまた仕様変更した感じ)
// 一方でCesium標準テレインで、sampleTerrainを使うと　たとえばレベル15指定すると動かない


//var testData="ddd";

// 環境依存のパラメータ ：　環境に応じて上書きしてください
var reldir2imageUrl = "../../rev15/"; // このSVGMapコンテンツのルートコンテナのあるディレクトリへ相対パス　（なので、本来は呼び元から提供すべきだが・・）
var directURLlist = ["magicWordsURL0","magicWordsURL1"]; // プロキシへ接続しなくて良いデータのURLのキーワード
var cesiumProxyURL = "../cesiumSvgMapProxy.php?file="; // プロキシ―サーバの相対パス

//

var viewer;
var scene;

onload = function(){
	console.log("onLoad   reldir2imageUrl,directURLlist,cesiumProxyURL:",reldir2imageUrl,directURLlist,cesiumProxyURL);
	// select imgSrc https://groups.google.com/forum/#!topic/cesium-dev/QniSlJ0IKGg
	var imagerySources = Cesium.createDefaultImageryProviderViewModels();
	var terrainSources = Cesium.createDefaultTerrainProviderViewModels();
	
	/** This Provider is about to obsolute...
	var terrainProvider = new Cesium.CesiumTerrainProvider({
	    url : '//assets.agi.com/stk-terrain/world'
	});
	**/
	
	var GSIterrainProvider1 = new Cesium.JapanGSITerrainProvider(); 
    
	var GSIterrainProvider2 = new Cesium.JapanGSITerrainProvider({
	    heightPower: 2.0,
	    usePngData: false
    });
	
	// https://groups.google.com/forum/#!topic/cesium-dev/2UYkQyA7amU
	// terrainSources.push(terrainProvider); さすがにこれじゃない
	// terrainSources.push(terrainProvider2); 
	
	terrainSources.push(new Cesium.ProviderViewModel({
		name : '国土地理院DEM',
		iconUrl : 'Ellipsoid.png',
		tooltip : 'WGS84 standard ellipsoid, also known as EPSG:4326',
		creationFunction : function() {
			return GSIterrainProvider1;
		}	
	}));
	terrainSources.push(new Cesium.ProviderViewModel({
		name : '国土地理院DEM scale2',
		iconUrl : 'Ellipsoid.png',
		tooltip : 'WGS84 standard ellipsoid, also known as EPSG:4326',
		creationFunction : function() {
			return GSIterrainProvider2;
		}	
	}));
	
	Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMzg5NTRjOS1jNDgxLTQ3YTMtYTllNi1iYjYxMzNmNDZjZGUiLCJpZCI6MTYzMTYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzAxNTk1MDB9.irhIZ_G1qsuWr5q60z8Vpg6fg1E4Tb65jMOu0f-oamI';

	viewer = new Cesium.Viewer('cesiumContainer', {
		imageryProviderViewModels : imagerySources,
		terrainProviderViewModels : terrainSources,
		timeline: false,
		animation: false,
		selectedImageryProviderViewModel : imagerySources[1],
		selectedTerrainProviderViewModel : terrainSources[1]
	});
	
	
//	console.log( "Resource.fetchText?:", Cesium.Resource.fetchText);
	
	/**
	// set basic terrain https://cesiumjs.org/tutorials/Terrain-Tutorial/
//	viewer.terrainProvider = terrainProvider;
	viewer.terrainProvider = terrainProvider2;
	// see also https://groups.google.com/forum/#!topic/cesium-dev/2UYkQyA7amU
	**/
	
	scene = viewer.scene;
	console.log("onLoad : geoJSinstance:",geoJSinstanceSample, "   scene:",scene);
//	addCyberJapan();
	
//	testAdd();
	
	
}
var geoJSinstanceSample={
	"type": "FeatureCollection",
	"features": [
	{
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Point",
			"coordinates": [139.67760,35.66102]
		}
	},
	{
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Point",
			"coordinates": [139.67860,35.66102 ]
		}
	},
	{
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Point",
			"coordinates": [139.67860,35.67102 ]
		}
	},
	{
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Point",
			"coordinates": [139.67760,35.67102 ]
		}
	}
	]
}

function flyToRectangle(west,south,east,north , showViewport) {
	// https://gis.stackexchange.com/questions/157781/how-to-control-the-zoom-amount-in-cesium-camera-flyto
	
	var dy = ( north - south )*1.0 ; // pitch による視線のずれ分だけずらす・・
	var dw = (east - west) * 0.2;
	var dh = (north - south) * 0.2;
	
	var rectangle = Cesium.Rectangle.fromDegrees(west+dw, south+dh - dy, east-dw, north-dh - dy);
	var rectangleV = Cesium.Rectangle.fromDegrees(west, south, east, north);
	viewer.camera.flyTo({
		destination : rectangle,
		orientation : {
			heading : Cesium.Math.toRadians(0.0),
			pitch : Cesium.Math.toRadians(-40.0),
			roll : 0.0
		}
	});

	if ( showViewport ){
//		setGroundRect(rectangleV);
//		setRect(rectangleV);
		setRectOfHeight((west+east)/2,(north+south)/2,rectangleV);
//		testGroundPrimitive();
	}
	
	/**
	console.log("flyToRectangle scene:",scene,"   scene.camera:",scene.camera);
    scene.camera.flyToRectangle({
        destination : Cesium.Rectangle.fromDegrees(west, south, east, north)
    });
	**/
}

function setGroundRect(rectangleV){
	console.log("setGroundRect:");
	// https://stackoverflow.com/questions/29911691/cesium-how-to-drape-a-polygon-or-line-onto-terrain-surface
	// うまくつくれない？
	// https://cesiumjs.org/tutorials/Geometry-and-Appearances/ これ見ても作れてるはずなんだが・・
	// https://stackoverflow.com/questions/34727726/what-is-difference-between-entity-and-primitive-in-cesiumjs
	// https://cesiumjs.org/Cesium/Build/Documentation/GroundPrimitive.html
	var rectangleInstance = new Cesium.GeometryInstance({
		
		geometry : new Cesium.RectangleGeometry({
			rectangle : rectangleV
		}),
		id : 'rectangle',
		attributes : {
			color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
		}
	});
	scene.primitives.removeAll();
	scene.primitives.add(new Cesium.GroundPrimitive({
	  geometryInstance : rectangleInstance
	}));
}

function testGroundPrimitive(){
	// これも同じ・・・
	var rectangleInstance = new Cesium.GeometryInstance({
		geometry : new Cesium.RectangleGeometry({
			rectangle : Cesium.Rectangle.fromDegrees(135.0, 35.0, 3.0, 3.0)
		}),
		id : 'rectangle',
		attributes : {
			color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
		}
	});
	console.log("testGroundPrimitive:",scene,scene.primitives,rectangleInstance);
	scene.primitives.add(new Cesium.GroundPrimitive({
		geometryInstance : rectangleInstance
	}));
}

function setRect(rectangleV,height){
	hv = 0;
	if ( height ){
		hv = height;
	}
	viewer.entities.add({
		rectangle : {
			coordinates : rectangleV,
			fill : false,
			outline : true,
			outlineColor : Cesium.Color.WHITE.withAlpha(0.3),
			height: hv
		}
	});
}

function setBox(lng,lat,title,boxSize, boxTall , terrainHeight){
	if ( ! boxSize ){
		boxSize = 100;
	}
	/**
	if ( ! boxTall ){
		boxTall = 500;
	}
	**/
	
	if ( ! terrainHeight ){
		terrainHeight = 0;
	}
	
	var boxZpos = boxTall*0.5 + terrainHeight;
	
//	console.log("Called setBox:lng,lat,title,boxSize, boxTall , terrainHeight:",lng,lat,title,boxSize, boxTall , terrainHeight);
	var redBox = viewer.entities.add({
		name : title,
		position: Cesium.Cartesian3.fromDegrees(lng, lat, boxZpos),
		box : {
			dimensions : new Cesium.Cartesian3(boxSize, boxSize, boxTall),
			material : Cesium.Color.RED.withAlpha(0.35),
			outline : true,
			outlineColor : Cesium.Color.BLACK.withAlpha(0.35)
		}
	});
}


// posArray should be [[lng0,lat0],[lng1,lat1],.....]
// positions of callBackFunc ( positions ) may be positions[0].height,positions[1].height, ...
function getHeights(posArray, callBackFunc,progressFunc){
	var positions = [];
	for ( var i = 0 ; i < posArray.length ; i++ ){
		var pos = Cesium.Cartographic.fromDegrees(posArray[i][0], posArray[i][1]);
		positions.push(pos);
	}
	console.log("called getHeights,sampleTerrainMostDetailed:",positions,"  viewer.terrainProvider:",viewer.terrainProvider.availability);
//	Cesium.sampleTerrain(viewer.terrainProvider, 9, positions).then(callBackFunc);
//	Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions).then(callBackFunc);
	var stC = sampleTerrainWrapperC();
	stC.sampleTerrainWrapper(viewer.terrainProvider, positions, callBackFunc,progressFunc);
}

function setRectOfHeight(lng,lat,rect){
	// これを使って中心点の高さを取り出し、それに合わせる
	// https://stackoverflow.com/questions/28291013/get-ground-altitude-cesiumjs
	// https://groups.google.com/forum/#!topic/cesium-dev/imIpoZHvKrM
	// https://cesiumjs.org/Cesium/Build/Documentation/sampleTerrain.html
	console.log( "setRectOfHeight:",lng,lat, "  viewer.terrainProvider:",viewer.terrainProvider  ,"   when", Cesium.when,"   Cesium:",Cesium);
	viewer.terrainProvider.readyPromise.then(function() { console.log("readyPromise") });
	
	
	var pointOfInterest = Cesium.Cartographic.fromDegrees(lng, lat, 5000, new Cesium.Cartographic());
	console.log( "terrainProvider",viewer.terrainProvider);
	if ( viewer.terrainProvider.availability ){
	console.log( "availability",viewer.terrainProvider.availability);
	console.log("availability.computeMaximumLevelAtPosition : ",viewer.terrainProvider.availability.computeMaximumLevelAtPosition(pointOfInterest));
	}
	//,viewer.terrainProvider.availability.computeMaximumLevelAtPosition(pointOfInterest));
//	var samPromise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [ pointOfInterest ]);
	var samPromise = Cesium.sampleTerrain(viewer.terrainProvider, 10, [ pointOfInterest ]);
	console.log("samPromise:sampleTerrain:",samPromise);
	samPromise.then(function(samples) {
		console.log('Height in meters is: ' + samples[0].height, "   rect:",rect);
		setRect(rect,samples[0].height);
	});
	
//	Cesium.sampleTerrain(viewer.terrainProvider, 9, [ pointOfInterest ])
	/**
	Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [ pointOfInterest ])
	.then(function(samples) {
		console.log('Height in meters is: ' + samples[0].height, "   rect:",rect);
		setRect(rect,samples[0].height);
	});
	**/

}

function getGeoJsonTemplate(){
	var geoJSinstanceTmpl={
		"type": "FeatureCollection",
		"features": []
	}
	return(geoJSinstanceTmpl);
}


// POIのスタイルを変えるには。。
//		markerSymbol: 'golf'　とか・・
//		"marker-symbol": "art-gallery", とか。。
// https://cesiumjs.org/Cesium/Apps/Sandcastle/index.html?src=GeoJSON%20simplestyle.html&label=Showcases
// マーカーを変えるには、これが参考になる・・
// https://cesiumjs.org/Cesium/Apps/SampleData/simplestyles.geojson
// geojsonにこのように記載すればそれが反映されると思う

var pColor=["blue","red","green","purple","yellow","aqua","maroon","olive","lime","navy","fuchsia","teal","white","black"];
var pLvl=["A","B","C","D","E","F","G","H","I","J","K","L","M","N"];
var strokeRatio = 500; // Cesium画面の何分の一の幅で「線」を表現するか
var relBarTickness = 4.0; // 「線」の幅の何倍の大きさで、バーグラフの太さを表現するか
var relBarFullRange = 25.0; // バーグラフの太さの何倍を正規化値のフルレンジにするか

function viewGeoJson(geojsInp, rect){
	console.log("viewGeoJson:  jsGeom",geojsInp);
//	console.log( viewer, viewer.dataSources);
	
	if ( viewer && viewer.dataSources ){
		// countinue
	} else {
		console.log("wait instansiation..");
		setTimeout(function(){ viewGeoJson(geojsInp, rect);},200);
	}
	
	var js = geojsInp;
	
	var geoJSinstance = getGeoJsonTemplate();
	
	
	// いろいろ消去する。
	clearCoverageImageries();
	viewer.entities.removeAll(); 

	var sw = rect.width * 111111 / strokeRatio; // 線幅(sw)はメートル次元を持つらしい。決め打ちのストローク幅 画面の大きさのstrokeRatio分の一の幅にするという意味ですね。
	// Cesiumの線幅定義がいつの間にか変化しえらく太く描画される・・よくわからなくなってきた・・・2018/7/25
	
	var layerNumb={};
	var layerCount = 0;
	for (var subLayerId in js) {
		
		var mainValueMin,mainValueMax;
		
		if ( js[subLayerId].layerProps ){
			mainValueMin = js[js[subLayerId].layerProps.svgImageProps.rootLayer].mainValueMin;
			mainValueMax = js[js[subLayerId].layerProps.svgImageProps.rootLayer].mainValueMax;
		}
		
		var geoms= js[subLayerId];
		var layerId = "root";
		var layerName = "root";
		if ( geoms.layerProps ){
			layerId = geoms.layerProps.id; // 異なるレイヤ(サブレイヤとかタイルではなくルートのレイヤ)ごとに色を変える。 2018.2.16
			layerName = geoms.layerProps.title;
		}
		
		var colorNumber = -1;
		
		if ( geoms.length > 0 ){ // 色をレイヤごとに変化させる機能
			if ( layerNumb[layerId] !== undefined ){
				colorNumber=layerNumb[layerId];
			} else {
				layerNumb[layerId] = layerCount;
				++ layerCount;
				if ( layerCount > 13 ){
					layerCount = 0;
				}
			}
			colorNumber=layerNumb[layerId];
		}
		
		
		if ( geoms.length > 0 ){
			for ( var i = 0 ; i < geoms.length ; i++ ){
				if ( geoms[i].type !== "Coverage"){
					var pTitle=i+":"+layerName;
	//				console.log(geoms[i].src.getAttribute("xlink:title"));
					if ( geoms[i].src && geoms[i].src.getAttribute("xlink:title")){
						pTitle = geoms[i].src.getAttribute("xlink:title") + "/"+layerName;
					}
					var feature = new Object();
					feature.type = "Feature";
					feature.properties = {
						"title": pTitle,
						"marker-symbol": pTitle.substring(0,1),
						"marker-color": pColor[colorNumber]
					};
					feature.geometry = geoms[i];
					if ( geoms[i].mainValue != undefined && geoms[i].type == "Point"){
						var normalizedValue = (geoms[i].mainValue - mainValueMin)/(mainValueMax-mainValueMin);
//						console.log("calling setBox: geom:",geoms[i],"   mainVal(N):", normalizedValue, "   mainVal:",geoms[i].mainValue,"   min,max:",mainValueMin,mainValueMax);
						setBox(geoms[i].coordinates[0],geoms[i].coordinates[1],pTitle, sw * relBarTickness, sw * (normalizedValue+0.01) * relBarTickness * relBarFullRange ); // 0.01は0になると柱が消えちゃうので、1%程度サバ読み
					} else {
						geoJSinstance.features.push(feature);
					}
				} else {
					// ビットイメージはcesium内蔵のgeojson描画ではない専用実装で描画する
					if ( geoms.layerProps.groupName != "basemap" && geoms.layerProps.groupName != "背景地図"){ // この部分　ちょっと決めうち気味・・
						setCoverage2Imagery(geoms[i]);
					} else {
//						console.log("Skip basemap:",geoms[i].href);
					}
				}
			}
		}
	}

	
	console.log("geojs:",geoJSinstance , "   rect:",rect,"   sw:",sw);
	
	if ( rect ){
		addGeoJsonObj(geoJSinstance,true,sw);
	} else {
		addGeoJsonObj(geoJSinstance,true);
	}
	
	if ( rect ){
		// x:geoViewBox.x , y:geoViewBox.y , width:geoViewBox.width, height:geoViewBox.height, cx: geoViewBox.x + 0.5*geoViewBox.width, cy:geoViewBox.y + 0.5*geoViewBox.height
		
		flyToRectangle(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height , true );
//		flyToRectangle(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height , false );
	}
}

var coverageImageries=[];


function setCoverage2Imagery(geom){
//	console.log("Coverage is rendered by special inplemantaion  :", geom.coordinates[0].lng , geom.coordinates[0].lat, geom.coordinates[1].lng , geom.coordinates[1].lat, geom.href);
	
	var imageUrl = geom.href;
	if ( imageUrl.indexOf("http") == 0){
		if (isDirefcURL(imageUrl)){
			// Do nothing (Direct Connection)
		} else {
			imageUrl = getProxyUrl(encodeURIComponent(imageUrl));
			console.log("via proxy url:",imageUrl);
		}
	} else {
		imageUrl = reldir2imageUrl+imageUrl;
	}
	
	console.log("imageUrl:",imageUrl);
	
//	console.log("geom rect:",geom.coordinates[0].lng , geom.coordinates[0].lat, geom.coordinates[1].lng , geom.coordinates[1].lat);
	var coverageImagery = viewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
//		url : "test-signal2.jpg",
		url : imageUrl,
		rectangle : Cesium.Rectangle.fromDegrees(geom.coordinates[0].lng , geom.coordinates[0].lat, geom.coordinates[1].lng , geom.coordinates[1].lat)
	}));
	
	coverageImagery.alpha = 0.5;
	coverageImageries.push(coverageImagery);
	
}

function isDirefcURL(url){
	// urlに、directURLlistが含まれていたら、true　含まれていなかったらfalse
	var ans = false;
	for ( var i = 0 ; i < directURLlist.length ; i++ ){
		if ( url.indexOf(directURLlist[i])>=0){
			ans = true;
			break;
		}
	}
	return ( ans );
}

function clearCoverageImageries(){
	for ( var i = 0 ; i < coverageImageries.length ; i++ ){
		console.log("should be removed:",coverageImageries[i]);
		viewer.imageryLayers.remove(coverageImageries[i], true);
	}
	coverageImageries = [];
}

function getProxyUrl( url ){
	return ( cesiumProxyURL + url );
}

function addCyberJapan(){
	var imageProvider = new Cesium.UrlTemplateImageryProvider({
		url:'//cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
		maximumLevel:18
	});
	var current_image = viewer.scene.imageryLayers.addImageryProvider(imageProvider);
}	

var clampToGround = true;

//	var fillColor = Cesium.Color.PINK.withAlpha(0.5);

function addGeoJsonObj(geoJSinstance, doClear, swidth){
	var sw = 20;
	if ( swidth ){
		sw = swidth;
	}
	console.log( "called addGeoJsonObj : coverageImageries",coverageImageries);
	if ( doClear ){
		viewer.dataSources.removeAll();
	}
	console.log("geoJson:",JSON.stringify(geoJSinstance));
	viewer.dataSources.add(Cesium.GeoJsonDataSource.load(geoJSinstance, { 
		stroke: Cesium.Color.HOTPINK.withAlpha(0.6), 
		fill: Cesium.Color.PINK.withAlpha(0.35), 
		strokeWidth: sw/4,  // 2018.7.25 cesiumのstrokeWidth定義が変化した？　えらく太くなるので４分の１にしてみる・・・nonScalingになった？
		markerSymbol: '?',
		clampToGround : clampToGround
	}));
}	


function testAdd(){
	console.log("testAdd");
	// https://cesiumjs.org/Cesium/Build/Documentation/Entity.html
	var rect = viewer.entities.add({
		name: "rect",
		polygon:{
			hierarchy: Cesium.Cartesian3.fromDegreesArray([
				139.67760,35.66102,
				139.67860,35.66102,
				139.67860,35.67102,
				139.67760,35.67102]),
			material: Cesium.Color.RED.withAlpha(0.5)
		}
	});
	
	var blueBox = viewer.entities.add({
		name : 'Blue box',
		position: Cesium.Cartesian3.fromDegrees (139.67760, 35.66102, 0),
		box : {
			dimensions : new Cesium.Cartesian3(10.0, 10.0, 10.0),
			material : Cesium.Color.BLUE.withAlpha(0.5),
		} 
	});
	
	
	
//	viewer.zoomTo(blueBox); 
	
	viewer.zoomTo(blueBox); 
}


function sampleTerrainWrapperC(){

	var sampleTerrainWrapperCBF;
	var sampleTerrainWrapperProgressF;
	var sampleTerrainWrapperTerrainProvider;
	var subCount = 10;
	var answerPositions;
	var completedCount;
	var inputPositions;

	function sampleTerrainWrapper(terrainProvider, positions, callBackFunc,progressFunc){
		answerPositions = [];
		completedCount = 0;
		inputPositions = positions;
		sampleTerrainWrapperTerrainProvider = terrainProvider;
		sampleTerrainWrapperCBF = callBackFunc;
		sampleTerrainWrapperProgressF = progressFunc;
		sampleSubTerrain();
	}

	function sampleSubTerrain(){
		// どうも大量に問い合わせをするとスロットルリクエストタイプの地理院地形データで問い合わせをあきらめられてしまうので、１０件づつ問い合わせを徐々にするようにしてみる
		console.log("called sampleSubTerrain:",completedCount);
		var subPositions = inputPositions.slice(completedCount, completedCount+subCount);
		Cesium.sampleTerrainMostDetailed(sampleTerrainWrapperTerrainProvider, subPositions).then(
//		Cesium.sampleTerrain(sampleTerrainWrapperTerrainProvider,9, subPositions).then(
			function(resolvedSubPositions){
				console.log("sampleTerrainMostDetailed SUB:",resolvedSubPositions);
				completedCount += subCount;
				answerPositions = answerPositions.concat(resolvedSubPositions);
				console.log( completedCount, inputPositions.length );
				if ( completedCount < inputPositions.length ){
					sampleTerrainWrapperProgressF( completedCount / inputPositions.length );
					sampleSubTerrain();
				} else {
					sampleTerrainWrapperCBF(answerPositions);
				}
			}
		);
	}
	
	return {
		sampleTerrainWrapper: sampleTerrainWrapper
	}
	
}

