// 
// Description:
// SVGMap PWA Module for >rev16 of SVGMap Lv0.1 framework
// 
//  Framework extension library for making SVGMap.js available as Progressive Web Application
//  Programmed by Satoru Takagi
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
// 2020/04/21 : start coding
// 2020/04/23 : rev1 初期の基本実装の動作
// 2020/04/24 : rev2 キャッシュポリシーの調整を可能に これを用いて、キャッシュなしでネットから読み込みindexedDBを必ず更新する機能を実装
// 2020/04/27 : rev3 ZIPパッケージを読み込んで解凍・indexedDBに投入する機能を実装
// 2020/04/28 : オフライン・オンライン通知
// 2020/05/01 : rev4 postMessageWhenConnected　構築 ISSUE: offline時に複数ポストすると、online回復時、responseが複数あってもcbfが一個しか呼ばれないbug
// 2020/05/07 : ISSUE FIX responseが複数あったらcbfが複数ちゃんと呼ばれるように改良
// 2020/05/14 : オートパイロットダウンロード機構を実装
// 2020/05/20 : 未DLレベル代替表示機構を実装
// 2020/05/20 : zipパッケージのルートにlayer.json(下記参照)がある場合、その.layer, .minScale(, maxScale)を読み取り、オフライン時代替表示機構メタデータに設定する (maxScale,minScaleはコンテンツと同じく"%"表記)
//              layer.json example: {"layer":"/devinfo/devkddi/lvl0.1/svgMapPWA/svgMapPWA4/localMaps/GSI/container_6_12.svg","maxScale":"100","minScale":"10"}
// 2020/05/27 : postMessageWhenConnectedを汎化　詳細は関数を見て
// 2020/05/29 : 遅延ポスト機能をsafari(含iOS)でも動くようにした
// 2020/06/09 : 代替表示機能を新設したsvgImagesProps[docId].preRenderControllerFunction(svgDocStatus)仕様を使って改善してみる
// 2020/06/23 : zipパッケージ読み込み機能のバグ修正　他　少し改良
//
//
// TODO:
// autoDownloader.htmlでプロトタイプした機能群のフレームワーク化
// 1: オートマチックダウンロードメカニズム 初期版は完了　ISSUEは最大縮尺を起点にした効率の良いDL機構に改修すべき
// 2: パッケージダウンロードや、オートマチックダウンローダによりダウンロードしたキャッシュに対する、より高度な管理機構 (DLレンジを超えて表示させようとしたとき、特に大縮尺でフォールバック表示を可能にすることを主目的)　初期実装完了 ISSUEはたくさんある：1レイヤに対して最大縮尺しか使えない。ルートコンテナに対するズーム率で表示制御しているのが妥当なのかどうか？(ZIPパッケージのlayer.jsonのズーム率が特定ルートコンテナ依存にはできないので・・)
//

// 制限：
// モダンブラウザのみ対応。IE, Edge(edge engine)はサポート外

// 仕組み：
// serviceWorkerPath グローバル変数があると、それのpathのjsをサービスワーカーとして登録する。
//
// svgMapServiceWorker_r0はsvgMap用のservice worker
// installフェーズ以降、cacheでは、必要なライブラリや、ルートのhtml文書、ボタン類イメージなどだけのロードと永続化を行う
// SVGMapのコンテンツは、fetchイベントをキャプチャし、このライブラリと連携して、indexedDBに保存した地図コンテンツを提供する
// これでiOS等でもcache50MB制限を回避したり、メインルーチン側でコンテンツを掌握できたりするようにする


// TIPS:
// https://blog.capilano-fw.com/?p=5404　オレオレ証明書サイトでPWA試す方法・・Chrome  iOS safariはどうなのかな
// start chrome --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https:(IPaddress) --allow-insecure-localhost --user-data-dir=(workDir)



// var serviceWorkerPath = '/svgMapServiceWorker_r4.js'; // なお、serviceWorkerのjsはこのSVGMapPWA.jsと同じディレクトリにある必要がある

var currentSrc = (function() {
    if (document.currentScript) {
        return document.currentScript.src;
    } else {
        var scripts = document.getElementsByTagName('script'),
        script = scripts[scripts.length-1];
        if (script.src) {
            return script.src;
        }
    }
})();
var currentURL = (new URL(currentSrc,location.href));
console.log("this js's src:",currentURL);

document.addEventListener('DOMContentLoaded', async (e) => {
	console.log(e);
	if ( typeof(serviceWorkerPath)!= "undefined" ){
		console.log(serviceWorkerPath + " のservice workerを登録します");
	//	var registration = await navigator.serviceWorker.register(new URL('svgMapServiceWorker_r4.js',currentURL),{scope: "/"});
	//	var registration = await navigator.serviceWorker.register(new URL('svgMapServiceWorker_r4.js',currentURL));
	//	var registration = await navigator.serviceWorker.register('svgMapServiceWorker_r4.js');
		var registration = await navigator.serviceWorker.register(serviceWorkerPath);
		await navigator.serviceWorker.ready;
		console.log("serviceWorker?:",navigator.serviceWorker,"  registration:",registration);
	}
});


( function ( window , undefined ) {
	var document = window.document;
	var navigator = window.navigator;
	var location = window.location;

var svgMapPWA = ( function(){
	
//	disableCache(); // DEV用＊＊＊＊＊＊＊＊これでキャッシュをdisableにしているが、この処理最初のコンテンツに対しては効かないし、serviceWorkerが起動前だとエラーにもなる
	
	var svgMapPwaCacheDbName = {dbName:"svgMapPwaCacheDB",tableName:"localContents"}; // IndexedDBによるコンテンツキャッシュのDBのDB,Table名
	var svgMapPwaCacheIndexDbName = {dbName:"svgMapPwaCacheIndexDB",tableName:"cachedLayerMetadata"}; // 同DBに、バースト的に登録するオフラインコンテンツのメタデータを格納するDB,Table名(なお、アドホックに格納されるオフラインコンテンツについてはここにデータは乗りません)
	var svgMapPwaPostDbName = {dbName:"svgMapPwaPostDB",tableName:"postQueue"}; // 遅延(NW接続時)POSTのためのDBのDB,Table名
	
	var cacheIndexDB = getDB(svgMapPwaCacheIndexDbName); // パッケージやバッチによって構築した分のコンテンツキャッシュDBのメタデータFB
	cacheIndexDB.connect();
	var cacheDB = getDB(svgMapPwaCacheDbName); // コンテンツキャッシュDB(キャッシュ)オブジェクトをつくる
	var postDB = getDB(svgMapPwaPostDbName); // 遅延POSTのためのキャッシュDBオブジェクトをつくる
	
	var svgImagesProps ;
	
	function getDB(dbName_tableName){ // IndexedDBのPromise版オブジェクト生成関数 一個のテーブルが一個のIndexedDBに作られるパターンのみ(今のところ)
		var DBNAME=dbName_tableName.dbName;
		var VERSION=1;
		var DOCNAME=dbName_tableName.tableName;
		var IDNAME="idCol";
		var db = null;
		async function connectDB(){
			db = await connect(DBNAME, VERSION);
		}
		// IndexedDBのPromise化
		// https://qiita.com/41semicolon/items/c0bbace5eafc422f988a
		function connect(dbname, version) {
			const dbp = new Promise((resolve, reject) => {
				const req = window.indexedDB.open(dbname, version);
				req.onsuccess = ev => resolve(ev.target.result);
				req.onerror = ev => reject('fails to open db');
				req.onupgradeneeded = ev => schemeDef(ev.target.result);
			});
			dbp.then(d => d.onerror = ev => alert("error: " + ev.target.errorCode));
			/** こういうことはできないんだね・・・ createできるのはあくまでonupgradeneeded時だけなので、バージョン上げて追加するとかだけだけど、もう面倒なので1DB1Tableに
			dbp.then(function(db){
				console.log("objectStoreNames:",db.objectStoreNames,"  db:",db);
				if (!(db.objectStoreNames).contains(DOCNAME)){
					schemeDef(db);
				}
			});
			**/
			return dbp;
		}
		async function put(obj) { // returns obj in IDB
			return new Promise((resolve, reject) => {
				const docs = db.transaction([DOCNAME], 'readwrite').objectStore(DOCNAME);
				const req = docs.put(obj);
				req.onsuccess = () => resolve({ [IDNAME]: req.result, ...obj });
				req.onerror = reject;
			});
		}
		async function get(id) { // NOTE: if not found, resolves with undefined.
			return new Promise((resolve, reject) => {
				const docs = db.transaction([DOCNAME, ]).objectStore(DOCNAME);
				const req = docs.get(id);
				req.onsuccess = () => resolve(req.result);
				req.onerror = reject;
			});
		}
		
		async function getAll(){
			return new Promise((resolve, reject) => {
				const docs = db.transaction([DOCNAME, ]).objectStore(DOCNAME);
				const req = docs.getAll();
				req.onsuccess = () => resolve(req.result);
				req.onerror = reject;
			});
		}
		
		async function getAllKeys(){
			return new Promise((resolve, reject) => {
				const docs = db.transaction([DOCNAME, ]).objectStore(DOCNAME);
				const req = docs.getAllKeys();
				req.onsuccess = () => resolve(req.result);
				req.onerror = reject;
			});
		}
		
		async function deleteRecord(id){
			return new Promise((resolve, reject) => {
				const docs = db.transaction([DOCNAME], 'readwrite').objectStore(DOCNAME);
				const req = docs.delete(id);
				req.onsuccess = () => resolve(req.result);
				req.onerror = reject;
			});
		}
		
		async function clear(){
			return new Promise((resolve, reject) => {
				const docs = db.transaction([DOCNAME], 'readwrite').objectStore(DOCNAME);
				const req = docs.clear();
				req.onsuccess = () => resolve(req.result);
				req.onerror = reject;
			});
		}
		
		function schemeDef(db) {
		  db.createObjectStore(DOCNAME, { keyPath: IDNAME, autoIncrement: true });
		}
		
		return {
			get: get,
			put: put,
			getAll: getAll,
			getAllKeys: getAllKeys,
			connect: connectDB,
			clear: clear,
			delete: deleteRecord,
		}
	};
	
	async function getContent(url) {
		// 送信先のURL.
		// fetchでアクセス.
		const res = await fetch(url)
		// Blob形式でデータ取得.
		const blob = await res.blob();
//		console.log("getContent:",url,"  blob:",blob);
		return blob
	}
	var loading = false;
	var cbInterval = 500;
	async function loadOfflineContents(contentUrlList, overwrite, progressCallBack){
		if ( loading ){
			return;
		}
		loading = true;
		if ( overwrite ){
			await sendMessage({cacheMode:"no"}); // noでindexedDBを使った返答をservice workerが行わないようにしてからfetchしないとキャッシュが持ってこられてしまうかもしれないので・・・
		}
		await cacheDB.connect();
		var pastTime = (new Date()).getTime();
		for ( var i = 0 ; i < contentUrlList.length ; i++ ){
			var cBlob = await getContent(contentUrlList[i]);
			var cUrl = new URL ( contentUrlList[i], location.href);
			await cacheDB.put({idCol:cUrl.href,contentBlob:cBlob});
			var currentTime = (new Date()).getTime();
			console.log("currentTime:",currentTime,"  pastTime:",pastTime,"  dif:",currentTime - pastTime);
			if ( progressCallBack && (currentTime - pastTime > cbInterval)){
				progressCallBack(i/contentUrlList.length);
				pastTime = currentTime;
			}
		}
		await sendMessage({cacheMode:"cacheFirst"}); // キャッシュを使うように戻す
		loading = false;
	}
	
	async function loadZippedOfflineContents(zip_url,progressCallBack){
		// 保存してあるディレクトリに対して、そのzipファイルの中のディレクトリ構造で、コンテンツがあるものと見做したURLもつキャッシュを形成する
		// zipのルートにlayer.jsonがある場合、registCachedLayerMeta({absPath:layerContainer'sURL},initialDLArea, minScale, maxScale)にその内容を投入し、代替表示機構を利用可能にする
		
		if ( loading ){
			return;
		}
		loading = true;
		// zipの場合は、必ずオーバーライトモードにする
		await sendMessage({cacheMode:"no"}); // noでindexedDBを使った返答をservice workerが行わないようにしてからfetchしないとキャッシュが持ってこられてしまうかもしれないので・・・
		zip.useWebWorkers = false;
		await cacheDB.connect();
		var response = await fetch(zip_url);
		
//		var abuf = await response.arrayBuffer(); // ファイルが大きいとこれは進捗不明でまずい・・
		var abuf = await downloadBinaryData(response, progressCallBack); // 上のプログレス表示付き
		
//		console.log("abuf:",abuf);
		var zrdr = await getZipReader(abuf);
		var zURL = new URL(zip_url,location.href);
		var parentDirURL = (zURL.href).substring(0,((zURL.href).lastIndexOf("/"))) + "/";
		var storeResult = await storeContents(zrdr,parentDirURL, progressCallBack);
		var storedCount = 0;
		for ( var i = 0 ; i < storeResult.length ; i++ ){
			if ( storeResult[i].result=="success"){
				++ storedCount;
			}
		}
//		console.log("all contents stored : ",storeResult);
		await sendMessage({cacheMode:"cacheFirst"}); // キャッシュを使うように戻す
		loading = false;
		return ( storedCount );
	}
	
	async function enableCache(){
		await sendMessage({cacheMode:"cacheFirst"});
	}
	async function disableCache(){
		await sendMessage({cacheMode:"no"});
	}
	
	async function downloadBinaryData(response, progressCallBack){
		// 進捗がresponse.arrayBuffer()だとわからないので
		// response.arrayBuffer();の代わりに、プログレス表示可能なものを作った
		// https://javascript.info/fetch-progress を参考に
		var total = response.headers.get('content-length'); // なんかnullになるぞ
		// この理由は、apacheのmod-deflateが効いていると、ある程度大きいときにこれが不確定になるため
		// zipはそもそも圧縮不要なので切れば良い（下記）
		//      SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|zip|ico)$ no-gzip dont-vary
		const reader = response.body.getReader();
		let receivedLength = 0;
		let chunks = [];
		while(true) {
			const {done, value} = await reader.read();
			if (done) {
				break;
			}
			chunks.push(value);
			receivedLength += value.length;
			var progress = receivedLength;
			if ( total ){
				progress = progress / total;
			}
			if ( progressCallBack ){
				progressCallBack ( progress );
			}
//			console.log(`Received ${receivedLength} of ${total}`)
		}
		let abuf = new Uint8Array(receivedLength);
		let position = 0;
		for(let chunk of chunks) {
			abuf.set(chunk, position);
			position += chunk.length;
		}
//		console.log("abuf:",abuf);
		return ( abuf );
	}
	
	async function clearOfflineContents(){
		await cacheDB.connect();
		await cacheDB.clear();
		await deleteCachedLayerMeta();
//		await cacheIndexDB.connect();
//		await cacheIndexDB.clear();
	}
	
	async function clearCache(){
		// TBD
	}
	
	
	// この辺、遅延ポスト機能の実装が入り込んでる・・
	function sendMessage(message) {
		navigator.serviceWorker.controller.postMessage(message);
	}
	
	getClientId_ser = 0;
	async function getClientId(){
		++ getClientId_ser;
		// このwindowのclientIdを得る
		// わざわざservice workerに問い合わせているが、本当はもっといい方法がある気がする・・・
		return new Promise( async function(getClientIdCbf){ // イベントをPromise化して値を返却する方法は、CHIRIMEN with micro:bitのpolyfillを参考にしてる・・・
			var req = "clientId";
			var getClientIdHash=req + getClientId_ser;
			messageGetObj[getClientIdHash]={};
			messageGetObj[getClientIdHash].cbf=getClientIdCbf;
			messageGetObj[getClientIdHash].req=req;
			messageGetObj[getClientIdHash].ser=getClientId_ser;
			console.log("messageGetObj[getClientIdHash]:",messageGetObj[getClientIdHash]);
			await sendMessage({req:req, ser:getClientId_ser});
		});
	}
	
	var messageGetObj={}; // これをちゃんとキューにして処理しないと、最後のコールバックしか呼び出されないバグ 2020/5/1　は解消2020/5/7
	
	navigator.serviceWorker.addEventListener('message', async function(message){
		console.log("Got message from service worker:",message);
		var req = message.data.req;
		var ser = message.data.ser;
		var messageGetObjHash = req + ser;
		console.log("req:",req," ser:",ser," messageGetObjHash:",messageGetObjHash,"  messageGetObj:",messageGetObj);
		
		if ( messageGetObj[messageGetObjHash] ){
			messageGetObj[messageGetObjHash].cbf(message.data.content);
			delete messageGetObj[messageGetObjHash];
		} else {
			alert ( " msgFrmSW:"+message.data);
		}
	});
	
	
	// この辺から、地図コンテンツのZIPパッケージを登録する仕組み
	async function getStorageUsage(){
		var est = await navigator.storage.estimate();
		return ( est );
	}
	
	
	// ZIPファイルを解凍し、コンテンツを一気にキャッシュ用IndexedDBにインストする
	// Based on https://serviceworke.rs/cache-from-zip.html
	// This wrapper promisifies the zip.js API for reading a zip.
	function getZipReader(data) {
		return new Promise(function(fulfill, reject) {
			zip.createReader(new zip.ArrayBufferReader(data), fulfill, reject);
		});
	}
	// Use the reader to read each of the files inside the zip
	// and put them into the offline cache.
	function storeContents(reader, parentDirURL, progressCallBack) {
		return new Promise(function(fulfill, reject) {
			reader.getEntries(function(entries) {
				var entLen = entries.length;
				var storeCount=0;
				console.log('Installing', entries.length, 'files from zip');
				Promise.all(
					entries.map(
						async function(entry){ // asyncが無くて動きがおかしくなっていたのを修正 2020/6/23
							var ret = await storeEntryToIDB(entry,parentDirURL);
							++ storeCount;
							if ( progressCallBack ){
								progressCallBack( storeCount / entLen );
							}
							
							return ( ret );
						}
					)
				).then(fulfill, reject);
			});
		});
	}
	
	async function storeEntryToIDB(entry,parentDirURL){
			if (entry.directory) { return({result:"skip"}) };
		var cBlob = await getUnzippedData(entry);
//		console.log("dir:",parentDirURL," fName:",entry.filename," contentBlob:",cBlob);
		var cURL = parentDirURL + entry.filename;
		if ( entry.filename == "layer.json"){ // 2020/5/19 代替表示機構用拡張
			console.log("Found layer.json");
			await registCachedLayerMetaFromJsonBlob(cBlob);
		}
		var ret = await cacheDB.put({result:"success", idCol:cURL, contentBlob:cBlob});
		return ( ret );
	}
	
	async function registCachedLayerMetaFromJsonBlob(cBlob){ // 2020/5/20
		var jsonText = await getText(cBlob);
		var jsonData = JSON.parse(jsonText);
		
		var layerContainerPath = (new URL(jsonData.layer,document.location.href)).href;
		var minScale = Number(jsonData.minScale)/100; // %表記なので・・
		var maxScale = (Number(jsonData.maxScale)-1)/100; // ちょっと1%調整・・・
		var geoArea = null;
		await setCachedLayerMeta(layerContainerPath, minScale, maxScale, geoArea);
		await updateCacheIndex();
		console.log("success setCachedLayerMeta:",jsonData);
	}
	
	function getUnzippedData(entry){
		return new Promise(function(resolve){
//			console.log("entry:",entry);
			entry.getData(new zip.BlobWriter(getContentType(entry.filename)),resolve);
		});
	}
	
	var contentTypesByExtension = {
		'css': 'text/css',
		'js': 'application/javascript',
		'png': 'image/png',
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'html': 'text/html',
		'htm': 'text/html',
		'svg': 'image/svg+xml',
		'json': 'application/json'
	};
	
	// https://qiita.com/koushisa/items/4a3e98358a7ce110aeec
	function getText(blob){
		var fileReader = new FileReader();
		
		return new Promise((resolve, reject) => {
			fileReader.onerror = () => {
				fileReader.abort();
				reject();
			};
			
			fileReader.onload = () => {
				resolve(fileReader.result);
			};
			
			fileReader.readAsText(blob);
		});
	}

	// Return the content type of a file based on the name extension
	function getContentType(filename) {
	  var tokens = filename.split('.');
	  var extension = tokens[tokens.length - 1];
	  return contentTypesByExtension[extension] || 'text/plain';
	}
	
	
	// オフライン遅延POSTフレームワーク
	// serviceWorkerのsync eventからキックされるprocessPostMessage()に送っている
	// ISSUE: safariとかfirefoxでsyncManagerはサポートされてないし、safariだとFormDataもworkerで動かない
	//        FIXED ので、このjsでメインプロセス内で同じことを実行することにする！！
	// 
	var clientId=null;
	var postReq = "postResponse";
	async function postMessageWhenConnected(URL, postData, postCompleteCBF){
		// ネット接続があったらメッセージを指定のURLにPOSTで送る
		// https://qiita.com/horo/items/28bc624b8a26ffa09621 とか参考にして・・
		// postData
		// fetchやRequestの二番目のパラメータ(initオブジェクト)相当、.bodyが含まれたオブジェクトを投入する
		// optionalとしてmethod、headersも入れられる・・(POSTじゃなくてGETにするとか)
		// 参考1：https://developer.mozilla.org/ja/docs/Web/API/Request/Request
		// 参考2：https://qiita.com/legokichi/items/801e88462eb5c84af97d
		// 参考3：(bodyにformDataを設定する場合) https://ja.javascript.info/formdata
		// postDataに単なる文字列を入れた場合、form-dataによる決め打ちのリクエストになる(FormDataでcontentに
		
		console.log("postMessageWhenConnected: URL:",URL," postData:", postData);
		if ( !clientId ){
			clientId = await getClientId();
		}
		console.log("clientId:",clientId);
		await postDB.connect();
		
		var postContent;
		if ( typeof(postData) == "string" ){
			postContent = {
				url : URL,
				data : postData,
				clientId : clientId
			};
		} else if ( postData.body ){
			var pBody;
			if ( postData.body instanceof FormData ){
				var sf = {};
				for ( var fk of (postData.body).keys()){
					console.log(fk, (postData.body).get(fk));
					sf[fk]=(postData.body).get(fk);
				}
				pBody = {type:"FormData",data:sf};
				
			} else {
				pBody = postData.body;
			}
			
			postContent = {
				url : URL,
//				headers : postData.headers,
				body : pBody,
				clientId : clientId
			};
			if ( postData.headers ){
				postContent.headers = postData.headers;
			}
			if ( postData.method && typeof(postData.method)=="string" ){
				postContent.method = postData.method;
			}
		}
		
		var result = await postDB.put(postContent); // keyはオートインクリメントに任すか・・
		console.log("add indexed db result:",result);
		var postSer = result.idCol;
		var messageGetObjHash = postReq + postSer;
		try{
			console.log("ネット接続状態(sync)の監視を登録します");
			
			if ( postCompleteCBF ){ // postの返却を得るコールバックがある場合に設定する
				messageGetObj[messageGetObjHash]={};
				messageGetObj[messageGetObjHash].req = postReq; // 冗長・・
				messageGetObj[messageGetObjHash].ser = postSer; // 冗長・・
				messageGetObj[messageGetObjHash].cbf = postCompleteCBF;
			}
			var registration = await navigator.serviceWorker.ready;
			if ( false ){ // ちゃんとsyncを動かすには、registration.syncだよ
				await registration.sync.register('outbox:'+result.idCol);
				console.log('sync registration success');
			} else {
//				alert('navigator.serviceWorker is NOT.... alter it');
				console.log('navigator.serviceWorker is NOT.... alter it');
				processPostQueue();
			}
		} catch ( error ){
			console.log('sync registration error', error);
		}
	}
	
	setInterval(processPostQueue,3000);
	
	async function processPostQueue(){
		if ( window.navigator.onLine ){
			await postDB.connect();
			var pIds = await postDB.getAllKeys();
			for ( var i = 0 ; i < pIds.length ; i++ ){
				console.log("Post postponed content:",pIds[i]);
				var resText = await processPostMessage(pIds[i]);
				var messageGetObjHash = postReq + pIds[i];
				messageGetObj[messageGetObjHash].cbf(resText);
				delete messageGetObj[messageGetObjHash];
			}
		}
	}
	
	async function processPostMessage(postId){ // この関数は、postMessageWhenConnectedの処理をServiceWorkerのsyncイベントで起動されるものだが、sasfariではsyncもFormDataもServiceWorkerで使えないので、メインプロセスで動かすことにする　なのでこのjsが呼ばれてないと当然動きません・・・
		// try catch エラー処理必要じゃない? async awaitでreject相当処理ってどう書いたらいい？書かなくても勝手にエラーになる？
		// これぐらい汎用化すればなんでもPOSTできると思われる：https://qiita.com/legokichi/items/801e88462eb5c84af97d
		// すなわち、fetchやRequestの二番目のパラメータ(initオブジェクト(https://developer.mozilla.org/ja/docs/Web/API/Request/Request))相当のもの
		// さらに言えばmethodも汎用化してしまえるが・・一応post関数ということなのでデフォルトはPOSTとする
		await postDB.connect();
		var postContent = await postDB.get(postId);
		var clientId = postContent.clientId;
		console.log("processPostMessage:, clientId:",clientId,"   postContent:",postContent);
		var postRequest;
		if ( postContent.body ){
			var reqBody;
			if ( postContent.body.type && postContent.body.type == "FormData"){
				// FormDataがIndexedDBに入れられない(シリアライズ不可能なオブジェクト)なのを回避するパッチ・・・
				var formData = new FormData();
				for ( var fk in postContent.body.data ){
					formData.append(fk,(postContent.body.data)[fk]);
				}
				reqBody = formData;
			} else {
				reqBody = postContent.body;
			}
			var method = 'POST';
			if ( postContent.method ){
				method = postContent.method;
			}
			var reqInit={ 
				method: method,
				body: reqBody,
				credentials: 'include'
			};
			if ( postContent.headers ){
				reqInit.headers = postContent.headers;
			}
			postRequest = new Request(
				postContent.url,
				reqInit
			);
		} else {
			var formData = new FormData();
			formData.append('pid', postId);
			formData.append('content', postContent.data);
			postRequest = new Request(
				postContent.url,
				{method: 'POST', body: formData, credentials: 'include'}
			);
		}
	//	console.log("virtual post:",postRequest, " postData:",formData,"  pid:",postId,"  content:",postContent.data);
		var res;
		console.log("Actual post:",postRequest);
		res = await fetch(postRequest);
		var responseText = await res.text();
		console.log("res.text:",responseText);
		await postDB.delete(postId);
	//	await sendMessage({req:"postResponse", ser:postId, content:responseText},clientId); // 2020/5/7
		return ( responseText ); // これと上の2行だげがserviceWorkerのコードで違うのみ
	}
	
	
	async function getPostQueue(){
		var postDB = getDB({dbName:"svgMapPwaPostDB",tableName:"postQueue"});
		await postDB.connect();
		var result = await postDB.getAll();
		console.log("result:",result);
		return ( result );
	}
	
	
	
	
	
	// スケールトリミング機構(DL済みのレイヤーに対して、スケールレンジを超えたときに仮想的にスケールが下のコンテンツで代替表示する仕組み)
	// cacheIndexを使っている
	var scaleTrimEnabled = true;
	var cacheIndex
	function setScaleTrim(statusFlg){
		if ( statusFlg == true || statusFlg == false ){
			scaleTrimEnabled = statusFlg;
		}
		// 念のため・・初期化しておく
		svgMap.setDevicePixelRatio();
//		svgMap.refreshScreen();
	}
	
	
	document.addEventListener('zoomPanMap', registScaleTrimmer); // 最初の描画完了時に、scaleTrimmerを登録する
	async function registScaleTrimmer(){
		updateCacheIndex();
		document.removeEventListener('zoomPanMap', registScaleTrimmer);
		console.log("regist SVGMap's preRenderSuperControllerFunction");
		var svgImagesProps=svgMap.getSvgImagesProps();
		svgMap.setPreRenderController( null, scaleTrimmer); // nullの場合はsuperなのを設定する
	}
	
	var cacheIndex;
	async function updateCacheIndex(){
		cacheIndex = await getCachedLayerMeta();
//		console.log("updateCacheIndex:",cacheIndex);
	}
	
	function scaleTrimmer(meta){ // 新設した仕様：svgMapのpreRenderSuperControllerFunctionを使ったscaleTrimmer
		// これによって、設定後にrefreshScreen()するような非効率がなくなった。
//		console.log("svgMapPWA preRenderSuperControllerFunction on :",meta.docId, "meta:",meta);
		if ( scaleTrimEnabled && !window.navigator.onLine ){ // 有効化&&オフライン時のみ発動
		} else {
			updateCacheIndex(); // このタイミング(有線状態)でキャッシュの情報を更新しておこう
//			if ( trimmed.length>0){ // 無効化||復帰したときは必要に応じDPRを初期化する
//				trimmed =[];
//				svgMap.setDevicePixelRatio();
//			}
			return;
		}
		var svgImagesProps=svgMap.getSvgImagesProps();
		var currentDPR = svgMap.getDevicePixelRatio(meta.docId);
		var docURL = (new URL(svgImagesProps[meta.docId].Path,document.location.href)).href;
		
//		console.log("doc's URL:",docURL, "   cacheIndex:",cacheIndex);
		
		// そのlayerIDのレイヤがcacheIndexに登録されているのかを確認する
		for ( var i = 0 ; i < cacheIndex.length ; i++ ){ // cacheIndexは絶対パスをKEYにしてキャッシュされてるデータのメタデータが履いている
			var targetCache = cacheIndex[i];
			if ( docURL == cacheIndex[i].idCol ){
				var currentLayerPScale = currentDPR * svgImagesProps[meta.docId].scale; // DPR=1と見立てたDPRの効果がないときのscale値 これはちゃんと計算された後だから大丈夫なはず (ただ、devicePixelRation分割り増しされてるんじゃないか？　currentDPRを使わないとダメなはず)
//				console.log("svgMapPWA preRenderSuperControllerFunction : is scaleTrim target:",meta.docId  ,"  targetCache.maxScale:",targetCache.maxScale,"   currentLayerPScale:",currentLayerPScale, "  currentDPR:",currentDPR,"  doc's scale:", svgImagesProps[meta.docId].scale);
				if ( targetCache.maxScale < currentLayerPScale ){
					var scaleTrim = 1.0 * currentLayerPScale  /  targetCache.maxScale;
//					console.log("Do Scale Trimm: DPR:",scaleTrim);
					svgMap.setDevicePixelRatio(scaleTrim,meta.docId);
//					trimmed.push(targetLayers[i].title);
				} else {
					svgMap.setDevicePixelRatio(null,meta.docId); 
				}
			}
		}
	}
	
	/** Obsoluted Functions.... (by scaleTrimmer()dp )
	
//	var prevRootScale=1;
//	var prevVisibleLayersLength=0;
//	var trimmed=[];
	function getPhysicalScale_int(layerId,currentScales,currentDPR){ // DPRをかける前のscaleを求める
		var ans;
		if ( currentDPR.layerDevicePixelRatio[layerId] ){
			ans = currentScales[layerId] * currentDPR.layerDevicePixelRatio[layerId];
		} else {
			ans = currentScales[layerId] * currentDPR.commonDevicePixelRatio;
		}
		return ans;
	}
	
	function scaleTrimmerRoot(meta){ // 新設した仕様：svgMapのpreRenderControllerFunctionを使ったscaleTrimmer
		// これは、"root"文書パース直前に子レイヤー分を一気に設定しようと試みたものだが、いろいろ必要な変数が設定前の状態を回避しようとするとカオスになるのでやめた
		console.log("svgMapPWA preRenderControllerFunction on :",meta.docId, meta:",meta);
		return;
		if ( scaleTrimEnabled && !window.navigator.onLine ){ // 有効化&&オフライン時のみ発動
		} else {
			if ( trimmed.length>0){ // 無効化||復帰したときは必要に応じDPRを初期化する
				trimmed =[];
				svgMap.setDevicePixelRatio();
			}
			return;
		}
		var svgImagesProps=svgMap.getSvgImagesProps();
		
		var currentDPR = svgMap.getDevicePixelRatio();
		var currentScales = getScales();
		var visibleLayers = getVisibleLayers();
		// レイヤー構成が変わった時 or 縮尺が変わった時のみ以下の処理を行えば良い"はず"
		if ( meta.viewChanged != "zoom" && visibleLayers.length == prevVisibleLayersLength){
			return;
		}
		prevVisibleLayersLength = visibleLayers.length;
		
		// cacheIndexと突き合わせるために表示されているレイヤーの(絶対パスによる)ハッシュテーブルを準備している(ちょっと冗長？)
		var visibleLayersHash ={};
		for ( var i = 0 ; i< visibleLayers.length ; i++ ){
			visibleLayersHash[visibleLayers[i].absPath] = {title:visibleLayers[i].title,id:visibleLayers[i].id};
		}
		var targetLayers =[]; // 今表示されているレイヤーのなかでcacheに入っているものをtargetLayersに入れている
		for ( var i = 0 ; i < cacheIndex.length ; i++ ){ // cacheIndexは絶対パスをKEYにしてキャッシュされてるデータのメタデータが履いている
			if ( visibleLayersHash[cacheIndex[i].idCol]){
				targetLayers.push({
					layerId : visibleLayersHash[cacheIndex[i].idCol].id,
					title : visibleLayersHash[cacheIndex[i].idCol].title,
					absPath : cacheIndex[i].idCol,
					maxScale: cacheIndex[i].maxScale,
					minScale: cacheIndex[i].minScale,
					geoArea : cacheIndex[i].geoArea,
					
				});
			}
		}
		console.log("DLコンテンツのスケールオーバー非表示回避処理 targetLayers:",targetLayers,"  currentScales:",currentScales,"  currentDPR:",currentDPR);
		svgMap.setDevicePixelRatio(); // これでいったん完全初期化
		trimmed=[];
		for ( var i = 0 ; i < targetLayers.length ; i++ ){
			var layerId = targetLayers[i].layerId;
//			var currentLayerPScale = getPhysicalScale_int(layerId,currentScales,currentDPR); // この演算がたぶんメルカトルで合わなくなっている・・
//			var currentLayerPScalePrev = svgImagesProps[layerId].scale; // これはひとつ前のものが入っちゃうのでダメ(rootの演算時は子ドキュメントの演算は完了してないので)
//			console.log("TTTTEEEESSSSTTTT:",svgImagesProps[layerId].CRS,svgImagesProps["root"].CRS);
			var currentLayerPScale = meta.rootScale * (svgMap.getConversionMatrixViaGCS( svgImagesProps[layerId].CRS, svgImagesProps["root"].CRS )).scale; // getConversionMatrixViaGCS...のほうの値は基本的に定数なので一度計算したらそれを使えば良いはずだけど・まいいか ・・・しかしそもそもそのレイヤのCRSはそのレイヤのParseが終わってないと生成されていないので、rootの読み込みparse前タイミングでは、最初のロードが終わってない限り取れないよね。
			
			console.log("layerId:",layerId,"  currentLayerPScale:",currentLayerPScale);
			if ( targetLayers[i].maxScale < currentLayerPScale ){
				console.log("maxScale:",targetLayers[i].maxScale ,"  currentScale:",currentLayerPScale);
				var scaleTrim = 2 * currentLayerPScale  /  targetLayers[i].maxScale;
				svgMap.setDevicePixelRatio(scaleTrim,layerId);
				trimmed.push(targetLayers[i].title);
//			} else {
//				svgMap.setDevicePixelRatio(null,targetLayers[i].layerId); // これは完全初期化してるので不要
			}
		}
	}
	
	
	async function registScaleTrimmer(){
		// この方法はrefreshScreenによるちらつきが生じるし非効率なのでやめた
		console.log("zoomPanMap:",getScales());
		if ( scaleTrimEnabled && !window.navigator.onLine ){ // 有効化&&オフライン時のみ発動
		} else {
			if ( trimmed.length>0){ // 無効化||復帰したときは必要に応じDPRを初期化する
				trimmed =[];
				svgMap.setDevicePixelRatio();
				svgMap.refreshScreen();
			}
			return;
		}
		
		// レイヤー構成が変わった時 or 縮尺が変わった時のみ以下の処理を行えば良い"はず"
		var currentDPR = svgMap.getDevicePixelRatio();
		var currentScales = getScales();
		var currentRootScale = getPhysicalScale_int("root",currentScales,currentDPR);
		var visibleLayers = getVisibleLayers();
		if ( currentRootScale == prevRootScale && visibleLayers.length == prevVisibleLayersLength){
			return;
		}
		prevRootScale = currentRootScale;
		prevVisibleLayersLength = visibleLayers.length;
		var cacheIndex = await getCachedLayerMeta();
		var visibleLayersHash ={};
		
		for ( var i = 0 ; i< visibleLayers.length ; i++ ){
			visibleLayersHash[visibleLayers[i].absPath] = {title:visibleLayers[i].title,id:visibleLayers[i].id};
		}
//		console.log("DLコンテンツのスケールオーバー非表示回避処理 cacheIndex:",cacheIndex, " currentRootScale:",currentRootScale," visibleLayers:",visibleLayers);
		// トリム処理設定ターゲットのレイヤーを選別(targetLayersに投入)
		var targetLayers =[];
		for ( var i = 0 ; i < cacheIndex.length ; i++ ){
			if ( visibleLayersHash[cacheIndex[i].idCol]){
				targetLayers.push({
					layerId : visibleLayersHash[cacheIndex[i].idCol].id,
					title : visibleLayersHash[cacheIndex[i].idCol].title,
					absPath : cacheIndex[i].idCol,
					maxScale: cacheIndex[i].maxScale,
					minScale: cacheIndex[i].minScale,
					geoArea : cacheIndex[i].geoArea,
					
				});
			}
		}
		console.log("DLコンテンツのスケールオーバー非表示回避処理 targetLayers:",targetLayers,"  currentScales:",currentScales,"  currentDPR:",currentDPR);
		
		svgMap.setDevicePixelRatio(); // これでいったん完全初期化
		trimmed=[];
		for ( var i = 0 ; i < targetLayers.length ; i++ ){
			var layerId = targetLayers[i].layerId;
			var currentLayerPScale = getPhysicalScale_int(layerId,currentScales,currentDPR);
			if ( targetLayers[i].maxScale < currentLayerPScale ){
				console.log("maxScale:",targetLayers[i].maxScale ,"  currentScale:",currentLayerPScale);
				var scaleTrim = currentLayerPScale  /  targetLayers[i].maxScale;
				svgMap.setDevicePixelRatio(scaleTrim,layerId);
				trimmed.push(targetLayers[i].title);
//			} else {
//				svgMap.setDevicePixelRatio(null,targetLayers[i].layerId); // これは完全初期化してるので不要
			}
		}
		if ( trimmed.length > 0 ){
			console.log(" >> DLコンテンツのスケールオーバー非表示回避設定実施 : ", );
			svgMap.refreshScreen(); // これがいろいろダメだった　特にiOS safariでは描画タイミングが合ってないのか？表示されなかったり・・
		}
		
	};
	**/
	
	
	// バッチ（オートパイロット）によるキャッシュレイヤーのメタデータ管理機構 2020/5/14-
	// 今のところ同じレイヤーに対しては最後にバッチDLを行ったエリアレンジのみ保存されることにする（TBD）
	var cacheIndex={}; // indexedDB
	async function registCachedLayerMeta(downloadLayers,initialDLArea, minRootScale, maxRootScale){
		// 2020/5/20 格納するscaleを各レイヤー(レイヤールートコンテナ)のscaleに変更した
		var currentScales = getScales();
		for ( var i = 0 ; i < downloadLayers.length ; i++ ){
			var layerId= downloadLayers[i].id;
			var layerScaleFactor = currentScales[layerId]/currentScales["root"]; // ルートのスケールに対する各レイヤーのスケールのファクター レイヤごとのデバイスピクセルレシオを設定してない範囲でこれは正しい。この関数呼ぶときはDL中～オンライン中なので設定してないはずなのでギリギリ正しいね もう少しちゃんとした演算にすべき
			var minScale = minRootScale * layerScaleFactor;
			var maxScale = maxRootScale * layerScaleFactor;
			var absPath = downloadLayers[i].absPath;
			await setCachedLayerMeta(absPath, minScale, maxScale, initialDLArea);
		}
	}
	async function setCachedLayerMeta(layerContainerPath, minScale, maxScale, geoArea){
//		await cacheIndexDB.connect();
		// このscaleは、ルートコンテナに対するスケールとする
		await cacheIndexDB.put({idCol:layerContainerPath, minScale:minScale, maxScale:maxScale, geoArea:geoArea});
	}
	async function getCachedLayerMeta(layerContainerPath){
//		await cacheIndexDB.connect();
		if ( layerContainerPath ){
			return (await cacheIndexDB.get(layerContainerPath));
		} else {
			return (await cacheIndexDB.getAll());
		}
	}
	async function deleteCachedLayerMeta(layerContainerPath){
//		await cacheIndexDB.connect();
		if ( layerContainerPath ){
			await cacheIndexDB.delete(layerContainerPath);
		} else {
			await cacheIndexDB.clear();
		}
	}
	
	function getVisibleLayers(){
		var mapLayersElement = svgMap.getLayers();
		var mapLayers = svgMap.getRootLayersProps(); // [].visible, .href
//		var rootDocPath = document.location.pathname;
//		var rootDocDirPath = rootDocPath.substring(0,rootDocPath.lastIndexOf("/")+1);
		var rootHtmlPath = document.location.href;
		var svgImagesProps=svgMap.getSvgImagesProps();
		var rootSvgPath = svgImagesProps["root"].Path;
		var rootSvgURL = new URL(rootSvgPath,location.href);
		var visLayers =[];
		for ( var i = 0 ; i < mapLayers.length ; i++){
			if ( mapLayers[i].visible ){
				var lId = mapLayers[i].id;
//				var rPath = svgImagesProps[lId].Path; // これが得られない問題・・
				var href = mapLayers[i].href;
				var title = mapLayers[i].title;
//				var absPath = rootDocDirPath+rPath;
				var layerURL = new URL(href, rootSvgURL);
//				var absPath = layerURL.pathname;
				var absPath = layerURL.href; // フルURLの方が統一感があって良いかも？　変数名がurlもしくはhrefの方が良いけど・・・
				visLayers.push({
					id: lId,
//					href: href, // これはrootLayerSVGがhtmlと同じディレクトリにないと相対パスが一致しなくなる(多分不要)
//					path: rPath, // こっちはそういうことがない(同上)
					absPath: absPath, // この値をindexedDBに保持する
					url: layerURL,
					title:title
				});
			}
		}
		return (visLayers);
	}
	
	// オートパイロット(バッチ)で必要なエリアの地図を取ってくる処理(元々autoDownloader.htmlにあったもの)
	// ISSUES:
	//  DLエリアから4分木分割で掘り進めていくので、maxZoomよりももっと大きな倍率まで行ってしまい非効率、逆の方が良い
	//  もうそれ以上の解像度がないならそこで掘り進めるのをやめるような処理があっても良い(そもそも2倍拡大でやっていくのはどうなのか。少しづつ拡大していき、コンテンツツリーが変化なければそれをスキップするとかでも良いかも(そのための準備工事はできてる(captureGISgeometries(しかもbitImageのurl付)))
	var autoPilotDownloader = (function(){
		// オートパイロット これは別モジュールで建てるかも？
		var currentLevelPos ; // 次に検索すべきエリアを演算するためのデータ。int[level]1次元整数(0..3まで)配列： 配列番号はタイルレベル、それぞれの値はそのレベルにおける４分木タイル番号(0..3) 0: 左下, 1:右下, 2:左上, 3:右上　なお、タイルレベルは、初期ビューボックスをレベル0と定義（グローバルタイルとは違う）
		var initialDLArea,minRootScale,maxRootScale;
		var zLevel;
		var zoomLevelLimitter = 8;
		var allSearching = false; // 現在一括検索中フラグ
		var progressCallBack = null;
		var completeCallBack = null;
		var downloadLayers =[];
		
		
		function searchAll(initViewBox, mnScale, mxScale){ // initViewBox DLする地理座標空間でのエリア、mxZoomBox最大倍率のエリア(widthしかつかってないからあとでそれにするかも) // このmnScale,mxScaleはrootのScaleなので・・・
			var mapLayersElement = svgMap.getLayers();
			var mapLayers = svgMap.getRootLayersProps(); // [].visible, .href
			var rootDocPath = document.location.pathname;
			var rootDocDirPath = rootDocPath.substring(0,rootDocPath.lastIndexOf("/")+1);
			svgImagesProps = svgMap.getSvgImagesProps();
//			var currentScale = getScales();
			downloadLayers =getVisibleLayers();
			console.log(" downloadLayers:",downloadLayers,"  svgImgProps:",svgImagesProps);
			initialDLArea = initViewBox;
			minRootScale = mnScale;
			maxRootScale = mxScale;
			if ( allSearching ){
				console.log("Another batch downloading process is running, exit.");
			}
			allSearching = true;
			zLevel = 2;
			if ( minRootScale && maxRootScale ){
				var zRange = maxRootScale / minRootScale ;
				var lvl = 1;
				while (zRange > 1 ){
					console.log("zRange:",zRange,"  lvl:",lvl);
					zRange = zRange / 2;
					++lvl;
				}
				if ( lvl < zoomLevelLimitter && lvl >=2){
					zLevel = lvl;
				}
			}
			document.addEventListener("zoomPanMap",APzoomPanListener,false);
			
			console.log("   geoVB:",initialDLArea,"    zoomLevel:",zLevel);
			currentLevelPos = [];
			var superParam = {};
			svgMap.captureGISgeometriesOption(true); 
			svgMap.captureGISgeometries(searchAllS2 , superParam );	
		}
		
		function searchAllS2(geom , superParam ){
			console.log("searchAllS2:",geom,  currentLevelPos , initialDLArea);
			console.log(currentLevelPos.length, zLevel);
			var hasPoiLowResI = true;
			if ( currentLevelPos.length >= zLevel){
				hasPoiLowResI = false;
			}
			
			if ( hasPoiLowResI ){
				console.log("レベルを上げる・・・・・・: Lv:",currentLevelPos.length+1);
				// レベルを上げる
				// setGeoViewPort( lat, lng, latSpan , lngSpan)..
				currentLevelPos.push(0);
				var subArea = getSubArea(currentLevelPos,initialDLArea);
				if ( progressCallBack ){
					progressCallBack("area width:" + subArea.width+"[deg]");
				}
				svgMap.setGeoViewPort( subArea.y, subArea.x, subArea.height , subArea.width);
			} else {
				if ( progressCallBack ){
					progressCallBack(getProgress(currentLevelPos) + "/100 completed.");
				}
				prepareNextArea(currentLevelPos);
			}
		}
		
		function prepareNextArea(currentLevelPos){
			if ( currentLevelPos.length > 0 ){
				if ( currentLevelPos[currentLevelPos.length-1] < 3 ){
					// 次のタイルに移動する
					currentLevelPos[currentLevelPos.length-1] = currentLevelPos[currentLevelPos.length-1]+1;
					var subArea = getSubArea(currentLevelPos,initialDLArea);
					svgMap.setGeoViewPort( subArea.y, subArea.x, subArea.height , subArea.width);
				} else {
					// そのレベルの探索は完了 上のレベルに戻す
					console.log("Complete this level :",currentLevelPos);
					var cl = currentLevelPos.length-1;
					currentLevelPos.splice(cl,1);
					prepareNextArea(currentLevelPos);
				}
			} else {
				// 処理終了
				console.log("Totally Completed...");
				csvAppendMode = false;
				if ( progressCallBack ){
					progressCallBack("Totally Completed!");
				}
				if ( completeCallBack ){
					completeCallBack(); // 返り値はとりあえず無い・・
				}
				registCachedLayerMeta(downloadLayers,initialDLArea, minRootScale, maxRootScale);
				document.removeEventListener("zoomPanMap",APzoomPanListener,false);
				allSearching = false;
				svgMap.setProxyURLFactory(null,null,false);
				svgMap.setGeoViewPort(initialDLArea.y,initialDLArea.x,initialDLArea.height,initialDLArea.width);
			}
		}
		
		var APzoomPanListener = function (event){ // オートパイロット駆動用のイベントリスナ
			console.log("APzoomPanListener");
			svgMap.captureGISgeometriesOption(true); 
			svgMap.captureGISgeometries(searchAllS2 );
		}
		
		function getSubArea(currentLevelPos,initialDLArea){
			console.log(initialDLArea);
			var x = initialDLArea.x;
			var y = initialDLArea.y;
			var w = initialDLArea.width;
			var h = initialDLArea.height;
			for ( var lvl = 0 ; lvl < currentLevelPos.length ; lvl++ ){
				w = w/2;
				h = h/2;
				tx = currentLevelPos[lvl] % 2;
				ty = Math.floor(currentLevelPos[lvl] / 2);
				
				x = x + tx * w;
				y = y + ty * h;
			}
			return {
				x:x,
				y:y,
				width:w,
				height:h
			}
		}

		function getProgress(currentLevelPos){
			var ans = 0;
			var mul = 1;
			for ( var i = 0 ; i < currentLevelPos.length ; i++ ){
				if ( i == currentLevelPos.length-1){
					ans += (currentLevelPos[i]+1)*25 / mul;
				} else {
					ans += currentLevelPos[i]*25 / mul;
				}
				mul = mul * 4;
			}
			return ( ans );
		}

		function setProgressCallBack(cbf){
			if (  typeof(cbf) == "function"){
				progressCallBack = cbf;
				return ( true );
			} else {
				progressCallBack = null;
				return ( false );
			}
		}
		
		function setCompleteCallBack(cbf){
			if (  typeof(cbf) == "function"){
				completeCallBack = cbf;
				return ( true );
			} else {
				completeCallBack = null;
				return ( false );
			}
		}
		
		function halt(){
			document.removeEventListener("zoomPanMap",APzoomPanListener,false);
			if ( allSearching ){ // 一括検索時には表示レイヤとビューポートをもとに戻す
				allSearching = false;
				svgMap.setGeoViewPort(initialDLArea.y,initialDLArea.x,initialDLArea.height,initialDLArea.width);
			}
			if ( progressCallBack ){
				progressCallBack("Halted!");
			}
		}
		
		return {
			halt: halt,
			searchAll: searchAll,
			setProgressCallBack: setProgressCallBack,
		}
	})();
	
	function getScales(){
		if ( !svgImagesProps ){
			svgImagesProps = svgMap.getSvgImagesProps();
		}
		var scales={};
//		var scaleDiv ={};
		for ( var layerId in svgImagesProps ){
			scales[layerId] = svgImagesProps[layerId].scale;
//			scaleDiv[layerId] = svgImagesProps[layerId].scale / svgImagesProps["root"].scale;
		}
//		console.log("scales:",scales,"  scaleDiv:",scaleDiv);
		return ( scales );
	}
	function getRootScale(){
		if ( !svgImagesProps ){
			svgImagesProps = svgMap.getSvgImagesProps();
		}
		return ( svgImagesProps["root"].scale );
	}
	
	return { // svgMapPWA. で公開する関数のリスト
		autoPilotDownloader: autoPilotDownloader,
		clearOfflineContents: clearOfflineContents, // こっちはSVGMapコンテンツ
		clearCache:clearCache, // こっちはそれ以外のhtmlやjsなど(serviceWorkerのネイティブのキャッシュ機構)
		cacheDB: cacheDB,
		deleteCachedLayerMeta: deleteCachedLayerMeta, // バッチ（オートパイロット）によるキャッシュレイヤーのメタデータアクセス
		disableCache: disableCache, // これはserviceWorkerのネイティブのキャッシュ機構とIndexedDBのキャッシュ機構を丸ごとDisableする
		enableCache: enableCache, // 同Enable
		getCachedLayerMeta: getCachedLayerMeta, // バッチ（オートパイロット）によるキャッシュレイヤーのメタデータアクセス
		getPostQueue: getPostQueue,
		getRootScale: getRootScale, // svgMap.jsのルートコンテナ座標とスクリーン座標との間のスケールを返却する
		getScales: getScales, // 読み込み済み文書全てのスケールを返す(hashKeyはdocID)
		getVisibleLayers: getVisibleLayers,
		getStorageUsage: getStorageUsage, // safariはサポートしてないようです・・
		loadOfflineContents: loadOfflineContents,
		loadZippedOfflineContents: loadZippedOfflineContents,
		postMessageWhenConnected: postMessageWhenConnected,
		sendMessage: sendMessage, //tmp
		setCachedLayerMeta: setCachedLayerMeta, // バッチ（オートパイロット）によるキャッシュレイヤーのメタデータアクセス
		setScaleTrim: setScaleTrim,
		updateCacheIndex: updateCacheIndex,
	}
})();
	
	window.svgMapPWA = svgMapPWA;
})( window );

