// 
// Description:
//  SVG Map Level0.1 Framework Extension module
//  SVG Map Level0.1 Frame Implementation
//
// This module has the ability to embed and control map drawing by
// describing layers and geographic feature information in tags
// reminiscent of maps embedded in html and by manipulating the
// DOM APIs, similar to other mediocre map frameworks.
//  
// Programmed by Satoru Takagi
//  
// Copyright (C) 2020- by Satoru Takagi @ KDDI CORPORATION
//  
//
// Home Page: http://svgmap.org/
// GitHub: https://github.com/svgmap/svgMapLv0.1
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
// 2020/10/29 : rev1: 1st working prototype
// 2020/11/05 : rev2: .scriptではなく、レイヤーUI(svgImageProps.controller,.controllerWindowの)の.rootMessageにいろいろ設置、更新したら、.rootMessage.update()を呼び出すようにアーキテクチャ変更
// 2020/11/13 : rev3: svgMapAppPage値svg-map要素で指定、svgMapAppPageオブジェクトに任意のパラメータを投入できる機構
// 2021/02/05 : rev4: レイヤUIを別指定した場所に設置可能に。レイヤーのID等を取得可能に

// TBDs
//  done svg-mapタグでwidth,heightを指定
//  done ルートコンテナに該当レイヤーがあるが、visibleでないもの(ロードされてないレイヤ)をvisibleにして追加する系がない
//  done rootMessage　proxyやget,setで値の変化を監視 これはアプリ側でできるようになった気がする。（FWからは特定の変数に値を投入するのでその変数をgeter設定したものにしてあげれば良い。extPoiLayer.htmlのrootMessage{}参照
//  done 緯度経度をbboxで指定
//  図法の指定できたらいいな　⇒　これは下のsvgMapAppPageと統合的に解決するべきかな
//  done svgMapAppPage値は、デフォルトじゃないものをsvg-map要素で指定できると良いね
//  done ⇒ svgMapAppPageのオブジェクトに任意のパラメータを投入できると良いな　これはlayerのwindowに投入する仕組みと同じで良いと思う
//  svgMapAppPageのディレクトリ位置をベースにしたURL解決なのが気持ち悪い
//  showModalの内容を、こちらで別指定した場所に掲示したいケースあるよね
//  done layer固有UIも同じく
//  done layerタグに該当するlayerIDを得たい( 該当LAYER要素.layerIdでアクセス可能なgetter設置)
//  layerのOn/Offを自由に切り替えたい 
//  layerUIを自由にOn/Offしたい

// ISSUE
//  2021/1/8 LAYER要素の並び順にしたがってレイヤーを重ねる感じになっていないと思う。


/**

SVGMapLv0.1_Frame*.jsの仕様
読み込むjsはSVGMapLv0.1_Frame_*.jsのみ
フレームワーク本体は、このjsが生成する、地図を表示するiframeのhtmlから読まれる。
そのhtmlは　後述するsvg-map要素の svgMapAppPage属性～こんなの"SVGMapper_r16_layerUICustom.html" で読み込まれる
　svgMapAppPage属性がなかった場合はなんか適当に決め打ちの場所尾htmlが読まれる感じ～ただしその辺の決めが今のところ怪しい。

使用できる要素
svg-map　カスタムエレメント　：　SVGMapコンテンツが配置される要素。
layer　エレメント　：　svg-map要素の下に入る要素　地図のレイヤーを表現する要素


各要素の仕様
svg-map:
 属性： 全てオプショナル
  svgMapAppPage : 
  latitude : 表示位置
  longitude : ^^
  zoom : 中心点で指定(値はint 1..25ぐらいまで webMercatorタイルピラミッドのレベル番号)
  latitude2 : 数字無しと組で対角領域で指定
  longitude2 : ^^
  customjson : 任意のjson SVGMap.jsのあるiframeのwindow.rootMessage.customJsonに値が反映される
  layerui : レイヤーUIを決める　この値はmutationをobserveしてない（svg-mapオブジェクトが生成された、最初の一回のみ）
  
  layerui,svgMapAppPageを除き、これらの属性は、DOM編集による変更が即座に反映される。また下記のlayer要素の追加も即座に反映される

layer:
 属性:
  title: レイヤー名　SVGMapコンテナファイルにある
  src: URL
  それ以外の任意の属性が許され、それは該当するレイヤーのレイヤ固有UI(controller)HTMLのwindow.rootMessage.(任意の属性)に投入される
  
  任意の属性、textContent、XML要素にDOM編集による変化は、その都度window.rootMessageの対応するメンバ変数に反映される
  layerUIのwebApps側では、この変化のタイミングをsetterなどを使って検知するか、もしくは別途window.rootMessage.update()関数を用意しておけばそれが呼び出される。
  
 任意のtextContent子ノード
  該当するレイヤーのレイヤ固有UI(controller)HTMLのwindow.rootMessage.textContentに投入される
  
 任意の階層化されたXML要素 子ノード群
  該当するレイヤーのレイヤ固有UI(controller)HTMLのwindow.rootMessage.xmlContentに投入される
  
**/



function svgMapElementDriver(){
	var svgMapAppPage="../SVGMapper_r16.html";
	var delaying=false;
	var tagAttrs,shadowRoot;
	
	var svgMapElement;
	var svgMapWindow, svgMapObj;
	var layerTagsMap ={}; // LAYER要素とSVGMapレイヤーのレイヤIDを紐づける辞書　registLayer(とその呼び先)で作られる
	
	var observedAttrList;
	
	function init(element,_observedAttrList){
		observedAttrList = _observedAttrList;
		svgMapElement = element;
		// element.addEventListener('slotchange', onSlotChange);
	}
	
	/**
	function onSlotChange(event){
		console.log("onSlotChange:",event);
	}
	**/
	
	function getAttrNumb(attrName,defaultVal){
		var val = Number(svgMapElement.getAttribute(attrName));
		var ans = defaultVal;
		if ( val ){
			ans = val;
		}
		return ( ans );
	}
	
	
	
	function getTagAttrs(){
		// svgMapAppPage, tagAttrs グローバル変数を設定している
		var latitude=35,longitude=135,zoom=null,mwidth=600,mheight=400;
		
		var apAttr = svgMapElement.getAttribute(observedAttrList[7]);
		if ( apAttr ){
			svgMapAppPage = apAttr;
		}
		
		latitude = getAttrNumb(observedAttrList[0],latitude);
		longitude = getAttrNumb(observedAttrList[1],longitude);
		
		// 2点指示のケース
		var latitude2 = getAttrNumb(observedAttrList[5],null);
		var longitude2 = getAttrNumb(observedAttrList[6],null);
		if ( longitude2==null || latitude2==null ){
			zoom=5;
		}
		
		zoom = getAttrNumb(observedAttrList[2],zoom);
		if (zoom!=null && ( zoom < 0 || zoom >20)){
			zoom=5;
		}
		
		mwidth = getAttrNumb(observedAttrList[3],mwidth);
		mheight = getAttrNumb(observedAttrList[4],mheight);
		
		var customJson = svgMapElement.getAttribute(observedAttrList[8]);
		
		tagAttrs = { // globalVariable
			latitude:latitude,
			longitude:longitude,
			zoom:zoom,
			width:mwidth,
			height:mheight,
			latitude2:latitude2,
			longitude2:longitude2,
			customJson:customJson
		};
		console.log("tagAttrs:",tagAttrs);
		// return tagAttrs; // この　値返却の意味はないよな・・
	}
	
	function getSvgMapFragmentLink( _tagAttrs , _svgMapAppPage){
		var ta = _tagAttrs;
		var ans;
		if ( ta.latitude && ta.longitude && ta.zoom ){
			var part = Math.pow(2,ta.zoom);
			
			var w = 360 / part;
			var h = 180 / part;
			
			var x = ta.longitude - 0.5 * w;
			var y = ta.latitude - 0.5 * h;
			
			ans = _svgMapAppPage + "#xywh=global:"+x+","+y+","+w+","+h ;
			
		} else if ( ta.latitude && ta.longitude && ta.latitude2 && ta.longitude2 ){
			var w = Math.abs(ta.longitude-ta.longitude2);
			var h = Math.abs(ta.latitude-ta.latitude2);
			var x = Math.min(ta.longitude,ta.longitude2)
			var y = Math.min(ta.latitude,ta.latitude2);
			
			ans = _svgMapAppPage + "#xywh=global:"+x+","+y+","+w+","+h ;
		} else {
			ans =  _svgMapAppPage;
		}
//		console.log("getSvgMapFragmentLink:",ans);
//		svgMapLink = ans;
		return ( ans );
	}
	
	function setCenter( longitude, latitude, zoom ){
		var lat = Number(latitude);
		var lng = Number(longitude);
		var z = Number(zoom);
		if ( !lat || !lng){
			return;
		}
		if (!z){
			zoom=4;
		}
		svgMapElement.setAttribute("latitude",latitude);
		svgMapElement.setAttribute("longitude",longitude);
		svgMapElement.setAttribute("zoom",zoom);
	}
	
	var svgMapFrameLoaded=false;
	function buildSvgMapFrame(){
		svgMapFrameLoaded=false;
		getTagAttrs(); // tagAttrsと、svgMapAppPageグローバル変数を設定する
//		console.log("tagAttrs:",tagAttrs);
		var svgMapFramelink = getSvgMapFragmentLink(tagAttrs , svgMapAppPage);
		_buildSvgMapFrame(svgMapFramelink);
	}
	
	function _buildSvgMapFrame(svgMapLink){
		var svgMapFrameWidth = tagAttrs.width;
		var svgMapFrameHeight = tagAttrs.height;
		shadowRoot = svgMapElement.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = `
		<div>
			<iframe id="svgmapIframe" src="${svgMapLink}" width="${svgMapFrameWidth}" height="${svgMapFrameHeight}" frameborder="0"></iframe>
		</div>
		`; // テンプレートリテラル 
		
		svgMapWindow = shadowRoot.getElementById("svgmapIframe").contentWindow;
		svgMapWindow.addEventListener("load",function(){
			svgMapObj = svgMapWindow.svgMap;
//			console.log("regist svgMapObj : ", svgMapObj);
			svgMapWindow.document.addEventListener("zoomPanMap",initialSvgMapLoad);
			// svgMapWindow.document.addEventListener("screenRefreshed",function(){console.log("screenRefreshed")}); // addLayerした後はこっちのイベントが出る
			// レイヤーUI表示部を親文書の指定個所に設定する機能 2020/12/02
			var customLayerUiDivId = (svgMapElement.getAttribute("layerui")); // レイヤーUIの場所(の#id)を指定する属性
			if ( customLayerUiDivId && customLayerUiDivId.startsWith("#")){
				customLayerUiDivId = customLayerUiDivId.substring(1);
				var customLayerUiDiv = document.getElementById(customLayerUiDivId);
				if ( customLayerUiDiv ){
					console.log("assignLayerSpecificUiElement:",customLayerUiDiv);
					svgMapWindow.svgMapLayerUI.assignLayerSpecificUiElement(customLayerUiDiv);
				}
			}
			

		});
//		console.log("connected svgMapElement : attrs:",tagAttrs,"  svgMapWindow:",svgMapWindow);
	}
	
	function initialSvgMapLoad(){
		svgMapWindow.document.removeEventListener("zoomPanMap",initialSvgMapLoad);
		svgMapFrameLoaded=true;
//		svgMapLayers = svgMapObj.getRootLayersProps();
//		console.log("zoomPanMap svgMapObj","   layers:",svgMapLayers);
		if ( tagAttrs.customJson ){
			transferCustomJson( tagAttrs.customJson );
		}
		registLayers();
	}
	
	var prevCustomJsonText;
	function transferCustomJson(jsonText){
		if ( svgMapFrameLoaded == false ){
			return;
		}
		var js;
		if ( jsonText == prevCustomJsonText ){
			return;
		}
		prevCustomJsonText = jsonText;
		try{
			js = JSON.parse(jsonText);
		} catch ( e ){
			console.log("Custom JSON parse err:",e);
			return;
		}
		
		if ( !svgMapWindow.rootMessage ){
			console.log("make svgMapWindow.rootMessage");
			svgMapWindow.rootMessage={};
		}
		svgMapWindow.rootMessage.customJson = js;
	}
	
	var changeMap_delaying;
	function changeMap(){
		getTagAttrs(); // tagAttrsと、svgMapAppPageグローバル変数を設定する
		//console.log("_changeMap changeMap_delaying json:",changeMap_delaying);
		if ( changeMap_delaying ){
//			console.log("REJECT changeMap_delaying");
			return;
		}
		changeMap_delaying=true;
		setTimeout(changeMap_ph2,10); // 10ms 遅延処理を入れる（プロパティの一気書き換えに伴う連続リクエストを抑止）
	}
	
	function changeMap_ph2(){
		changeMap_delaying=false;
		var sr = shadowRoot;
//		console.log("changeMap_ph2  : changeMap_delaying:",changeMap_delaying," tagAttrs:",tagAttrs);
		if(sr){
			var svgIf = sr.getElementById("svgmapIframe");
			var svgMapLink = getSvgMapFragmentLink(tagAttrs,svgMapAppPage);
//			console.log(svgMapLink,tagAttrs);
			svgIf.setAttribute("width",tagAttrs.width);
			svgIf.setAttribute("height",tagAttrs.height);
			svgIf.setAttribute("src",svgMapLink);
			if ( tagAttrs.customJson ){
				transferCustomJson( tagAttrs.customJson );
			}
		}
	}
	
	function traceLayer(childElem){ // その変化の源のLAYER要素を探索する
		var ans;
		if ( childElem.nodeName == "LAYER" ){
			ans =  childElem;
		} else {
			if ( childElem.parentNode ){
				ans = traceLayer(childElem.parentNode);
			} else {
				ans = null;
			}
		}
		return ( ans );
	}
	
	function observeMutation(){ // svg-map要素が変化したら表示を変える
		var observer = new MutationObserver(function(mutations) { // 変化したときに実行する関数
			mutations.forEach(function(mutation) {
				//Detect <img> insertion
				console.log("mutation occured:", mutation);
				if ( mutation.type=="attributes" ){ // 属性変化
					if ( mutation.target.nodeName !="SVG-MAP"){
						// SVG-MAP要素の変化は、ここではなくcustom elementsのattributeChangedCallbackで処理している
						registLayer(traceLayer(mutation.target)); // レイヤー子要素の属性変化
					}
				} else { // 要素やtextcontentの変化
					// TBD characterDataの変化はどうしようかな‥‥　基本的に今は使用してないが。
					if ( mutation.target.nodeName =="SVG-MAP"){
						// svg-map要素直下のノード(基本的にlayer要素)自体が変更された場合
						// SVG-MAPのcharacterDataが変化するときもここに来るかも・・
						for ( var i = 0 ; i < mutation.addedNodes.length ; i++ ){
							var layer = traceLayer(mutation.addedNodes[i]);
							console.log("Add Layer:",layer);
							registLayer(layer);
						}
						for ( var i = 0 ; i < mutation.removedNodes.length ; i++ ){
							var layer = traceLayer(mutation.removedNodes[i]);
							console.log("Remove Layer:",layer);
							removeLayerByLayerElement(layer);
						}
					} else {
						// addedだろうがremovedだろうが関係なく、LAYER要素（及びそれ以下の要素など)の場合はそれが属するLATER要素の子供を全部送るので問題ないはずだと思う・・
						var layer = traceLayer(mutation.target);
						if ( layer ){
							registLayer(layer);
						}
					}
					
					/** なのでこの種の処理は不要だと思われる
					// addedNodesもremovedNodesも最初の1個しか反映させないつもりだが、大丈夫かな？
					if (mutation.addedNodes.length>0){	//
//						console.info('Node added: ', mutation.addedNodes[0].nodeName);
						if ( mutation.addedNodes[0].nodeName=="LAYER"){ // layer子要素の変化
							registLayer(mutation.addedNodes[0]);
						} else if ( mutation.addedNodes[0].parentNode.nodeName=="LAYER"){ // layer子要素のtextcontentの変化
							registLayer(mutation.addedNodes[0].parentNode);
						}
					} else if ( mutation.removedNodes > 0 ){
						// ISSUE: TODO: removedNodesが対応できていない！ 2020/12/24
						// https://developer.mozilla.org/ja/docs/Web/API/MutationRecord
						if ( mutation.removedNodes[0].nodeName=="LAYER"){ // layer子要素の削除
						} else if ( mutation.removedNodes[0].parentNode.nodeName=="LAYER"){ // layer子要素のtextcontentの削除
						}
					}
					**/
				}
			})
		})
//		observer.observe(svgMapElement, { childList: true }); // 変異監視の対象要素
		observer.observe(svgMapElement, { attributes:true, childList:true, subtree : true }); // 変異監視の対象要素 属性、小孫要素全部
	}
	
	
	function registLayer(layer){ // layer子要素全般のコントロールをしている関数
		if ( ! svgMapObj ){
			return;
		}
//		svgMapLayers = svgMapObj.getRootLayersProps();
		var sips = svgMapObj.getSvgImagesProps();
		var url,title;
		var textContent = layer.textContent;
		var innerXML=null;
		if ( layer.childElementCount > 0 ){
			innerXML = layer.innerHTML;
		}
		
		var attrs = layer.getAttributeNames();
		userAttrs={};
		for ( var i =0 ; i < attrs.length ; i++ ){
			var aname = attrs[i];
			var aval = layer.getAttribute(aname);
			if ( aname == "src" ){
				url = aval;
			} else if ( aname == "title"){
				title = aval;
			} else {
				userAttrs[aname]=aval;
			}
		}
//		console.log("layer:",layer, "  attrs:",attrs," url:",url,"  title:",title," userAttrs:",userAttrs,"  textContent:",textContent,"  \nsvgMapLayers:",svgMapLayers);
		var layerId;
		if ( title ){
			layerId = svgMapObj.getLayerId(title);
		}
		if ( !layerId && url ){
			layerId = svgMapObj.getLayerId(url); // #(ハッシュ)を変化させる系は既存のものを何かする系？。いや　URLは微妙だ・・　同じURLで別のレイヤーはザラにある。逆にそういうのを変化させる系はどうする？
		}
		
		// layerにgetterを設定する 2021/1/12
		// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/get
		try{
			Object.defineProperty(layer, "layerId", {get: function(){
				var ans = getLayerId(this);
				console.log("called layerId getter : ",this, ans);
				return ans;
			}});
			Object.defineProperty(layer, "svgImage", {get: function(){
				var lid = getLayerId(this);
				var ans = svgMapObj.getSvgImages()[lid];
				console.log("called svgImage getter : ",this, ans);
				return ans;
			}});
			Object.defineProperty(layer, "svgImageProps", {get: function(){
				var lid = getLayerId(this);
				var ans = svgMapObj.getSvgImagesProps()[lid];
				console.log("called svgImageProps getter : ",this, ans);
				return ans;
			}});
			Object.defineProperty(layer, "controllerWindow", {get: function(){
				var lid = getLayerId(this);
				var ans = (svgMapObj.getSvgImagesProps()[lid]).controllerWindow;
				console.log("called controllerWindow getter : ",this, ans);
				return ans;
			}});
		} catch(e){
			// skip 多分既に登録済み・・もうちょっとスマートな方法(登録済みのものはそもそもtryしない)に改善したいね
		}
		
		if ( layerId){
			// 既存のレイヤーに対して何かやる系
//			console.log("set textContent:",textContent);
			if (sips[layerId]){ // 既に表示状態のレイヤー
				setValuesToController(sips[layerId],textContent,innerXML,userAttrs);
			} else {
//				console.log("レイヤーをvisibleにしてデータを追加します:",layerId,title);
				// done ルートコンテナに該当レイヤーがあるが、visibleでないものに追加する系
				svgMapObj.setLayerVisibility(layerId,true);
				if ( textContent || Object.keys(userAttrs).length>0 || innerXML){
					passParamsToNewLayer(null, layerId, sips, textContent, innerXML, userAttrs);
				}
			}
			layerTagsMap[layerId]=layer;
		} else if ( url ){
			// 新しいレイヤーを追加する系
			var nl = addLayer(url,title,null,null,layer);
//			console.log("new Layer:",nl);
			if ( textContent || Object.keys(userAttrs).length>0 || innerXML){
				passParamsToNewLayer(nl.title, null, sips, textContent, innerXML, userAttrs);
				/**
				function passParamsToNewLayer(){
					layerId =  svgMapObj.getLayerId(nl.title);
					console.log("layer add completed : ", sips[layerId]);
					svgMapWindow.document.removeEventListener("screenRefreshed",passParamsToNewLayer);
					setValuesToController(sips[layerId],textContent,innerXML,userAttrs);
				}
				svgMapWindow.document.addEventListener("screenRefreshed",passParamsToNewLayer); // 読み込み完了したら、textContentとかのデータを渡す感じにしたい
				**/
			}
		} else {
			console.log("There are no layer named ",title);
		}
	}
	
	function passParamsToNewLayer(layerTitle, layerId, sips, textContent, innerXML, userAttrs){
		function passParamsToNewLayer_int(){
			if ( !layerId ){
				layerId =  svgMapObj.getLayerId(layerTitle);
			}
			console.log("layer add completed : ", sips[layerId]);
			svgMapWindow.document.removeEventListener("screenRefreshed",passParamsToNewLayer_int);
			setValuesToController(sips[layerId], textContent, innerXML, userAttrs);
		}
		svgMapWindow.document.addEventListener("screenRefreshed",passParamsToNewLayer_int); // 読み込み完了したら、textContentとかのデータを渡す感じにしたい
	}
	
	function setValuesToController(svgImageProps, textContent, innerXML, userAttrs,count){
		if ( !svgImageProps){
			console.log("this layer is not...");
			return;
		}
		if ( !svgImageProps.controller ){ // controllerが存在し、それが動いているものに対してのみ動作する。
			console.log("this layer don't have controller...");
			return;
		}
		
		if (!count ){
			count =0;
		} else if ( count == 10 ){ // 10回コールしてダメなときは終了
			console.log("this layer don't activate controller...");
			return;
		}
		
		// rev2ではcontrollerWindowを対象として、インライン値を送信する
		if ( svgImageProps.controllerWindow && svgImageProps.controllerWindow.document.readyState === "complete"){
			if ( !svgImageProps.controllerWindow.rootMessage ){
				svgImageProps.controllerWindow.rootMessage ={}; //これをproxyやget,setで監視すればいいのかな？TBD
			}
			svgImageProps.controllerWindow.rootMessage.textContent=textContent;
			if ( innerXML ){
				svgImageProps.controllerWindow.rootMessage.xmlContent=innerXML;
			}
			for ( var attrName in userAttrs ){
//				console.log("set userAttrs:k,v:",attrName,userAttrs[attrName]);
				svgImageProps.controllerWindow.rootMessage[attrName] = userAttrs[attrName];
			}
			if ( typeof(svgImageProps.controllerWindow.rootMessage.update)=="function"){
				svgImageProps.controllerWindow.rootMessage.update();
			}
			console.log("Parameter transmit success!!");
		} else { // controllerWindowが出来上がってないので.51秒待って再実行
//			console.log("Parameter transmit RETRY...");
			setTimeout( function(){
				++count;
				setValuesToController(svgImageProps, textContent, innerXML, userAttrs,count);
			},500);
		}
	}
	
	function registLayers(){
//		console.log("registLayers");
		var childs = svgMapElement.children;
		for ( var i = 0 ; i < childs.length ; i++ ){
			if ( childs[i].nodeName=="LAYER"){
				var layer = childs[i];
				registLayer(layer);
			}
		}
	}
	
	function addLayer(url,title,lclass,visibility,correspondingLayerElem){
		if ( ! url ){
			return;
		}
		var sis = svgMapObj.getSvgImages();
		var root = sis["root"];
		var bl =root.createElement("animation");
		bl.setAttribute("x","-30000");
		bl.setAttribute("y","-30000");
		bl.setAttribute("width","60000");
		bl.setAttribute("height","60000");
		bl.setAttribute("xlink:href",url);
		if ( lclass ){
			bl.setAttribute("class",lclass);
		}
		if ( visibility ){
			bl.setAttribute("visibility",visibility);
		}
		if (typeof( title )!="string"){
			title = url.substring(url.lastIndexOf("/")+1); 
		}
		if ( svgMapObj.getLayerId(title)){
			title=title + "_"+(new Date()).getTime();
		}
		bl.setAttribute("title",title);
		
		function addLayer_int(){
			svgMapWindow.document.removeEventListener("screenRefreshed",addLayer_int);
			var layerId =  svgMapObj.getLayerId(title);
			layerTagsMap[layerId] = correspondingLayerElem;
			console.log("addLayer: new LayerID is :",layerId);
		}
		
		root.documentElement.appendChild(bl);
		svgMapObj.updateLayerListUI();
		if ( correspondingLayerElem ){ // 読み込み終わったら、LAYER要素とSVGMapレイヤーのレイヤIDを紐づける辞書を作る
			svgMapWindow.document.addEventListener("screenRefreshed",addLayer_int);
		}
		svgMapObj.refreshScreen();
		
		return {
			title:title,
			url:url
		}
	}
	
	function removeLayerByLayerElement(layerElement){
		console.log("removeLayerByLayerElement: layerElement:",layerElement,"  layerTagsMap:",layerTagsMap);
		var layerId = getLayerId(layerElement);
		if ( layerId ){
			removeLayer(layerId);
		}
	}
	
	function getLayerId(layerElement){
		var ans=null;
		for ( var layerId in layerTagsMap ){
			if ( layerElement == layerTagsMap[layerId]){
				ans = layerId;
				break;
			}
		}
		return ( ans );
	}
	
	function removeLayer(layerID){ // SVGMapLayerUtil.jsからコピーしてきた・・後で何とか統合したい 2021/1/8
		var sis = svgMapObj.getSvgImages();
		var root = sis["root"]; // ルートコンテナのsvg doc
		var targetElem = getElementByAttr( root.documentElement , layerID , "iid" );
		if ( targetElem ){
			try{
				root.documentElement.removeChild(targetElem);
				svgMapObj.updateLayerListUI();
				svgMapObj.refreshScreen();
				return ( true );
			} catch ( e ){
				console.error("targetElem:",layerID," is, however can not remove it.");
				return ( false );
			}
		} else {
			return ( false );
		}
	}
	
	function getElementByAttr( XMLNode , searchId , atName ){ 
		if ( !XMLNode || ! XMLNode.hasChildNodes() ){
			return ( null );
		}
		var ans = XMLNode.querySelector('['+atName+'="'+searchId+'"]');
		return ( ans );
	}
	
	return{
		init:init,
		setCenter:setCenter,
		buildSvgMapFrame:buildSvgMapFrame,
		changeMap:changeMap,
		observeMutation:observeMutation,
		addLayer:addLayer,
		get svgMapWindow(){
			return ( svgMapWindow );
		},
		get svgMapObject(){
			return ( svgMapObj );
		},
	}
};


// custom elementsでSVGMapを埋め込めるようにしてみようか
// https://developer.mozilla.org/ja/docs/Web/Web_Components/Using_custom_elements
// https://www.html5rocks.com/ja/tutorials/webcomponents/customelements/ (これv0だった・・・)
// https://developers.google.com/web/fundamentals/web-components/customelements?hl=ja
// https://sbfl.net/blog/2016/09/01/custom-elements-v1/

// https://stackoverflow.com/questions/43005507/child-elements-in-webcomponent
// https://developers.google.com/web/fundamentals/web-components/examples/howto-tabs

class svgMapElement extends HTMLElement {
	constructor() { // HTMLElement組み込み関数の定義
		super();
//		console.log("called constructor:",svgMapElement.observedAttributes);
		this._smed = svgMapElementDriver();
		this._smed.init(this,svgMapElement.observedAttributes);
	}
	
	connectedCallback() { // HTMLElement組み込み関数の定義
		this._smed.buildSvgMapFrame();
		this._smed.observeMutation();
	}
	
	static get observedAttributes() { // HTMLElement組み込み関数の定義 - attributeChangedCallbackを呼び出すものリスト
//		console.log("called observedAttributes : ");
		return (["latitude", "longitude", "zoom", "width", "height", "latitude2", "longitude2", "svgmapapppage", "customjson"]);
	}
	
	attributeChangedCallback(attrName, oldVal, newVal) { // HTMLElement組み込み関数の定義
		if ( oldVal== newVal){
			return;
		}
//		console.log("attributeChangedCallback:",ta);
		this._smed.changeMap();
	}
	
	setCenter( longitude, latitude, zoom ){
		this._smed.setCenter( longitude, latitude, zoom );
	}
	
	addLayer(url,title,visibility){
		this._smed.addLayer(url,title,visibility);
	}
	
	get svgMapObject(){
		return(this._smed.svgMapObject);
	}
	/**
	set center(centerObj){
	}
	**/
	
}

customElements.define('svg-map', svgMapElement);

//// ここまではフレームワーク

