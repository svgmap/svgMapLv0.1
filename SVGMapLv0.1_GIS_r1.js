// 
// Description:
// SVGMap GIS Module for >rev13 of SVGMap Lv0.1 framework
// Programmed by Satoru Takagi
// 
//  Programmed by Satoru Takagi
//  
//  Copyright (C) 2016-2016 by Satoru Takagi @ KDDI CORPORATION
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
// 2016.12.02 コアにGeoJSONパース機能実装、それを用いたPolygon内のPoitns包含チェック初期実装
// 2016.12.07 JSTS implementation
// 2016.12.16 Totally Asynchronus Proecssing　ほぼ満足する機能が入ったと思われる。＞初期リリースとする
// 2017.06.12 Geojsonの並びが逆(基本フレームワークも)だったのを修正のうえ、こちらも修正(getSVGcoord)、drawGeoJson(geoJson->SVG変換の上描画)の完成度を高め公開関数へ
// 2018.01.04 Geojsonファイル内にプロパティが含まれている場合、埋め込むよう実装
//
// 
// ACTIONS:
// ・ポリゴン包含、ポリラインクロス等の基本関数(jtsのような)
// ・ポイント（マウスポインタ―）と、ポイント、ポリライン、ポリゴンヒットテスト（既存のクリッカブルオブジェクト同等動作）：　ただし、ポイント、ポリラインはバッファが必要なので後回しか？
// ・ラインと、ライン、ポリゴンのヒットテスト
// ・ポリゴンと、ポイント、ライン、ポリゴンのヒットテスト
//
// ・入力：
// 　・マウスポインタ―ベースの対話的に生成されたオブジェクトと指定したレイヤー
// 　　⇒　マウスポインタ―によるポイント、ライン、ポリゴンの生成ＵＩ
// 　　⇒　結果的にインタラクティブなオーサリングシステム
// 　・指定したレイヤー１と、指定したレイヤー２（および　指定したSVG文書１とSVG文書２）
// ・出力：対象レイヤーのスタイル変更、新規レイヤー生成

( function ( window , undefined ) { 
var document = window.document;
var navigator = window.navigator;
var location = window.location;


var svgMapGIStool = ( function(){ 

//	console.log("Hello this is svgMapGIStool");
	
	if ( jsts ){ // using jsts (JTS javascript edition)
//		console.log("This apps has jsts (JavaScript Topology Suites)");
		this.featureReader = new jsts.io.GeoJSONReader();
		this.featureWriter = new jsts.io.GeoJSONWriter();
		this.getFeature = function( geojs ){
			if ( geojs.type=="MultiLineString"){
				for ( var i = geojs.coordinates.length-1 ; i >= 0 ; i-- ){
					if ( geojs.coordinates[i].length <2 ){
						geojs.coordinates.splice(i,1);
					}
				}
			} else if ( geojs.type=="Polygon"){
				for ( var i = geojs.coordinates.length-1 ; i >= 0 ; i-- ){
					if ( geojs.coordinates[i].length <3 ){
						geojs.coordinates.splice(i,1);
					}
				}
			}
			return (featureReader.read(geojs));
		}
		this.getGeoJson = function( feature ){
			return (featureWriter.write(feature));
		}
	}
	
//	console.log(featureReader, featureWriter, getFeature, getGeoJson);
	
	// http://stackoverflow.com/questions/22521982/js-check-if-point-inside-a-polygon
	function inside(point, vs) {
	    // ray-casting algorithm based on
	    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

	    var x = point[0], y = point[1];

	    var inside = false;
	    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
	        var xi = vs[i][0], yi = vs[i][1];
	        var xj = vs[j][0], yj = vs[j][1];

	        var intersect = ((yi > y) != (yj > y))
	            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	        if (intersect) inside = !inside;
	    }
		
	    return inside;
	};
	
	// サブパス(ドーナツ)がある場合がある"ポリゴン"に対する内包判定
	function insidePolygon( point , polygon ){
		var ans = inside ( point , polygon[0] );
		
		if ( ans && polygon.length > 1 ){
			for ( var i = 1 ; i < polygon.length ; i++ ){
				if ( inside( point , polygon[i] ) ){
					ans = false;
					break;
				}
			}
		}
		
//		console.log( ans );
		return ( ans );
	}
	
	
	//http://kone.vis.ne.jp/diary/diaryb09.html
	
	
	// 線分abと、線分cdが交錯しているかどうかの判定。
	// http://qiita.com/ykob/items/ab7f30c43a0ed52d16f2
	function isIentersected(ax, ay, bx, by, cx, cy, dx, dy) {
		var ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
		var tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
		var tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
		var td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);
		return tc * td < 0 && ta * tb < 0;
	};
	
	// https://github.com/bjornharrtell/jsts
	// http://stackoverflow.com/questions/27683931/mongodb-geospatial-intersection-of-two-polygon
	// http://qiita.com/amay077/items/7a99df1c0da881cc47f6
	// https://github.com/mapbox/lineclip
	// https://github.com/mapbox/concaveman
	// https://github.com/mapbox/geojson-extent
	// https://github.com/mapbox/linematch
	// clip https://github.com/mapbox/lineclip
	
	// Javascript Clipper
	// https://sourceforge.net/projects/jsclipper/

	// weiler-athertonアルゴリズム 
	// https://github.com/morganherlocker/weiler-atherton
	
	
	
	// poiID（およびその子供の文書）が、
	function getIncludedPoints(poiID, polyID, cbFunc, param , progrssCallback , inverse ){
		var superParam = {
			pointsDocTreeID: poiID,
			polygonsDocTreeID: polyID,
			cbFunc: cbFunc,
			param: param,
			progrssCallback: progrssCallback,
			inverse: inverse
		}
		var pointsDocTreeID = poiID;
		var polygonsDocTreeID = polyID;
		console.log( "called getIncludedPoints:", pointsDocTreeID, polygonsDocTreeID);
//		svgMap.captureGISgeometries(getIncludedPointsS2 , superParam );
		svgMap.captureGISgeometries(getIncludedPointsS2a , superParam );
	}
	
	function getExcludedPoints(poiID, polyID, cbFunc, param , progrssCallback ){
		getIncludedPoints(poiID, polyID, cbFunc, param , progrssCallback , true);
	}
	
	
	// PolygonやMultiLineStringの中心(実際はbboxの中心)をPointと見做すための処理
	function getCenterPoint( coordinates ){
		var minX=60000,minY=60000,maxX=-60000,maxY=-60000;
		for ( var i = 0 ; i < coordinates.length ; i++ ){
			for ( var j = 0 ; j < coordinates[i].length ; j++ ){
				if (coordinates[i][j][0] < minX ){
					minX = coordinates[i][j][0];
				}
				if ( coordinates[i][j][0] > maxX ){
					maxX = coordinates[i][j][0];
				}
				if (coordinates[i][j][1] < minY ){
					minY = coordinates[i][j][1];
				}
				if ( coordinates[i][j][1] > maxY ){
					maxY = coordinates[i][j][1];
				}
			}
		}
		var cx = (minX + maxX )/ 2;
		var cy = (minY + maxY )/ 2;
		return [cx,cy];
	}
	
	function getIncludedPointsS2( geom , superParam ){
		
		// extract from superParams
		var pointsDocTreeID = superParam.pointsDocTreeID;
		var polygonsDocTreeID = superParam.polygonsDocTreeID;
		var cbFunc = superParam.cbFunc;
		var param = superParam.param;
		var progrssCallback = superParam.progrssCallback;
		var inverse = superParam.inverse;
		
		console.log("Searched geom:",geom);
		if ( inverse && inverse == true ){
		} else {
			inverse = false;
		}
		
		var cdi = getChildDocsId(pointsDocTreeID,polygonsDocTreeID)
		var pointsDocTreeIDs = cdi.childrenId1;
		var polygonsDocTreeIDs = cdi.childrenId2;
		var totalPoiCount = 0;
		var ansPois = new Array();
		for ( var poiDocC = 0 ; poiDocC < pointsDocTreeIDs.length ; poiDocC++ ){
		
	//		console.log("searchedGeom:",geom, "   inverse?:",inverse);
			if ( geom[pointsDocTreeIDs[poiDocC]]  ){
				var inclPi = [];
				
				var poiDoc = geom[pointsDocTreeIDs[poiDocC]];
				
				console.log("poi:",poiDoc);
				
				totalPoiCount +=  poiDoc.length;
				for ( var pic = 0 ; pic < poiDoc.length ; pic++ ){
					var point;
					if ( poiDoc[pic].type === "Point" ){
						point = poiDoc[pic].coordinates;
					} else if (poiDoc[pic].type === "Polygon" || poiDoc[pic].type === "MultiLineString"){
						console.log(poiDoc[pic]);
						point = getCenterPoint(poiDoc[pic].coordinates);
					} else {
						continue;
					}
						
					loop: for ( var polDocC = 0 ; polDocC < polygonsDocTreeIDs.length ; polDocC++ ){
						
						if ( geom[polygonsDocTreeIDs[polDocC]] ){
							var polDoc = geom[polygonsDocTreeIDs[polDocC]];
							
							console.log("pol:",polDoc);
							
							for ( var plc = 0 ; plc < polDoc.length ; plc ++ ){
								if ( polDoc[plc].type != "Polygon" ){
									continue;
								}
								polygon = polDoc[plc].coordinates;
								if ( !inverse ){ // 内包判定
									if ( insidePolygon( point , polygon ) ){
										// 一個でも内包してたらそれで内包判断完了
										ansPois.push(poiDoc[pic]);
										break loop;
									}
								} else { // 非内包判定
									if ( insidePolygon( point , polygon ) ){
										break loop; // 一個でも内包してたらそれでアウト
									} else if ( plc == polDoc.length - 1 ){
										// 最後まで検索できていて内包してなければOK
										ansPois.push(poiDoc[pic]);
									}
								}
							}
						}
					}
				}
			}
		}
		cbFunc(ansPois , totalPoiCount , param ); // 検索したPOIを全部Arrayとして返す。一個パラメータを渡せる
	}
	
	// 重くなることがあるので、非同期処理版を作る・・・
	function getIncludedPointsS2a( geom , superParam ){
		console.log("getIncludedPointsS2a called : ",geom);
//		var cdi = getChildDocsId(superParam.pointsDocTreeID, superParam.polygonsDocTreeID)
		var pointsDocTreeIDs = getChildDocsId(superParam.pointsDocTreeID);
		superParam.pointsDocTreeIDs = pointsDocTreeIDs;
		var polygonsDocTreeIDs = getChildDocsId(superParam.polygonsDocTreeID);
		superParam.polygonsDocTreeIDs = polygonsDocTreeIDs;
		var totalPoiCount = 0;
		var ansPois = new Array();
		
		var compArray = [];
		for ( var poiDocC = 0 ; poiDocC < pointsDocTreeIDs.length ; poiDocC++ ){
			if ( geom[pointsDocTreeIDs[poiDocC]]  ){
				var poiDoc = geom[pointsDocTreeIDs[poiDocC]];
				totalPoiCount +=  poiDoc.length;
				for ( var pic = 0 ; pic < poiDoc.length ; pic++ ){
					for ( polDocC = 0 ; polDocC < polygonsDocTreeIDs.length ; polDocC++ ){ // Loop:seki point
						if ( geom[polygonsDocTreeIDs[polDocC]] ){
							var polDoc = geom[polygonsDocTreeIDs[polDocC]];
//							console.log("polDoc:",polDoc);
							for ( plc = 0 ; plc < polDoc.length ; plc ++ ){
								compArray.push([poiDocC,pic,polDocC,plc]);
							}
						}
					}
				}
			}
		}
		superParam.totalPoiCount = totalPoiCount;
		
		console.log("call getIncludedPointsS3 :" , compArray);
		getIncludedPointsS3( geom, superParam , compArray);
	}
	
	function getIncludedPointsS3( geom , superParam , compArray , counter , startTime , ansPois ){
		
		
		if ( ! counter ){
			startTime = new Date().getTime();
			ansPois = [];
			counter = 0;
		}
		while ( counter < compArray.length && halt == false){
			
//			console.log("counter:",counter);
			//
			var poiDocC = compArray[counter][0];
			
			var poiDoc = geom[superParam.pointsDocTreeIDs[poiDocC]];
			
			
			//
			var pic = compArray[counter][1];
			
			var point;
			if ( poiDoc[pic].type === "Point" ){
				point = poiDoc[pic].coordinates;
			} else if (poiDoc[pic].type === "Polygon" || poiDoc[pic].type === "MultiLineString"){
//				console.log(poiDoc[pic]);
				point = getCenterPoint(poiDoc[pic].coordinates);
			} else {
				counter = skipPOIcounter(compArray, counter) ;  // picを一個増加させる・スキップさせる処理
				// これはまずいのではないか？　結局nullのpointで、下を回してしまうような気がする。
				// ので以下の処理を入れてみたが・・・バグ出るかも 2016.12.28
				++ counter;
				continue;
			}
			
			//
			var polDocC = compArray[counter][2];
			
			var polDoc = geom[superParam.polygonsDocTreeIDs[polDocC]];
			
			//
			var plc = compArray[counter][3];
			
			if ( polDoc[plc].type != "Polygon" ){
				// 2016/12/28 debug 結構残念なバグ・・
				if ( superParam.inverse && plc == polDoc.length - 1 ){
					ansPois.push(poiDoc[pic]);
				}
				++ counter;
				continue;
			}
			polygon = polDoc[plc].coordinates;
			if ( !superParam.inverse ){ // 内包判定
				if ( insidePolygon( point , polygon ) ){
					// 一個でも内包してたらそれで内包判断完了
					ansPois.push(poiDoc[pic]);
					console.log("PUSH");
					counter = skipPOIcounter(compArray, counter);
				}
			} else { // 非内包判定
				if ( insidePolygon( point , polygon ) ){
					counter = skipPOIcounter(compArray, counter); // 一個でも内包してたらそれでアウト picを一個増加させる
				} else if ( plc == polDoc.length - 1 ){
					// 最後まで検索できていて内包してなければOK
					console.log("PUSH");
					ansPois.push(poiDoc[pic]);
				}
			}
			//
			
//			console.log("step:",counter,"  comp end");
			
			var currentTime =  new Date().getTime();
			++ counter;
			if ( currentTime - startTime > 500 ){ // 0.3秒以上たったらちょっと(30ms)休憩
				console.log( "call laze compu",counter, compArray.length , Math.ceil(counter /  compArray.length));
				if ( superParam.progrssCallback ){
					superParam.progrssCallback( Math.ceil(1000 * counter /  compArray.length) / 10 );
				}
				startTime = new Date().getTime();
				setTimeout(getIncludedPointsS3, 30 , geom, superParam, compArray , counter , startTime , ansPois);
				break;
			}
		}
		halt = false;
		if ( counter == compArray.length ) {
			if ( superParam.progrssCallback ){
				superParam.progrssCallback( 100 );
			}
			console.log("Completed!",ansPois );
			
			superParam.cbFunc(ansPois , superParam.totalPoiCount , superParam.param );
			
		}
	}
	
	// getIncludedPointsS3における、そのPOIに対する評価のためのcompArrayカウンター分をスキップするカウンター値生成
	function skipPOIcounter(compArray, counter){
//		console.log("called:skipPOIcounter:",counter);
		var ansCounter = counter;
		var currentPoiC = compArray[counter][1];
		var poiC = currentPoiC;
		while ( poiC == currentPoiC ){
			++ansCounter;
			if ( ansCounter == compArray.length ){
				console.log("BREAK.....");
				break;
			}
			poiC = compArray[ansCounter][1];
		}
		return ( ansCounter -1);
	}
	
	
	// sourceLayer1,2のintersectionをtargetLayerに生成する。
	function buildIntersection( sourceId1, sourceId2, targetId , strokeColor, strokeWidth, fillColor, progrssCallback){
		halt = false;
		var params = {
			sourceId1: sourceId1,
			sourceId2: sourceId2,
			targetId: targetId,
			strokeColor: strokeColor,
			strokeWidth: strokeWidth,
			fillColor: fillColor,
			progrssCallback: progrssCallback
		}
		
		if ( progrssCallback ){
			progrssCallback( 0 );
		}
		
		svgMap.captureGISgeometries(buildIntersectionS2, params );
	}
	
	function countPoints( sourceLayerIDs , geom ){
		var points=0;
		for ( var i = 0 ; i < sourceLayerIDs.length ; i++ ){
			var geoms1 = geom[sourceLayerIDs[i]];
///			console.log(geoms1);
			if ( geoms1 && geoms1.length > 0 ){
				for ( var k = 0 ; k < geoms1.length ; k++ ){
					var geom1 = geoms1[k].coordinates;
					if ( geom1[0].length ){
						for ( var j = 0 ; j < geom1.length ; j++ ){
							points += geom1[j].length;
						}
					} else {
						points += geom1.length;
					}
				}
			}
		}
		console.log(points);
		return ( points );
	}
	
	function getChildDocsIdObs( layerId1 , layerId2 ){
		var svgImagesProps = svgMap.getSvgImagesProps();
		var childrenId1 =[];
		var childrenId2 =[];
		
		for ( var docId in svgImagesProps ){
			if ( layerId1 === svgImagesProps[docId].rootLayer ){
				childrenId1.push( docId );
			} else if ( layerId2 === svgImagesProps[docId].rootLayer ){
				childrenId2.push( docId );
			}
		}
		
		return {
			childrenId1: childrenId1,
			childrenId2: childrenId2
		}
	}
	
	function getChildDocsId( TdocId ){
		// TdocIdがレイヤーIDだった場合はそのレイヤーに属するものをすべて
		// 単なる文書Idだった場合はその文書と子孫文書すべて
		var svgImagesProps = svgMap.getSvgImagesProps();
		var childrenId =[];
		
		var hasChildren=false;
		/**
		for ( var docId in svgImagesProps ){
			if ( TdocId === svgImagesProps[docId].rootLayer ){
				childrenId.push( docId );
				hasChildren = true;
			}
		}
		**/
		if ( !hasChildren ){
			childrenId = [TdocId];
//			console.log( svgImagesProps[TdocId] );
			digChild( svgImagesProps[TdocId] , childrenId , svgImagesProps );
		}
//		console.log("getChildDocsId searchId:",TdocId,"  ans childrenId:",childrenId);
		return (childrenId);
	}
	
	
	function digChild( svgImagesProp , ans , svgImagesProps ){
//		console.log(svgImagesProp);
		if ( svgImagesProp ){
			for ( var docId in svgImagesProp.childImages ){
	//			console.log(docId, svgImagesProps);
				ans.push(docId);
				digChild( svgImagesProps[docId], ans , svgImagesProps);
			}
		}
	}
	
	
	function buildIntersectionS2( geom, params ){
//		console.log( "called buildIntersectionS2:",geom, params );
		var svgImages = svgMap.getSvgImages();
		var svgImagesProps = svgMap.getSvgImagesProps();
//		var source1IDs = [], source2IDs = [];
		// sourceId1,2がルートレイヤーである子レイヤーをsource1,2IDsに蓄積する
		
//		var childrenID = getChildDocsId( params.sourceId1 , params.sourceId2 );
		var source1IDs = getChildDocsId( params.sourceId1);
		var source2IDs = getChildDocsId( params.sourceId2);
		
		/**
		for ( var docId in geom ){
//			console.log("layerId:",docId , " rootLayer:",svgImagesProps[docId].rootLayer);
			if ( params.sourceId1 === svgImagesProps[docId].rootLayer ){
				source1IDs.push(docId);
			} else if ( params.sourceId2 === svgImagesProps[docId].rootLayer ){
				source2IDs.push(docId);
			}
		}
		**/
		
		console.log("source1IDs:",source1IDs,"\nsource2IDs:",source2IDs);
		
		var targetDoc = svgImages[params.targetId];
		
		var intersections=[];
		
		var src1IDs, src2IDs;
		
		var source1Points = countPoints(source1IDs , geom);
		var source2Points = countPoints(source2IDs , geom);
		
		if ( source1Points < source2Points ){
			src1IDs = source1IDs;
			src2IDs = source2IDs;
		} else {
			src1IDs = source2IDs;
			src2IDs = source1IDs;
		}
		
		console.log("src1IDs:",src1IDs,"\src2IDs:",src2IDs);
		
		
		var src1Features=[];
		for ( var i = 0 ; i < src1IDs.length ; i++ ){
			var geoms1 = geom[src1IDs[i]];
			console.log(geoms1);
			if ( geoms1 && geoms1.length>0 ){
				for ( var k = 0 ; k < geoms1.length ; k++ ){
					var geom1 = geoms1[k];
					if ( geom1 ){
						var feature1 = getFeature(geom1);
						src1Features.push(feature1);
					}
				}
			}
		}
		console.log("src1Features:",src1Features);
		
		
		var compArray = [];
		for ( var j = 0 ; j < src2IDs.length ; j++ ){
			var geoms2 = geom[src2IDs[j]];
			if ( geoms2 && geoms2.length>0 ){
				for ( var l = 0 ; l < geoms2.length ; l++ ){
					var geom2 = geoms2[l];
					if ( geom2 ){
						for ( var m = 0 ; m < src1Features.length ; m++ ){
							compArray.push([j,l,m]);
						}
					}
				}
			}
		}
		console.log(compArray);
		
		buildIntersectionS3(src2IDs,src1Features, compArray,geom, params);
		
	}
	
	var halt = false;
	function haltComputing(){
		console.log("HALT...");
		halt = true;
	}
	
	// intersectionが重すぎる処理なので・・・
	function buildIntersectionS3(src2IDs,src1Features, compArray,geom, params, counter , startTime , feature2, intersections){
		console.log("called buildIntersectionS3:",counter);
		// 再帰処理用内部変数の初期化
		if ( ! counter ){
			startTime = new Date().getTime();
			intersections = [];
			counter = 0;
		}
		while ( counter < compArray.length && halt == false){
			var j = compArray[counter][0];
			var l = compArray[counter][1];
			var m = compArray[counter][2];
			
			var geoms2 = geom[src2IDs[j]];
			if ( m == 0 ){
				var geom2 = geoms2[l];
				feature2 = getFeature(geom2);
			}
			var featureA = src1Features[m];
			try{
				var isf = featureA.intersection(feature2);
				if ( isf ){
					var isGeom = getGeoJson(isf);
					if ( isGeom.coordinates.length > 0 ){
						intersections.push(isGeom);
					}
				}
			}catch (e){
				console.log(e);
			}
			var currentTime =  new Date().getTime();
			++ counter;
			if ( currentTime - startTime > 500 ){ // 0.3秒以上たったらちょっと(30ms)休憩
				console.log( "call laze compu",counter, compArray.length , Math.ceil(counter /  compArray.length));
				if ( params.progrssCallback ){
					params.progrssCallback( Math.ceil(1000 * counter /  compArray.length) / 10 );
				}
				startTime = new Date().getTime();
				setTimeout(buildIntersectionS3, 30 , src2IDs,src1Features, compArray,geom, params, counter , startTime , feature2, intersections);
				break;
			}
		}
		halt = false;
		if ( counter == compArray.length ) {
			if ( params.progrssCallback ){
				params.progrssCallback( 100 );
			}
			var geoJsonIntersections = {};
			geoJsonIntersections.type="GeometryCollection";
			geoJsonIntersections.geometries = intersections;
			console.log("svgmapGIS:geoJsonIntersections",geoJsonIntersections);
			drawGeoJson(geoJsonIntersections, params.targetId, params.strokeColor, params.strokeWidth, params.fillColor);
			svgMap.refreshScreen();
		}
	}
	
	
	function drawGeoJson( geojson , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata){
		console.log("called svgMapGisTool drawGeoJson");
		var svgImages = svgMap.getSvgImages();
		var svgImagesProps = svgMap.getSvgImagesProps();
		var svgImage = svgImages[targetSvgDocId];
		var svgImagesProp = svgImagesProps[targetSvgDocId];
		var crs = svgImagesProp.CRS;
		
		if ( !geojson.type && geojson.length >0 ){ // これはおそらく本来はエラーだが
			for ( var i = 0 ; i < geojson.length ; i++ ){
				drawGeoJson( geojson[i] , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata);
			}
		} else if ( geojson.type == "FeatureCollection" ){
			var features = geojson.features;
			for ( var i = 0 ; i < features.length ; i++ ){
				drawGeoJson( features[i] , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata);
			}
		} else if ( geojson.type == "Feature" ){
			var geom = geojson.geometry;
			if(geojson.properties){
				metadata = "";
				postMeta = Object.keys(geojson.properties).map(function(key){return geojson.properties[key]});
				for(var i=0; i<postMeta.length; i++){
					metadata = metadata + postMeta[i];
					if(i != postMeta.length - 1){
						metadata = metadata + ",";
					}
				}
			}
			drawGeoJson( geom , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata);
		} else if ( geojson.type == "GeometryCollection" ){
			var geoms = geojson.geometries;
			for ( var i = 0 ; i < geoms.length ; i++ ){
				drawGeoJson( geoms[i] , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata);
			}
		} else if ( geojson.type == "MultiPolygon" ){
			// これは、pathのサブパスのほうが良いと思うが・・
			for ( var i = 0 ; i < geojson.coordinates.length ; i++ ){
				putPolygon(geojson.coordinates, svgImage, crs, fillColor, metadata)
			}
		} else if ( geojson.type == "Polygon" ){
			putPolygon(geojson.coordinates, svgImage, crs, fillColor, metadata)
		} else if ( geojson.type == "MultiLineString" ){
			// これは、pathのサブパスのほうが良いと思うが・・
			for ( var i = 0 ; i < geojson.coordinates.length ; i++ ){
				putLineString(geojson.coordinates[i], svgImage, crs, strokeColor, strokeWidth, metadata);
			}
		} else if ( geojson.type == "LineString" ){
			putLineString(geojson.coordinates, svgImage, crs, strokeColor, strokeWidth, metadata);
			
		} else if ( geojson.type == "MultiPoint" ){
			// グループで囲んで一括でmetadataつけたほうが良いと思うが・・
			for ( var i = 0 ; i < geojson.coordinates.length ; i++ ){
				putPoint(geojson.coordinates[i], svgImage, crs, POIiconId, poiTitle, metadata);
			}
		} else if ( geojson.type == "Point" ){
			putPoint(geojson.coordinates, svgImage, crs, POIiconId, poiTitle, metadata);
		}
		
		/**
		for ( var i = 0 ; i < geojson.length ; i++ ){
			var geom = geojson[i];
			switch ( geom.type ){
			case "LineString":
				var pe = svgImage.createElement("path");
				var pathD = getPathD( geom.coordinates , crs );
				pe.setAttribute("d",pathD);
				pe.setAttribute("fill","none");
				pe.setAttribute("stroke","blue");
				pe.setAttribute("stroke-width","3");
				pe.setAttribute("vector-effect","non-scaling-stroke");
				svgImage.documentElement.appendChild( pe );
				break;
			case "Polygon":
				svgImage.createElement("path");
				break;
			}
		}
		**/
//		console.log(svgImage);
	}
	
	function putPoint(coordinates, svgImage, crs, POIiconId, poiTitle, metadata){
		var poie = svgImage.createElement("use");
		var svgc = getSVGcoord(coordinates,crs);
		poie.setAttribute( "x" , "0" );
		poie.setAttribute( "y" , "0" );
		poie.setAttribute( "transform" , "ref(svg," + svgc.x + "," + svgc.y + ")" );
		poie.setAttribute( "xlink:href" , "#" + POIiconId );
		if ( poiTitle ){
			poie.setAttribute( "title", poiTitle);
		}
		if ( metadata ){
			poie.setAttribute( "content", metadata);
		}
		svgImage.documentElement.appendChild( poie );
	}
	
	function putLineString(coordinates, svgImage, crs, strokeColor, strokeWidth, metadata){
		if ( !strokeColor ){
			strokeColor = "blue";
		}
		if ( !strokeWidth ){
			strokeWidth = 3;
		}
		var pe = svgImage.createElement("path");
		var pathD = getPathD( coordinates , crs );
		pe.setAttribute("d",pathD);
		pe.setAttribute("fill","none");
		pe.setAttribute("stroke",strokeColor);
		pe.setAttribute("stroke-width",strokeWidth);
		pe.setAttribute("vector-effect","non-scaling-stroke");
		if ( metadata ){
			pe.setAttribute( "content", metadata);
		}
		svgImage.documentElement.appendChild( pe );
	}
	
	function putPolygon(coordinates, svgImage, crs, fillColor, metadata){
		if ( !fillColor ){
			strokeColor = "orange";
		}
		
		var pe = svgImage.createElement("path");
		
		var pathD="";
		for ( var i = 0 ; i < coordinates.length ; i++ ){
			pathD += getPathD( coordinates[i] , crs )+"z ";
		}
		
		pe.setAttribute("d",pathD);
		pe.setAttribute("fill",fillColor);
		pe.setAttribute("stroke","none");
		pe.setAttribute("fill-rule", "evenodd");
		if ( metadata ){
			pe.setAttribute( "content", metadata);
		}
		svgImage.documentElement.appendChild( pe );
	}
	
	function getPathD( geoCoords , crs ){
		var ans ="M";
		var svgc = getSVGcoord(geoCoords[0],crs);
		ans += svgc.x + "," + svgc.y + " L";
		for ( var i = 1 ; i < geoCoords.length ; i++ ){
			svgc = getSVGcoord(geoCoords[i],crs);
			ans += svgc.x + "," + svgc.y + " ";
		}
		return ( ans );
	}
	
	function getSVGcoord( geoCoord , crs ){
		// DEBUG 2017.6.12 geojsonの座標並びが逆だった 正しくは経度,緯度並び
		return{ 
			x: geoCoord[0] * crs.a + geoCoord[1] * crs.c + crs.e ,
			y: geoCoord[0] * crs.b + geoCoord[1] * crs.d + crs.f
		}
	}
	
	function testCapture( geom ){
		console.log("called testCapture");
		console.log("captured Geometry is:" , geom);
	}
	
	function testCapGISgeom(){
//		console.log("testCapGISgeom:",testCapture);
		svgMap.captureGISgeometries(testCapture);
	}
	
	function captureGeometries( cbFunc , opt ){
		svgMap.captureGISgeometries( cbFunc , opt );
	}
	
return { // svgMapGIStool. で公開する関数のリスト
	testCapGISgeom : testCapGISgeom,
	captureGeometries : captureGeometries,
	getIncludedPoints : getIncludedPoints,
	getExcludedPoints : getExcludedPoints,
	buildIntersection : buildIntersection,
	haltComputing : haltComputing,
	drawGeoJson : drawGeoJson
}

})();

window.svgMapGIStool = svgMapGIStool;


})( window );

