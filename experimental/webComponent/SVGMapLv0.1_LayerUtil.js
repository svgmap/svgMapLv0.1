// 
// Description:
// SVGMap Layer Utility for SVGMapLv0.1 >rev16
// Programmed by Satoru Takagi
//  
//  Copyright (C) 2020 by Satoru Takagi @ KDDI CORPORATION
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
// 2020/12/22 1st rev.
// 2021/01/08 remove layer

( function ( window , undefined ) { 
var document = window.document;
var navigator = window.navigator;
var location = window.location;


var svgMapLayerUtil = ( function(){ 
	// svgMap.getRootLayersProps, setRootLayersProps をもう少し使いやすくしてみる・・ 2020/12/22
	// 


function getLayersController(){
	// jsのArrayとは異なる、array的な使い方でレイヤーコントロールが可能なAPI
	
	var propHandler ={
		set(layerVal, prop, value) {
			console.log("propHandler SET:",layerVal, prop, value);
			if ( prop == "visible" ){
				console.log("Change visibility of: layerid:"+layerVal.id + " to " + value);
				if ( value === false || value === true ){
					// layerListUIのアップデートやrefreshScreenを考えて、こちらのAPIを使う
					// 表示非表示のみを切り替える(Editable, Clickableが課題だが)
					svgMap.setLayerVisibility(layerVal.id, value); 
//					svgMap.setRootLayersProps(layerVal.id, value); // Editable, Clickableの制御はこれを事前に呼ぶことなど別途考えよう・・
				} else {
					console.error("visible value must be boolean");
				}
			} else {
				console.log("this prop is read only");
				return ( null );
			}
		},
		get(layerVal, prop){
			console.log("propHandler GET:",layerVal, prop);
			return ( layerVal[prop]);
		}
	}
	
	var handler ={
		set(target, prop, value) {
			console.log("set:",target,prop,value);
		},
		get(target, prop, receiver){
			console.log("get:",target,prop,receiver);
			layersObj=svgMap.getRootLayersProps();
			console.log("return:",layersObj[prop]);
			if ( prop == "add" ){
				console.log("add func is requested..");
				return function(layer){
					// レイヤー追加の処理を行う感じかな
					console.log("add layer:",layer,"   layersObj:",layersObj);
					var layerObj = parseLayerObj(layer);
					if ( layerObj ){
						addLayer(layerObj.url, layerObj.title, layerObj.class, layerObj.visibility);
					} else {
						console.error("No url or illegal index");
					}
				}
			} else if (prop=="insertBefore"){
				console.log("insertBefore func is requested..");
				return function(layer,index){
					// レイヤー追加の処理を行う感じかな
					// indexは、数字もしくはレイヤIDということにする
					console.log("insertBefore layer:",layer,"  index:",index,"  layersObj:",layersObj);
					var layerObj = parseLayerObj(layer);
					var ly = layersObj[index];
					var beforeId ;
					if ( ly ){
						beforeId = layersObj[index].id; // ここで明確なLayerIDをキーにする
					} else {
						beforeId = searchIdFromLayerTitle(index,layersObj);
					}
					
					if ( layerObj && beforeId ){
						addLayer(layerObj.url, layerObj.title, layerObj.class, layerObj.visibility, beforeId);
					} else {
						console.error("No url or illegal index");
					}
				}
			} else if (prop=="remove"){
				console.log("remove func is requested..");
				return function(layerKey){
					// レイヤー削除の処理を行う感じかな
					console.log("remove layer: layerKey:",layerKey);
					var layer;
					if ( isNaN(layerKey)){
						layer = svgMap.getLayerId(layerKey);
					} else {
						layer = layersObj[layerKey].id;
					}
					if ( layer ){
						var ans = removeLayer(layer);
						return ( ans );
					} else {
						console.error("layer:",layerKey," is not exist.");
						return ( false );
					}
					
				}
			} else {
				// console.log("set proxy:",layersObj[prop], typeof(layersObj[prop]));
				var layerVal=layersObj[prop];
				if ( layerVal instanceof Object){
//					layersObj[prop] = new Proxy({layerKey:prop,layerVal:layerVal},propHandler);
					layersObj[prop] = new Proxy(layerVal,propHandler);
					return layersObj[prop];
				} else {
					return ( layerVal);
				}
			}
		}
	}
	
	var layersObj=svgMap.getRootLayersProps();
	var layerPxyObj = new Proxy(layersObj, handler);
	return ( layerPxyObj );
	
}

function searchIdFromLayerTitle(index,layersObj){
	var ans = null;
	for ( var i = 0 ; i < layersObj.length ; i++ ){
		if ( layersObj[i].title == index ){
			ans = layersObj[i].id;
			break;
		}
	}
	return ( ans );
}

function parseLayerObj(layer){
	var url,title,lclass="",visibility;
	visibility = true;
	if (typeof(layer)=="string"){
		url = layer;
		title = url;
	} else if (typeof(layer)=="object" && layer.url ){
		url = layer.url;
		title = url;
		if ( layer.title ){
			title = layer.title;
		}
		
		if ( layer.class ){
			lclass = layer.class;
		}
		if ( layer.clickable && lclass.indexOf("clickable")<0) {
			lclass = " clickable"
		}
		if ( layer.editable && lclass.indexOf("editable")<0){
			lclass += " editable"
		}
		if ( layer.visibility === false ){
			visibility = false;
		}
	}
	if ( url && title ){
		return {
			url:url,
			title:title,
			class:lclass,
			visibility:visibility
		}
	} else {
		return ( null );
	}

}
	
function getLayersControllerR(){
	// jsのArrayをできるだけ完全にオーバーライドした形での実装だが、途中で行き詰まった感じがするのでスクラップ置き場に放置中・・
	// 配列のset getの監視という体で proxyを使う
	// 参考：https://qiita.com/SezaKun/items/e8a70f653cebe463ba3d
	// controllerObj[]
	
	var handler_arrMemberObj={
		//  target,   prop,value
		set(_clsdArrM, mn, value){
			// 配列のvalueがobjectだった場合の検知実装
			console.log('Setter called for key:'+mn+' val:'+value);
			_clsdArrM[mn]=value;
		},
		get(_clsdArrM, mn){
			console.log('Getter called for '+mn+' .');
			return _clsdArrM[mn];
		}
	}
	
	var handler_arr = {
		set(K, i, value){
			console.log('Setter called for ['+i+']');
			console.log(value);
			if ( typeof(value)=="object"){
				// 配列のvalueがobjectだった場合はそのメンバの値の変化を更に検知できるようにする
				_clsdArr[i] = new Proxy({},handler_arrMemberObj);
				console.log("set proxy for :",_clsdArr[i]," i:",i," value:",value);
				for ( var key in value)
					_clsdArr[i][key]=value[key];
			} else {
				_clsdArr[i] = value;
			}
			return true;
		},
		get (_clsdArr, i){
			//for...of ループ実行時のイテレータ関数の取得が getter に入ってくる。その際、
			//仮引数 i に Symbol(Symbol.iterator) が渡されるため、i の型が symbol であれば
			if(typeof i === 'symbol')
			//本物の配列 _clsdArr に備わっているイテレータ関数を取り出して返す
			return Object.getOwnPropertySymbols(_clsdArr)[i];
			console.log('Getter called for ['+i+']');
			return _clsdArr[i];
		},
	};
	var handler_rt = {
		set (_clsdPrx, propName, value){
			if(Array.isArray(value)){
				//今回は本物の配列をターゲットの引数に指定。( {} ---> [] )
				_clsdPrx[propName] = new Proxy([], handler_arr);
				for(let i in value)
				_clsdPrx[propName][i] = value[i];
			}else{
				//...otherwise
				//_clsdPrx[propName] = value;
			}
			return true;
		},
		get (_clsdPrx, propName){
			return _clsdPrx[propName];
		},
	};
	
	var layerPxyObj = new Proxy({}, handler_rt);
	
	layerPxyObj.layer=svgMap.getRootLayersProps();
	
	return layerPxyObj.layer;
}

function buildClassString(groupName, isClickable, isEditable){
	var ans ="";
	
	if ( groupName ){
		ans += groupName;
	}
	if ( isClickable ){
		ans += " clickable";
	}
	if ( isEditable ){
		ans += " editable";
	}
	
	return ( ans );
}

function addLayer(url,title,lclass,visibility,beforeElementIId){
	if ( ! url ){
		return;
	}
	var sis = svgMap.getSvgImages();
	var root = sis["root"]; // ルートコンテナのsvg doc
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
	if ( svgMap.getLayerId(title)){
		title=title + "_"+(new Date()).getTime();
	}
	bl.setAttribute("title",title);
	if ( beforeElementIId == -1 || beforeElementIId == null){
		root.documentElement.appendChild(bl);
	} else {
		var prevElem = getElementByAttr( root.documentElement , beforeElementIId , "iid" );
		if ( prevElem ){
			root.documentElement.insertBefore(bl,prevElem);
		} else {
			console.error("no before element iid:",beforeElementIId);
		}
	}
	svgMap.updateLayerListUI();
	svgMap.refreshScreen();
	return {
		title:title,
		url:url
	}
}

function removeLayer(layerID){
	var sis = svgMap.getSvgImages();
	var root = sis["root"]; // ルートコンテナのsvg doc
	var targetElem = getElementByAttr( root.documentElement , layerID , "iid" );
	if ( targetElem ){
		try{
			root.documentElement.removeChild(targetElem);
			svgMap.updateLayerListUI();
			svgMap.refreshScreen();
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



return { // svgMapLayerUtil. で公開する関数のリスト
	getLayersController:getLayersController,
	addLayer:addLayer,
	removeLayer:removeLayer,
}

})();

window.svgMapLayerUtil = svgMapLayerUtil;


})( window );

