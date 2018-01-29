// 
// Description:
// SVGMap Standard LayerUI1 for SVGMapLv0.1 >rev12
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
// 2016/10/11 : LayerUI1 Rev.1 SVGMapLvl0.1_r11の本体から切り離したUIをRev12用にそのまま移植
// 2016/10/28 : Rev.2 フレームワーク化 svgMapLayerUI
//

( function ( window , undefined ) { 
var document = window.document;
var navigator = window.navigator;
var location = window.location;


var svgMapLayerUI = ( function(){ 



var layerUI; // layerセレクト用のSelect要素
var layerUImulti=false; // 同UIがmultiかどうか
var editLayerTitle = ""; // 編集対象のレイヤーのtitle属性（もしくは


// レイヤーのID,title,番号のいずれかでレイヤーの表示状態をトグルする
// その結果は、ルートコンテナSVGのvisibilityと、対応するsvgImegsPropsのeditingフラグに反映する
// バッチグループが指定される場合もある
function toggleLayer( layerID_Numb_Title  ){
	if (! layerID_Numb_Title ){ return };
//	console.log("call toggleLayer:",layerID_Numb_Title);
	var layer = svgMap.getLayer( layerID_Numb_Title );
	if ( layer ){
		var layerId = layer.getAttribute("iid");
		var layersProps = svgMap.getRootLayersProps();
		var lProps = layersProps[layerId];
		if ( typeof poiEdit == "function" && (lProps.editable && lProps.visible ) ){ 
			//編集可能レイヤで表示中(非表示じゃない)
			if ( lProps.editing ){
				//編集中の場合は、非編集にし、非表示にする。
				svgMap.setRootLayersProps(layerId, false , false );
			} else {
				//非編集中の場合は、表示中のまま編集中にする。同時に他の編集中レイヤを非編集にする。(これはsetRootLayersProps側でケアしている)
				svgMap.setRootLayersProps(layerId, true , true );
			}
		} else if ( lProps.visible ){ // 表示中は非表示に変更
			svgMap.setRootLayersProps(layerId, false , false );
		} else { // 非表示中は、表示に変更
			svgMap.setRootLayersProps(layerId, true , false );
		}
	} else { // layerでなくバッチグループの場合
//		console.log("this ID might be a batch gruop. :"+ layerID_Numb_Title);
		var bac = layerID_Numb_Title.split(" ");
		var batchLayers = svgMap.getSwLayers( "batch" ); 
		
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
	}
	svgMap.refreshScreen();
}



var currLayerUIStat= new Array(); // select要素の全ての選択状態(バッチレイヤーの選択ボタン含め)を保管する配列。バッチグループ全選択状態(バッチレイヤ群が全選択されていたばあいにtrue)

// レイヤーUI(select要素)に現在設定値を設定する
function setLayerUI(target){
	var uap = svgMap.getUaProp();
//	console.log("uaProp:",uap);
	var currentLayersProps = svgMap.getRootLayersProps();
	
//	console.log( currentLayersProps );
	
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
		
//		var batchLayers = getSwLayers( "batch" ); // バッチカテゴリのレイヤーを得る
//		var allLayers = getSwLayers(  );
		
		
		
//		console.log("found Layer:" + layerUI);
//		var layers = getLayers();
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
		for ( var i = currentLayersProps.length - 1  ; i >= 0 ; i-- ){
			var sel = false;
			var layerGroupName = currentLayersProps[i].groupName;
			
			if ( layerGroupName ){
				// バッチ||スイッチ||何でもない レイヤー グループに属しているレイヤーの場合
//				console.log("found batch:",currentLayersProps[i].groupFeature);
//				console.log("name:",layerGroupName);
				if ( !layerGroup[layerGroupName]  ){ // UIにまだ該当レイヤーグループがない場合
				
					layerGroup[layerGroupName] = new Object();
					layerGroup[layerGroupName].optgroup=document.createElement("optgroup");
					layerGroup[layerGroupName].optgroup.label = layerGroupName;
//					layerGroup[layerGroupName].optgroup.label = "";
					layerUI.appendChild(layerGroup[layerGroupName].optgroup);
					
					if (currentLayersProps[i].groupFeature == "batch"){
						// バッチレイヤーの場合の処理
						// バッチレイヤーの"全選択*"項目を記載する
						// この項目のvalueは batch + グループ名とする
						var opt = document.createElement("option");
						layerGroup[layerGroupName].optgroup.appendChild(opt);
						opt.value = "batch " +layerGroupName;
//						opt.innerHTML = layerGroupName + "/ *";
						opt.innerHTML = "[ALL]";
	//					layerUI.appendChild(opt);
						
						var blStyle ="color:#2020FF";
						sel = true;
						var batchLayers = svgMap.getSwLayers( "batch" ); 
						for ( var ii = 0 ; ii < batchLayers[layerGroupName].length ; ii++){
							if ( (batchLayers[layerGroupName])[ii].getAttribute("visibility" ) == "hidden"){
								blStyle ="color:#A0A0FF";
								sel = false;
								break;
							}
						}
						if (!uap.isIE || !layerUImulti ){ // IEでmultipleの場合とにかくバグがひどい
							opt.setAttribute("style" , blStyle);
						}
						if ( sel ){
							opt.selected = true;
						} else {
							opt.selected = false;
						}
						currLayerUIStat[lcount] = sel;
						++lcount; // バッチ項目UI分だけcurrLayerUIStatの項目が増える・・
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
			optText += currentLayersProps[i].title;
			
			var style = "color:#000000";
			
			if ( ! currentLayersProps[i].visible ){
				style = "color:#c0c0FF";
				if ( uap.isSP ){ // スマホの一部ではselectが別描画になり、スタイルが効かないので・・
					optText = "X: " + optText;
				}
			} else {
				sel = true;
				style = "color:#000000";
				if ( uap.isSP ){
					optText = "O: " + optText;
				}
			}
			
//			console.log("isEditing?"+currentLayersProps[i].editing);
//			console.log("isEditable?"+currentLayersProps[i].editable);
			if ( typeof poiEdit == "function" ){
				if ( currentLayersProps[i].editing ){
					optText += " - [[EDITING!]]";
				} else if ( currentLayersProps[i].editable ){
					optText += " - editable";
				}
			}
			
			var opt = document.createElement("option");
			optTarget.appendChild(opt);
			opt.innerHTML = optText;
			
			if (!uap.isIE || !layerUImulti ){ // IEでmultipleの場合とにかくバグがひどい 2014.09.04
				opt.setAttribute("style" , style);
			}
			opt.value = currentLayersProps[i].id;
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
		if ( uap.isIE ){
//			layerUI.blur(); // IEでmultipleの場合要素を変化させるととまる　なんかこれで直るらしい?
			// http://www.experts-exchange.com/Software/Internet_Email/Web_Browsers/Q_28136890.html
			// 最初の項目は直んないなぁ・・
		}
		**/
	}
}

//console.log("registLayerUi");
svgMap.registLayerUiSetter( setLayerUI );

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
	} else {
		console.log("changedCount >1 ...... ");
	}
	setLayerUI();
}

return { // svgMapLayerUI. で公開する関数のリスト
	layerControl : layerControl
}

})();

window.svgMapLayerUI = svgMapLayerUI;


})( window );

