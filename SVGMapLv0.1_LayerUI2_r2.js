// 
// Description:
// SVGMap Standard LayerUI2 for SVGMapLv0.1 >rev12
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
// 2016/10/14 : svgMapLayerUI2 Rev.1 : SVGMapLvl0.1_r12の新機能を実装する全く新しいUIを再構築開始 まだ全然粗削りです。
// 2016/10/14 : JQueryUI/multiselectを切り離してスクラッチで構築
// 2016/10/14 : グループで折りたたむ機能、リストを広げたまま他の作業が行える機能
// 2016/10/14 : レイヤー固有のGUIを提供するフレームワーク data-controller 属性で、レイヤー固有UIのリンクを記載(html||bitImage)
// 2016/10/17 : レイヤー固有UI(iframe)に、zoomPanMap イベントを配信
// 2016/10/28 : Rev.2: classをいろいろ付けた。フレームワーク化
// 2016/11/15 : レイヤリスト、レイヤ固有UIともに、内容のサイズに応じて縦長さを可変に（まだ不完全かも）
// 2016/11/15 : レイヤリストのグループに配下で表示しているレイヤの個数を表示
// 2016/12/?  : GIS Tools Support
// 2016/12/19 : Authoring Tools Support
// 2017/01/27 : レイヤ固有UIのリサイズメカニズムを拡張。 data-controllerに、#requiredHeight=hhh&requiredWidth=www　を入れるとできるだけそれを提供する
//
// ISSUES:
//  レイヤが消えているのにレイヤ特化UIが残っているのはまずい


( function ( window , undefined ) { 
var document = window.document;
var navigator = window.navigator;
var location = window.location;


var svgMapLayerUI = ( function(){ 


var layerList, uiOpen , layerTableDiv , uiOpened , layerGroupStatus ; // layerGroupStatusは今はグループ折り畳み状態のみ管理
var layerSpecificUI; // layerSpecificUIの要素
function layerListOpenClose(){
	uiOpenBtn = document.getElementById("layerListOpenButton");
	layerTableDiv = document.getElementById("layerTableDiv");
	if ( layerList.style.height== layerListFoldedHeight + "px" ){ // layer list is colsed
		updateLayerTable();
		layerList.style.height=layerListMaxHeightStyle;
		uiOpenBtn.value="^";
		layerTableDiv.style.display="";
		uiOpened = true;
	} else { // opened
		layerList.style.height= layerListFoldedHeight + "px";
		uiOpenBtn.value="v";
		layerTableDiv.style.display="none";
		uiOpened = false;
	}
}

function getGroupFoldingStatus( groupName ){ // グループ折り畳み状況回答
	var gfolded;
	if ( layerGroupStatus[groupName] ){ // グループ折り畳み状態を得る[デフォルトはopen]
		gfolded = layerGroupStatus[groupName];
	} else {
		gfolded = false;
		layerGroupStatus[groupName] = gfolded;
	}
	return ( gfolded );
}

function updateLayerTable(){
	var tb = document.getElementById("layerTable");
	removeAllLayerItems(tb);
	setLayerTable(tb);
}

function setLayerTable(tb){
//	console.log("call setLayerTable:",tb);
	var groups = new Object(); // ハッシュ名のグループの最後のtr項目を収めている
	var lps = svgMap.getRootLayersProps();
//	console.log(lps);
	var visibleLayers=0;
	for ( var i = lps.length -1 ; i >=0  ; i-- ){
		var tr = getLayerTR(lps[i].title, lps[i].id, lps[i].visible , false , lps[i].groupName);
		if (lps[i].groupName ){ 
			// グループがある場合の処理
			
			var gfolded = getGroupFoldingStatus( lps[i].groupName ); // グループ折り畳み状況獲得
			
			if ( groups[lps[i].groupName] ){ // すでにグループが記載されている場合
				//そのグループの最後の項目として追加
				var lastGroupMember = groups[lps[i].groupName];
				if ( ! gfolded ){
					tb.insertBefore(tr, lastGroupMember.nextSibling);
				}
				groups[lps[i].groupName] = tr;
			} else {
				// 新しくグループ用trを生成・項目追加
				var groupTr =  getGroupTR(lps[i], gfolded);
				tb.appendChild(groupTr);
				// その後にレイヤー項目を追加
				groups[lps[i].groupName] = tr;
				if ( ! gfolded ){
					tb.appendChild(tr);
				}
			}
			if (lps[i].visible){
				incrementGcountLabel(lps[i].groupName);
			}
		} else { // グループに属さない場合、単に項目追加
			tb.appendChild(tr);
		}
		if (lps[i].visible){++visibleLayers;}
	}
	document.getElementById("layerListmessage").innerHTML="Layer List: "+visibleLayers+" layers visible";
	checkLayerList();
	window.setTimeout(setLayerTableStep2,30);
}

function setLayerTableStep2(){
	var tableHeight = document.getElementById("layerTable").offsetHeight;
//	console.log(tableHeight, layerListMaxHeight , layerListFoldedHeight , layerListMaxHeightStyle );
	if ( tableHeight < layerListMaxHeight - layerListFoldedHeight - 2 ){
		layerList.style.height = (tableHeight + layerListFoldedHeight + 2) + "px";
		console.log("reorder:",layerList.style.height);
	} else {
		layerList.style.height = layerListMaxHeightStyle;
//		layerListMaxHeight = layerList.offsetHeight;
	}
}


function incrementGcountLabel(groupName){
	var gcLabel = document.getElementById("gc_"+groupName);
	var gcTxtNode = gcLabel.childNodes.item(0);
	var gCount = Number( gcTxtNode.nodeValue ) + 1;
//	console.log(groupName,gcTxtNode,gcTxtNode.nodeValue,gCount);
	gcTxtNode.nodeValue = gCount;
}

function getLayerTR(title, id ,visible,hasLayerList,groupName){
	var tr = document.createElement("tr");
	tr.id ="layerList_"+id;
	if ( groupName ){
		tr.dataset.group =groupName;
		tr.className = "layerItem";
	} else {
		tr.className = "layerItem noGroup";
	}
	var cbid = "cb_"+id; // id for each layer's check box
	var btid = "bt_"+id; // id for each button for layer specific UI
	var ck = "";
	
	// レイヤラベルおよびオンオフチェックボックス生成.
	// checkBox
	var lcbtd = document.createElement("td");
	var lcb = document.createElement("input");
	lcb.className = "layerCheck";
	lcb.type="checkBox";
	lcb.id=cbid;
	if ( visible ){
		lcb.checked=true;
		tr.style.fontWeight="bold"; // bold style for All TR elem.
	}
	lcb.addEventListener("change",toggleLayer);
	lcbtd.appendChild(lcb);
	tr.appendChild(lcbtd);
	// label
	var labeltd = document.createElement("td");
	labeltd.setAttribute("colspan","3");
	labeltd.style.overflow="hidden";
	var label = document.createElement("label");
	label.title=title;
	label.setAttribute("for",cbid);
	label.className="layerLabel";
	label.innerHTML=title;
	labeltd.appendChild(label);
	tr.appendChild(labeltd);
	
	// レイヤ固有UIのボタン生成
	var td = document.createElement("td");
	var btn = document.createElement("input");
	btn.type="button";
	btn.className="layerUiButton";
	btn.id = btid;
	btn.value=">";
//	btn.setAttribute("onClick","svgMapLayerUI.showLayerSpecificUI(event)");
	btn.addEventListener("click", showLayerSpecificUI, false);
	if ( visible ){
		btn.disabled=false;
	} else {
		btn.disabled=true;
	}
	if ( !hasLayerList){
		btn.style.visibility="hidden";
	}
	
	td.appendChild(btn);
	tr.appendChild(td);
	
	
	return ( tr );
}



function checkLayerList(count){
	// レイヤーの読み込み完了まで　レイヤーリストのチェックを行い、レイヤ固有UIを設置する
	if ( !count ){count=1}
	var layerProps=svgMap.getRootLayersProps();
	var hasUnloadedLayers = false;
	for ( var i = 0 ; i < layerProps.length ; i++ ){
		if ( layerProps[i].visible ){
			if ( !layerProps[i].svgImageProps ){
				hasUnloadedLayers = true;
			} else {
				var ctbtn = document.getElementById("bt_"+layerProps[i].id);
				setTimeout(checkController,50,layerProps[i].svgImageProps, ctbtn); // 時々失敗するので50msec待って実行してみる・・ 2016.11.17
			}
		}
	}
//	console.log( "hasUnloadedLayers:",hasUnloadedLayers,count);
	if ( hasUnloadedLayers && count < 100){ // 念のためリミッターをかけておく
		setTimeout(checkLayerList,200,count+1);
	}
}

function checkController(svgImageProps, ctbtn){
	if ( svgImageProps.controller ){
		
		if ( ctbtn ){ // グループが閉じられている場合にはボタンがないので
			ctbtn.style.visibility="visible";
			ctbtn.dataset.url =svgImageProps.controller ;
		}
	}
}


function getGroupTR(lp, gfolded){ // グループ項目を生成する
	
	var groupTr = document.createElement("tr");
	groupTr.dataset.group = lp.groupName;
	groupTr.className="groupItem"
	groupTr.style.width="100%";
	groupTr.id = "gtr_"+lp.groupName;
	var isBatchGroup = false;
	
	// グループのラベル
	var groupTD = document.createElement("td");
	groupTD.style.fontWeight="bold";
	groupTD.setAttribute("colspan","3");
	groupTD.className = "groupLabel";
	groupTD.style.overflow="hidden";
	
	var groupTDlabel = document.createElement("label");
	groupTDlabel.title=lp.groupName;
	var gbid = "gb_"+lp.groupName; // for fold checkbox
	groupTDlabel.setAttribute("for", gbid);
	
	var gLabel = document.createTextNode("[" + lp.groupName + "]");
	groupTDlabel.appendChild(gLabel);
	groupTD.appendChild(groupTDlabel);
	
	// グループの所属メンバー数
	var groupCountTD = document.createElement("td");
	groupCountTD.className = "groupLabel";
//	groupCountTD.style.overflow="hidden";
	groupCountTD.align="right";
	
	var groupCountlabel = document.createElement("label");
	groupCountlabel.id = "gc_"+lp.groupName;

	groupCountlabel.setAttribute("for", gbid);
	
	var gCount = document.createTextNode("0");
	groupCountlabel.appendChild(gCount);
	groupCountTD.appendChild(groupCountlabel);
	
	
	// バッチチェックボックス
	var bid="";
	if ( lp.groupFeature == "batch"){
		groupTD.setAttribute("colspan","2");
		var batchCheckBoxTd = document.createElement("td");
		
		isBatchGroup = true;
		bid="ba_"+lp.groupName;
		
		var batchCheckBox = document.createElement("input");
		batchCheckBox.type="checkBox";
		batchCheckBox.id=bid;
		batchCheckBox.addEventListener("change",toggleBatch,false);
		
		batchCheckBoxTd.appendChild(batchCheckBox);
		
//		groupTD.appendChild(batchCheckBox);
		if ( lp.visible ){
			batchCheckBox.checked="true";
		}
		groupTr.appendChild(groupTD);
		groupTr.appendChild(groupCountTD);
		groupTr.appendChild(batchCheckBoxTd);
		
	} else {
		groupTr.appendChild(groupTD);
		groupTr.appendChild(groupCountTD);
	}
	
	// group fold button
	var foldTd = document.createElement("td");
	var foldButton = document.createElement("input");
	foldButton.id = gbid;
	foldButton.type="button";
	foldButton.addEventListener("click",toggleGroupFold,false);
	if ( ! gfolded ){
		foldButton.value = "^";
	} else {
		foldButton.value = "v";
	}
	foldTd.appendChild(foldButton);
	groupTr.appendChild(foldTd);
	
	return ( groupTr );
}


function removeAllLayerItems(tb){
	for ( var i = tb.childNodes.length-1;i>=0;i--){
		tb.removeChild(tb.childNodes[i]);
	}
	tb.appendChild(getColgroup());
}

function toggleLayer(e){
	var lid = (e.target.id).substring(3);
//	console.log("call toggle Layer",e.target.id,e.target.checked,lid);
	svgMap.setRootLayersProps(lid, e.target.checked , false );
	
	// 後でアイテム消さないように効率化する・・ (refreshLayerTable..)
	updateLayerTable();
	svgMap.refreshScreen();
}

function toggleBatch(e){
	var lid = (e.target.id).substring(3);
//	console.log("call toggle Batch",e.target.id,e.target.checked,lid);
	var batchLayers = svgMap.getSwLayers( "batch" ); 
//	console.log("this ID might be a batch gruop. :"+ lid,batchLayers);
	
//	svgMap.setRootLayersProps(lid, e.target.checked , false );
	
	// ひとつでもhiddenのレイヤーがあれば全部visibleにする
	var bVisibility = "hidden";
	for ( var i = 0 ; i < batchLayers[lid].length ; i++){
		if ( (batchLayers[lid])[i].getAttribute("visibility" ) == "hidden"){
			bVisibility = "visible";
			break;
		}
	}
	for ( var i = 0 ; i < batchLayers[lid].length ; i++){
		(batchLayers[lid])[i].setAttribute("visibility" , bVisibility);
	}
	
	// 後でアイテム消さないように効率化する・・ (refreshLayerTable..)
	updateLayerTable();
	svgMap.refreshScreen();
}

function MouseWheelListenerFunc(e){
	//レイヤリストのホイールスクロールでは地図の伸縮を抑制する
//	e.preventDefault();
	e.stopPropagation();
}

var layerListMaxHeightStyle, layerListMaxHeight, layerListFoldedHeight , layerSpecificUiDefaultStyle = {} , layerSpecificUiMaxHeight = 0;
	
function initLayerList(){
	layerGroupStatus = new Object();
	layerList = document.getElementById("layerList");
//	console.log("ADD EVT");
	layerList.addEventListener("mousewheel" , MouseWheelListenerFunc, false);
	layerList.addEventListener("DOMMouseScroll" , MouseWheelListenerFunc, false);
	layerList.style.zIndex="20";
	layerListMaxHeightStyle = layerList.style.height;
	layerSpecificUI = document.getElementById("layerSpecificUI");
	var lps = svgMap.getRootLayersProps();
	var visibleLayers=0;
	for ( var i = lps.length -1 ; i >=0  ; i-- ){
		if (lps[i].visible){++visibleLayers;}
	}
	
	var llUItop = document.createElement("div");
	
	var llUIlabel = document.createElement("label");
	llUIlabel.id="layerListmessage";
	llUIlabel.setAttribute("for","layerListOpenButton");
//	layerList.appendChild(llUIlabel);
	llUItop.appendChild(llUIlabel);
	
	var llUIbutton = document.createElement("input");
	llUIbutton.id="layerListOpenButton";
	llUIbutton.type="button";
	llUIbutton.value="v";
	llUIbutton.style.position="absolute";
	llUIbutton.style.right="0px";
	llUIbutton.addEventListener("click",layerListOpenClose);
//	layerList.appendChild(llUIbutton);
	llUItop.appendChild(llUIbutton);
	
	layerList.appendChild(llUItop);
	
	
	
	var llUIdiv = document.createElement("div");
	llUIdiv.id="layerTableDiv";
	llUIdiv.style.width = "100%";
	llUIdiv.style.height = "100%";
	llUIdiv.style.overflowY = "scroll";
	llUIdiv.style.display = "none";
	
	layerList.appendChild(llUIdiv);
	
	var llUItable = document.createElement("table");
	llUItable.id="layerTable";
	llUItable.setAttribute("border" , "0");
	llUItable.style.width="100%";
	llUItable.style.tableLayout ="fixed";
	llUItable.style.whiteSpace ="nowrap";
	
	
	llUItable.appendChild(getColgroup());
	
	llUIdiv.appendChild(llUItable);
	
	llUIlabel.innerHTML="Layer List:  "+visibleLayers+" layers visible";
	
	initLayerSpecificUI();
	
	window.setTimeout(initLayerListStep2,30, llUItop);
}

function initLayerListStep2(llUItop){ // レイヤリストのレイアウト待ち後サイズを決める　もうちょっとスマートな方法ないのかな・・
	layerListFoldedHeight = llUItop.offsetHeight;
	
	if ( layerList.offsetHeight < 60 ){
		layerListMaxHeightStyle = "90%";
	}
	
	layerListMaxHeight = layerList.offsetHeight;
	
//	console.log("LL dim:",layerListMaxHeightStyle,layerListFoldedHeight);
	
	layerList.style.height = layerListFoldedHeight + "px";
	
}


function getColgroup(){
	var llUIcolgroup = document.createElement("colgroup");
	
	var llUIcol1 = document.createElement("col");
	llUIcol1.setAttribute("spanr" , "1");
	llUIcol1.style.width ="25px";
	var llUIcol2 = document.createElement("col");
	llUIcol2.setAttribute("spanr" , "1");
	var llUIcol3 = document.createElement("col");
	llUIcol3.setAttribute("spanr" , "1");
	llUIcol3.style.width ="25px";
	var llUIcol4 = document.createElement("col");
	llUIcol4.setAttribute("spanr" , "1");
	llUIcol4.style.width ="25px";
	var llUIcol5 = document.createElement("col");
	llUIcol5.setAttribute("spanr" , "1");
	llUIcol5.style.width ="30px";
	
	llUIcolgroup.appendChild(llUIcol1);
	llUIcolgroup.appendChild(llUIcol2);
	llUIcolgroup.appendChild(llUIcol3);
	llUIcolgroup.appendChild(llUIcol4);
	llUIcolgroup.appendChild(llUIcol5);
	
	return ( llUIcolgroup );
}

function initLayerSpecificUI(){
	layerSpecificUiDefaultStyle.height = layerSpecificUI.style.height;
	layerSpecificUiDefaultStyle.width = layerSpecificUI.style.height;
	layerSpecificUiDefaultStyle.top = layerSpecificUI.style.top;
	layerSpecificUiDefaultStyle.left = layerSpecificUI.style.left;
	layerSpecificUiDefaultStyle.right = layerSpecificUI.style.right;
	console.log("initLayerSpecificUI:",layerSpecificUI.style ,layerSpecificUI);
	console.log("layerSpecificUiDefaultStyle:",layerSpecificUiDefaultStyle);
	layerSpecificUI.style.zIndex="20";
	lsUIbdy = document.createElement("div");
	lsUIbdy.id = "layerSpecificUIbody";
	lsUIbdy.style.width="100%";
	lsUIbdy.style.height="100%";
//	lsUIbdy.style.overflowY="scroll";
	layerSpecificUI.appendChild(lsUIbdy);
	
	lsUIbtn = document.createElement("input");
	lsUIbtn.type="button";
	lsUIbtn.value="x";
	lsUIbtn.style.position="absolute";
	lsUIbtn.style.right="0px";
	lsUIbtn.style.top="0px";
	layerSpecificUI.appendChild(lsUIbtn);
	lsUIbtn.addEventListener("click",layerSpecificUIhide,false);
}

svgMap.registLayerUiSetter( initLayerList , updateLayerTable);

function toggleGroupFold( e ){
	var lid = (e.target.id).substring(3);
//	console.log("call toggle Group Hidden",e.target.id,e.target.checked,lid);
	if ( layerGroupStatus[lid] ){
		layerGroupStatus[lid] = false;
	} else {
		layerGroupStatus[lid] = true;
	}
	updateLayerTable();
}

//window.addEventListener( 'load', function(){
//	console.log("call initLayerList");
//	initLayerList();
//}, false );

// TEST 2016.10.17
//window.addEventListener( 'zoomPanMap', function(){
//	console.log("CATCH ZOOM PAN MAP EVENT ON MAIN WINDOW");
//},false);

// 同じレイヤーUI(iframeのみ)が開かれているかどうか検証
function isAlreadyCreated(id,e){
	if ( document.getElementById("layerSpecificUIframe") ){
		var iframe = document.getElementById("layerSpecificUIframe");
		var lid=(e.target.id).substring(3);
		console.log("evt:",lid,"  iframe:",iframe.contentWindow.layerID);
		if ( iframe.contentWindow && iframe.contentWindow.layerID==lid ){
			return ( true );
		} else {
			return ( false );
		}
	} else {
		return ( false );
	}
}

function getHash(url){
	if ( url.indexOf("#")>0){
		var lhash = url.substring(url.indexOf("#") +1 );
		if ( lhash.indexOf("?")>0){
			lhash = lhash.substring(0,lhash.indexOf("?"));
		}
		lhash = lhash.split("&");
		for ( var i = 0 ; i < lhash.length ; i++ ){
			lhash[i] = lhash[i].split("="); //"
			lhash[lhash[i][0]]=lhash[i][1];
		}
		return ( lhash );
	} else {
		return ( null );
	}
}

function showLayerSpecificUI(e){
	var lid=(e.target.id).substring(3);
//	var lprops = svgMap.getRootLayersProps();
//	var controllerURL = lprops[lid].svgImageProps.controller;
//	console.log(lprops[lid],controllerURL,e.target.dataset.url);
	var controllerURL = e.target.dataset.url;
//	console.log(controllerURL);
	
	var reqSize = {height:-1,width:-1};
	var lhash = getHash(controllerURL);
	console.log("lhash:",lhash);
	if ( lhash ){
		if (lhash.requiredHeight ){
			reqSize.height = Number(lhash.requiredHeight);
		}
		if (lhash.requiredWidth ){
			reqSize.width = Number(lhash.requiredWidth);
		}
		
	}
	
	var layerSpecificUIbody = document.getElementById("layerSpecificUIbody");
	layerSpecificUI.style.display = "inline";
	
	if ( ! isAlreadyCreated(lid,e) ){
		console.log("isAlreadyCreated: false");
		if ( document.getElementById("layerSpecificUIframe") ){
			var iframe = document.getElementById("layerSpecificUIframe");
			dispatchCutomIframeEvent("closeFrame");
//			setTimeout( function(iframe){
//					iframe.src = "about:blank";
//			iframe.src = "";
//				} , 100 , iframe);
		}
		for ( var i = layerSpecificUIbody.childNodes.length-1;i>=0;i--){
			layerSpecificUIbody.removeChild(layerSpecificUIbody.childNodes[i]);
		}
		if ( controllerURL.indexOf(".png")>0 || controllerURL.indexOf(".jpg")>0 || controllerURL.indexOf(".jpeg")>0 || controllerURL.indexOf(".gif")>0){
			var img = document.createElement("img");
			img.src=controllerURL;
			img.setAttribute("width","100%");
			layerSpecificUIbody.appendChild(img);
		} else {
			initIframe(lid,controllerURL,svgMap,reqSize);
		}
	} else {
		console.log("isAlreadyCreated: true");
		dispatchCutomIframeEvent("appearFrame");
		testIframeSize( document.getElementById("layerSpecificUIframe"), reqSize);
	}
}

function dispatchCutomIframeEvent(evtName){
	// added 2016.12.21 オーサリングツール等でUIが閉じられたときにイベントを流す
	// 今のところ、openFrame(新たに生成), closeFrame(消滅), appearFrame(隠されていたのが再度現れた), hideFrame(隠された) の４種で利用
	if ( document.getElementById("layerSpecificUIframe") ){
		var ifr = document.getElementById("layerSpecificUIframe");
		var customEvent = ifr.contentWindow.document.createEvent("HTMLEvents");
		customEvent.initEvent(evtName, true , false );
		ifr.contentWindow.document.dispatchEvent(customEvent);
		
		// 本体のウィンドにも同じイベントを配信する。
		var ce2 = document.createEvent("HTMLEvents");
		ce2.initEvent(evtName, true , false );
		document.dispatchEvent(ce2);
		
	}
}

function initIframe(lid,controllerURL,svgMap,reqSize){
	var iframe = document.createElement("iframe");
	iframe.id = "layerSpecificUIframe";
	iframe.src=controllerURL;
	iframe.setAttribute("frameborder","0");
	iframe.style.width="100%";
	iframe.style.height="100%";
	var layerSpecificUIbody = document.getElementById("layerSpecificUIbody");
	console.log("layerSpecificUIbody Style:",layerSpecificUIbody.style);
	layerSpecificUIbody.appendChild(iframe);
	iframe.onload=function(){
		dispatchCutomIframeEvent("openFrame");
		if ( layerSpecificUiMaxHeight == 0 ){
			layerSpecificUiMaxHeight = layerSpecificUI.offsetHeight
		}
		iframe.contentWindow.layerID=lid;
		iframe.contentWindow.svgMap = svgMap;
		if ( svgMapGIStool ){
			console.log("add svgMapGIStool to iframe");
			iframe.contentWindow.svgMapGIStool = svgMapGIStool;
		}
		if ( svgMapAuthoringTool ){ // added 2016.12.19 AuthoringTools
			console.log("add svgMapAuthoringTool to iframe");
			iframe.contentWindow.svgMapAuthoringTool = svgMapAuthoringTool;
		}
		
		iframe.contentWindow.svgImageProps = (svgMap.getSvgImagesProps())[lid];
		iframe.contentWindow.svgImage = (svgMap.getSvgImages())[lid];
//		iframe.contentWindow.testIframe("hellow from parent");
		document.removeEventListener("zoomPanMap", transferCustomEvent2iframe, false);
		document.addEventListener("zoomPanMap", transferCustomEvent2iframe , false);
		setTimeout( testIframeSize , 1000 , iframe ,reqSize);
	}
}

function pxNumb( pxval ){
	if ( pxval && pxval.indexOf("px")>0){
		return ( Number(pxval.substring(0,pxval.indexOf("px") ) ));
	} else {
		return ( 0 );
	}
}
	
function testIframeSize( iframe ,reqSize){
	console.log("H:",iframe.contentWindow.document.documentElement.scrollHeight );
	console.log("H2:",iframe.contentWindow.document.body.offsetHeight , layerSpecificUI.offsetHeight);
	var maxHeight = window.innerHeight - pxNumb(layerSpecificUiDefaultStyle.top) - 50;
	var maxWidth = window.innerWidth - pxNumb(layerSpecificUiDefaultStyle.left) - pxNumb(layerSpecificUiDefaultStyle.right) - 50;
	console.log("reqSize:",reqSize, " window:",window.innerWidth,window.innerHeight, "  available w/h",maxWidth,maxHeight) - 50;
	
	if ( reqSize.width>0 ){ // 強制サイジング
		if ( reqSize.width < maxWidth ){
			layerSpecificUI.style.width = reqSize.width+"px";
		} else {
			layerSpecificUI.style.width = maxWidth + "px";
		}
	} else {
		// set by default css　横幅は命じない場合常にcss設定値
		layerSpecificUI.style.width = layerSpecificUiDefaultStyle.width;
	}
	
	if ( reqSize.height > 0 ){ // 強制サイジング
		if ( reqSize.height < maxHeight ){
			layerSpecificUI.style.height = reqSize.height+"px";
		} else {
			layerSpecificUI.style.height = maxHeight+"px";
		}
	} else { // 自動サイジング 最大値はcss設定値
		if ( iframe.contentWindow.document.body.offsetHeight < layerSpecificUiMaxHeight ){
			layerSpecificUI.style.height = (50 + iframe.contentWindow.document.body.offsetHeight) + "px";
		} else {
			layerSpecificUI.style.height = layerSpecificUiDefaultStyle.height;
		}
	}
}

function transferCustomEvent2iframe(){
//	console.log("get zoomPanMap event from root doc");
	// レイヤー固有UIがある場合のみイベントを転送する
	if ( document.getElementById("layerSpecificUIframe") ){
		var ifr = document.getElementById("layerSpecificUIframe");
		var customEvent = ifr.contentWindow.document.createEvent("HTMLEvents");
		customEvent.initEvent("zoomPanMap", true , false );
		ifr.contentWindow.document.dispatchEvent(customEvent);
	} else {
		document.removeEventListener("zoomPanMap", transferCustomEvent2iframe, false);
	}
}


function layerSpecificUIhide(){
	dispatchCutomIframeEvent("hideFrame");
	layerSpecificUI.style.display = "none";
	layerSpecificUI.style.height = layerSpecificUiDefaultStyle.height;
}


return { // svgMapLayerUI. で公開する関数のリスト
	layerSpecificUIhide : layerSpecificUIhide
}

})();

window.svgMapLayerUI = svgMapLayerUI;


})( window );

