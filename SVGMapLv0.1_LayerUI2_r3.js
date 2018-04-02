// 
// Description:
// SVGMap Standard LayerUI2 for SVGMapLv0.1 >rev12
// Programmed by Satoru Takagi
// 
//  Programmed by Satoru Takagi
//  
//  Copyright (C) 2016-2017 by Satoru Takagi @ KDDI CORPORATION
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
// 2017/02/17 : レイヤ固有UIのクローズボタン位置の微調整
// 2017/02/21 : svg文書のdata-controller-srcに直接レイヤ固有UIのhtmlを書ける機能を拡張。requiredWidth/Heightについてはdata-controllerに#から始まる記法で書くことで対応
// 2017/03/02 : Rev.3: レイヤーのOffに連動して、レイヤ固有UIのインスタンスが消滅する処理など、レイヤ固有UIのインスタンス管理に矛盾が生じないようにする。レイヤ固有UIインスタンスはレイヤーがvisibleである限り存続する(他のレイヤの固有UIが出現しても隠れるだけで消えない。消えるタイミングはレイヤがinvisibleになった時。またこの時はcloseFrameイベントが発行され、100ms後にインスタンスが消滅する。
// 2017/08/25 : 凡例（画像）表示時においてサイズ未指定の場合は元画像のサイズでフレームをリサイズする様追加
// 2017/09/08 : data-controllerに、#exec=appearOnLayerLoad,hiddenOnLayerLoad,onClick(default)
// 2018/04/02 : layerListmessage に選択レイヤ名称をtextで設定する処理を追加
//
// ISSUES, ToDo:
//	(FIXED?) IE,Edgeでdata-controller-src動作しない
//  レイヤ固有UIを別ウィンドウ化できる機能があったほうが良いかも
//   ただしこの機能は新たなcontextを生成する形でないと実装できないようです。
//   See also: http://stackoverflow.com/questions/8318264/how-to-move-an-iframe-in-the-dom-without-losing-its-state
//  (FIXED? 2017.9.8) レイヤUI表示ボタンが時々表示されない時がある (少なくとも一か所課題を発見し修正。本体も改修(getRootLayersProps))
//


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
	console.log("CALLED updateLayerTable");
	var tb = document.getElementById("layerTable");
	removeAllLayerItems(tb);
	setLayerTable(tb);
}

function setLayerTable(tb){
	console.log("call setLayerTable:",tb);
	var groups = new Object(); // ハッシュ名のグループの最後のtr項目を収めている
	var lps = svgMap.getRootLayersProps();
//	console.log(lps);
	var visibleLayers=0;
	var visibleLayersNameArray=[];
	const visibleNum=5;  // 表示レイヤ名称数
	for ( var i = lps.length -1 ; i >=0  ; i-- ){
		var tr = getLayerTR(lps[i].title, lps[i].id, lps[i].visible , false , lps[i].groupName);
		syncLayerSpecificUiExistence( lps[i].id, lps[i].visible );
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
		if (lps[i].visible){
			++visibleLayers;
			if ( visibleLayers <= visibleNum ){ visibleLayersNameArray.push(lps[i].title); }
			else if ( visibleLayers == visibleNum+1 ){ visibleLayersNameArray.push("..."); }
		}
	}
	document.getElementById("layerListmessage").innerHTML = layerListmessageHead + visibleLayers + layerListmessageFoot;
	document.getElementById("layerListmessage").title = visibleLayersNameArray;
	checkLayerList();
	window.setTimeout(setLayerTableStep2,30);
}

layerListmessageHead = "Layer List: ";
layerListmessageFoot = " layers visible";
	
function setLayerListmessage( head , foot ){ // added 2018.2.6
	layerListmessageHead = head;
	layerListmessageFoot = foot;
	/**
	if ( document.getElementById("layerListmessage")){
		document.getElementById("layerListmessage").innerHTML = layerListmessageHead + visibleLayers + layerListmessageFoot;
	}
	**/
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
//			console.log("chekc for layerui existence :  svgImageProps:",layerProps[i].svgImageProps , "   hasDocument:",layerProps[i].hasDocument);
			if ( layerProps[i].svgImageProps && layerProps[i].hasDocument ){ // svgImagePropsが設定されていたとしてもまだ読み込み完了していると保証できないと思うので、hasDocumentを併せて評価する 2017.9.8
//				var ctbtn = document.getElementById("bt_"+layerProps[i].id);
//				setTimeout(checkController,50,layerProps[i].svgImageProps, ctbtn); // 時々失敗するので50msec待って実行してみる・・ 2016.11.17　このTimeOutはもう不要と思う 2017.9.8
				checkController(layerProps[i].svgImageProps, layerProps[i].id, layerProps[i].id); // 上記より直接呼出しに戻してみる 2017.9.8
				
			} else {
				hasUnloadedLayers = true;
			}
		}
	}
//	console.log( "hasUnloadedLayers:",hasUnloadedLayers,count);
	if ( hasUnloadedLayers && count < 20){ // 念のためリミッターをかけておく
		setTimeout(checkLayerList,200,count+1);
	}
}

function checkController(svgImageProps, layerId){
	// レイヤ固有UIを実際に設置する
	// さらに、レイヤ固有UIのオートスタートなどの制御を加える 2017.9.8 - 9.22
	if ( svgImageProps.controller ){
//		console.log("checkController:",svgImageProps.controller);
		var ctrUrl;
		if ( svgImageProps.controller.indexOf("src:")==0 ){
			ctrUrl=":";
		} else if ( svgImageProps.controller.indexOf("hash:")==0 ){
			ctrUrl= ":"+svgImageProps.controller.substring(5,svgImageProps.controller.indexOf("src:")-1);
		} else {
			ctrUrl =svgImageProps.controller ;
		}
		var ctbtn = document.getElementById("bt_"+layerId);
		if ( ctbtn ){ // グループが閉じられている場合などにはボタンがないので
			ctbtn.style.visibility="visible";
			ctbtn.dataset.url = ctrUrl;
		}
//		console.log("checkController: ctbtn.dataset.url: ",ctbtn.dataset.url);
		
		// Added autostart function of layerUI 2017.9.8 (名称変更 9/22)
		// 対応するレイヤー固有UIframeがないときだけ、appearOnLayerLoad||hiddenOnLayerLoad処理が走る
		// #exec=appearOnLayerLoad,hiddenOnLayerLoad,onClick(default) 追加
		if ( !document.getElementById( getIframeId(layerId) ) ){
			var lhash = getHash(ctrUrl);
			if (lhash && lhash.exec){
				if ( lhash.exec=="appearOnLayerLoad" || lhash.exec=="hiddenOnLayerLoad" ){
					var psEvt = {
						target:{
							dataset:{
								url:ctrUrl
							},
							id: "bt_"+layerId
						}
					};
					if ( lhash.exec=="hiddenOnLayerLoad" ){
						psEvt.target.hiddenOnLaunch = true;
					}
					console.log("Find #exec=appearOnLayerLoad,hiddenOnLayerLoad Auto load LayerUI : pseudo Event:", psEvt);
					showLayerSpecificUI(psEvt); // showLayerSpecificUIを強制起動 ただしUIは非表示にしたいケースある(hiddenOnLayerLoad)
				}
			}
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

function getLayerId( layerEvent ){
	var lid = (layerEvent.target.id).substring(3);
	return ( lid );
}

function toggleLayer(e){
	var lid = getLayerId(e);
//	console.log("call toggle Layer",e.target.id,e.target.checked,lid);
	svgMap.setRootLayersProps(lid, e.target.checked , false );
	
	// 後でアイテム消さないように効率化する・・ (refreshLayerTable..)
	updateLayerTable();
	svgMap.refreshScreen();
}

function toggleBatch(e){
	var lid = getLayerId(e);
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
	console.log("CALLED initLayerList");
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
	var visibleLayersNameArray=[];
	const visibleNum=5;  // 表示レイヤ名称数
	for ( var i = lps.length -1 ; i >=0  ; i-- ){
		if (lps[i].visible){
			++visibleLayers;
			if ( visibleLayers <= visibleNum ){ visibleLayersNameArray.push(lps[i].title); }
			else if ( visibleLayers == visibleNum+1 ){ visibleLayersNameArray.push("..."); }
		}
	}
	
	var llUItop = document.createElement("div");
	
	var llUIlabel = document.createElement("label");
	llUIlabel.id="layerListmessage";
	llUIlabel.setAttribute("for","layerListOpenButton");
	llUIlabel.setAttribute("title", visibleLayersNameArray);
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
	
	llUIlabel.innerHTML = layerListmessageHead + visibleLayers + layerListmessageFoot;
	
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
	checkLayerList(); // 2017.9.8 この関数の先にあるcheckControllerで#loadTiming=layerLoad|uiAppear(default) を起動時処理する
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

var lsUIbdy, lsUIbtn;

function initLayerSpecificUI(){
	layerSpecificUiDefaultStyle.height = layerSpecificUI.style.height;
	layerSpecificUiDefaultStyle.width = layerSpecificUI.style.height;
	layerSpecificUiDefaultStyle.top = layerSpecificUI.style.top;
	layerSpecificUiDefaultStyle.left = layerSpecificUI.style.left;
	layerSpecificUiDefaultStyle.right = layerSpecificUI.style.right;
//	console.log("initLayerSpecificUI:",layerSpecificUI.style ,layerSpecificUI);
//	console.log("layerSpecificUiDefaultStyle:",layerSpecificUiDefaultStyle);
	layerSpecificUI.style.zIndex="20";
	lsUIbdy = document.createElement("div");
	lsUIbdy.id = "layerSpecificUIbody";
	lsUIbdy.style.overflow="auto"; // for iOS safari http://qiita.com/Shoesk/items/9f81ef1fd7b3a0b516b7
	lsUIbdy.style.webkitOverflowScrolling="touch"; // for iOS
	lsUIbdy.style.width="100%";
	lsUIbdy.style.height="100%";
//	lsUIbdy.style.overflowY="scroll";
	layerSpecificUI.appendChild(lsUIbdy);
//	console.log("lsUIbdy:",lsUIbdy);
	lsUIbtn = document.createElement("input");
	lsUIbtn.type="button";
	lsUIbtn.value="x";
	lsUIbtn.style.webkitTransform ="translateZ(10)";
	lsUIbtn.style.zIndex ="3";
	lsUIbtn.id="layerSpecificUIclose";
	lsUIbtn.style.position="absolute";
	lsUIbtn.style.right="0px";
	lsUIbtn.style.top="0px";
	layerSpecificUI.appendChild(lsUIbtn);
	lsUIbtn.addEventListener("click",layerSpecificUIhide,false);
}

svgMap.registLayerUiSetter( initLayerList , updateLayerTable);

function toggleGroupFold( e ){
	var lid = getLayerId(e);
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


// layerIdに対する同レイヤ固有UIのiframe要素のID
function getIframeId( layerId ){
	return ( "layerSpecificUIframe_" + layerId );
}


// URLに対してハッシュのオプションを整理して返す
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


// 表示中のレイヤ固有UI要素を返す
function getVisibleLayerSpecificUIid(){
	var layerSpecificUIbody = document.getElementById("layerSpecificUIbody");
	for ( var i = layerSpecificUIbody.childNodes.length-1;i>=0;i--){
		if ( layerSpecificUIbody.childNodes[i].style.display != "none" ){
			return ( layerSpecificUIbody.childNodes[i].id );
		}
	}
	return(null);
}


function showLayerSpecificUI(e){
//	console.log("showLayerSpecificUI: catch event ",e);
	var layerId = getLayerId(e);
//	var lprops = svgMap.getRootLayersProps();
//	var controllerURL = lprops[layerId].svgImageProps.controller;
//	console.log(lprops[layerId],controllerURL,e.target.dataset.url);
	var controllerURL = e.target.dataset.url;
	
	var loadButHide = false;
	if ( e.target.loadButHide ){
		loadButHide = true;
	}
	
//	console.log(controllerURL);
	
	var reqSize = {height:-1,width:-1};
	var lhash = getHash(controllerURL);
//	console.log("lhash:",lhash);
	if ( lhash ){
		if (lhash.requiredHeight ){
			reqSize.height = Number(lhash.requiredHeight);
		}
		if (lhash.requiredWidth ){
			reqSize.width = Number(lhash.requiredWidth);
		}
		
	}
	
	if ( !e.target.hiddenOnLaunch){
		layerSpecificUI.style.display = "inline"; // 全体を表示状態にする
		
		var targetIframeId = getIframeId(layerId);
		
		var visibleIframeId = getVisibleLayerSpecificUIid();
	//	console.log("visibleIframeId:",visibleIframeId);
		
		if ( visibleIframeId && targetIframeId != visibleIframeId){ // ターゲットとは別の表示中のLayerUIがあればそれを隠す
			dispatchCutomIframeEvent( hideFrame ,visibleIframeId);
			document.getElementById( visibleIframeId ).style.display="none";
		}
		
		
		if ( document.getElementById( targetIframeId ) ){ // すでに対象iframeが存在している場合、表示を復活させる
			console.log("alreadyCreated iframe");
			var trgIframe = document.getElementById( targetIframeId );
			if(trgIframe.tagName == "IMG"){
				//画像（凡例）の場合は画像を常にリサイズしてスクロールせずに見れるように処理追加
				imgResize(trgIframe, document.getElementById("layerSpecificUI"), reqSize);
			}else{
				trgIframe.style.display="block";
				testIframeSize( document.getElementById(targetIframeId), reqSize);
			}
			dispatchCutomIframeEvent( appearFrame ,targetIframeId);
		} else {
	//		console.log("create new iframe");
			if ( controllerURL.indexOf(".png")>0 || controllerURL.indexOf(".jpg")>0 || controllerURL.indexOf(".jpeg")>0 || controllerURL.indexOf(".gif")>0){ // 拡張子がビットイメージの場合はimg要素を設置する
				var img = document.createElement("img");
				img.src=controllerURL;
				img.id = targetIframeId;
				//画像サイズを指定した場合div(layerSpecificUI)のサイズを変更して画像１枚を表示させる
				var resLayerSpecificUI = document.getElementById("layerSpecificUI");
				resLayerSpecificUI.addEventListener("mousewheel" , MouseWheelListenerFunc, false);
				resLayerSpecificUI.addEventListener("DOMMouseScroll" , MouseWheelListenerFunc, false);
				document.getElementById("layerSpecificUIbody").appendChild(img);
				setTimeout(imgResize, 100, img, resLayerSpecificUI, reqSize); 
				setTimeout(setLsUIbtnOffset,100,img);
			} else {
				initIframe(layerId,controllerURL,svgMap,reqSize);
			}
		}
	} else {  // hiddenOnLaunchフラグが立っているときは、iframeは起動させるが、画面上に表示はさせない 2017.9.22
		var hideIframe=initIframe(layerId,controllerURL,svgMap,reqSize);
		hideIframe.display="none";
	}
}

//layerSpecificUIがIMGのみであった場合のリサイズ処理
function imgResize(img, parentDiv, size){
	if(size.width != -1 && size.height != -1){
		console.log(parentDiv.style.width+"/"+parentDiv.style.height);
		img.style.width=size.width+"px";
		img.style.height=size.height+"px";
		parentDiv.style.width = size.width+"px";
		parentDiv.style.height = size.height+"px";
		console.log("change designation size.");
	}else{
		if(img.width && img.height){
			img.style.width=img.width;
			img.style.height=img.height;
			parentDiv.style.width = img.width+"px";
			parentDiv.style.height = img.height+"px";
		}else{
			img.style.width="100%";
			img.style.height="auto";
			layerSpecificUI.style.width = layerSpecificUiDefaultStyle.width;
			layerSpecificUI.style.height = layerSpecificUiDefaultStyle.height;
		}
	}
	img.style.display="block";
}

var openFrame = "openFrame";
var closeFrame = "closeFrame";
var appearFrame = "appearFrame";
var hideFrame = "hideFrame";

function dispatchCutomIframeEvent(evtName, targetFrameId){
	// added 2016.12.21 オーサリングツール等でUIが閉じられたときにイベントを流す
	// 今のところ、openFrame(新たに生成), closeFrame(消滅), appearFrame(隠されていたのが再度現れた), hideFrame(隠された) の４種で利用
	if ( document.getElementById(targetFrameId) && document.getElementById(targetFrameId).contentWindow ){
		var ifr = document.getElementById(targetFrameId);
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
	var layerSpecificUIbody = document.getElementById("layerSpecificUIbody");
	var iframe = document.createElement("iframe");
	layerSpecificUIbody.appendChild(iframe);
	iframeId = "layerSpecificUIframe_"+ lid;
	iframe.id = iframeId;
	if ( controllerURL.charAt(0) != ":" ){
		iframe.src=controllerURL;
	} else {
		var controllerSrc = (svgMap.getSvgImagesProps())[lid].controller;
		
		
		var sourceDoc="";
		if ( controllerSrc.indexOf("hash:") == 0 ){
			sourceDoc = controllerSrc.substring( controllerSrc.indexOf("src:")+4);
		} else {
			sourceDoc = controllerSrc.substring(4); // IE,Edge未サポート・・
			// 対応法はDOM操作か・・http://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q1032803595
		}
		
		
		iframe.srcdoc = sourceDoc;
		if ( !iframe.getAttribute("srcdoc") ) { // patch for IE&Edge
			sourceDoc = sourceDoc.replace(/&quot;/g,'"');
			iframe.contentWindow.document.write(sourceDoc );
		}
		
	}
	iframe.setAttribute("frameborder","0");
	iframe.style.width="100%";
	iframe.style.height="100%";
	
	
	// for iOS Sfari issue:
	// http://qiita.com/Shoesk/items/9f81ef1fd7b3a0b516b7
	iframe.style.border ="none";
	iframe.style.display="block";
	
//	console.log("initIframe:  layerSpecificUIbody Style:",layerSpecificUIbody.style,"  iframe.style",iframe.style);
	iframe.onload=function(){
		dispatchCutomIframeEvent(openFrame,iframeId);
		if ( layerSpecificUiMaxHeight == 0 ){
			layerSpecificUiMaxHeight = layerSpecificUI.offsetHeight
		}
		iframe.contentWindow.layerID=lid;
		iframe.contentWindow.svgMap = svgMap;
		if ( typeof svgMapGIStool != "undefined" ){
//			console.log("add svgMapGIStool to iframe");
			iframe.contentWindow.svgMapGIStool = svgMapGIStool;
		}
		if ( typeof svgMapAuthoringTool != "undefined" ){ // added 2016.12.19 AuthoringTools
//			console.log("add svgMapAuthoringTool to iframe");
			iframe.contentWindow.svgMapAuthoringTool = svgMapAuthoringTool;
		}
		
		iframe.contentWindow.svgImageProps = (svgMap.getSvgImagesProps())[lid];
		iframe.contentWindow.svgImage = (svgMap.getSvgImages())[lid];
//		iframe.contentWindow.testIframe("hellow from parent");
		if ( transferCustomEvent2iframe[lid] ){
			document.removeEventListener("zoomPanMap", transferCustomEvent2iframe[lid], false);
			document.removeEventListener("screenRefreshed", transferCustomEvent2iframe[lid], false);
		} else {
			transferCustomEvent2iframe[lid] = transferCustomEvent4layerUi(lid);
		}
		document.addEventListener("zoomPanMap", transferCustomEvent2iframe[lid] , false);
		document.addEventListener("screenRefreshed", transferCustomEvent2iframe[lid] , false);
		setTimeout( testIframeSize , 1000 , iframe ,reqSize);
	}
	
	return (iframe);
}

function pxNumb( pxval ){
	if ( pxval && pxval.indexOf("px")>0){
		return ( Number(pxval.substring(0,pxval.indexOf("px") ) ));
	} else {
		return ( 0 );
	}
}

var btnOffset = 0;
function setLsUIbtnOffset( targetElem , isRetry ){ // 2017.2.17 レイヤ固有UIのクローズボタン位置の微調整
	// スクロールバーがある場合、それが隠れるのを抑止する
	// targetElem：レイヤ固有UIに配置されるimg要素もしくはiframeのdocumentElement
//	console.log("setLsUIbtnOffset:", targetElem, targetElem.offsetWidth);
//	console.log("targetElem.~Width:",targetElem,targetElem.clientWidth,targetElem.offsetWidth, ":::" , lsUIbdy.clientWidth, layerSpecificUI.clientWidth);
	
	if ( targetElem.offsetWidth == 0 ){
		lsUIbtn.style.right="0px";
	} else if ( layerSpecificUI.clientWidth - targetElem.offsetWidth != btnOffset ){
		btnOffset = layerSpecificUI.clientWidth - targetElem.offsetWidth;
		if ( btnOffset>0 ){ // iOS safariでは0以下になることが・・・妙なスペック
//			console.log("btnOffset:",btnOffset);
			lsUIbtn.style.right=btnOffset+"px";
		} else {
			lsUIbtn.style.right="0px";
		}
	}
	
	if ( !isRetry &&  layerSpecificUI.clientWidth == targetElem.offsetWidth ){ // 一回だけやるように変更
		setTimeout(setLsUIbtnOffset , 1000 , targetElem , true);
	}
	
}

function testIframeSize( iframe ,reqSize){
//	console.log("iframeDoc, width:",iframe.contentWindow.document,  iframe.contentWindow.document.documentElement.offsetWidth);
//	console.log("H:",iframe.contentWindow.document.documentElement.scrollHeight );
//	console.log("H2:",iframe.contentWindow.document.body.offsetHeight , layerSpecificUI.offsetHeight);
	var maxHeight = window.innerHeight - pxNumb(layerSpecificUiDefaultStyle.top) - 50;
	var maxWidth = window.innerWidth - pxNumb(layerSpecificUiDefaultStyle.left) - pxNumb(layerSpecificUiDefaultStyle.right) - 50;
//	console.log("reqSize:",reqSize, " window:",window.innerWidth,window.innerHeight, "  available w/h",maxWidth,maxHeight) - 50;
	
	if ( ! iframe.contentWindow ){
		return;
	}
	setLsUIbtnOffset(iframe.contentWindow.document.documentElement);
	
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

var transferCustomEvent2iframe = [];
	
function transferCustomEvent4layerUi(layerId){
	return function(ev){
//		console.log("get event from root doc : type: ",ev.type);
		// レイヤー固有UIがある場合のみイベントを転送する
		if ( document.getElementById("layerSpecificUIframe_"+layerId) ){
			var ifr = document.getElementById("layerSpecificUIframe_"+layerId);
			var customEvent = ifr.contentWindow.document.createEvent("HTMLEvents");
			customEvent.initEvent(ev.type, true , false );
//			console.log("transferCustomEvent:", ev.type , " to:",layerId);
			ifr.contentWindow.document.dispatchEvent(customEvent);
//		} else if ( transferCustomEvent2iframe[layerId] ){
//			document.removeEventListener("zoomPanMap", transferCustomEvent2iframe[layerId], false);
		}
	};
}


function layerSpecificUIhide(){
	var visibleIframeId = getVisibleLayerSpecificUIid();
	
	dispatchCutomIframeEvent("hideFrame",visibleIframeId);
	document.getElementById(visibleIframeId).style.display = "none";
	
	layerSpecificUI.style.display = "none";
	layerSpecificUI.style.height = layerSpecificUiDefaultStyle.height;
}

function syncLayerSpecificUiExistence( layerId, visivility ){
	var visibleIframeId = getVisibleLayerSpecificUIid();
	var targetIframeId = getIframeId(layerId);
	if ( visivility == false && document.getElementById(targetIframeId) ){
		if ( visibleIframeId == targetIframeId){
			layerSpecificUIhide();
		}
		targetIframe= document.getElementById(targetIframeId)
		console.log("close layer specific UI for:",layerId);
		document.removeEventListener("zoomPanMap", transferCustomEvent2iframe[layerId], false);
		document.removeEventListener("screenRefreshed", transferCustomEvent2iframe[layerId], false);
		delete transferCustomEvent2iframe[layerId];
		dispatchCutomIframeEvent("closeFrame",targetIframeId );
		setTimeout( function(){
			console.log( "remove iframe:",targetIframe.id);
			targetIframe.parentNode.removeChild(targetIframe);
		},100);
	}
}


return { // svgMapLayerUI. で公開する関数のリスト
	layerSpecificUIhide : layerSpecificUIhide,
	setLayerListmessage : setLayerListmessage
}

})();

window.svgMapLayerUI = svgMapLayerUI;


})( window );

