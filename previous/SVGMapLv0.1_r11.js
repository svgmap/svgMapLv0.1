// 
// Description:
//  SVG Map Level0.1 Implementation
//  evolved from SVG Map Level0
//  
//  Programmed by Satoru Takagi
//  
//  Copyright (C) 2012-2015 by Satoru Takagi @ KDDI CORPORATION
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
// 2012/04/16 : Start coding 
// 2012/04/17 : Dynamic Loading using AJAX
// 2012/04/20 : 単階層のTiling and Layering実装完了
// 多階層の実装を開始
// 2012/04/20 : DOM基本関数でDOMトラバーサを実装し、image文の解釈を実施
// 2012/04/20 : svgImagesの配列化に着手
// 2012/04/23 : コンテナ⇒インポートSVG　構造への対応
// 2012/04/24 : 多階層対応のため、グローバル変数除去＆再帰処理
// まだ不完全か(完全に不要なsvgdomを消去し切れていない・・)
// 2012/04/24 : 子SVG、親SVGでCRS matrixが異なるものに対応
// 2012/04/24 : rootのみだがvisible(Min/Max)Zoomに対応(実際にはroot以外でもrootと同じgcstfなら正しく動く)　～～⇒要改善です
// 2012/05/08 : IE8(winXP),IE9(win7)対応
// 2012/05/09 : スマホ(Android,iPad等)対応(とりあえず)
// 2012/06/12 : window resizeに対応
// 2012/10/04 : POI機能(０次元Vector)の実装を開始(defs->image(id) , use(ref(svg)))タイプ
// 2012/11/02 : ちょっと間が空いたが、POI基本機能実装完了　（IEでも動作）（ToDo:APIでPOIを導入する機能）
// 2012/11/02 : visible(Min/Max)Zoomをroot以外でも正式に対応(したはず)
// 2012/12/06 : jsを分離, viewBoxのパースバグフィックス
// 2012/12/06 : metadataの機構を改良？ svg-propertyにスキーマ、poi(use)のcontentにデータを入れる(いずれもcsv)
// 2012/12/07 : 中心座標を出すUIを追加
// 2012/12/19 : Mobile Firefoxでそれなりに動くようになった
// 2013/01/08 : レイヤー制御関数(ルートコンテナにある<animation>||<iframe>をレイヤーと認識する "title"属性を名称に)
// 2013/01/10 : レイヤー制御機能(switch動作含) class="class名 switch"でそのclassの中でswitchする (初期状態では、いずれか1こ以外はvisibility="hidden"に)
// 2013/01/11 : スマホでもPOIを触れるようにする機能(照準にPOIをあわせてTickerをタップする)
// 2013/01/25 : Rev.10 : 動的なレイヤーのサポート
// 2013/02/20 : 右クリックドラッグでズーム、スマホではマルチタッチズームに対応
// 2013/06/18 : safari blackout対策
// 2013/06/21 : Rev.11 : ズーム時のLevelOfDetail遷移時、未ロード段階でのホワイトアウトを抑制(上等なimgロード処理がかなりできた。が、タイムアウト処理(一部ルーチン用意)、消されるべきコンテンツが上に載ってしまっていて？読み込み中のコンテンツが隠されてしまう、スムース遷移表示をしたいなどの課題が未解決。かなりヘビーな改造で　影響大きい感じなので、リビジョンをひとつ上げることにした)
// 2013/06/25 : タイムアウト処理、LOD遷移時の隠される問題他、r11のバグ・不具合を修正(rev.11)
// 2013/06/27 : ようやくバグを消したかな
// 2013/07/17 : Rev.12 : POIの入力機能の実装に着手　おそらくこれがLv0としてしてはラストのリビジョン（次版は一部ベクタ対応でlv02?）
// 2013/07/31 : だいたいできたかなぁ～～
// 2013/08/01 : バグ(遅延消去)対応。　html:img:id=svg:idに起因するバグは、そろそろ解消しないとまずそう
// 2013/08/02 : r11レベルのIE8互換
// ===== Level 0.1に移行(Level0.0 Rev12を継承) =====
// 2013/08/08 : 1st test impl. 基本ロジックの実験を開始 rev1
// 2013/08/21 : Pathの実装については、ほぼ安定・・・　IE9,FFでも動作
// 2013/08/22 : ERR404等ファイル取得失敗時の例外処理
// 2013/08/29 : Fragmen identifier
// 2013/09/02 : Anchor
// 2013/09/05 : Rev.2 Smooth zoom & wheel action
// 2013/09/12 : Rev.3 Path塗りつぶし, canvasより下にclickable obj(POI)があると使えないことへの対応, 未使用canvasのパージ(少し高効率化)
// 2013/12/05 : Rev.4 Path 要素のHITTEST : コンテナSVGのインポート部分('animation')で class="clickable"が宣言された文書（とそれが参照するすべての下位文書）のPathがクリック検索対象となる
// 2013/12/11 : とりあえずIE11で丸めが起きないようにした
// 2013/12/25 : Rev.5 タイリングを想定して、DOMを再帰的に編集する機能と、その編集をズームパン時にも持続させる機能(編集する機能自身は、ユーザ関数として任意実装（サンプル参照）)
// 2014/01/31 : imageのhrefをDOM操作したときに、表示に反映される。　onload->addEventに変更。
// 2014/02/07-: Rev.6: 開発を開始。svg2.0のiframe,postpone,globalview,zoom-media-queryのドラフトに対応させたい！
// 2014/02/10 : globalView, iframeを（とりあえずの）解釈するようにした。ただし、postponeがデフォルトで変更不可
// 2014/04/10 : add polygon,polyline,rect ( by converting to path! )
// 2014/04/18 : add path-arc, circle   and  debug "style" attr parser
// 2014/04/24 : animation,iframeのhrefを動的に書き換えたとき、動的な読み込みと表示の変化が起きるようにした。
// 2014/04/25 : Rev.6.5: イベントリスナからon*を除去、多くの主要部をclick->mousedownに変更, IE(11)のAJAX APIのResponseTextで最近起こるようになった挙動に対策
// 2014/04/30 : ellipse
// 2014/05/27 : Rev.7: ルートのSVGのanimationをレイヤとみなし、そのレイヤ単位でcanvas2dを統合し、性能向上を図っている。ただし、ベクタ図形とビットイメージ（タイルやビットイメージPOI）との上下関係は崩れます(summarizeCanvas = true)
// 2014/06/05 : span -> div, debug(htmlへのdiv追加前にloadSVGしているのがおかしい)
// 2014/06/05 : Rev7のbugfix 該当するdivが確実に生成される前に統合canvasが設置される可能性があった(editable layerで露呈する)
// 2014/06/06 : Rev.8: クロージャ化(モジュール化) leaflet.js等に差し込めるようにする準備。 これにより、このバージョンからアプリの作り方が変更、svgMap.*で関数を呼び出す必要がある。
// 2014/06/10 : setGeoCenter、setGeoViewPortのちらつき防止処理
// 2014/06/19 : 一段に限って、imageのtransform="matrix(..)"を実装
// 2014/07/25 : text element ( x,y,font-size,fill,ref(svg,x,y)) (not support rotate multiple x,y)
// 2014/07/31 : zooming,pannning anim : transform3d
// 2014/08/06 : SVGImages[]のsvg文書内で、htmlのimg,divとの関係を作るためにつけていたidを、"iid"属性に変更 大規模変更なのでバグ入ったかも・・
// 2014/09/01 : container.svgのlayer classの特性に"batch"を追加 これを指定すると同じクラス名のレイヤーを一括ON/OFFできるUI(項目)が追加
// 2014/09/08 : レイヤーUI用select要素が multipleの場合に対応。さらにjqueryui のmultiselectを用いている場合にも対応。
// 2014/11/06 : 重なったクリッカブルオブジェクトに対し特別な処理を提供する(衝突判定(RDC?))機能の構築開始
// 2014/11/14 : RDCライブラリ完成・・が、以下の実装ではUIが直感的でないのでこれは不使用(ライブラリは残置)
// 2014/11/19 : 重複するPOIの選択UI実装(RDC使用せず、指定したアイコンのみに対する重複で判別)
// 2014/12/03 : レイヤ選択UI改良　機能を持たない単なるレイヤグループ(class名が共通)も含めoptgroupでまとめ表示
// 2014/12/15 : フレームワークの拡張：override, getObject, callFunction
// 2014/12/15 : PoiTargetSelection: closeボタン、候補にレイヤー名記述　追加
// 2015/02/12 : 画面上に要素がない状態でもレイヤーが存在している動的コンテンツにおいて、不用意にonLoad()が動くのを止めた
// 2015/02/12-: Rev.10: META name="refresh"   content="in sec."
// 2015/03/23 : stroke-dasharray (besides non-scaling-stroke)
// 2015/03/25 : marker subset (arrow) and canvs related debug
// 2015/03/31 : marker
// 2015/05/26 : 非同期な動的コンテンツのためにユーティリティ関数（画面更新）を拡張
// 2015/07/08 : Rev.11: image要素でビットイメージが参照されているときに、そのspatial media fragmentを解釈しクリップする
// 2015/09/11 : 動的コンテンツで、スクリプトがエスケープされていなくても動作するようにした
// 2016/05/16 : Fix Safari crash
// 2016/08/10 : Fix CORS contents bug.. konnoさんのコードに手を付けたので、サイドエフェクトが懸念される・・ 8.10のコメントのところ
// 
// Issues:
// 2016/06    Firefoxでヒープが爆発する？(最新48.0ではそんなことはないかも？)
//
// ToDo:
// 各要素のdisplay,visibilityがcss style属性で指定しても効かない
// 動的レイヤーで重ね順が破綻する(see http://svg2.mbsrv.net/devinfo/devkddi/lvl0/locally/nowcastHR/)
// レイヤーグループ機能(方式も含め要検討)
// 
// devNote:
// http://svg2.mbsrv.net/devinfo/devkddi/lvl0.1/airPort_r4.html#svgView(viewBox(global,135,35,1,1))
// isPointInPath plolygonのばあいはそのまま、lineの場合は、このルーチンで生成したpathHitPoitnに小さなポリゴン(rect)を生成し、そこだけで、hittestする　これならばHTMLDOMへの影響が無いので、改修範囲が広範囲にならないかと思う。
// 
// 重複が疑われる関数 (getLayer, getLayers)  (getSymbolProps, getImageProps)
// rootContainerでvector2Dが入ると破綻する 2014.7.25
//
// ToDo : LineとかPolygonとか（文字とか^^;）？
// ToDo : 注記表示[htmlかcanvasか?]、メタデータ検索
// ToDo : IE以外でcanvas外でドラッグズーム動作とまる挙動
//
( function ( window , undefined ) { // 2014.6.6

var document = window.document;
var navigator = window.navigator;
var location = window.location;


var svgMap = ( function(){ // 2014.6.6


var zoomRatio = 1.7320508; // ZoomUp,Downボタンのズームレシオ
var devicePixelRatio = 1.0; // zoom計算時のみに用いる たとえば２にするとzoom値が本来の２分の１になる(2014/07/16)

var summarizeCanvas = true; // added 2014.5.27 レイヤ単位でcanvas2dを統合

var mapx=138;
var mapy=37;
var mapCanvas; // 地図キャンバスとなる、おおもとのdiv要素
var mapCanvasSize; // そのサイズ
var isIE = false; // IE11で互換性があがったので、ロジックにいろいろと無理が出ています・・
var isSP = false;
var loadingTransitionTimeout = 7000; // LODの読み込み遷移中のホワイトアウト防止処理のタイムアウト[msec]

// var svgRelPath = "sc2_0_0_l6_Bing"; // ルートSVG文書への相対パス(末尾"/"無し)

var rootViewBox; // aspectを加味し実際に開いているルートSVGのviewBox
var rootCrs; // ルートSVGのCRS ( geo->rootのsvg )
var root2Geo, geoViewBox; //上の逆 ( rootのsvg - > geo )と、それを使って出したgeoのviewBox


var svgImages = new Array(); // svg文書群(XML) arrayのハッシュキーはimageId("root"以外は"i"+連番)
var svgImagesProps = new Array(); // 同svg文書群の .Path,.CRS,.script,.editable,.editing,.isClickable,.parentDocId,.childImages

var layerUI; // layerセレクト用のSelect要素
var layerUImulti=false; // 同UIがmultiかどうか
var ticker; // Ticker文字

//var editLayerTitle = "Japan Air Port"; // 編集対象のレイヤーのtitle属性（もしくは
var editLayerTitle = ""; // 編集対象のレイヤーのtitle属性（もしくは

var ignoreMapAspect = false; // 地図のアスペクト比を、rootSVGのvireBox( or hashのviewBox)そのものにする場合true

var visiblePOIs = new Array(); // 現在画面上に表示されているPOI(imgアイコン)のリスト(idのハッシュ 内容はx,y,width,height)

function getFragmentView( URLfragment ){
	// 少しチェックがいい加減だけど、svgView viewBox()のパーサ 2013/8/29
	// MyDrawing.svg#svgView(viewBox(0,200,1000,1000))
	// MyDrawing.svg#svgView(viewBox(global,0,200,1000,1000)) -- グローバル系
	if ( URLfragment.indexOf("svgView") >= 0 && URLfragment.indexOf("viewBox") >=0){
		var vals = URLfragment.substring(URLfragment.indexOf("viewBox"));
		vals = vals.substring(vals.indexOf("(")+1,vals.indexOf(")"));
//		console.log(vals, "l:" , vals.length);
		vals = vals.split(",");
		try {
			if ( vals.length == 5 ){
				return {
					global : true ,
					x : Number(vals[1]) ,
					y : Number(vals[2]) ,
					width : Number(vals[3]) ,
					height : Number(vals[4])
				}
			} else if ( vals.length == 4 ){
				return {
					global : false ,
					x : Number(vals[0]) ,
					y : Number(vals[1]) ,
					width : Number(vals[2]) ,
					height : Number(vals[3])
				}
			} else {
				return ( null );
			}
		} catch ( e ){
			return ( null );
		}
		
	} else {
		return ( null );
	}
}

function addEvent(elm,listener,fn){
	try{
		elm.addEventListener(listener,fn,false);
	}catch(e){
		elm.attachEvent("on"+listener,fn);
	}
}

addEvent(window,"load",function(){
	initLoad();
});

function initLoad(){
//	console.log("fragment:" , location.hash, "\n" ,getFragmentView(location.hash));
//	console.log("url:     " , document.URL);
//	console.log("location:" , document.location);
//	console.log("loc.href:" , document.location.href);
	
//	console.log("AppName:",navigator.appName,"  UAname:",navigator.userAgent);
//	if ( navigator.appName == 'Microsoft Internet Explorer' && window.createPopup )
	if ( navigator.appName == 'Microsoft Internet Explorer' || navigator.userAgent.indexOf("Trident")>=0 ){ //2013.12
		isIE = true;
		configIE();
	}
	isSP = checkSmartphone();
	
	mapCanvas=document.getElementById("mapcanvas");
	if ( !mapCanvas ){
		return;
	}
	initNavigationButtons(isSP);
	
	// title属性に読み込むべきSVGの相対リンクがあると仮定(微妙な・・)
	var rootSVGpath = mapCanvas.title;
	mapCanvas.title = ""; // titleにあると表示されてしまうので消す
//	console.log(mapCanvas);
	
	setPointerEvents();
	
	mapCanvasSize = getCanvasSize();
	if (!mapCanvasSize){
		console.log("retry init....");
		setTimeout(initLoad,50);
		return; // どうもwindow.openで作ったときに時々失敗するので、少し(30ms)ディレイさせ再挑戦する
	}
	
	setMapCanvasCSS(mapCanvas); // mapCanvasに必要なCSSの設定 2012/12
	
	setCenterUI(); // 画面中心の緯緯度を表示するUIのセットアップ
	
	setGps();
	
	
	rootViewBox = getBBox( 0 , 0 , mapCanvasSize.width , mapCanvasSize.height );
	
	loadSVG(rootSVGpath , "root" , mapCanvas );
}

var panning = false;
// var panX0 = new Array();
// var panY0 = new Array(); // 画像の初期値
var mouseX0 , mouseY0; // マウスの初期値

var centerPos , vScale; // 中心緯度経度表示用font要素

var action = "none"; // 起こしたアクションがなんなのか（かなりいい加減・・）2013/1 (for Dynamic Layer)



function printTouchEvt(evt){
	if ( evt.touches.length > 1){
		putCmt( evt.touches.length + " : " + evt.touches[0].pageX + "," + evt.touches[0].pageY +" : "+evt.touches[1].pageX + "," + evt.touches[1].pageY);
//				zoomingTransitionFactor = 1;
	}

}

var initialTouchDisance = 0;
function getTouchDistance( evt ){
	var xd = evt.touches[0].pageX - evt.touches[1].pageX;
	var yd = evt.touches[0].pageY - evt.touches[1].pageY;
	return ( Math.sqrt( xd * xd + yd * yd ) );
}

function getMouseXY( evt ){
	if ( !isIE ){
		if ( isSP ){
			mx = evt.touches[0].pageX;
			my = evt.touches[0].pageY;
		} else {
			mx = evt.clientX;
			my = evt.clientY;
		}
	} else {
		mx = event.clientX;
		my = event.clientY;
	}
	return {
		x : mx,
		y : my
	}
}

function startPan( evt ){
//	console.log("startPan:", evt , " mouse:" + evt.button + " testClicked?:"+testClicked);
	prevX = 0;
	prevY = 0;
	if ( evt && evt.button && evt.button == 2 ){
		zoomingTransitionFactor = 1; // ズーム
	} else {
		zoomingTransitionFactor = -1; // パン
	}
//	alert("startPan");
//	mapImgs = mapCanvas.getElementsByTagName("img");
/**
	for ( var i = 0 ; i < mapImgs.length ; i++ ){
		panX0[i] = Number(mapImgs.item(i).style.left.replace("px",""));
		panY0[i] = Number(mapImgs.item(i).style.top.replace("px",""));
	}
**/
//	console.log("startPan" , panX0 , panY0);
	var mxy = getMouseXY(evt);
	mouseX0 = mxy.x;
	mouseY0 = mxy.y;
	if ( !isIE &&  isSP &&  evt.touches.length > 1){
				zoomingTransitionFactor = 1; // スマホのときのピンチでのズーム
				initialTouchDisance = getTouchDistance( evt );
//				putCmt("initDist:"+initialTouchDisance);
	}
	difX = 0;
	difY = 0;
	
	if ( ticker ){
		ticker.style.display="none";
	}
	
	/** このコードって何のため？
	var el = document.elementFromPoint(mouseX0, mouseY0);
//	console.log(mouseX0,mouseY0,el.title);
	if ( el.title ){
		panning = false;
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
//		console.log("dispatch POI event");
		el.dispatchEvent( evt );
	} else {
		panning = true;
	}
	**/
	
	if ( !testClicked ){
		panning = true ;
	} else {
		testClicked = false;
	}
	
	var mouseGeoPos = screen2Geo( mouseX0 , mouseY0 );
//	console.log("mouse:"+mouseX0+","+mouseY0+" : geo["+mouseGeoPos.lat+","+mouseGeoPos.lng+"]");
	
	if ( typeof requestAnimationFrame == "function" ){
		timerID = requestAnimationFrame( panningAnim ); // not use string param ( eval )
	} else {
		timerID = setTimeout( panningAnim , smoothZoomInterval ); // not use string param ( eval )
	}
	
	
	if ( isIE ){
		return (true); // IEの場合は、特にその効果がなくて、しかも上にあるFormのUIが触れなくなる？
	} else {
		return (false); // これは画像上のドラッグ動作処理を抑制するらしい
	}
	
	
}

var timerID;
	
function endPan( ){
	
	clearTimeout(timerID);
	
	if (panning ){
		panning = false;
		if ( difX != 0 || difY != 0 ){ // 変化分があるときはpan/zoom処理
			mapCanvas.style.top  = "0px";
			mapCanvas.style.left = "0px";
			setCssTransform(mapCanvas,{a:1, b:0, c:0, d:1, e:0, f:0});
//			console.log("Call checkLoadCompl : endPan");
			checkLoadCompleted( true ); // 読み込み中にズームパンしたときはテンポラリの画像を強制撤去する20130801
			
			if ( zoomingTransitionFactor != -1 ){ // zoom
				zoom(1/zoomingTransitionFactor);
				zoomingTransitionFactor = -1;
			} else { // pan
				tempolaryZoomPanImages( 1 , difX , difY );
				var s2c = getRootSvg2Canvas( rootViewBox , mapCanvasSize );
				rootViewBox.x -= difX / s2c.a;
				rootViewBox.y -= difY / s2c.d;
				action = "pan";
				dynamicLoad( "root" , mapCanvas );
			}
		} else {
			if( isEditingLayer() ){ // 変化分が無くて編集中レイヤーがあるときはPOIを作成
				// POIの編集を行う
				poiEdit(mouseX0 , mouseY0);
			} else { // それ以外の場合は、2Dベクトルオブジェクトの検索
				getObjectAtPoint(mouseX0, mouseY0);
			}
		}
	}
}

var difX , difY;
var prevX , prevY;
var zoomingTransitionFactor = -1; // ズームモードで>0 ズーム遷移中のズーム率

function showPanning( evt ){
	// ここではズームパンアニメーション自体を行うことはしていない(difX,Y,zTFなどの変化をさせているだけ)
	if ( panning){
//		console.log("button:",evt.button,event.button);
		
		if ( !isIE ){
			if ( isSP ){
//				printTouchEvt(evt);
				difX = evt.touches[0].pageX - mouseX0;
				difY = evt.touches[0].pageY - mouseY0;
				if ( zoomingTransitionFactor != -1 ){
					zoomingTransitionFactor = getTouchDistance( evt ) / initialTouchDisance;
				}
			} else {
				difX = evt.clientX - mouseX0;
				difY = evt.clientY - mouseY0;
			}
		} else {
			difX = event.clientX - mouseX0;
			difY = event.clientY - mouseY0;
		}
		
		if ( zoomingTransitionFactor > 0 ){
			if ( initialTouchDisance == 0 ){
				zoomingTransitionFactor = Math.exp( -difY / (mapCanvasSize.height / 2) ) / Math.exp(0);
			}
			if ( zoomingTransitionFactor < 0.1 ){
				zoomingTransitionFactor = 0.1;
			}
		}
		
		// リミッターかけてみたけど意味ないかな・・
		if ( Math.abs(prevX - difX) > 200 || Math.abs(prevY - difY) > 200){
			endPan();
		} else {
			prevX = difX;
			prevY = difY;
		}
		
	}
	return (false);
}

function panningAnim(){
	// ズームパンアニメーションの実体はこちら setTimeoutで定期的に呼ばれる
//	console.log("call panAnim    panningFlg:",panning);
	if ( panning){
		shiftMap( difX , difY , zoomingTransitionFactor);
//		console.log( difX , difY );
		if ( typeof requestAnimationFrame == "function" ){
			timerID = requestAnimationFrame( panningAnim );
		} else {
			timerID = setTimeout( panningAnim , smoothZoomInterval );
		}
	}
	return (false);
}

function setCssTransform( elem , tMat ){
	var tVal;
	if ( verIE > 9 ){
		tVal = "matrix3d(" + tMat.a + "," + tMat.b + ",0,0," + tMat.c + "," + tMat.d +",0,0,0,0,1,0," + tMat.e + "," + tMat.f + ",0,1)";
	} else {
		tVal = "matrix(" + tMat.a + "," + tMat.b + "," + tMat.c + "," + tMat.d +"," + tMat.e + "," + tMat.f + ")";
	}
//	var tVal = "scale(" + tMat.a + "," + tMat.d +")";
	elem.style.transform = tVal;
	elem.style.webkitTransform  = tVal;
	elem.style.MozTransform  = tVal;
	elem.style.msTransform  = tVal;
	elem.style.OTransform  = tVal;
}

function shiftMap( x , y , zoomF ){
	if ( verIE > 8 ){
		var tr;
		if ( zoomF != -1 ){
			tr = {a:zoomF, b:0, c:0, d:zoomF, e:0, f:0};
//			console.log( tr );
		} else {
			tr = {a:1, b:0, c:0, d:1, e:x, f:y};
		}
		setCssTransform( mapCanvas , tr );
	} else {
		mapCanvas.style.top = y + "px";
		mapCanvas.style.left = x + "px";
	}
	
	/**
	for ( var i = 0 ; i < mapImgs.length ; i++ ){
		mapImgs.item(i).style.left = (panX0[i] + x) + "px";
		mapImgs.item(i).style.top = (panY0[i] + y) + "px";
//		console.log ( x0 , y0 );
	}
	**/
//console.log("endSft : " + mapCanvas.style.transform);
}

function zoom( pow ){
	var svgRootCenterX = rootViewBox.x + 0.5 * rootViewBox.width;
	var svgRootCenterY = rootViewBox.y + 0.5 * rootViewBox.height;
	
	rootViewBox.width = rootViewBox.width * pow;
	rootViewBox.height = rootViewBox.height * pow;
	
	rootViewBox.x = svgRootCenterX - rootViewBox.width / 2;
	rootViewBox.y = svgRootCenterY - rootViewBox.height / 2;
	
	action = "zoom";
	tempolaryZoomPanImages( 1/pow , 0 , 0 );
	dynamicLoad( "root" , mapCanvas );
	
	//getLayers();
}

var smoothZoomTransitionTime = 300;

var additionalZoom = 0;

var smoothZoomInterval = 20;


function smoothZoom(zoomFactor , startDate , doFinish , startZoom ){ // 2013.9.4 外部呼び出し時は、zoomFactorだけでOK
//	console.log("called smoothZoom:",zoomFactor,startDate,doFinish,startZoom);
	
	if ( ! startZoom ){
		startZoom = 1;
	}
	if ( ! startDate ) {
		
		if ( zoomingTransitionFactor != -1 ){ // まだズーム中
			additionalZoom = zoomFactor;
//			console.log( "more Zoom", additionalZoom);
			return;
		}
		
		startDate = new Date();
	}
	
	var elapsedTime =(new Date() - startDate);
	
	if ( !doFinish ){
//		console.log( "time: elapsed",elapsedTime , "  limit:" ,smoothZoomTime);
		if ( elapsedTime < smoothZoomTransitionTime ){
			
			
//			zoomingTransitionFactor = zoomingTransitionFactor + ( ( 1/zoomFactor ) - zoomingTransitionFactor ) * ( smoothZoomTime - elapsedTime)
			
			zoomingTransitionFactor = 1/startZoom + (1/zoomFactor - 1/startZoom) * ( elapsedTime / smoothZoomTransitionTime);
			
//			var zf = 1 + (zoomFactor - 1) * (elapsedTime / smoothZoomTime);
//			zoomingTransitionFactor = 1 / zf;
//			console.log( "zoom : now:" , zoomingTransitionFactor , " target:" , 1/zoomFactor , " eTime:" , elapsedTime , " tTime:" , smoothZoomTransitionTime );
			shiftMap( 0 , 0 , zoomingTransitionFactor);
			if ( typeof requestAnimationFrame == "function" ){
				requestAnimationFrame( function(){ smoothZoom( zoomFactor , startDate , false , startZoom) } );
			} else {
				setTimeout( smoothZoom , smoothZoomInterval , zoomFactor , startDate , false , startZoom);
			}
		} else {
//			console.log("to end zoom", 1/ zoomFactor);
			shiftMap( 0 , 0 , 1/ zoomFactor);
			if ( typeof requestAnimationFrame == "function" ){
				requestAnimationFrame( function(){ smoothZoom(  zoomFactor , startDate , true , startZoom ) } );
			} else {
				setTimeout( smoothZoom , smoothZoomInterval , zoomFactor , startDate , true , startZoom); //フィニッシュ処理へ
			}
		}
	} else { // フィニッシュ処理
		if ( additionalZoom != 0 ){
//			console.log("do additional Zoom2: ", zoomFactor * additionalZoom, " zf:",zoomFactor," az:",additionalZoom);
			var azf = zoomFactor * additionalZoom;
			if ( typeof requestAnimationFrame == "function" ){
				requestAnimationFrame( function(){ smoothZoom( azf , new Date() , false , zoomFactor ) } );
			} else {
				setTimeout( smoothZoom , smoothZoomInterval , azf , new Date() , false , zoomFactor );
			}
			additionalZoom = 0;
		} else {
//			console.log("Finish zoom");
			mapCanvas.style.top  = "0px";
			mapCanvas.style.left = "0px";
			setCssTransform(mapCanvas,{a:1,b:0,c:0,d:1,e:0,f:0});
			zoomingTransitionFactor = -1;
//			console.log("call checkLoadCompleted : smppthZoom");
			checkLoadCompleted( true ); // 読み込み中にズームパンしたときはテンポラリの画像を強制撤去する20130801
			zoom( zoomFactor );
		}
	}
}


// ズームパン操作を完了した後、dynamicLoadを掛ける前にzoom/pan後のイメージを一瞬だけ表示する機能？
// 不要な機能な気がするのは気のせいなのだろうか？ 2014/5/27確認中
// このルーチンが、canvasのことを考慮していないので画像が乱れていた
function tempolaryZoomPanImages( zoomFactor , sftX , sftY ){
	// zoom後のpanということで考えてください。
	var mapImgs = mapCanvas.getElementsByTagName("img");
	
//	console.log("total:"+mapImgs.length+"imgs");
//	var removedImgs= 0;
	for ( var i = mapImgs.length - 1 ; i >= 0 ; i-- ){
		var il = Number(mapImgs.item(i).style.left.replace("px",""));
		var it = Number(mapImgs.item(i).style.top.replace("px",""));
		var iw = Number(mapImgs.item(i).width);
		var ih = Number(mapImgs.item(i).height);
		
		var xd = getIntValue( (il - mapCanvasSize.width * 0.5) * zoomFactor + mapCanvasSize.width * 0.5 + sftX  , iw * zoomFactor );
		var yd = getIntValue( (it - mapCanvasSize.height * 0.5) * zoomFactor + mapCanvasSize.height * 0.5 + sftY  , ih * zoomFactor );
		
		var imgRect = new Object();
		imgRect.x = xd.p0;
		imgRect.y = yd.p0;
		imgRect.width = xd.span;
		imgRect.height = yd.span;
		
		/** This removeChildLogic causes safari(both iOS&MacOS) Crash.. 2016.5.16
		if (isIntersect(imgRect,mapCanvasSize)){ // キャンバス内にあるimgのみ書き換える
			
			mapImgs.item(i).style.left = xd.p0 + "px";
			mapImgs.item(i).style.top = yd.p0 + "px";
			
			mapImgs.item(i).width = xd.span;
			mapImgs.item(i).height = yd.span;
		} else { // それ以外のimgは消す
			mapImgs.item(i).parentNode.removeChild(mapImgs.item(i));
//			++ removedImgs;
		}
		**/
		// Simply rewrite image position
		mapImgs.item(i).style.left = xd.p0 + "px";
		mapImgs.item(i).style.top = yd.p0 + "px";
		
		mapImgs.item(i).width = xd.span;
		mapImgs.item(i).height = yd.span;
		
	}
//	console.log("removed " + removedImgs + "imgs");
	
	// canvas用の処理
	mapImgs = mapCanvas.getElementsByTagName("canvas");
	for ( var i = mapImgs.length - 1 ; i >= 0 ; i-- ){
		var il = 0; // 今後 canvasのサイズをコンテンツ依存にする場合には注意してね
		var it = 0;
		var iw = Number(mapImgs.item(i).width);
		var ih = Number(mapImgs.item(i).height);
		
		var xd = getIntValue( (il - mapCanvasSize.width * 0.5) * zoomFactor + mapCanvasSize.width * 0.5 + sftX  , iw * zoomFactor );
		var yd = getIntValue( (it - mapCanvasSize.height * 0.5) * zoomFactor + mapCanvasSize.height * 0.5 + sftY  , ih * zoomFactor );
		mapImgs.item(i).style.left = xd.p0 + "px";
		mapImgs.item(i).style.top = yd.p0 + "px";
		
		mapImgs.item(i).width = xd.span;
		mapImgs.item(i).height = yd.span;
	}
	
}


function zoomup(){
//	zoom( 1.0/zoomRatio );
	smoothZoom( 1.0/zoomRatio );
}

function zoomdown(){
//	zoom( zoomRatio );
	smoothZoom( zoomRatio );
}

function refreshWindowSize(){
//	console.log("refreshWindowSize()");
	var newMapCanvasSize = getCanvasSize(); // window resize後、initLoad()と同じくgetCanvasSizeが定まらない時があり得るかも 2016.5.31
	if ( ! newMapCanvasSize || newMapCanvasSize.width < 1 || newMapCanvasSize.height < 1 ){
		setTimeout(refreshWindowSize, 50);
		return;
	}
	
	var prevS2C = getRootSvg2Canvas( rootViewBox , mapCanvasSize )
	var pervCenterX = rootViewBox.x + 0.5 * rootViewBox.width;
	var pervCenterY = rootViewBox.y + 0.5 * rootViewBox.height;
	
	mapCanvasSize = newMapCanvasSize;
	
	rootViewBox.width  = mapCanvasSize.width  / prevS2C.a;
	rootViewBox.height = mapCanvasSize.height / prevS2C.d;
	
	rootViewBox.x = pervCenterX - 0.5 * rootViewBox.width;
	rootViewBox.y = pervCenterY - 0.5 * rootViewBox.height;
	
	setMapCanvasCSS(mapCanvas);
	
	action="zoom";
	dynamicLoad( "root" , mapCanvas );
	setCenterUI();
}

function setMapCanvasCSS(mc){ // 2012/12/19 firefoxに対応　スクロールバーとか出なくした
//	console.log("setMapCanvasCSS :: mapCanvasSize:",mapCanvasSize, "  zoomRatio:",zoomRatio);
	mc.style.position="absolute";
	mc.style.overflow="hidden";
	mc.style.top="0px";
	mc.style.left="0px";
	mc.style.width= mapCanvasSize.width + "px";
	mc.style.height= mapCanvasSize.height + "px";
}

function handleClick( evt ){
//	console.log( evt.clientX , evt.clientY);
	shiftMap(-30,-30);
}


// loadSVG(this)[XHR] -> handleResult[buildDOM] -> dynamicLoad[updateMap] -> parseSVG[parseXML & set/chgImage2Canvas] -> (ifNecessary) loadSVG(child)
function loadSVG( path , id , parentElem , parentSvgDocId) {
	console.log("called loadSVG  id:",id, " path:",path);
	if ( !svgImages[id] ){ 
//		console.log("call loadSVG");
		svgImagesProps[id] = new function(){}; //  2014.5.27
//		var httpObj = createXMLHttpRequest( function(){ return handleResult(id , path , parentElem , this); } );
		var httpObj = createXMLHttpRequest( function(){ handleResult(id , path , parentElem , this , parentSvgDocId ) } );
		if ( httpObj ) {
//			console.log(" path:" + path);
			loadingImgs[id] = true;
			
			if ( typeof getUrlViaProxy == "function" ){ // original 2014.2.25 by konno (たぶん)サイドエフェクトが小さいここに移動 s.takagi 2016.8.10
				var pxPath = getUrlViaProxy(path);
				httpObj.open("GET", getSvgReq(pxPath) , true );
			} else {
				httpObj.open("GET", getSvgReq(path) , true );
			}
			httpObj.send(null);
		}
//		console.log("make XHR : ", id);
	} else { // 過去にロードしていて、svgImagesに残っている場合(editableレイヤー)はそれを使う(handleResultを飛ばしてdynamicLoadする) 2013/7/2x
		/**
		// 以下の処理は誤りだと思う 2015.2.12 また、この分岐には、editableレイヤー以外でも入ってくることがある。　レイヤーはあるが、そのグラフィックスが画面上に存在しない場合には、ここに入ってくる。
		if ( svgImagesProps[id].script ){
			if ( svgImagesProps[id].script.onload ){
				console.log("call Cached onload?????");
				svgImagesProps[id].script.onload();
			}
		}
		**/
		delete loadingImgs[id];
		dynamicLoad( id , parentElem );
		
	}
}

var ns_svg = "http://www.w3.org/2000/svg";

function handleResult( docId , docPath , parentElem , httpRes , parentSvgDocId ){
	if (( httpRes.readyState == 4 ) ){
//			console.log("called handleResult and ready  id:",docId);
		if ( httpRes.status == 403 || httpRes.status == 404 || httpRes.status == 500 || httpRes.status == 503 ){
			delete loadingImgs[docId]; // debug 2013.8.22
			console.log( "File get failed",docPath);
			return;
		}
//		console.log("called HandleResult id,path:" + docId+" , " +docPath);
//		console.log("End loading");
//		var text = getAjaxFilter()(httpRes.responseText); // レスポンスの確認用です
//		console.log(text);
//		console.log(printProperties(httpRes));

// Firefox 28において、httpRes.responseやresponseTextはあるにも関わらず、responseXMLが取得できない場合に、(httpRes.responseXML != null)も評価しておかないと、データが表示されなくなる。responseXMLのみがnullの場合は、responseTextを利用して表示すればよい。
		if ((httpRes.responseXML != null) && httpRes.responseXML.documentElement && !isIE && verIE >= 100 && isSvg( httpRes.responseXML ) ){
			svgImages[docId] = httpRes.responseXML;
		} else { // responseXMLが無いブラウザ用(IE用ね)
//			console.log("NO SVG... :",docId , docPath);
			if (httpRes.responseText.indexOf("http://www.w3.org/2000/svg")>=0){ // 2014.1.23 path以外もいろいろIEでは不具合が出るため、すべて対象に
				
				// IE*ではSVGネームスペースのデータの座標値が相当丸められてしまうため、仕方なくText扱いでXMLを改修した上で非SVGデータとしてDOM化して回避する・・・厳しい(2013.8.20)
				var resTxt = httpRes.responseText.replace('xmlns="http://www.w3.org/2000/svg"','xmlns="http://www.w3.org/"'); // ネームスペースを変えるだけにとどめてもOKの模様
				resTxt = resTxt.replace(/.*<!DOCTYPE html>.*</,'<'); // 2014.4.25 IE11 で怪しい挙動 <script>があると勝手にDOCTYPE htmlをつけているかんじがするぞ！！！
//				resTxt = resTxt.replace('</svg>','</xml>');
//				resTxt = resTxt.replace('<svg','<xml>');
				if ( (resTxt.match(/<script>([\s\S]*)<\/script>/ )) ){ // 2015.9.11 動的コンテンツでXML特殊文字がエスケープされていないスクリプトの処理
					var resScript = (resTxt.match(/<script>([\s\S]*)<\/script>/ ))[1];
					resScript = resScript.replace(/&lt;/g,'<');
					resScript = resScript.replace(/&gt;/g,'>');
					resScript = resScript.replace(/&amp;/g,'&');
					resScript = resScript.replace(/&/g,'&amp;');
					resScript = resScript.replace(/</g,'&lt;');
					resScript = "<script>" + resScript.replace(/>/g,'&gt;') + "</script>";
//					console.log("resScript:",resScript);
	//				console.log("resTxt:",resTxt);
					resTxt = resTxt.replace(/<script>[\s\S]*<\/script>/ , resScript);
				} else {
//					console.log ("NO SCRIPT!!!");
				}
					
				svgImages[docId] = new DOMParser().parseFromString(resTxt,"text/xml");
			} else {
				svgImages[docId] = new DOMParser().parseFromString(httpRes.responseText,"text/xml");
			}
		}
//		console.log("docLoc:",svgImages[docId].location);
//		console.log("docPath:" + docPath);
//		svgImagesProps[docId] = new function(){}; // move to loadSVG()  2014.5.27
		svgImagesProps[docId].Path = docPath;
		svgImagesProps[docId].CRS = getCrs( svgImages[docId] );
		svgImagesProps[docId].refresh = getRefresh( svgImages[docId] );
//		if ( !svgImagesProps[docId].CRS  ){
//			// 文書は地図として成り立っていないので消去し、終了する
//			delete (svgImagesProps[docId]);
//			delete (svgImages[docId]);
//			return ;
//		}
		svgImagesProps[docId].isSVG2 = svgImagesProps[docId].CRS.isSVG2; // ちょっとむりやり 2014.2.10
//		console.log("CRS:" + svgImagesProps[docId].CRS.a,":",svgImagesProps[docId].CRS.d,":",svgImagesProps[docId].CRS.e,":",svgImagesProps[docId].CRS.f );
//		console.log("svgImages:\n" + httpRes.responseText);
		
		//svgImagesPropsに文書のツリー構造のリンクを格納する 2013.12.3
		svgImagesProps[docId].parentDocId = parentSvgDocId; // 親の文書IDを格納
		
		if ( svgImagesProps[parentSvgDocId] 
		&& svgImagesProps[parentSvgDocId].childImages[docId] == CLICKABLE ){
			svgImagesProps[docId].isClickable = true;
		}
		
		// ルートのSVG専用の処理です・・・
		if ( docId =="root"){
			rootCrs = svgImagesProps[docId].CRS;
			root2Geo = getInverseMatrix( rootCrs );
			var viewBox = getViewBox( svgImages["root"] );
			rootViewBox = getrootViewBoxFromRootSVG( viewBox , mapCanvasSize , ignoreMapAspect);
			if ( location.hash || docPath.indexOf("#")>0 ){
				var lhash;
				if ( location.hash ){
					lhash = location.hash;
				} else {
					lhash = docPath.substring(docPath.indexOf("#")+1);
				}
				var vb = getFragmentView( lhash );
//				console.log(vb);
				if ( vb && vb.global ){
					rootViewBox = getrootViewBoxFromGeoArea( vb.y, vb.x, vb.height , vb.width , ignoreMapAspect );
				} else if ( vb ){
					// 後ほどね・・・
				}
			}
//			console.log("rootViewBox:",rootViewBox);
//			console.log("rootViewBox:" , rootViewBox , svgImagesProps[docId].Path , docId);
			var layers=getEditableLayers();
		} else {
			if ( isEditableLayer(docId) ){
//				console.log("editable:" + docId);
				svgImagesProps[docId].editable = true;
			}
		}
		
		// 動的レイヤーを導入～～add 2013/1
//		console.log("call getScript");
		svgImagesProps[docId].script = getScript( svgImages[docId] ); 
		if ( svgImagesProps[docId].script ){
			svgImagesProps[docId].script.CRS = svgImagesProps[docId].CRS;
			svgImagesProps[docId].script.location = getSvgLocation( svgImagesProps[docId].Path );
			svgImagesProps[docId].script.verIE = verIE;
//			console.log( "isObj?:" , refreshScreen );
			svgImagesProps[docId].script.refreshScreen = refreshScreen; // 2015.5.26 add utility function for asynchronous software picture refreshing
			
			if ( svgImagesProps[docId].script.onload ){
//				console.log("call First onload() for dynamic content");
				svgImagesProps[docId].script.onload();
			}
		}
		
		delete loadingImgs[docId];
		dynamicLoad( docId , parentElem );
	}
}

function dynamicLoad( docId , parentElem ){ // アップデートループのルート：ほとんど機能がなくなっている感じがする・・
	if (! docId && ! parentElem ){
		docId ="root";
		parentElem = mapCanvas;
	}
//	console.log("called dynamicLoad  id:",docId);
	
	svgDoc = svgImages[docId];
//	svgDoc.firstChild.id=docId;
	svgDoc.documentElement.setAttribute("about",docId);
//	console.log("svgDoc-FC:",svgDoc.firstChild);
//	console.log(parentElem);
	
	parentElem.setAttribute("property",getMetaSchema(svgDoc)); // added 2012/12
	if ( docId == "root" ){
//		console.log("called root dynamicLoad");
		if ( summarizeCanvas ){
			resetSummarizedCanvas();
		}
		if ( ticker ){
			ticker.style.display="none";
		}
		updateCenterPos();
		geoViewBox = getTransformedBox( rootViewBox , root2Geo );
		if ( !pathHitTest.enable ){
			delete existNodes;
			existNodes = new Object();
			visiblePOIs = new Array();
		}
//		console.log(svgDoc.documentElement);
	}
//	console.log("crs:", svgImagesProps[docId].CRS );
//	console.log("docPath:" , svgDoc.docPath);
	
	// メインルーチンに
//	console.log("call parseSVG");
	
	var symbols = getSymbols(svgDoc); // シンボルの登録を事前に行う(2013.7.30)
	
//	console.log(svgDoc.documentElement);
	
	parseSVG( svgDoc.documentElement , docId , parentElem , false , symbols , null , null);
	if ( docId == "root" ){
		setLayerUI(); // add 2013/1 moved from  handleResult 2014/08
//		console.log("checkDeletedNodes", existNodes);
		checkDeletedNodes( mapCanvas );
		if ( ticker ){ // isSP
			checkTicker();
		}
//		console.log("call checkLoadCompleted : ending dynamicLoad");
		checkLoadCompleted(); // 読み込みがすべて完了したらtoBeDelのデータを消去する
	}
//	console.log("end dynamic load");
/**
	if ( docId=="root" ){
		console.log("end ROOT dynamic load");
	} else {
		console.log("end dynamic load");
	}
**/
}

function handleScript( docId , zoom , child2root ){
	svgImagesProps[docId].script.scale = zoom * child2root.scale;
	svgImagesProps[docId].script.actualViewBox = getTransformedBox( rootViewBox , getInverseMatrix( child2root ) ); // *ViewBoxは間違い・viewportが正しい・・互換のために残す・・・
	svgImagesProps[docId].script.geoViewBox = geoViewBox;
	svgImagesProps[docId].script.viewport = svgImagesProps[docId].script.actualViewBox; // debug 2014.08.06
	svgImagesProps[docId].script.geoViewport = geoViewBox; // debug
//	console.log(docId + " : scale:" + svgImagesProps[docId].script.scale + " actualViewBox:" );
//	console.log(svgImagesProps[docId].script.actualViewBox);
//	console.log(svgImagesProps[docId].script.CRS);
//	console.log("action:" + action);
	if ( action == "zoom" ){
		if ( svgImagesProps[docId].script.onzoom ){
			svgImagesProps[docId].script.onzoom();
		}
	} else {
		if ( svgImagesProps[docId].script.onscroll ){
			svgImagesProps[docId].script.onscroll();
		}
	}
//	console.log("refresh:",svgImagesProps[docId].refresh.timeout , svgImagesProps[docId].refresh.loadScript);
	if ( svgImagesProps[docId].refresh.timeout > 0 && svgImagesProps[docId].refresh.loadScript == true ){
		svgImagesProps[docId].refresh.loadScript = false;
		svgImagesProps[docId].script.onload();
	}
}



// for childCategory
var EMBEDSVG = 0 , BITIMAGE = 1 , POI = 2 , VECTOR2D = 3 , GROUP = 4 , TEXT = 5 , NONE = -1;
// for childSubCategory
var PATH = 0 , POLYLINE = 1 , POLYGON = 2 , RECT = 3 , CIRCLE = 4 , ELLIPSE = 5 , HYPERLINK = 10 , SVG2EMBED = 100;

// for layerCategory
var EXIST = 1 , CLICKABLE = 2;

function parseSVG( svgElem , docId , parentElem , eraseAll , symbols , inCanvas , pStyle){ 
	// Symbols: poi シンボルの配列 bug改修(2012/12)
	// inCanvas: svgmap lv0.1用:連続するline,polygonはひとつのcanvasに描くことでリソースを抑制する、そのための統合キャンバス
	
//	console.log("called parseSVG  id:",docId);
	
	var isSVG2 = svgImagesProps[docId].isSVG2;
	
	var docPath = svgImagesProps[docId].Path;
	
	var clickable = svgImagesProps[docId].isClickable;
	
	/**
	if ( docPath.indexOf("Cntr0029_l4_28-83.svg") >=0){
		console.log("問題のコンテンツ(Cntr0029_l4_28-83.svg)の読み込みが完了");
		console.log(svgElem);
		console.log(parentElem);
		console.log(inCanvas);
	}
	**/
	
	var beforeElem = null;
	var s2c = getRootSvg2Canvas( rootViewBox , mapCanvasSize ); // ルートSVG⇒画面変換マトリクス
	var zoom = getZoom(s2c); // ルートSVGの、画面に対するズーム率
	
//	console.log("S2C.a:" + s2c.a + " S2C.d:" + s2c.d);
//	console.log(parentElem);
// svgElemはsvg文書のルート要素 , docPathはこのSVG文書のパス eraseAll==trueで対応要素を無条件消去	
// beforeElem SVGのimage並び順をhtmlのimgの並び順に一致させるためのhtmlにおける直前要素へのポインタ
	
//	var svgNodes = svgDoc.documentElement.childNodes;
//	console.log(docPath);
	var svgNodes = svgElem.childNodes;
	var crs = svgImagesProps[docId].CRS;
	var child2root = getConversionMatrixViaGCS( crs, rootCrs );
	
	var child2canvas = matMul( child2root , s2c ); // 子SVG⇒画面座標へのダイレクト変換行列 2013.8.8
	var nextStyleUpdate = false; // 次要素スタイルを新たに設定する必要の有無
	if ( svgImagesProps[docId].script ){ // added 2013/01 for dynamic layer's convinience
		handleScript( docId , zoom , child2root );
	}
	
	var docDir;
	
	// 2016.8.10 ここに konnoさんによる、http://時の特殊処理( http://の場合docDir=""にする 2014.2.25 )が入っていたのを削除 (たぶん proxy処理に対するエラーだったと思うが・・・　テスト不十分
	var pathWoQF = docPath.replace(/#.*/g,"");
	pathWoQF = pathWoQF.replace(/\?.*/,"");
	docDir = pathWoQF.substring(0,pathWoQF.lastIndexOf("/")+1);
//	docDir = docPath.substring(0,docPath.lastIndexOf("/")+1);
	
	for ( var i = 0 ; i < svgNodes.length ; i++ ){
//		console.log("node:" + i + "/" + svgNodes.length + " : " +svgNodes[i].nodeName);
		var svgNode = svgNodes[i];
		if ( svgNode.nodeType != 1){
			continue;
		}
		var childCategory = NONE;
		var childSubCategory = NONE;
		switch (svgNode.nodeName){
		case "animation":  // animation|iframe要素の場合
			if (!isSVG2 ){
				childCategory = EMBEDSVG;
			}
			break;
		case "iframe":
			if (isSVG2){
				childCategory = EMBEDSVG;
				childSubCategory = SVG2EMBED;
			}
			break;
		case "image":
			childCategory = BITIMAGE;
			break;
		case "use": // use要素の場合 2012/10
			childCategory = POI;
			break;
		case "path":
			childSubCategory = PATH;
			childCategory = VECTOR2D;
			break;
		case "polyline":
			childSubCategory = POLYLINE;
			childCategory = VECTOR2D;
			break;
		case "polygon":
			childSubCategory = POLYGON;
			childCategory = VECTOR2D;
			break;
		case "rect":
			childSubCategory = RECT;
			childCategory = VECTOR2D;
			break;
		case "circle":
			childSubCategory = CIRCLE;
			childCategory = VECTOR2D;
			break;
		case "ellipse":
			childSubCategory = ELLIPSE;
			childCategory = VECTOR2D;
			break;
		case "g":
			childCategory = GROUP;
			break;
		case "a":
			childCategory = GROUP;
			childSubCategory = HYPERLINK;
			break;
		case "text":
			childCategory = TEXT;
		}
		
		if ( ( !pathHitTest.enable && ( childCategory == POI || childCategory == BITIMAGE || childCategory == EMBEDSVG || childCategory == TEXT ) ) || ( pathHitTest.enable && childCategory == EMBEDSVG ) ){ // image||animation,iframe||use(add201210)要素の場合
			if ( !summarizeCanvas && inCanvas ){
				// vector2dデータが前にないのでcanvas統合はここで打ち止め
				inCanvas = null;
			}
			var imageId = svgNode.getAttribute("iid");
			// 読み込んだSVG Image,(iframe|Animation),use要素に共通　通し番のIDを付ける
			if ( ! imageId || imageId.indexOf("i")!=0 ){ // idの無い要素にidを付ける (元々idが付いていると破綻するかも・・)2013/1 (とりあえず的な対応を実施・・後程もっと良い対策をしたい) .. idの代わりに"iid"を使うようにしてベターな対策を打った 2014.8
				imageId = "i" + imageSeqNumber;
				svgNode.setAttribute("iid" , imageId);
//				console.log("Add imageId:"+imageId , svgImages[docId].getElementById(imageId),svgImages[docId]);
				++imageSeqNumber;
				
			}
			
//			console.log("id:" + imageId);
			
			var imgElem;
			existNodes[imageId] = true;
			imgElem = isLoadedImage(imageId); //imageIdをもとに HTMLの要素(span or img)を探索し読み込み済みの画像もしくは文書かどうか確認
//			console.log("isLoadedImage:",imageId,imgElem);
			
			var ip = getImageProps( svgNode , childCategory , pStyle , childSubCategory ); // x,y,w,h,href等読み込み
			var imageRect = transformRect(ip , child2root ); // root座標系における、図形のbbox
//			console.log( "c2rs:" + imageRect.c2rScale );
			/**
			console.log("--  " + docId);
			console.log(ip);
			console.log(imageRect);
			console.log("--");
			**/
//				console.log( "c2rs:" + imageRect.c2rScale );
			if ( !eraseAll && isIntersect( imageRect , rootViewBox ) && inZoomRange( ip , zoom ,  imageRect.c2rScale ) && isVisible(ip ) ){ // ロードすべきイメージの場合
//			console.log("opa:" + ip.opacity);
//				if ( docId == "root" ){			console.log ( svgNode );		}
				
				var elmTransform =null
				var xd , yd ;
				
				if ( ip.transform ){ // 2014.6.18 transform属性があるときの座標計算処理
//					var transformedImgParams = getTransformedImgParams( ip , child2canvas ); // s2c:rootsvg->screen
//					xd = {p0:transformedImgParams.x,span:transformedImgParams.width};
//					xd = {p0:transformedImgParams.y,span:transformedImgParams.height};
					var cm=matMul(ip.transform,child2canvas);
					var p0=transform( ip.x , ip.y , cm );
					
					var det2 = Math.sqrt(Math.abs(cm.a * cm.d - cm.b * cm.c ));
					
					xd={p0:0,span:ip.width*det2};
					yd={p0:0,span:ip.height*det2};
					xd.p0 = p0.x;
					yd.p0 = p0.y;
					elmTransform = { 
						a: cm.a /det2,
						b: cm.b /det2,
						c: cm.c /det2,
						d: cm.d /det2,
						e: 0 ,
						f: 0
					};
//					console.log("elmTransform:",elmTransform);
//					console.log(child2canvas,ip.transform,ip.x,ip.y );
//					console.log("hasTransform:",elmTransform,xd,yd);
						
				} else { // ないとき
				
					var imgBox = getTransformedBox( imageRect , s2c ); // canvas座標系における bbox(transformが無い場合はこれが使える)
					if ( childCategory == POI ){ // ICON表示
						var symb = symbols[ip.href];
						if( symb.d ){
							// ベクタ図形のシンボル... toDo 2015.3.31
						} else {
							ip.href = symb.path;
		//					console.log(symbols[symbId]);
							imgBox.x += symb.offsetX;
							imgBox.y += symb.offsetY;
							imgBox.width = symb.width; // もともとゼロだったので・・ (scaling POIの改造未着手2015.7)
							imgBox.height = symb.height;
						}
					} else if ( ip.nonScaling ){ // 2015.7.3 POIではなくてnonScaling図形の場合
						imgBox.width  = ip.width;
						imgBox.height = ip.height;
						if ( ip.cdx || ip.cdy ){
							imgBox.x += ip.cdx;
							imgBox.y += ip.cdy;
						}
					
					}
					// グリッディング (タイルの継ぎ目消し)
					xd = getIntValue( imgBox.x , imgBox.width);
					yd = getIntValue( imgBox.y , imgBox.height);
//					console.log("noTransf:",xd.p0,yd.p0);
				}
				
//				console.log("intSpan:" + xd.span + " id:" + imageId);
				
				if (!imgElem ){  // ロードされていないとき
					// svgのimageのx,y,w,hをsvg座標⇒Canvas座標に変換
//					console.log("docPath:" + docPath + " docDir:" + docDir + " href:" + ip.href);
//					if ( docId == "root" ){			console.log ( ip.href , beforeElem);		}
					var img;
					if ( childCategory == POI || childCategory == BITIMAGE ){ // image,use要素の場合
						var imageURL = getImageURL(ip.href,docDir);
						img = getImgElement(xd.p0 , yd.p0, xd.span , yd.span , imageURL , imageId , ip.opacity , childCategory , ip.metadata , ip.title , elmTransform , ip.href_fragment );
						
					} else if ( childCategory == TEXT ){ // text要素の場合(2014.7.22)
						var cStyle = getStyle( svgNode , pStyle );
						img = getSpanTextElement(xd.p0 , yd.p0 , ip.cdx , ip.cdy , ip.text , imageId , ip.opacity , elmTransform , cStyle , yd.span , ip.nonScaling);
					} else { // animation|iframe要素の場合
						img = document.createElement("div");
//						img = document.createElement("span");
//						img.setAttribute("class" , docDir + ip.href); // debug
						img.id = imageId;
//						console.log("create div id:",imageId, img);
						if ( ip.opacity ){
//							console.log( "opacity: isIE,verIE", isIE,verIE);
//							console.log("set div opacity: ","Filter: Alpha(Opacity=" + ip.opacity * 100 + ");");
							if ( !isIE){
								img.setAttribute("style" , "Filter: Alpha(Opacity=" + ip.opacity * 100 + ");opacity:" + ip.opacity + ";"); // IEではこれでは設定できない
							} else {
//								console.log("verIE:" + verIE);
								if ( verIE > 8 ){
//									console.log("setIE:>8");
									img.setAttribute("style" , "Filter: Alpha(Opacity=" + ip.opacity * 100 + ");opacity:" + ip.opacity + ";"); // IE8以前ではこれでは設定できない？
								}
								
								img.style.filter="alpha(opacity=" + ip.opacity * 100 + ")"; // IEではこれだけでは効かない
								img.style.position="absolute";
//								img.style.width=xd.span;
//								img.style.height=yd.span;
								img.style.width=mapCanvasSize.width;
								img.style.height=mapCanvasSize.height;
//								img.style.top=yd.p0;
//								img.style.left=xd.p0;
								img.style.top=0;
								img.style.left=0;
							}
						}
						
//						console.log("load:" + imageId);
//						console.log("call loadSVG:",imageId);  // ちゃんと要素をhtmlに追加してからsvgを読み込むように変更 2014.6.5
//						loadSVG( docDir + ip.href , imageId , img , docId); //  htmlへの親要素埋め込み後に移動(2014.6.5)
						if ( !svgImagesProps[docId].childImages){
							svgImagesProps[docId].childImages = new Array();
						}
						if ( svgImagesProps[docId].isClickable || (ip.elemClass && ip.elemClass.indexOf("clickable") >= 0 ) ){
							svgImagesProps[docId].childImages[imageId] = CLICKABLE;
						} else {
							svgImagesProps[docId].childImages[imageId] = EXIST;
						}
//						console.log(docId," : ",svgImagesProps[docId].childImages);
						
//						console.log(svgImagesProps[imageId]);
					}
					
//					console.log(beforeElem);
					// 作成した要素を実際に追加する
//					console.log("append elem",img);
					if ( beforeElem ){
//						console.log("insertAfter:" + beforeElem.id + " : id: " + imageId);
						// SVGのデータ順序の通りにhtmlのimg要素を設置する処理
						// 一つ前のもののあとに入れる
						parentElem.insertBefore(img, beforeElem.nextSibling);
					} else {
//						console.log("AppendTop:"+imageId + " TO " + parentElem);
						if ( parentElem.hasChildNodes()){
							// 子要素がある場合は最初のspan要素の直前に挿入する？
							var childSpans = parentElem.getElementsByTagName("div");
							if ( childSpans ){
								parentElem.insertBefore( img , childSpans.item(0) );
							} else {
								parentElem.insertBefore(img , parentElem.lastChild);
							}
//							parentElem.insertBefore(img , parentElem.lastChild); // これではバグ
						} else {
							parentElem.appendChild(img);
						}
					}
					
					if ( childCategory != POI && childCategory != BITIMAGE && childCategory != TEXT ){ // animation|iframe要素の場合、子svg文書を読み込む( htmlへの親要素埋め込み後に移動した 2014.6.5)
//						console.log("call loadSVG:",imageId, ip.href);
						var childSVGPath = "";
						if ( ip.href.lastIndexOf("http://", 0) == 0 || ip.href.lastIndexOf("https://", 0) == 0 ){ // 2016.5.10 debug
							childSVGPath = ip.href;
						} else {
							childSVGPath = docDir + ip.href;
						}
						loadSVG( childSVGPath , imageId , img , docId);
						if ( docId == "root" ){ // 2014.5.27 canvas統合用に、rootLayerPropに、"root"のレイヤーのidを子孫のレイヤーに追加
							// 現在対象としているsvgImagesPropsではなく子供のpropsに書き込んでいる点に注意！
							(svgImagesProps[imageId]).rootLayer = imageId;
							img.setAttribute("class" , "rootLayer:"+ imageId);
						} else {
							svgImagesProps[imageId].rootLayer = svgImagesProps[docId].rootLayer;
							img.setAttribute("class" , "rootLayer:"+ svgImagesProps[docId].rootLayer);
						}
						
					}
					
					if ( isIE){ // IEではw,hの書き込みに失敗する場合がある。その対策。　imgエレメントのDOM登録タイミングによる？
						if ( verIE < 9 && (childCategory == POI || childCategory == BITIMAGE) ){ 
							img.src = img.getAttribute("href");
						}
						img.width = xd.span;
						img.height = yd.span;
					}
					beforeElem = img;
	//			console.log("load:"+ip.href);
				} else { // ロードされているとき
					
//					console.log("AlreadyLoaded:" + imageId);
					if ( childCategory == POI || childCategory == BITIMAGE ){ // image,use要素の場合
//						console.log("AlreadyLoadedBitimage:" + imageId + " dispay:" + imgElem.style.display);
						// x,y,w,hを書き換える
						setImgElement(imgElem , xd.p0 , yd.p0, xd.span , yd.span , getImageURL(ip.href,docDir), elmTransform , 0, 0, false, ip.nonScaling, ip.href_fragment); // 2015.7.8 本来ip.cdxyは入れるべきだと思うが、どこかでダブルカウントされるバグがある
					} else if ( childCategory == TEXT ){ // 2014.7.22
						setImgElement(imgElem , xd.p0 , yd.p0 , 0 , yd.span , "" , elmTransform , ip.cdx , ip.cdy , true , ip.nonScaling );
					} else { // animation|iframe要素の場合
//						console.log("id:" + imageId );
//						console.log( " ISsvgImages:" + svgImages[imageId]);
//						console.log( " isDocElem:" + svgImages[imageId].documentElement );
						parseSVGwhenLoadCompleted(svgImages , imageId , imgElem , 0 );
						// documentElemの生成(読み込み)が完了してないとエラーになる。生成を待つ必要があるため
//						var symbols =  getSymbols(svgImages[imageId]);
//						parseSVG( svgImages[imageId].documentElement , imageId , imgElem , false , symbols , inCanvas , pStyle ); // inCanvasとpStyleはバグでしょ・・2013.08.20
//						parseSVG( svgImages[imageId].documentElement , imageId , imgElem , false , symbols , null , null );
					}
					beforeElem = imgElem;
				}
				
				if ( childCategory == POI ){
//					visiblePOIs.push({id:imageId, x: xd.p0, y: yd.p0, width: xd.span, height: yd.span });
					visiblePOIs[imageId] = { x: xd.p0, y: yd.p0, width: xd.span, height: yd.span };
				}
				
			} else { // ロードすべきでないイメージの場合
				if ( imgElem ){ // ロードされているとき
//					if ( docId == "root" ){console.log ( "req.Remove", imgElem );}
					// 消す
//					console.log("normalDel:",imgElem);
					requestRemoveTransition( imgElem , parentElem ); //遅延消去処理 2013.6
					if ( childCategory == EMBEDSVG ){ // animation|iframe要素の場合
//						console.log("REMOVE LAYER:",imageId);
						removeChildDocs( imageId );
					}
				}
			}
		} else if ( childCategory == GROUP ){
			// g要素の場合は、子要素を再帰パースする シンボルは波及させる。(ただしスタイル、リンクを波及)
			// ただ、構造は何も作らない(すなわち無いのと同じ。属性の継承なども無視) 2012/12
			// VECTOR2Dができたので、スタイルとvisibleMin/MaxZoomを・・
			
			
			if ( svgNode.hasChildNodes() ){
				
//				console.log("GROUP with child");
				var hasHyperLink = false;
				if ( childSubCategory == HYPERLINK ){
					hasHyperLink = true;
				}
				var cStyle = getStyle(  svgNode , pStyle , hasHyperLink);
//				console.log("minZ:" , cStyle.minZoom , " maxZ:" , cStyle.maxZoom);
//				console.log( "group: fill:" , cStyle["fill"] , " stroke:" , cStyle["stroke"] , svgNode);
				if ( inCanvas && cStyle){ // スタイルを設定する。
//					console.log("<g> set subStyle", cStyle);
					setCanvasStyle(cStyle , inCanvas.getContext('2d'));
				}
				beforeElem = parseSVG( svgNode , docId , parentElem , false , symbols , inCanvas , cStyle );
				if ( inCanvas && cStyle){ // スタイルを元に戻す
//					console.log("</g> restore to Parent Style",pStyle);
					setCanvasStyle(pStyle , inCanvas.getContext('2d'));
				}
			}
		} else if ( childCategory == VECTOR2D ){
			// canvas (inCanvas)を用意する
			if ( ! inCanvas ){ // 統合キャンバス(inCanvas)を新規作成する
				
				if ( !summarizeCanvas ){ // 2014.5.26以前の既存モード
				
					var imageId = svgNode.getAttribute("iid");
					// この状態では編集機能をベクタに入れると破綻します！！！！！！(idなくなるので)
	//				if ( ! imageId ){} // idの無い要素にidを付ける (元々idが付いていると破綻するかも・・)
					if ( ! imageId || imageId.indexOf("i") != 0 ){ // 上記、結構よく破綻する・・・ これがバグだった・・ 2013.8.20
						imageId = "i" + imageSeqNumber;
						svgNode.setAttribute("iid" , imageId);
						++imageSeqNumber;
					}
					
					inCanvas = isLoadedImage(imageId); // この判断で誤っていた！ 2013.8.20
					
					/**
					if ( docPath.indexOf("Cntr0029_l4_28-83.svg") >=0){
						console.log("isLoadedImage?:",imageId);
						console.log(inCanvas);
					}
					**/
					
					if (!inCanvas ){
	//					console.log("build new Canvas",imageId);
						// canvas2dを生成する
						inCanvas = document.createElement("canvas");
						inCanvas.style.position = "absolute";
						inCanvas.style.left = "0px";
						inCanvas.style.top = "0px";
						inCanvas.width = mapCanvasSize.width;
						inCanvas.height = mapCanvasSize.height;
						inCanvas.id = imageId;
						
						if ( beforeElem ){
							// SVGのデータ順序の通りにhtmlのinCanvas要素を設置する処理
							// 一つ前のもののあとに入れる
							parentElem.insertBefore(inCanvas, beforeElem.nextSibling);
						} else {
							if ( parentElem.hasChildNodes()){
								// 子要素がある場合は最初のspan要素の直前に挿入する？
								var childSpans = parentElem.getElementsByTagName("div");
								if ( childSpans ){
									parentElem.insertBefore( inCanvas , childSpans.item(0) );
								} else {
									parentElem.insertBefore(inCanvas , parentElem.lastChild);
								}
							} else {
								parentElem.appendChild(inCanvas);
							}
						}
					} else {
	//					console.log("Found Canvas Reuse",imageId);
						inCanvas.getContext('2d').clearRect(0,0,inCanvas.width,inCanvas.height);
						inCanvas.style.left = "0px";
						inCanvas.style.top = "0px";
						inCanvas.width = mapCanvasSize.width;
						inCanvas.height = mapCanvasSize.height;
						inCanvas.setAttribute("hasdrawing","false");
					}
					if ( pStyle ){
						setCanvasStyle(pStyle , inCanvas.getContext('2d'));
					}
				} else { // summarizeCanvas=true rootLayer毎のcanvasとりまとめ高速化/省メモリモード 2014.5.27
					inCanvas = document.getElementById(svgImagesProps[docId].rootLayer + "_canvas" );
					if ( ! inCanvas ){
						inCanvas = document.createElement("canvas");
						inCanvas.style.position = "absolute";
						inCanvas.style.left = "0px";
						inCanvas.style.top = "0px";
						inCanvas.width = mapCanvasSize.width;
						inCanvas.height = mapCanvasSize.height;
						inCanvas.id = svgImagesProps[docId].rootLayer + "_canvas" ;
//						console.log("rootLayer:",docId,svgImagesProps[docId],svgImagesProps[docId].rootLayer, document.getElementById(svgImagesProps[docId].rootLayer));
						document.getElementById(svgImagesProps[docId].rootLayer).appendChild(inCanvas); //前後関係をもう少し改善できると思う 2015.3.24 rootLayerのdivが生成されていない状況で、appendしてerrが出ることがある　非同期処理によるものかもしれない。（要継続観察）
						inCanvas.setAttribute("hasdrawing","false");
//						console.log("new canvas:" + inCanvas.id );
					} else {
						/** resetSummarizedCanvasに移動
						if ( inCanvas.style.left != "0px"){ // もう少し適切な方法があると思う
							inCanvas.style.left = "0px";
							inCanvas.style.top = "0px";
						}
						if ( inCanvas.width != mapCanvasSize.width ){ // なんでこれが変わったまま？
							inCanvas.width = mapCanvasSize.width;
							inCanvas.height = mapCanvasSize.height;
						}
						**/
					}
					if ( pStyle ){
						setCanvasStyle(pStyle , inCanvas.getContext('2d'));
					}
				}
			} else {
				// 生成済みのcanvasを使用する
			}
			
			/**
			if ( docPath.indexOf("Cntr0029_l4_28-83.svg") >=0){
				console.log("問題のコンテンツ(Cntr0029_l4_28-83.svg)のcanvas取得が完了");
				console.log(inCanvas);
				console.log(inCanvas.parentNode);
				console.log("は、下と等しいはずなんだけど"); // ついに問題点を発見 !canvas時の設置取得ロジック(直上)にバグあり！
				console.log(parentElem);
				
			}
			**/
			
			var cStyle = getStyle(  svgNode , pStyle );
//			console.log(cStyle);
//			console.log( "vect: fill:" , cStyle["fill"] , " stroke:" , cStyle["stroke"] , svgNode);

			var canContext = inCanvas.getContext('2d'); // canvas2dコンテキスト取得
			
			// 必要に応じてスタイルを設定する(ここまでやらなくても性能出るかも？)
			if ( cStyle.hasUpdate ){ // 親のスタイルを継承しているだけでない
//				console.log("set specific style", cStyle);
				setCanvasStyle(cStyle , canContext);
				nextStyleUpdate = true;
			} else if(nextStyleUpdate){ // 親のスタイルを継承しているだけだが、直前の要素がそうでない
//				console.log("restore style" , cStyle , pStyle);
				setCanvasStyle(cStyle , canContext);
				nextStyleUpdate = false;
			} else {
				// do nothing
			}
			if ( inZoomRange( cStyle , zoom , child2root.scale ) && ( !cStyle.display || cStyle.display != "none" ) ){
//				console.log("draw",svgNode);
				var bbox = null;
				if (childSubCategory == PATH){
					bbox = setSVGpathPoints( svgNode , canContext , child2canvas , clickable , null , cStyle.nonScalingOffset );
				} else if ( childSubCategory == RECT ){
					bbox = setSVGrectPoints( svgNode , canContext , child2canvas , clickable , cStyle.nonScalingOffset );
				} else if ( childSubCategory == CIRCLE || childSubCategory == ELLIPSE ){
					bbox = setSVGcirclePoints( svgNode , canContext , child2canvas , clickable , childSubCategory , cStyle.nonScalingOffset );
				} else if ( childSubCategory == POLYLINE || childSubCategory == POLYGON ){
					bbox = setSVGpolyPoints( svgNode , canContext , child2canvas , clickable , childSubCategory , cStyle.nonScalingOffset );
				} else { // これら以外 -- 未実装　～　だいぶなくなったけれど
//					bbox = setSVGvectorPoints(svgNode , canContext , childSubCategory , child2canvas , cStyle );
				}
				
				if ( bbox ) {
					if (cStyle["marker-end"] ){
						// 決め打ちArrow..
						var markPath = "M-20,-5 L0,0 L-20,5";
						var markerId = /\s*url\((#.*)\)/.exec(cStyle["marker-end"]);
//						console.log("markId:",cStyle["marker-end"],markerId,symbols,markerId[1])
						if ( markerId && symbols[markerId[1]] && symbols[markerId[1]].d){
							markPath = symbols[markerId[1]].d;
//							console.log("marker-d:",symbols[markerId[1]].d);
						}
						var markMat = { a: bbox.endCos , b: bbox.endSin , c: -bbox.endSin , d: bbox.endCos , e: bbox.endX , f: bbox.endY };
						
//						canContext.setLineDash([0]); // 2016.9.6 不要？？ ffox45でフリーズ原因・・
						canContext.setLineDash([]);
						setSVGpathPoints( svgNode , canContext , markMat , clickable , markPath , cStyle.nonScalingOffset );
//						console.log("draw marker:",markPath);
//						var ret = setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset);

					}
					if ( pathHitTest.enable && bbox.hitted ){
						pathHitTest.hittedElements.push(svgNode);
						pathHitTest.hittedElementsBbox.push(bbox);
					}
					if ( isIntersect(bbox,mapCanvasSize) ){
						inCanvas.setAttribute("hasdrawing","true");
					}
				}
			}
		}
	}
	return ( beforeElem );
}

	
function getImageURL(href , docDir ){
	var imageURL;
	if ( href.indexOf("http://") == 0 ){
		imageURL = href;
	} else {
		imageURL = docDir + href;
	}
	return ( imageURL );
}

function getSvgReq( href ){ // ハッシュなどの扱いをきちんとした 2014.6.27
	var sl = getSvgLocation( href );
//	console.log ( sl );
	return ( sl.pathname + sl.search );
}
	
// svgの読み込みが完了したらparseSVGするしょり
// documentElemの生成(読み込み)が完了してないとエラーになる。生成を待つ必要があるため 2013.8.21
function parseSVGwhenLoadCompleted(svgImages , imageId , imgElem , ct){
	if ( svgImages[imageId] ){
		var symbols =  getSymbols(svgImages[imageId]);
		parseSVG( svgImages[imageId].documentElement , imageId , imgElem , false , symbols , null , null );
	} else {
		if ( ct < 20 ){
			++ct;
//			console.log("no doc retry:",ct);
			setTimeout( parseSVGwhenLoadCompleted , 200 , svgImages , imageId , imgElem , ct );
		}
	}
}

// SVG文書にはなくなってしまったノードを消去する・・
// これも効率が悪い気がする・・ 2013/1/25
// 何となく納得いかない・・　ロード前にチェックされているのでは？
var existNodes; // 存在するノードのidをハッシュキーとしたテーブル
function checkDeletedNodes( parentNode ){
	var toBeDelNodes = new Array();
//	console.log("called Check : length:" + parentNode.childNodes.length , existNodes);
	for ( var i = parentNode.childNodes.length - 1 ; i >= 0 ; i-- ){
		var oneNode = parentNode.childNodes.item(i);
		if ( oneNode.nodeType == 1 ){
//			console.log(oneNode.id , existNodes[oneNode.id] , oneNode.nodeName);
			if ( oneNode.nodeName == "IMG" && oneNode.id && oneNode.id.indexOf("toBeDel") == -1){
//				console.log("id:", oneNode.id, existNodes[oneNode.id]);
				if ( ( ! existNodes[oneNode.id] ) ){ // img要素に対してのみ
//					console.log("dynamicDel:",oneNode);
//					console.log("remove:", oneNode);
					toBeDelNodes.push(oneNode);
//					oneNode.parentNode.removeChild(oneNode);
//					requestRemoveTransition( oneNode , parentNode );
				}
			}
			
			if (  oneNode.id && oneNode.id.indexOf("toBeDel") == -1 && oneNode.hasChildNodes() ) {
//				console.log(oneNode);
				checkDeletedNodes( oneNode );
			}
		}
	}
	for ( var i = 0 ; i < toBeDelNodes.length ; i++ ){ // debug 2013.8.21
		requestRemoveTransition( toBeDelNodes[i] , parentNode );
	}
}

function removeEmptyTiles( parentNode ){ // カラのcanvasを削除する[summarizedのときには効かない？]
//	console.log("remove Empty Tiles");
	var cv = parentNode.getElementsByTagName("canvas");
	for ( var i = cv.length - 1 ; i >= 0 ; i-- ){
		if ( cv[i].getAttribute("hasdrawing") != "true" ){
//			console.log("removeCanvas:",cv[i]);
			cv[i].parentNode.removeChild(cv[i]);
		}
	}
	checkEmptySpans(parentNode);
}

function resetSummarizedCanvas(){
//	console.log("call resetSummarizedCanvas:",mapCanvas);
	var cv = mapCanvas.getElementsByTagName("canvas");
	for ( var i = cv.length - 1 ; i >= 0 ; i-- ){
		var ocv = cv.item(i);
		ocv.setAttribute("hasdrawing","false");
		ocv.style.left = "0px";
		ocv.style.top = "0px";
		ocv.width = mapCanvasSize.width;
		ocv.height = mapCanvasSize.height;
		ocv.getContext('2d').clearRect(0,0,ocv.width,ocv.height);
	}
}

function checkEmptySpans( parentNode ){
	var ret = true; //再帰呼び出し時,消して良い時はtrue
	for ( var i = parentNode.childNodes.length - 1 ; i >= 0 ; i -- ){
		var oneNode = parentNode.childNodes.item(i);
		if ( oneNode.nodeType == 1 ){
			if ( oneNode.nodeName != "DIV" ){
				ret = false; // div以外の要素がひとつでもあった場合には削除しない
			} else if ( oneNode.hasChildNodes()){ // divだと思う　そしてそれが子ノードを持っている
				var ans = checkEmptySpans( oneNode );
				if ( ans ){ // ansがtrueだったらそのノードを削除する
//					console.log("remove span:",oneNode.id);
					oneNode.parentNode.removeChild(oneNode);
				} else {
					ret = false;
				}
			} else { // devだけれどそれが子ノードを持っていない
//				console.log("remove span:",oneNode.id);
				oneNode.parentNode.removeChild(oneNode);
			}
//			console.log(i,ret,oneNode);
		}
	}
	return ( ret );
}


function getScript( svgDoc ){
	// SVGコンテンツに設置されているjavascriptを読み込み、クロージャを生成
	// 2013/1/24 rev10 動的レイヤーに対応する（かなり冒険的）
	
	var script = svgDoc.getElementsByTagName("script")[0] ;
	var testF = null;
//	console.log(printProperties(svgDoc.getElementsByTagName("globalCoordinateSystem")[0]));
	if ( script ){
//		var scriptTxt = script.firstChild.textContent;
		
		var scriptTxt = script.textContent;
		if ( isIE && !scriptTxt ){
			scriptTxt = script.childNodes[0].nodeValue;
//			console.log( "scriptTxtIE:" , scriptTxt );
		}
		
		// .textContent? .data? 本当はどっちが正しいの？
//		console.log( "scriptTxt:" , scriptTxt );
		
		// クロージャの生成
		eval(
			"function outer(document){ " + 
			"	var onload, onzoom, onscroll; " + 
				scriptTxt +
			"	return{ " + 
			"		onload : onload , " +
			"		onzoom : onzoom , " +
			"		onscroll : onscroll " +
			"	} " +
			"}"
		);
//		console.log("=========eval OK");
		testF = outer(svgDoc); // documentのカプセル化
//		console.log("=========Build Obj");
//		testF.onload();
//		testF.onzoom();
//		testF.onscroll();
//		testF.onscroll();
	}
//	console.log("testF:",testF);
	return ( testF );
	
}

function getSymbols(svgDoc){ // 2013.7.30 -- POI編集のsymbol選択を可能にするとともに、defsは、useより前に無いといけないという制約を払った
	var symbols = new Array();
	var defsNodes = svgDoc.getElementsByTagName("defs");
	for ( var i = 0 ; i < defsNodes.length ; i++ ){
		var svgNode = defsNodes[i];
		if ( svgNode.hasChildNodes ){
			var symbolNodes = svgNode.childNodes;
			for ( var k = 0 ; k < symbolNodes.length ; k++ ){
				if (  symbolNodes[k].nodeName == "image"){
					var symb = getSymbolProps( symbolNodes[k] );
					symbols["#"+symb.id] = symb;
				} else if ( symbolNodes[k].nodeName == "g"){ // 2012/11/27 <g>の直下のimage一個のタイプに対応
					if ( symbolNodes[k].hasChildNodes ){
						for ( var l = 0 ; l < symbolNodes[k].childNodes.length ; l++ ){
							if ( symbolNodes[k].childNodes[l].nodeName == "image" ){
								var symb = getSymbolProps( symbolNodes[k].childNodes[l] );
								symb.id = symbolNodes[k].getAttribute("id");
								symbols["#"+symb.id] = symb;
								break;
							}
						}
					}
				} else if ( symbolNodes[k].nodeName == "marker" ){ // 2015/3/30 marker下path一個のmarkerに対応
					if ( symbolNodes[k].hasChildNodes ){
						for ( var l = 0 ; l < symbolNodes[k].childNodes.length ; l++ ){
							if ( symbolNodes[k].childNodes[l].nodeName == "path" ){
								var symb = getPathSymbolMakerProps( symbolNodes[k].childNodes[l] );
								symb.id = symbolNodes[k].getAttribute("id");
								symbols["#"+symb.id] = symb;
								break;
							}
						}
					}
					
				} else { // ベクトル図形一個だけのシンボルを！　（後日　ペンディング・・・2014/5/12）
					
				}
			}
		}
	}
	return ( symbols );
}

function getSymbolProps( imageNode ){
	var id = imageNode.getAttribute("id");
	var path = imageNode.getAttribute("xlink:href");
	var offsetX = Number(imageNode.getAttribute("x"));
	var offsetY = Number(imageNode.getAttribute("y"));
	var width = Number(imageNode.getAttribute("width"));
	var height = Number(imageNode.getAttribute("height"));
	return {
		id : id ,
		path : path ,
		offsetX : offsetX ,
		offsetY : offsetY ,
		width : width ,
		height : height
	}
}

function getPathSymbolMakerProps( pathNode ){
	var d = pathNode.getAttribute("d");
	return {
		d : d
	}
}

function getrootViewBoxFromRootSVG( viewBox , mapCanvasSize_ , ignoreMapAspect){
	var rVPx , rVPy , rVPwidth , rVPheight;
	
	if ( ignoreMapAspect ){
		return ( viewBox );
	}
	
	if(viewBox){
		if ( mapCanvasSize_.height / mapCanvasSize_.width > viewBox.height / viewBox.width ){
			//キャンバスよりもviewBoxが横長の場合・・横をviewPortに充てる
			rVPwidth = viewBox.width;
			rVPheight = viewBox.width * mapCanvasSize_.height / mapCanvasSize_.width;
			rVPx = viewBox.x;
			rVPy = viewBox.y + viewBox.height / 2.0 - rVPheight / 2.0;
		} else {
			rVPheight = viewBox.height;
			rVPwidth = viewBox.height * mapCanvasSize_.width / mapCanvasSize_.height;
			rVPy = viewBox.y;
			rVPx = viewBox.x + viewBox.width / 2.0 - rVPwidth / 2.0;
		}
		
	} else {
		rVPx = 0;
		rVPy = 0;
		rVPwidth = mapCanvasSize_.width;
		rVPheight = mapCanvasSize_.height;
	}
	
	return {
		x : rVPx ,
		y : rVPy ,
		width : rVPwidth ,
		height : rVPheight
	}
}

// ルートSVG⇒画面キャンバスの変換マトリクス
function getRootSvg2Canvas( rootViewBox , mapCanvasSize_ ){
	var s2cA , s2cD , s2cE , s2cF;
	
	s2cA = mapCanvasSize_.width / rootViewBox.width;
	s2cD = mapCanvasSize_.height / rootViewBox.height;
	
	s2cE = - s2cA * rootViewBox.x;
	s2cF = - s2cD * rootViewBox.y;
	
	return{
		a : s2cA,
		b : 0,
		c : 0,
		d : s2cD,
		e : s2cE,
		f : s2cF
	}
}

imageSeqNumber = 0; // SVGのimage要素に通し番でidを振っておく


function isLoadedImage( id ){ // HTMLのimg要素をサーチして、該当idがあるかどうかを確認する。(これが非効率な部分かも・・)
//	if ( mapCanvas.getElementById(id) ){}
	var elem = document.getElementById(id);
//	console.log(elem);
	if ( elem ){
		return ( elem );
	} else {
		return ( false );
	}
}


// "丸め"による隙間ができるのを抑止する
function getIntValue( p0 , span0 ){ // y側でも使えます
	var p1 = Math.floor(p0);
	var p2 = Math.floor(p0 + span0);
	return {
		p0 : p1,
		span : p2 - p1
	}
}

var loadingImgs = new Array(); // 読み込み途上のimgのリストが入る

function getImgElement( x, y, width, height, href , id , opacity , category , meta , title , transform , href_fragment ){
	var img = document.createElement("img");
	
	if ( href_fragment ){ // 2015.7.3 spatial fragment
		img.setAttribute("href_fragment",href_fragment);
	}
	
	if ( verIE > 8 ){
//		console.log("el",href);
		img.addEventListener('load', handleLoadSuccess); // for Safari
		img.src = href;
	} else {
		img.attachEvent('onload', handleLoadSuccess);
		img.setAttribute("href",href); // IE8のバグの対策のため・・hrefはDOM追加後につけるんです
		img.style.filter = "inherit"; // 同上 (http://www.jacklmoore.com/notes/ie-opacity-inheritance/)
	}
	setTimeout( timeoutLoadingImg , loadingTransitionTimeout , img);
	loadingImgs[id] = true;
//	console.log("opacity:" +opacity);
	if ( opacity ){
//		console.log("set opacity: ","Filter: Alpha(Opacity=" + opacity * 100 + ");opacity:" + opacity + ";");
		img.setAttribute("style" , "Filter: Alpha(Opacity=" + opacity * 100 + ");opacity:" + opacity + ";");
	}
	img.style.left = x + "px";
	img.style.top = y + "px";
	img.style.display = "none"; // for Safari
	img.style.position = "absolute";
	img.width = width;
	img.height = height;
	img.id = id;
	if ( transform ){ // ま、とりあえず 2014.6.18
		img.style.transform = "matrix(" + transform.a + ","  + transform.b + "," + transform.c + "," + transform.d + "," + transform.e + "," + transform.f + ")";
		img.style.transformOrigin = "0 0";
		img.style.webkitTransform = "matrix(" + transform.a + ","  + transform.b + "," + transform.c + "," + transform.d + "," + transform.e + "," + transform.f + ")";
		img.style.webkitTransformOrigin = "0 0";
	}
	
	if ( category == POI ){ // POI (set Event Handler)
		img.style.zIndex = "10"; // POIがcanvasより下だとクリックできない問題への対策(POIの重ね順が間違ったことになる場当たり対策だが・・ 2013.9.12)
//		img.setAttribute("onclick","testClick(this)");
		
		addEvent(img,"mousedown",testClick);
		
		
		/**
		if ( isIE ){
			img.attachEvent('onclick',testClick);
		} else {
//			img.addEventListener("click",testClick,false); // タッチデバイスでは、これでもPOIが選べない？？(2013/4/4)
			img.addEventListener("mousedown",testClick,false); // mousedownに統一したい・・
		}
		**/
		img.style.cursor="pointer";
		img.setAttribute("content", meta);
		if ( title ){
			img.setAttribute("title", title );
		} else {
			img.setAttribute("title", href );
		}
		
		
	} else {
		img.setAttribute("title", "" );
//		img.setAttribute("alt", "" );
	}
	
//	console.log(x,y,width,height);
	
//	console.log("create Img",id,img.style.display);
	
	return ( img );
}

function getSpanTextElement( x, y, cdx, cdy, text , id , opacity , transform , style , areaHeight , nonScaling){ // 2014.7.22
//	console.log("call getTxt");
	var img = document.createElement("span"); // spanで良い？ divだと挙動がおかしくなるので・・
//	console.log("opacity:" +opacity);
	if ( opacity ){
		img.setAttribute("style" , "Filter: Alpha(Opacity=" + opacity * 100 + ");opacity:" + opacity + ";");
	}
	if ( style.fill ){
		img.style.color=style.fill;
	}
	if ( style["font-size"] && nonScaling ){
		img.style.fontSize = style["font-size"] +"px";
	} else if ( nonScaling ){
		// do nothing
	} else {
		img.style.fontSize = areaHeight +"px";
	}
	img.innerHTML = text;
	img.style.left = (x + cdx ) + "px";
//	img.style.top = y + "px";
	img.style.bottom = ( mapCanvasSize.height - ( y + cdy ) ) + "px";
	img.style.position = "absolute";
//	img.width = width;
//	img.height = height;
	img.id = id;
	/**
	if ( transform ){ // ま、とりあえず 2014.6.18
		img.style.transform = "matrix(" + transform.a + ","  + transform.b + "," + transform.c + "," + transform.d + "," + transform.e + "," + transform.f + ")";
		img.style.transformOrigin = "0 0";
		img.style.webkitTransform = "matrix(" + transform.a + ","  + transform.b + "," + transform.c + "," + transform.d + "," + transform.e + "," + transform.f + ")";
		img.style.webkitTransformOrigin = "0 0";
	}
	**/
	img.setAttribute("title", "" );
	return ( img );
}

function setImgElement( img , x, y, width, height, href , transform , cdx , cdy , txtFlg , txtNonScaling , href_fragment ){
	if ( ! cdx ){
		cdx = 0;
	}
	if ( ! cdy ){
		cdy = 0;
	}
	
	img.style.left = (cdx + x) + "px";
	if ( txtFlg ){
		img.style.bottom = ( mapCanvasSize.height - (cdy + y) ) + "px";
		if ( !txtNonScaling ){
			img.style.fontSize = height + "px";
		}
	} else {
		img.style.top = (cdy + y) + "px";
	}
//	img.style.position = "absolute";
	if ( !txtFlg ){
		img.width = width;
		img.height = height;
	}
	if ( !txtFlg && img.src && href && img.getAttribute("src") != href){ // firefoxでは(同じURLかどうかに関わらず)srcを書き換えるとロードしなおしてしまうのを抑制 2014.6.12 絶対パスになってバグが出てない？2015.7.8 getAttrで取れば絶対パスにならないで破たんしない。
//		console.log("src set href:",href, "  src:",img.src, "  imgElem:",img, "  getAttrImg", img.getAttribute("src"));
		img.src = href;
	}
	if ( transform ){ // ま、とりあえず 2014.6.18
		img.style.transform = "matrix(" + transform.a + ","  + transform.b + "," + transform.c + "," + transform.d + "," + transform.e + "," + transform.f + ")";
		img.style.transformOrigin = "0 0";
		img.style.webkitTransform = "matrix(" + transform.a + ","  + transform.b + "," + transform.c + "," + transform.d + "," + transform.e + "," + transform.f + ")";
		img.style.webkitTransformOrigin = "0 0";
	}
//	img.style.display =""; // hideAllTileImgs()用だったが、読み込み途中でスクロールと化すると豆腐が出現するバグになっていたので、それはvisibilityでの制御に変更
	img.style.visibility =""; // debug
//	console.log(img.id,img.style.display);
	
	if ( href_fragment ){ // added 2015.7.8
		setImgViewport( img, href_fragment );
	}
}

function hideAllTileImgs(){ // 2014.6.10 setGeoCenter,setGeoViewPortのちらつき改善
	var mapImgs = mapCanvas.getElementsByTagName("img");
	for ( var i = mapImgs.length - 1 ; i >= 0 ; i-- ){
//		mapImgs[i].style.display="none"; // setImgElement()もしくは、handleLoadSuccess()で戻している)
		mapImgs[i].style.visibility="hidden"; // hideAllTileImgs()用だったが、読み込み途中でスクロールすると豆腐が出現するバグになっていたので、それはvisibilityでの制御に変更
	}
}

function setImgAttr( img , x, y, width, height, href ){
	if ( x ){
		img.style.left = x + "px";
	}
	if ( y ){
		img.style.top = y + "px";
	}
	if ( width ){
		img.width = width;
	}
	if ( height ){
		img.height = height;
	}
	if ( href ){
		img.href = href;
	}
}

function isSvg( doc ){
//	console.log( doc.documentElement.nodeName );
	if ( 	doc.documentElement.nodeName == "svg" ){
		return ( true );
	} else {
		return ( false );
	}
}

function getCrs( svgDoc ){
	var isSVG2 = false;
	var crs = null;
	var globalView=getElementByIdNoNS( svgDoc , "globe");
//	console.log("call getCrs:",getElementByIdNoNS( svgDoc , "globe"),globalView,svgDoc.getElementsByTagName("globalCoordinateSystem")[0],svgDoc.getElementsByTagName("view")[0].getAttribute("id"),svgDoc.getElementsByTagName("view")[0]);
	try{
		if ( globalView && globalView.nodeName =="view"){
			var gv = globalView.getAttribute("viewBox").split(/\s*,\s*|\s/);
			crs = new Array(6);
			crs[0]= gv[2] / 360.0;
			crs[1]= 0;
			crs[2]= 0;
			crs[3]= - gv[3] / 180.0;
			crs[4]= Number(gv[0]) + 180.0 * crs[0];
			crs[5]= Number(gv[1]) -  90.0 * crs[3];
			isSVG2 = true;
	//		console.log("found global view:" , gv, " : " , crs);
		} else {
	//		console.log("getcrs: svgDoc:",svgDoc);
			crs = svgDoc.getElementsByTagName("globalCoordinateSystem")[0].getAttribute("transform").replace("matrix(","").replace(")","").split(",");
	//		console.log("found globalCoords",crs);
		}
		return {
			a : Number(crs[0]) ,
			b : Number(crs[1]) ,
			c : Number(crs[2]) ,
			d : Number(crs[3]) ,
			e : Number(crs[4]) ,
			f : Number(crs[5]) ,
			isSVG2 : isSVG2
		};
	} catch ( e ){
//		console.log( "No CRS:",new XMLSerializer().serializeToString( svgDoc ) );
		// CRSがない文書にとりあえず応じる 2014.5.27
		return {
			a : 1 ,
			b : 0 ,
			c : 0 ,
			d : -1 ,
			e : 0 ,
			f : 0 ,
			isSVG2 : false
		};
	}
}

function getRefresh( svgDoc ){
	var ans = new Array();
	ans.timeout = -1;
	ans.url ="";
	ans.start = false;
	ans.loadScript = false;
	var metas =  svgDoc.getElementsByTagName("meta");
	for ( var i = 0 ; i < metas.length ; i++ ){
		if ( metas[i].getAttribute("http-equiv") && metas[i].getAttribute("http-equiv") == "refresh" && metas[i].getAttribute("content") ){
			var refr = (metas[i].getAttribute("content")).split(";"); // at this time, ignore URL...
			ans.timeout = Number(refr[0]);
			ans.loadScript = true;
			if ( refr[1] ){
				ans.url = refs[1];
			}
//			console.log("meta-refresh:",ans);
			break;
		}
	}
	return ( ans );
}

function getMetaSchema( svgDoc ){
	return ( svgDoc.documentElement.getAttribute("property"));
}

function getViewBox( svgDoc ){
//	console.log(svgDoc);
//	console.log(svgDoc.documentElement);
//	console.log(svgDoc.getElementsByTagName("animation")[0]);
//	console.log(svgDoc.firstChild);
//	var vb = svgDoc.documentElement.getAttribute("viewBox").split(" ");
//	if(vb.length !=4){
//		vb = svgDoc.documentElement.getAttribute("viewBox").split(",");
//	}
	var va = svgDoc.documentElement.getAttribute("viewBox");
	if ( va ){
		if ( va.indexOf("#") == 0 ){
			return (va.substring(1));
		} else {
			var vb = va.replace(/^\s+|\s+$/g, "").split(/[\s,]+/);
			return {
				x : Number(vb[0]),
				y : Number(vb[1]),
				width : Number(vb[2]),
				height : Number(vb[3])
			}
		}
	} else {
		return ( null );
	}
//	console.log("viewBox:" , vb[0]+ "," +vb[1]+ "," +vb[2]+ "," +vb[3]);
}


function getTransformedBox( inBox , matrix ){
	// b,c==0のときのみの簡易関数・・
	if ( matrix.b == 0 && matrix.c == 0){
		var x , y , w , h;
		if ( matrix.a > 0 ){
			x = matrix.a * inBox.x + matrix.e;
			w = matrix.a * inBox.width;
		} else {
			x = matrix.a * (inBox.x + inBox.width) + matrix.e;
			w = - matrix.a * inBox.width;
		}
		
		if ( matrix.d > 0 ){
			y = matrix.d * inBox.y + matrix.f;
			h = matrix.d * inBox.height;
		} else {
			y = matrix.d * (inBox.y + inBox.height) + matrix.f;
			h = - matrix.d * inBox.height;
		}
		
		return {
			x : x ,
			y : y ,
			width : w ,
			height : h
		}
	} else {
		return ( null );
	}
}


// SVG2Geo,Geo2SVG:基本関数
function Geo2SVG( lat , lng , crs ){
	return {
		x : crs.a * lng + crs.c * lat + crs.e ,
		y : crs.b * lng + crs.d * lat + crs.f
	}
}

function SVG2Geo( svgX , svgY , crs ){
	var iCrs = getInverseMatrix(crs);
	if ( iCrs ){
		return {
			lng : iCrs.a * svgX + iCrs.c * svgY + iCrs.e ,
			lat : iCrs.b * svgX + iCrs.d * svgY + iCrs.f
		}
	} else {
		return ( null );
	}
}

function transform( x , y , mat , calcSize , nonScaling){
	if ( calcSize == true ){
		return {
			x : mat.a * x + mat.c * y  ,
			y : mat.b * x + mat.d * y 
		}
	}
	
	if ( nonScaling ){ // vector Effect 2014.5.12
		if ( mat ){
			return {
				x : mat.a * nonScaling.x + mat.c * nonScaling.y + mat.e + x ,
				y : mat.b * nonScaling.x + mat.d * nonScaling.y + mat.f + y
			}
		} else {
			return {
				x : nonScaling.x + x ,
				y : nonScaling.y + y
			}
		}
	}
	
	if ( mat ){
		return {
			x : mat.a * x + mat.c * y + mat.e ,
			y : mat.b * x + mat.d * y + mat.f
		}
	} else {
		return {
			x : x ,
			y : y
		}
	}
}

function getConversionMatrixViaGCS( fromCrs , toCrs ){
	// Child 2 Roorのzoomを計算できるよう、ちゃんとした式を算出するように変更 2012/11/2
	var icCrs = getInverseMatrix(fromCrs);
	
	var a = toCrs.a * icCrs.a + toCrs.c * icCrs.b;
	var b = toCrs.b * icCrs.a + toCrs.d * icCrs.b;
	var c = toCrs.a * icCrs.c + toCrs.c * icCrs.d;
	var d = toCrs.b * icCrs.c + toCrs.d * icCrs.d;
	
	var e = toCrs.a * icCrs.e + toCrs.c * icCrs.f + toCrs.e;
	var f = toCrs.b * icCrs.e + toCrs.d * icCrs.f + toCrs.f;
	
	return {
		a : a ,
		b : b ,
		c : c ,
		d : d ,
		e : e ,
		f : f ,
		scale : Math.sqrt( Math.abs(a * d - b * c ) )
	}
	
}

// child SVG文書のrootSVG文書座標系における領域サイズを計算
// ちゃんとした式で演算数を改善し、scaleも常に算出できるようにした (2012/11/2)
// (子だけでなく、孫も対応(CRSをベースとしてるので))
function transformRect( rect ,  c2r ){
	var x , y , width , height;
//	var c2r = getChild2RootMatrix( rootCrs , childCrs );
	if ( ! rect.transform ){
		var pos1 = transform( rect.x , rect.y , c2r );
		var pos2 = transform( rect.x + rect.width , rect.y + rect.height , c2r );
		if ( pos1.x > pos2.x ){
			x = pos2.x;
			width = pos1.x - pos2.x;
		} else {
			x = pos1.x;
			width = pos2.x - pos1.x;
		}
		if ( pos1.y > pos2.y ){
			y = pos2.y;
			height = pos1.y - pos2.y;
		} else {
			y = pos1.y;
			height = pos2.y - pos1.y;
		}
	} else { // transformがある場合は、Boundin Boxが設定されるので注意 2014.6.18
		var mm = matMul( rect.transform , c2r ); // debug 逆だったねぇ・・
		var pos1 = transform( rect.x , rect.y , mm );
		var pos2 = transform( rect.x + rect.width , rect.y + rect.height , mm );
		var pos3 = transform( rect.x , rect.y + rect.height , mm );
		var pos4 = transform( rect.x + rect.width , rect.y , mm );
		x = Math.min(pos1.x, pos2.x, pos3.x, pos4.x);
		y = Math.min(pos1.y, pos2.y, pos3.y, pos4.y);
		width  = Math.max(pos1.x, pos2.x, pos3.x, pos4.x) - x;
		height = Math.max(pos1.y, pos2.y, pos3.y, pos4.y) - y;
//		console.log("has Transform elem_transform:",rect.transform , " c2r:" , c2r, " mul:", mm , " x:", x," y:", y , " w:", width , " h:", height);
	}
	
	return {
		x : x ,
		y : y ,
		width : width ,
		height : height ,
		c2rScale : c2r.scale
	}
}


// 逆座標変換のための変換マトリクスを得る
function getInverseMatrix( matrix ){
	var det = matrix.a * matrix.d - matrix.b * matrix.c;
	if ( det != 0 ){
		return{
			a :  matrix.d / det ,
			b : -matrix.b / det ,
			c : -matrix.c / det ,
			d :  matrix.a / det ,
			e : (- matrix.d * matrix.e + matrix.c * matrix.f )/ det ,
			f : (  matrix.b * matrix.e - matrix.a * matrix.f )/ det
		}
	} else {
		return ( null );
	}
}

// 指定した要素がzoomrange内にあるかどうかを返事する
function inZoomRange( ip , zoom , c2rScale ){
//	console.log("c2rs:" + c2rScale );
//	if ( ip.minZoom || ip.maxZoom ){
//		console.log("check zoom range:: zoom:" , zoom * c2rScale , " min:" , ip.minZoom , " max:" ,ip.maxZoom);
//	}
	if ( !ip || (!ip.minZoom && !ip.maxZoom) ){
		// プロパティない場合はtrue
		return ( true );
	} else {
//		console.log("EVAL ZOOM : zoom:" + zoom + " min:" + ip.minZoom + " max:" + ip.maxZoom);
		if ( ip.minZoom && zoom * c2rScale < ip.minZoom ){
//			console.log("out of zoom range" , zoom * c2rScale , ip.minZoom);
			return(false);
		}
		if ( ip.maxZoom && zoom * c2rScale > ip.maxZoom ){
//			console.log("out of zoom range" , zoom * c2rScale , ip.maxZoom);
			return(false);
		}
	}
	return ( true );
}
	
function isVisible(ip){
	if ( ip.visible ){
		return ( true );
	} else {
		return ( false );
	}
}

// まだrootSVGにのみ対応している・・
function getZoom( s2c ){
	// 本当は、 Math.sqrt(Math.abs(s2c.a * s2c.d - s2c.b * s2c.c ) )
//		return ( Math.sqrt(Math.abs(s2c.a * s2c.d - s2c.b * s2c.c ) ) );
		return ( ( Math.abs(s2c.a) + Math.abs(s2c.d) ) / ( 2.0 * devicePixelRatio ) );
}

function setDevicePixelRatio( dpr ){
	if ( dpr > 0 ){
		devicePixelRatio = dpr;
	}
}

// POI,タイル(use,image要素)のプロパティを得る
function getImageProps( imgE , category , parentProps , subCategory ){
	var x, y, width, height, meta, title, elemClass, href, transform, text , cdx , cdy , href_fragment ;
	var nonScaling = false;
	cdx = 0;
	cdy = 0;
	if ( category == EMBEDSVG || category == BITIMAGE ){
		if ( category == EMBEDSVG && subCategory == SVG2EMBED ){ // svg2のsvgインポート
//			console.log(imgE);
			href = imgE.getAttribute("src");
			
			// original 2014.2.25 by konno
//			if ( typeof getUrlViaProxy == "function" ){ // このルーチンはもっとサイドエフェクトが小さいところ(実際にXHRしている場所)に移動 s.takagi 2016.8.10
//				//Proxyサーバ経由でアクセス
//				href = getUrlViaProxy(href);
//			}
			var idx = href.indexOf("globe",href.lastIndexOf("#"));
			var postpone = imgE.getAttribute("postpone");
			if ( !postpone ){
//				console.log("postponeがなくエラーですが処理続行します・・・");
				// #gpostpone="true"があることを想定しているので、本来ERRORです
			}
			if ( idx > 0 ){
//				href = href.substring(0,idx ); // 2014.6.27 この処理は getSvgLocation()等に移管
			} else {
//				console.log("リンクに#globeが無くエラーですが処理続行します・・・");
				// #globeがあることを想定しているので、本来ERRORです
			}
			var clip = imgE.getAttribute("clip").replace(/rect\(|\)/g,"").replace(/\s*,\s*|\s+/,",").split(",");
			if ( clip && clip.length == 4 ){
				x= Number(clip[0]);
				y= Number(clip[1]);
				width = Number(clip[2]);
				height= Number(clip[3]);
			} else {
				x = -30000;
				y = -30000;
				width = 60000;
				height= 60000;
			}
//			console.log("clip:" , clip ,x,y,width,height,href);
		} else { // svg1のsvgインポート及び svg1,svg2のビットイメージインポート
			var tf = getPoiPos(imgE);
			if ( tf.x && tf.y ){
				nonScaling = true;
				x = tf.x;
				y = tf.y;
				if ( imgE.getAttribute("x") ){
					cdx = Number(imgE.getAttribute("x"));
				}
				if ( imgE.getAttribute("y") ){
					cdy = Number(imgE.getAttribute("y"));
				}
//				console.log("non scaling bitimage : ",x,y,cdx,cdy);
			} else {
				x = Number(imgE.getAttribute("x"));
				y = Number(imgE.getAttribute("y"));
				if( imgE.getAttribute("transform")){ // add 2014.6.18
					var trv = imgE.getAttribute("transform").replace("matrix(","").replace(")","").split(",");
					transform = {
						a : Number(trv[0]),
						b : Number(trv[1]),
						c : Number(trv[2]),
						d : Number(trv[3]),
						e : Number(trv[4]),
						f : Number(trv[5])
					}
				}
			}
			width = Number(imgE.getAttribute("width"));
			height = Number(imgE.getAttribute("height"));
			href = imgE.getAttribute("xlink:href");
			if ( ! href ){
				href = imgE.getAttribute("href");
			}
			
			if ( href.indexOf("#")>0 && href.indexOf("xywh=", href.indexOf("#") )>0){ // 2015.7.3 spatial fragment
				href_fragment = (href.substring( 5+href.indexOf("xywh=" ,  href.indexOf("#") ) ));
				href = href.substring(0,href.indexOf("#")); // ブラウザが#以下があるとキャッシュ無視するのを抑止
			}
			
			// このルーチンはもっとサイドエフェクトが小さいところ(実際にXHRしている場所)に移動 s.takagi 2016.8.10
//			if ( typeof getUrlViaProxy == "function" ){
				//Proxyサーバ経由でアクセス
//				href = getUrlViaProxy(href);
//			}
		}
		elemClass = imgE.getAttribute("class");
	} else if ( category == POI ){ // POI
		var tf = getPoiPos(imgE);
		if ( tf.x && tf.y ){
			nonScaling = true;
			x = tf.x;
			y = tf.y;
			if ( imgE.getAttribute("x") ){ // この辺はまだ正しい実装が完了しているとは言えない(ref(svg,,)がない(!nonScaling)とき) 2014.7.25
				cdx = Number(imgE.getAttribute("x"));
			}
			if ( imgE.getAttribute("y") ){
				cdy = Number(imgE.getAttribute("y"));
			}
//		console.log("ref:"+x+" , " + y);
		} else { // scaling POI (added 2015.7.3)
			nonScaling = false;
			x = Number(imgE.getAttribute("x"));
			y = Number(imgE.getAttribute("y"));
		}
		width = 0; // ??? そうなの？ 2014.7.25
		height = 0;
		meta = imgE.getAttribute("content");
		title = imgE.getAttribute("xlink:title");
//		console.log("meta:"+meta);
		href = imgE.getAttribute("xlink:href");
	} else if ( category == TEXT ){
		var tf = getPoiPos(imgE);
		if ( tf.x && tf.y ){
			nonScaling = true;
			x = tf.x;
			y = tf.y;
			if ( imgE.getAttribute("x") ){
				cdx = Number(imgE.getAttribute("x"));
			}
			if ( imgE.getAttribute("y") ){
				cdy = Number(imgE.getAttribute("y"));
			}
		} else {
			nonScaling = false;
			x = Number(imgE.getAttribute("x"));
			y = Number(imgE.getAttribute("y"));
		}
		height = 16; // きめうちです　最近のブラウザは全部これ？
		if (imgE.getAttribute("font-size")){
			height = Number(imgE.getAttribute("font-size"));
		}
		width = height; // 適当・・
		text = imgE.textContent;
//		console.log("txtProp:",x,y,cdx,cdy,height,nonScaling);
	}
	
	var minZoom , maxZoom;
	if ( subCategory == SVG2EMBED ){
		// この部分は、今後CSS media query  zoom featureに置き換えるつもりです！
		if ( imgE.getAttribute("visibleMinZoom") ){
			minZoom = Number(imgE.getAttribute("visibleMinZoom"))/100;
		} else if (parentProps && parentProps.minZoom){
			minZoom = parentProps.minZoom;
		}
		if ( imgE.getAttribute("visibleMaxZoom") ){
			maxZoom = Number(imgE.getAttribute("visibleMaxZoom"))/100;
		} else if (parentProps && parentProps.maxZoom){
			maxZoom = parentProps.maxZoom;
		}
	} else {
		if ( imgE.getAttribute("visibleMinZoom") ){
			minZoom = Number(imgE.getAttribute("visibleMinZoom"))/100;
		} else if (parentProps && parentProps.minZoom){
			minZoom = parentProps.minZoom;
		}
		if ( imgE.getAttribute("visibleMaxZoom") ){
			maxZoom = Number(imgE.getAttribute("visibleMaxZoom"))/100;
		} else if (parentProps && parentProps.maxZoom){
			maxZoom = parentProps.maxZoom;
		}
	}
	
	var visible = true;
	if ( imgE.getAttribute("visibility") == "hidden" || imgE.getAttribute("display") == "none" ){
		visible = false;
	}
	var opacity = Number(imgE.getAttribute("opacity"));
//	console.log("getImageProp: Opacity:" + opacity);
	if ( opacity > 1 || opacity < 0){
		opacity = 1;
	}
	
	return {
		x : x ,
		y : y ,
		width : width ,
		height : height ,
		href : href ,
		opacity : opacity ,
		minZoom : minZoom ,
		maxZoom : maxZoom ,
		metadata : meta ,
		title : title ,
		visible : visible ,
		elemClass : elemClass ,
		transform : transform ,
		text : text ,
		cdx : cdx ,
		cdy : cdy ,
		nonScaling : nonScaling , 
		href_fragment : href_fragment
	}
}


// HTTP通信用、共通関数
function createXMLHttpRequest(cbFunc){
//	console.log("createXMLHttpRequest:" + cbFunc);
	var XMLhttpObject = null;
	try{
		XMLhttpObject = new XMLHttpRequest();
//		console.log("use standard ajax");
	}catch(e){
		try{
			XMLhttpObject = new ActiveXObject("Msxml2.XMLHTTP");
//			console.log("use Msxml2.XMLHTTP");
		}catch(e){
			try{
				XMLhttpObject = new ActiveXObject("Microsoft.XMLHTTP");
//				console.log("use Microsoft.XMLHTTP");
			}catch(e){
				return null;
			}
		}
	}
	if (XMLhttpObject) XMLhttpObject.onreadystatechange = cbFunc;
//	XMLhttpObject.withCredentials = true; // 認証情報をCORS時に入れる(ちょっと無条件は気になるが・・ CORSがワイルドカードだとアクセス失敗するので一旦禁止) 2016.8.23
	return XMLhttpObject;
}

function getAjaxFilter() {
	if (navigator.appVersion.indexOf("KHTML") > -1) {
		return function(t) {
			var esc = escape(t);
			return (esc.indexOf("%u") < 0 && esc.indexOf("%") > -1) ? decodeURIComponent(esc) : t
		}
	} else {
		return function(t) {
			return t;
		}
	}
}

function getCanvasSize(){ // 画面サイズを得る
	var w = window.innerWidth;
	var h = window.innerHeight;
	if ( !w ) {
//		w = document.body.clientWidth;
		w = document.documentElement.clientWidth;
//		h = document.body.clientHeight;
		h = document.documentElement.clientHeight;
	}
//	console.log( "width:" , w , " height:" , h );
	return {
		width : w,
		height : h,
		x : 0,
		y : 0
		
	}
}

function isIntersect( sec1 , sec2 ){
//	console.log( sec1 , sec2 );
	var ans = false;
	if ( sec1.x > sec2.x + sec2.width || sec2.x > sec1.x + sec1.width 
	 || sec1.y > sec2.y + sec2.height || sec2.y > sec1.y + sec1.height ){
		return ( false );
	} else {
		return ( true );
	}
}

function getBBox( x , y , width , height ){
	return {
		x: x,
		y: y,
		width: width,
		height: height
	}
}

// 指定したimageIdのSVG文書のchildを全消去する
function removeChildDocs( imageId ){
	if ( svgImages[imageId] && !svgImagesProps[imageId].editable){
//		console.log("remove:" + imageId);
//		var anims = Array.prototype.slice.call(svgImages[imageId].documentElement.getElementsByTagName("animation"));
//		anims = anims.concat(Array.prototype.slice.call(svgImages[imageId].documentElement.getElementsByTagName("iframe")));
		var anims = getLayers(imageId);
		for ( var i = 0 ; i < anims.length ; i++ ){
			removeChildDocs( anims[i].getAttribute("iid") );
		}
//		console.log("delete",svgImage[imageId]);
//		svgImages[imageId] = null;
//		svgImagesProps[imageId] = null;
		delete svgImages[imageId];
		delete svgImagesProps[imageId];
	}
}

function initNavigationButtons( isSP ){
	if ( isSP ){
		document.getElementById("zoomupButton").width = "60";
		document.getElementById("zoomupButton").height = "60";
		document.getElementById("zoomdownButton").width = "60";
		document.getElementById("zoomdownButton").height = "60";
		document.getElementById("zoomdownButton").style.top = "70px";
	}
	
	document.getElementById("zoomupButton").style.cursor = "pointer";
	document.getElementById("zoomdownButton").style.cursor = "pointer";
	
}


function setPointerEvents(){
//	console.log("set Pointer Events :" + navigator.appName  );
//	document.documentElement.addEventListener("mousedown",startPan,false);
//	document.documentElement.addEventListener("mouseup",endPan,false);
//	document.documentElement.addEventListener("mousemove",showPanning,false);
//	window.captureEvents(Event.CLICK); // これなに？
	if (verIE >8){
		addEvent(document, "contextmenu", function(e){
			e.preventDefault();
		});
		addEvent(mapcanvas, "click", function(e){
			e.preventDefault();
		}, false);
		addEvent(mapcanvas, "mousedown", function(e){
			e.preventDefault();
		}, false);
	}
	
	if ( verIE >8 ){ // !isIEから変更（たぶんもう不要？ 2014.6.29)
		if ( isSP ){ // タッチパネルデバイスの場合(POIが選べない・・2013/4/4)
			var mc = document.getElementById("mapcanvas");
			
			addEvent(mc, "touchstart", function(e){ // 2014/06/03
				e.preventDefault();
			});
			addEvent(mc, "touchend", function(e){
				e.preventDefault();
			});
			addEvent(mc, "touchmove", function(e){
				e.preventDefault();
			});
			
			addEvent(mc, "touchstart", startPan);
			addEvent(mc, "touchend", endPan);
			addEvent(mc, "touchmove", showPanning);
			addEvent(window, "resize", refreshWindowSize);
			/**
			mc.ontouchstart = startPan;
			mc.ontouchend = endPan;
			mc.ontouchmove = showPanning;
			window.onresize = refreshWindowSize;
			**/
		} else {
			// 緯度経度文字を選べるようにね/ 2012/12/07
			var mc = document.getElementById("mapcanvas");
			/**
			mc.onmousedown = startPan;
			mc.onmouseup = endPan;
			mc.onmousemove = showPanning;
			window.onresize = refreshWindowSize;
			**/
			
			addEvent(mc,"mousedown",startPan);
			addEvent(mc,"mouseup",endPan);
			addEvent(mc,"mousemove",showPanning);
			addEvent(window,"resize",refreshWindowSize);
			
//			document.onmousedown = startPan; // mozillaなどでプルダウンが効かなくなる？
//			document.onmouseup = endPan;
//			document.onmousemove = showPanning;
//			window.onmousedown = startPan;
//			window.onmouseup = endPan;
//			window.onmousemove = showPanning;
			
//			window.onmousedown = startPan;
//			window.onmouseup = endPan;
//			window.onmousemove = showPanning;
//			window.onresize = refreshWindowSize;
		}
	} else { // IEの場合
		document.onmousedown = startPan;
		document.onmouseup = endPan;
		document.onmousemove = showPanning;
		document.onresize = refreshWindowSize;
	}
	
	if( typeof window.onmousewheel != 'undefined' ){
		window.onmousewheel = testWheel;
	} else if( window.addEventListener ){
		window.addEventListener( 'DOMMouseScroll', testWheel, false );
	}
	
}

function testWheel( evt ){
//	console.log("Wheel:",evt,evt.wheelDelta );
	if (evt.detail < 0 || evt.wheelDelta > 0 ){
		zoomup();
	} else {
		zoomdown();
	}
}


var verIE = 100;
function configIE(){
	var apv = navigator.appVersion.toLowerCase();
	if ( apv.indexOf('msie')>-1 ){
		verIE = parseInt(apv.replace(/.*msie[ ]/,'').match(/^[0-9]+/));
	} else {
		verIE = parseInt(apv.match(/(msie\s|rv:)([\d\.]+)/)[2]);
//		isIE = false; // test
	}

//	console.log ("isIE: ver:" + verIE);
	
	if (!Array.indexOf) {
		Array.prototype.indexOf = function(o) {
			for (var i in this) {
				if (this[i] == o) {
					return i;
				}
			}
			return -1;
		}
	}
	
	if (typeof DOMParser == "undefined") {
//		console.log("no DOMParser build it");
		DOMParser = function () {}

		DOMParser.prototype.parseFromString = function (str, contentType) {
			if (typeof ActiveXObject != "undefined") {
//	      	console.log("SET DOMPSR by MSXML.DomDocument");
				var d = new ActiveXObject("MSXML.DomDocument");
				d.loadXML(str);
				return d;
			} else if (typeof XMLHttpRequest != "undefined") {
				var req = new XMLHttpRequest;
				req.open("GET", "data:" + (contentType || "application/xml") +
					";charset=utf-8," + encodeURIComponent(str), false);
				if (req.overrideMimeType) {
					req.overrideMimeType(contentType);
				}
				req.send(null);
				return req.responseXML;
			}
		}
	}
	if (document.all && !window.setTimeout.isPolyfill) {
		var __nativeST__ = window.setTimeout;
		window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
			var aArgs = Array.prototype.slice.call(arguments, 2);
			return __nativeST__(vCallback instanceof Function ? function () {
				vCallback.apply(null, aArgs);
			} : vCallback, nDelay);
		};
		window.setTimeout.isPolyfill = true;
	}
	
	if (!('console' in window)) { // console.log issue when no dev window 2013/8/19
		window.console = {};  
		window.console.log = function(data){  
			// do nothing
			// return data;  
		};
	} 
}


function checkSmartphone(){ // Mobile Firefox & Firefox OS 2012/12
	if (navigator.userAgent.indexOf('iPhone') > 0 ||
		navigator.userAgent.indexOf('iPad') > 0 ||
		navigator.userAgent.indexOf('iPod') > 0 ||
		navigator.userAgent.indexOf('Android') > 0 ||
		( navigator.userAgent.indexOf('Mobile') > 0 && navigator.userAgent.indexOf('Gecko') > 0 )
	) {
//		alert("smartphone");
		return ( true );
	} else {
		return ( false );
	}
}


// 中心座標を提供するUIのオプション(2012/12/7)
function setCenterUI(){
	// 照準を中心位置に
	if (document.getElementById("centerSight") ){
		var centerSight = document.getElementById("centerSight");
		centerSight.style.position = "absolute";
		centerSight.style.top = ((mapCanvasSize.height / 2) - document.getElementById("centerSight").height / 2 ) + "px";
		centerSight.style.left = ((mapCanvasSize.width / 2) - document.getElementById("centerSight").width / 2 ) + "px";
		initTicker(); // 照準があるときは、Ticker機能をONにする 2013/1/11
		
		// 照準をクリックするとオブジェクトを問い合わせる機能を実装(2013/12/05)
		addEvent(centerSight, "mousedown", testCSclick);
		/**
		if ( isIE ){
			centerSight.attachEvent('onclick',testCSclick);
//			ticker.setAttribute("onclick", "testPOIclick()");
		} else {
			centerSight.addEventListener("click",testCSclick,false);
		}
		**/
		
	}
	if (document.getElementById("centerPos") ){
		centerPos = document.getElementById("centerPos");
	} else {
		centerPos = null;
	}
	if (document.getElementById("vScale") ){
		vScale = document.getElementById("vScale");
	} else {
		vScale = null;
	}
	
	
}

function putCmt( cmt ){
	var posCmt = document.getElementById("posCmt");
	posCmt.innerHTML = cmt;
}

// 中心緯経度書き換え
function updateCenterPos() {
	if ( centerPos ){
		var cent = getCentralGeoCoorinates()
//		console.log("centralGeo:", cent.lat , cent.lng);
		centerPos.innerHTML = round(cent.lat,6) + " , " + round(cent.lng,6);
	}
	if ( vScale ){ // 50pxのたてスケールに相当する長さをKmで表示
		vScale.innerHTML = round(getVerticalScreenScale( 50 ), 3 ) + "Km";
	}
}

// 小数点以下の丸め関数です
function round(num, n) {
  var tmp = Math.pow(10, n);
  return Math.round(num * tmp) / tmp;
}

function getVerticalScreenScale( screenLength ){
	// input: px, return : Km
	var p1 = screen2Geo(1, 1);
	var p2 = screen2Geo(1, 1 + screenLength);
	var vs = p1.lat - p2.lat;
	return ( vs * 111.111111 );
}

//グローバル変数 rootViewBox,rootCrsから画面中心地理座標を得る
function getCentralGeoCoorinates(){
	var rscx = rootViewBox.x + rootViewBox.width / 2.0;
	var rscy = rootViewBox.y + rootViewBox.height / 2.0;
	
	var geoCentral = SVG2Geo( rscx , rscy , rootCrs );
	return geoCentral
}

function screen2Geo( screenX , screenY ){ // 画面上の座標(px)を指定すると、その地理座標を返す
	var sx , sy;
	if ( ! screenY ){
		sx = screenX.x;
		sy = screenX.y;
	} else {
		sx = screenX;
		sy = screenY;
	}
	var relScX = rootViewBox.width  * sx / mapCanvasSize.width ;
	var relScY = rootViewBox.height * sy / mapCanvasSize.height;
	
	var rscx = rootViewBox.x + relScX;
	var rscy = rootViewBox.y + relScY;
	
	var geoPoint = SVG2Geo( rscx , rscy , rootCrs );
	return geoPoint
}

function geo2Screen( lat ,lng ){
	var latitude ,longitude;
	
	if ( !lng ){
		latitude = lat.lat;
		longitude = lat.lng;
	} else {
		latitude = lat;
		longitude = lng;
	}
	
	var rootXY = Geo2SVG(latitude , longitude , rootCrs);
	
	return {
		x : (rootXY.x - rootViewBox.x) * mapCanvasSize.width  / rootViewBox.width ,
		y : (rootXY.y - rootViewBox.y) * mapCanvasSize.height / rootViewBox.height
	}
}

// 中心地理座標を指定して地図を移動 (radiusは緯度方向の度1≒110Km) 2012/12/7
// lat,lng:必須 radius:オプション(今の縮尺のまま移動) ( setGeoViewPort(lat,lng,h,w) という関数もあります )
function setGeoCenter( lat , lng , radius){
	if (!lat || !lng){
		return;
	}
	hideAllTileImgs(); // 2014.6.10
	var vw , vh;
	if ( ! radius ){
		// シフトだけさせるといいかな
		vh = rootViewBox.height;
		vw = rootViewBox.width;
	} else {
		vh = Math.abs(rootCrs.d * radius); // SVGの縦幅
		vw = vh * rootViewBox.width / rootViewBox.height;
	}
	
	var rsc = Geo2SVG( lat , lng , rootCrs ); // 中心のSVG座標
	var vx = rsc.x - vw / 2.0;
	var vy = rsc.y - vh / 2.0;
	
	rootViewBox.x = vx;
	rootViewBox.y = vy;
	rootViewBox.width = vw;
	rootViewBox.height = vh;
	
	var s2c = getRootSvg2Canvas( rootViewBox , mapCanvasSize );
	action = "zoom";
	dynamicLoad( "root" , mapCanvas );
}

// 地理(グローバル)座標系で指定したエリアを包含する最小のviewportを設定する
function setGeoViewPort( lat, lng, latSpan , lngSpan ){
//	console.log("call setGeoViewPort: ", lat, lng, latSpan , lngSpan );
	if (  !latSpan || !lngSpan ){
		return ( false );
	}
	
	hideAllTileImgs();
	
	rootViewBox = getrootViewBoxFromGeoArea( lat, lng, latSpan , lngSpan , ignoreMapAspect);
	
	var s2c = getRootSvg2Canvas( rootViewBox , mapCanvasSize );
	action = "zoom";
	
	dynamicLoad( "root" , mapCanvas );
	return ( true );
}

function getrootViewBoxFromGeoArea( lat, lng, latSpan , lngSpan , ignoreMapAspect ){
	
	var svgSW = Geo2SVG( lat , lng , rootCrs );
	var svgNE = Geo2SVG( lat + latSpan , lng + lngSpan , rootCrs );
//	console.log("svgsw:",svgSW , " svgne:",svgNE);
	// upper values are not cared aspect...
	
	var vb = new Object();
	vb.x = svgSW.x;
	vb.y = svgNE.y;
	vb.width  = Math.abs(svgNE.x - svgSW.x);
	vb.height = Math.abs(svgSW.y - svgNE.y);
	
	var ans;
	if ( ignoreMapAspect ){
		ans = vb;
	} else {
		ans = getrootViewBoxFromRootSVG( vb , mapCanvasSize );
	}
	return ( ans );
}


function setGps(){
	var gpsb = document.getElementById("gpsButton");
	if (gpsb) {
		if ( navigator.geolocation){
//			alert( "I can use GPS!");
			if ( isSP ){
				gpsb.width = "60";
				gpsb.height = "60";
				gpsb.style.top = "135px";
			}
		} else {
			gpsb.style.display="none";
//			alert( "I can NOT use GPS..");
		}
		gpsb.style.cursor = "pointer";
	}
}

function gps(){
	navigator.geolocation.getCurrentPosition( gpsSuccess );
}

function gpsSuccess(position){
//	alert("lat:" + position.coords.latitude + " lng:" + position.coords.longitude + " acc:" + position.coords.accuracy);
	setGeoCenter( position.coords.latitude , position.coords.longitude , position.coords.accuracy * 10 / 100000  );

}

//function testCenter(){
//	setGeoCenter( 35.979891 , 139.75279 , 0.03);
//}


function printProperties(obj) {
//	console.log("PrintProps:");
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n";
    }
    return(properties);
}

	// レイヤーのID,title,番号,href(URI)のいずれかで、コンテナSVGDOMにおけるレイヤーの(svg:animation or svg:iframe)要素を取得する
function getLayer(layerID_Numb_Title){
	var layer;
	var isSVG2 = svgImagesProps["root"].isSVG2;
	if ( isNaN( layerID_Numb_Title ) ){ // 文字列(ハッシュ)の場合
		layer = getElementByImgIdNoNS( svgImages["root"] , layerID_Numb_Title ); // ID(レイヤーのハッシュキー)で検索
		if ( ! layer ){ // タイトルで検索
			var layers = getLayers();
			for ( var i = 0 ; i < layers.length ; i++ ){
				if ( layers[i].getAttribute("title") == layerID_Numb_Title ){
					layer = layers[i];
					break;
				} else if ( isSVG2 && layers[i].getAttribute("src") == layerID_Numb_Title ){
					layer = layers[i];
					break;
				} else if ( layers[i].getAttribute("xlink:href") == layerID_Numb_Title ){
					layer = layers[i];
					break;
					
				}
			}
		}
	} else {
//		console.log((svgImages["root"].getElementsByTagName("animation")));
		if ( isSVG2 ){
			layer = (svgImages["root"].getElementsByTagName("iframe"))[ layerID_Numb_Title ];
		} else {
			layer = (svgImages["root"].getElementsByTagName("animation"))[ layerID_Numb_Title ];
		}
	}
//	console.log("call getLayer:" , layer);
	return ( layer );
}

// レイヤーのID,title,番号のいずれかでレイヤーの表示状態を変化する (この関数は使われていない)
function switchLayer( layerID_Numb_Title ,  visibility ){
	var layer = getlayer( layerID_Numb_Title );
	if ( layer ){
		if ( visibility == true || visibility == "visible"){
			layer.setAttribute("visibility" , "visible");
		} else {
			layer.setAttribute("visibility" , "hidden");
		}
		action = "pan";
		dynamicLoad( "root" , mapCanvas );
		return ( true );
	} else {
		return ( false );
	}
}

function isEditingLayer( layer ){
	// パラメータがある場合
	// 指定したレイヤーが編集中のレイヤーかどうか
	// input:ルートコンテナのレイヤーに該当する要素
	// パラメータがない場合
	// 編集中のレイヤーがある場合はそのレイヤーのsvg:anim or svg:iframe要素を返却する
	
	if ( layer ){
		var layerId = layer.getAttribute("iid");
		if ( svgImagesProps[layerId] && svgImagesProps[layerId].editing ){
			return ( true );
		} else {
			return ( false );
		}
	} else {
		for ( var key in svgImagesProps ){
			if ( svgImagesProps[key].editing == true ){
				var rootdoc = svgImages["root"].documentElement;
//				console.log(rootdoc.nodeName,rootdoc.childNodes.length, getElementByImgIdNoNS( svgImages["root"] , key));
//				for ( var i = 0 ; i < rootdoc.childNodes.length ; i++){
//					console.log(rootdoc.childNodes[i].nodeName,rootdoc.childNodes[i].nodeType);
//					if ( rootdoc.childNodes[i].nodeType==1){
//						console.log(rootdoc.childNodes[i].getAttribute("id"),rootdoc.childNodes[i].id);
//					}
//				}
				return ( getElementByImgIdNoNS( svgImages["root"] , key) );
			}
		}
		return ( null );
	}
}


// レイヤーのID,title,番号のいずれかでレイヤーの表示状態をトグルする
// その結果は、ルートコンテナSVGのvisibilityと、対応するsvgImegsPropsのeditingフラグに反映する
function toggleLayer( layerID_Numb_Title  ){
	if (! layerID_Numb_Title ){ return };
//	console.log("call toggleLayer:",layerID_Numb_Title);
	var layer = getLayer( layerID_Numb_Title );
	if ( layer ){
//		console.log(layer.getAttribute("title"),layerID_Numb_Title);
		if ( isEditableLayer(layer) && !( layer.getAttribute("visibility" ) == "hidden" || layer.getAttribute("display" ) == "none" ) ){
			//編集可能レイヤで表示中(非表示じゃない)
			if ( isEditingLayer(layer)){
				//編集中の場合は、非編集にする。表示非表示制御は、そのポリシーに任せる。
				svgImagesProps[layer.getAttribute("iid")].editing = false;
			} else {
				//非編集の場合は、表示中のまま編集中にする。同時に他の編集中レイヤを非編集にする。
				svgImagesProps[layer.getAttribute("iid")].editing = true;
				return;
			}
		//編集可能レイヤで非表示の場合は、表示非表示制御のみ。編集モードの切り替えは関係ない。
		}
		var ans = checkLayerSwitch( layer );
		if ( ans instanceof Boolean && ans == false ){
			// なにもしない
		} else {
			if ( layer.getAttribute("visibility" ) == "hidden" || layer.getAttribute("display" ) == "none" ){
				layer.setAttribute("visibility" , "visible");
			} else {
				layer.setAttribute("visibility" , "hidden");
			}
			if ( ans instanceof Array ){
				for ( var i = 0 ; i < ans.length ; i++ ){
					ans[i].setAttribute("visibility" , "hidden");
				}
			}
//			console.log(svgImages["root"]);
			action = "pan";
			dynamicLoad( "root" , mapCanvas );
		}
	} else { // layerでなくバッチグループの場合
//		console.log("this ID might be a batch gruop. :"+ layerID_Numb_Title);
		var bac = layerID_Numb_Title.split(" ");
		var batchLayers = getSwLayers( "batch" ); 
		
//		console.log(batchLayers[bac[1]]);
		// ひとつでもhiddenがあれば全部visibleに　一つもないときは全部hiddenにする
		var bVisibility = "hidden";
		for ( var i = 0 ; i < batchLayers[bac[1]].length ; i++){
			if ( (batchLayers[bac[1]])[i].getAttribute("visibility" ) == "hidden"){
				bVisibility = "visible";
				break;
			}
		}
		for ( var i = 0 ; i < batchLayers[bac[1]].length ; i++){
			(batchLayers[bac[1]])[i].setAttribute("visibility" , bVisibility);
		}
		
		action = "pan";
		dynamicLoad( "root" , mapCanvas );
		
	}
}

function isClickableLayer( layerId ){
	var ans = false;
	return ( ans );
}

function isEditableLayer( layer ) {
	// ルートSVG文書の各要素が編集可能かどうかを返却する
	// もしくは、SVGLayerのid(hash key)で、そのidのレイヤーが編集可能かどうかを返却する
//	console.log("call isEditableLayer",layer);
	if ( typeof(layer) == "string" ){ // hash key
		layers = getEditableLayers();
		for ( var i = 0 ; i < layers.length ; i++ ){
			if ( layers[i].getAttribute("iid") == layer ){
				return ( true );
			}
		}
		return ( false );
	} else { // svg element
		if ( layer.getAttribute("class") && layer.getAttribute("class").indexOf("editable")>=0){
			return ( true );
		} else {
			return ( false );
		}
	}
//	var eLayers = getEditableLayers();
//	console.log("isEditable?",eLayers);
//	for ( var i = 0 ; i < eLayers.length ; i++ ){
//		if ( eLayers[i] == layer ){
//			console.log("true");
//			return ( true );
//		}
//	}
//	console.log("false");
//	return ( false );
}

function getEditableLayers(){
	// 編集可能レイヤーの全リストを構築する。
	var eLayers = new Array();
	var layers = getLayers();
	for ( var i = 0 ; i < layers.length ; i++ ){
		if ( isEditableLayer( layers[i] ) ){
			eLayers.push(layers[i]);
//			console.log("editable:",layers[i]);
		}
	}
	return ( eLayers );
}

function removeLayerCatName( layerClass , kwd1 , kwd2 , kwd3 , kwd4 , kwd5 ){
	if ( kwd1 && layerClass.indexOf(kwd1) != -1 ){
		layerClass.splice( layerClass.indexOf(kwd1) ,1 );
	}
	if ( kwd2 && layerClass.indexOf(kwd2) != -1 ){
		layerClass.splice( layerClass.indexOf(kwd2) ,1 );
	}
	if ( kwd3 && layerClass.indexOf(kwd3) != -1 ){
		layerClass.splice( layerClass.indexOf(kwd3) ,1 );
	}
	if ( kwd4 && layerClass.indexOf(kwd4) != -1 ){
		layerClass.splice( layerClass.indexOf(kwd4) ,1 );
	}
	if ( kwd5 && layerClass.indexOf(kwd5) != -1 ){
		layerClass.splice( layerClass.indexOf(kwd5) ,1 );
	}
	return ( layerClass );
}

function getSwLayers( cat ){
//	console.log("call getSwLayers");
	// swLayers[クラス名]に、クラス名ごとのレイヤー(のSVG要素)の全リストを構築する
	// catがある場合は、catの名称を持つもののリストのみを構築する
	var swLayers = new Array();
	var layers = getLayers();
	for ( var i = 0 ; i < layers.length ; i++ ){
		if ( layers[i].getAttribute("class") ){
//			console.log(layers[i].getAttribute("class")+ " : " + layers[i].getAttribute("title"));
			var layerClass = (layers[i].getAttribute("class")).split(" ");
			
			if ( cat && layerClass.indexOf(cat)== -1 ){
				continue;
			}
			
			layerClass = removeLayerCatName( layerClass , "switch" , "batch" , "editable" , "clickable" );
			
			
			for ( j = 0 ; j < layerClass.length ; j++ ){
				if ( !swLayers[layerClass[j]] ){
					swLayers[layerClass[j]] = new Array();
				}
//				console.log("push "+ layerClass[j] );
//				console.log("of "+ layers[i].getAttribute("title") );
				
				swLayers[layerClass[j]].push(layers[i]);
			}
		}
	}
//	console.log("LIST UP");
//	for ( var i in swLayers ){
//		console.log(i);
//		for ( var j = 0 ; j < swLayers[i].length ; j++){
//			console.log(swLayers[i][j].getAttribute("title"));
//		}
//	}	
	return ( swLayers );
	
}

function checkLayerSwitch( selectedLayer ){
	// 選択したレイヤーの表示非表示が切り替えられるかどうか、切り替えられるとしてその代わりに選択を外すレイヤーあればそのリスト(array)を返す。(なければ単にtrue)
//	console.log("Call checkLayerSwitch");
	var selectedLayerClass;
	if ( selectedLayer.getAttribute("class")) {
		selectedLayerClass = selectedLayer.getAttribute("class").split(" ");
		
//		selectedLayerClass = removeLayerCatName( selectedLayerClass , "batch" , "editable" , "clickable" ); じゃないの? 2014.08
		selectedLayerClass = removeLayerCatName( selectedLayerClass , "batch" , "editable" );
		
	} else {
//		console.log("No Class");
		// classが設定されていないレイヤーはＯＫを返す
		return(true);
	}
	
//	console.log("selectedLayerClass:" + selectedLayerClass);
	
	if ( selectedLayerClass.indexOf("switch") != -1 ){
		if ( selectedLayer.getAttribute("visibility") == "hidden" || selectedLayer.getAttribute("display") == "none" ){
			// 表示されていないものを表示させる
			
			selectedLayerClass.splice( selectedLayerClass.indexOf("switch") ,1 );
			
			
			// 代わりに非表示にすべきレイヤーのリストを生成する
			// スイッチ型レイヤーリストを得る
			var swLayers = getSwLayers();
//			console.log("swLayers:" + swLayers);
			var invisibleLayers = new Array();
			
			for ( var i = 0 ; i < selectedLayerClass.length ; i++ ){
				var sl = swLayers[ selectedLayerClass[i] ];
				for ( var j = 0 ; j < sl.length ; j++ ){
					if ( sl[j] != selectedLayer ){
						invisibleLayers.push(sl[j]);
					}
				}
			}
			
//			console.log( "invisibleLayers:" );
//			for ( var i = 0 ; i < invisibleLayers.length ; i++ ){
//				console.log( invisibleLayers[i].getAttribute("title") );
//			}
			delete swLayers;
			
			return ( invisibleLayers );
			
		} else {
//			console.log("Stay Visible!!");
			// スイッチ型の場合、表示されているものを選ぶことはできないということにして、ＮＧを返す
			return ( false );
		}
	} else {
//		console.log("No Switch Layer");
		// スイッチ型レイヤーでないときもＯＫを返す
		return ( true );
	}
}

// ルートのコンテナにある、animation|iframeを"Layers"と定義
// レイヤーをリストアップする
function getLayers( id ){
	if (!id){
		id = "root";
	}
	
//	var layers = getElementsByDualTagName( svgImages[id] , "animation" , "iframe" ); // SVG2正式対応のため廃止
	var layers;
	if ( svgImagesProps[id].isSVG2 ){ // 文書の形式を判別してからレイヤーの判断を実施
		layers = svgImages[id].getElementsByTagName( "iframe" );
	} else {
		layers = svgImages[id].getElementsByTagName( "animation" );
	}
	
	
	/**
	var layers;
	if (  verIE > 8  ){
		layers = Array.prototype.slice.call(svgImages[id].getElementsByTagName(param1));
		layers = layers.concat(Array.prototype.slice.call(svgImages[id].getElementsByTagName(param2)));
	} else {
		layers = new Array();
		var anims = svgImages[id].getElementsByTagName(param1);
		for ( var i = 0 ; i < anims.length ; i++ ){
			layers.push(anims[i]);
		}
		var iframes = svgImages[id].getElementsByTagName(param2);
		for ( var i = 0 ; i < iframes.length ; i++ ){
			layers.push(iframes[i]);
		}
	}
	**/
	/**
	console.log("total:" + layers.length + " Layers");
	for ( var i = 0 ; i < layers.length ; i++ ){
		console.log( "layer:" + i + " : " + layers[i].id + " : " + layers[i].getAttribute("xlink:href") );
		if (svgImagesProps[layers[i].id]){
			console.log( svgImagesProps[layers[i].id]);
		} else {
			console.log( "not Loaded" );
		}
	}
	**/
	return ( layers );
}

function getElementsByDualTagName( doc , tagn1 , tagn2 ){
	var layers;
	if (  verIE > 8  ){
		layers = Array.prototype.slice.call(doc.getElementsByTagName(tagn1));
		layers = layers.concat(Array.prototype.slice.call(doc.getElementsByTagName(tagn2)));
	} else {
		layers = new Array();
		var anims = doc.getElementsByTagName(tagn1);
		for ( var i = 0 ; i < anims.length ; i++ ){
			layers.push(anims[i]);
		}
		var iframes = doc.getElementsByTagName(tagn2);
		for ( var i = 0 ; i < iframes.length ; i++ ){
			layers.push(iframes[i]);
		}
	}
	return ( layers );
}

var currLayerUIStat= new Array(); // バッチグループ全選択状態(バッチレイヤ群が全選択されていたばあいにtrue)
function setLayerUI(){
//	console.log("setLayerUI");
	if (document.getElementById("layer") ){
		layerUI = document.getElementById("layer");
		
		// remove past opts
		for (var i = layerUI.childNodes.length-1; i>=0; i--) {
			layerUI.removeChild(layerUI.childNodes[i]);
		}
		
		if ( layerUI.multiple ){
			layerUImulti = true;
//			console.log("multipleUI");
		}
		
		var batchLayers = getSwLayers( "batch" ); // バッチカテゴリのレイヤーを得る
//		var batchLayers = getSwLayers(  );
		
		
		
//		console.log("found Layer:" + layerUI);
		var layers = getLayers();
//		console.log("layerCount:" + layerUI.length );
		var lcount;
		if ( !layerUImulti ){
			var opt = document.createElement("option");
			opt.innerHTML = "=LAYER=";
			layerUI.appendChild(opt);
			lcount = 1;
		} else {
			lcount = 0;
		}
		var layerGroup = new Array();
		var jqMultiBlankGroup = null; // JQueryUIのmultiselect plugの場合、optgroupに属さないレイヤをblankのoptgに格納して見やすくする
		var jqMultiBlankLabel =""; // ラベルが同じだとoptgroupできないぞ・・
		for ( var i = layers.length - 1  ; i >= 0 ; i-- ){
			var sel = false;
			var layerGroupName ="";
			
			if ( layers[i].getAttribute("class")){
				var layerGroupNames = removeLayerCatName( layers[i].getAttribute("class").split(" ") , "switch" , "batch" , "editable" , "clickable" );
				if ( layerGroupNames.length > 0 ){
					layerGroupName = layerGroupNames[0];
				}
			}
			
			if ( layerGroupName ){
				// バッチ||スイッチ レイヤー グループ
//				console.log("found batch:",layers[i].getAttribute("class"));
//				console.log("name:",layerGroupName);
				if ( !layerGroup[layerGroupName]  ){
				
					layerGroup[layerGroupName] = new Object();
					layerGroup[layerGroupName].optgroup=document.createElement("optgroup");
					layerGroup[layerGroupName].optgroup.label = layerGroupName;
//					layerGroup[layerGroupName].optgroup.label = "";
					layerUI.appendChild(layerGroup[layerGroupName].optgroup);
					
					if (layers[i].getAttribute("class").split(" ").indexOf("batch")!=-1){
						// バッチレイヤーの場合の処理
						// バッチレイヤーの"全選択*"項目を記載する
						var opt = document.createElement("option");
						layerGroup[layerGroupName].optgroup.appendChild(opt);
						opt.value = "batch " +layerGroupName;
//						opt.innerHTML = layerGroupName + "/ *";
						opt.innerHTML = "[ALL]";
	//					layerUI.appendChild(opt);
						
						var blStyle ="color:#2020FF";
						sel = true;
						var batchLayers = getSwLayers( "batch" ); 
						for ( var ii = 0 ; ii < batchLayers[layerGroupName].length ; ii++){
							if ( (batchLayers[layerGroupName])[ii].getAttribute("visibility" ) == "hidden"){
								blStyle ="color:#A0A0FF";
								sel = false;
								break;
							}
						}
						if (!isIE || !layerUImulti ){ // IEでmultipleの場合とにかくバグがひどい
							opt.setAttribute("style" , blStyle);
						}
						if ( sel ){
							opt.selected = true;
						} else {
							opt.selected = false;
						}
						currLayerUIStat[lcount] = sel;
						++lcount;
						sel = false;
					}
				}
				jqMultiBlankGroup = null;
			} else if (typeof  $ != "undefined" && $("#layer").multiselect ){
				// jquery ui multiselectの場合、グループのないレイヤーがグループのあるレイヤーと区別つかなくなる問題があるので、それを回避するために無名のグループに入れる・・
				if ( jqMultiBlankGroup == null ){
					jqMultiBlankGroup = document.createElement("optgroup");
					jqMultiBlankGroup.label = jqMultiBlankLabel;
					jqMultiBlankLabel += " "; // とほほ 完全に裏技だよね・・
					layerUI.appendChild( jqMultiBlankGroup );
				}
			}
			
			var optTarget;
			if ( layerGroupName ){
				optTarget = layerGroup[layerGroupName].optgroup;
			} else if ( jqMultiBlankGroup ) {
				optTarget = jqMultiBlankGroup;
			} else {
				optTarget = layerUI;
			}
			
//			var optText = layerGroupName + "/";
			var optText ="";
			optText += getLayerName( layers[i] );
			
			var style = "color:#000000";
			
			if ( layers[i].getAttribute("visibility") == "hidden" || layers[i].getAttribute("display" ) == "none" ){
				style = "color:#c0c0FF";
				if ( isSP ){
					optText = "X: " + optText;
				}
			} else {
				sel = true;
				style = "color:#000000";
				if ( isSP ){
					optText = "O: " + optText;
				}
			}
			
//			console.log("isEditing?"+isEditingLayer(layers[i]),layers[i]);
//			console.log("isEditable?"+isEditableLayer(layers[i]),layers[i]);
			if ( isEditingLayer(layers[i]) ){
				optText += " - [[EDITING!]]";
			} else if ( isEditableLayer(layers[i])){
				optText += " - editable";
			}
			
			
			var opt = document.createElement("option");
			optTarget.appendChild(opt);
			opt.innerHTML = optText;
			
			if (!isIE || !layerUImulti ){ // IEでmultipleの場合とにかくバグがひどい 2014.09.04
				opt.setAttribute("style" , style);
			}
			opt.value = layers[i].getAttribute("iid");
			if ( sel ){
				opt.selected = true;
			} else {
				opt.selected = false;
			}
			currLayerUIStat[lcount] = sel;
			++lcount;
			
		}
		if ( !layerUImulti ){
			layerUI.selectedIndex = 0;
		} else {
//			console.log("layerUI.selectedIndex:",layerUI.selectedIndex);
//			layerUI.selectedIndex = -1;
		}
		
		if (typeof  $ != "undefined" && $("#layer").multiselect ){
//		if (typeof jQuery != "undefined" && $("#layer").multiselect ){}
			setTimeout(function(){
				$("#layer").multiselect("refresh");
				if ( $("#layer").multiselect("option").height == "auto" ){
					// windowサイズに対して項目数が多いとautoの場合完全にはみ出すのでそれを抑止する処理 2014.11.21
					// windowサイズの変更に対して追随はしないな・・
					var msd= document.getElementById("layer").nextSibling.getBoundingClientRect();
					
					$("#layer").multiselect({height :  window.innerHeight - (msd.top+100)});
				}
			}, 100);
		}
		
		/**
		if ( isIE ){
//			layerUI.blur(); // IEでmultipleの場合要素を変化させるととまる　なんかこれで直るらしい?
			// http://www.experts-exchange.com/Software/Internet_Email/Web_Browsers/Q_28136890.html
			// 最初の項目は直んないなぁ・・
		}
		**/
	}
}

function getLayerName( layer ){
	var ans="";
	if ( layer.getAttribute("title")){
		ans = layer.getAttribute("title");
	} else {
		ans = layer.getAttribute("xlink:href");
		if ( ! optText ){
			ans = layer.getAttribute("src");
		}
	}
	return ( ans );
}

function layerControl(){
//	console.log("layerControl idx:"+layerUI.selectedIndex , layerUI.options[layerUI.selectedIndex].getAttribute("value"));
	var changedItem;
	var changedCount;
	if (typeof $ != "undefined" && $("#layer").multiselect ){
		var ckd = $("#layer").multiselect("getChecked");
		for ( var j = 0 ; j < ckd.length ; j++ ){
//			console.log(Number(ckd[j].id.substring(1+ckd[j].id.lastIndexOf("-"))));
		}
		var j = 0;
		changedCount = 0;
		for ( var i = 0 ; i < currLayerUIStat.length ; i++ ){
			var UItrue = false;
			if ( ckd[j] && Number(ckd[j].id.substring(1+ckd[j].id.lastIndexOf("-"))) == i ){
				UItrue = true;
				++j;
			}
			if ( UItrue == currLayerUIStat[i] ){
//				console.log("NoChange:",i);
			} else {
//				console.log("Changed!:",i);
				changedItem = i;
				++changedCount;
			}
		}
//		console.log($("#layer").multiselect("getChecked"), currLayerUIStat);
	} else {
		changedCount = 1;
		changedItem = layerUI.selectedIndex;
	}
//	toggleLayer(layerUI.length - 1  - layerUI.selectedIndex);
	if ( changedCount == 1 ){
		toggleLayer(layerUI.options[changedItem].getAttribute("value"));
	}
	setLayerUI();
}


function initTicker(){
//	console.log("INIT Ticker UI");
	var centerSight = document.getElementById("centerSight");
	if ( ! ticker ){
		var parentElem = centerSight.parentNode;
		ticker = document.createElement("span");
		parentElem.insertBefore(ticker , centerSight);
		ticker.style.position = "absolute";
		ticker.style.backgroundColor = "yellow";
		ticker.style.color = "black";
		ticker.style.display="none";
		ticker.style.opacity="0.5";
		ticker.id="ticker";
		ticker.style.cursor="pointer";
	}
	ticker.style.left = (mapCanvasSize.width / 2) + "px";
	ticker.style.top = (mapCanvasSize.height / 2 + centerSight.height / 2) + "px";
	ticker.style.fontSize = "110%";
	ticker.style.fontWeight = "bolder";
//	ticker.innerHTML = "TEST!!!";
}


function checkTicker(){
//	console.log("Check Ticker");
	document.getElementById("centerSight").style.display="none";
	var el = document.elementFromPoint(mapCanvasSize.width / 2, mapCanvasSize.height / 2);
	document.getElementById("centerSight").style.display="";
	
//	console.log(el.title);
	
	if ( el.title ){
		ticker.style.display="";
		ticker.innerHTML = el.title;
//		console.log("Attach event:" + el.title);
		addEvent(ticker, "mousedown", testPOIclick);
		/**
		if ( isIE ){
			ticker.attachEvent('onclick',testPOIclick);
//			ticker.setAttribute("onclick", "testPOIclick()");
		} else {
			ticker.addEventListener("click",testPOIclick,false);
		}
		**/
	} else {
		ticker.style.display="none";
	}
}
	
// ビットイメージのspatial fragmentに応じて、img要素の処理を実装 2015.7.3実装,2015.7.8 改修
function setImgViewport(target, href_fragment){
	var imgBox = href_fragment.split(/\s*,\s*|\s/);
	
//		console.log("Has spatial bitImage fragment : opt:", imgBox );
//		console.log("naturalWH:",target.naturalWidth,target.naturalHeight);
//		console.log("box:",target.style.left,target.style.top,target.width,target.height);
	
	
	var iScaleX = target.width  / Number(imgBox[2]);
	var iScaleY = target.height / Number(imgBox[3]);
	
	var clipX = parseFloat(target.style.left) - iScaleX * Number(imgBox[0]);
	var clipY = parseFloat(target.style.top)  - iScaleY * Number(imgBox[1]);
	var clipWidth  = target.naturalWidth  * iScaleX;
	var clipHeight = target.naturalHeight * iScaleY;
//		console.log("clip:",clipX,clipY,clipWidth,clipHeight);
	target.style.left = clipX +"px";
	target.style.top  = clipY +"px";
	target.width  = clipWidth;
	target.height = clipHeight;
	target.style.clip = "rect(" + Number(imgBox[1])*iScaleY + "px," + (Number(imgBox[0]) + Number(imgBox[2]))*iScaleX + "px," + (Number(imgBox[1]) + Number(imgBox[3]))*iScaleY + "px," + Number(imgBox[0])*iScaleX + "px)";
	
}

function handleLoadSuccess(obj){

	var target = obj.target || obj.srcElement;
//	console.log("call handle load success",target);
	
	var href = target.src;
	
	if ( target.getAttribute("href_fragment")){ // 2015.7.3 spatial fragment
		var href_fragment = target.getAttribute("href_fragment");
		setImgViewport ( target, href_fragment);
		target.removeAttribute("href_fragment"); // もう不要なので削除する（大丈夫？）2015.7.8
	}
	
	
	target.style.display="";
	target.style.visibility="";
//	console.log("LoadSuccess:",target.id,target.style.display);
	delete loadingImgs[target.id];
//	console.log("call checkLoadCompleted : handleLoadSuccess");
	checkLoadCompleted();
}

function timeoutLoadingImg(target){ // ロード失敗した画像を強制的に読み込み完了とみなしてしまう処理
	if ( loadingImgs[target.id] ){
//		console.log("LoadImg TimeOut!!!!!");
		delete loadingImgs[target.id];
//	console.log("call checkLoadCompleted : timeoutLoadingImg");
		checkLoadCompleted();
	}
	
}

var delContainerId = 0;
function requestRemoveTransition( imgElem , parentElem2 ){ // 2013.7.31 debug まだバグがあると思う・・
	var parentElem = imgElem.parentNode;
	// 遅延削除処理のph1
//	console.log(imgElem , parentElem , parentElem2 == imgElem.parentNode);
	var delContainer = null; // テンポラリspan要素
	if ( parentElem.childNodes ){ // すでにtoBeDel* idの要素があればそれをdelContainerとする
		for ( var i = 0 ; i < parentElem.childNodes.length ; i++ ){ // 普通は0で終わりのはず・・・
			if ( parentElem.childNodes[i].nodeType == 1 && parentElem.childNodes[i].id.indexOf("toBeDel")==0 ){ // ELEMENT NODEでidがtoBeDel*
				delContainer = parentElem.childNodes[i];
				break;
			}
		}
		
	}
	
//	console.log("parent:",parentElem,"img",imgElem,"firstChild",parentElem.firstChild);
//	if ( delContainer && delContainer.id.indexOf("toBeDel") == -1 ){
	if ( !delContainer  ){
		// テンポラリspan要素が無い場合は親要素の先頭に設置する
		delContainer = document.createElement("div");
		delContainer.id = "toBeDel" + delContainerId;
//		delContainer.style.display="none"; // for debug 2013.8.20 canvasで遷移中におかしなことになる(原因はほぼ判明)
		parentElem.insertBefore( delContainer , parentElem.firstChild );
		++ delContainerId;
//	} else {
//		delContainer = parentElem.firstChild;
	}
	// 指定した要素をテンポラリspan要素に移動する
	parentElem.removeChild(imgElem);
	delContainer.appendChild(imgElem);
}

var loadCompleted = true;
function checkLoadCompleted( forceDel ){ // 読み込み完了をチェックし、必要な処理を起動する。
//	console.log("hashLen:", getHashLength(loadingImgs), " loading:" , loadingDatas);
	var hl = getHashLength(loadingImgs);
//	console.log("hashLen:", hl, " loadCompl:" , loadCompleted);
	if ( hl == 0  || forceDel ){
//		console.log("do LoadComletion process forceDel:",forceDel);
		//遅延img削除処理を動かす
		for ( var i = 0 ; i < delContainerId ; i++ ){
			var delSpan = document.getElementById("toBeDel"+i);
//			console.log(delSpan);
			if ( delSpan ){
				delSpan.parentNode.removeChild(delSpan);
			}
		}
		delContainerId = 0;
		removeEmptyTiles(  mapCanvas ); // added 2013.9.12
		
		if ( !forceDel &&  !loadCompleted ){
//			console.log("loading Completed");
			loadCompleted = true;
			var customEvent = document.createEvent("HTMLEvents");
			customEvent.initEvent("zoomPanMap", true , false );
			document.dispatchEvent(customEvent);
		}
		loadCompleted = true;
		
		startRefreshTimeout();
		
//		console.log("Load Complete");
		return ( true );
	} else {
		if ( hl == 0 ){
			loadCompleted = true;
		} else {
			loadCompleted = false;
		}
		return ( false );
	}
}

function startRefreshTimeout(){
	for ( var layerId in svgImagesProps ){
		if ( svgImagesProps[layerId].refresh && svgImagesProps[layerId].refresh.timeout >0 ){
			if ( svgImagesProps[layerId].refresh.start == false ){
//				console.log("Start Refresh:",layerId,svgImagesProps[layerId]);
				svgImagesProps[layerId].refresh.start = true;
				svgImagesProps[layerId].refresh.loadScript = true;
				setTimeout(refreshLayer, svgImagesProps[layerId].refresh.timeout * 1000 , layerId );
				
			} else {
//				console.log("Already Started Refresh:",layerId,svgImagesProps[layerId]);
			}
		}
	}
}

function refreshLayer( layerId ){
//	console.log("called refreshLayer",layerId);
	if ( svgImagesProps[layerId] ){
		svgImagesProps[layerId].refresh.start = false;
		dynamicLoad( "root" , mapCanvas );
	}
}

function getHashLength(arr){ // Arrayの個数を調べる( hashのため )
	var cnt=0;
	for(var key in arr){
		cnt++;
	}
	if ( verIE < 9 ){ // polyfillでindexOfを追加してるため・・
		--cnt;
	}
	return cnt;
}


function testPOIclick(){
//	console.log("TEST dispatch Mouse Event");
	var evt = document.createEvent("MouseEvents");
	
	document.getElementById("centerSight").style.display="none"; // 一瞬消して検索するしかないの？
	var el = document.elementFromPoint(mapCanvasSize.width / 2, mapCanvasSize.height / 2);
	if ( el.title ){
		document.getElementById("centerSight").style.display="";
//		console.log(el);

		evt.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		el.dispatchEvent( evt );
	}
}

function testCSclick(){
	testPOIclick();
	
	getObjectAtPoint(mapCanvasSize.width / 2, mapCanvasSize.height / 2);
	
}


function poiEdit( x , y ){
//	console.log("add POI",x,y);
	POIadd( x , y );
}

function POIadd( x , y ){
	var geop = screen2Geo( x , y );
	POIAppend( geop , isEditingLayer().getAttribute("iid") ,"TEST");
	// まず、すべてのレイヤーイベントリスナ（含パンズーム）を停止させる?(やってない)
	// かわりに、指定したレイヤーのPOIに新しいイベントリスナーを設置する?
	// 
}

function getImagePath( inDocPath , docId ){ // ルート文書に対する子文書の相対位置を加味したパスを得る
	var imageURL;
	if ( inDocPath.indexOf("http://") == 0 ){
		imageURL = inDocPath;
	} else {
		var docPath = svgImagesProps[docId].Path;
		var docDir = docPath.substring(0,docPath.lastIndexOf("/")+1);
		imageURL = docDir + inDocPath;
	}
	return ( imageURL );
}

function POIAppend( geoLocation ,  docId  ,title){
	var layerSVGDOM = svgImages[docId];
	var layerCRS = svgImagesProps[docId].CRS;
	var symbols = getSymbols(svgImages[docId]);
	var metaSchema = layerSVGDOM.documentElement.getAttribute("property").split(",");
	
	if ( layerCRS && layerSVGDOM && symbols ){
		var symbd = layerSVGDOM.getElementsByTagName("defs");
		if ( symbd[0].getElementsByTagName("g") ){
			var firstSymbol = null;
			for ( var key in symbols ){
				firstSymbol = symbols[key];
//				console.log(key);
				break;
			}
//			var symbolId = firstSymbol.getAttribute("id");
			var svgxy = Geo2SVG( geoLocation.lat , geoLocation.lng , layerCRS )
			var tf = "ref(svg," + svgxy.x + "," + svgxy.y + ")";
			var nssvg = layerSVGDOM.documentElement.namespaceURI;
			var poi = layerSVGDOM.createElementNS(nssvg,"use"); // FirefoxではちゃんとNSを設定しないと大変なことになるよ^^; 2013/7/30
			poi.setAttribute("x" , 0);
			poi.setAttribute("y" , 0);
//			poi.setAttribute("transform" , tf);
			poi.setAttributeNS(nssvg,"transform" , tf);
			poi.setAttribute("xlink:href" , "#" + firstSymbol.id);
			poi.setAttribute("xlink:title" , title);
			poi.setAttribute("content" , "null");
			layerSVGDOM.documentElement.appendChild(poi);
//			console.log(layerSVGDOM);
//			console.log("POIAppend::",poi.parentNode);
//			POIeditSelection(poi);
//			console.log("addPoi:",poi,poi.getAttribute("xtransform"),poi.getAttribute("transform"));
			dynamicLoad( "root" , mapCanvas );
//			console.log("call poi edit props");
			setTimeout(function(){POIeditProps(poi,true,symbols);},50);
		}
	}
}

function numberFormat( number , digits ){
	if (! digits){
		digits = 7;
	}
	var base = Math.pow(10 , digits);
	return ( Math.round(number * base)/base);
}

function getPoiPos( svgPoiNode ){
	// vectorEffect,transform(ref ノンスケールのための基点座標取得
	try {
//		console.log("getPoiPos:",svgPoiNode,svgPoiNode.getAttribute("transform"));
		var pos = svgPoiNode.getAttribute("transform").replace("ref(svg,","").replace(")","").split(",");
//		console.log(svgPoiNode, pos);
		return {
			x : Number ( pos[0] ),
			y : Number ( pos[1] )
		}
	} catch (e){
		return{
			x : null,
			y : null
		}
	}
}

function getNonScalingOffset ( svgGroupNode ){ // 上と同じもの・・・ 2014.5.12
	return ( getPoiPos( svgGroupNode ) );
}

function POIeditProps(poi , poiDel , symbolSet){
//	console.log("poi edit props:" , poi,document.getElementById(poi.getAttribute("iid")));
	(document.getElementById(poi.getAttribute("iid"))).style.backgroundColor="#FFFF00";
	var poiDocId = getDocumentId(poi);
//	console.log("docId:"+poiDocId);
	var symbols;
	if ( ! symbolSet){
		symbols = getSymbols(svgImages[poiDocId]);
	} else {
		symbols = symbolSet;
	}
	var svgPos = getPoiPos(poi);
	var poiHref = poi.getAttribute("xlink:href");
	var selectedPoiHref = poiHref;
	var latlng = SVG2Geo(Number(svgPos.x) , Number(svgPos.y) , svgImagesProps[poiDocId].CRS);
//	console.log("call POI edit props");
	var pep = initModal("POIeditProps");
	
	var metaSchema = poi.parentNode.getAttribute("property").split(",");
	var metaData = poi.getAttribute("content").split(",");
	var title = poi.getAttribute("xlink:title");
	if ( metaData.length != metaSchema.length){
		metaData = new Array(metaSchema.length);
	}
	
	var ihtml = '<table><tr><td colspan="2" id="iconselection" >';
	
	for ( var key in symbols ){
//		console.log(key , poiHref);
//		console.log(key,getImagePath(symbols[key].path,poiDocId));
		ihtml+='<img src="' + symbols[key].path + '" width="' + symbols[key].width + '" height="' + symbols[key].height + '" property="' + key + '" ';
		if  ( key == poiHref ){
			ihtml += 'border="2" style="border-color:red"';
		} else {
			ihtml += 'border="2" style="border-color:white"';
		}
		ihtml+='/>';
	}
	ihtml += '</td></tr>';
	
	ihtml += '<tr><td>title</td><td><input type="text" value="' + title + '"/></td></tr>';
	ihtml += '<tr><td><input type="button" id="pointUI" value="lat/lng"/></td><td><input type="text" value="' + numberFormat(latlng.lat )+","+numberFormat( latlng.lng )+ '"/></td></tr>'
	var latMetaCol,lngMetaCol,titleMetaCol; // 位置とtitleがメタデータにも用意されている（ダブっている）ときに、それらのカラム番号が設定される。
	for ( var i = 0 ; i < metaSchema.length ; i++ ){
		var mdval;
		if ( metaData[i]){
			mdval = metaData[i];
		} else {
			mdval ="";
		}
		if ( metaSchema[i] == "title"){
			titleMetaCol =i;
			ihtml+='<tr><td>' + metaSchema[i] + '</td><td><input type="text" disabled="disabled" value="'+title+'"/></td></tr>';
		} else if ( metaSchema[i] == "latitude" || metaSchema[i] == "lat" || metaSchema[i] == "緯度"){
			latMetaCol = i;
			ihtml+='<tr><td>' + metaSchema[i] + '</td><td><input type="text" disabled="disabled" value="' + numberFormat(latlng.lat ) + '"/></td></tr>';
		} else if ( metaSchema[i] == "longitude"|| metaSchema[i] == "lon" || metaSchema[i] == "経度"){
			lngMetaCol = i;
			ihtml+='<tr><td>' + metaSchema[i] + '</td><td><input type="text" disabled="disabled" value="' + numberFormat(latlng.lng ) + '"/></td></tr>';
			
		} else {
			ihtml+='<tr><td>' + metaSchema[i] + '</td><td><input type="text" value="' + mdval + '"/></td></tr>';
		}
	}
	ihtml+='</table><br><input type="button" id="pepok" value="決定"/><input type="button" id="pepng" value="キャンセル"/>';
	pep.innerHTML = ihtml;
	
	
	//カーソル部
	var cursor;
	if ( document.getElementById("centerSight") ){
		cursor = document.createElement("img");
//		poiの画面上の位置を得る
		var screenPoint = geo2Screen( latlng.lat , latlng.lng );
		cursor.style.position = "absolute";
		cursor.style.left = (screenPoint.x - 6) + "px";
		cursor.style.top = (screenPoint.y - 6)+ "px";
		cursor.style.width="10";
		cursor.style.height="10";
		cursor.id = "POIeditCursor";
		cursor.src = document.getElementById("centerSight").src;
		pep.parentNode.appendChild(cursor);
	}
	
	var values=pep.getElementsByTagName("input");
	
	document.getElementById("POIeditProps").addEventListener("click",function(e){
		switch ( e.target.id ){
		case"pepok": // 値設定決定用
			document.getElementById("POIeditProps").removeEventListener("click", arguments.callee, false);
			var ilat = Number(values[2].value.split(",")[0]);
			var ilng = Number(values[2].value.split(",")[1]);
			var svgPoint = Geo2SVG( ilat , ilng , svgImagesProps[poiDocId].CRS);
			var screenPoint = geo2Screen( ilat , ilng );
			var editMeta ="";
			for ( var i = 0 ; i < metaSchema.length ; i++ ){
				var metaVal;
				if ( titleMetaCol && titleMetaCol == i){
					metaVal = values[0].value;
				} else if ( latMetaCol && latMetaCol == i){
					metaVal = ilat;
				} else if ( lngMetaCol && lngMetaCol == i){
					metaVal = ilng;
				} else {
					metaVal = values[i+3].value;
				}
//				console.log(values[i+1]);
				if ( i == metaSchema.length -1 ){
					editMeta += metaVal;
				} else {
					editMeta += metaVal + ",";
				}
			}
//			console.log("editMeta:"+editMeta);
			// SVG文書のほうのメタデータを上書き
			poi.setAttribute("content",editMeta);
			poi.setAttribute("xlink:title",values[0].value);
			poi.setAttribute("transform" , "ref(svg,"+svgPoint.x + ","+svgPoint.y+")");
			poi.setAttribute("xlink:href", selectedPoiHref);
			
	//		console.log("id:"+poi.getAttribute("id"),poi);
			
			// HTML画面のほうのメタデータとアイコンのリンクを上書き
			document.getElementById(poi.getAttribute("iid")).setAttribute("content",editMeta);
			document.getElementById(poi.getAttribute("iid")).setAttribute("title",values[0].value);
			document.getElementById(poi.getAttribute("iid")).setAttribute("src",getImagePath(symbols[selectedPoiHref].path,poiDocId));
			
			dynamicLoad( "root" , mapCanvas ); // 位置を変更(結果としてsetImgElement()が呼ばれるので、アイコンの位置とサイズは書き換わる(srcは書き換わらないので・・))
			(document.getElementById(poi.getAttribute("iid"))).style.backgroundColor="";
			if ( cursor ){
				cursor.parentNode.removeChild(cursor);
			}
			initModal();
//			console.log(poi);
			break;
		case"pepng": // キャンセル用
			document.getElementById("POIeditProps").removeEventListener("click", arguments.callee, false);
			(document.getElementById(poi.getAttribute("iid"))).style.backgroundColor="";
			if ( cursor ){
				cursor.parentNode.removeChild(cursor);
			}
			initModal();
			if ( poiDel ){
				poi.parentNode.removeChild(poi);
				dynamicLoad( "root" , mapCanvas );
			}
//			console.log(poi);
			break;
		case"pointUI": // 緯度経度のカーソル入力用
			setTimeout(function(){
			document.addEventListener("click",function(e){
				var mxy = getMouseXY(e);
				var geop = screen2Geo(mxy.x , mxy.y );
				var screenPoint = geo2Screen( geop.lat , geop.lng );
				cursor.style.left = (screenPoint.x - 6) + "px";
				cursor.style.top = (screenPoint.y - 6)+ "px";
//				console.log(mxy);
				values[2].value= numberFormat(geop.lat) + "," + numberFormat(geop.lng);
				document.removeEventListener("click", arguments.callee, false);
			} , false );
			},100);
			break;
		}
		if ( e.target.parentNode.id =="iconselection"){
			for ( var i = 0 ; i < e.target.parentNode.childNodes.length ; i++ ){
				e.target.parentNode.childNodes[i].setAttribute("style","border-color:white");
			}
			e.target.setAttribute("style","border-color:red");
			selectedPoiHref = e.target.getAttribute("property");
		}
	},false);
	
}

function showSerialize( poi ){
//	console.log(xml2Str(poi.ownerDocument.documentElement));
//	console.log(svgPoi2csv(poi.ownerDocument.documentElement));
//	console.log("parent",poi.parentNode);
	var sse = initModal("txtArea");
	var body = document.getElementById("txtAreaBody");
	body.innerHTML=escape(svgPoi2csv(poi.ownerDocument.documentElement));
	document.getElementById("txtArea").addEventListener("click",function(e){
		switch ( e.target.id ){
		case"txtAreaCSV": // 値設定決定用
			body.innerHTML=escape(svgPoi2csv(poi.ownerDocument.documentElement));
			break;
		case"txtAreaSVGMap": // 値設定決定用
			body.innerHTML=escape("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+xml2Str(poi.ownerDocument.documentElement));
			break;
		case"txtAreaClose": // 値設定決定用
			initModal();
			break;
		}
	},false);
	
}

// html文書中のimg要素(POI)を入力すると、対応するSVG文書の文書番号とその要素(use)が出力される。対応するuse要素を持つsvg文書事態を取得したい場合は.ownerDocumentする。
// idからhtml文書のimg要素を取得するには、Document.gelElementById(id)
function getSvgTarget( htmlImg ){
//	console.log(htmlImg,getDocumentId(htmlImg));
	var svgDocId=htmlImg.parentNode.getAttribute("id");
		if (svgDocId == "mapcanvas"){ // 2015.11.14 debug (root docにPOIがある場合、htmlとsvg不一致する 関数化したほうが良いかも)
		svgDocId="root";
	}
//	console.log(svgImages[svgDocId]);
	var ans = getElementByImgIdNoNS(svgImages[svgDocId] , htmlImg.getAttribute("id"));
//		console.log("no ans:" , ans);
	return {
		element : ans,
		docId : svgDocId
	};
}

 // 2013.7.30 getElementByIdはSVGNSで無いと引っかからない@Firefox 動的レイヤーでも要注意 createElement"NS"で作ることが重要(IE11でも同じことがおきるので、すべての呼び出しをこれに変更することにした 2014.6.20)
function getElementByIdNoNS( XMLNode , searchId ){
//	var ans =XMLNode.getElementById(searchId);
//	if ( ans ){
//		return ( ans );
//	} else {
		return ( getElementByAttr( XMLNode , searchId , "id" ) );
//	}
}

function getElementByImgIdNoNS( XMLNode , searchId ){
//	var ans =XMLNode.getElementById(searchId);
//	if ( ans ){
//		return ( ans );
//	} else {
		return ( getElementByAttr( XMLNode , searchId , "iid" ) );
//	}
}

function getElementByAttr( XMLNode , searchId , atName ){ // Firefox用・・（IE11でも同じことがおきる場合がある 2014.6.20)
//	console.log(XMLNode , searchId,XMLNode.hasChildNodes());
	if ( ! XMLNode.hasChildNodes() ){
		return ( null );
	}
	
	var XMLNodes = XMLNode.childNodes;
//	console.log( "childLength:",XMLNodes.length,XMLNodes);
	for ( var k = 0 ; k < XMLNodes.length ; k++ ){
//		console.log("trace",XMLNodes[k].NodeType , XMLNodes[k]);
		if ( XMLNodes[k].getAttribute && XMLNodes[k].getAttribute(atName) == searchId ){
			return ( XMLNodes[k] );
		}
		if (  XMLNodes[k].hasChildNodes() ){
//			console.log("DIG");
			ans = getElementByAttr( XMLNodes[k] , searchId , atName );
			if ( ans ){
				return ( ans );
			}
		}
	}
	return ( null );
}

function getDocumentId( svgelement ){
//	console.log("docId:::",svgelement.ownerDocument,svgelement.ownerDocument.documentElement.getAttribute("about"));
//	return ( element.parentNode.getAttribute("id") );
	return ( svgelement.ownerDocument.documentElement.getAttribute("about") );
}

var testClicked = false;
function testClick( obj , forceSelection ){ // html:img要素によるPOI(from use要素)に設置するクリックイベント
//	console.log("testClick",obj, forceSelection);
	testClicked = true;
	if ( forceSelection ){
		testClicked = false;
	}
	var target = obj.target || obj.srcElement ; 
	if ( forceSelection != true ){
		var coll = isCollided( target.id );
		if ( coll ){
//			console.log( "collided POI",coll );
			POItargetSelection(coll, obj);
			return;
		}
	}
//	console.log("testClick:",target.parentNode.getAttribute("id"),target, obj.button);
//	console.log("testClick:",target);
	var el = isEditingLayer();
	var svgTargetObj = getSvgTarget(target);
	var svgTarget = svgTargetObj.element;
//	console.log("testClick:" , svgTarget);
	if ( el && el.getAttribute("iid") == target.parentNode.getAttribute("id")){ // 選択したオブジェクトが編集中レイヤのものの場合
//		console.log("EDITING LAYER",target,svgTarget);
		POIeditSelection(svgTarget);
	} else {
		if ( getHyperLink( svgTarget ) &&  !svgTarget.getAttribute("content")){ // アンカーが付いていて且つメタデータが無い場合
//			console.log("showPage:",getHyperLink( svgTarget ).href  );
//			console.log("ownerDocPath:",svgImagesProps[svgTargetObj.docId].Path  );
//			console.log("ownerDoc:",svgTarget.ownerDocument  );
			
//			showPage( getHyperLink( svgTarget ) , svgImagesProps[svgTargetObj.docId].Path ); // Pathは不要かな・・
			showPage( getHyperLink( svgTarget )  );
		} else if ( getHyperLink( svgTarget ) &&  svgTarget.getAttribute("content")){ // アンカーもあってメタデータもある場合
			POIviewSelection(svgTarget);
		} else { // アンカーが無い場合
			showUseProperty(svgTarget);
		}
	}
}

function showPage( hyperLink ){
	var href = hyperLink.href.replace(/^\s+|\s+$/g, "");
	
	if ( href.indexOf("#")==0){ // ハッシュだけの場合は viewPort変化をさせる
		var vb = getFragmentView( href );
		if ( vb ){
			setGeoViewPort( vb.y, vb.x, vb.height , vb.width )
		}
		return;
	}
	
	
	if ( hyperLink.target ){
		// 別ウィンドで
		window.open(href);
	} else {
		// そのウィンドを置き換える
		window.open(href,"_self","");
	}
}

function getSvgLocation( hrefS ){ // svgImagesのhrefからlocation相当変数を得る　作らなくても在る気もするのだが・・
	var hash ="", search="", path="";
	var hashPos = hrefS.length;
	var searchPos = hashPos;
	if ( hrefS.lastIndexOf("#" )>0){
		hashPos = hrefS.lastIndexOf("#");
		hash = hrefS.substring(hrefS.lastIndexOf("#"));
	}
	
	if ( hrefS.indexOf("?")>0){
		searchPos = hrefS.indexOf("?");
		search = hrefS.substring( searchPos , hashPos );
	}
	
	path = hrefS.substring( 0 , searchPos );
	
	return {
		protocol : location.protocol,
		host: location.host,
		hostname : location.hostname,
		port: location.port,
		pathname: path,
		search: search,
		hash: hash
	}
	
}

function POIeditSelection(poi){
//	console.log("call PES::",poi);
	var pes = initModal( "POIeditSelection" );
//	var pes = document.getElementById("POIeditSelection");
	
	pes.addEventListener("click", function (e) {
//		console.log("evt:",e);
		switch (e.target.id){
		case"pesView":
//			console.log("view",poi);
			showUseProperty(poi);
			initModal();
			break;
		case"pesEdit":
//			console.log("edit");
			POIeditProps(poi,false);
			break;
		case"pesDel":
//			console.log("del",poi);
//			console.log("parent",poi.parentNode);
			poi.parentNode.removeChild(poi);
			initModal();
			dynamicLoad( "root" , mapCanvas );
			break;
		case"pesClose":
//			console.log("close");
			initModal();
			break;
		case "pesSer":
//			console.log("Serialize",poi);
			showSerialize( poi );
			break;
		}
		pes.removeEventListener("click", arguments.callee, false);
	},false);
	
}

function POIviewSelection(poi){
//	console.log("call PVS::",poi);
	var pvs = initModal( "POIviewSelection" );
//	var pvs = document.getElementById("POIviewSelection");
	
	pvs.addEventListener("click", function (e) {
//		console.log("evt:",e);
		switch (e.target.id){
		case"pvsView":
//			console.log("view",poi);
			showUseProperty(poi);
			initModal();
			break;
		case"pvsLink":
//			console.log("edit");
			showPage( getHyperLink( poi )  );
			initModal();
			break;
		}
		pvs.removeEventListener("click", arguments.callee, false);
	},false);
	
}

function POItargetSelection(pois, eventOriginObj){
//	console.log("call POItagerSelection:",pois);
	var pts = initModal("POItargetSelection");
	var ptsSelect = document.getElementById("ptsSelect");
	var opts="";
	for ( var i = 0; i < pois.length ; i++ ){
		var screenPOIimg = document.getElementById(pois[i].id);
		var layerName;
		if ( screenPOIimg.parentNode.getAttribute("class") ){ //  2015.11.14 debug rootのPOIでは所属レイヤーなし
			var layer = getLayer((screenPOIimg.parentNode.getAttribute("class")).substring(10)); // htmlのdiv(レイヤ相当)のclassには、ルートのレイヤー名が10文字目から入っている 2014.12.15
			layerName = getLayerName( layer );
		} else {
			layerName ="/";
		}
		opts+= "<option value=\"" + pois[i].id + "\">" + layerName + "/" + screenPOIimg.title + "</option>";
	}
	ptsSelect.innerHTML=opts;
	
	var chCallFunc =  function (e) {
//		console.log("evt:",e.target.selectedIndex, ptsSelect.options[e.target.selectedIndex].value);
		var eobj = new Object();
		eobj.target = document.getElementById(ptsSelect.options[e.target.selectedIndex].value);
		eobj.button = eventOriginObj.button;
//		console.log("evtObj:",eobj);
		initModal();
//		pts.removeEventListener("change", arguments.callee, false);
		pts.removeEventListener("change", chCallFunc, false);
		document.getElementById("ptsClose").removeEventListener("click", clCallFunc, false);
		testClick(eobj,true);
	} 
	
	var clCallFunc =  function (e) {
		initModal();
		pts.removeEventListener("change", chCallFunc, false);
		document.getElementById("ptsClose").removeEventListener("click", clCallFunc, false);
	}
	
	pts.addEventListener("change", chCallFunc , false );
	document.getElementById("ptsClose").addEventListener("click", clCallFunc , false );
}

function initModal( target ){
	var modalUI;
//	console.log("call initModal");
	//http://black-flag.net/css/20110201-2506.html この辺を参考に
	if ( !document.getElementById("modalUI") ){
//		console.log("INIT Modal UI");
		var body = document.getElementsByTagName("body")[0];
		modalUI = document.createElement("div");
		modalUI.style.position = "absolute";
		modalUI.style.left = "0px";
		modalUI.style.top = "0px";
//		modalUI.style.width=mapCanvasSize.width + "px";
//		modalUI.style.height=mapCanvasSize.height + "px";
		modalUI.style.width="100%";
		modalUI.style.height="100%";
		modalUI.style.display="none";
		modalUI.id="modalUI";
		body.appendChild(modalUI);
		
		//マスクを生成する
		var mask = document.createElement("div");
		mask.style.position = "absolute";
		mask.id = "modalMask";
		mask.style.left = "0px";
		mask.style.top = "0px";
		mask.style.width="100%";
		mask.style.height="100%";
		mask.style.backgroundColor = "#505050";
		mask.style.color = "yellow";
		mask.style.opacity="0.5";
		modalUI.appendChild(mask);
//		console.log(modalUI  , mapCanvasSize);
		
		// POI表示の選択肢(メタデータ or リンク)を生成する
		var pts =  document.createElement("div");
		pts.style.opacity="1";
		// 幅を自動にしつつ真ん中に表示するのはできないのかな・・
//		pts.style.margin="0 auto";
		pts.style.position = "absolute";
//		pts.style.width="80%";
//		pts.style.height="80%";
		pts.style.backgroundColor = "white";
		pts.id = "POItargetSelection";
		pts.innerHTML='<span>Multiple candidates are overwrapped please select one.</span><br/><select id="ptsSelect" size="8" value="view Property"></select><br/><input type="button" id="ptsClose" value="Close"/>';
		
		pts.style.display="none";
		modalUI.appendChild(pts);
		
		// POI表示の選択肢(メタデータ or リンク)を生成する
		var pvs =  document.createElement("div");
		pvs.style.opacity="1";
		// 幅を自動にしつつ真ん中に表示するのはできないのかな・・
//		pvs.style.margin="0 auto";
		pvs.style.position = "absolute";
//		pvs.style.width="80%";
//		pvs.style.height="80%";
		pvs.style.backgroundColor = "white";
		pvs.id = "POIviewSelection";
		pvs.innerHTML='<input type="button" id="pvsView" value="view Property"/><br><input type="button" id="pvsLink" value="open Link"/>';
		
		pvs.style.display="none";
		modalUI.appendChild(pvs);
		
		
		// 選択したPOIの編集入り口UIを生成する
		var pes =  document.createElement("div");
		pes.style.opacity="1";
		// 幅を自動にしつつ真ん中に表示するのはできないのかな・・
//		pes.style.margin="0 auto";
		pes.style.position = "absolute";
//		pes.style.width="80%";
//		pes.style.height="80%";
		pes.style.backgroundColor = "white";
		pes.id = "POIeditSelection";
		pes.innerHTML='<input type="button" id="pesView" value="view Property"/><br><input type="button" id="pesEdit" value="Edit"/><br><input type="button" id="pesSer" value="view Source"/><br><input type="button" id="pesDel" value="Remobe POI"/><br><input type="button" id="pesClose" value="Close"/>';
		
		pes.style.display="none";
		modalUI.appendChild(pes);
		
		// POIの属性編集パネル（側だけ）を生成する
		var editp =  document.createElement("div");
		editp.style.opacity="1";
		editp.style.position = "absolute";
		editp.style.backgroundColor = "white";
		editp.id = "POIeditProps";
//		editp.innerHTML='';
		editp.style.display="none";
		modalUI.appendChild(editp);
		
		var tarea = document.createElement("div");
		tarea.style.opacity="1";
		tarea.style.position = "absolute";
		tarea.id = "txtArea";
		tarea.left = "0px";
		tarea.top = "0px";
		tarea.style.width="100%";
		tarea.style.height="100%";
		tarea.style.display="none";
		var tareab = document.createElement("textarea");
		tareab.style.width="90%";
		tareab.style.height="90%";
		tareab.id ="txtAreaBody";
		tarea.innerHTML='<input type="button" id="txtAreaCSV" value="CSV形式"/><input type="button" id="txtAreaSVGMap" value="SVGMap形式"/><input type="button" id="txtAreaClose" value="閉じる"/><br>';
		tarea.appendChild(tareab);
		
		modalUI.appendChild(tarea);
		
	} else {
		modalUI = document.getElementById("modalUI");
	}
	
	var ans = null;
	if ( target ){
		modalUI.style.display ="";
		ans = document.getElementById(target);
//		console.log("do visible:"+target,ans);
	} else {
		modalUI.style.display ="none";
	}
	
	var uis = modalUI.getElementsByTagName("div");
	for ( var i = 0 ; i < uis.length ; i++ ){
		if (uis[i].id == target || uis[i].id == "modalMask"){
			uis[i].style.display="";
		} else {
			uis[i].style.display="none";
		}
	}
	return (ans);
}

function getLayerHash( layerName ){ // root containerにおけるレイヤ名もしくはURIからハッシュキーを得る
	var ans = null;
	var layer = getLayer(layerName);
	if ( layer ){
		ans = layer.getAttribute("iid");
	}
	return ( ans );
}



function xml2Str(xmlNode) {
	try {
		// Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
		return (new XMLSerializer()).serializeToString(xmlNode);
	}
	catch (e) {
		try {
			// Internet Explorer.
			return xmlNode.xml;
		}
		catch (e) {
			//Other browsers without XML Serializer
			alert('Xmlserializer not supported');
		}
	}
	return false;
}

function svgPoi2csv(svgDocElement){
	var ans ="";
	var docId = getDocumentId(svgDocElement);
	var schema = getMetaSchema(svgDocElement.ownerDocument);
	var crs = svgImagesProps[docId].CRS;
	ans += "latitude,longitude,iconClass,iconTitle,"+schema+"\n";
	var pois = svgDocElement.getElementsByTagName("use");
	for ( var i = 0 ; i < pois.length ; i++ ){
		var poiProp = getImageProps( pois[i] , 2 );
		var geoPos=SVG2Geo(poiProp.x ,poiProp.y , crs );
		ans += numberFormat(geoPos.lat) + "," + numberFormat(geoPos.lng) + "," + poiProp.href + "," + poiProp.title + "," + poiProp.metadata+"\n";
	}
	return(ans );	
}

function escape(str) {
	str = str.replace(/&/g,"&amp;");
	str = str.replace(/"/g,"&quot;");
	str = str.replace(/'/g,"&#039;");
	str = str.replace(/</g,"&lt;");
	str = str.replace(/>/g,"&gt;");
	return str;
}

function setSVGcirclePoints( pathNode ,  context , child2canvas , clickable , category , vectorEffectOffset ){
	var cx = Number(pathNode.getAttribute("cx"));
	var cy = Number(pathNode.getAttribute("cy"));
	
	var rx, ry;
	
	if ( category == CIRCLE ){
		rx = Number(pathNode.getAttribute("r"));
		ry = rx;
	} else {
		rx = Number(pathNode.getAttribute("rx"));
		ry = Number(pathNode.getAttribute("ry"));
	}
	
//	var repld = "M"+ (cx - r) + "," + cy + "A" + r + "," + r + " 0 0 1 " + (cx + r ) + "," + cy + "A" + r + "," + r + " 0 0 1 " + (cx - r ) + "," + cy +"z";
	
	var repld = "M"+ (cx - rx) + "," + cy + "A" + rx + "," + ry + " 0 0 1 " + (cx + rx ) + "," + cy + "A" + rx + "," + ry + " 0 0 1 " + (cx - rx ) + "," + cy +"z";
	
	var ret = setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset);
	var csize = transform( rx , ry , child2canvas , true );
	ret.y -= csize.y;
	ret.height = csize.y * 2;
//	console.log("repld:"+repld,  " ret:",ret , " csize:" , csize);
	
	
	
	return ( ret );

}

function setSVGrectPoints( pathNode ,  context , child2canvas , clickable , vectorEffectOffset ){
	var rx = Number(pathNode.getAttribute("x"));
	var ry = Number(pathNode.getAttribute("y"));
	var rw = Number(pathNode.getAttribute("width"));
	var rh = Number(pathNode.getAttribute("height"));
	
	var repld = "M"+ rx + "," + ry + "L" + (rx+rw) + "," + ry + " " + (rx+rw) + "," + (ry+rh) + " " + rx + "," + (ry+rh) +"z";
//	console.log("repld:"+repld);
	
	var ret = setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset);
	return ( ret );

}

function setSVGpolyPoints( pathNode ,  context , child2canvas , clickable , nodeType , vectorEffectOffset ){
	var pp = pathNode.getAttribute("points");
	if (pp){
		var points = (pp.replace(/,/g," ")).split(" ");
//		console.log(points.length, points);
		if ( points.length > 3 ){
			var repld="M";
			
			
			for (var i = 0 ; i < (points.length/2) ; i++){
				repld += points[i*2] + "," + points[i*2+1];
				if ( i==0){
					repld+="L";
				} else {
					repld+=" ";
				}
			}
			
			if ( nodeType == POLYGON ){
				repld+="Z";
			}
//			console.log("repld:"+repld);
			
			var ret = setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset);
			return ( ret );
		}
	}
}

function setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset){
//	if ( vectorEffectOffset ){
//		console.log( "setSVGpathPoints:" , pathNode , vectorEffectOffset );
//	}
	var canvasNonFillFlag = false;
	if ( context.fillStyle=="rgba(0, 0, 0, 0)"){
		canvasNonFillFlag = true;
	}
	var canvasNonStrokeFlag = false;
	if ( context.strokeStyle=="rgba(0, 0, 0, 0)"){
		canvasNonStrokeFlag = true;
	}
	
	var minx = 60000, maxx = -60000 , miny = 60000 , maxy = -60000;
	// 指定されたcanvas 2d contextに対して、svgのpathNodeを座標変換(child2canvas)して出力する
	var d;
	if ( repld ) {
		d = repld;
	} else {
		d = pathNode.getAttribute("d"); // from canvg
	}
//	console.log(d);
	d = d.replace(/,/gm,' '); // get rid of all commas
	d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from commands
	d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from commands
	d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm,'$1 $2'); // separate commands from points
	d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from points
	d = d.replace(/([0-9])([+\-])/gm,'$1 $2'); // separate digits when no comma
	d = d.replace(/(\.[0-9]*)(\.)/gm,'$1 $2'); // separate digits when no comma
	d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,'$1 $3 $4 '); // shorthand elliptical arc path syntax
	d = trim(compressSpaces(d)).split(' '); // compress multiple spaces
//	console.log(pathNode , d);
	
	var prevCommand="M";
	var prevCont = false;
	var sx = 0, sy = 0;
	var mx = 0 , my = 0;
	var startX = 0, startY = 0; // mx,myと似たようなものだがtransformかけてない・・・ 2016/12/1 debug
	var prevX = 0 , prevY = 0;
	context.beginPath();
	var i = 0;
	var command = d[i];
	var cp;
	var closed = false;
	
	var hitPoint = new Object(); // pathのhitPoint(線のためのhitTestエリア)を追加してみる(2013/11/28)
	
	function getHP( hp , cp ){
		if ( clickable && cp ) {
			if (!hp.x && cp.x > 35  && cp.x < mapCanvasSize.width -35 && cp.y > 35 && cp.y <  mapCanvasSize.height - 35){
	//			console.log("set:",cp);
				hp.x = cp.x;
				hp.y = cp.y;
			}
		}
		return ( hp );
	}
	
	while ( i < d.length ){
		if ( cp ){
			prevX = cp.x;
			prevY = cp.y;
		}
		switch (command){
		case "M":
			++i;
			sx = Number(d[i]);
			++i;
			sy = Number(d[i]);
			startX = sx;
			startY = sy;
			cp = transform( sx , sy , child2canvas , false , vectorEffectOffset );
			mx = cp.x;
			my = cp.y;
//			hitPoint = getHP(hitPoint, cp);
			context.moveTo(cp.x,cp.y);
//			console.log("M",sx,sy);
			break;
		case "m":
			++i;
			sx += Number(d[i]);
			++i;
			sy += Number(d[i]);
			startX = sx;
			startY = sy;
			cp = transform( sx , sy , child2canvas , false , vectorEffectOffset );
			mx = cp.x;
			my = cp.y;
//			hitPoint = getHP(hitPoint, cp);
			context.moveTo(cp.x,cp.y);
			break;
		case "L":
			++i;
			sx = Number(d[i]);
			++i;
			sy = Number(d[i]);
//			console.log("L",sx,sy);
			cp = transform( sx , sy , child2canvas , false , vectorEffectOffset );
			hitPoint = getHP(hitPoint, cp);
			context.lineTo(cp.x,cp.y);
			break;
		case "l":
			++i;
			sx += Number(d[i]);
			++i;
			sy += Number(d[i]);
			cp = transform( sx , sy , child2canvas , false , vectorEffectOffset );
			hitPoint = getHP(hitPoint, cp);
			context.lineTo(cp.x,cp.y);
			break;
		case "A":
			var curr = transform(Number(sx) , Number(sy));
			++i;
			var rx = Number(d[i]);
			++i;
			var ry = Number(d[i]);
			++i;
			var xAxisRotation = Number(d[i]);
			++i;
			var largeArcFlag = Number(d[i]);
			++i;
			var sweepFlag = Number(d[i]);
			++i;
			sx = Number(d[i]);
			++i;
			sy = Number(d[i]);
			
			cp = transform( sx , sy );
			var point = function(x,y) { return { x : x , y : y } }
			// Conversion from endpoint to center parameterization
			// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
			// x1', y1' (in user coords)
			var currp = transform(
				Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0,
				-Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0
			);
			// adjust radii
			
			var l = Math.pow(currp.x,2)/Math.pow(rx,2)+Math.pow(currp.y,2)/Math.pow(ry,2);
			if (l > 1) {
				rx *= Math.sqrt(l);
				ry *= Math.sqrt(l);
			}
			// cx', cy'
			var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(
				((Math.pow(rx,2)*Math.pow(ry,2))-(Math.pow(rx,2)*Math.pow(currp.y,2))-(Math.pow(ry,2)*Math.pow(currp.x,2))) /
				(Math.pow(rx,2)*Math.pow(currp.y,2)+Math.pow(ry,2)*Math.pow(currp.x,2))
			);
			if (isNaN(s)) s = 0;
			var cpp = transform(s * rx * currp.y / ry, s * -ry * currp.x / rx);
			
			// cx, cy
			var centp = transform(
				(curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
				(curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
			);
			
			// vector magnitude
			var m = function(v) { return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2)); }
			// ratio between two vectors
			var r = function(u, v) { return (u[0]*v[0]+u[1]*v[1]) / (m(u)*m(v)) }
			// angle between two vectors
			var a = function(u, v) { return (u[0]*v[1] < u[1]*v[0] ? -1 : 1) * Math.acos(r(u,v)); }
			// initial angle
			var a1 = a([1,0], [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry]);
			// angle delta
			var u = [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry];
			var v = [(-currp.x-cpp.x)/rx,(-currp.y-cpp.y)/ry];
			var ad = a(u, v);
			if (r(u,v) <= -1) ad = Math.PI;
			if (r(u,v) >= 1) ad = 0;
			
			var r = rx > ry ? rx : ry;
			var ssx = rx > ry ? 1 : rx / ry;
			var ssy = rx > ry ? ry / rx : 1;
			
			var tc = transform( centp.x , centp.y , child2canvas , false , vectorEffectOffset );
			var tsc = transform( ssx , ssy , child2canvas , true); // スケール計算
			
			context.translate(tc.x, tc.y);
			context.rotate(xAxisRotation);
			context.scale(tsc.x, tsc.y);
			context.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
			context.scale(1/tsc.x, 1/tsc.y);
			context.rotate(-xAxisRotation);
			context.translate(-tc.x, -tc.y);
			cp = transform( sx , sy , child2canvas , false , vectorEffectOffset);
			break;
		case "Z":
		case "z":
			context.closePath();
			hitPoint = getHP(hitPoint, cp);
			closed = true;
			sx = startX; // debug 2016.12.1
			sy = startY;
			break;
		default:
			hitPoint = getHP(hitPoint, cp);
			prevCont = true;
			break;
		}
//		console.log(cp.x +","+ cp.y);
		if ( cp ){
			if ( cp.x < minx ){
				minx = cp.x;
			}
			if ( cp.x > maxx ){
				maxx = cp.x;
			}
			if ( cp.y < miny ){
				miny = cp.y;
			}
			if ( cp.y > maxy ){
				maxy = cp.y;
			}
		}
		
		
		if ( !prevCont ){
			prevCommand = command;
			++i;
			command = d[i];
		} else {
			command = prevCommand;
//			console.log("CONT",command);
			prevCont = false;
			--i;
		}
		
	}
	if ( !closed ){
//		console.log("force close"); 
//		context.closePath(); // BUGだった？
	}
	if ( !canvasNonFillFlag ){
		context.fill();
	}
	if ( !canvasNonStrokeFlag ){
      context.stroke();
	}
	var hitted=false;
	
	if ( clickable && !canvasNonFillFlag && pathHitTest.enable){ // ヒットテスト要求時の面の場合　且つ　面検索
		if( context.isPointInPath(pathHitTest.x,pathHitTest.y) ){ // テストしヒットしてたら目立たせる
//			console.log("HIT:",pathNode,":",svgImagesProps[getDocumentId(pathNode)]);
			hitted = true;
			var pathWidth = context.lineWidth;
			context.lineWidth = 6;
			var pathStyle = context.fillStyle;
			context.fillStyle = 'rgb(255,00,00)';
			context.fill();
			context.stroke();
			context.fillStyle = pathStyle;
			context.lineWidth = pathWidth;
		}
	}
	
	if ( clickable && canvasNonFillFlag && hitPoint.x && !pathHitTest.pointPrevent ){ // 線の場合　ヒットポイントを設置
//		console.log(hitPoint, context.fillStyle);
		var pathStyle = context.fillStyle;
//		hitPoint.title = pathNode.getAttribute("xlink:title");
//		hitPoint.innerId = pathNode.getAttribute("id");
		context.beginPath();
		context.fillStyle = 'rgb(255,00,00)';
		context.arc(hitPoint.x,hitPoint.y,3,0,2*Math.PI,true);
		context.fill();
		
		if (pathHitTest.enable){ // ヒットテスト要求時の線検索
			if( context.isPointInPath(pathHitTest.x,pathHitTest.y) ){ // テストしヒットしてたら目立たせる
				context.arc(hitPoint.x,hitPoint.y,6,0,2*Math.PI,true);
				context.fill();
//				console.log("HIT:",pathNode,":",svgImagesProps[getDocumentId(pathNode)],":", hitPoint.x);
				hitted = true;
				pathHitTest.pointPrevent = true;
				var pathWidth = context.lineWidth;
				context.lineWidth = 6;
				context.fillStyle = pathStyle;
				setSVGpathPoints( pathNode ,  context , child2canvas , null ,  null ,  vectorEffectOffset);
				context.lineWidth = pathWidth;
				pathHitTest.pointPrevent = false;
			}
		}
		
		context.fillStyle = pathStyle;
		
	}
	
	var endX,endY,endCos=0,endSin=0;
	
	if ( closed ){
		endX = mx;
		endY = my;
	} else {
		endX = cp.x;
		endY = cp.y;
	}
	
	var vabs = Math.sqrt((endX - prevX) * (endX - prevX) + (endY - prevY) * (endY - prevY));
	if ( vabs ){
		endCos = (endX - prevX) / vabs;
		endSin = (endY - prevY) / vabs;
	}
//	console.log( "cos:",endCos," sin:",endSin);
	
	
//	console.log("endXY:",endX,endY);
	
	return {
		hitted: hitted,
		x: minx,
		y: miny,
		width: maxx - minx,
		height: maxy - miny,
		endX: endX,
		endY: endY,
		endCos: endCos,
		endSin: endSin
	}
	
}

function setSVGvecorPoints( linePolygonNode , defaultStyle){
//	console.log(linePolygonNode );
}

function compressSpaces(s) { return s.replace(/[\s\r\t\n]+/gm,' '); }
function trim(s) { return s.replace(/^\s+|\s+$/g, ''); }

function matMul( m1 , m2 ){
	// m1: 最初の変換マトリクス
	// m2: 二番目の変換マトリクス
	// x',y' = m2(m1(x,y))
	return {
		a: m2.a * m1.a + m2.b * m1.b ,
		b: m2.b * m1.a + m2.d * m1.b ,
		c: m2.a * m1.c + m2.c * m1.d ,
		d: m2.b * m1.c + m2.d * m1.d ,
		e: m2.a * m1.e + m2.c * m1.f + m2.e ,
		f: m2.b * m1.e + m2.d * m1.f + m2.f
	}
}

var styleCatalog = new Array("stroke" , "stroke-width" , "stroke-linejoin" , "stroke-linecap" , "fill" , "fill-rule" , "fill-opacity" , "opacity" , "vector-effect" , "display" , "font-size" , "stroke-dasharray" , "marker-end" ); 
	
function getStyle( svgNode , defaultStyle , hasHyperLink ){
	// 親のスタイルを継承して該当要素のスタイルを生成する
	// hasUpdateはその要素自身にスタイルattrが付いていたときに設定される
	var hasStyle=false , hasUpdate=false;
	var style = new Array();
	
	// "style"属性の値を取る
	var styleAtt = getStyleAttribute( svgNode );
	
	for ( var i = 0 ; i < styleCatalog.length ; i++ ){
		var st = getStyleOf( styleCatalog[i] , svgNode , styleAtt);
		if ( st ){
			style[styleCatalog[i]] = st;
			hasStyle = true;
			hasUpdate = true;
		} else if ( defaultStyle && defaultStyle[styleCatalog[i]] ){
			style[styleCatalog[i]] = defaultStyle[styleCatalog[i]];
			hasStyle = true;
		}
	}
	
	// add "visibleMin/MaxZoom" 2013/8/19 とても出来が悪い・・・
	if ( svgNode.getAttribute("visibleMinZoom")){
		style.minZoom = Number(svgNode.getAttribute("visibleMinZoom"))/100.0;
//		console.log("setMinZoom",style.minZoom , style);
		hasUpdate = true;
		hasStyle = true;
	} else if ( defaultStyle && defaultStyle.minZoom ){
		style.minZoom = defaultStyle.minZoom;
		hasStyle = true;
	}
	if ( svgNode.getAttribute("visibleMaxZoom")){
		style.maxZoom = Number(svgNode.getAttribute("visibleMaxZoom"))/100.0;
//		console.log("setMaxZoom",style.maxZoom , style);
		hasUpdate = true;
		hasStyle = true;
	} else if ( defaultStyle && defaultStyle.maxZoom ){
		style.maxZoom = defaultStyle.maxZoom;
		hasStyle = true;
	}
	
	style.hasUpdate = hasUpdate;
//	console.log("update style",style.hasUpdate);
//	console.log("Node:" , svgNode , "Style:" , style , " hasStyle:", hasStyle);
	
	if ( hasHyperLink ){
		var hyperLink = svgNode.getAttribute("xlink:href");
		var hyperLinkTarget = svgNode.getAttribute("target");
		if ( hyperLink ){
			style.hyperLink = hyperLink;
			style.target = hyperLinkTarget;
			hasStyle = true;
		}
	}
	
	if ( svgNode.getAttribute("transform") ){ // <g>の svgt1.2ベースのnon-scaling機能のオフセット値を"スタイル"として設定する・・ 2014.5.12
		style.nonScalingOffset = getNonScalingOffset( svgNode );
		hasStyle = true;
	}
	
	
	if ( hasStyle ){
		return ( style );
	} else {
		return ( null );
	}
}
	
function getStyleAttribute( svgElement ){
	var styles=null;
	if ( svgElement.getAttribute("style")){
		styles = new Array();
//		console.log(svgElement.getAttribute("style"));
		var stylesa = svgElement.getAttribute("style").split(";");
		if ( stylesa ){
			for ( var i = 0 ; i < stylesa.length ; i++ ){
				var style = stylesa[i].split(":");
				if ( style && style.length > 1 ){
//					console.log(stylesa[i]);
					var name = trim(style[0]);
					var value = trim(style[1]);
					if ( name == "fill" || name == "stroke" ){
						if ( value.length==6 && value.match(/^[0-9A-F]/)){
		//					console.log("exp err -- fix",value);
							value = "#"+value;
						}
					}
					styles[name] = value;
				}
			}
		}
	}
	return ( styles );
}

function getStyleOf( styleName , svgElement , styleAtt ){
	var style;
	if (  svgElement.getAttribute(styleName) ){
		style = svgElement.getAttribute(styleName);
	} else if ( styleAtt && styleAtt[styleName]){
		style = styleAtt[styleName];
	}
	return ( style );
}


function setCanvasStyle(style , context){
	// var styleCatalog = new Array("stroke" , "stroke-width" , "stroke-linejoin" , "stroke-linecap" , "fill" , "fill-rule" , "fill-opacity" , "opacity" , "vector-effect");
	// http://www.html5.jp/canvas/ref/method/beginPath.html
	
	if ( style ){
		if (style["stroke"]){
			if ( style["stroke"] == "none" ){
				context.strokeStyle = "rgba(0, 0, 0, 0)"; 
			} else {
				context.strokeStyle = style["stroke"];
			}
		} else {
			context.strokeStyle = "rgba(0, 0, 0, 0)"; 
		}
		if (style.fill){
			if ( style.fill == "none" ){
				context.fillStyle = "rgba(0, 0, 0, 0)"; 
			} else {
				context.fillStyle = style.fill;
			}
	//		console.log("setContext fill:",context.fillStyle);
		}
		if ( style["stroke-width"] ){ // 2014.2.26
			if ( style["vector-effect"] ){
				if ( style["stroke-width"] ){
					context.lineWidth = style["stroke-width"];
				} else {
					context.lineWidth = 0;
				}
			} else { // if none then set lw to 1 .... working
				context.lineWidth = 1;
			}
		} else {
		 context.lineWidth = 0;
		}
		if (style["stroke-dasharray"] ){
//			var dashList = new Array();
			var dashList = style["stroke-dasharray"].split(/\s*[\s,]\s*/);
//			console.log("dashList:",dashList);
			context.setLineDash(dashList);
		}
		if (style["stroke-linejoin"] ){
			context.lineJoin = style["stroke-linejoin"];
		}
		if (style["stroke-linecap"] ){
			context.lineCap = style["stroke-linecap"];
		}
		if (style.opacity){
			context.globalAlpha = style.opacity;
		}
		if (style["fill-opacity"]){
			context.globalAlpha = style["fill-opacity"];
		}
	}
}


function getCollidedImgs(imgs){
//	console.log("call getCollidedImgs");
	//RecursiveDimensionalClustering法によって(BBOXが)衝突している(重なっている)imgをリストアップする 2014.11.13
	var boundaries = new Array();
	for ( var i in imgs ){
		boundaries.push({ id:i , position:imgs[i].x , open:true , obj:imgs[i] } );
		boundaries.push({ id:i , position:(imgs[i].x + imgs[i].width) , open:false } );
	}
	
	return ( dimensionalClustering( boundaries , 0 ) );
	
//	console.log(collidedPOIs);
}

function isCollided( POIelemId ){
//	console.log( "call isCollided lazy ");
	// とりあえず選ばれたアイコンにだけ重なっているものを取り出す
	try{ // 2016.6.15 isCollided関数がからの状態のoverwrappedPOIsを返すことがある？
		var targetPOI = visiblePOIs[POIelemId];
		var overwrappedPOIs = new Array();
		for ( var i in visiblePOIs ){
			if ( i != POIelemId ){
				if ( targetPOI.x + targetPOI.width < visiblePOIs[i].x ||
					targetPOI.x > visiblePOIs[i].x + visiblePOIs[i].width ||
					targetPOI.y + targetPOI.height < visiblePOIs[i].y ||
					targetPOI.y > visiblePOIs[i].y + visiblePOIs[i].height ) {
						// none
					} else {
						visiblePOIs[i].id = i;
						overwrappedPOIs.push(visiblePOIs[i]);
						
					}
			}
		}
	//	console.log("overwrapped items:",overwrappedPOIs.length);
		if ( overwrappedPOIs.length == 0 ){
			return ( false );
		} else {
			targetPOI.id = POIelemId;
			overwrappedPOIs.push(targetPOI);
			return( overwrappedPOIs );
		}
	} catch(e) {
		console.log("ERROR",e);
		return ( false );
	}
}

function isCollided1( POIelemId ){
	// RDS法を用いて重なっているものすべてを取り出す
//	console.log("call isCollided",visiblePOIs , POIelemId);
	var collidedPOIs = getCollidedImgs(visiblePOIs);
	var cGroup;
	ccheckLoop: for ( var i = 0 ; i < collidedPOIs.length ; i++ ){
		var grp = collidedPOIs[i];
		for ( var j = 0 ; j < grp.length ; j++ ){
//			console.log( poiId, grp[j].id );
			if ( grp[j].id == POIelemId ){
				cGroup = grp;
				break ccheckLoop;
			}
		}
	}
//	console.log( cGroup);
	if ( cGroup.length == 1 ){
		return ( false );
	} else {
		return ( cGroup );
	}
}


function dimensionalClustering( boundaries , lvl ){
	// RDC法の本体 2014.11.13
	// based on http://lab.polygonal.de/?p=120
	++lvl;
	boundaries.sort( function( a, b ){
		var x = Number(a.position);
		var y = Number(b.position);
		if (x > y) return 1;
		if (x < y) return -1;
		return 0;
	});
	
	var group = new Array();
	var groupCollection = new Array();
	var count = 0;
	
	for ( var i = 0 ; i < boundaries.length ; i++ ){
		var bound = boundaries[i];
		
		if ( bound.open ){
			count++;
			group.push(bound);
		} else {
			count--;
			if ( count == 0 ){
				groupCollection.push(group);
				group = new Array();
			}
		}
	}
	
	if ( lvl < 4 ){
		for ( var j = 0 ; j < groupCollection.length ; j++ ){
			group = groupCollection[j];
			if ( group.length > 1 ){
				var boundaries = new Array();
				for ( var i = 0 ; i < group.length ; i++ ){
					if ( lvl % 2 == 0 ){
						boundaries.push({ id:group[i].id , position:group[i].obj.x , open:true , obj:group[i].obj } );
						boundaries.push({ id:group[i].id , position:(group[i].obj.x + group[i].obj.width) , open:false } );
					} else {
						boundaries.push({ id:group[i].id , position:group[i].obj.y , open:true , obj:group[i].obj } );
						boundaries.push({ id:group[i].id , position:(group[i].obj.y + group[i].obj.height) , open:false } );
					}
				}
				subGC = dimensionalClustering( boundaries , lvl );
				if ( subGC.length > 1 ){
					groupCollection[j] = subGC[0];
					for ( var i = 1 ; i < subGC.length ; i++ ){
						groupCollection.push(subGC[i]);
					}
				}
			}
		}
	}
	return ( groupCollection );
}


function getHyperLink(svgNode){
//	console.log("getHyperLink:",svgNode);
	var oneNode = svgNode;
	while ( oneNode.parentNode ){
		oneNode = oneNode.parentNode;
//		console.log(oneNode);
		if (oneNode.nodeName=="a" && oneNode.getAttribute("xlink:href")){
			return {
				href : oneNode.getAttribute("xlink:href") ,
				target : oneNode.getAttribute("target")
			};
		}
	}
	return ( null );
}


// VECTOR2Dの線や面をヒットテストする機能 2013/11/29
var pathHitTest = new Object();

function getObjectAtPoint( x, y ){
	pathHitTest.enable = true;
	pathHitTest.x = x;
	pathHitTest.y = y;
	pathHitTest.hittedElements = new Array();
	pathHitTest.hittedElementsBbox = new Array();
	dynamicLoad( "root" , mapCanvas ); // 非同期だよね・・・（ロードさえ生じなければ同期してるはずじゃない？）原理的にはロード生じないはず
	
	for ( var i = 0 ; i < pathHitTest.hittedElements.length ; i++ ){
		var target = pathHitTest.hittedElements[i];
		var targetBbox = pathHitTest.hittedElementsBbox[i];
//		var crs = svgImagesProps[getDocumentId(target)].CRS;
		var geolocMin = screen2Geo(targetBbox.x , targetBbox.y );
		var geolocMax = screen2Geo(targetBbox.x + targetBbox.width , targetBbox.y + targetBbox.height );
		
		var d = target.getAttribute("d");
		
		
		target.removeAttribute("d");
		target.setAttribute("latMin",geolocMax.lat);
		target.setAttribute("latMax",geolocMin.lat);
		target.setAttribute("lngMin",geolocMin.lng);
		target.setAttribute("lngMax",geolocMax.lng);
		showPoiProperty(target);
		target.setAttribute("d",d);
		target.removeAttribute("latMin");
		target.removeAttribute("latMax");
		target.removeAttribute("lngMin");
		target.removeAttribute("lngMax");
	}
	
	pathHitTest.enable = false;
	return ( pathHitTest.targetObject );
}

function showUseProperty( target ){
	var crs = svgImagesProps[getDocumentId(target)].CRS;
	var iprops = getImageProps(target,POI);
	var geoloc = SVG2Geo(iprops.x , iprops.y , crs );
	var useX = target.getAttribute("x");
	var useY = target.getAttribute("y");
	var useTf = target.getAttribute("transform");
	target.removeAttribute("x");
	target.removeAttribute("y");
	target.removeAttribute("transform");
	target.setAttribute("lat",geoloc.lat);
	target.setAttribute("lng",geoloc.lng);
//	console.log("showUseProperty",target , target.ownerDocument);
	showPoiProperty(target);
	target.setAttribute("x",useX);
	target.setAttribute("y",useY);
	target.setAttribute("transform",useTf);
	target.removeAttribute("lat");
	target.removeAttribute("lng");
}


// ターゲットのレイヤーのハッシュをPath名から探し出す
function getHashByDocPath( docPath ){
	var ans = null;
	for ( var i in svgImagesProps ){
//		console.log(i);
		if ( (svgImagesProps[i].Path) == null ){
//			console.log("pass");
		} else if ( (svgImagesProps[i].Path).indexOf( docPath )>=0 ){
			ans= i;
//			console.log("found!");
			break;
		}
	}
	return (ans);
}

// linkedDocOp: 子文書に対して、同じ処理(func)を再帰実行する関数 (2013/12/25)
// 引数：
//   func    : 再帰実行をさせたいユーザ関数
//   docHash : 再帰実行のルートになる文書のハッシュ
//   param?  : ユーザ関数に渡したいパラメータ(max 5個・・)
// linledDocOpに渡すユーザ関数は、以下の仕様を持っていなければならない
// 第一引数：処理対象SVG文書
// 第二引数：その文書プロパティ群
// 第三引数以降：任意引数(max5個)
// issue 任意引数の数を可変長にしたいね(現在は最大５個にしてる)（要勉強）
function linkedDocOp( func , docHash , param1, param2 , param3 , param4 , param5 ){
	var targetDoc = svgImages[ docHash ];
	var targetDocProps = svgImagesProps[ docHash ];
	
	if ( targetDoc ){
		func(targetDoc , targetDocProps , param1, param2 , param3 , param4 , param5 );
		
		
		// child Docs再帰処理
		var childDocs = targetDocProps.childImages;
		for ( var i in childDocs ){
			if ( childDocs[i] == CLICKABLE || childDocs[i] == EXIST ){
				// existなのに実存しない？(unloadしているのにexistのままだな)
				linkedDocOp ( func , i , param1, param2 , param3 , param4 , param5 );
			}
		}
	}
}
	

// POIをクリックしたときに起動する関数です
// 適当に作り替えて使っても良いでしょう
// 第一引数には、該当する"SVGコンテンツ"の要素が投入されます。
// 便利関数：svgImagesProps[getDocumentId(svgElem)], getImageProps(imgElem,category)
//
function showPoiProperty(target){
//	console.log ( "Target:" , target );
//	console.log ( target.parentNode );
	
//	var metaSchema = target.parentNode.getAttribute("property").split(",");
	var metaSchema = null;
	if ( target.ownerDocument.firstChild.getAttribute("property") ){
		metaSchema = target.ownerDocument.firstChild.getAttribute("property").split(","); // debug 2013.8.27
	}
	
	
	var message="";
	if ( target.getAttribute("content") ){ // contentメタデータがある場合
		var metaData = target.getAttribute("content").split(",");
		for ( var j = 0 ; j < metaData.length ; j++ ){
			metaData[j]=metaData[j].replace(/^\s+|\s+$/g,'');
			if (metaData[j].indexOf("'")==0 || metaData[j].indexOf('"')==0){
				var countss = 0;
//				console.log("test:",metaData[j]," ::: ",metaData[j].substr(metaData[j].length-1,1));
				while(metaData[j].substr(metaData[j].length-1,1) !="'" && metaData[j].substr(metaData[j].length-1,1) !='"'){
					metaData[j]=metaData[j]+","+metaData[j+1];
					metaData.splice(j+1,1);
//					console.log(countss,metaData[j]);
					++countss;
					if ( countss > 5 ){
						break;
					}
				}
				metaData[j]=metaData[j].replace(/['"]/g,"");
			}
		}
		
		if ( metaSchema && metaSchema.length == metaData.length ){
			message = "[name] , [value]\n";
			for ( var i = 0 ; i < metaSchema.length ; i++ ){
				var data = "--";
				if ( metaData[i]!=""){
					data = metaData[i];
				}
				message += metaSchema[i] + " , " + data + "\n";
			}
		} else {
			message = "[number] , [value]\n";
			for ( var i = 0 ; i < metaData.length ; i++ ){
				var data = "--";
				if ( metaData[i]!=""){
					data = metaData[i];
				}
				message += i + " , " + data + "\n";
			}
		}
		
		if ( getHyperLink(target) ){
			message += "link , " + getHyperLink(target).href + "\n";
		}
		if ( target.getAttribute("lat") ){
			message += "\n"+ "緯度, " + target.getAttribute("lat") + "\n経度, " + target.getAttribute("lng");
		}
	} else { // 無い場合
		message = getAttributes( target );
	}
	alert("POI CLICKED!\nイベント元要素のメタデータは、\n" + message + "です。");
	
}

function getAttributes( domElement ){
	var nm = domElement.attributes;
	var ans ="";
	for ( var i = 0 ; i < nm.length ; i++ ){
		ans += nm.item(i).nodeName + " , " + domElement.getAttribute(nm.item(i).nodeName) + "\n";
	}
	return ( ans );
}




// タイリングされ複数文書に分割されたデータ全体に対して同じ処理を与えるルーチンのサンプルです。(2013.12.24)
function contColorSet() {
//	console.log("called original contColorSet..");
	var param = Number(document.getElementById("contValue").value);
	if ( param ){
		contColorSetContinuous( param ); // サンプルその２のほうを使っています
//		contColorSetOnce( param ); // こちらを選ぶとサンプルその１を使います。
	}
}


function refreshScreen(){
	dynamicLoad( "root" , mapCanvas );
}
	
// サンプルその１
// 伸縮スクロールしても設定した処理が波及しない版(比較的単純)
// 指定したmごとに、等高線の色を赤＆太くする
function contColorSetOnce( param ){
//	console.log("Once");
//	console.log("Call contSearch : " + param , "caller:" , arguments.callee.caller, " src:" , window.event.srcElement);	
	
	// コンターのレイヤー(のルート文書のハッシュ)を取り出す
	var targetHash = getHashByDocPath( "vectorContainer.svg" );
	
	// その文書の子孫文書(タイル)全部に対して、指定した文書処理(ここではcontourMarker)を実施する
	// linkedDocOpがそのためのユーティリティ関数です
	linkedDocOp( contourMarker , targetHash , param );
	dynamicLoad( "root" , mapCanvas ); // 再描画を実行(dynamicLoad("root",mapCanvas)です）
}


// サンプルその２
// 伸縮スクロールしても設定した処理が波及する版(イベントリスナが絡んで結構複雑ですよ)
// 指定したmごとに、等高線の色を赤＆太くする
// ズームパンが実行されると、"zoomPanMap" イベントが発行される。それをキャプチャして伸縮スクロール時に処理を実行させる。

function contColorSetContinuous( interval ){
	var csMode;
	if ( document.getElementById("contButton").innerHTML == "contourSearch[m]"){
		document.getElementById("contButton").innerHTML = "disableSearch";
		document.getElementById("contValue").disabled="true";
		csMode = false;
	} else {
		document.getElementById("contButton").innerHTML = "contourSearch[m]"
		document.getElementById("contValue").disabled="";
		csMode = true;
	}
//	console.log("Call contSearch : " + interval , "caller:" , arguments.callee.caller, " src:" , window.event.srcElement);	
	
	
	if ( csMode ){
		document.removeEventListener("zoomPanMap", eDom, false);
		csMode = false;
		eDom = editDOM(interval, true);
		eDom();
	} else {
		eDom = editDOM( Number(interval) , false );
		
		// 最初の処理実施(これはズームパンと関係なく、すぐに処理を反映させるため)
		eDom();
		// ズームパン処理が完了したところで、指定処理を実施し、再描画を実施する。
		document.addEventListener("zoomPanMap", eDom , false);
		csMode = true;
	}
}

var eDom; // editDOMクロージャ用のグローバル変数
function editDOM(interval , clear){ // DOM編集処理の内容(関数化すると良い) クロージャになります！
	return function (){
//		console.log("custom event detect");
		// コンターのレイヤー(のルート文書のハッシュ)を取り出す
		var targetHash = getHashByDocPath( "vectorContainer.svg" );
		// その文書の子孫文書(タイル)全部に対して、指定した文書処理(ここではcontourMarker)を実施する
		// linkedDocOpがそのためのユーティリティ関数です
		linkedDocOp( contourMarker , targetHash , interval , clear);
		dynamicLoad( "root" , mapCanvas );
	}
}

// linkedDocOpに渡す関数のサンプル（１，２共用です）：第一引数に処理対象SVG文書、第二引数にその文書プロパティ群（ここまでが固定）、第三引数以降に任意引数(複数)が与えられる
function contourMarker( layerDoc , layerProps , interval , clear){
//	console.log("call contoutMarker:", layerProps);
	// すべてのPathを選択して
	var contourPaths = layerDoc.getElementsByTagName("path");
	
	for ( var i = 0 ; i < contourPaths.length ; i++){
		var onePath = contourPaths[i];
		// 標高を検索して
		var alt = Number(onePath.getAttribute("lm:標高"));
		// 標高/intervalの剰余が0だったら色と太さを変える(ただしclearフラグが無いとき)
		if ( alt && ( alt % interval == 0 ) ){
			if ( !clear ){
				onePath.setAttribute("stroke","red");
				onePath.setAttribute("stroke-width","2");
			} else { // clearフラグがあるときは設定を解除する
				onePath.removeAttribute("stroke");
				onePath.removeAttribute("stroke-width");
			}
		}
	}
}

return { // svgMap. で公開する関数のリスト 2014.6.6
	// まだ足りないかも？
	// http://d.hatena.ne.jp/pbgreen/20120108/1326038899
	zoomup : zoomup,
	zoomdown : zoomdown,
	gps : gps,
	getLayers : getLayers,
	layerControl : layerControl,
//	contColorSet : contColorSet,
	linkedDocOp : linkedDocOp,
	dynamicLoad : dynamicLoad,
//	mapCanvas : mapCanvas,
	getMapCanvas : function(){ return (mapCanvas) },
	setMapCanvas : function( mc ){ mapCanvas = mc },
//	mapCanvasSize : mapCanvasSize,
	getMapCanvasSize : function( ){ return (mapCanvasSize) },
	setMapCanvasSize : function( mcs ){ mapCanvasSize = mcs },
//	rootViewBox : rootViewBox,
	getRootViewBox : function( ){ return (rootViewBox) },
	setRootViewBox : function( rvb ){ rootViewBox = rvb },
//	geoViewBox : geoViewBox,
	getGeoViewBox : function( ){ return (geoViewBox) },
//	rootCrs : rootCrs,
	getRootCrs : function( ){ return (rootCrs) },
//	root2Geo : root2Geo,
	getRoot2Geo : function( ){ return (root2Geo) },
	getHashByDocPath : getHashByDocPath,
	getViewBox : getViewBox,
//	svgImages : svgImages,
	getSvgImages : function( ){ return (svgImages) },
//	svgImagesProps : svgImagesProps,
	getSvgImagesProps : function( ){ return (svgImagesProps) },
	getSvgTarget : getSvgTarget,
	POIeditSelection : POIeditSelection,
	getHyperLink : getHyperLink,
	showPage : showPage,
	POIviewSelection : POIviewSelection,
	showUseProperty : showUseProperty,
	testClick : testClick,
	setTestClicked : function( ck ) { testClicked = ck},
	Geo2SVG : Geo2SVG,
	SVG2Geo : SVG2Geo,
	transform : transform,
	getConversionMatrixViaGCS : getConversionMatrixViaGCS,
	getTransformedBox : getTransformedBox,
//	zoomRatio : zoomRatio,
//	summarizeCanvas : summarizeCanvas,
	setSummarizeCanvas : function( val ){ summarizeCanvas = val },
//	loadingTransitionTimeout : loadingTransitionTimeout,
	setMapCanvasCSS : setMapCanvasCSS,
	getBBox : getBBox,
	loadSVG : loadSVG,
	setGeoCenter : setGeoCenter,
	setGeoViewPort : setGeoViewPort,
	handleResult : handleResult,
	ignoreMapAspect : function(){ ignoreMapAspect = true; },
	getCentralGeoCoorinates : getCentralGeoCoorinates,
	addEvent : addEvent,
	setShowPoiProperty : function( val ) {showPoiProperty = val }, 
	override : function ( mname , mval ){
//		console.log("override " + mname );
		eval( mname + " = mval; "); // もっと良い方法はないのでしょうか？
//		console.log("override " + mname + " : " , this[mname] , showPoiProperty , this.showPoiProperty , this);
	},
	getObject : function ( oname ){
		return ( eval ( oname ) );
	},
	callFunction : function ( fname ,p1,p2,p3,p4,p5){
//		console.log("call callFunc:",fname , p1,p2,p3,p4,p5);
		eval( "var vFunc = " + fname);
//		vFunc();
		var ans = vFunc.call(null,p1,p2,p3,p4,p5);
//		eval( fname  ).bind(null,p1,p2,p3,p4,p5);
		return ( ans );
	},
	getHyperLink : getHyperLink,
	setDevicePixelRatio : setDevicePixelRatio,
	refreshScreen : refreshScreen
}

})();

window.svgMap = svgMap;


})( window );
