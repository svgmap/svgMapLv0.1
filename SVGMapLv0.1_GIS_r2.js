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
// 2018/06/21 Rev2 : ラスターGIS＝ビットイメージのimageをcanvasに読み込み、bitImage(画像処理)を用いたGIS機能～～　Web上で公開されている主題情報の多くがラスターなので・・
// 2018/08/01 Add pointOnly option / get(Included/Excluded)Points
//
// 
// ACTIONS:
// ・ポリゴン包含、ポリラインクロス等の基本関数(jtsのような)
// ・ポイント（マウスポインタ―）と、ポイント、ポリライン、ポリゴンヒットテスト（既存のクリッカブルオブジェクト同等動作）：　ただし、ポイント、ポリラインはバッファが必要なので後回しか？
// ・ラインと、ライン、ポリゴンのヒットテスト
// ・ポリゴンと、ポイント、ライン、ポリゴンのヒットテスト
// ・カラーピッカーになりえるもの
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
	function getIncludedPoints(poiID, polyID, cbFunc, param , progrssCallback , inverse , pointOnly ){
		var superParam = {
			pointsDocTreeID: poiID,
			polygonsDocTreeID: polyID,
			cbFunc: cbFunc,
			param: param,
			progrssCallback: progrssCallback,
			inverse: inverse,
			pointOnly : pointOnly
		}
		var pointsDocTreeID = poiID;
		var polygonsDocTreeID = polyID;
		console.log( "called getIncludedPoints:", pointsDocTreeID, polygonsDocTreeID);
//		svgMap.captureGISgeometries(getIncludedPointsS2 , superParam );
		svgMap.captureGISgeometries(getIncludedPointsS2a , superParam );
	}
	
	function getExcludedPoints(poiID, polyID, cbFunc, param , progrssCallback , pointOnly ){
		getIncludedPoints(poiID, polyID, cbFunc, param , progrssCallback , true , pointOnly );
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
			} else if (!superParam.pointOnly && ( poiDoc[pic].type === "Polygon" || poiDoc[pic].type === "MultiLineString" ) ){
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
	
	// imageタグのビットイメージ(coverage)によるGIS
	// 2018/6/8 S.Takagi
	// range: [hueRangemin,hueRangemax] or [[hueRange1min,hueRange1max],[...]] or {hue:[[range1min,range1max],[...]],satulation:[[range1min,range1max],[...]],value:[[range1min,range1max],[...]],alpha:[[range1min,range1max],[...]]}
	// poiID_or_pointsには、POINTジオメトリが入ってるレイヤIDもしくは、直接POINTジオメトリの配列を入れる
	function getInRangePoints(poiID_or_points, coverID, rangeData, cbFunc, param , progrssCallback ){
		halt = false;
		var superParam = {
			coverageDocTreeID: coverID,
			cbFunc: cbFunc,
			param: param,
			progrssCallback: progrssCallback,
			range: getRangeParam(rangeData)
		}
		if ( Array.isArray(poiID_or_points)){
			superParam.points= poiID_or_points;
		} else {
			superParam.pointsDocTreeID= poiID_or_points;
		}
		console.log( "called getInRangePoints: poi,cover:", poiID_or_points, coverID,"  range:", superParam.range);
		svgMap.captureGISgeometriesOption(true); // カバレッジが必要
		// captureGISgeometriesはviewportにあるオブジェクトのみ取ってくる仕様
		svgMap.captureGISgeometries(getInRangePointsS2 , superParam );
	}
	
	function getRangeParam(rangeData){
		console.log("getRangeParam:",rangeData);
		var nRange = {};
		// デフォルトは透明でないもの
		var nRange={
			hue:        [[0,360]],
			satulation: [[10,100]],
			value:      [[10,100]],
			alpha:      [[10,100]]
		}
		
		if ( rangeData){
			if ( rangeData.hue ){
				nRange.hue = getRangeVal(rangeData.hue );
				if ( rangeData.satulation ){
					nRange.satulation = getRangeVal(rangeData.satulation );
				}
				if ( rangeData.value ){
					nRange.value = getRangeVal(rangeData.value );
				}
				if ( rangeData.alpha ){
					nRange.alpha = getRangeVal(rangeData.alpha );
				}
			} else if ( rangeData.length && rangeData.length > 0){
				nRange.hue =  getRangeVal(rangeData);
			}
		}
		return ( nRange);
	}
	
	function getRangeVal( rangeVal ){
		var nRangeVal=[];
		if ( rangeVal[0][0]){
			nRangeVal = rangeVal;
		} else {
			nRangeVal[0] = rangeVal;
		}
		return (nRangeVal);
	}
	
	function getTargetPoisBbox( poiGeoms ){
		var xmin=1e30;
		var xmax=-1e30;
		var ymin=1e30;
		var ymax=-1e30;
		
		for ( var i = 0 ; i < poiGeoms.length ; i++ ){
			if ( poiGeoms[i].coordinates[0] > xmax ){
				xmax = poiGeoms[i].coordinates[0];
			}
			if ( poiGeoms[i].coordinates[0] < xmin ){
				xmin = poiGeoms[i].coordinates[0];
			}
			
			if ( poiGeoms[i].coordinates[1] > ymax ){
				ymax = poiGeoms[i].coordinates[1];
			}
			if ( poiGeoms[i].coordinates[1] < ymin ){
				ymin = poiGeoms[i].coordinates[1];
			}
		}
		
		return {
			xmin:xmin,
			ymin:ymin,
			xmax:xmax,
			ymax:ymax
		}
	}
	
	function getInRangePointsS2( geom , superParam ){
//		var geoViewBox = svgMap.getGeoViewBox();
		var targetPois = [];
		var targetCoverages = [];
		// ここでcanvasに入れたimageとpoisで、いろいろやる感じ
		console.log("getInRangePointsS2  geom:",geom);
		var svgImagesProps = svgMap.getSvgImagesProps();
		if ( superParam.points ){
			targetPois = superParam.points;
		}
		for ( var layerId in geom ){
			if ( superParam.pointsDocTreeID && svgImagesProps[layerId].rootLayer == superParam.pointsDocTreeID ){
				for ( var i = 0 ; i < geom[layerId].length ; i++ ){
					if ( geom[layerId][i].type =="Point" ){
						targetPois.push( geom[layerId][i] );
					}
				}
			} else if ( svgImagesProps[layerId].rootLayer == superParam.coverageDocTreeID ){
				for ( var i = 0 ; i < geom[layerId].length ; i++ ){
					if ( geom[layerId][i].type =="Coverage" ){
						targetCoverages.push( geom[layerId][i] );
					}
				}
			}
		}
		
		// viewportにある対象オブジェクトが取れているはず
		console.log("targetCoverages:",targetCoverages,"  targetPois:",targetPois);
		superParam.targetPoisBbox = getTargetPoisBbox(targetPois);
//		console.log("targetPoisBbox:",superParam.targetPoisBbox);
		superParam.targetPois = targetPois;
		superParam.targetCoverages = targetCoverages;
		superParam.coverageIndex = getNextIntersectedCoverage(superParam.targetCoverages, superParam.targetPoisBbox, -1);
		superParam.ans = [];
		
		if ( superParam.progrssCallback ){
			superParam.progrssCallback(0);
		}
		
		// computeInRangePoints経由で再帰実行されるgetImagePixDataを呼び出し処理を進める
		var targetCoverage = superParam.targetCoverages[superParam.coverageIndex];
		if ( targetCoverage && targetCoverage.href ){
			var targetCoverageURL = targetCoverage.href;
			getImagePixData(targetCoverageURL, computeInRangePoints, superParam);
		} else {
			halt = false;
			superParam.cbFunc(superParam.ans, superParam.param);
		}
	}
	
	function getNextIntersectedCoverage(targetCov, targetPoisBbox, currentIndex){
		var cindex = currentIndex+1;
		var intersects = false;
		while ( intersects == false ){
			if ( cindex == targetCov.length ){
				return ( cindex);
			} else {
				// lng:x lat:y
				var cLatMin = Math.min( targetCov[cindex].coordinates[0].lat , targetCov[cindex].coordinates[1].lat);
				var cLatMax = Math.max( targetCov[cindex].coordinates[0].lat , targetCov[cindex].coordinates[1].lat);
				var cLngMin = Math.min( targetCov[cindex].coordinates[0].lng , targetCov[cindex].coordinates[1].lng);
				var cLngMax = Math.max( targetCov[cindex].coordinates[0].lng , targetCov[cindex].coordinates[1].lng);
				if ( cLatMin <= targetPoisBbox.ymax && 
					targetPoisBbox.ymin <= cLatMax && 
					cLngMin <= targetPoisBbox.xmax && 
					targetPoisBbox.xmin <= cLngMax ){
					intersects = true;
				} else {
					intersects = false;
					++ cindex;
				}
			}
		}
		return ( cindex );
	}
	
	
	function computeInRangePoints( pixData , pixWidth , pixHeight , superParam ){
		console.log("computeInRangePoints: coverageData:",pixData.length , pixWidth, pixHeight,"  targetPois.length:",superParam.targetPois.length);
		var extent = superParam.targetCoverages[superParam.coverageIndex].coordinates;
		
		for ( var i = 0 ; i < superParam.targetPois.length ; i++ ){
			var pointCrd = superParam.targetPois[i].coordinates;
			var latMin = Math.min(extent[0].lat, extent[1].lat);
			var latMax = Math.max(extent[0].lat, extent[1].lat);
			var lngMin = Math.min(extent[0].lng, extent[1].lng);
			var lngMax = Math.max(extent[0].lng, extent[1].lng);
//			console.log("cover:",latMin,latMax,lngMin,lngMax,"  poi:",pointCrd[1],pointCrd[0]);
			if ( lngMin <= pointCrd[0] && lngMax > pointCrd[0] && latMin <= pointCrd[1] && latMax > pointCrd[1] ){
				var px = Math.floor(pixWidth  * (pointCrd[0] - lngMin)/(lngMax - lngMin));
				var py = pixHeight - Math.floor(pixHeight * (pointCrd[1] - latMin)/(latMax - latMin)) - 1;
				
				var addr = ( px + py * pixWidth ) * 4;
				var R = pixData[ addr ];
				var G = pixData[ addr + 1 ];
				var B = pixData[ addr + 2 ];
				var A = pixData[ addr + 3 ];
				if ( judgeVal(100*A/255,superParam.range.alpha)){
					var hsv = rgb2hsv( R , G , B );
//					console.log(px,py,hsv,A);
//					console.log("Judge:",superParam.range.hue);
					if ( judgeVal(hsv.h,superParam.range.hue,true) && judgeVal(hsv.s,superParam.range.satulation) && judgeVal(hsv.v,superParam.range.value)){
						hsv.a = A;
						hsv.r = R;
						hsv.g = G;
						hsv.b = B;
						superParam.targetPois[i].hsv = hsv;
						superParam.ans.push(superParam.targetPois[i]);
					}
				}
			}
		}
		
		
		// for next coverage computation
		
//		superParam.coverageIndex = superParam.coverageIndex + 1;
		superParam.coverageIndex = getNextIntersectedCoverage(superParam.targetCoverages, superParam.targetPoisBbox, superParam.coverageIndex);

		if ( superParam.progrssCallback ){
			superParam.progrssCallback( Math.ceil(100 * (superParam.coverageIndex/superParam.targetCoverages.length)) );
		}
		
		if ( halt == true || superParam.coverageIndex == superParam.targetCoverages.length ){
			// complete computation
			halt = false;
			superParam.cbFunc(superParam.ans, superParam.param);
		} else {
			// compute next coverage
			var targetCoverage = superParam.targetCoverages[superParam.coverageIndex];
			if ( targetCoverage && targetCoverage.href ){
				var targetCoverageURL = targetCoverage.href;
				getImagePixData(targetCoverageURL, computeInRangePoints, superParam);
			} else {
				halt = false;
				superParam.cbFunc(superParam.ans, superParam.param);
			}
		}
	}
	
	function normalizeHue( hue ){
		var ans = hue % 360;
		if ( ans < 0 ){
			ans += 360;
		}
		return ( ans );
	}
	
	function judgeVal( val, rangeVal , isHue ){
//		console.log("judgeVal:",val,rangeVal);
		if ( !rangeVal ){
			return ( true );
		}
		
		for ( var i = 0 ; i < rangeVal.length ; i++ ){
			
			if ( isHue ){
				if(rangeVal[i][0] <=0 && rangeVal[i][1]>=360){ // hue全域指定の場合はtrue
					return ( true );
				}
				var hmin = normalizeHue(rangeVal[i][0]);
				var hmax = normalizeHue(rangeVal[i][1]);
				
//				console.log( "hueRange:min:",hmin," max:",hmax,"  val:",val);
				if( hmin > hmax ){ // 360を跨いでる場合
					if (( hmin <= val && val <= 360 )||( 0 <= val && val <= hmax )){
						return( true );
					}
				} else if( hmin <= val && val <= hmax) {
					return ( true );
				}
			} else {
				if ( rangeVal[i][0] <= val && val <= rangeVal[i][1] ){
					return ( true );
				}
			}
		}
		return ( false );
	}
	
	function getImagePixData(imageUrl, callbackFunc, callbackFuncParams){
		var img = new Image();
		if ( anonProxy ){
			img.crossOrigin = "anonymous";
		}
		img.src =getImageURL(imageUrl);
		img.onload = function() {
			var canvas = document.createElement("canvas");
			canvas.width  = img.width;
			canvas.height = img.height;
			var cContext = canvas.getContext('2d');
			cContext.mozImageSmoothingEnabled = false;
			cContext.webkitImageSmoothingEnabled = false;
			cContext.msImageSmoothingEnabled = false;
			cContext.imageSmoothingEnabled = false;
			cContext.drawImage(img, 0, 0);
			var pixData = cContext.getImageData(0, 0, canvas.width, canvas.height).data;
			callbackFunc(pixData, canvas.width, canvas.height, callbackFuncParams);
		}
	}
	
	// canvasで画像処理などをさせるときはCORSが設定されてないと基本的にはNGなので、それが無理な場合はProxyを経由させる
	var proxyUrl;
	var anonProxy = false;
	var directURLlist = [];
	function setImageProxy( url , directURLls , useAnonProxy){
		proxyUrl = url;
		if ( directURLls ){
			directURLlist = directURLls;
		} else {
			directURLlist = [];
		}
		if ( useAnonProxy ){
			anonProxy = true;
		} else {
			anonProxy = false;
		}
	}
	
	
	function getImageURL(imageUrl){
		if ( proxyUrl && imageUrl.indexOf("http") == 0){
			if (isDirefcURL(imageUrl)){
				// Do nothing (Direct Connection)
			} else {
				imageUrl = proxyUrl + encodeURIComponent(imageUrl);
				console.log("via proxy url:",imageUrl);
			}
		} else {
			// Do nothing..
		}
		return (imageUrl);
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
	
	// rgb2hsv and hsv2rgb : from https://www.petitmonte.com/javascript/rgb_hsv_convert.html
	// RGB色空間からHSV色空間へ変換する 
	//  r(red)  : 赤色 0-255の値
	//  g(green): 緑色 0-255の値
	//  b(blue) : 青色 0-255の値 
	function rgb2hsv(r, g, b){   
		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);   
		var hsv = {'h':0,
		's':0,
		'v':max}; // V(明度)   
		if (max != min) {
			// H(色相)  
			if (max == r) hsv.h = 60 * (g - b) / (max-min);
			if (max == g) hsv.h = 60 * (b - r) / (max-min) + 120;
			if (max == b) hsv.h = 60 * (r - g) / (max-min) + 240;
			// S(彩度)
			hsv.s = (max - min) / max;
		}   
		if (hsv.h < 0){
			hsv.h = hsv.h + 360;
		}
		hsv.h =  Math.round(hsv.h);
		hsv.s =  Math.round(hsv.s * 100);
		hsv.v =  Math.round((hsv.v / 255) * 100);     
		return hsv;   
	}
	// HSV(HSB)色空間からRGB色空間へ変換する 
	//  h(hue)       : 色相/色合い   0-360度の値
	//  s(saturation): 彩度/鮮やかさ 0-100%の値
	//  v(Value)     : 明度/明るさ   0-100%の値 
	//  ※v は b(Brightness)と同様 
	function hsv2rgb(h, s, v){
		var max = v;
		var min = max - ((s / 255) * max);
		var rgb = {'r':0,'g':0,'b':0};  
		if (h == 360){
			h = 0;
		}
		s = s / 100;   
		v = v / 100;   
		if (s == 0){
			rgb.r = v * 255;
			rgb.g = v * 255;
			rgb.b = v * 255;
			return rgb;
		}
		var dh = Math.floor(h / 60);
		var p = v * (1 - s);
		var q = v * (1 - s * (h / 60 - dh));
		var t = v * (1 - s * (1 - (h / 60 - dh)));
		switch (dh){
			case 0 : rgb.r = v; rgb.g = t; rgb.b = p;  break;
			case 1 : rgb.r = q; rgb.g = v; rgb.b = p;  break;
			case 2 : rgb.r = p; rgb.g = v; rgb.b = t;  break;
			case 3 : rgb.r = p; rgb.g = q; rgb.b = v;  break;
			case 4 : rgb.r = t; rgb.g = p; rgb.b = v;  break;
			case 5 : rgb.r = v; rgb.g = p; rgb.b = q;  break
		}   
		rgb.r =  Math.round(rgb.r * 255);
		rgb.g =  Math.round(rgb.g * 255);
		rgb.b =  Math.round(rgb.b * 255);
		return rgb; 
	} 	
	
	// geoJsonレンダラ系
	function drawGeoJson( geojson , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata, parentElm){
		console.log("called svgMapGisTool drawGeoJson");
		var svgImages = svgMap.getSvgImages();
		var svgImagesProps = svgMap.getSvgImagesProps();
		var svgImage = svgImages[targetSvgDocId];
		var svgImagesProp = svgImagesProps[targetSvgDocId];
		var crs = svgImagesProp.CRS;
		
		if ( !geojson.type && geojson.length >0 ){ // これはおそらく本来はエラーだが
			for ( var i = 0 ; i < geojson.length ; i++ ){
				drawGeoJson( geojson[i] , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata, parentElm);
			}
		} else if ( geojson.type == "FeatureCollection" ){
			var features = geojson.features;
			for ( var i = 0 ; i < features.length ; i++ ){
				drawGeoJson( features[i] , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata, parentElm);
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
			drawGeoJson( geom , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata, parentElm);
		} else if ( geojson.type == "GeometryCollection" ){
			var geoms = geojson.geometries;
			for ( var i = 0 ; i < geoms.length ; i++ ){
				drawGeoJson( geoms[i] , targetSvgDocId, strokeColor, strokeWidth, fillColor, POIiconId, poiTitle, metadata, parentElm);
			}
		} else if ( geojson.type == "MultiPolygon" ){
			// これは、pathのサブパスのほうが良いと思うが・・
			for ( var i = 0 ; i < geojson.coordinates.length ; i++ ){
				putPolygon(geojson.coordinates, svgImage, crs, fillColor, metadata, parentElm);
			}
		} else if ( geojson.type == "Polygon" ){
			putPolygon(geojson.coordinates, svgImage, crs, fillColor, metadata, parentElm);
		} else if ( geojson.type == "MultiLineString" ){
			// これは、pathのサブパスのほうが良いと思うが・・
			for ( var i = 0 ; i < geojson.coordinates.length ; i++ ){
				putLineString(geojson.coordinates[i], svgImage, crs, strokeColor, strokeWidth, metadata, parentElm);
			}
		} else if ( geojson.type == "LineString" ){
			putLineString(geojson.coordinates, svgImage, crs, strokeColor, strokeWidth, metadata, parentElm);
			
		} else if ( geojson.type == "MultiPoint" ){
			// グループで囲んで一括でmetadataつけたほうが良いと思うが・・
			for ( var i = 0 ; i < geojson.coordinates.length ; i++ ){
				putPoint(geojson.coordinates[i], svgImage, crs, POIiconId, poiTitle, metadata, parentElm);
			}
		} else if ( geojson.type == "Point" ){
			putPoint(geojson.coordinates, svgImage, crs, POIiconId, poiTitle, metadata, parentElm);
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
	
	function putPoint(coordinates, svgImage, crs, POIiconId, poiTitle, metadata, parentElm){
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
		if ( parentElm ){
			parentElm.appendChild( poie );
		} else {
			svgImage.documentElement.appendChild( poie );
		}
		return ( poie );
	}
	
	function putLineString(coordinates, svgImage, crs, strokeColor, strokeWidth, metadata, parentElm){
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
		if ( parentElm ){
			parentElm.appendChild( pe );
		} else {
			svgImage.documentElement.appendChild( pe );
		}
		return (pe);
	}
	
	function putPolygon(coordinates, svgImage, crs, fillColor, metadata, parentElm){
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
		if ( parentElm ){
			parentElm.appendChild( pe );
		} else {
			svgImage.documentElement.appendChild( pe );
		}
		return ( pe);
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
	
	function latLng2GeoJsonPoint(lat , lng ){
		return {
			type:"Point",
			coordinates:[ lng , lat]
		}
	}
	
return { // svgMapGIStool. で公開する関数のリスト
	testCapGISgeom : testCapGISgeom,
	captureGeometries : captureGeometries,
	getIncludedPoints : getIncludedPoints,
	getExcludedPoints : getExcludedPoints,
	buildIntersection : buildIntersection,
	haltComputing : haltComputing,
	drawGeoJson : drawGeoJson,
	getInRangePoints : getInRangePoints,
	setImageProxy: setImageProxy,
	latLng2GeoJsonPoint
}

})();

window.svgMapGIStool = svgMapGIStool;


})( window );

