var corsProxy = (function(){
	var proxyUrl="";
	var anonProxy = false;
	var directURLlist = [];
	var noEncode=true;
	function setImageProxy( pxUrl , directURLls , useAnonProxy, requireEncoding){
		if ( requireEncoding ){
			noEncode = false;
		}
		proxyUrl = pxUrl;
		if ( directURLls ){
			directURLlist = directURLls;
		} else {
			directURLlist = [];
		}
		if ( pxUrl.indexOf("http")==0){
			var pxDomain = pxUrl.substring(0,pxUrl.indexOf("/",8));
			directURLlist.push(pxDomain);
		}
		
		if ( useAnonProxy ){
			anonProxy = true;
		} else {
			anonProxy = false;
		}
	}
	
	function isDirectURL(url){
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
	
	function getImageURL(imageUrl){
		// ローカル（同一ドメイン）コンテンツもしくはそれと見做せる(directURLlistにあるもの)もの以外をproxy経由のURLに変換する
		// proxyの仕様は、 encodeURIComponent(imageUrl)でオリジナルのURLをエンコードしたものをURL末尾(もしくはクエリパート)につけたGETリクエストを受け付けるタイプ
		if ( proxyUrl && imageUrl.indexOf("http") == 0){
			if (isDirectURL(imageUrl)){
				// Do nothing (Direct Connection)
			} else {
				if ( noEncode ){
					imageUrl = proxyUrl + (imageUrl);
				} else {
					imageUrl = proxyUrl + encodeURIComponent(imageUrl);
				}
//				console.log("via proxy url:",imageUrl);
			}
		} else {
			// Do nothing..
		}
		return (imageUrl);
	}
	return {
		setService:setImageProxy,
		getURL:getImageURL,
	}
})();
