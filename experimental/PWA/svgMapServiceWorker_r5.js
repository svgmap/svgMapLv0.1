// SVGMap.jsをPWA化するためのservice Worker
// iOSの50MBcache制限などに対応したり、より高度な制御を行うために、cacheではなくindexedDBに地図コンテンツは格納する
// Copyright 2020 by Satoru Takagi All Rights Reserved
// License: GPL3
//
// 2020/04/21 : start-
// 2020/04/22 : 最初の動作
// 2020/04/23 : 最初にアクセスしたものをindexedDBのキャッシュする機構　＆同機構の設定解除機能
// 2020/05/07 : messageによるやり取りを精密化した
// 2020/05/26 : processPostMessageを汎化
// 2020/05/27 : fetchイベントに伴うキャッシュメカニズムを改善
// 2020/06/01 : iOS safariの動作不具合(地図タイルが使われないことに端を発し、setBaseResourcesでグローバル変数が設定されていないことが原因の模様)をパッチ充てられたかも。
// 2020/06/04 : SVGMap独自キャッシュのスコープをservice workerのスコープから独立させた(完全に　baseResources.jsonのmapCacheTargetに沿うようになった)

// インストール時にロードさせるリソース
// 注意: このリストのリソースがないとそこで止まってしまうようです・・
var baseResources = [];
/**
var baseResources = [
"./", 
"index.html",
//"svgMapServiceWorker_r2.js", // これは入れると更新が効かずまずそう？
"SVGMapLv0.1_PWA_r4.js",
"js/SVGMapLv0.1_r16.js",
"js/SVGMapLv0.1_LayerUI2_r3.js",
"js/SVGMapLv0.1_GIS_r2.js",
"js/SVGMapLv0.1_Authoring_r7.js",
"js/jsts.min.js",
"imgs/gps.png",
"imgs/gps_s.png",
"imgs/Xcursor.png",
"imgs/zoomdown.png",
"imgs/zoomdown_s.png",
"imgs/zoomup.png",
"imgs/zoomup_s.png",
"Container_mercator_org.svg"
];
**/

var mapCacheTargetPath="svgmap.org/devinfo/devkddi/lvl0.1/svgMapPWA";

// この関数をcache.addAllの前に呼び出す必要がある iOS safariでは、これがまともに機能していない。
async function setBaseResources(){
	try{
	var response = await fetch("./baseResources.json");
	var rjson = await response.json();
	if ( rjson.src){
		baseResources = rjson.src;
	}
	if ( rjson.mapCacheTarget){
		mapCacheTargetPath = (new URL(rjson.mapCacheTarget, location)).pathname;
		// mapCacheTargetPath = rjson.mapCacheTarget; // これが設定されないための不具合だった・・・ iOS safari
	}
	return(rjson);
	} catch ( err ){
		// do nothing...
	}
}


self.addEventListener('install', function(event) {
	console.log('[ServiceWorker] Install');
	event.waitUntil(
		caches.open('v1')
		.then(async function(cache){
			var json = await setBaseResources();
			console.log("BaseResourcesJson:",json);
			return (cache);
		})
		.then(function(cache) {
			console.log("baseResources:",baseResources);
			return cache.addAll(baseResources); // iOS safariもこれでbaseResourcesがキャッシュは読み込まれているようだが、workerのグローバル変数がなくなるように見える
		})
		.then(self.skipWaiting.bind(self)) // control clients ASAP
	);
});

setBaseResources(); // iOS safari: そのため、これをもう一度起動時に呼び出すようにした・・ オフライン状態での立ち上げではダメか indexedDBからの読み込みフォールバック必要かも？

self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activate');
	console.log("Caches:",caches);
	// https://stackoverflow.com/questions/38168276/navigator-serviceworker-controller-is-null-until-page-refresh
	// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
	self.clients.claim(); 
});

/**
self.addEventListener('fetch', function(event) {
	console.log("get fetch event:",event);
});
**/

// キャッシュ(といってもindexedDB)の戦略のパターン
var deafultCacheMode="cacheFirst";
var cacheMode = deafultCacheMode;
// "no": 使わない(ネットワークのみ)
// "networkFirst": 未実装 ネットワークが切れてたらキャッシュデータを返答する。切れてなければネットワークデータを返答し、キャッシュも更新する
// "cacheFirst": キャッシュがあればキャッシュを返答する、なければネットワークデータを返答し、キャッシュを更新する
// "cacheFirstButUpdate": 未実装 キャッシュがあればキャッシュを返答する、ネットワークが切れてなければ、キャッシュを更新する（ただしこれを返答には使わない）

self.addEventListener('fetch', function(event) {
	var reqURL =  new URL(event.request.url);
	console.log("fetch",reqURL);
	var dbgMsg = "Fetch:"+reqURL +":";
//	sendDebugMessage("Fetch:"+reqURL);
	switch (cacheMode){
	case "cacheFirst": // cacheFirstモード(デフォルト)
//		if ( reqURL.href.indexOf(mapCacheTargetPath)>0){} // なんかこの処理どう書こうか・・・
		if ( reqURL.href.indexOf(registration.scope)>=0){ // まずservice worker自身のスコープ内にあるかを確認し、
			event.respondWith( async function(){
				var response = await caches.match(event.request,{ignoreVary:true});
				if ( response ){ // ネイティブキャッシュにあればそれを返す
					console.log("response by Cache:",reqURL.href);
//					sendDebugMessage ( dbgMsg+" nativeCache");
					return (response);
				} else if ( reqURL.href.indexOf(mapCacheTargetPath)>0){ // mapCacheTargetPathがiOS safariで設定されておらず不具合出てた(fixed)
					return ( await respondAndStoreSvgMapCache(event, reqURL) );
				} else { // 独自マップスコープを外れたスコープ内のコンテンツは、無条件で可能ならfetchし、キャッシュに入れることなく返却する
//					sendDebugMessage ( "is in scope?:"+reqURL.href.indexOf(mapCacheTargetPath)+"  req:" + reqURL.href + " mctp:" + mapCacheTargetPath+"  br.len:"+baseResources.length);
					console.log("Skip servie worker cache: unmatch native cache and local Map: force fetch:",reqURL.href);
					var fetchedResponse = await fetch(event.request);
//					sendDebugMessage ( dbgMsg+" only fetch");
					return (fetchedResponse);
				}
			}());
		} else { // service workerスコープ外は・・
			if ( reqURL.href.indexOf(mapCacheTargetPath)>0){ // SVGMap独自キャッシュ機構はservice wworkerとは独立したキャッシュスコープを持てることにする
				event.respondWith( async function(){
					return (await respondAndStoreSvgMapCache(event, reqURL));
				}());
			} else { // それにも入っていなければ当然スルー
				// スルー（ネイティブの取得機構に任す）
				console.log("Skip servie worker: unmatch href:",reqURL.href);
//				sendDebugMessage ( dbgMsg+" ummatch href scope skip SW");
			}
		}
		break;
	default: // それ以外ではスルー（ネイティブの取得機構に任す）
		console.log("Skip servie worker: cacheFirst false:",reqURL.href);
//		sendDebugMessage ( dbgMsg+" totally skip SW");
		// pass
	}

});

// SVGMap独自キャッシュメカニズムのレスポンス生成関数
async function respondAndStoreSvgMapCache(event, reqURL){
//		sendDebugMessage ( "is in scope?:"+reqURL.href.indexOf(mapCacheTargetPath)+"  req:" + reqURL.href + " mctp:" + mapCacheTargetPath+"  br.len:"+baseResources.length);
	var dbRes = await getIndexedDbCacheResponse(reqURL.href);
	if ( dbRes ){ // キャッシュにあれば返却
		console.log("response by indexedDB:",reqURL.href);
//		sendDebugMessage ( dbgMsg+" HIT indexedDB");
		return ( dbRes );
	} else { // なければネットからのfetchを試み、結果をIndexedDBに投入するとともにクライアントに返す
		console.log("response by fetch and store indexedDB:",reqURL.href);
		var fetchedResponse = await fetch(event.request)
		store2IndexedDbCache(reqURL.href,fetchedResponse.clone());
//		sendDebugMessage ( dbgMsg+" try fetch store iDB");
		return (fetchedResponse);
	}
}

self.addEventListener('message', function(e){
	var clientId = e.source.id 
	console.log("getMessage:",e.data,"   messageSourceID:", clientId );
	if ( e.data.cacheMode ){
		switch (e.data.cacheMode){
		case "cacheFirst":
		case "no":
			cacheMode = e.data.cacheMode;
			break;
		default:
			cacheMode = deafultCacheMode;
		}
	} else if ( e.data.req == "clientId"){
		console.log("sendMessage clientId:",clientId);
		sendMessage({req:"clientId",ser:e.data.ser,content:clientId}); // 2020/5/7
	}
});

self.addEventListener('sync', async function(event){ // SyncManagerはiOS Safariでは動かないし、さらにFormDataもsafariはservice workerで動かないので、遅延ポスト機能をservice workerで動かさず、全部メインのjsに組み込んでみることにする。
	console.log("Got sync event on service worker:",event,"  syncSource:", event.source ); // どのWindowがこのイベントを登録したのかわからないの？？？
	if (event.tag.indexOf('outbox:')==0) {
		var postId = parseInt(event.tag.substring(7));
		var now = new Date();
		console.log('Worker: sync is signaled.(オンラインになりました)', now,"  for id:",event.tag.substring(7));
		event.waitUntil(processPostMessage(postId));
	}
});


async function processPostMessage(postId){
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
	await sendMessage({req:"postResponse", ser:postId, content:responseText},clientId); // 2020/5/7
//	return ( responseText );
}

async function sendMessage(message, clientId){
	// clientIdがある場合はそのクライアントにだけメッセージする
	// https://www.loxodrome.io/post/tab-state-service-workers/ 特定のclientにだけメッセージを送る方法・・
	var clients = await self.clients.matchAll();
	console.log("sendMessage clients:",clients,"  message:",message);
	clients.forEach(function(client){
		console.log("client.id:",client.id);
		if ( clientId ){
			if (clientId==client.id){
				client.postMessage(message);
			}
		} else {
			client.postMessage(message);
		}
	});
}

function sendDebugMessage(txt){
	sendMessage(txt);
}

async function store2IndexedDbCache(cUrl,response){
	await cacheDB.connect(DBNAME, VERSION);
	var cBlob = await response.blob();
	await cacheDB.put({idCol:cUrl,contentBlob:cBlob});
//	console.log("save to indexedDB: URL:",cUrl,"  blob:",cBlob);
}

async function getIndexedDbCacheResponse(key){ // async関数で構築したResponse　自分的にはこっちのほうが作りやすい
	var imageBlob = await getIndexedDbCache(key);
	if ( imageBlob ){
		var res = new Response(imageBlob);
		return ( res );
	} else {
		return ( null );
	}
}

var DBNAME="svgMapCacheDB";
var VERSION=1;
var DOCNAME="localContents";
var IDNAME="idCol";

async function getIndexedDbCache(key){
	await cacheDB.connect(DBNAME, VERSION);
	getObj = await cacheDB.get(key);
	if ( getObj ){
		var imageBlob = getObj.contentBlob;
//		console.log("getObj at service worker: imageBlob:",imageBlob," key:",key);
		return ( imageBlob);
	} else {
		return ( null );
	}
}



var svgMapPwaCacheDbName = {dbName:"svgMapPwaCacheDB",tableName:"localContents"}; // IndexedDBによるコンテンツキャッシュのDBのDB,Table名
var svgMapPwaPostDbName = {dbName:"svgMapPwaPostDB",tableName:"postQueue"}; // 遅延(NW接続時)POSTのためのDBのDB,Table名

var cacheDB = getDB(svgMapPwaCacheDbName); // コンテンツキャッシュDB(キャッシュ)オブジェクトをつくる
var postDB = getDB(svgMapPwaPostDbName); // 遅延POSTのためのキャッシュDBオブジェクトをつくる

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
			const req = indexedDB.open(dbname, version);
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
		connect: connectDB,
		clear: clear,
		delete: deleteRecord,
	}
};
