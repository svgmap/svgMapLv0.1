// Description:
// SVGMapLv0.1_CesiumWrapper_r3.js: SVGMap 3D Visualizer using CesiumJS
// Extension for 3D visualization of display content in svgMap_lv0.1*.js with CesiumJS.
//
//  Programmed by Satoru Takagi
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
// History:
// 2018/02/08 Start coding
// 2018/02/16 レイヤによって色を変化させる
// 2018/02/28 Rev2: POIのバーグラフ化、ビットイメージレイヤー
// 2018/06/25 Rev3: クロージャ化 , 名称変更: svgMapCesiumWrapper
//
// ToDo,ISSUES:
// 伸縮スクロールに対する同期表示
// cesium上でクリックしたオブジェクトのプロパティをSVGMap.js側のUIで表示
// 棒グラフ以外の表現
//

( function ( window , undefined ) { 
var document = window.document;
var navigator = window.navigator;
var location = window.location;

var svgMapCesiumWrapper = ( function(){ 

var svg2cesiumBtn1style,svg2cesiumBtn2style,btnDivStyle; // ボタンのスタイルを変えたい人は、この変数にスタイル文字列設定する


addEventListener("load",function(){
	buildUI();
});

var cesiumWindow;


var cesiumWindowHtmlLocation;

function testJsonData(json){ // 試験用　使ってない
	console.log("captured Json Data:",json);
}


function openCesium(callBackFunc){ // cesiumのオブジェクトが構築されるのを待ちつつcesiumのwindowをオープンする。 cbfがある場合は、cesiumWindowが準備されたらそれを実行する
	if ( !cesiumWindowHtmlLocation ){
		cesiumWindowHtmlLocation = 'cesiumWindow2.html';
	}
	
	console.log("openCesium:");
	
	if ( cesiumWindow ){
		if ( cesiumWindow.closed ){
			cesiumWindow = null;
			delete cesiumWindow;
			openCesium(callBackFunc);
//			setTimeout( openCesium, 100);
		}
	} else {
		cesiumWindow = window.open(cesiumWindowHtmlLocation,'sub','width=800,height=600');
	}
	
	if ( callBackFunc ){
		waitBuildCesiumAndCall(callBackFunc);
	}
	
}

function waitBuildCesiumAndCall(callBackFunc){
	if ( cesiumWindow && cesiumWindow.viewGeoJson ){
		setTimeout(callBackFunc,200);
	} else {
		setTimeout(function(){ waitBuildCesiumAndCall(callBackFunc)},200);
	}
}


function getGeoJson(complex){ // 3D可視化ボタンを押したときに最初に呼び出される関数 complex:POIのバーグラフ化を行う
	if(btnDiv & icon3d){
		hide3dViewBtns();
	}
	svgMap.captureGISgeometriesOption(true); // Coverage (ビットイメージ)もキャプチャするフラグを立てる
	console.log("getGeoJson  is cesiumWindow?:", cesiumWindow , "   is complex:",complex);
	if ( complex == "true" ){
		svgMap.captureGISgeometries(jsonPropComp);
	} else {
		openCesium();
		svgMap.captureGISgeometries(jsonProp);
	}
}

function jsonProp(json){ // SVGMapフレームワークでキャプチャしたgeomrtryデータに対しメタデータを補てんする
	var rootLayerProps = svgMap.getRootLayersProps();
	var svgImagesProps = svgMap.getSvgImagesProps();
	for ( var svgImageId in json ){
		var imageProp = svgImagesProps[svgImageId];
		var rootLayerId = imageProp.rootLayer;
//		console.log(svgImageId," : rootLayerId:" , rootLayerId , "  rootLayerProps:" , rootLayerProps[rootLayerId] );
		json[svgImageId].layerProps = rootLayerProps[rootLayerId];
	}
	jsonCapture(json);
}


function jsonPropComp(json){ // POIのバーグラフ構築に必要なだけのメタデータを補てんする UI付きの処理
	console.log( "called jsonPropComp : json:",json);
	var rootLayerProps = svgMap.getRootLayersProps();
	var svgImagesProps = svgMap.getSvgImagesProps();
	console.log( "svgImagesProps:",svgImagesProps);
	
	var jLayers=[];
	for ( var svgImageId in json ){
		var imageProp = svgImagesProps[svgImageId];
		var rootLayerId = imageProp.rootLayer;
//		console.log(svgImageId," : rootLayerId:" , rootLayerId , "  rootLayerProps:" , rootLayerProps[rootLayerId] );
		json[svgImageId].layerProps = rootLayerProps[rootLayerId];
//		console.log("svgImageProp:",imageProp , "   layerProp:",rootLayerProps[rootLayerId], "    js0:",json[svgImageId][0]);
		if (rootLayerId && json[svgImageId][0] && json[svgImageId][0].type=="Point"){
				jLayers[rootLayerId]={title:rootLayerProps[rootLayerId].title, metaSchema:(imageProp.metaSchema).split(",")};
			
//			console.log("metaSchema:",imageProp.metaSchema)
			
		}
	}
	
	
	//この辺からUIを生成している
	console.log("jLayers:",jLayers);
	var propDiv = document.getElementById("svg2cesiumProp");
	
	removeChildren(propDiv);
	
	propDiv.style.display="";
	
	var comSpan = document.createElement("span");
	comSpan.innerHTML="Select property of layers which you want to visualize as bar graphs.<br>Note: If you select string property then value should be the length of string....";
	propDiv.appendChild(comSpan);
	
	var cTbl = document.createElement("table");
	cTbl.id="extentTable";
	cTbl.border=1;
	var tr = document.createElement("tr");
	tr.innerHTML = "<th>LayerName</th><th>targetProp</th><th>min</th><th>max</th>";
	cTbl.appendChild(tr);
	
	for ( var lId in jLayers){
		tr = document.createElement("tr");
		var td = document.createElement("td");
		td.innerHTML=jLayers[lId].title;
		tr.appendChild(td);
		
		td = document.createElement("td");
		var sel = document.createElement("select");
		sel.onchange=function(event){calcExtent(event,json)}; // この関数を呼ぶことで、選択したプロパティの値域が算出される
		sel.id="sel_"+lId;
		var opt = document.createElement("option");
		opt.value="-";
		opt.innerHTML = "-";
		opt.selected=true;
		sel.appendChild(opt);
		for ( var i = 0 ; i < jLayers[lId].metaSchema.length ; i++ ){
			opt = document.createElement("option");
			opt.value=jLayers[lId].metaSchema[i];
			opt.innerHTML=jLayers[lId].metaSchema[i];
			sel.appendChild(opt);
		}
		td.appendChild(sel);
		tr.appendChild(td);
		
		var td = document.createElement("td");
		td.innerHTML="<input type='text' id='min_" + lId + "'  readonly>";
		tr.appendChild(td);
		var td = document.createElement("td");
		td.innerHTML="<input type='text' id='max_" + lId + "'  readonly>";
		tr.appendChild(td);
		
		cTbl.appendChild(tr);
		
	}
	
	propDiv.appendChild(cTbl);
	
	var btn = document.createElement("input");
	btn.type="button";
	btn.value="view";
	btn.onclick=function(event){jsonPropCompPh2(json);} // このボタンを押すことでCESIUMへデータが渡される
	propDiv.appendChild(btn);
	
	var cancelBtn = document.createElement("input");
	cancelBtn.type="button";
	cancelBtn.value="cancel";
	cancelBtn.onclick=function(event){
		var propDiv = document.getElementById("svg2cesiumProp");
		propDiv.style.display="none";
	}
	propDiv.appendChild(cancelBtn);
	
	
}


// POIのバーグラフ化がなされた3D地図画面を起動する
function jsonPropCompPh2(json){
	
	// 手で入力しなおしてる値を投入する実装のやっている途中・・・ 2018.3.16
	var tbl = document.getElementById("extentTable");
	for ( var i = 0 ; i < tbl.rows.length ; i++ ){
		for ( var j = 0 ; j < tbl.rows[i].cells.length ; j++ ){
			var cel = tbl.rows[i].cells[j];
			console.log(cel);
		}
	}
	
	
	openCesium();
	console.log("jsonPropCompPh2:",json);
	jsonCapture(json);
	
	
	
	
	var propDiv = document.getElementById("svg2cesiumProp");
	propDiv.style.display="none";
}

// 選択したプロパティの値域算出
function calcExtent(event,json){
	var targetId= (event.target.id).substring(4);
	var sIndex= event.target.selectedIndex - 1;
//	console.log("called calcExtent:",event, "  tId:",targetId, " sIndex:",sIndex,"   json:",json);
	
	
	var valMin = 9e99;
	var valMax = -9e99;
	for ( var lid in json){
//		console.log("json[lid].layerProps:",json[lid]);
		if ( json[lid].layerProps && json[lid].layerProps.svgImageProps.rootLayer == targetId ){
//			console.log("target found");
			for ( var i = 0 ; i < json[lid].length ; i++ ){
				if ( sIndex <0 ){
					delete json[lid][i].mainValue;
				} else {
					if ( json[lid][i].type=="Point"  ){
						try{
//							console.log("poi:",json[lid][i]);
							var meta="";
							if ( json[lid][i].usedParent && json[lid][i].usedParent.getAttribute("content") ){
								meta = json[lid][i].usedParent.getAttribute("content").split(",")[sIndex];
							} else { 
								meta = json[lid][i].src.getAttribute("content").split(",")[sIndex];
							}
//							console.log("meta:",meta, "   numb of meta:", Number(meta));
							var numMeta = Number(meta);
							if ( isNaN(numMeta) ){
								numMeta = meta.length; // 文字列の長さ・・・・　うわぁ
								valMin = Math.min( valMin , numMeta);
								valMax = Math.max( valMax , numMeta);
							} else {
								valMin = Math.min( valMin , numMeta);
								valMax = Math.max( valMax , numMeta);
							}
							json[lid][i].mainValue = numMeta;
						}catch(e){
							// do nothing
						}
					}
				}
			}
		}
	}
	if ( sIndex < 0 ){
		document.getElementById("min_"+targetId).value="";
		document.getElementById("max_"+targetId).value="";
		delete json[targetId].mainValueMin;
		delete json[targetId].mainValueMax;
	} else {
		document.getElementById("min_"+targetId).value=valMin;
		document.getElementById("max_"+targetId).value=valMax;
		json[targetId].mainValueMin = valMin;
		json[targetId].mainValueMax = valMax;
		console.log( "min,max,id",valMin,valMax,targetId);
	}
}


// CESIUM画面の生成を待って、CESIUMにgeometryデータを送信、描画を指示する
var cesiumW;
function jsonCapture(json){
	var viewBox = svgMap.getGeoViewBox();
	console.log("jsonCapture:",json);
//	console.log("cesiumWindow:",cesiumWindow, cesiumWindow.viewGeoJson);
	if ( cesiumWindow && cesiumWindow.viewGeoJson ){
		console.log("launch cesiumWindow : json: ",json);
		setTimeout(function(){ cesiumWindow.viewGeoJson(json,viewBox);},200);
	} else {
		console.log("wait building cesiumWindow");
		setTimeout(function(){ jsonCapture(json)},200);
	}
}

function testTransform(){ // 試験用　使ってない
	cesiumWindow.testData="TESTDATA FROM SVGMAP";
	console.log("cesiumWindow:",cesiumWindow);

}


function removeChildren( targetElem ){
	for (var i =targetElem.childNodes.length-1; i>=0; i--) {
		targetElem.removeChild(targetElem.childNodes[i]);
	}

}


function show3dViewBtns(){
	btnDiv.style.display="";
}
function hide3dViewBtns(){
	btnDiv.style.display="none";
}


var btnDiv, icon3d;
function buildUI(){ // CESIUM起動用のボタンやパラメータ設定用UIの土台を設置する loadで起動
	
	var icon3d = document.getElementById("3DviewButton");
	if ( icon3d ){
		if ( !icon3d.title ){
			icon3d.title="View 3D Map";
		}
		var iconTop = icon3d.style.top;
//		icon3d.setAttribute("onclick","show3dViewBtns()");
		icon3d.onclick=show3dViewBtns;
		svg2cesiumBtn1style = "left :0px; top:0px; position: relative";
		svg2cesiumBtn2style = "left :0px; top:0px; position: relative";
		btnDivStyle = "left:2px;top:" + iconTop + "; position:absolute;display:none;z-index:1000;background-color : #AAEEDD";
	} else {
		btnDivStyle = "right:2px;top:145px; position:absolute;width:140px;";
	}
	
	if ( !svg2cesiumBtn1style ){
		svg2cesiumBtn1style = "right :0px; top: 0px; position: relative";
	}
	if ( !svg2cesiumBtn2style ){
		svg2cesiumBtn2style = "right :0px; top: 0px; position: relative";
	}
	
	// 2個の3Dボタンを入れるdiv
	btnDiv = document.createElement("div");
	btnDiv.id="3dViewBtns";
	btnDiv.setAttribute("style",btnDivStyle);
	
	// シンプルな3D化ボタン
	console.log("buildUI : style1,2:",svg2cesiumBtn1style,svg2cesiumBtn2style);
	var cButton1 = document.createElement("input");
	cButton1.id="svg2cesiumBtn1";
	cButton1.type="button";
	cButton1.value="Simple 3D view";
	cButton1.onclick=getGeoJson;
	cButton1.setAttribute("style",svg2cesiumBtn1style);
	
	// POIのバーグラフ生成を行う3D化ボタン
	var cButton2 = document.createElement("input");
	cButton2.id="svg2cesiumBtn2";
	cButton2.type="button";
	cButton2.value="Complex 3D view";
	cButton2.onclick=function(){getGeoJson('true');}
	cButton2.setAttribute("style",svg2cesiumBtn2style);
	
	//
	var xBtn = document.createElement("input");
	xBtn.onclick=hide3dViewBtns;
	xBtn.type="button";
	xBtn.value="x";
	
	btnDiv.appendChild(cButton1);
	btnDiv.appendChild(cButton2);
	if ( icon3d ){
		btnDiv.appendChild(xBtn);
	}
	
	
	// POIのバーグラフ生成のためのパラメータ設定UI用のDIV
	var cpDiv = document.createElement("div");
	cpDiv.id="svg2cesiumProp";
	cpDiv.setAttribute("style","left :80px; top: 80px; position: absolute; background-color: white;opacity:0.8;display:none;z-index:1000");
	
	document.body.appendChild(btnDiv);
	document.body.appendChild(cpDiv);
}


return { // svgMapCesiumWrapper. で公開する関数のリスト
	/**
	editPoint: editPoint,
	initPOItools: initPOItools,
	initPOIregistTool: initPOIregistTool,
	initPolygonTools: initPolygonTools,
	setTargetObject: setTargetObject,
	isEditingGraphicsElement: isEditingGraphicsElement
	**/
	openCesium: openCesium,
	visualizeCurrentSvgMap: getGeoJson,
	getCesiumWindow : function (){
		return ( cesiumWindow );
	},
	setCesiumWindowHtmlLocation : function( path ){
		cesiumWindowHtmlLocation = path;
		console.log("cesiumWindowHtmlLocation:",cesiumWindowHtmlLocation);
	}
}
})();

window.svgMapCesiumWrapper = svgMapCesiumWrapper;


})( window );

