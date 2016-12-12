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

	console.log("Hello this is svgMapGIStool");
	
	if ( jsts ){ // using jsts (JTS javascript edition)
		console.log("This apps has jsts (JavaScript Topology Suites)");
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
	
	console.log(featureReader, featureWriter, getFeature, getGeoJson);
	
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
	
	
	
	// poiID（およびその子供の文書）が、
	function getIncludedPoints(poiID, polyID, cbFunc, param , inverse){
		var pointsDocTreeID = poiID;
		var polygonsDocTreeID = polyID;
		console.log( "called getIncludedPoints:", pointsDocTreeID, polygonsDocTreeID);
		svgMap.captureGISgeometries(getIncludedPointsS2 , pointsDocTreeID , polygonsDocTreeID , cbFunc , param, inverse );
	}
	
	function getExcludedPoints(poiID, polyID, cbFunc, param){
		getIncludedPoints(poiID, polyID, cbFunc, param , true);
	}
	
	function getIncludedPointsS2( geom , pointsDocTreeID, polygonsDocTreeID, cbFunc , param, inverse ){
		if ( inverse && inverse == true ){
		} else {
			inverse = false;
		}
//		console.log("searchedGeom:",geom, "   inverse?:",inverse);
		if ( geom[pointsDocTreeID] && geom[polygonsDocTreeID] ){
			var inclPi = [];
			
			var poiDoc = geom[pointsDocTreeID];
			var polDoc = geom[polygonsDocTreeID];
//			console.log("poi:",poiDoc," pol:",polDoc);
			
			var ansPois = new Array();
			
			for ( var pic = 0 ; pic < poiDoc.length ; pic++ ){
				if ( poiDoc[pic].type === "Point" ){
					for ( plc = 0 ; plc < polDoc.length ; plc ++ ){
						if ( polDoc[plc].type === "Polygon" ){
							polygon = polDoc[plc].coordinates;
							if ( !inverse ){ // 内包判定
								if ( insidePolygon( poiDoc[pic].coordinates , polygon ) ){
									// 一個でも内包してたらそれで内包判断完了
									ansPois.push(poiDoc[pic]);
									break;
								}
							} else { // 非内包判定
								if ( insidePolygon( poiDoc[pic].coordinates , polygon ) ){
									break; // 一個でも内包してたらそれでアウト
								} else if ( plc == polDoc.length - 1 ){
									// 最後まで検索できていて内包してなければOK
									ansPois.push(poiDoc[pic]);
								}
							}
						}
					}
				}
			}
			
			
			cbFunc(ansPois , param ); // 検索したPOIを全部Arrayとして返す。一個パラメータを渡せる
		}
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
			if ( geoms1.length > 0 ){
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
	
	function buildIntersectionS2( geom, params ){
//		console.log( "called buildIntersectionS2:",geom, params );
		var svgImages = svgMap.getSvgImages();
		var svgImagesProps = svgMap.getSvgImagesProps();
		var source1IDs = [], source2IDs = [];
		// sourceId1,2がルートレイヤーである子レイヤーをsource1,2IDsに蓄積する
		for ( var docId in geom ){
//			console.log("layerId:",docId , " rootLayer:",svgImagesProps[docId].rootLayer);
			if ( params.sourceId1 === svgImagesProps[docId].rootLayer ){
				source1IDs.push(docId);
			} else if ( params.sourceId2 === svgImagesProps[docId].rootLayer ){
				source2IDs.push(docId);
			}
		}
		
//		console.log("source1IDs:",source1IDs,"\nsource2IDs:",source2IDs);
		
		var targetDoc = svgImages[params.targetId];
		
		var intersections=[];
		
		var source1Points = countPoints(source1IDs , geom);
		var source2Points = countPoints(source2IDs , geom);
		
		var src1IDs, src2IDs;
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
			if ( geoms1.length>0 ){
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
			if ( geoms2.length>0 ){
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
		
		/**
		for ( var j = 0 ; j < src2IDs.length ; j++ ){
			if ( params.progrssCallback ){
				params.progrssCallback( Math.ceil(j / src2IDs.length));
			}
			var geoms2 = geom[src2IDs[j]];
			if ( geoms2.length>0 ){
				for ( var l = 0 ; l < geoms2.length ; l++ ){
					var geom2 = geoms2[l];
					if ( geom2 ){
						var feature2 = getFeature(geom2);
						for ( var m = 0 ; m < src1Features.length ; m++ ){
							var featureA = src1Features[m];
							try{
								var isf = featureA.intersection(feature2);
								if ( isf ){
									var isGeom = getGeoJson(isf);
									if ( isGeom.coordinates.length > 0 ){
										intersections.push(isGeom);
									}
								}
							} catch (e){
								console.log(e);
							}
						}
					}
				}
			}
		}
		if ( params.progrssCallback ){
			params.progrssCallback( 100 );
		}
		console.log(intersections);
		
		drawGeoJson(intersections, params.targetId, params.strokeColor, params.strokeWidth, params.fillColor);
		svgMap.refreshScreen();
		**/
		
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
			console.log(intersections);
			drawGeoJson(intersections, params.targetId, params.strokeColor, params.strokeWidth, params.fillColor);
			svgMap.refreshScreen();
		}
	}
	
	
	function drawGeoJson( geojson , targetId, strokeColor, strokeWidth, fillColor){
		var svgImages = svgMap.getSvgImages();
		var svgImagesProps = svgMap.getSvgImagesProps();
		var svgImage = svgImages[targetId];
		var svgImagesProp = svgImagesProps[targetId];
		var crs = svgImagesProp.CRS;
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
//		console.log(svgImage);
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
		return{ 
			x: geoCoord[1] * crs.a + geoCoord[0] * crs.c + crs.e ,
			y: geoCoord[1] * crs.b + geoCoord[0] * crs.d + crs.f
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
	
return { // svgMapGIStool. で公開する関数のリスト
	testCapGISgeom : testCapGISgeom,
	getIncludedPoints : getIncludedPoints,
	getExcludedPoints : getExcludedPoints,
	buildIntersection : buildIntersection,
	haltComputing : haltComputing
}

})();

window.svgMapGIStool = svgMapGIStool;


})( window );

