// 日本の県ポリゴンに色塗りする感じのSVGMap WebAppレイヤー SVGMapFrame準拠の外部操作APIも備える
// Copyright 2021 by Satoru Takagi All Rights Reserved
// Programmed by Satoru Takagi


// 以下の二つの文字列変数をセットしてdrawData()すると描画されます
var currentContent=""; // csvで　データを入れる col0はKey, col1はVal
                       // Key: 県コード | 県名(漢字) | kenmei(ヘボン式小文字)  "県","ken"等は不要
                       // Val: 下のcurrentcolormap次第の値
var currentcolormap;   // "direct"(#RRGGBB) | "hue"(青～赤のヒートマップ:値域は自動演算) | "数字"(H値指定で濃淡:値域は自動演算)

// もしくは、rootMessageのrootMessage.textContent,rootMessage.colormapに設定してrootMessage.update();


var rootMessage={ // svgMapFrameを使っている。rootMessageにはルートのhtmlから送られてくる情報が入る
	update(){
		console.log("updated jpn_pref_a", this);
		checkUpdate();
	}
}



var prefDB={
"01":"北海道",
"02":"青森県",
"03":"岩手県",
"04":"宮城県",
"05":"秋田県",
"06":"山形県",
"07":"福島県",
"08":"茨城県",
"09":"栃木県",
"10":"群馬県",
"11":"埼玉県",
"12":"千葉県",
"13":"東京都",
"14":"神奈川県",
"15":"新潟県",
"16":"富山県",
"17":"石川県",
"18":"福井県",
"19":"山梨県",
"20":"長野県",
"21":"岐阜県",
"22":"静岡県",
"23":"愛知県",
"24":"三重県",
"25":"滋賀県",
"26":"京都府",
"27":"大阪府",
"28":"兵庫県",
"29":"奈良県",
"30":"和歌山県",
"31":"鳥取県",
"32":"島根県",
"33":"岡山県",
"34":"広島県",
"35":"山口県",
"36":"徳島県",
"37":"香川県",
"38":"愛媛県",
"39":"高知県",
"40":"福岡県",
"41":"佐賀県",
"42":"長崎県",
"43":"熊本県",
"44":"大分県",
"45":"宮崎県",
"46":"鹿児島県",
"47":"沖縄県"
}

onload=function(){
	console.log("Hello this is jpn_pref.svg  this:", this);
//	setInterval(checkUpdate,1000);
	setTimeout(initContent,20)
	
}

function checkUpdate(){
	console.log(rootMessage.textContent,rootMessage.colormap);
	if (currentContent != rootMessage.textContent || currentcolormap != rootMessage.colormap){
		currentContent = rootMessage.textContent;
		currentcolormap = rootMessage.colormap;
		if ( currentContent ){
			drawData();
		}
	}
}

function drawData(){
	var vMax = -9e99;
	var vMin = 9e99;
	console.log("textContent changed");
	clearContent();
	var lines = currentContent.split("\n");
	var datas=[];
	
	var colorMode = -1;
	var hue0 = -1;
	if ( !currentcolormap || currentcolormap.toLowerCase()=="direct"){
		colorMode = -1;
	} else if ( currentcolormap.toLowerCase()=="hue" ){
		colorMode = 0;
	} else if ( Number(currentcolormap) ){
		colorMode = 2;
		hue0 = Number(currentcolormap);
	}
	
	for ( var i = 0 ; i < lines.length ; i++ ){
		var line = lines[i].trim();
		if ( line ==""){
			continue;
		}
		var cols = line.split(",");
		var rd = [];
		for ( var j = 0 ; j < cols.length ; j++ ){
			var col = cols[j].trim();
			if ( j==0){ // Keyカラムは0番に固定する
				key = col;
			} else { // valが1番固定
				val = col;
			}
		}
		if ( colorMode == -1){
			// do nothing
		} else { // hue  || hueVal
			val = Number(val); //チェック不十分
			if ( val > vMax ){
				vMax = val;
			}
			if ( val < vMin ){
				vMin = val;
			}
		}
		datas.push([key,val]);
	}
	
	console.log("currentcolormap:",currentcolormap,"  colorMode:",colorMode," vMin,vMax,hue0:",vMin,vMax,hue0);
	for ( var i = 0 ; i < datas.length ; i++ ){
		var color;
		if ( colorMode ==-1 ){
			color = datas[i][1]; // direct mode
		} else {
			color = getColor(datas[i][1], colorMode,vMin,vMax,hue0);
		}
		setColor(datas[i][0],color);
	}
	svgMap.refreshScreen();
}

function setColor(key,val){
	var prefData = getPrefData(key);
	console.log("setColor:",key,val,prefData);
	if (!prefData){
		return;
	}
	for ( var i = 0 ; i < prefData.elements.length ; i++ ){
		prefData.elements[i].setAttribute("visibility","visible");
		prefData.elements[i].setAttribute("fill",(val)); // valが色名や色コードの場合 : 最初の
	}
}

function getPrefData(key){
	var prefData=hashMatch(key,prefDB); // まずは県コードマッチ
	if ( !prefData){ 
		var prefCode = hashMatch(key,prefNameDB);// 次は県名
		if ( ! prefCode ){
			prefCode = hashMatch(key,prefRomaDB);// 最後は県名ローマ字
		}
		if ( prefCode){
			prefData=hashMatch(prefCode,prefDB);
		}
	}
	return ( prefData ); // マッチしなければnull
}

var prefNameDB={};
var prefRomaDB={};

function initContent(){
	for ( var pcode in prefDB){
		var pname = prefDB[pcode];
		prefDB[pcode]={name:pname, elements:[]};
	}
	var ps=svgImage.getElementsByTagName("path");
	for ( var i = 0 ; i < ps.length ; i++ ){
		ps[i].setAttribute("visibility","hidden");
		var meta = (ps[i].getAttribute("content")).split(",");
		var pcode = meta[2];
		pcode = pcode.substring(0,2);
		var proma = ((meta[1].split(" "))[0]).toLowerCase();
		var parea = Number(meta[3]);
		if ( !prefDB[pcode].roma){
			prefDB[pcode].roma=proma;
			prefDB[pcode].area=parea;
		}
		(prefDB[pcode].elements).push(ps[i]);
//		console.log(pcode,proma,parea);
//		ps[i].setAttribute("fill","yellow");
	}
	svgMap.refreshScreen();
	console.log("prefDB:",prefDB);
	
	for ( var pcode in prefDB){
		var pref = prefDB[pcode];
		var prefN=(pref.name).substring(0,pref.name.length-1);
		prefNameDB[prefN]=pcode;
		prefRomaDB[pref.roma]=pcode;
	}
	console.log("prefNameDB:",prefNameDB,"  prefRomaDB:",prefRomaDB);
	
}

function clearContent(){
	var ps=document.getElementsByTagName("path");
	for ( var i = 0 ; i < ps.length ; i++ ){
		ps[i].setAttribute("visibility","hidden");
	}
}

function hashMatch(kwd,hash){
	var ans = null;
	for ( var key in hash ){
		if ( kwd.indexOf(key)>=0){
			ans = hash[key];
			break;
		}
	}
	return ans;
}


function getColor(val, mode,minval,maxval,hue0){
	var hue;
	if ( mode == 0 ){ // inverse HSV 270...0
		hue = (1-((val - minval)/(maxval-minval)))*270;
		vv = 1;
	} else if ( mode == 1 ){ // HSV 0...270
		hue = (val - minval)/(maxval-minval)*270;
		vv = 1;
	} else if ( mode == 2 ){ // 特定色の明度
		hue = hue0;
		vv = (val - minval)/(maxval-minval);
	}
	var rgb = hsvToRgb(hue,1,vv);
	var color ="#"+zeroPadding(rgb[0].toString(16),2)+zeroPadding(rgb[1].toString(16),2)+zeroPadding(rgb[2].toString(16),2);
	return ( color );
}

function hsvToRgb(H,S,V) {
	// https://qiita.com/hachisukansw/items/633d1bf6baf008e82847
	//https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV

	var C = V * S;
	var Hp = H / 60;
	var X = C * (1 - Math.abs(Hp % 2 - 1));

	var R, G, B;
	if (0 <= Hp && Hp < 1) {
		R=C;
		G=X;
		B=0;
	};
	if (1 <= Hp && Hp < 2) {
		R=X;
		G=C;
		B=0;
	};
	if (2 <= Hp && Hp < 3) {
		R=0;
		G=C;
		B=X;
	};
	if (3 <= Hp && Hp < 4) {
		R=0;
		G=X;
		B=C;
		
	};
	if (4 <= Hp && Hp < 5) {
		R=X;
		G=0;
		B=C;
	};
	if (5 <= Hp && Hp < 6) {
		R=C;
		G=0;
		B=X;
	};

	var m = V - C;
	R = R+m;
	G = G+m;
	B = B+m;

	R = Math.floor(R * 255);
	G = Math.floor(G * 255);
	B = Math.floor(B * 255);

	return [R ,G, B];
}

function zeroPadding(num,length){
    return ('0000000000' + num).slice(-length);
}



