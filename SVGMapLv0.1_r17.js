// 
// Description:
//  Web Mapping Framework based on SVG
//  SVG Map Level0.1 Implementation
//  evolved from SVG Map Level0
//  
// Programmed by Satoru Takagi
//  
// Copyright (C) 2012-2019 by Satoru Takagi @ KDDI CORPORATION
//  
// Contributors:
//  jakkyfc
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
// 2016/10/03 : Rev.12:UIモジュール化リファクタリング開始： Authoring tools除去
// 2016/10/04 : レイヤーツール除去開始
// 2016/10/06 : getSwLayersとcheckLayerSwitchの問題点解消、getRootLayersProps()追加(layer UI分離準備工事)
// 2016/10/11 : レイヤーツール分離
// 2016/10/14 : レイヤー固有UIハンドラ svgImagesProps.controller [URL(html||png||jpg)]
// 2016/10/26 : 操作状況などのcookie保存復帰機能(resume) 
// 2016/11/29 : Rev.13:(GIS Extension)開発開始。 パーサがSVGMapコンテンツからgeoJSON(ライクな)データ構造を出力できる機能をまず持たせたい。次にそれを使って、地理空間情報処理関数をサービスする(別建ての)フレームワークを提供できるようにしたい。
// 2016/12/16 : GIS Extension基本構造完成。GeoJSON生成
// 2016/12/21 : Rev.14:(Authoring Tools)開発開始。まずはRev11で切り出したPOI Editorを外部フレームワークとして移植。
// 2016/12/27 : ポリゴン・ポリライン・Pathオーサリングのためのヒットテスト実装
// 2017/01/17 : defs下の<g>に2Dベクタグラフィックス要素群があるものをuseできる機能と、その場合にuse側にmetadataがあってもmetadataをヒットテストで取得できる機能を実装
// 2017/01/18 : path A, circle ellipseなどでVE non scaling効くようにした
// 2017/01/25 : カスタムなモーダルダイアログAPI、POI&2D ObjのProp表示機能をフレームワーク化(setShowPoiProperty)し、レイヤ固有表示(しなくても良い)機能も実装可能とした。
// 2017/02/17 : 野良XMLではIDは機能しない(単なるid attrにすぎない)？。そのためgetElementByIdも機能しない。そこで、querySelectorを使用した代替物を構築。要注意なのは、単なるattrなので、idが重複していようがお構いなしになる・・
// 2017/03/08 : URLフラグメントで、表示領域、表示レイヤ(レイヤタイトルによる)、非表示レイヤ(同)を指定可能に
//              表示非表示レイヤはカンマ区切りで複数指定可能,またレイヤ名にハッシュをつけて文字列を入れると、そのレイヤーのsvgコンテナのlocation.hashにそれが追加される(その際"="は"%3D",&は"%26"でエンコード必要)
//              ex:http://svg2.mbsrv.net/devinfo/devkddi/lvl0.1/developing/SVGMapper_r14.html#visibleLayer=csv textArea#hello%3D2%26good%3Dday&hiddenLayer=csv layer#hellox%3D2x%26goodx%3Ddayx&svgView(viewBox(global,135,35,1,1))
// 2017/03/16 : イベントを精密化 zoomPanMapはviewPort変化時のみ、 screenRefreshedを新設しこちらはvp変化しなかったとき　これでrefreshScreen()に纏わる無限ループリスクを抑制した。
// 2017/08/14 : centerSightを用いたオブジェクト選択機能を拡張し、POIもベクタもtickerに複数出現・選択可にする　ただしうcheckTicker()での二重パースの課題あり
// 2017/08/15 : iOS safariでgeolocationAPIがなぜか動かないので・・パッチ
// 2017/08/16 : URLフラグメントのvisibleLayer,hiddenLayerに、ワイルドカード"*"を指定可能に
// 2017/08/17 : 動的レイヤーのF/Wの大BUGを改修(svgMapの内部関数が露出していた・・・)
// 2017/08/22 : Property表示パネルにタイトル表示可能に
// 2017/08/?? : ページのhashが変更された場合、それに追従する。
// 2017/08/?? : svgImagesProps[].metaSchema, .script.transform,getCanvaSize,geoViewBox,location
// 2017/08/?? : レイヤーリストUIのサイズが収まるようにする
// 2017/09/29 : ルートにあるレイヤー限定だが、anim要素にdata-nocache（常に更新）属性での処理追加
// 2018/01/18 : checkTicker()での二重パース防止処理　これでようやくまともな路線に復帰したと思う　そろそろrev15正規リリース近いか？
// 2018/01/18 : from rev14 update: 2017/08/21 : defaultShowPoiPropertyをリッチなUIへ変更
// 2018/01/18 : from rev14 update: 2017/08/25 : Bug Fixed. ZoomUp/ZoomDownボタンが未定義の際、エラーで停止しない様変更
// 2018/01/18 : from rev14 update: 2017/08/25 : updateCenterPosをユーザが書き換えることができるよう変更
// 2018/01/18 : from rev14 update: 2017/08/29 : smoothZoomInterval,smoothZoomTransitionTimeを設定できるよう変更,getVerticalScreenScaleを外部よりcallできるよう公開
// 2018/01/17 : add parseEscapedCsvLine(),gpsCallback(),getTickerMetadata(),checkSmartphone(),reLoadLayer()
// 2018/01/29 : from rev14 update: レイヤーのパスを指定する際ドメインなしのフルパスで指定できるよう変更
// 2018/01/29 : from rev14 update: data-controllerをルートコンテナのレイヤー要素から指定できるよう機能追加
// 2018/02/02 : オブジェクトクリック機能のリファクタリング：testClickの機能とgetObjectAtPointをrev15で大幅拡張したtestTickerに統合 testClick, POItargetSelectionはこれにより不要となったので廃止、これに伴いPOI(img要素)に設置していた testClick EventListenerを全撤去
// 2018/02/05 : Rev15 Release クリーンナップ
// 2018/02/23 : <text>の改善
// 2018/02/26 : captureGISgeometriesでビットイメージタイル"Coverage"も取得可能とした　ただし、captureGISgeometriesOptionで設定した場合
// 2018/03/02 : useではなく直接imageで設置したnonScaling bitImageもPOIとして扱うようにした　結構大きい影響のある改修
// 2018/04/06 : Edge対応ほぼ完了したかな これに伴いuaProp新設　今後isIE,verIE,isSPをこれに統合したうえで、IE10以下のサポートを完全に切る予定
// 2018/06/01 : script実行ルーチンのデバッグ
// 2018/06/15 : script実行ルーチンのデバッグ
// 2018/06/19 : script実行ルーチンのデバッグ
// 2018/08/01 : TreatRectAsPolygonFlag
// 2018/09/04 : ビットイメージ(image要素)にstyle.imageRendering pixelated実装 ヒートマップなどを最小ファイルサイズ構築するためのもの(一応Edgeも対応*4Edge　今後このルーチンはEdge対応次第で廃止する)
// 2019/03/12 : authoring tools editing 判別小修整、imageRendering->image-rendering 修正
// 2019/04/16 : getHitPoint なるべく端を使わないように改良
// 2019/05/17 : captureGisGeometries()のCoverageのtransform対応
// 2019/10/20 : ビットイメージのDataURL有効化
// 2019/11/14 : refreshScreen()の排他制御導入
// 2019/11/14 : ビットイメージにもキャッシュ不使用オプション有効化
// 2019/11/14 : editableレイヤーでも、レイヤ非表示にしたら、DOMを消去することに仕様変更
// 2019/12/26 : refreshScreen()の効率化 主にcaptureGisGeometries()->vectorGISの高性能化を図るため
// 2020/01/30 : ラスターGISの高速化等を行うため、bitimageについてもproxy経由で取得させる機能を実装(svgMap.setProxyURLFactory)
// 2020/02/13 : ERR404やGETに時間がかかり過ぎたときのエラーアウト処理を強化(LayerUIも)
// 2020/03/26 : Rev16 データがLatLngで表示がメルカトルの表示モードを実装
// 2020/05/20 : DevicePixelRatioをレイヤーごとに設定できる機能を実装（PWAでオフラインモード時、DLしていないズームレンジで白紙表示になるのを抑制する目的を持っている）
// 2020/06/09 : svgImagesProps[layerID].preRenderControllerFunction, preRenderSuperControllerFunction, svgMap.setPreRenderController() そのレイヤーの描画前(svgの<script>要素のonzoom,onscroll関数と同じタイミング)に同期的に呼び出す関数(eval撤去準備工事) (なお、preRenderControllerFunctionは、レイヤ固有UIのscriptで予約関数名preRenderFunctionを定義するだけでも設置される
// 2020/08/14 : データのほうがメルカトル図法のモノを扱えるようにした。dynamicWebTile_pureMercator.svg参照
// 2020/08/14 :↑で準備できたのでメルカトル図法のビットイメージをPlateCareeに（その逆も）することを可能にしてみたい実装を開始
// 2020/08/19 : child2canvasもしくはchild2rootが非線形の(.transform,.inverseがある)場合、そのimgae要素のビットイメージを非線形変換する機能を発動させる。というのが基本路線だね。これにはcanvasへの読み込みとピクセルアクセスが多分必要なので、proxy経由でのimage取得が必要かな。
// 2020/10/23 : 3/26からのメルカトル図法サポート機能を汎化し、ユーザがscriptやdata-controllerで任意の図法を関数定義可能な機能を実装。これでMaps4WebWSで宣言していた機能要件を満たすことができた。
// 2021/01/26 : Rev16本流に載せる　効率化＆いくつか検証もできたため ～　16.xはこれにて終了　16とする
// 2021/04/02 : Rev17 cookie->localStorage, now loading の抑制, root documentをlocalStorageの設定をベースにした編集後のものを投入可能に　など, レイヤ構成編集用のツールを別フレームワークで用意(こちらはレイヤ編集用ページ別建てか？)
// 2021/06/14 : getLoadErrorStatistics() timeout等のロードエラーの統計
// 2021/08/10 : image要素 data-mercator-tile="true"サポート
// 2021/09/06 : image要素 style:filterサポート (なお、このスタイルの継承はしない・・)
//
// Issues:
// 2020/09/11 ビットイメージとベクターの混合レイヤーで、上下関係がDOM編集によっておかしくなることがある～digitalTyphoonレイヤーに風向を追加したとき、風速イメージのimage要素を消去して再追加する処理をすると（モデルを変えるときにそういう処理が入る）、最初は下にイメージが表示されるが、差異追加後上に来てしまう。　この辺昔imageはなるべく上にくるようにした記憶もあるので、いろいろ怪しい感じがする。
// 2018/09/07 .scriptが　そのレイヤーが消えても残ったまま　setintervalとかしていると動き続けるなど、メモリリークしていると思う　やはりevalはもうやめた方が良いと思う・・
// 2018/6/21 SvgImagesProps　もしくは　rootLayersProps?にそのレイヤのデータの特性(POI,Coverage,Line etc)があると便利かも
// 2018/6/21 もはやXHRでsvgを取得するとき、XMLとして取得しないほうが良いと思われる(独自の編集後にwell formed XMLとして扱っているので)
// 2018/3/9 メタデータのないPOIが単にクリッカブルになる。またvectorPOIはclickableクラスを設定しないとクリッカブルでないなどちょっとキレイでない。
// 2018/3/5 FIXED Vector2DのcircleがcaptureGISで正しい値が取れてない？
// 2018/3/5 visibility hiddenのVector2Dがヒットテストにかかってしまうらしい？imageも要確認
// (probably FIXED) 2016/06 Firefoxでヒープが爆発する？(最新48.0ではそんなことはないかも？　たぶんfixed？)
// 2016/12 ほとんどすべてのケースでtransformが使えない実装です (transform matrix(ref))とか特殊なものとCRSのみ
// 2016/12 FIXED EdgeでOpacityが機能してない(たぶんIE専用Opacity処理が影響してると思う・・・)
// (probably FIXED) 2016/12 Resumeのレイヤ選択レジュームが遅い回線で動かない(非同期の問題か)
// (probably FIXED) 2016/12 初回ロード時のhtml DOMクリーンナップができていない
// 2017/01 FIXED? Authoring Tools Ext.で編集中にResumeが動かない
// 2017/01 FIXED? レイヤーがOffになっているときに、レイヤ特化UIが出たまま(これは本体の問題ではないかも)
// 2017/02 FIXED? getElementByIdNoNSの問題が再び。　plane XMLとなっている文書では、IEもgetElementById使えない。.querySelector('[id="hoge"]'));は使えるので・・・対策したが、そもそもXML:IDの機能(重複しないID)を満たした機能を提供していない
// 2017/08 FIXED? ズームアップボタンを連打すると拡大アニメが崩れる？(Firefox 54.01 only? グラフィックスバッファのオーバーフローか?)
// 2017/08 FIXED centerSightのオブジェクト検索(の特に2D Vector)がスクロール＆レンダリング後必ず動くようになった。(checkTickerが起動)これは全ドキュメントのパース処理を伴い、レンダリングとダブっていて重い・非効率と思う・・　あらかじめhitPointを指定してレンダリングとオブジェクト検索を一回のループで実現できないだろうか？
// 2017/09 FIXED LandSlideのベクトルが表示された状態で、最初のパース後透明度が設定されてない　もしくは二重書き？　Active Faultでも同じだった　二重書きの様子が濃厚
// 2017/08/29 FIXED ERR404が発生すると、その後レイヤーのON/OFFしても伸縮スクロールしない限り表示がされないなど　動きがおかしく
//
// ToDo:
// 各要素のdisplay,visibilityがcss style属性で指定しても効かない
// 動的レイヤーで重ね順が破綻する(see http://svg2.mbsrv.net/devinfo/devkddi/lvl0/locally/nowcastHR/)
// レイヤーグループ機能(方式も含め要検討)
// レイヤーごとのUI, レイヤーごとの凡例等
// IE < 11実装の除去
// POIや2Dベクタをクリックしたとき、レイヤ文書に対して、イベントを飛ばしてあげると良いと思う
// refreshScreen()でgeoGeomを取得するというパターンはあるが、zoom/pan時にもそれができるともう一段効率化するかも？(ただかなりいろいろ非同期処理が絡むので・・・2019/12
// 
// devNote:
// http://svg2.mbsrv.net/devinfo/devkddi/lvl0.1/airPort_r4.html#svgView(viewBox(global,135,35,1,1))
// isPointInPath plolygonのばあいはそのまま、lineの場合は、このルーチンで生成したpathHitPoitnに小さなポリゴン(rect)を生成し、そこだけで、hittestする　これならばHTMLDOMへの影響が無いので、改修範囲が広範囲にならないかと思う。
// testClickedは何のためのもの？ 2018.2.2 のtestClickの廃止とともにこの変数及びセッター関数も廃止した
// 
// 重複が疑われる関数  (getSymbolProps, getImageProps)
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
var commonDevicePixelRatio = 1.0; // zoom計算時のみに用いる たとえば２にするとzoom値が本来の２分の１になる(2014/07/16)
var layerDevicePixelRatio = []; // 2020/5/13 レイヤーIDの連想配列 レイヤーごとの値(commonDevicePixelRatioにさらに掛け算で効く)

var summarizeCanvas = true; // added 2014.5.27 レイヤ単位でcanvas2dを統合

var loadingTransitionTimeout = 7000; // LODの読み込み遷移中のホワイトアウト防止処理や。XMLロード処理のタイムアウト[msec]（この時間を超えたらbitImageもSVGdoc(2020/2/13)もスキップする


var mapx=138;
var mapy=37;
var mapCanvas; // 地図キャンバスとなる、おおもとのdiv要素
var mapCanvasSize; // そのサイズ

var isIE = false; // IE11で互換性があがったので、ロジックにいろいろと無理が出ています・・
var isSP = false; // スマホの場合設定される
var verIE = 100; // IEの場合にそのバージョンが設定される。それ以外は100...　そろそろ IE10以下をObsoluteする予定
var uaProp; // 上の三つのパラメータをそろそろ整理統合しようと思っています Edge対応に際して導入 2018/4/6

var resume = false; // 2016/10/26 resume機能
var resumeSpan = 3; // resumeの有効期限 (日) 2021/3 rev17で無効化する予定

var rootViewBox; // aspectを加味し実際に開いているルートSVGのviewBox
var rootCrs; // ルートSVGのCRS ( geo->rootのsvg ) 2020/3/17 matrixだけでなく関数(当初はメルカトル変換)(transform(geo->mercatorRoot),inverse(その逆))になるケースがある
var root2Geo; //上の逆 ( rootのsvg - > geo ) 2020/3/17 transform関数が入るケースがある
var geoViewBox = { x:0, y:0, width:1, height:1}; // と、それを使って出したgeoのviewBox


var svgImages = new Array(); // svg文書群(XML) arrayのハッシュキーはimageId("root"以外は"i"+連番)
var svgImagesProps = new Array(); // 同svg文書群の .Path,.CRS,.script,.editable,.editing,.isClickable,.parentDocId,.childImages,.controller,.metaSchema

var ticker; // Ticker文字のdiv要素
var tickerTable; // 同 table要素

var ignoreMapAspect = false; // 地図のアスペクト比を、rootSVGのvireBox( or hashのviewBox)そのものにする場合true

var visiblePOIs = new Array(); // 現在画面上に表示されているPOI(imgアイコン)のリスト(idのハッシュ 内容はx,y,width,height)


var builtinIcons={
	setting:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEVrZXIAAABXsNZ8AAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAuSURBVAjXY2BsYBDyYNAKYXBRYlBgYRDsYEhyY2hRBCEgA8gFCgKlgAqAyhgbALVHB5MYHdneAAAAAElFTkSuQmCC",
	xcursor:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPAgMAAABGuH3ZAAAACVBMVEVlAGsAAAC6AADU707yAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAhSURBVAjXY2BgdWBgYGDDQYSGhYYwZK1atQTCwqkOZAoANmIIUX/U/KkAAAAASUVORK5CYII=",
	hamburger:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEVlAGRCQkJgmRPnAAAAAXRSTlMAQObYZgAAABJJREFUCNdjYAAD+z8gBAe4uQCvKQdj5EQSJQAAAABJRU5ErkJggg==",
	hamburgerEdit:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEVkAFb/AABCQkIPrhq8AAAAAXRSTlMAQObYZgAAACJJREFUCNdjYIADrlWrFkAINIApEQLEjKFAsZVQAirGwAAA4sIMW9pBuDwAAAAASUVORK5CYII=",
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

addEvent(window,"hashchange",function(){
	resumeFirstTime = true;
	refreshScreen();
	if ( typeof updateLayerListUIint == "function" ){ // レイヤリストUIが不整合起こす場合がある(レイヤをon/of指示するケース)。さらにそれに連動してUI自動起動も起きない
		setTimeout(updateLayerListUIint,300);
	}
});

function initLoad(){
// load時に"一回だけ"呼ばれる
//	console.log("fragment:" , location.hash, "\n" ,getFragmentView(location.hash));
//	console.log("url:     " , document.URL);
//	console.log("location:" , document.location);
//	console.log("loc.href:" , document.location.href);
	
	if ( uaProp){
		console.log( "Already initialized. Exit...");
	}
	
	mapCanvas=document.getElementById("mapcanvas");
	if ( !mapCanvas ){
		console.log("NO id:mapcanvas div exit..");
		return;
	}
	var rootSVGpath;
	if ( mapCanvas.dataset.src ){
		// data-src属性に読み込むべきSVGの相対リンクがある 2017.3.6
		rootSVGpath = mapCanvas.dataset.src;
	} else if ( mapCanvas.title ){
		// title属性に読み込むべきSVGの相対リンクがあると仮定(微妙な・・) 最初期からの仕様
		rootSVGpath = mapCanvas.title;
	} else{
		console.log("NO id:mapcanvas data-src for root svg container exit..");
		return;
	}
	
	
//	console.log("AppName:",navigator.appName,"  UAname:",navigator.userAgent);
//	if ( navigator.appName == 'Microsoft Internet Explorer' && window.createPopup )
	if ( navigator.appName == 'Microsoft Internet Explorer' || navigator.userAgent.indexOf("Trident")>=0 ){ //2013.12
		isIE = true;
		configIE();
	}
	isSP = checkSmartphone();
	uaProp = checkBrowserName();
//	console.log("isIE,verIE,isSP,uaProp:",isIE,verIE,isSP,uaProp);
	
	
	mapCanvas.title = ""; // titleにあると表示されてしまうので消す
//	console.log(mapCanvas);
	
	setPointerEvents();
	
	mapCanvasSize = getCanvasSize();
	if (!mapCanvasSize){
		console.log("retry init....");
		uaProp = null; 
		setTimeout(initLoad,50);
		return; // どうもwindow.openで作ったときに時々失敗するので、少し(30ms)ディレイさせ再挑戦する
	}
	
	initNavigationUIs(isSP);
	
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
			if ( evt.touches.length > 0 ){
				mx = evt.touches[0].pageX;
				my = evt.touches[0].pageY;
			} else if ( evt.changedTouches.length > 0 ){
				mx = evt.changedTouches[0].pageX;
				my = evt.changedTouches[0].pageY;
			}
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
//	console.log("startPan:", evt , " mouse:" + evt.button + " testClicked?:"+testClicked,  "  caller:",startPan.caller);
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
	
	hideTicker();
	
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
	
	panning = true ;
	
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
				refreshScreen();
			}
		} else {
//			console.log("endPan,getObjectAtPoint",mouseX0, mouseY0);
			getObjectAtPoint(mouseX0, mouseY0);
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
//				console.log("showPanning evt:",evt.buttons);
				if ( evt.buttons == 0 ){ // 2017/4/10
					endPan();
				} else {
					difX = evt.clientX - mouseX0;
					difY = evt.clientY - mouseY0;
				}
			}
		} else {
//				console.log("showPanning event:",event.buttons);
			if ( event.buttons == 0 ){ // 2017/4/10
				endPan();
			} else {
				difX = event.clientX - mouseX0;
				difY = event.clientY - mouseY0;
			}
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
		tVal = "matrix(" + tMat.a + "," + tMat.b + "," + tMat.c + "," + tMat.d +"," + tMat.e + "," + tMat.f + ")";
//		tVal = "matrix3d(" + tMat.a + "," + tMat.b + ",0,0," + tMat.c + "," + tMat.d +",0,0,0,0,1,0," + tMat.e + "," + tMat.f + ",0,1)"; // 2019/12/24 Chrome(blinkのバグ？)でまともに動かなくなっているので・・・matrixに戻す
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
	
	tempolaryZoomPanImages( 1/pow , 0 , 0 );
	refreshScreen();
	
	//getLayers();
}

var smoothZoomTransitionTime = 300;

var additionalZoom = 0;

var smoothZoomInterval = 20;

//ズームイン／アウト時の遷移時間
function setSmoothZoomTransitionTime(zoomTransitionTime){
	if(Number(zoomTransitionTime) > 0){
		smoothZoomTransitionTime = Number(zoomTransitionTime);
	}else{
		smoothZoomTransitionTime = 300;
	}
}

//ズームイン／アウト後のタイル読み込み開始タイマー(ms)
function setSmoothZoomInterval(zoomInterval){
	if(Number(zoomInterval) > 0){
		smoothZoomInterval = Number(zoomInterval);
	}else{
		smoothZoomInterval = 20;
	}
}

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
	if ( uaProp.IE){ // 下の再利用処理はIE11でかなりのボトルネック化している・・・
		for ( var i = mapImgs.length - 1 ; i >= 0 ; i-- ){
			mapImgs.item(i).parentNode.removeChild(mapImgs.item(i)); // 何の工夫もせず単に全部消す。これが一番早い感じで表示もまずまず・・・
		}
	} else {
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
	
	refreshScreen();
	setLayerListSize();
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

function setLayerDivProps( id, parentElem, parentSvgDocId ){ // parseSVGから切り出した関数 2017.9.29
	if ( parentSvgDocId ){
		if ( parentSvgDocId == "root" ){
			// 現在対象としているsvgImagesPropsではなく子供のpropsに書き込んでいる点に注意！
			(svgImagesProps[id]).rootLayer = id;
			parentElem.setAttribute("class" , "rootLayer:"+ id);
//				console.log("parentElem:",parentElem);
			if ( parentElem.getAttribute("data-nocache") ){ // ルートレイヤに対するnoCacheしか見ないことにする 2017.9.29
				(svgImagesProps[id]).noCache = true; 
			}
		} else {
			svgImagesProps[id].rootLayer = svgImagesProps[parentSvgDocId].rootLayer;
			parentElem.setAttribute("class" , "rootLayer:"+ svgImagesProps[parentSvgDocId].rootLayer);
		}
	}
}

function getNoCacheRequest( originalUrl ){
//	強制的にキャッシュを除去するため、unixTimeをQueryに設置する
//	console.log("NO CACHE GET REQUEST");
	var rPath = originalUrl;
	if (rPath.lastIndexOf("?")>0){
		rPath += "&";
	} else {
		rPath += "?";
	}
	rPath += "unixTime=" + (new Date()).getTime();
	return ( rPath );
}

// loadSVG(this)[XHR] -(非同期)-> handleResult[buildDOM] -> dynamicLoad[updateMap] -> parseSVG[parseXML & set/chgImage2Canvas] -> (if Necessary) ( (if Unloaded child) loadSVG(child)-(非同期)->... || (if already loaded child) parseSVG(child)... )
// なお、起動時はloadSVGからだが、伸縮,スクロール,レイヤON/OFFなどでの読み込み表示処理の起点はdynamicLoadから(rootの文書は起動時に読み込み済みで変わらないため)
function loadSVG( path , id , parentElem , parentSvgDocId) {
//	console.log("called loadSVG  id:",id, " path:",path);
	if ( !svgImages[id] ){ 
//		console.log("call loadSVG  create svgImagesProps id:",id);
		svgImagesProps[id] = new function(){}; //  2014.5.27
		
		// 2014.5.27 canvas統合用に、rootLayerPropに、"root"のレイヤーのidを子孫のレイヤーに追加
		// 2017.9.29 nocache処理のため、こちらに移動
		setLayerDivProps( id, parentElem, parentSvgDocId );
		
//		var httpObj = createXMLHttpRequest( function(){ return handleResult(id , path , parentElem , this); } );
		var httpObj = createXMLHttpRequest( function(){ handleResult(id , path , parentElem , this , parentSvgDocId ) } , function(){handleErrorResult(id,path,this,true)});
		
		if ( httpObj ) {
//			console.log(" path:" + path);
			loadingImgs[id] = true;
			
			// 強制的にキャッシュを除去するオプションを実装 2017.9.29
			// rootLayersProps[thisDoc's rootLayer=].noCacheがtrueの場合に発動する
			var rPath = path;
			if ( svgImagesProps[id].rootLayer && svgImagesProps[svgImagesProps[id].rootLayer].noCache ){
				rPath = getNoCacheRequest(rPath);
			}
			
			if ( typeof contentProxyParams.getUrlViaProxy == "function" ){ // original 2014.2.25 by konno (たぶん)サイドエフェクトが小さいここに移動 s.takagi 2016.8.10
				var pxPath = contentProxyParams.getUrlViaProxy(rPath);
				httpObj.open("GET", getSvgReq(pxPath) , true );
			} else {
				httpObj.open("GET", getSvgReq(rPath) , true );
			}
			if ( uaProp.MS && httpObj.ontimeout ){ // MS(IEだけ？)のXHRはopen後にtimeoutを設定しないとエラーになる
				httpObj.timeout = loadingTransitionTimeout;
			}
			httpObj.send(null);
		}
//		console.log("make XHR : ", id);
	} else { // 過去にロードしていて、svgImagesに残っている場合(editableレイヤー)はそれを使う(handleResultを飛ばしてdynamicLoadする) 2013/7/2x
		delete loadingImgs[id];
		setLayerDivProps( id, parentElem, parentSvgDocId ); // 2017.10.04
		dynamicLoad( id , parentElem );
		
	}
}

function repairScript( resTxt ){
	var resScript = (resTxt.match(/<script>([\s\S]*)<\/script>/ ))[1];
	// まず、すでにエスケープされているものをもとに戻す・・(rev11以前用に作られたコンテンツ対策)
	resScript = resScript.replace(/&lt;/g,'<');
	resScript = resScript.replace(/&gt;/g,'>');
	resScript = resScript.replace(/&amp;/g,'&');
	
	// その後、エスケープする
	resScript = resScript.replace(/&/g,'&amp;');
	resScript = resScript.replace(/</g,'&lt;');
	resScript = "<script>" + resScript.replace(/>/g,'&gt;') + "</script>";
//	console.log("resScript:",resScript);
//	console.log("resTxt:",resTxt);
	return( resTxt.replace(/<script>[\s\S]*<\/script>/ , resScript) );
}

function getControllerSrc( resTxt , svgImageProps ){ // 2017.2.21
	// data-controller-srcがある場合、そのソースをを取得して、svgImageProps.controllerに投入するとともに
	// resTxtからdata-controller-srcを除去する
	// 注意:やらないとは思うが、したがって、data-controller-srcをDOMで操作しても何も起きない・・
	var controllerSrc = (resTxt.match(/data-controller-src[\s\S]*?"([\s\S]*?)"/ ))[1];
	controllerSrc = controllerSrc.replace(/&amp;/g,'&');
	controllerSrc = controllerSrc.replace(/&quot;/g,'"');
	svgImageProps.controller = "src:"+controllerSrc;
//	console.log("controllerSrc:",controllerSrc);
	return (resTxt.replace(/data-controller-src[\s\S]*?"[\s\S]*?"/, "" ) );
}

var ns_svg = "http://www.w3.org/2000/svg";

function handleErrorResult( docId , docPath, httpRes, isTimeout){
	// ERR404時や、timeout時に行う処理(2020/2/13 timeout処理を追加)
	delete loadingImgs[docId]; // debug 2013.8.22
	console.log( "File get failed: Err:",httpRes.status," Path:",docPath," id:",docId);
	if ( svgImagesProps[docId] ){ // 2020/2/13 removeUnusedDocs() により恐らく以下の処理は不要 じゃなかった(2021/2/17)
		svgImagesProps[docId].loadError = true; // 2021/2/17
	}
	if (isTimeout){
		++loadErrorStatistics.timeoutSvgDocCount;
	} else {
		++loadErrorStatistics.otherSvgDocCount;
	}
	checkLoadCompleted();
	return;
}

function handleResult( docId , docPath , parentElem , httpRes , parentSvgDocId ){
//	console.log("httpRes:id,res:",docId,httpRes);
	if (( httpRes.readyState == 4 ) ){
//			console.log("called handleResult and ready  id:",docId);
		if ( !svgImagesProps[docId]){
			// 読み込み途中でそのタイルが不要になるケースがある(高速にスクロールすると、removeUnused..で消される) 2020/1/24
			console.log("NO svgImagesProps[docId] : docId:",docId, "  skip processing");
			delete loadingImgs[docId];
			checkLoadCompleted();
			return;
		}
		if ( httpRes.status == 403 || httpRes.status == 404 || httpRes.status == 500 || httpRes.status == 503 ){
			handleErrorResult(docId , docPath, httpRes);
			/**
			delete loadingImgs[docId]; // debug 2013.8.22
			console.log( "File get failed: Err:",httpRes.status," Path:",docPath);
			svgImagesProps[docId].Path = "ERR"; // ERR404例外処理 2017.8.29
			checkLoadCompleted();
			return;
			**/
			return; // 2021/2/17 ERR404強化
		}
//		console.log("called HandleResult id,path:" + docId+" , " +docPath);
//		console.log("End loading");
//		var text = getAjaxFilter()(httpRes.responseText); // レスポンスの確認用です
//		console.log(text);
//		console.log(printProperties(httpRes));

// Firefox 28において、httpRes.responseやresponseTextはあるにも関わらず、responseXMLが取得できない場合に、(httpRes.responseXML != null)も評価しておかないと、データが表示されなくなる。responseXMLのみがnullの場合は、responseTextを利用して表示すればよい。
		if ((httpRes.responseXML != null) && httpRes.responseXML.documentElement && !uaProp.MS && verIE >= 100 && isSvg( httpRes.responseXML ) && httpRes.responseText.indexOf("<script>")<0){
			// 2016.11.1 動的コンテンツの場合はすべてプリプロセッサ通す処理に変更
			// 2018.4.6 Edge対応のため !isIEを!uaProp.MSに変更した(Edgeでもsvgネームスペース時、SVGベクタデータの数値丸め誤差甚大の被害が出る・・)
//			console.log("parse by native parser...");
			svgImages[docId] = httpRes.responseXML;
		} else { // responseXMLが無いブラウザ用(IE用ね)
//			console.log("NO SVG... :",docId , docPath);
			if (httpRes.responseText.indexOf("http://www.w3.org/2000/svg")>=0){ // 2014.1.23 path以外もいろいろIEでは不具合が出るため、すべて対象に
				
				// IE*ではSVGネームスペースのデータの座標値が相当丸められてしまうため、仕方なくText扱いでXMLを改修した上で非SVGデータとしてDOM化して回避する・・・厳しい(2013.8.20)
				var resTxt = httpRes.responseText.replace('xmlns="http://www.w3.org/2000/svg"','xmlns="http://www.w3.org/"'); // ネームスペースを変えるだけにとどめてもOKの模様
				
				// 2017.2.21 data-controller-srcを探し、あれば.controller設定＆除去
				if ( (resTxt.match(/data-controller-src([\s\S]*)"/ )) ){
					resTxt = getControllerSrc(resTxt,svgImagesProps[docId]);
				}
				
				resTxt = resTxt.replace(/.*<!DOCTYPE html>.*</,'<'); // 2014.4.25 IE11 で怪しい挙動 <script>があると勝手にDOCTYPE htmlをつけているかんじがするぞ！！！
//				resTxt = resTxt.replace('</svg>','</xml>');
//				resTxt = resTxt.replace('<svg','<xml>');
				if ( (resTxt.match(/<script>([\s\S]*)<\/script>/ )) ){ // 2015.9.11 動的コンテンツでXML特殊文字がエスケープされていないスクリプトの処理
					resTxt = repairScript(resTxt);
				} else {
//					console.log ("NO SCRIPT!!!");
				}
//				console.log("resTxt:",resTxt);
//				console.log("resScript:",resScript);
//				svgImages[docId] = new DOMParser().parseFromString(resTxt,"text/xml");
				svgImages[docId] = new DOMParser().parseFromString(resTxt,"application/xml");
			} else {
				svgImages[docId] = new DOMParser().parseFromString(httpRes.responseText,"application/xml");
			}
		}
		
		if ( svgImages[docId].getElementsByTagName("svg").length<1){
			// エラー文書・・ added 2021/08/04
			console.warn("DOCUMENT ERROR.. skip");
			delete ( svgImages[docId] );
			handleErrorResult(docId , docPath, httpRes);
			return;
		}
		svgImages[docId].getElementById = getElementByIdUsingQuerySelector; // added 2017.2.3
//		console.log( svgImages[docId].getElementById );
		
//		console.log("docLoc:",svgImages[docId].location);
//		console.log("docPath:" ,docPath, " doc:",svgImages[docId],"   id:docRoot?:",svgImages[docId].getElementById("docRoot"));
//		svgImagesProps[docId] = new function(){}; // move to loadSVG()  2014.5.27
//				console.log("docId:",docId," svgImagesProps[docId]:",svgImagesProps[docId]," docPath:",docPath);
		svgImagesProps[docId].Path = docPath;
		svgImagesProps[docId].script = getScript( svgImages[docId] ); // ここに移動した 
		svgImagesProps[docId].CRS = getCrs( svgImages[docId] ,docId);
		svgImagesProps[docId].refresh = getRefresh( svgImages[docId] );
		updateMetaSchema(docId); // added 2017.8.10  2018.2.26 関数化
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
		
		setController( svgImages[docId] , docPath , svgImagesProps[docId] ); // 2016.10.14
		// ルートコンテナSVGのロード時専用の処理です・・・ 以下は基本的に起動直後一回しか通らないでしょう
		if ( docId =="root"){
			rootCrs = svgImagesProps[docId].CRS;
			root2Geo = getInverseMatrix( rootCrs );
			var viewBox = getViewBox( svgImages["root"] );
			rootViewBox = getrootViewBoxFromRootSVG( viewBox , mapCanvasSize , ignoreMapAspect);
			// location.hashによるviewBoxの変更はCheckResumeに移動。2017.1.31
		} else {
			if ( isEditableLayer(docId) ){
//				console.log("editable:" + docId);
				svgImagesProps[docId].editable = true;
			}
		}
		
		// 動的レイヤーを導入～～add 2013/1 (これはドキュメントの読み込み時最初の一回だけの方)
//		console.log("call getScript");
//		svgImagesProps[docId].script = getScript( svgImages[docId] ); 
		if ( svgImagesProps[docId].script ){
			var zoom = getZoom(getRootSvg2Canvas( rootViewBox , mapCanvasSize ),docId); 
			var child2root = getConversionMatrixViaGCS( svgImagesProps[docId].CRS, rootCrs );
			svgImagesProps[docId].script.scale =  zoom * child2root.scale; // patch 2018.5.18 なんか汚い・・・
			svgImagesProps[docId].script.CRS = svgImagesProps[docId].CRS;
			svgImagesProps[docId].script.location = getSvgLocation( svgImagesProps[docId].Path );
			svgImagesProps[docId].script.verIE = verIE;
			svgImagesProps[docId].script.docId = docId;
//			console.log( "isObj?:" , refreshScreen );
			svgImagesProps[docId].script.refreshScreen = refreshScreen; // 2015.5.26 add utility function for asynchronous software picture refreshing
			svgImagesProps[docId].script.linkedDocOp = linkedDocOp; // 2017.3.9 子文書に対しての操作を許可してみる・・・
			svgImagesProps[docId].script.isIntersect = isIntersect; // 2018.6.29 よく使うので・・
			svgImagesProps[docId].script.childDocOp = childDocOp; // 2017.3.9 子文書に対しての操作を許可してみる・・・
			svgImagesProps[docId].script.transform = transform;
			svgImagesProps[docId].script.getCanvasSize = getCanvasSize;
			svgImagesProps[docId].script.geoViewBox = geoViewBox;
			if ( typeof svgMapGIStool == "object" ){
				svgImagesProps[docId].script.drawGeoJson = svgMapGIStool.drawGeoJson;
			}
			svgImagesProps[docId].script.initialLoad = true;  // レイヤのロード時はonzoomを発動させるという過去の仕様を継承するためのフラグ・・あまり筋が良くないと思うが互換性を考え 2018.6.1
			svgImagesProps[docId].script.initObject();
			if ( svgImagesProps[docId].script.onload ){
//				console.log("call First onload() for dynamic content");
				svgImagesProps[docId].script.onload();
			}
		}
		
//		delete loadingImgs[docId];
		dynamicLoad( docId , parentElem );
	}
}

var usedImages=[]; // DOM操作によるsvgmapドキュメントやそのプロパティのメモリリークのチェック用 2019.5.22

function dynamicLoad( docId , parentElem ){ // アップデートループのルート：ほとんど機能がなくなっている感じがする・・
	if (! docId && ! parentElem ){
		docId ="root";
		parentElem = mapCanvas;
	}
//	console.log("called dynamicLoad  id:",docId, "  caller:",dynamicLoad.caller);
	
	svgDoc = svgImages[docId];
//	console.log( "dynamicLoad:", svgDoc );
//	svgDoc.firstChild.id=docId;
	svgDoc.documentElement.setAttribute("about",docId);
//	console.log("svgDoc-FC:",svgDoc.firstChild);
//	console.log(parentElem);
	
	parentElem.setAttribute("property",svgImagesProps[docId].metaSchema); // added 2012/12
	var symbols = getSymbols(svgDoc); // シンボルの登録を事前に行う(2013.7.30)
	if ( docId == "root" ){
		usedImages=[];
		setCentralVectorObjectsGetter(); // 2018.1.18 checkTicker()の二重パースの非効率を抑制する処理を投入
		
//		console.log("called root dynamicLoad");
		
		if ( summarizeCanvas ){
			resetSummarizedCanvas();
		}
		hideTicker();
		updateCenterPos();
//		prevGeoViewBox = { x: geoViewBox.x , y: geoViewBox.y , width: geoViewBox.width , height: geoViewBox.height }; // 2016.10.7  2018.6.19 onzoom()でrefreshscreen()すると破綻するのでレイヤ個別化＆移動
		geoViewBox = getTransformedBox( rootViewBox , root2Geo );
//		console.log("calc geoViewBox:",geoViewBox,"   rootViewBox:",rootViewBox);
		if ( !pathHitTest.enable ){
			delete existNodes;
			existNodes = new Object();
			visiblePOIs = new Array();
		}
//		console.log(svgDoc.documentElement);
		checkResume(svgDoc.documentElement, symbols ); // 2016/12/08 bug fix 2016/12/13 more bug fix
		
		clearLoadErrorStatistics();
	}
//	console.log("crs:", svgImagesProps[docId].CRS );
//	console.log("docPath:" , svgDoc.docPath);
	
	// メインルーチンに
//	console.log("call parseSVG");
	
	
//	console.log(svgDoc.documentElement);
	parseSVG( svgDoc.documentElement , docId , parentElem , false , symbols , null , null);
	delete loadingImgs[docId];
	
	if ( docId == "root" ){
		
//		checkResume(); // 2016/10/26
		
		if ( typeof setLayerUI == "function" ){
//			console.log("call setLayerUI");
			setLayerUI(); // add 2013/1 moved from  handleResult 2014/08
			setLayerUI = null; // added 2016/10/13 最初にロードされた直後のみ呼び出すようにした（たぶんこれでＯＫ？）
		}
//		console.log("checkDeletedNodes", existNodes);
		checkDeletedNodes( mapCanvas );
		if ( ticker && !pathHitTest.enable && !GISgeometriesCaptureFlag){ // スマホなどでクリックしやすくするためのティッカー ただし単なるpathHitTestのときは無限ループが起きるのでパスする 2017.7.31 pathHitTest.enableチェックせずとも無限ループは起きなくなったはず 2018.1.18 GISgeometriesCapture中はtickerの表示は不要なので高速化のため外す2019.12.26
			checkTicker(); // ここで呼び出しただけでは、ロード中のレイヤのオブジェクトは拾えないので、スクロール・伸縮などで新たに出現するオブジェクトはTicker表示されない(ちょっとスクロールするとかしないと表示されない) バグに近いです
		}
//		console.log("call checkLoadCompleted : ending dynamicLoad");
//		checkLoadCompleted(); // 読み込みがすべて完了したらtoBeDelのデータを消去する
	}
	if ( !pathHitTest.enable ){ // 2017.8.18 debug pathHitTestのときは"画面の描画完了"確認もやってはまずい・・ geojsonの獲得に関しても同様と思うが、こちらはscreenrefreshedイベントを起点に処理しているのでできない・・ pathHitTestとgeojson取得でロジックが違うのが気になる・・・
		checkLoadCompleted(); // 読み込みがすべて完了したらtoBeDelのデータを消去する
	}
	
	
}

function handleScript( docId , zoom , child2root){
	svgImagesProps[docId].script.location = getSvgLocation( svgImagesProps[docId].Path ); // added 2017.9.5 ハッシュが書き換わる可能性を加味
	svgImagesProps[docId].script.scale = zoom * child2root.scale;
	// console.log("docId:",docId,"  scale:",svgImagesProps[docId].script.scale,"  zoom:",zoom, "  child2root.scale:",child2root.scale);
//	console.log("set scale:",svgImagesProps[docId].script.scale,"  docId:",docId,"   svgImageProps:",svgImagesProps[docId]);
	svgImagesProps[docId].script.actualViewBox = getTransformedBox( rootViewBox , getInverseMatrix( child2root ) ); // *ViewBoxは間違い・viewportが正しい・・互換のために残す・・・
	svgImagesProps[docId].script.geoViewBox = geoViewBox;
	svgImagesProps[docId].script.viewport = svgImagesProps[docId].script.actualViewBox; // debug 2014.08.06
	svgImagesProps[docId].script.geoViewport = geoViewBox; // debug
//	console.log(docId + " : scale:" + svgImagesProps[docId].script.scale + " actualViewBox:" );
//	console.log(svgImagesProps[docId].script.actualViewBox);
//	console.log(svgImagesProps[docId].script.CRS);
	var vc = viewBoxChanged(docId);
	svgImagesProps[docId].script.handleScriptCf(); // ここで、上記の値をグローバル変数にセットしているので、追加したらhandleScriptCfにも追加が必要です！ 2017.8.17
	if ( vc =="zoom" || svgImagesProps[docId].script.initialLoad ){ // zooming
		svgImagesProps[docId].script.initialLoad  = false;
		if ( svgImagesProps[docId].script.onzoom ){
			svgImagesProps[docId].script.onzoom();
		}
	} else if ( vc=="scroll") { // scrollもzoomもしてないonrefreshscreenみたいなものがあるのではないかと思うが・・・ 2017.3.16
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

var preRenderSuperControllerFunction = null;
function handlePreRenderControllerScript(docId , zoom , child2root, isSuperController){ // 2020/6/8  svg要素内のscriptをevalで実行するのをやめる前準備
	var vc = viewBoxChanged("prc_"+docId); // この関数(viewBoxChanged)は、あまりにも出来が悪い処理に思う・・
	var svgDocStatus ={ // この辺の値は後々整理が必要
		docId: docId,
		location: getSvgLocation( svgImagesProps[docId].Path ),
		scale: zoom * child2root.scale,
		rootScale: zoom,
		c2rScale : child2root.scale,
		actualViewBox: getTransformedBox( rootViewBox , getInverseMatrix( child2root ) ),
		geoViewBox: geoViewBox,
		viewChanged: vc
	}
	if ( isSuperController ){
		preRenderSuperControllerFunction(svgDocStatus);
	} else {
		try{ // 2020/09/11 preRenderFunctionがエラーアウトすると NOW LOADING:: delay and retry refreshScreenの無限ループに入るのを防止
			svgImagesProps[docId].preRenderControllerFunction(svgDocStatus);
		} catch(e){
			console.log("Error in handlePreRenderControllerScript:",e);
		}
	}
}

/**
// check viewBoxChange
var prevGeoViewBox={}; // ワンステップ前のgeoViewBoxが設定される。viewBoxChanged()用変数 handleScript()専用 : added 2016.10.7 for deleting action val  ++  2017.3.16 viewbox変化によって出るイベントが変わる処理のために追加使用 ::  2018.6.19 onzoom()でrefreshscreen()すると破綻するのでレイヤ個別化＆設定場所を移動
		
function viewBoxChanged(docId){ // このルーチンバグあり・・ 2020/6/8 geoViewBoxのheightは単なるスクロールでも図法があれなので増減しちゃう rootViewBox使わないとダメ
	if ( !docId ){
		docId = "allMaps";
	}
	var ans;
	if ( !prevGeoViewBox[docId] || prevGeoViewBox[docId].width != geoViewBox.width || prevGeoViewBox[docId].height != geoViewBox.height ){
		ans = "zoom";
	} else if ( prevGeoViewBox[docId].x != geoViewBox.x || prevGeoViewBox[docId].y != geoViewBox.y ){
		ans = "scroll";
	} else {
		ans = false
	}
	console.log("viewBoxChanged geoViewBox:",geoViewBox,"  docId:",docId,"  prevGeoViewBox[docId]:",prevGeoViewBox[docId]," ans:",ans);
	if ( prevGeoViewBox[docId] ){
		console.log( "comp:" , prevGeoViewBox[docId].width != geoViewBox.width , prevGeoViewBox[docId].height != geoViewBox.height);
	}
	prevGeoViewBox[docId] = { x: geoViewBox.x , y: geoViewBox.y , width: geoViewBox.width , height: geoViewBox.height };
	return ( ans );
}
**/
		
var prevRootViewBox={}; // ワンステップ前のrootViewBoxが設定される。

function viewBoxChanged(docId){ //  2020/6/8 修正 ただ、この関数、あまり筋が良いとは言えないので改修すべき・・
	if ( !docId ){
		docId = "allMaps";
	}
	var ans;
	if ( !prevRootViewBox[docId] || prevRootViewBox[docId].width != rootViewBox.width || prevRootViewBox[docId].height != rootViewBox.height ){
		ans = "zoom";
	} else if ( prevRootViewBox[docId].x != rootViewBox.x || prevRootViewBox[docId].y != rootViewBox.y ){
		ans = "scroll";
	} else {
		ans = false
	}
//	console.log("viewBoxChanged rootViewBox:",rootViewBox,"  docId:",docId,"  prevRootViewBox[docId]:",prevRootViewBox[docId]," ans:",ans);
	if ( prevRootViewBox[docId] ){
//		console.log( "comp:" , prevRootViewBox[docId].width != rootViewBox.width , prevRootViewBox[docId].height != rootViewBox.height);
	}
	prevRootViewBox[docId] = { x: rootViewBox.x , y: rootViewBox.y , width: rootViewBox.width , height: rootViewBox.height };
	return ( ans );
}


// for childCategory
var EMBEDSVG = 0 , BITIMAGE = 1 , POI = 2 , VECTOR2D = 3 , GROUP = 4 , TEXT = 5 , NONE = -1;
// for childSubCategory
var PATH = 0 , POLYLINE = 1 , POLYGON = 2 , RECT = 3 , CIRCLE = 4 , ELLIPSE = 5 , HYPERLINK = 10 , SYMBOL = 11 , USEDPOI = 12 , DIRECTPOI = 13 , SVG2EMBED = 100;

// for layerCategory
var EXIST = 1 , CLICKABLE = 2;

function getDocDir( docPath ){  // 2016.10.14 関数化
	// 2016.8.10 ここに konnoさんによる、http://時の特殊処理( http://の場合docDir=""にする 2014.2.25 )が入っていたのを削除 (たぶん proxy処理に対するエラーだったと思うが・・・　テスト不十分)
	var pathWoQF = docPath.replace(/#.*/g,"");
	pathWoQF = pathWoQF.replace(/\?.*/,"");
	docDir = pathWoQF.substring(0,pathWoQF.lastIndexOf("/")+1);
//	docDir = docPath.substring(0,docPath.lastIndexOf("/")+1);
	return ( docDir );
}

function updateMetaSchema(docId){
	var metaSchema = getMetaSchema(svgImages[docId]);
	if ( metaSchema ){
		svgImagesProps[docId].metaSchema = metaSchema;
	} else {
		svgImagesProps[docId].metaSchema = "";
	}
}

function parseSVG( svgElem , docId , parentElem , eraseAll , symbols , inCanvas , pStyle , dontChildResLoading ){ 
//	console.log( "parseSVG:", svgImages[docId] );
	// Symbols: poi シンボルの配列 bug改修(2012/12)
	// inCanvas: svgmap lv0.1用:連続するline,polygonはひとつのcanvasに描くことでリソースを抑制する、そのための統合キャンバス
	
//	console.log("called parseSVG  id:",docId, "  Recursive?:",pStyle,"  dontRender?:",dontChildResLoading);
	
	var isSVG2 = svgImagesProps[docId].isSVG2;
	
	var docPath = svgImagesProps[docId].Path;
	
	var clickable = svgImagesProps[docId].isClickable;
	
	if ( svgElem.nodeName=="svg"){
		updateMetaSchema(docId); // 2018.2.28 metaSchemaがDOM操作で変更されることがある・・・
		usedImages[docId]=true; // 2019.5.22 メモリリーク防止用　今描画されてるドキュメントのID表を作る
	}
	
	var beforeElem = null;
	var s2c = getRootSvg2Canvas( rootViewBox , mapCanvasSize ); // ルートSVG⇒画面変換マトリクス
	var zoom = getZoom(s2c,docId); // ルートSVGの、画面に対するズーム率 (docIdはレイヤーごとにdevicePixelRatioを変化させるための(副次的な)もの)
//	console.log("S2C.a:" + s2c.a + " S2C.d:" + s2c.d);
//	console.log(parentElem);
// svgElemはsvg文書のルート要素 , docPathはこのSVG文書のパス eraseAll==trueで対応要素を無条件消去	
// beforeElem SVGのimage並び順をhtmlのimgの並び順に一致させるためのhtmlにおける直前要素へのポインタ
	
//	var svgNodes = svgDoc.documentElement.childNodes;
//	console.log(docPath);
	var svgNodes = svgElem.childNodes;
	var crs = svgImagesProps[docId].CRS;
	var child2root = getConversionMatrixViaGCS( crs, rootCrs );
	svgImagesProps[docId].scale =  zoom * child2root.scale; // この値、多くのケースで必要だと思う 2020.5.18
	// console.log("docId:",docId,"  scale:",svgImagesProps[docId].scale);
	
	var child2canvas;
	child2canvas = matMul( child2root , s2c ); // 子SVG⇒画面座標へのダイレクト変換行列 2013.8.8
	var nextStyleUpdate = false; // 次要素スタイルを新たに設定する必要の有無
	if ( svgElem.nodeName=="svg"){
		if (svgImagesProps[docId].script ){ // added 2013/01 for dynamic layer's convinience
//			console.log("svgElem:",svgElem.nodeName); // debug 下と同じ問題、ルートの要素を通過するときのみ呼ばないとまずいでしょ 2017.3.9
			handleScript( docId , zoom , child2root );
		}
		if ( typeof(svgImagesProps[docId].preRenderControllerFunction)=="function" ){ // 2020/6/8  svg要素内のscriptをevalで実行するのをやめる前準備
			handlePreRenderControllerScript(docId , zoom , child2root);
		}
		if ( typeof(preRenderSuperControllerFunction)=="function" ){
			handlePreRenderControllerScript(docId , zoom , child2root , true);
		}
	}
	
	if ( GISgeometriesCaptureFlag && ! GISgeometries[docId] ){
		// svg文書ツリーの再帰パーサなので、同じ文書が何度もparseSVGを通るので!GISgeometries[docId] の条件必要
//		console.log( "new GISgeometries:",docId);
		GISgeometries[docId] = new Array();
	}
	
	var docDir = getDocDir(docPath); // 文書のディレクトリを取得
	
	for ( var i = 0 ; i < svgNodes.length ; i++ ){
		
//		console.log("node:" + i + "/" + svgNodes.length + " : " +svgNodes[i].nodeName);
		var svgNode = svgNodes[i];
		

		var onViewport = false;
		if ( svgNode.nodeType != 1){
			continue;
		}
		
		var useHref ="";
		
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
			if ( getNonScalingOffset(svgNode).nonScaling ){ // 2018.3.2 imageでもnonScalingのものをPOIとする。getNonScalingOffsetをstyleパース時と都合二回呼んでるのがね。最初に読んでstyleのほうに受け渡したほうがキレイかと・・
				childCategory = POI;
				childSubCategory = DIRECTPOI;
			} else {
				childCategory = BITIMAGE;
			}
			break;
		case "use": // use要素の場合 2012/10
			useHref = svgNode.getAttribute("xlink:href"); // グループタイプのシンボルを拡張 2017.1.17
			if ( ! useHref ){
				useHref = svgNode.getAttribute("href");
			}
			if ( symbols[useHref] ){
				if (symbols[useHref].type == "group"){ // 2DベクタのシンボルはgetGraphicsGroupSymbolでGROUP扱いしている
					childCategory = GROUP;
					childSubCategory = SYMBOL;
				} else {
					childCategory = POI;
					childSubCategory = USEDPOI;
				}
			} else { // リンク切れ
			}
//			console.log("group:",childCategory,childSubCategory);
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
		
		var GISgeometry = null;
		if ( !pathHitTest.enable && GISgeometriesCaptureFlag ){
			GISgeometry = initGISgeometry( childCategory, childSubCategory , svgNode );  // 2016.12.1 for GIS  : geoJsonのgeom蓄積
		}
		
		if ( ( !pathHitTest.enable && ( childCategory == POI || childCategory == BITIMAGE || childCategory == EMBEDSVG || childCategory == TEXT ) ) || ( pathHitTest.enable && childCategory == EMBEDSVG ) ){ // image||animation,iframe||use(add201210)要素の場合
			// Point||Coverage的要素のパース。ただし hittest時はsvgの埋め込みのパースのみ(その他のヒットテストはhtml表示のonClickなどのイベントで処理している)
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
			
			var ip = getImageProps( svgNode , childCategory , pStyle , childSubCategory , GISgeometry); // x,y,w,h,href等読み込み
			var imageRect = transformRect(ip , child2root ); // root座標系における、図形のbbox
//			console.log("imageRect:",imageRect,  "  Elem:",svgNode,"  child2root:",child2root, "  geomProps:",ip,"  crs,rootCrs:",crs, rootCrs );
			if ( ip.nonScaling ){
				imageRect.nonScaling = true;
			}
			if ( imageRect.width==0 && imageRect.height==0 && (childCategory==EMBEDSVG || childCategory == BITIMAGE)){
				console.warn ( "This embedding element don't have width/height property. Never renders... imageId:", imageId ,svgNode);
			}
//			console.log( "c2rs:" + imageRect.c2rScale );
			/**
			console.log("--  " + docId);
			console.log(ip);
			console.log(imageRect);
			console.log("--");
			**/
			if ( dontChildResLoading ){ // svgImagesProps,svgImagesなどだけを生成し空回りさせる(resume用)
				continue;
			}
//				console.log( "c2rs:" + imageRect.c2rScale );
//			console.log("nodeName:",svgNode.nodeName," isIntersect?:",isIntersect( imageRect , rootViewBox ),"  imageRect:",imageRect,"  rootViewBox:",rootViewBox,"  crs:",crs, "  rootCrs:",rootCrs, "  child2root:",child2root);
			if ( !eraseAll && isIntersect( imageRect , rootViewBox ) && inZoomRange( ip , zoom ,  imageRect.c2rScale ) && isVisible(ip ) ){ // ロードすべきイメージの場合
				
//				console.log(svgNode.nodeName," intersect?: imageRect:",imageRect,"   rootViewBox:",rootViewBox,"   ip:",ip);
				
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
					if ( !cm.a ){ // added 2020/3/26 for non linear projection
						// 方法論：そのイメージローカルなリニアな変換行列を3基準点から構築して対応する
						var p1=transform( ip.x+ip.width , ip.y , cm );
						var p2=transform( ip.x+ip.width , ip.y+ip.height , cm );
						var tMat = getLinearTransformMatrix(
							ip.x , ip.y , ip.x+ip.width , ip.y , ip.x+ip.width , ip.y+ip.height ,
							p0.x , p0.y , p1.x , p1.y , p2.x , p2.y
						);
						cm = tMat;
					}
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
					if ( childCategory == POI && childSubCategory == USEDPOI){ // ICON表示
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
						var isNoCache = (childCategory == BITIMAGE && svgImagesProps[docId].rootLayer && svgImagesProps[svgImagesProps[docId].rootLayer].noCache);
						img = getImgElement(xd.p0 , yd.p0, xd.span , yd.span , imageURL , imageId , ip.opacity , childCategory , ip.metadata , ip.title , elmTransform , ip.href_fragment , ip.pixelated , ip.imageFilter, isNoCache, {docId:docId,svgNode:svgNode} );
						
					} else if ( childCategory == TEXT ){ // text要素の場合(2014.7.22)
						var cStyle = getStyle( svgNode , pStyle );
						img = getSpanTextElement(xd.p0 , yd.p0 , ip.cdx , ip.cdy , ip.text , imageId , ip.opacity , elmTransform , cStyle , yd.span , ip.nonScaling);
					} else { // animation|iframe要素の場合
						img = document.createElement("div");
						if ( docId == "root"){
							if ( svgNode.getAttribute("data-nocache") ){ // 2017.9.29
								img.setAttribute("data-nocache","true");
							}
							img.setAttribute("data-layerNode","true"); // 2016.12.8
//							console.log("create:",img);
						}
//						img = document.createElement("span");
//						img.setAttribute("class" , docDir + ip.href); // debug
						img.id = imageId;
//						console.log("create div id:",imageId, img);
						if ( ip.opacity ){
//							console.log( "opacity: isIE,verIE", isIE,verIE);
//							console.log("set div opacity: ","Filter: Alpha(Opacity=" + ip.opacity * 100 + ");");
							if ( !uaProp.MS){ // if ( !isIE)からチェンジ (Edge対策)
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
//								img.style.width=mapCanvasSize.width+"px"; // width/heightがdivに設置されると、クリッカブルができなくなる問題発見 2017.11.1
//								img.style.height=mapCanvasSize.height+"px";
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
						var childSVGPath = getImageURL(ip.href , docDir ); // 2016.10.14 関数化＆統合化
						loadSVG( childSVGPath , imageId , img , docId);
						
						//  この部分の処理は、setLayerDivProps 関数に切り出しloadSVG側に移設 2017.9.29 (noCache処理のため)
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
						setImgElement(imgElem , xd.p0 , yd.p0, xd.span , yd.span , getImageURL(ip.href,docDir), elmTransform , 0, 0, false, ip.nonScaling, ip.href_fragment , imageId , {docId:docId,svgNode:svgNode} ); // 2015.7.8 本来ip.cdxyは入れるべきだと思うが、どこかでダブルカウントされるバグがある
					} else if ( childCategory == TEXT ){ // 2014.7.22
						setImgElement(imgElem , xd.p0 , yd.p0 , 0 , yd.span , "" , elmTransform , ip.cdx , ip.cdy , true , ip.nonScaling , null , imageId , {docId:docId,svgNode:svgNode} );
					} else { // animation|iframe要素の場合(svgTile/Layer)
//						console.log("id:" + imageId );
//						console.log( " ISsvgImages:" + svgImages[imageId]);
//						console.log( " isDocElem:" + svgImages[imageId].documentElement );
						var childSVGPath = getImageURL(ip.href , docDir );
						if ( svgImagesProps[imageId] && svgImagesProps[imageId].Path && svgImagesProps[imageId].Path != childSVGPath ){
							console.log("change SVG's path. this has issues....");
							svgImagesProps[imageId].Path = childSVGPath; // added 2017.9.5 : ハッシュが更新されることがあり、それを更新する必要があると思われる・・・　ISSUE:　ただ完全にURLが刷新されるケース(hrefがsetattributeされる)もあり、今のルーチンはそれを検出し再ロードできないのではないか？
						}
						parseSVGwhenLoadCompleted(svgImages , imageId , imgElem , 0 );
						// documentElemの生成(読み込み)が完了してないとエラーになる。生成を待つ必要があるため
//						var symbols =  getSymbols(svgImages[imageId]);
//						parseSVG( svgImages[imageId].documentElement , imageId , imgElem , false , symbols , inCanvas , pStyle ); // inCanvasとpStyleはバグでしょ・・2013.08.20
//						parseSVG( svgImages[imageId].documentElement , imageId , imgElem , false , symbols , null , null );
					}
					beforeElem = imgElem;
				}
				
				if ( childCategory == POI ){ // 2018.3.2 変更はないが、use使わないがnonScalingのもの(DIRECTPOI)も追加
//					visiblePOIs.push({id:imageId, x: xd.p0, y: yd.p0, width: xd.span, height: yd.span });
					visiblePOIs[imageId] = { x: xd.p0, y: yd.p0, width: xd.span, height: yd.span };
				}
				onViewport = true;
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
			
			
			if ( svgNode.hasChildNodes() || childSubCategory == SYMBOL){
				
//				console.log("GROUP with child");
				var hasHyperLink = false;
				if ( childSubCategory == HYPERLINK ){
					hasHyperLink = true;
				}
					
				var cStyle = getStyle(  svgNode , pStyle , hasHyperLink);
				
				if ( childSubCategory == SYMBOL ){ // 2017.1.17 group use : beforeElemがどうなるのか要確認
					cStyle.usedParent = svgNode;
					svgNode = symbols[useHref].node;
//					console.log("childSubCategory:group  : " , svgNode);
				}
//				console.log("minZ:" , cStyle.minZoom , " maxZ:" , cStyle.maxZoom);
//				console.log( "group: fill:" , cStyle["fill"] , " stroke:" , cStyle["stroke"] , svgNode);
				if ( inCanvas && cStyle){ // スタイルを設定する。
//					console.log("<g> set subStyle", cStyle);
					setCanvasStyle(cStyle , inCanvas.getContext('2d'));
				}
				beforeElem = parseSVG( svgNode , docId , parentElem , false , symbols , inCanvas , cStyle , dontChildResLoading);
				if ( inCanvas && cStyle){ // スタイルを元に戻す
//					console.log("</g> restore to Parent Style",pStyle);
					setCanvasStyle(pStyle , inCanvas.getContext('2d'));
				}
			}
		} else if ( childCategory == VECTOR2D ){
//			console.log("VECTOR2D",svgNode,pStyle);
			if ( dontChildResLoading ){ // svgImagesProps,svgImagesなどだけを生成し空回りさせる(resume用)
				continue;
			}
			
			// canvas (inCanvas)を用意する (これ以下のブロック　例えばgetCanvas()とかを作るべきですな)
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
						// inCanvas.styleの初期化系はresetSummarizedCanvasに移動
					}
					if ( pStyle ){
						setCanvasStyle(pStyle , inCanvas.getContext('2d'));
					}
				}
			} else {
				// 生成済みのcanvasを使用する
			}
			
			
			var cStyle = getStyle(  svgNode , pStyle );
//			console.log("thisObj's style:",cStyle, "   parent's style:",pStyle);
			if ( GISgeometry ){
				if (GISgeometry.type ==="TBD"){ // 2016.12.1 for GIS: TBD要素は塗りがあるならPolygonにする
					if ( cStyle["fill"] && cStyle["fill"]!="none"){
						GISgeometry.type = "Polygon";
					} else {
						GISgeometry.type = "MultiLineString";
					}
				}
				if (cStyle.usedParent ){ // 2018.3.5 useによって2D Vectorを使用した場合、そのuse要素の値が欲しいでしょう
					GISgeometry.usedParent = cStyle.usedParent;
					GISgeometry.type = "Point"; // transform(svg,,)のときのみの気はするが・・
				}
			}
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
			if ( inZoomRange( cStyle , zoom , child2root.scale ) && ( !cStyle.display || cStyle.display != "none") && (!cStyle.visibility || cStyle.visibility != "hidden") ){
//				console.log("draw",svgNode);
				var bbox = null;
				if (childSubCategory == PATH){
					bbox = setSVGpathPoints( svgNode , canContext , child2canvas , clickable , null , cStyle.nonScalingOffset , GISgeometry );
				} else if ( childSubCategory == RECT ){
					bbox = setSVGrectPoints( svgNode , canContext , child2canvas , clickable , cStyle.nonScalingOffset , GISgeometry );
				} else if ( childSubCategory == CIRCLE || childSubCategory == ELLIPSE ){
					bbox = setSVGcirclePoints( svgNode , canContext , child2canvas , clickable , childSubCategory , cStyle.nonScalingOffset , GISgeometry );
				} else if ( childSubCategory == POLYLINE || childSubCategory == POLYGON ){
					bbox = setSVGpolyPoints( svgNode , canContext , child2canvas , clickable , childSubCategory , cStyle.nonScalingOffset , GISgeometry );
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
					if ( (pathHitTest.enable || pathHitTest.centralGetter ) && bbox.hitted ){
						pathHitTest.hittedElements.push(svgNode);
						pathHitTest.hittedElementsBbox.push(bbox);
						pathHitTest.hittedElementsUsedParent.push(cStyle.usedParent);
					}
					if ( isIntersect(bbox,mapCanvasSize) ){
						inCanvas.setAttribute("hasdrawing","true");
						onViewport = true;
					}
				}
			}
		}
		
		if ( GISgeometry && onViewport ){ // ひとまずviewportにあるオブジェクトだけを収集する機能を検証2016.12.7
			if (GISgeometry.href){ // 2018/2/27 debug
				GISgeometry.href = getImageURL(GISgeometry.href,docDir);
				if ( imgElem.naturalHeight > 0 || GISgeometry.href.indexOf("data:")==0){ // ロードできてないイメージは外す。 cesiumのimageryではerr404imgで動作が停止する・・　何とかしてよねぇ‥
					// ただし、ロード済みでないとこの値はセットされないので・・　ロード中にgisgeomを呼ぶパターンでは使えないはず・・ 2018.2.27
					// dataURLの場合は、データは実存するにもかかわらずnaturalHeightの設定が遅延するので・・・なんか、こういう話じゃなかも・・(これだと本当にロードが遅延してるdataURLじゃないコンテンツの場合にどうするかがわからない感じもするが・) 2019/12/26
					GISgeometries[docId].push(GISgeometry);
				}
			} else {
				GISgeometries[docId].push(GISgeometry);
			}
//			console.log("GISgeometry::",GISgeometry);
//			console.log("GISgeometries_::",GISgeometries);
		}
		
	}
	
	return ( beforeElem );
}

	
function getImageURL(href , docDir ){
	var imageURL;
	if ( href.lastIndexOf("http://", 0) == 0 || href.lastIndexOf("https://", 0) == 0 || href.lastIndexOf("data:", 0) == 0 ){ // 2016.5.10 debug  2019.10.10 add dataURL
//	if ( href.indexOf("http://") == 0  ){}
		imageURL = href;
	} else if ( href.indexOf("/") == 0 ){
		imageURL = href;
//		imageURL = location.protocol + "//" + document.domain + href; // doain書いてあるとCORS規制掛けるブラウザあった気もするので、それを確認してからですかね・・・
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
//	console.log("parseSVGwhenLoadCompleted",imageId , "  svgImagesProps:", svgImagesProps[imageId], "  svgImages:", svgImages[imageId], " count:",ct);
	if ( svgImagesProps[imageId] && svgImagesProps[imageId].loadError ){ // 2021/2/17 ERR404強化
		return;
	}
	if ( svgImages[imageId] && svgImagesProps[imageId] ){
		loadingImgs[imageId]=true;
		var symbols =  getSymbols(svgImages[imageId]);
		parseSVG( svgImages[imageId].documentElement , imageId , imgElem , false , symbols , null , null );
		delete loadingImgs[imageId];
	} else {
		if ( ct < 20 ){
			++ct;
//			console.log("no doc retry:",ct);
			setTimeout( parseSVGwhenLoadCompleted , 50 , svgImages , imageId , imgElem , ct );
		} else {
			console.log("FAIL: document load : imageId:",imageId);
		}
	}
}

// SVG文書にはなくなってしまったノードを消去する・・
// これも効率が悪い気がする・・ 2013/1/25
// 何となく納得いかない・・　ロード前にチェックされているのでは？
var existNodes = new Object();; // 存在するノードのidをハッシュキーとしたテーブル
function checkDeletedNodes( parentNode ){
	var toBeDelNodes = new Array();
//	console.log("called Check : length:" + parentNode.childNodes.length , existNodes);
	for ( var i = parentNode.childNodes.length - 1 ; i >= 0 ; i-- ){
		var oneNode = parentNode.childNodes.item(i);
		if ( oneNode.nodeType == 1 ){
//			console.log(oneNode.id , existNodes[oneNode.id] , oneNode.nodeName);
			if ( (oneNode.nodeName == "IMG" || oneNode.nodeName == "SPAN") && oneNode.id && oneNode.id.indexOf("toBeDel") == -1){ // 2018.2.23 text(はspanに入ってる)もimg同様にする
//				console.log("id:", oneNode.id, existNodes[oneNode.id]);
				if ( ( ! existNodes[oneNode.id] ) ){ // img||text要素に対してのみ
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
		if ( !ocv.dataset.pixelate4Edge){
			ocv.setAttribute("hasdrawing","false");
			ocv.style.left = "0px";
			ocv.style.top = "0px";
			ocv.width = mapCanvasSize.width;
			ocv.height = mapCanvasSize.height;
			ocv.getContext('2d').clearRect(0,0,ocv.width,ocv.height);
		}
	}
}

function checkEmptySpans( parentNode ){
//	console.log("checkEmptySpans");
	var ret = true; //再帰呼び出し時,消して良い時はtrue
	for ( var i = parentNode.childNodes.length - 1 ; i >= 0 ; i -- ){
		var oneNode = parentNode.childNodes.item(i);
		if ( oneNode.nodeType == 1 ){
			if ( oneNode.nodeName != "DIV" ){
				ret = false; // div以外の要素がひとつでもあった場合には削除しない
			} else if ( oneNode.hasChildNodes()){ // divだと思う　そしてそれが子ノードを持っている
				var ans = checkEmptySpans( oneNode );
//				console.log(oneNode);
				if ( ans && !oneNode.getAttribute("data-layerNode")){ // ansがtrueだったらそのノードを削除する
//					console.log("remove span:",oneNode.id);
					oneNode.parentNode.removeChild(oneNode);
				} else {
					ret = false;
				}
			} else if (!oneNode.getAttribute("data-layerNode")){ // devだけれどそれが子ノードを持っていない
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
	// evalは使うべきではないと思う。以下を参考に Function()のほうがまだ良いのでは？
	// http://qiita.com/butchi_y/items/d6024f81a9eda826fea0
	
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
		
		
		// 問題を改修・・ svgMapのローカルスコープに全部アクセスできてしまう、これはまずい 2017/8/17
		// 間接evalに変更する　これでグローバルスコープに・・　ただこれでもwindowは見えてしまうが・・
		// http://qiita.com/omatoro/items/fa5edb72a5da4e40fadb
		// クロージャの生成
		(0, eval)( // 間接evalでsvgMap内部が露出しなくなる
			"function outer(document){ " + 
			"	console.log('outer:this',this); " + 
			"	var onload, onzoom, onscroll; " + 
//			"	var transform, getCanvasSize; " +  // あると同じ変数があった場合エラー出る？ グローバルなので不要か？
			"	var svgMap = null; " +
			"	var window = null; " +
			// 以下のように追加してinitObject()すればthisなしで利用できるようになりました
			"	var transform,docId,CRS,verIE,geoViewBox,scale; " +  // debug 2018/6/15 宣言してなかったのでグローバル変数が露出してた・・
			"	function initObject(){ transform = this.transform; getCanvasSize = this.getCanvasSize; refreshScreen = this.refreshScreen; linkedDocOp = this.linkedDocOp; isIntersect = this.isIntersect; drawGeoJson = this.drawGeoJson; childDocOp = this.childDocOp; CRS = this.CRS; verIE = this.verIE; docId = this.docId; geoViewBox = this.geoViewBox;scale = this.scale; svglocation = this.location;}" +
			"	function handleScriptCf( clear ){ if ( ! clear){ scale = this.scale; actualViewBox = this.actualViewBox; geoViewBox = this.geoViewBox; viewport = this.viewport; geoViewport = this.geoViewport;}else{document=null;docId=null; }}" +
				scriptTxt + 
			"	return{ " + 
			"		initObject : initObject , " + 
			"		handleScriptCf : handleScriptCf , " + 
			"		onload : onload , " + 
			"		onzoom : onzoom , " + 
			"		onscroll : onscroll, " + 
//			"		callFunction : function ( fname ,p1,p2,p3,p4,p5){eval( 'var vFunc = ' + fname); var ans = vFunc.call(null,p1,p2,p3,p4,p5);return ( ans );}, " + 
			"		getFunction : function ( fname ){eval( 'var vFunc = ' + fname);return ( vFunc );}" + // added 2020/10/14 <script>内の任意の関数を取得できるようにする・・
			"	} " +
			"}"
		);
//		console.log("=========eval OK");
		
//		console.log("CALL outer:::::");
		testF = outer(svgDoc); // documentのカプセル化
//		testF = outer.call({},svgDoc); // これでも 宣言された関数の中でwindowが見えてしまうのは同じ・・ bindも同様か・・
		
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
				if (  symbolNodes[k].nodeName == "image"){ // imageが直接入っているタイプ
					var symb = getSymbolProps( symbolNodes[k] );
					symbols["#"+symb.id] = symb;
				} else if ( symbolNodes[k].nodeName == "g"){ // 2012/11/27 <g>の直下のimage一個のタイプに対応
					if ( symbolNodes[k].hasChildNodes ){
						for ( var l = 0 ; l < symbolNodes[k].childNodes.length ; l++ ){
							if ( symbolNodes[k].childNodes[l].nodeType != 1){
								continue;
							} else if ( symbolNodes[k].childNodes[l].nodeName == "image" ){
								var symb = getSymbolProps( symbolNodes[k].childNodes[l] );
								if ( !symb.id ){
									symb.id = symbolNodes[k].getAttribute("id");
								}
								symbols["#"+symb.id] = symb;
								break;
							} else { // ベクタ図形などが入っている場合は、グループシンボルとしてPOIではなくグループに回す前処理(2017.1.17)
								var symb = getGraphicsGroupSymbol( symbolNodes[k] );
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
//								symb.id = symbolNodes[k].getAttribute("id");
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
		type: "symbol",
		id : id ,
		path : path ,
		offsetX : offsetX ,
		offsetY : offsetY ,
		width : width ,
		height : height
	}
}

function getGraphicsGroupSymbol( groupNode ){
	
	return {
		type: "group",
		id: groupNode.getAttribute("id"),
		node : groupNode
	}
	
}

function getPathSymbolMakerProps( pathNode ){
	var d = pathNode.getAttribute("d");
	var id = pathNode.getAttribute("id");
	return {
		type: "marker",
		id : id ,
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


function mercator(){
	function latLng2MercatorXY( lat , lng  ){ // 正規化メルカトル座標と緯度経度との間の変換関数 (下の関数とセット)
		// lng:-180..180 -> x:0..1,   lat: 85.051128..-85.051128 -> y:0..1 グラフィックスのY反転座標になってる
		var size=1;
		var sinLat = Math.sin(lat * Math.PI / 180.0);
		var pixelX = (( lng + 180.0 ) / 360.0 ) * size;
		var pixelY = (0.5 - Math.log((1 + sinLat) / (1.0 - sinLat)) / (4 * Math.PI)) * size;
	//	console.log("latLng2MercatorXY: lat,lng:",lat,lng,"  mercatorXY:",pixelX,pixelY);
		return {
			x : pixelX ,
			y : pixelY
		}
	}

	function MercatorXY2latLng( px , py ){ // px,py: 上のx,y　正規化メルカトル座標
		var size=1;
		var x = ( px / size ) - 0.5;
		var y = 0.5 - ( py / size);
		var lat = 90 - 360 * Math.atan(Math.exp(-y * 2 * Math.PI)) / Math.PI;
		var lng = 360 * x;
	//	console.log("MercatorXY2latLng: mercatorXY:",px , py,"  lat,lng:",lat,lng  );
		return{
			lat : lat ,
			lng : lng
		}
	}
	
	return {
		transform:function(inp){
			return ( latLng2MercatorXY(inp.y, inp.x) );
		},
		inverse:function(inp){
			var latlng = MercatorXY2latLng(inp.x, inp.y);
			return{
				x: latlng.lng,
				y: latlng.lat
			}
		},
		scale: (1/360),
		mercator:true // 2021/8/10 メルカトルタイルのための特殊処理を起動するキーパラメータ
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

var loadingImgs = new Array(); // 読み込み途上のimgのリストが入る　2021/1/26 通常booleanだがビットイメージの場合非線形変換用の情報が入る

function getImgElement( x, y, width, height, href , id , opacity , category , meta , title , transform , href_fragment , pixelated , imageFilter , nocache , svgimageInfo){
	var img = document.createElement("img");
	
	if ( pixelated ){ // Disable anti-alias http://dachou.daa.jp/tanaka_parsonal/pixelart-topics/  Edgeが・・・
		img.style.imageRendering="pixelated";
//		img.style.imageRendering="crisp-edges";
		img.style.imageRendering="-moz-crisp-edges";
		img.style.msInterpolationMode="nearest-neighbor";
		img.style.imageRendering="optimize-contrast";
		img.dataset.pixelated="true";
	}
	
	if ( href_fragment ){ // 2015.7.3 spatial fragment
		img.setAttribute("href_fragment",href_fragment);
	}
	
	if ( nocache ) { // ビットイメージにもnocacheを反映させてみる 2019.3.18
		href = getNoCacheRequest(href);
	}
	var crossOriginFlag = false;
	if ( typeof contentProxyParams.getUrlViaImageProxy == "function" ){ // 2020.1.30 image用のproxyが使えるようにする
		href = contentProxyParams.getUrlViaImageProxy(href);
		if ( contentProxyParams.crossOriginAnonymous ){
			// img.crossOrigin="anonymous";
			crossOriginFlag = true;
		}
	} else if ( typeof(contentProxyParams.getNonlinearTransformationProxyUrl)=="function" && needsNonLinearImageTransformation(svgImagesProps[svgimageInfo.docId].CRS, svgimageInfo.svgNode)){
		href = contentProxyParams.getNonlinearTransformationProxyUrl(href);
		if ( contentProxyParams.crossOriginAnonymousNonlinearTF ){
			// img.crossOrigin="anonymous";
			crossOriginFlag = true;
		}
	}
	
	setLoadingImagePostProcessing(img, href, id, false, svgimageInfo, crossOriginFlag);
	
//	console.log("opacity:" +opacity);
	if ( opacity ){
//		console.log("set opacity: ","Filter: Alpha(Opacity=" + opacity * 100 + ");opacity:" + opacity + ";");
		img.setAttribute("style" , "Filter: Alpha(Opacity=" + opacity * 100 + ");opacity:" + opacity + ";");
	}
	if ( imageFilter){
//		console.log("imageFilter:",imageFilter);
		img.style.filter+=imageFilter;
	}
	img.style.left = x + "px";
	img.style.top = y + "px";
	img.style.display = "none"; // for Safari
	img.style.position = "absolute";
	img.style.maxWidth = "initial";
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
		img.style.zIndex = "10"; // POIがcanvasより下だとクリックできない問題への対策(POIの重ね順が間違ったことになる場当たり対策だが・・ 2013.9.12) 　ヒットテストを独自実装したので、2018.3.2コメント マウスオーバー時のticker表示がないがクリックできるようにはなりました
		
//		addEvent(img,"mousedown",testClick); // このイベントハンドラは廃止(かなり大きな変更) 2018.2.2
		
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

function setLoadingImagePostProcessing(img, href, id, forceSrcIE, svgimageInfo, crossOriginFlag ){
	if ( verIE > 8 ){
//		console.log("el",href);
		img.addEventListener('load', handleLoadSuccess); // for Safari
		img.addEventListener('error', timeoutLoadingImg ); // 2016.10.28 for ERR403,404 imgs (especially for sloppy tiled maps design)
		img.src = href;
		if (crossOriginFlag){ // crossOrigin属性はsrc書き換えと同タイミングとする。2021.6.9 crossOrigin特性だけ変更するケースはない(Imageのproxy設定と一体)という想定でいる・・
			img.crossOrigin="anonymous";
		}
	} else { // for IE  to be obsoluted..
		img.attachEvent('onload', handleLoadSuccess);
		if (crossOriginFlag){ // これは意味あるのか？
			img.crossOrigin="anonymous";
		}
		if ( forceSrcIE ){
			img.src = href;
		} else {
			img.setAttribute("href",href); // IE8のバグの対策のため・・hrefはDOM追加後につけるんです
		}
		img.style.filter = "inherit"; // 同上 (http://www.jacklmoore.com/notes/ie-opacity-inheritance/)
	}
	setTimeout( timeoutLoadingImg , loadingTransitionTimeout , img);
	loadingImgs[id] = svgimageInfo; // // 2021/1/26 loadingImgsには画像の場合booleanではなくsvgimageInfoを入れ、ビットイメージ非線形変換を容易にした
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
	var fontS=0;
	if ( style["font-size"] && nonScaling ){
		fontS = Number(style["font-size"] );
	} else if ( nonScaling ){
		fontS = 16; // default size but not set..? 
		// do nothing?
	} else {
		fontS = areaHeight;
	}
	img.style.fontSize = fontS+"px";
	
	img.innerHTML = text;
	img.style.left = (x + cdx ) + "px";
//	img.style.top = y + "px";
	if (!uaProp.MS){
		img.style.bottom = ( mapCanvasSize.height - ( y + cdy ) ) + "px";
	} else {
		img.style.top = (y +cdy - fontS)+ "px"; 
	}
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

function setImgElement( img , x, y, width, height, href , transform , cdx , cdy , txtFlg , txtNonScaling , href_fragment , id , svgimageInfo ){
	if ( ! cdx ){
		cdx = 0;
	}
	if ( ! cdy ){
		cdy = 0;
	}
	
	img.style.left = (cdx + x) + "px";
	if ( txtFlg ){
		if ( !txtNonScaling ){
			img.style.fontSize = height + "px";
		}
		if ( !uaProp.MS){
			img.style.bottom = ( mapCanvasSize.height - (cdy + y) ) + "px";
		} else {
			var fontS = parseInt(img.style.fontSize);
			console.log(fontS, img.innerHTML,img);
			img.style.top = (y +cdy-fontS)+ "px"; 
		}
	} else {
		img.style.top = (cdy + y) + "px";
	}
//	img.style.position = "absolute";
	if ( !txtFlg ){
		img.width = width;
		img.height = height;
	}
	var crossOriginFlag=false;
	if ( typeof contentProxyParams.getUrlViaImageProxy == "function" ){ // 2020.1.30 image用のproxyが使えるようにする
		href = contentProxyParams.getUrlViaImageProxy(href);
		if ( contentProxyParams.crossOriginAnonymous ){
			crossOriginFlag=true;
			//img.crossOrigin="anonymous"; // これを無造作に設定すると強制ロードされロード完了検知できない問題が起きたため 2021.6.9
		}
	} else if ( typeof(contentProxyParams.getNonlinearTransformationProxyUrl)=="function" && needsNonLinearImageTransformation(svgImagesProps[svgimageInfo.docId].CRS, svgimageInfo.svgNode)){
		href = contentProxyParams.getNonlinearTransformationProxyUrl(href);
		if ( contentProxyParams.crossOriginAnonymousNonlinearTF ){
			crossOriginFlag=true;
			//img.crossOrigin="anonymous";
		}
	}
	
	var imgSrc = img.getAttribute("data-preTransformedHref");
	if (!imgSrc){
		imgSrc = img.getAttribute("src");
	}
	if ( !txtFlg && img.src && href && isHrefChanged(imgSrc, href)  ){ // firefoxでは(同じURLかどうかに関わらず)srcを書き換えるとロードしなおしてしまうのを抑制 2014.6.12 絶対パスになってバグが出てない？2015.7.8 getAttrで取れば絶対パスにならないで破たんしない。
//		console.log("src set href:",href, "  src:",img.src, "  imgElem:",img, "  getAttrImg", img.getAttribute("src"));
//		img.src = href; // これは下で行う(2020.2.4)
		img.removeAttribute("data-preTransformedHref");
		setLoadingImagePostProcessing(img, href, id, true, svgimageInfo, crossOriginFlag ); 
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

function isHrefChanged(htmlSrc, svgHref){
	var ans = true;
	if ( htmlSrc == svgHref ){
		return ( false );
	}
	
	if ( htmlSrc.indexOf(svgHref) == 0 ){
		var difS = htmlSrc.substring(svgHref.length);
		if ( difS.indexOf("unixTime=")>0 && difS.length < 24 ){ // たぶん、unixTimeが追加されているだけだと考える
			ans = false;
			// console.log("this url may be only added unixTime prop");
		}
	} else { // case -1 , >0
		// ans = true
	}
	return ( ans );
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

function getCrs( svgDoc ,docId){
	var isSVG2 = false;
	var crs = null;
	var globalView=getElementByIdNoNS( svgDoc , "globe");
//	console.log("call getCrs:",getElementByIdNoNS( svgDoc , "globe"),globalView,svgDoc.getElementsByTagName("globalCoordinateSystem")[0],svgDoc.getElementsByTagName("view")[0].getAttribute("id"),svgDoc.getElementsByTagName("view")[0]);
	try{
		var genericCRS =null;
		/**
		var genericCRS ={
			a : 1 ,
			b : 0 ,
			c : 0 ,
			d : 1 , // -1から1に変更　余計なお節介感があるので(2020/10/13)
			e : 0 ,
			f : 0 ,
			isSVG2 : false
		};
		**/
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
			genericCRS ={
				a : crs[0],
				b : crs[1],
				c : crs[2],
				d : crs[3],
				e : crs[4],
				f : crs[5],
				isSVG2 : isSVG2
			}
		} else {
			var gcsElem = svgDoc.getElementsByTagName("globalCoordinateSystem")[0];
			if ( gcsElem ){
				var tf = gcsElem.getAttribute("transform");
				if ( tf ){
					//		console.log("getcrs: svgDoc:",svgDoc);
					if (tf.indexOf("matrix")>=0){
						crs = gcsElem.getAttribute("transform").replace("matrix(","").replace(")","").split(",");
						if ( crs.length == 6){
							genericCRS ={
								a : Number(crs[0]) ,
								b : Number(crs[1]) ,
								c : Number(crs[2]) ,
								d : Number(crs[3]) ,
								e : Number(crs[4]) ,
								f : Number(crs[5]) ,
								isSVG2 : isSVG2
							}
						}
					} else if ( tf.toLowerCase()=="mercator"){ // 2020/3/24 add mercator support
						console.log("isMercator");
						genericCRS =  mercator();
						genericCRS.isSVG2 = false;
					} else if ( tf.indexOf("controller.")==0 ){ // この機能は動かしたことはない。未完成 2021/1/26
						var cntlWin = svgImagesProps[svgImagesProps[docId].rootLayer].controllerWindow;
						if ( cntlWin ){
							// 地図コンテンツ(のルートレイヤ)に紐づいたcontroller windowに(接頭詞の後に)同前の関数があればそれを設定する
							var tfName = tf.substring(11);
							if ( cntlWin[tfName]){
								genericCRS = cntlWin[tfName];
								if ( !genericCRS.isSVG2 ){
									genericCRS.isSVG2 = false;
								}
							}
						}
					} else if ( svgImagesProps[docId].script ){ // こちらは動作する実装
						// 地図コンテンツのscript要素中にtransform属性値と同前の関数があればそれを設定する
						var tFunc = svgImagesProps[docId].script.getFunction(tf);
						if ( tFunc ){
							genericCRS = tFunc();
							if ( !genericCRS.isSVG2 ){
								genericCRS.isSVG2 = false;
							}
						}
					}
				}
			//		console.log("found globalCoords",genericCRS);
			}
		}
//		console.log("genericCRS : ",genericCRS);
		if ( genericCRS == null ){
			console.warn("This document don't have CRS. Never renders. docId:",docId);
		}
		return ( genericCRS );
	} catch ( e ){
//		console.log( "No CRS:",new XMLSerializer().serializeToString( svgDoc ) );
		// CRSがない文書にとりあえず応じる 2014.5.27
		return {
			a : 1 ,
			b : 0 ,
			c : 0 ,
			d : 1 , // ここも同様 2020/10/13
			e : 0 ,
			f : 0 ,
			isSVG2 : false
		};
	}
}

// 定期的更新
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

function setController( svgDoc , docPath , svgImageProps){
//	console.log("called setController:",svgImageProps.controller);
	var cntPath = svgDoc.documentElement.getAttribute("data-controller");
	if ( svgImageProps.controller ){
		if ( cntPath ){
			svgImageProps.controller = "hash:"+cntPath+":"+svgImageProps.controller;
//			console.log("has Src and Hash:",svgImageProps.controller);
		}
	} else {
		if ( cntPath ){
			svgImageProps.controller =  getImageURL(cntPath , getDocDir(docPath));
		} else {
			//ルートコンテナの該当レイヤ要素にdata-controllerが指定されていた場合、該当のレイヤーにコントローラを設定する
			//コントローラの強さは右記の通り：レイヤーの最上位コンテナ > ルートコンテナ
			if(svgImageProps['parentDocId'] == 'root'){
				cntPath = getLayer(svgImageProps['rootLayer']).getAttribute('data-controller');
				if(!(cntPath === null || cntPath === undefined || cntPath === "")) {
					svgImageProps.controller =  getImageURL(cntPath , getDocDir(docPath));
				}
			}
		}
	}
}

function getViewBox( svgDoc ){
//	console.log(svgDoc);
//	console.log(svgDoc.documentElement);
//	console.log(svgDoc.getElementsByTagName("animation")[0]);
//	console.log(svgDoc.firstChild);
	var va = svgDoc.documentElement.getAttribute("viewBox");
	if ( va ){
		if ( va.indexOf("#") == 0 ){
			return (va.substring(1));
		} else if ( (va.trim()).indexOf("global")==0){ // 2020/3/25 global,x,y,w,hで、global coords(経度緯度)でviewBoxを指定できる機能
			var vb = trim(va).split(/[\s,]+/);
			var globalVB={
				x      : Number(vb[1]), // longitude(w)
				y      : Number(vb[2]), // latitude(s)
				width  : Number(vb[3]),
				height : Number(vb[4])
			}
			var rVB = getTransformedBox( globalVB , rootCrs );
			console.log("getViewBox:global,root:",globalVB, rVB, vb);
			return( rVB );
		} else {
			var vb = trim(va).split(/[\s,]+/);
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


function getTransformedBox( inBox , matrix){
	// transformRectと被っていると思われる・・ので実質統合化した 2020/10/22
	// console.log("called getTransformedBox: ac",accuracy, " : ", inBox , matrix ,getTransformedBox.caller);
	if ( !matrix.transform && matrix.b == 0 && matrix.c == 0 ){
		// 線形且つ b,c==0のときのみの簡易関数・・ もう不要な気はする・・
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
	} else if (!matrix.transform){ // 2021/2/22 debug c,d!=0対応してなかった
		var ptx=[];
		var pty=[];
		var iPart = 1;
		for ( var iy = 0 ; iy <=iPart ; iy++ ){
			for ( var ix = 0 ; ix <=iPart ; ix++ ){
				var pt = transform( inBox.x+ ix * inBox.width / iPart , inBox.y+ iy * inBox.height / iPart , matrix ) ;
				ptx.push(pt.x);
				pty.push(pt.y);
			}
		}
		
		var x = Math.min.apply(null,ptx);
		var y = Math.min.apply(null,pty);
		var width = Math.max.apply(null,ptx) - x;
		var height = Math.max.apply(null,pty) - y;
		return {
			x: x,
			y: y,
			width: width,
			height: height,
		}
		
	} else if ( matrix.transform){
		// transformRectと同様の処理に変更
		// 対角での処理から四隅に変更したが、もっと非線形なものはこれでもダメです 2020/10/20
		// ということで、p4..8を追加した・・・苦しぃ　何か根本的に変えるべき
		var ptx=[];
		var pty=[];
		var iPart = 4;
		for ( var iy = 0 ; iy <=iPart ; iy++ ){
			for ( var ix = 0 ; ix <=iPart ; ix++ ){
				var pt = matrix.transform( {x:inBox.x+ ix * inBox.width / iPart , y:inBox.y+ iy * inBox.height / iPart} ) ;
				ptx.push(pt.x);
				pty.push(pt.y);
			}
		}
		
		/**
		var x = Math.min(p0.x,p1.x,p2.x,p3.x);
		var y = Math.min(p0.y,p1.y,p2.y,p3.y);
		var width = Math.max(p0.x,p1.x,p2.x,p3.x) - x;
		var height = Math.max(p0.y,p1.y,p2.y,p3.y) - y;
		**/
		var x = Math.min.apply(null,ptx);
		var y = Math.min.apply(null,pty);
		var width = Math.max.apply(null,ptx) - x;
		var height = Math.max.apply(null,pty) - y;
//		console.log("getTransformedBox:",p0,p1,p2,p3,x,y,width,height);
		return {
			x: x,
			y: y,
			width: width,
			height: height,
		}
	} else {
		return ( null );
	}
}


// SVG2Geo,Geo2SVG:基本関数
function Geo2SVG( lat , lng , crs ){
	return ( transform(lng, lat, crs ) );
	/**
	return {
		x : crs.a * lng + crs.c * lat + crs.e ,
		y : crs.b * lng + crs.d * lat + crs.f
	}
	**/
}

function SVG2Geo( svgX , svgY , crs , inv ){
	var iCrs;
	if ( inv ){
		iCrs = inv;
	} else {
		iCrs = getInverseMatrix(crs);
	}
	if ( iCrs ){
		var ans = transform(svgX, svgY, iCrs);
		return {
			lng : ans.x ,
			lat : ans.y
		}
		/**
		return {
			lng : iCrs.a * svgX + iCrs.c * svgY + iCrs.e ,
			lat : iCrs.b * svgX + iCrs.d * svgY + iCrs.f
		}
		**/
	} else {
		return ( null );
	}
}

function transform( x , y , mat , calcSize , nonScaling){
//	console.log("called transform:", x , y , mat , calcSize , nonScaling);
	if ( calcSize == true ){
		if ( mat.transform ){
			var origin = mat.transform(0,0);
			var ans = mat.transform({x:x,y:y});
			ans.x = ans.x - origin.x;
			ans.y = ans.y - origin.y;
//			console.log("transform:size:",ans);
			return ( ans );
		} else {
			return {
				x : mat.a * x + mat.c * y  ,
				y : mat.b * x + mat.d * y 
			}
		}
	}
	
	if ( nonScaling ){ // vector Effect 2014.5.12
		if ( mat ){
			if ( mat.transform ){
				var ans = mat.transform({x:nonScaling.x,y:nonScaling.y});
				ans.x = ans.x + x;
				ans.y = ans.y + y;
//				console.log("transform:nonScaling:",ans);
				return ( ans );
			} else {
				return {
					x : mat.a * nonScaling.x + mat.c * nonScaling.y + mat.e + x ,
					y : mat.b * nonScaling.x + mat.d * nonScaling.y + mat.f + y
				}
			}
		} else {
			return {
				x : nonScaling.x + x ,
				y : nonScaling.y + y
			}
		}
	}
	
	if ( mat ){
		if ( mat.transform ){
//			console.log("called nonlinear transform:",x,y," caller:",transform.caller);
			var ans = mat.transform({x:x,y:y});
//			console.log("ans:",ans);
			return (ans );
		} else {
			return {
				x : mat.a * x + mat.c * y + mat.e ,
				y : mat.b * x + mat.d * y + mat.f
			}
		}
	} else {
		return {
			x : x ,
			y : y
		}
	}
}

function getConversionMatrixViaGCS( fromCrs , toCrs ){
	// Child 2 Rootのzoomを計算できるよう、ちゃんとした式を算出するように変更 2012/11/2
	var ifCrs = getInverseMatrix(fromCrs);
	
	if ( toCrs.transform || fromCrs.transform ){ // マトリクスの代わりに関数を返却する 2020.3.17
		var itCrs = getInverseMatrix(toCrs);
		// スケールはどうするか‥　原点でのスケールにしておくか？ TBD
		var conversionFunc = function( inCrd ){
			var globalCrds = transform(inCrd.x, inCrd.y, ifCrs);
//			var ans = toCrs.transform(globalCrds);
			var ans = transform(globalCrds.x, globalCrds.y, toCrs);
//			console.log("in:",inCrd,"  globalCrd:",globalCrds," rootCrd:",ans);
			return ( ans );
		}
		var inverseFunc = function(inCrd ){
//			var globalCrds = toCrs.inverse(inCrd);
			var globalCrds = transform(inCrd.x, inCrd.y, itCrs);
			var ans = transform(globalCrds.x, globalCrds.y, fromCrs);
			return ( ans );
		}
		var scale, sif, sit;
		if ( ifCrs.inverse ){
			sif = ifCrs.scale;
		} else {
			sif = Math.sqrt( Math.abs(ifCrs.a * ifCrs.d - ifCrs.b * ifCrs.c ) );
		}
		if ( toCrs.inverse ){
			st = toCrs.scale;
		} else {
			st = Math.sqrt( Math.abs(toCrs.a * toCrs.d - toCrs.b * toCrs.c ) );
		}
		/**
		if ( ifCrs.inverse ){
//			scale = (1/ifCrs.scale) * toCrs.scale; // インバースのインバースになってる・これはバグだと思う 2020/6/9
			scale = ifCrs.scale * toCrs.scale;
		} else {
			scale = Math.sqrt( Math.abs(ifCrs.a * ifCrs.d - ifCrs.b * ifCrs.c ) ) * toCrs.scale;
		}
		**/
		scale = sif * st;
		return {
			transform: conversionFunc,
			inverse: inverseFunc,
			scale: scale
		};
	}
	
	var a = toCrs.a * ifCrs.a + toCrs.c * ifCrs.b;
	var b = toCrs.b * ifCrs.a + toCrs.d * ifCrs.b;
	var c = toCrs.a * ifCrs.c + toCrs.c * ifCrs.d;
	var d = toCrs.b * ifCrs.c + toCrs.d * ifCrs.d;
	
	var e = toCrs.a * ifCrs.e + toCrs.c * ifCrs.f + toCrs.e;
	var f = toCrs.b * ifCrs.e + toCrs.d * ifCrs.f + toCrs.f;
	
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

function matMul( m1 , m2 ){ // getConversionMatrixViaGCSとほとんど同じでは？
	// m1: 最初の変換マトリクス
	// m2: 二番目の変換マトリクス
	// x',y' = m2(m1(x,y))
	
	// 2020/3/17 マトリクスでなくtransform(関数)がある場合、それらの積の関数を返却する
	if ( m1.transform || m2.transform){
		var mulFunc = function(inp){
			var int1,ans;
			if ( m1.transform ){
				int1 = m1.transform(inp);
			} else {
				int1 = transform(inp.x, inp.y, m1);
			}
			if ( m2.transform ){
				ans = m2.transform(int1);
			} else {
				ans = transform(int1.x, int1.y, m2);
			}
			return ( ans );
		}
		return ( {transform:mulFunc} ); // inverseがないのは不十分だと思われる 2020/8/18
	}
	return {
		a: m2.a * m1.a + m2.b * m1.b ,
		b: m2.b * m1.a + m2.d * m1.b ,
		c: m2.a * m1.c + m2.c * m1.d ,
		d: m2.b * m1.c + m2.d * m1.d ,
		e: m2.a * m1.e + m2.c * m1.f + m2.e ,
		f: m2.b * m1.e + m2.d * m1.f + m2.f
	}
}

// child SVG文書のrootSVG文書座標系における領域サイズを計算
// ちゃんとした式で演算数を改善し、scaleも常に算出できるようにした (2012/11/2)
// (子だけでなく、孫も対応(CRSをベースとしてるので))
// 2020/10/20 整理
function transformRect_duplicated( rect ,  c2r ){ // 廃止
//	console.log("transformRect:",rect ,  c2r);
	var x , y , width , height;
//	var c2r = getChild2RootMatrix( rootCrs , childCrs );
	var mm;
	if ( ! rect.transform ){
		mm = c2r;
	} else {
		mm = matMul( rect.transform , c2r );
	}
	var pos1 = transform( rect.x , rect.y , mm );
	var pos2 = transform( rect.x + rect.width , rect.y + rect.height , mm );
	var pos3 = transform( rect.x , rect.y + rect.height , mm );
	var pos4 = transform( rect.x + rect.width , rect.y , mm );
	x = Math.min(pos1.x, pos2.x, pos3.x, pos4.x);
	y = Math.min(pos1.y, pos2.y, pos3.y, pos4.y);
	width  = Math.max(pos1.x, pos2.x, pos3.x, pos4.x) - x;
	height = Math.max(pos1.y, pos2.y, pos3.y, pos4.y) - y;
	return {
		x : x ,
		y : y ,
		width : width ,
		height : height ,
		c2rScale : c2r.scale // mm.scaleじゃなくて良いのか？ 2020/10/20
	}
}

function transformRect( rect ,  c2r ){ // 2020/10/22 getTransformedBox()を使うようにした
//	console.log("transformRect:",rect ,  c2r);
	var x , y , width , height;
//	var c2r = getChild2RootMatrix( rootCrs , childCrs );
	var mm;
	if ( ! rect.transform ){
		mm = c2r;
	} else {
		mm = matMul( rect.transform , c2r );
	}
	
	var tbox = getTransformedBox( rect , mm)
	
	tbox.c2rScale = c2r.scale; // mm.scaleじゃなくて良いのか？ 2020/10/20
	
	return ( tbox );
	
}




// 逆座標変換のための変換マトリクスを得る
function getInverseMatrix( matrix ){
	if ( matrix.inverse ){
		return { 
			transform: matrix.inverse,
			inverse: matrix.transform,
			scale: 1/matrix.scale
		};
	} else {
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
}

// 指定した要素がzoomrange内にあるかどうかを返事する
function inZoomRange( ip , zoom , c2rScale ){
//	console.log("c2rs:" + c2rScale );
	if ( !ip || (!ip.minZoom && !ip.maxZoom) ){
		// プロパティない場合はtrue
		return ( true );
	} else {
//		console.log("EVAL ZOOM : zoom:" + zoom + " min:" + ip.minZoom + " max:" + ip.maxZoom);
//		console.log("EVAL ZOOM : zoom*c2rScale:" + (zoom*c2rScale) + " min:" + ip.minZoom + " max:" + ip.maxZoom+"  :: zoom:"+zoom+"  c2rScale:"+c2rScale);
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
function getZoom( s2c , docId){ // 2020/5/13 docId(というよりレイヤーID)によって、演算パラメータを変化させる機能を実装
	var ans ;
	var layerId = svgImagesProps[docId].rootLayer;
	if ( layerDevicePixelRatio[layerId]!= undefined){
		ans = ( Math.abs(s2c.a) + Math.abs(s2c.d) ) / ( 2.0 * layerDevicePixelRatio[layerId] );
	} else {
		ans = ( Math.abs(s2c.a) + Math.abs(s2c.d) ) / ( 2.0 * commonDevicePixelRatio );
	}
//	console.log("getZoom:",ans,"  layerId:",layerId,"  layerDPR:",layerDevicePixelRatio[layerId]);
	return ( ans );
		
	// 本当は、 Math.sqrt(Math.abs(s2c.a * s2c.d - s2c.b * s2c.c ) )
//		return ( Math.sqrt(Math.abs(s2c.a * s2c.d - s2c.b * s2c.c ) ) );
//		return ( ( Math.abs(s2c.a) + Math.abs(s2c.d) ) / ( 2.0 * commonDevicePixelRatio ) );
}

function setDevicePixelRatio( dpr , layerId ){
//	console.log("setDevicePixelRatio: ratio:",dpr,"  layerId:",layerId);
	// 2020/5/13 layerId毎に指定するlayerDevicePixelRatio設定＆クリア機能を追加
	if( layerId ){
		if ( dpr > 0 ){
			layerDevicePixelRatio[layerId] = dpr;
		} else if ( !dpr ){
			delete layerDevicePixelRatio[layerId];
		}
	} else {
		if ( dpr > 0 ){
			commonDevicePixelRatio = dpr;
		} else if ( !dpr ){
			commonDevicePixelRatio = 1;
			layerDevicePixelRatio = [];
		}
	}
}

function getDevicePixelRatio(docId){
	if ( !docId ){
		return {
			commonDevicePixelRatio:commonDevicePixelRatio,
			layerDevicePixelRatio:layerDevicePixelRatio
		};
	} else {
		var layerId = svgImagesProps[docId].rootLayer;
		if ( layerDevicePixelRatio[layerId]!= undefined){
			return ( layerDevicePixelRatio[layerId] );
		} else {
			return ( commonDevicePixelRatio );
		}
	}
}

// POI,タイル(use,image要素)のプロパティを得る DIRECTPOI,USEDPOIの処理に変更2018.3.2
function getImageProps( imgE , category , parentProps , subCategory , GISgeometry){
	var x, y, width, height, meta, title, elemClass, href, transform, text , cdx , cdy , href_fragment ;
	var nonScaling = false;
	cdx = 0;
	cdy = 0;
	var pixelated = false;
	var imageFilter = null;
	if ( !subCategory && category == POI){ // subCategory無しで呼び出しているものに対するバックワードコンパチビリティ・・・ 2018.3.2
//		console.log("called no subCategory  imgE:",imgE);
		subCategory = USEDPOI;
	}
	if ( category == EMBEDSVG || category == BITIMAGE || subCategory == DIRECTPOI ){
		if ( category == EMBEDSVG && subCategory == SVG2EMBED ){ // svg2のsvgインポート
//			console.log(imgE);
			href = imgE.getAttribute("src");
			
			// original 2014.2.25 by konno
//			if ( typeof contentProxyParams.getUrlViaProxy == "function" ){ // このルーチンはもっとサイドエフェクトが小さいところ(実際にXHRしている場所)に移動 s.takagi 2016.8.10
//				//Proxyサーバ経由でアクセス
//				href = contentProxyParams.getUrlViaProxy(href);
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
		} else { // svg1のsvgインポート及び svg1,svg2のビットイメージ(含DIRECTPOI)インポート
			var tf = getNonScalingOffset(imgE);
			if ( tf.nonScaling ){
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
			width = Number(imgE.getAttribute("width")); // nonScalingではwidth,heightの値はisIntersectでは0とみなして計算するようにします
			height = Number(imgE.getAttribute("height"));
			href = imgE.getAttribute("xlink:href");
			if ( ! href ){
				href = imgE.getAttribute("href");
			}
			if ( ! href ){
				href = "";
			}
			if ( href.indexOf("#")>0 && href.indexOf("xywh=", href.indexOf("#") )>0){ // 2015.7.3 spatial fragment
				href_fragment = (href.substring( 5+href.indexOf("xywh=" ,  href.indexOf("#") ) ));
				href = href.substring(0,href.indexOf("#")); // ブラウザが#以下があるとキャッシュ無視するのを抑止
			}
			
			if ( GISgeometry){
				if ( category == BITIMAGE && !nonScaling ){ // 2018.2.26
					// transformのあるものはまだうまく処理できてないです・・　まぁこの最初のユースケースのcesiumでも非対角ありtransformのあるイメージはうまく処理できないので・・
					// さらに、 nonScalingはPOIとして処理して良いと思うが・・ 2018.3.2 まず、parse*側でnonScalingなimageをPOIに改修
					GISgeometry.svgXY = [];
					GISgeometry.svgXY[0] = [x,y];
					GISgeometry.svgXY[1] = [x+width,y+height];
					GISgeometry.transform = transform; 
					GISgeometry.href = href; 
					//				console.log("Set Coverage geometry",GISgeometry);
				} else if ( subCategory == DIRECTPOI ){ // 2018.3.2 上の話を改修した部分
					GISgeometry.svgXY = [x,y];
				}
			}
			
			if ( subCategory == DIRECTPOI){ // 2018.3.2
				meta = imgE.getAttribute("content");
				title = imgE.getAttribute("xlink:title");
			}
			
			// このルーチンはもっとサイドエフェクトが小さいところ(実際にXHRしている場所)に移動 s.takagi 2016.8.10
//			if ( typeof contentProxyParams.getUrlViaProxy == "function" ){
				//Proxyサーバ経由でアクセス
//				href = contentProxyParams.getUrlViaProxy(href);
//			}
		}
		elemClass = imgE.getAttribute("class");
		
		if ( category == BITIMAGE  && ( (imgE.getAttribute("style") && imgE.getAttribute("style").indexOf("image-rendering:pixelated")>=0) || (parentProps && parentProps["image-rendering"]  && parentProps["image-rendering"]  == "pixelated") ) ){
//			console.log("pixelated");
			pixelated = true;
		}
		
		if ( category == BITIMAGE ){
			if ( imgE.getAttribute("style") && imgE.getAttribute("style").indexOf("filter")>=0  ){ // bitimageのfilterは継承させてない
//			console.log("filter");
				var fls = imgE.getAttribute("style")+";";
				fls = fls.substring(fls.indexOf("filter:"));
				fls = fls.substring(7,fls.indexOf(";"));
				imageFilter = fls;
			/** これと styleCatalog[]を編集すれば多分継承するけれど　やめておく
			} else if ( parentProps && parentProps["filter"] ){
				imageFilter = parentProps["filter"];
			**/
			}
		}
		
	} else if ( subCategory == USEDPOI ){ // USEDによるPOI
		var tf = getNonScalingOffset(imgE);
		if ( tf.nonScaling ){ // non scaling POI
			nonScaling = true;
			x = tf.x;
			y = tf.y;
			if ( imgE.getAttribute("x") ){ 
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
		width = 0; // ??? そうなの？ 2014.7.25  nonScalingのときのみの気がする・・
		height = 0;
		meta = imgE.getAttribute("content");
		title = imgE.getAttribute("xlink:title");
//		console.log("meta:"+meta);
		href = imgE.getAttribute("xlink:href");
		if ( GISgeometry ){ // 2016.12.1 scaling でもnon scalingでもここで出たx,yがそのsvg座標におけるPOIの中心位置のはず
			GISgeometry.svgXY = [x,y];
		}
	} else if ( category == TEXT ){
		var tf = getNonScalingOffset(imgE);
		if ( tf.nonScaling ){
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
		if (nonScaling){
			height = 0; // 2018.2.23 上の決め打ちはnon-scalingの場合まずい・・・ 拡大すると常にビューポートに入ってしまうと誤解する。これならたぶん0にした方がベター
		}
		width = height; // 適当・・ 実際は文字列の長さに応じた幅になるはずだが・・・ ISSUE
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
		href_fragment : href_fragment,
		pixelated : pixelated,
		imageFilter : imageFilter,
	}
}


// HTTP通信用、共通関数
function createXMLHttpRequest(cbFunc, timeoutFunc){
//	console.log("createXMLHttpRequest:" + cbFunc);
	var XMLhttpObject = null;
	try{
		XMLhttpObject = new XMLHttpRequest();
//		console.log("use standard ajax");
	}catch(e){
		alert("Too old browsers: not supported");
		/**
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
		**/
	}
	if (XMLhttpObject) XMLhttpObject.onreadystatechange = cbFunc;
//	XMLhttpObject.withCredentials = true; // 認証情報をCORS時に入れる(ちょっと無条件は気になるが・・ CORSがワイルドカードだとアクセス失敗するので一旦禁止) 2016.8.23
	if ( timeoutFunc ){ // 2020/2/13 timeout処理機能を追加
		if ( !uaProp.MS ){ // 2020/2/17 IEはエラーになるためopen後に実行する
			XMLhttpObject.timeout = loadingTransitionTimeout;
		}
		XMLhttpObject.ontimeout  = timeoutFunc;
	}
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

function isIntersect( rect1 , rect2 ){
//	console.log( rect1 , rect2 );
	var sec1, sec2;
	if ( rect1.nonScaling ){ // nonScaling設定の時はサイズ０として判断するようにする 2018.3.2
		sec1 = { x:rect1.x,y:rect1.y,width:0,height:0 }
	} else {
		sec1 = rect1;
	}
	if ( rect2.nonScaling ){
		sec2 = { x:rect2.x,y:rect2.y,width:0,height:0 }
	} else {
		sec2 = rect2;
	}
	
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
//	if ( svgImages[imageId] && !svgImagesProps[imageId].editable){} // 仕様変更 2019/3/20 editableレイヤーでも、DOMを消去することにした
	if ( svgImages[imageId] ){
//		console.log("remove:" + imageId);
		var anims = getLayers(imageId);
		for ( var i = 0 ; i < anims.length ; i++ ){
			removeChildDocs( anims[i].getAttribute("iid") );
		}
//		console.log("delete",svgImage[imageId]);
		if ( svgImagesProps[imageId].script ){
			svgImagesProps[imageId].script.handleScriptCf(true); // やはりこの仕組みは一度見直しが必要・・・ 2018.9.7
		}
		delete svgImages[imageId];
		delete svgImagesProps[imageId];
	} else if ( svgImagesProps[imageId] && svgImagesProps[imageId].loadError ){
		delete svgImagesProps[imageId];
	}
}

// DOM操作などでdocが追加削除されると、上の関数だけではメモリリークする可能性がある(インターバルrefreshなど) 2019.5.22
// usedImages[]を使って使われていないドキュメントを消していく
function removeUnusedDocs(){
	// console.log("removeUnusedDocs: usedImages: ", usedImages);
	var delKeys=[];
	for ( key in svgImages ){
		// console.log("key:",key,"  is Used?:",usedImages[key]);
		if ( !usedImages[key] ){
			delete svgImages[key];
			delete svgImagesProps[key];
			if ( GISgeometries ){
				delete GISgeometries[key]; // 2020/01/23 added
			}
			delKeys.push(key);
		}
	}
	if ( delKeys.length > 0 ){
		console.log("removeUnusedDocs : docId:",delKeys," are no longer used. Delete it.");
	}
}

function setLayerListSize(){
	var llElem = document.getElementById("layerList");
	// id:layerList 要素はwidthが"px"で指定されていなければならない・・　とりあえず
	var llElemSize = llElem.style.width;
	if ( ! llElemSize || llElemSize.indexOf("px")<0 ){
		llElem.style.width = ( mapCanvasSize.width * 0.5 - spButtonSize - 5 ) + "px";
		llElemSize = llElem.style.width;
	}
	llElemSize = Number ( llElemSize.substring(0,llElemSize.indexOf("px")));
	if ( ! llElem.dataset.originalSize ){
		llElem.dataset.originalSize = llElemSize;
	}
//	console.log("llElem.dataset.originalSize:",llElem.dataset.originalSize);
	if ( spButtonSize + 5 + Number(llElem.dataset.originalSize) > mapCanvasSize.width ){
		var modSize = mapCanvasSize.width - (spButtonSize + 7);
		llElem.style.width = modSize + "px";
//		llElem.style.right = (spButtonSize + 5) + "px";
	} else {
		llElem.style.width = llElem.dataset.originalSize + "px";
	}
}

var spButtonSize = 50;
function initNavigationUIs( isSP ){
	
	// 2017.8.15 Add scroll bar on iOS safari scrollable elements :: なぜかinsertRuleはerrorで動かない・・
	// see https://stackoverflow.com/questions/3845445/how-to-get-the-scroll-bar-with-css-overflow-on-ios
	var stylesheet = document.createElement("style");
	stylesheet.innerHTML="::-webkit-scrollbar{-webkit-appearance:none;width:7px;}::-webkit-scrollbar-thumb{border-radius:4px;background-color:rgba(0,0,0,.5);-webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);}";
	document.documentElement.appendChild(stylesheet);
	
	// 2017.8.15 iPhone Safari landscape mode issue fix 
	// see: https://stackoverflow.com/questions/33039537/ios9-mobile-safari-landscape-css-bug-with-positionabsolute-bottom0
	var htmlStyle = document.documentElement.style;
	htmlStyle.position="fixed";
	htmlStyle.width="100%";
	htmlStyle.height="100%";
	htmlStyle.overflow="hidden";
	
	
	var zub = document.getElementById("zoomupButton");
	var zdb = document.getElementById("zoomdownButton");
	var gpsb = document.getElementById("gpsButton");
	var llElem = document.getElementById("layerList");
	var customBtns=document.getElementsByClassName("customButton");
//	console.log("customBtns:",customBtns);
	if ( isSP ){
		var topCrd = 0;
		if ( zub ){
			zub.width = spButtonSize;
			zub.height = spButtonSize;
			zub.style.top = topCrd  + "px";
			topCrd += spButtonSize + 5;
		}
		
		if ( zdb ){
			zdb.width = spButtonSize;
			zdb.height = spButtonSize;
			zdb.style.top = topCrd  + "px";
			topCrd += spButtonSize + 5;
		}
		
		if ( gpsb ){
			gpsb.width = spButtonSize;
			gpsb.height = spButtonSize;
			gpsb.style.top = topCrd  + "px";
			topCrd += spButtonSize + 5;
		}
		
		
		if (customBtns){
			for ( var i = 0 ; i < customBtns.length ; i++ ){
				customBtns[i].width = spButtonSize;
				customBtns[i].height = spButtonSize;
				customBtns[i].style.top = topCrd  + "px";
				topCrd += spButtonSize + 5;
			}
		}
		
		if ( topCrd>0 && llElem ){ // いずれかのボタンがある場合(topCrd>0)はレイヤUIをボタン横に移動
			llElem.style.left = (spButtonSize + 5 ) + "px";
		}
	}
	if ( llElem ){
		setLayerListSize();
	}
	if ( zub ){
		zub.style.cursor = "pointer";
	}
	if ( zdb ){
		zdb.style.cursor = "pointer";
	}
	if ( gpsb ){
		gpsb.style.cursor = "pointer";
	}
	if (customBtns){
		for ( var i = 0 ; i < customBtns.length ; i++ ){
			customBtns[i].style.cursor = "pointer";
		}
	}
	
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

	/**
	if( typeof window.onmousewheel != 'undefined' ){
		window.onmousewheel = testWheel;
	} else if( window.addEventListener ){
		window.addEventListener( 'DOMMouseScroll', testWheel, false );
	}
	**/
	window.addEventListener( 'wheel', testWheel, false );
	
}

function testWheel( evt ){
//	console.log("Wheel:",evt,evt.deltaY );
	if (evt.deltaY < 0 || evt.detail < 0 || evt.wheelDelta > 0 ){
		//evt.preventDefault();
		zoomup();
	} else if ( evt.deltaY > 0 || evt.detail > 0 || evt.wheelDelta < 0 ){
		//evt.preventDefault();
		zoomdown();
	}
}


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

function checkBrowserName(){
	var name;
	var MS = false;
	var IE = false;
	var Blink = false;
	var Edge = false;
	var old = false;
	var smartPhone = checkSmartphone();
	if ( navigator.userAgent.indexOf("Trident")>=0 ){
		name = "IE";
		MS = true;
		IE = true;
	} else if ( navigator.userAgent.indexOf("MSIE")>=0 ){
		name = "IE";
		MS = true;
		IE = true;
		old = true;
	} else if ( navigator.userAgent.indexOf("Edge")>=0 ){
		name = "Edge";
		MS = true;
		Edge = true;
	} else if ( navigator.userAgent.indexOf("Firefox")>=0 ){
		name = "Firefox";
	} else if ( navigator.userAgent.indexOf("Opera")>=0 ){
		name = "Opera";
		Blink = true;
	} else if ( navigator.userAgent.indexOf("Safari")>=0 && navigator.userAgent.indexOf("Chrome")<0){ // これも要注意・・
		name = "Safari";
	} else if ( navigator.userAgent.indexOf("Chrome")>=0 ){ // ChromeはEdgeにも文字列含まれてるので要注意・・
		name = "Chrome";
		Blink = true;
	}
	
	return{
		name: name,
		MS: MS,
		IE: IE,
		Edge: Edge,
		Blink: Blink,
		smartPhone: smartPhone,
		old : old,
	}
}

// 中心座標を提供するUIのオプション(2012/12/7)
	
function setCenterUI(){
	// 照準を中心位置に
	var centerSight;
	if (document.getElementById("centerSight") ){
		centerSight = document.getElementById("centerSight");
	} else {
		centerSight = document.createElement("img");
		centerSight.setAttribute("id","centerSight");
		centerSight.setAttribute("src",builtinIcons.xcursor);
		centerSight.setAttribute("width",15);
		centerSight.setAttribute("height",15);
		centerSight.style.opacity="0.5";
		document.documentElement.appendChild(centerSight);
	}
	
	centerSight.style.position = "absolute";
	centerSight.style.top = ((mapCanvasSize.height / 2) - document.getElementById("centerSight").height / 2 ) + "px";
	centerSight.style.left = ((mapCanvasSize.width / 2) - document.getElementById("centerSight").width / 2 ) + "px";
	initTicker(); // 照準があるときは、Ticker機能をONにする 2013/1/11
	
	// 照準をクリックするとオブジェクトを問い合わせる機能を実装(2013/12/05)
//		addEvent(centerSight, "mousedown", testCSclick); // Obsolute 2018.01.31
	
	
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
		var cent = getCentralGeoCoorinates();
//		console.log("centralGeo:", cent.lat , cent.lng);
		centerPos.innerHTML = round(cent.lat,6) + " , " + round(cent.lng,6);
	}
	if ( vScale ){ // 50pxのたてスケールに相当する長さをKmで表示
		vScale.innerHTML = round(getVerticalScreenScale( 50 ), 3 ) + "Km";
	}
}

// ユーザ定義を可能とする中心座標書き換え
function setUpdateCenterPos(func){
	if ( func ){
		updateCenterPos = func;
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
// lat,lng:必須 radius:[lat-side-deg]オプション(今の縮尺のまま移動) ( setGeoViewPort(lat,lng,h,w) という関数もあります )
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
		if ( rootCrs.d ){
			vh = Math.abs(rootCrs.d * radius); // SVGの縦幅
		} else { // 2020.3.26 for non linear projection
			var p0 = transform(lng, lat-(radius/2.0), rootCrs);
			var p1 = transform(lng, lat+(radius/2.0), rootCrs);
			vh = Math.abs(p0.y-p1.y);
		}
		vw = vh * rootViewBox.width / rootViewBox.height;
	}
	
	var rsc = Geo2SVG( lat , lng , rootCrs ); // 中心のSVG座標
	var vx = rsc.x - vw / 2.0;
	var vy = rsc.y - vh / 2.0;
	
	rootViewBox.x = vx;
	rootViewBox.y = vy;
	rootViewBox.width = vw;
	rootViewBox.height = vh;
	
//	var s2c = getRootSvg2Canvas( rootViewBox , mapCanvasSize );
	refreshScreen();
}

// 地理(グローバル)座標系で指定したエリアを包含する最小のviewportを設定する
function setGeoViewPort( lat, lng, latSpan , lngSpan , norefresh){
//	console.log("call setGeoViewPort: ", lat, lng, latSpan , lngSpan );
	if (  !latSpan || !lngSpan ){
		return ( false );
	}
	
	hideAllTileImgs();
	
	rootViewBox = getrootViewBoxFromGeoArea( lat, lng, latSpan , lngSpan , ignoreMapAspect);
	
//	var s2c = getRootSvg2Canvas( rootViewBox , mapCanvasSize );
	
	if ( ! norefresh ){
		refreshScreen();
	} else {
		geoViewBox = getTransformedBox( rootViewBox , root2Geo ); // setGeoViewPortだけではgeoViewBox設定されずバグ 2016.12.13 --> 2017.1.31 ここに移設
	}
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

	var gpsif; // 2017.8.15 for iOS safari issues? 
function setGps(){
	var gpsb = document.getElementById("gpsButton");
	if (gpsb) {
		if ( navigator.geolocation){
//			alert( "I can use GPS!");
			//* move to initNavigationUIs() gpsb.styling
			
			// for safari issue hack
			// なぜかiOS SafariはsvgMapが動いているとgeolocationAPIがまともに動かないので、別window(iframe)でgoelocationさせるHackを実装 2017.6
			if ( isSP && navigator.userAgent.indexOf("Safari") > 0 && navigator.userAgent.indexOf("Chrome") < 0){
				gpsif = document.createElement("iframe");
				document.documentElement.appendChild(gpsif);
				console.log( "contentWindow:",gpsif.contentWindow.document );
				var ifd = gpsif.contentWindow.document.documentElement;
				var script = gpsif.contentWindow.document.createElement("script");
				gpsif.style.display="none";
				script.innerHTML='function gps(){navigator.geolocation.getCurrentPosition( gpsSuccess );}function gpsSuccess(position){window.parent.svgMap.gpsCallback(position)}';
				ifd.appendChild(script);
			}
			
		} else {
			gpsb.style.display="none";
//			alert( "I can NOT use GPS..");
		}
		/** move to initNavigationUIs()
		gpsb.style.cursor = "pointer";
		**/
	}
}

function gps(){
	if ( isSP && navigator.userAgent.indexOf("Safari") > 0 && navigator.userAgent.indexOf("Chrome") < 0){
//	console.log(gpsif.contentWindow);
		gpsif.contentWindow.gps();
	} else {
		navigator.geolocation.getCurrentPosition( gpsSuccess );
	}
}

function gpsSuccess(position){
//	alert("lat:" + position.coords.latitude + " lng:" + position.coords.longitude + " acc:" + position.coords.accuracy);
//	console.log("Callback from iframe lat:" + position.coords.latitude + " lng:" + position.coords.longitude + " acc:" + position.coords.accuracy);
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

	// レイヤーのID,title,番号,href(URI)のいずれかで、ルートコンテナSVGDOMにおけるレイヤーの(svg:animation or svg:iframe)要素を取得する
	// getLayersと似ているが、getLayersのほうは任意のsvg文書(オプションなしではroot container)に対して、内包されるレイヤーのリストを返却。こちらはrootコンテナに対して検索キーに基づいてレイヤーを返却する
function getLayer(layerID_Numb_Title){
	var layer=null;
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
	} else { // 数字（レイヤ番号）の場合
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

	
// ルートコンテナにおける"レイヤ"概念のレイヤidを検索する
// 検索に用いることができるのは、getLayerと同じtitle,url,もしくはルートレイヤの要素
function getLayerId( layerKey ){
	var ans = null;
	if ( layerKey.getAttribute ){
//		ans = layerElement.getAttribute("iid"); // これバグ？？
		ans = layerKey.getAttribute("iid");
	} else {
		var layer = getLayer( layerKey );
		if ( layer ){
			ans = layer.getAttribute("iid");
		}
	}
	return ( ans );
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
		refreshScreen();
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
				return ( getElementByImgIdNoNS( svgImages["root"] , key) );
			}
		}
		return ( null );
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
	//
	// 2016.10.6 switch , batchは、本来グループに対して与えられる特性なのだが、どこかのレイヤーの中で宣言されていて他では宣言されていないるような場合、おかしなことが起きる。それを防ぐため、どこか一つだけで宣言されていればその特性がグループ全体に与えられたように返却することにした。アーキテクチャがまずいと思う・・・
	var swLayers = new Array();
	var hasCatClasses = new Array();
	var layers = getLayers();
	for ( var i = 0 ; i < layers.length ; i++ ){
		if ( layers[i].getAttribute("class") ){
//			console.log(layers[i].getAttribute("class")+ " : " + layers[i].getAttribute("title"));
			var layerClass = (layers[i].getAttribute("class")).split(" ");
			
			var hasCat;
			if ( cat ){
				if ( layerClass.indexOf(cat)== -1 ){
					hasCat = false;
				} else {
					hasCat = true;
				}
			} else {
				hasCat = true;
			}
			
			layerClass = removeLayerCatName( layerClass , "switch" , "batch" , "editable" , "clickable" );
			
			
			for ( j = 0 ; j < layerClass.length ; j++ ){
				if ( !swLayers[layerClass[j]] ){
					swLayers[layerClass[j]] = new Array();
				}
				
				if ( hasCat ){
					hasCatClasses[layerClass[j]] = true;
				}
//				console.log("push "+ layerClass[j] );
//				console.log("of "+ layers[i].getAttribute("title") );
				
				swLayers[layerClass[j]].push(layers[i]);
			}
		}
	}
	
	if ( cat ){
		for ( var i in swLayers ){
			if ( !hasCatClasses[i] ) {
				delete swLayers[i];
			}
		}
	}
	
	return ( swLayers );
	
}

function checkLayerSwitch( selectedLayer ){
	// 選択したレイヤーの表示非表示が切り替えられるかどうか、切り替えられるとしてその代わりに選択を外すレイヤーあればそのリスト(array)を返す。(なければ単にtrue)
	// 2016.10.6 getSwLayers()と同じ改修 どこかのレイヤーでそのグループにswitchがつけられていた時にswitchとして動かす
	//	console.log("Call checkLayerSwitch");
	
	var selectedLayerClass;
	if ( selectedLayer.getAttribute("class")) {
		selectedLayerClass = selectedLayer.getAttribute("class").split(" ");
		
//		selectedLayerClass = removeLayerCatName( selectedLayerClass , "batch" , "editable" , "clickable" ); じゃないの? 2014.08
		selectedLayerClass = removeLayerCatName( selectedLayerClass , "batch" , "editable" , "clickable" , "switch" );
		
	} else {
//		console.log("No Class");
		// classが設定されていないレイヤーはＯＫを返す
		return(true);
	}
	
//	console.log("selectedLayerClass:" + selectedLayerClass);
	
	var swLayers = getSwLayers("switch"); // switch 属性のレイヤーグループ名を検索
	var layerIsSwitch = false;
	for ( var i in swLayers ){
		if ( selectedLayerClass.indexOf(i) != -1 ){
			layerIsSwitch = true;
			break;
		}
	}
	
	if ( layerIsSwitch ){
//		console.log("This selection is switch!");
		if ( selectedLayer.getAttribute("visibility") == "hidden" || selectedLayer.getAttribute("display") == "none" ){
			// 表示されていないものを表示させる
			
			// 代わりに非表示にすべきレイヤーのリストを生成する
			// スイッチ型レイヤーリストを得る
			var swLayers = getSwLayers(); // これは多分不必要・・2016.10
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
// オプションなしの場合、ルートSVGコンテナのレイヤーに該当する要素をリストアップし、返却する
// オプションアリの場合、そのidを持つコンテナのレイヤー該当要素群を返却
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


// ルートコンテナの(animetion||iframeで構成される)レイヤー情報を取得する。
// Arrayが返却、並び順はsvgのルートコンテナと同じ（最初のレイヤーが一番下。selectメニュー創るときはひっくり返して使うこと）
// 名称、表示非常時状態、レイヤーグループ、グループのフィーチャ(バッチ||スイッチ||ふつう)、編集可、編集中、対応SVGドキュメント、っ個別ユーザインターフェース、個別凡例
//
// Supported Props.
// id : id for svgImages, svgImagesProps, html-dom(id), svg-dom(iid)
// url : url for svg docs
// href : href for svg docs
// title : layer name on title attr.
// visible : currently visible?
// editable : it is markked as editable layer
// editing : currently editing
// groupName : belonging group name ( assigned by class prop )
// groupFeature (switch||batch||) : group's special feature, switch:choose one,  batch:visible all/invisible all opt ( assigned by class prop )

function getRootLayersProps(){
	var switchGroups = getSwLayers("switch");
	var batchGroups = getSwLayers("batch");
	
	var layers = getLayers();
	var layersProps = new Array();
	for ( var i = 0 ; i < layers.length ; i++ ){
		layersProps[i] = new Object();
		layersProps[i].id = layers[i].getAttribute("iid");
		layersProps[i].number = i;
		if ( svgImagesProps[layersProps[i].id] && svgImages[layersProps[i].id] && !loadingImgs[layersProps[i].id]){
			layersProps[i].hasDocument = true;
//			layersProps[i].url = svgImagesProps[layersProps[i].id].Path; // これはドキュメントがまだ読み終わっていないのでないのではないか？
		} else {
			layersProps[i].hasDocument = false;
		}
		layersProps[i].href = layers[i].getAttribute("xlink:href"); // (docPathがないので・・)これは.urlとは違う(ISSUE 2016.10.26)
		layersProps[i].svgImageProps = svgImagesProps[layersProps[i].id];
		
		layersProps[i].title = getLayerName( layers[i] );
		
		var visible = true;
		if ( layers[i].getAttribute("visibility") == "hidden" || layers[i].getAttribute("display" ) == "none" ){
			visible = false;
		}
		layersProps[i].visible = visible;
		
		layersProps[i].editable = isEditableLayer(layers[i]);
		layersProps[i].editing = false;
		if ( layersProps[i].editable ){
			layersProps[i].editing = isEditingLayer(layers[i]);
		}
//		console.log( "EDITING??",layersProps[i].editing );
		var layerGroupName ="";
		if ( layers[i].getAttribute("class")){
			var layerGroupNames = removeLayerCatName( layers[i].getAttribute("class").split(" ") , "switch" , "batch" , "editable" , "clickable" );
			if ( layerGroupNames.length > 0 ){
				layerGroupName = layerGroupNames[0];
			}
		}
		// グループ名を最初の一個だけ採っている・・・これも問題
		layersProps[i].groupName = layerGroupName;
		
		
		// switch || batch || null
		// switchのほうがbatchより優先されるようにするかな・・・　これも問題
		layersProps[i].groupFeature = "";
		if ( layerGroupName ){
			if ( switchGroups[layerGroupName] ){
				layersProps[i].groupFeature = "switch";
			} else if ( batchGroups[layerGroupName] ){
				layersProps[i].groupFeature = "batch";
			}
		}
	}
	// ID引き用
	for ( var i = 0 ; i < layersProps.length ; i++ ){
		layersProps[layersProps[i].id] = layersProps[i];
	}
	return ( layersProps );
}

// ルートコンテナの(animetion||iframeで構成される)レイヤー情報を設定する。
// レイヤー番号(root svg container内での順番)、レイヤーID(svg文書のiid = htmlのid = selectのvalue)、タイトル名(不確実-同じ名前があるかもしれない。最初に当たったものを選択)
// 変化があるとtrueが返却される。ない・もしくは不合理の場合はfalseが返却される
// この時classで設定されているレイヤーグループの特性(switch)に基づいた制御がかかる
function setRootLayersProps(layerID_Numb_Title, visible , editing , hashOption , removeLayer){
	var layer = getLayer(layerID_Numb_Title);
	if ( ! layer ){
		return ( false );
	}
	if ( removeLayer ){ // 2021/2/4 レイヤを完全消去するオプション
		layer.parentElement.removeChild(layer);
	}
	var layerId = layer.getAttribute("iid");
	var rootLayersProps = getRootLayersProps();
//	console.log("setRootLayersProps:layer:",layer," layerId:",layerId ," rootLayersProps:",rootLayersProps);
	var lp = rootLayersProps[layerId];
	
	
	if( visible == null ){
		visible = lp.visible;
	}
	if( editing == null ){
		editing = lp.editing;
	}
	
	
//	console.log("##setRootLayersProps:caller, visible , editing , hashOption:",setRootLayersProps.caller , visible , editing , hashOption);
//	console.log(lp);
	// ありえないパターンを除外
	if ( !hashOption && ( lp.visible == visible && lp.editing == editing ) ){ // 変化なし ただしhashOptionある場合を除く
//		console.log("setRootLayersProps 変化なし ただしhashOptionある場合を除く:: hashOption", hashOption, "  lp.visible , visible , lp.editing , editing" , lp.visible , visible , lp.editing , editing);
		return ( false );
	} else if ( !lp.editable && editing ){ // 編集不可能で編集中はありえない :: editableは無くても破たんしないと思う・・
//		console.log("setRootLayersProps 編集不可能で編集中はありえない");
		return ( false );
	} else if ( !visible && editing ){ // 非表示で編集中はありえない
//		console.log("setRootLayersProps 非表示で編集中はありえない");
		return ( false );
	} 
	
	if ( lp.groupFeature == "switch" && visible && !lp.visible ){
//		console.log("CHANGE SWITCH LAYER GROUP's layer visible");
		// switchグループは一つしかvisibleにできないのでグループ内の他のレイヤーがvisibleならinvisibleにする
		var ans = checkLayerSwitch( layer );
		if ( ans instanceof Boolean && ans == false ){
			// なにもしない
		} else {
			if ( ans instanceof Array ){
				for ( var i = 0 ; i < ans.length ; i++ ){
					ans[i].setAttribute("visibility" , "hidden");
				}
			}
		}
	}
	
	if ( editing && lp.editing != editing ){
		// 一つしか編集中にできないので、他の編集中があればdisableにする
		for ( var i = 0 ; i < rootLayersProps.length ; i++ ){
//			console.log(rootLayersProps[i].id);
//			console.log(svgImagesProps[rootLayersProps[i].id]);
			if ( svgImagesProps[rootLayersProps[i].id] ){
				if ( svgImagesProps[rootLayersProps[i].id].editing == true ){
					svgImagesProps[rootLayersProps[i].id].editing == false;
				}
			}
		}
	}
	
	if ( lp.visible != visible ){
		if ( visible ){
			layer.setAttribute( "visibility" , "visible" );
		} else {
			layer.setAttribute( "visibility" , "hidden" );
		}
	}
	
	if ( hashOption ){
		var svg2 = false;
		var url = layer.getAttribute("xlink:href");
		if ( ! url ){
			svg2 = true;
			url = layer.getAttribute("src");
		}
		if ( url.indexOf("#") >0){
//			url = url + "&" + hashOption.substring(1); // これはハッシュのアーキテクチャと違うと思うのでサイドエフェクトあるかもしれないが外す 2017.9.5
			url = url.substring(0,url.indexOf("#"))  + hashOption;
		} else {
			url = url + hashOption;
		}
		console.log("add hashOption to url:",url, " : ", hashOption);
		
		if ( svg2 ){
			layer.setAttribute("src",url);
		} else {
			layer.setAttribute("xlink:href",url);
		}
	}
	
//	console.log("EDITING::", lp.editing , editing ,lp);
	if ( lp.editing != editing ){
		svgImagesProps[layerId].editing = editing; // 編集中のレイヤがあるとレジューム直後エラーが出る・・ 2016/12/27
//		console.log("set Editing:",svgImagesProps[layerId]);
	}
	
	return (  true );
}

// setRootLayersPropsの簡単版　ただし、layerListUIのアップデートも行ってくれる
function setLayerVisibility( layerID_Numb_Title, visible ){
	setRootLayersProps(layerID_Numb_Title, visible , false );
	if ( typeof updateLayerListUIint == "function" ){
		updateLayerListUIint();
	}
	refreshScreen();
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


function MouseWheelListenerFunc(e){
	//ホイールスクロールで地図の伸縮を抑制する
//	e.preventDefault();
	e.stopPropagation();
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
		ticker.style.overflowX="hidden";
		ticker.style.overflowY="auto";
		ticker.addEventListener("wheel" , MouseWheelListenerFunc, false);
		ticker.addEventListener("mousewheel" , MouseWheelListenerFunc, false);
		ticker.addEventListener("DOMMouseScroll" , MouseWheelListenerFunc, false);
		
		
		tickerTable = document.createElement("table");
		tickerTable.style.borderCollapse="collapse";
		tickerTable.style.border="solid 1px black";
		tickerTable.setAttribute("border","1");
		ticker.appendChild(tickerTable);
	}
	setTickerPosition();
	ticker.style.fontSize = "110%";
	ticker.style.fontWeight = "bolder";
//	ticker.innerHTML = "TEST!!!";
}

function showTicker(){
	if ( ticker ){
		ticker.style.display="";
	}
}

function hideTicker(){
//	console.log("hideTicker   caller:",hideTicker.caller);
	if ( ticker ){
		ticker.style.display="none";
	}
}

function setTickerPosition( px , py ){
	if ( ticker ){
		if (!px && !py){
			px = mapCanvasSize.width / 2;
			py = mapCanvasSize.height / 2;
		}
		ticker.style.left = px + 2 + "px";
		ticker.style.top = (py + centerSight.height / 2) + "px";
	}
}

function fixTickerSize(){
//	var px = Number(ticker.style.left.replace("px",""));
	var py = Number(ticker.style.top.replace("px","")); // tickerの位置がいろいろ動くようになったので 2018.2.2
	ticker.style.height="";
	var th = ticker.offsetHeight;
	var tw = ticker.offsetWidth;
//	console.log( "fixTickerSize:", ticker, ticker.offsetHeight , ticker.offsetWidth);
//	console.log("tickerSize: w:",tw," h:",th);
	if ( mapCanvasSize.height - py< th ){
//		ticker.style.height="100px";
		ticker.style.height=mapCanvasSize.height - py -8 +"px";
	}
}

var tickerTableMetadata;

function getTickerMetadata(){
	for ( var i = 0 ; i < tickerTableMetadata.length ; i++ ){
		var tm = tickerTableMetadata[i];
		if ( tm.img ){ // POI
			var svgTarget = getSvgTarget(tm.img).element;
			var crs = svgImagesProps[getDocumentId(svgTarget)].CRS;
			var iprops = getImageProps(svgTarget,POI);
			var geoloc = SVG2Geo(iprops.x , iprops.y , crs );
			tm.geoBbox = { x: geoloc.lng , y:geoloc.lat , width:0, height:0 };
//			console.log(geoloc);
			tm.metadata = svgTarget.getAttribute("content");
			tm.element = svgTarget;
			tm.metaSchema = svgTarget.ownerDocument.firstChild.getAttribute("property");
		} else { // 2D Vector
			// already set!
		}
		
	}
	
	console.log("getTickerMetadata:",tickerTableMetadata);
	
	return ( tickerTableMetadata );
}

function checkTicker(px,py){
	// 地図中心の照準に合わせたオブジェクトを選択するUIの2017.8刷新版
	// 引数がないときは画面中央のオブジェクトの自動探索(伸縮とともに自動で探索するモード)
	// 引数があるときは、あえてクリックして探索するモード　探索結果が一個の時に違いがある
	// 2018.2.2 すべてのオブジェクトプロパティ表示UIをこの関数に統合
	//
	// FIXED : ISSUEあり（getVectorObjectsAtPointでのDOMトラバーサ二重起動の非効率）->FIXED 2018.1.18
	//
	// getObjectAtPointの機能を吸収 2018.1.31
	// testClickの機能も(getObjectAtPoint経由で)吸収 2018.2.2
	
//	console.log("checkTicker start"," caller:",checkTicker.caller);
	
	var hittedObjects; // ベクタでヒットしたモノ
	var hittedPoiObjects; // ラスタPOIでヒットしたモノ
	
	if ( px && py ){
		hittedObjects = getVectorObjectsAtPoint( px , py ); // マウスによる指定では中心でないので、この呼び出しが必要　重たいDOMトラバーサが同期で動きます
		hittedPoiObjects = getPoiObjectsAtPoint( px , py ); 
	} else {
		hittedObjects = getHittedObjects( ); // 2018.1.18 setCentralVectorObjectsGetterと組み合わせ、getVectorObjectsAtPointを代替して効率化 : ベクタでヒットしたモノ
		hittedPoiObjects = getPoiObjectsAtPoint( mapCanvasSize.width / 2, mapCanvasSize.height / 2 ); // ラスタPOIでヒットしたモノ
	}
	
	if ( hittedPoiObjects.length == 0 && px && py && checkAndKickEditor( hittedObjects , px, py ) ){ // POIがヒットしていない場合に限り、ベクタを対象にオーサリングツールのキック可能性をチェックし、キックされたならそのまま終了する
		return;
	}
	
	
//	console.log ( "hitted Vector:",hittedObjects , "  POI:",hittedPoiObjects, " TickerElem;",ticker);
	removeChildren(tickerTable);
	tickerTableMetadata = new Array();
	if ( (hittedObjects && hittedObjects.elements.length > 0) || hittedPoiObjects.length > 0 ){
		var lastCallback; // 候補１つだったときに自動起動させるコールバック保持用
			setTimeout( fixTickerSize , 300 );
		// for raster POI
		for ( var i = 0 ; i < hittedPoiObjects.length ; i++){
			var poip = getPropsOfPoi( hittedPoiObjects[i].id );
			var el = poip.imgElement;
//			console.log(el.title);
			var cbf = function(targetElem){
				return function(){
					poiSelectProcess( targetElem ); // オーサリングツールのチェックがPOIはこちらで行われていてベクタとは別なのが気持ち悪すぎる。後ほど・・・ 2018.2.1
				}
			}(el);
			lastCallback = cbf;
//			console.log("addTickerItem:", hittedPoiObjects[i].id ," title:",el.title, " layerNm:",poip.layerName);
			addTickerItem( el.title , cbf , tickerTable , poip.layerName );
			tickerTableMetadata.push(
				{ 
					title:el.title, 
					layerName:poip.layerName, 
					img:el
				}
			);
		}
		// for vector objects
		if ( hittedObjects ){
			for ( var i = 0 ; i < hittedObjects.elements.length ; i++ ){
				var vMeta = getVectorMetadata( hittedObjects.elements[i],hittedObjects.parents[i],hittedObjects.bboxes[i]);
				var meta = getMetadataObject( vMeta.metadata , vMeta.metaSchema , vMeta.title );
				console.log(vMeta.geolocMin, vMeta.geolocMax, meta , meta.title, vMeta.layerName);
				
				var vcbf = function(elem,parent,bbox){
					return function(){
//						hitVectorObject(elem,parent,bbox);
						vectorDataWrapperForShowPoiProperty(elem, bbox, parent);
					}
				}(hittedObjects.elements[i],hittedObjects.parents[i],hittedObjects.bboxes[i]);
				lastCallback = vcbf;
				addTickerItem( meta.title, vcbf , tickerTable , vMeta.layerName );
				tickerTableMetadata.push(
					{
						title: meta.title,
						layerName:vMeta.layerName,
						element:hittedObjects.elements[i],
						parent:hittedObjects.parents[i],
						bbox:hittedObjects.bboxes[i],
						metadata:vMeta.metadata,
						geoBbox:{
							x:vMeta.geolocMin.lng,
							y:vMeta.geolocMin.lat,
							width:vMeta.geolocMax.lng-vMeta.geolocMin.lng,
							height:vMeta.geolocMax.lat-vMeta.geolocMin.lat
						},
						metaSchema:vMeta.metaSchema
					}
				);
				
			}
		}
		
		if ( px && py && tickerTableMetadata.length == 1 ){ // クリックモードで候補が一つだったら直接コールバック呼び出して、ティッカーは出現させない
			hideTicker(); // これは不要かな
			lastCallback();
		} else {
			setTickerPosition(px,py);
			showTicker();
		}
//		console.log ( " TickerElem;",ticker, "   tickerTableMetadata:",tickerTableMetadata,"  tickerDisplay:",ticker.style.display);
	} else {
		hideTicker();
	}
}

function addTickerItem( title, callBack , table , subTitle){
	var tr = document.createElement("tr");
	var td = document.createElement("td");
	var spn = document.createElement("span");
	if ( subTitle ){
		spn.innerHTML = title + "<font size='-2'>/"+ subTitle+"</font>";
	} else {
		spn.innerHTML = title;
	}
	td.appendChild(spn);
	tr.appendChild(td);
	table.appendChild(tr);
	addEvent(spn, "mousedown", callBack);
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

function handleLoadSuccess(obj){ // (bitImage)画像の読み込み完了処理

	var target = obj.target || obj.srcElement;
	
	target.removeEventListener("load",handleLoadSuccess);
	
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
	var svgimageInfo = loadingImgs[target.id]; // 2021/1/26 loadingImgsには画像の場合booleanではなくcrs等を入れるようにした。
	delete loadingImgs[target.id];
//	console.log("image load completed: target:",target);
	imageTransform(target,svgimageInfo);
//	console.log("call checkLoadCompleted : handleLoadSuccess");
	checkLoadCompleted();
}

function imageTransform(imgElem, svgimageInfo){
	// ビットイメージタイルの内部について、任意の図法変換を加える機構 2020/08- まだまだ現在開発中だからいろいろ怪しい状態です2020/09/18
	// 2021/01/26 実用ユースケースが出てきたので、ブラッシュアップし、本流に載せることにする
	/** crsを直接得るようにしたのでこれは不要になった
	var imagesLayerId=imgElem.parentNode.id;
	var imageId = imgElem.id;
	var imageElem;
	try{
		imageElem= getElementByImgIdNoNS(svgImages[imagesLayerId],imageId); // オリジナルのsvg image要素の検索が少し非効率かも？
	} catch ( e ){
		return;
	}
	**/
	if ( !svgimageInfo ){
		console.log("NO image Element...");
		return;
	}
	var imageElem= svgimageInfo.svgNode;
	
	var tf = imageElem.getAttribute("transform");
	//console.log(tf);
	if ( tf && tf.indexOf("ref")==0 ){ // transform ref属性が付いている場合はスキップする(TBD)
		return;
	}
	var crs = svgImagesProps[svgimageInfo.docId].CRS; // 長い過程を経て、直接取れるようにした・・
//	var rootCrs = svgImagesProps["root"].CRS; // これはグローバルなので不要
	if ( needsNonLinearImageTransformation(crs,imageElem) == false ){ // 2021/08/10
		return;
	}
	// console.log("imagesLayerId:",imagesLayerId,"  crs:",crs,"  imageElem:",imageElem);
	var sc = document.getElementById("imageTransformCanvas");
	if ( !sc ){
		sc = document.createElement("canvas");
		sc.id="imageTransformCanvas";
		// sc.setAttribute("style","position:absolute;right:10px,bottom:10px");
		// document.documentElement.appendChild(sc); // 実装完了したらコメントアウト
	}
	
	var ciw = imgElem.naturalWidth;
	var cih = imgElem.naturalHeight;
	
	var  sctx = sc.getContext("2d");
	sc.width = ciw;
	sc.height = cih;
	sctx.drawImage(imgElem, 0, 0);
	
	var srcData = sctx.getImageData(0,0,ciw,cih);
	var dstData = sctx.createImageData(ciw,cih);
	
	// ソースsvgコンテンツにおけるソース画像の座標
	var csix = Number(imageElem.getAttribute("x"));
	var csiy = Number(imageElem.getAttribute("y"));
	var csiw = Number(imageElem.getAttribute("width"));
	var csih = Number(imageElem.getAttribute("height"));
	
	var cs2ci = {// ソースSVG系->ソース画像系変換行列(ひとまずtransform属性は無視)
		a: ciw / csiw,
		b: 0,
		c: 0,
		d: cih / csih,
		e: -csix * ciw / csiw,
		f: -csiy * cih / csih
	};
	
	var rs2cs = getConversionMatrixViaGCS(rootCrs,crs);// ルートSVG->ソース(個々のコンテンツ)SVG変換
	var cs2rs = getConversionMatrixViaGCS(crs,rootCrs);// ソース(個々のコンテンツ)SVG->ルートSVG変換
	
	/**
	if ( !rs2cs.transform ){
		// 非線形変換関数がないのでピクセル変換は不要
		return;
	}
	**/
	if ( imgElem.getAttribute("data-preTransformedHref")){
		console.log("Already Transformed image");
		return;
	}
	
	var rib=transformRect({x:csix,y:csiy,width:csiw,height:csih},cs2rs); //ルートSVG座標系における該当イメージの領域 "image bounds on root"
	var cib=transformRect(rib,rs2cs); // 今のところ使ってない・・
	// console.log("ImageBounds: cont:",{x:csix,y:csiy,width:csiw,height:csih},"  root:",rib, "  reConvConte:",cib);
	
	
	// console.log("image bounds on root:",rib);
	// ルート(画面表示)系上のビットイメージも、ひとまずソースと同一サイズで作ることにする
	
	var ri2rs = { // ルートSVG系上のイメージ画像系->ルートSVG
		a: rib.width / ciw,
		b: 0,
		c: 0,
		d: rib.height / cih,
		e: rib.x,
		f: rib.y
	};
	
	// ピクセルごとに座標変換実行　重すぎれば離散的なアンカーを選んで線形補間するというのもありだが、今は全ピクセル変換
	var prevRowHasData=[];
	var prow = ciw * 4;
	for ( var riy = 0 ; riy < cih ; riy++ ){
		var prevColHasData=false;
		for ( var rix = 0 ; rix < ciw ; rix++ ){ // ルートSVGにおける画像の座標
			var daddr = (rix + riy * ciw)*4;
			
			var rsxy = transform(rix, riy, ri2rs ); // ルートのSVG系の座標
			var csxy = transform(rsxy.x, rsxy.y, rs2cs ); // コンテンツSVG系の座標 (この変換が非線形になることがある)
			var cixy;
			if ( csxy ){
				cixy = transform(csxy.x, csxy.y, cs2ci ); // コンテンツSVGにおける画像の座標
			}
			
			if ( cixy && cixy.x >= 0 && cixy.x < ciw && cixy.y >= 0 && cixy.y < cih){
				var saddr = (Math.floor(cixy.x) + Math.floor(cixy.y) * ciw)*4;
				dstData.data[daddr] = srcData.data[saddr];         // r
				dstData.data[daddr + 1] = srcData.data[saddr + 1]; // g
				dstData.data[daddr + 2] = srcData.data[saddr + 2]; // b
				dstData.data[daddr + 3] = srcData.data[saddr + 3]; // a
				prevColHasData=true;
				prevRowHasData[rix]=true;
			} else {
				if ( prevColHasData ){ // prevColHasData
					// サブピクセルオーダーの継ぎ目を消す処理(X方向) 
					// x方向ひとつ前のピクセルに値があればその値をコピーする
					// キャンバスの完全に隅にある継ぎ目は消えない。これも気にするなら1ピクセル大きいキャンバス作れば良いと思うね。
					dstData.data[daddr] = dstData.data[daddr-4];         // r
					dstData.data[daddr + 1] = dstData.data[daddr-4 + 1]; // g
					dstData.data[daddr + 2] = dstData.data[daddr-4 + 2]; // b
					dstData.data[daddr + 3] = dstData.data[daddr-4 + 3]; // a
				} else if ( prevRowHasData[rix] ){
					// サブピクセルオーダーの継ぎ目を消す処理(Y方向)
					// y方向ひとつ前のピクセルに値があればその値をコピーする
					dstData.data[daddr] = dstData.data[daddr-prow];         // r
					dstData.data[daddr + 1] = dstData.data[daddr-prow + 1]; // g
					dstData.data[daddr + 2] = dstData.data[daddr-prow + 2]; // b
					dstData.data[daddr + 3] = dstData.data[daddr-prow + 3]; // a
				}
				prevColHasData=false;
				prevRowHasData[rix]=false;
			}
		}
	}
	sctx.putImageData(dstData, 0, 0);
	var iuri = sc.toDataURL('image/png');
	//console.log("imgElem:",imgElem,"  iuri:",iuri);
	imgElem.setAttribute("data-preTransformedHref",imgElem.getAttribute("src"));
	imgElem.setAttribute("src",iuri);
}

function needsNonLinearImageTransformation(crs,imageElem){
	// その画像が非線形変換が必要なものかどうかを判別する 2021/08/10関数化
	if( !crs.transform && !rootCrs.transform ){
		return ( false );
	} else {
		if ( imageElem.getAttribute("data-mercator-tile") =="true" && !crs.transform && rootCrs.mercator ){
			// ビットイメージの各image要素にdata-mercatorTileがtrueで設定され、しかもrootのCRSにmercator属性があったら不要とする特殊処理 2021/08/10
			return ( false );
		}
		return ( true );
	}
}

function timeoutLoadingImg(obj){ // ロード失敗(タイムアウトやERR404,403)した画像(bitImage)を強制的に読み込み完了とみなしてしまう処理
	var target;
	var timeout=false;
	if ( obj.id ){
		target = obj;
		timeout=true;
	} else { // added 2016.10.28 ( for err403,404 imgs )
		target = obj.target || obj.srcElement;
		++ loadErrorStatistics.otherBitImagesCount;
//		console.log ("probably err403,404 :",target, " id:",target.id);
	}
	if ( loadingImgs[target.id] ){
//		console.log("LoadImg TimeOut!!!!!");
		if ( timeout){
			++ loadErrorStatistics.timeoutBitImagesCount;
		}
		delete loadingImgs[target.id];
//	console.log("call checkLoadCompleted : timeoutLoadingImg");
		checkLoadCompleted();
	}
	
}

var delContainerId = 0;
function requestRemoveTransition( imgElem , parentElem2 ){ // 2013.7.31 debug まだバグがあると思う・・
	var parentElem = imgElem.parentNode;
	// 遅延削除処理のph1
//	console.log("requestRemoveTransition:", imgElem , parentElem , parentElem2 == imgElem.parentNode,"    caller:",requestRemoveTransition.caller);
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

function buildPixelatedImages4Edge(){ // pixelatedimgに対する、MS Edgeの問題に、無理やりなパッチを試みてみます・・・ 2018.9.3
	// see http://dachou.daa.jp/tanaka_parsonal/pixelart-topics/
	// and https://www.wizforest.com/tech/bigdot/
	
	// debug: https://developer.mozilla.org/ja/docs/Web/API/MutationObserver
	var imgs = mapCanvas.getElementsByTagName("img");
	if ( imgs.length > 0 ){
		for ( var i = 0 ; i < imgs.length ; i++ ){
			if ( imgs[i].dataset.pixelated){
				var parentDiv = imgs[i].parentNode;
				console.log("should be pixelated img : ",imgs[i].id, "  style:",imgs[i].style.top,imgs[i].style.left);
				imgs[i].style.visibility="hidden";
				var canvas = document.createElement("canvas");
				canvas.dataset.pixelate4Edge="true";
				canvas.width=imgs[i].width;
				canvas.height=imgs[i].height;
				canvas.style.position="absolute";
				canvas.style.top=imgs[i].style.top;
				canvas.style.left=imgs[i].style.left;
				parentDiv.insertBefore(canvas,imgs[i]);
				var ctx = canvas.getContext('2d');
				ctx.imageSmoothingEnabled=false;
				ctx.msImageSmoothingEnabled=false; 
				var cimg = new Image();
				cimg.src = imgs[i].src;
				ctx.drawImage(cimg, 0, 0, canvas.width, canvas.height);
			}
		}
	}
}

var loadErrorStatistics={};
function clearLoadErrorStatistics(){
	loadErrorStatistics={
		timeoutBitImagesCount:0,
		timeoutSvgDocCount:0,
		
		otherBitImagesCount:0,
		otherSvgDocCount:0,
	}
}
function getLoadErrorStatistics(){
	return ( loadErrorStatistics );
}

var loadCompleted = true;
function checkLoadCompleted( forceDel ){ // 読み込み完了をチェックし、必要な処理を起動する。
// 具体的には、読み込み中のドキュメントをチェックし、もうなければ遅延img削除処理を実行、読み込み完了イベントを発行
	var hl = getHashLength(loadingImgs);
//	if (! forceDel ){console.log("checkLoadCompleted::  hashLen:", hl," caller:",arguments.callee.caller);}
//	if (! forceDel ){console.log("checkLoadCompleted::  hashLen:", hl);}
//	console.log("checkLoadCompleted    hashLen:", hl, " loadCompl:" , loadCompleted, "   caller:",checkLoadCompleted.caller);
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
		
		if ( uaProp.Edge ){
			buildPixelatedImages4Edge();
		}
		
		// zoomPanMap||screenRefreshed イベントを発行する
//		if ( !forceDel &&  !loadCompleted ){} // forceDelの時もイベントだすべきでは？
//		if ( !loadCompleted ){ // forceDelの時もイベントだすべきでは？
//		console.log("LoadComletion..... loadCompleted:", loadCompleted,"  pathHitTest", pathHitTest.enable);
		if ( !loadCompleted && !pathHitTest.enable ){ // forceDelの時もイベントだすべきでは？ ただしpathHitTest.enableのサーチで出すのはおかしいのでは？
//			console.log("loading Completed");
//			loadCompleted = true; // これ意味ない
			removeUnusedDocs(); // 2019.5.22 メモリリーク対策
			if ( viewBoxChanged() ){ // 2017.3.16 本当にviewboxが変化したときのみzoomPanMap ev出す
				var customEvent = document.createEvent("HTMLEvents");
				customEvent.initEvent("zoomPanMap", true , false );
//				console.log("dispatchEvent zoomPanMap");
				document.dispatchEvent(customEvent);
				for ( var key in svgImagesProps ){ // 2017.3.9 scriptを持つsvg文書にもzpmイベントを送る 同じ仕組みで他のイベント的なものにも本物のイベントを送れる
					if ( svgImagesProps[key].script ){
						svgImages[key].dispatchEvent(customEvent);
					}
				}
			} else {
			// それ以外では新設のscreenRefreshed ev 出す
				var customEvent2 = document.createEvent("HTMLEvents");
				customEvent2.initEvent("screenRefreshed", true , false );
//				console.log("dispatchEvent screenRefreshed");
				document.dispatchEvent(customEvent2);
				for ( var key in svgImagesProps ){ // 2017.3.9 scriptを持つsvg文書にもzpmイベントを送る 同じ仕組みで他のイベント的なものにも本物のイベントを送れる
					if ( svgImagesProps[key].script ){
						svgImages[key].dispatchEvent(customEvent2);
					}
				}
			}
		}
		loadCompleted = true;
		startRefreshTimeout(); // 要確認：2016.10.14 この処理、複数のレイヤーでリフレッシュが起こっていたり一旦ロードされた後、消されたりした場合におかしなことが起きないでしょうか？
		
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
		refreshScreen();
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

/**
function testCSclick(){ // Obsolute 2018.1.31
	testPOIclick();
	
	getObjectAtPoint(mapCanvasSize.width / 2, mapCanvasSize.height / 2);
	
}
**/



function getImagePath( inDocPath , docId ){ // ルート文書に対する子文書の相対位置を加味したパスを得る getImageURLと類似していないか？（この関数は現在使われていません・・・）
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


function numberFormat( number , digits ){
	if (! digits){
		digits = 7;
	}
	var base = Math.pow(10 , digits);
	return ( Math.round(number * base)/base);
}

function getNonScalingOffset( svgPoiNode ){ // getPoiPosから改称 2018.3.2
	// vectorEffect,transform(ref ノンスケールのための基点座標取得
	try {
//		console.log("getNonScalingOffset:",svgPoiNode,svgPoiNode.getAttribute("transform"));
		var pos = svgPoiNode.getAttribute("transform").replace("ref(svg,","").replace(")","").split(",");
		var x = Number ( pos[0] );
		var y = Number ( pos[1] );
		if ( !isNaN(x) && !isNaN(y) ){
			return {
				x : Number ( pos[0] ),
				y : Number ( pos[1] ),
				nonScaling : true
			}
		} else {
			return{
				x : null,
				y : null,
				nonScaling : false
			}
		}
//		console.log(svgPoiNode, pos);
	} catch (e){
		return{
			x : null,
			y : null,
			nonScaling : false
		}
	}
}


function showSerialize( poi ){ // 使われていない 2018.3.2確認
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

function getElementByAttr_obsoluted( XMLNode , searchId , atName ){ // Firefox用・・（IE11でも同じことがおきる場合がある 2014.6.20)
	// TODO: これはquerySelectorで処理すべき
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

function getElementByAttr( XMLNode , searchId , atName ){ // 2020/09/28 元のをgetElementByAttr_obsolutedにした ISSUE対応
	if ( !XMLNode || ! XMLNode.hasChildNodes() ){
		return ( null );
	}
	var ans = XMLNode.querySelector('['+atName+'="'+searchId+'"]');
//	console.log("XMLNode:",XMLNode,"  searchId:",searchId,"  atName:",atName,"  ans:",ans);
	return ( ans );
}


function getDocumentId( svgelement ){
//	console.log("docId:::",svgelement.ownerDocument,svgelement.ownerDocument.documentElement.getAttribute("about"));
//	return ( element.parentNode.getAttribute("id") );
	return ( svgelement.ownerDocument.documentElement.getAttribute("about") );
}



function poiSelectProcess( obj ){ // html:img要素によるPOI(from use要素)を１個だけの選択まで決定したあとに実行するプロセス
// testClick()に元々あった機能を切り分け　今はtestClick()を代替したcheckTicker()から呼ばれている
//	console.log("poiSelectProcess",obj,"  typeof svgMapAuthoringTool:",typeof svgMapAuthoringTool, "  typeOf origin:",typeof obj);
	var target = obj.target || obj.srcElement || obj; 
//	console.log("testClick:",target.parentNode.getAttribute("id"),target, obj.button);
	var el = isEditingLayer();
	var svgTargetObj = getSvgTarget(target);
	var svgTarget = svgTargetObj.element;
//	console.log("isEditingLayer:",el);
//	console.log("testClick:" , svgTarget);
	if ( typeof svgMapAuthoringTool == "object"  && ( el && el.getAttribute("iid") == svgImagesProps[target.parentNode.getAttribute("id")].rootLayer ) ){ // 選択したオブジェクトが編集中レイヤのものの場合 (2019/3/12、タイルではなくレイヤーで判別するように変更)
//	console.log("EDITING LAYER",target,svgTarget);
		svgMapAuthoringTool.setTargetObject(svgTargetObj);
	} else {
		processShowUse( svgTargetObj );
	}
}

function processShowUse( svgTargetObj ){
	var svgTarget = svgTargetObj.element;
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

function showPage( hyperLink ){
	var href = trim(hyperLink.href);
	
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

function getSvgLocation( hrefS ){ // svgImagesのhrefからlocation相当変数を得る　作らなくても在る気もするのだが・・（newUR(..)Lオブジェクトでちゃんとしたのが作れるよ）　hrefSは、document.locationからのパスでないとダメ
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
			pvs.removeEventListener("click", arguments.callee, false);
			break;
		case"pvsLink":
//			console.log("edit");
			showPage( getHyperLink( poi )  );
			initModal();
			pvs.removeEventListener("click", arguments.callee, false);
			break;
		}
//		pvs.removeEventListener("click", arguments.callee, false);
	},false);
	
}

function getPropsOfPoi( poiId ){
	var screenPOIimg = document.getElementById(poiId);
	var layerName;
	if ( screenPOIimg.parentNode.getAttribute("class") ){ //  2015.11.14 debug rootのPOIでは所属レイヤーなし
		var layerId = (screenPOIimg.parentNode.getAttribute("class")).substring(10);
		var layer = getLayer(layerId); // htmlのdiv(レイヤ相当)のclassには、ルートのレイヤーIDが10文字目から入っている 2014.12.15
		layerName = getLayerName( layer );
	} else {
		layerName ="/";
	}
	return {
		layerId : layerId,
		layerName : layerName,
		imgElement  : screenPOIimg
	};
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
		modalUI.style.zIndex="32767";
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
		
		
		// カスタムモーダル(アプリ提供用)を生成する 2017/1/25
		var cm = document.createElement("div");
		cm.style.opacity="1";
		cm.style.position = "absolute";
		cm.style.backgroundColor = "white";
		cm.id = "customModal";
//		cm.innerHTML='<input type="button" id="pvsView" value="view Property"/><br><input type="button" id="pvsLink" value="open Link"/>';
		cm.style.display="none";
		modalUI.appendChild(cm);
		
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

// アプリ側で利用できるモーダルフレームワーク
// メッセージ(のhtmlソースもしくはDOM)及び、複数個のボタン、コールバック(押したボタンのインデックス入り)が使える
// DOMをmessageHTMLに使っても良いことに 2019/7/9
function setCustomModal( messageHTML , buttonMessages , callback,callbackParam){ // added 2017/1/25
	console.log("setCustomModal :",buttonMessages, Array.isArray(buttonMessages) );
	var cm = initModal( "customModal" );
	for (var i = cm.childNodes.length-1; i>=0; i--) {
		cm.removeChild(cm.childNodes[i]);
	}
	if ( buttonMessages ){
		if (Array.isArray(buttonMessages)){
		} else {
			var bm = buttonMessages;
			buttonMessages = new Array();
			buttonMessages[0] = bm;
		}
	} else {
		buttonMessages = ["OK"];
	}
	
	console.log("setCustomModal :",buttonMessages);
	
	var message = document.createElement("div");
	if ( typeof messageHTML == "object" && messageHTML.nodeType == 1 ){
		message.appendChild(messageHTML);
	} else {
		message.innerHTML = messageHTML;
	}
	cm.appendChild(message);
	
	for ( var i = 0 ; i < buttonMessages.length ; i++ ){
		var btn = document.createElement("input");
		btn.setAttribute("type","button");
		btn.id= "customModalBtn_"+i;
		btn.setAttribute("value",buttonMessages[i]);
		cm.appendChild(btn);
	}
	
	cm.addEventListener("click", function (e) {
//		console.log("evt:",e);
		if ( e.target.id.indexOf("customModalBtn_")>=0){
			initModal();
			if ( callback ){
				callback ( Number(e.target.id.substring(15)),callbackParam);
			}
			cm.removeEventListener("click", arguments.callee, false);
		}
	},false);
	
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

function svgPoi2csv(svgDocElement){ // 使われていないshowSerializeからしか呼ばれていないので使われていない(2018.3.2確認)
	var ans ="";
	var docId = getDocumentId(svgDocElement);
	var schema = getMetaSchema(svgDocElement.ownerDocument);
	var crs = svgImagesProps[docId].CRS;
	ans += "latitude,longitude,iconClass,iconTitle,"+schema+"\n";
	var pois = svgDocElement.getElementsByTagName("use");
	for ( var i = 0 ; i < pois.length ; i++ ){
		var poiProp = getImageProps( pois[i] , POI );
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

function setSVGcirclePoints( pathNode ,  context , child2canvas , clickable , category , vectorEffectOffset , GISgeometry ){
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
	
	if ( GISgeometry ){
		GISgeometry.svgXY = [cx,cy];
	}
	
//	var repld = "M"+ (cx - r) + "," + cy + "A" + r + "," + r + " 0 0 1 " + (cx + r ) + "," + cy + "A" + r + "," + r + " 0 0 1 " + (cx - r ) + "," + cy +"z";
	
	var repld = "M"+ (cx - rx) + "," + cy + "A" + rx + "," + ry + " 0 0 1 " + (cx + rx ) + "," + cy + "A" + rx + "," + ry + " 0 0 1 " + (cx - rx ) + "," + cy +"z";
	
	var ret = setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset , GISgeometry );
	if ( vectorEffectOffset ){ // non scaling circle support 2018.3.6
		ret.y -= ry;
		ret.height = ry * 2;
	} else {
		var csize = transform( rx , ry , child2canvas , true );
		ret.y -= csize.y;
		ret.height = csize.y * 2;
	}
//	console.log("repld:"+repld,  " ret:",ret , " csize:" , csize);
//	console.log("circle ret:",ret , " csize:" , csize);
	
	return ( ret );

}

function setSVGrectPoints( pathNode ,  context , child2canvas , clickable , vectorEffectOffset , GISgeometry ){
	var rx = Number(pathNode.getAttribute("x"));
	var ry = Number(pathNode.getAttribute("y"));
	var rw = Number(pathNode.getAttribute("width"));
	var rh = Number(pathNode.getAttribute("height"));
	
	if ( GISgeometry && !TreatRectAsPolygonFlag ){
		GISgeometry.svgXY = [ (rx + rw / 2.0) , (ry + rh / 2.0) ];
	}
	
	var repld = "M"+ rx + "," + ry + "L" + (rx+rw) + "," + ry + " " + (rx+rw) + "," + (ry+rh) + " " + rx + "," + (ry+rh) +"z";
//	console.log("repld:"+repld);
	
	var ret = setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset , GISgeometry );
	return ( ret );

}

function setSVGpolyPoints( pathNode ,  context , child2canvas , clickable , nodeType , vectorEffectOffset , GISgeometry ){
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
			
			var ret = setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset , GISgeometry );
			return ( ret );
		}
	}
}

function setSVGpathPoints( pathNode ,  context , child2canvas , clickable , repld , vectorEffectOffset , GISgeometry ){
// this routine is based on canvg.js's path parser
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
	
	function getHitPoint( hp , cp , isEdgePoint){ // 2019/4/16 なるべく端を設定しないように改良中　今後は選択したら選択した線を明示する機能が必要だね
		// hp: ひとつ前のステップで決めたヒットポイント
		// なるべく端点は使いたくない(というより端点だったら、次の点との間の中点を使う)
		if ( hp.prevX){
			// console.log("check half: hp.prevXY:",hp.prevX,hp.prevY ,"  cp.xy:",cp.x,cp.y,"  flg:",hp.isEdgePoint,isEdgePoint,hp.prevIsEdgePoint);
			if (hp.isEdgePoint!=false && (isEdgePoint || hp.prevIsEdgePoint )){// hpが設定済みだけれど、hpに端点が設定されいた・・
				// console.log("set half point");
				var tmpx = (hp.prevX + cp.x)/2;
				var tmpy = (hp.prevY + cp.y)/2;
				if (tmpx > 35  && tmpx < mapCanvasSize.width -35 && tmpy > 35 && tmpy <  mapCanvasSize.height - 35){
					hp.x = tmpx;
					hp.y = tmpy;
					hp.isNearEdgePoint=true;
				}
			}
		}
		
		if (cp.x > 35  && cp.x < mapCanvasSize.width -35 && cp.y > 35 && cp.y <  mapCanvasSize.height - 35){
			if ( !hp.x ){ // まだ未設定の場合は端点でもなんでもひとまず設定しておく
//			console.log("set:",cp);
				hp.x = cp.x;
				hp.y = cp.y;
				hp.isEdgePoint=isEdgePoint;
				hp.isNearEdgePoint =false;
			} else if ( !isEdgePoint && (hp.isEdgePoint|| hp.isNearEdgePoint) ){ // 設定済みの場合、端点で無くて、hpが端点だったときはそれを設定する。
				hp.x = cp.x;
				hp.y = cp.y;
				hp.isEdgePoint=false;
				hp.isNearEdgePoint =false;
			}
		}
		hp.prevX = cp.x;
		hp.prevY = cp.y;
		hp.prevIsEdgePoint = isEdgePoint;
		// console.log( "getHitPoint: cp:",cp,isEdgePoint,"  hitPoint:",hp );
		return ( hp );
	}
	
	if ( GISgeometry && !GISgeometry.svgXY ){
		GISgeometry.svgXY = new Array();// PolygonもMultiLineStringもsvgXYに[[x,y],[x,y],[x,y]],[[x,y],[x,y],[x,y]]というのが入る ただし、vectorEffectOffsetがあったら、それは全体で一個のPoint化するので注意
	}
	
	if ( GISgeometry && vectorEffectOffset ){ // vectorEffectOffsetがあったら、それは全体で一個のPoint化
		var svgP = [vectorEffectOffset.x,vectorEffectOffset.y];
		GISgeometry.svgXY = svgP; // bug fix 2018.3.5
//		var svgPs = [svgP];
//		GISgeometry.svgXY.push( svgPs );
	}
	
//	console.log(d);
	
	while ( i < d.length ){
//		console.log("cp:",cp);
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
//			hitPoint = getHitPoint(hitPoint, cp , true );
			context.moveTo(cp.x,cp.y);
//			console.log("M",sx,sy);
			if ( GISgeometry && !vectorEffectOffset ){
				var svgP = [sx,sy];
				var svgPs = [svgP];
				GISgeometry.svgXY.push( svgPs );
			}
			command ="L"; // 次のコマンドが省略されたときのバグ対策 2016.12.5
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
//			hitPoint = getHitPoint(hitPoint, cp , true );
			context.moveTo(cp.x,cp.y);
			if ( GISgeometry && !vectorEffectOffset ){
				var svgP = [sx,sy];
				var svgPs = [svgP];
				GISgeometry.svgXY.push( svgPs );
			}
			command ="l"; // 次のコマンドが省略されたときのバグ対策 2016.12.5
			break;
		case "L":
			++i;
			sx = Number(d[i]);
			++i;
			sy = Number(d[i]);
//			console.log("L",sx,sy);
			cp = transform( sx , sy , child2canvas , false , vectorEffectOffset );
//			hitPoint = getHitPoint(hitPoint, cp);
			context.lineTo(cp.x,cp.y);
			if ( GISgeometry && !vectorEffectOffset ){
				var svgP = [sx,sy];
				var thisPs = GISgeometry.svgXY[GISgeometry.svgXY.length -1 ]
				thisPs.push(svgP);
			}
			break;
		case "l":
			++i;
			sx += Number(d[i]);
			++i;
			sy += Number(d[i]);
			cp = transform( sx , sy , child2canvas , false , vectorEffectOffset );
//			hitPoint = getHitPoint(hitPoint, cp);
			context.lineTo(cp.x,cp.y);
			if ( GISgeometry && !vectorEffectOffset ){
				var svgP = [sx,sy];
				var thisPs = GISgeometry.svgXY[GISgeometry.svgXY.length -1 ]
				thisPs.push(svgP);
			}
			break;
		case "A": // non scaling が効いていない・・のをたぶん解消 2017.1.18
			var curr = transform(Number(sx) , Number(sy)); // これはmatrixないので無変換..
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
			); // これも無変換だ・・
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
			var cpp = transform(s * rx * currp.y / ry, s * -ry * currp.x / rx); // これも無変換・・・
			
			// cx, cy
			var centp = transform(
				(curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
				(curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
			); // これも無変換・・・
			
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
			
			var tc = transform( centp.x , centp.y , child2canvas , false , vectorEffectOffset ); // こっちはvectoreffect効いている
			var tsc;
			if ( vectorEffectOffset ){ // 2017.1.17 non scaling 対応
				tsc = transform( ssx , ssy);
			} else {
				tsc = transform( ssx , ssy , child2canvas , true); // スケール計算 これがVE fixed size効いていない
			}
			
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
//			hitPoint = getHitPoint(hitPoint, cp);
			closed = true;
			sx = startX; // debug 2016.12.1
			sy = startY;
			if ( GISgeometry && !vectorEffectOffset ){
				var svgP = [sx,sy];
				var thisPs = GISgeometry.svgXY[GISgeometry.svgXY.length -1 ]
				thisPs.push(svgP);
			}
			break;
		default:
//			hitPoint = getHitPoint(hitPoint, cp);
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
			if ( clickable ){
				// console.log("clk:",i,d.length-1);
				hitPoint = getHitPoint(hitPoint, cp , (i==2 || i == (d.length-1)) );
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
	
	if ( clickable && !canvasNonFillFlag && ( pathHitTest.enable || pathHitTest.centralGetter ) ){ // ヒットテスト要求時の面の場合　且つ　面検索
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
		
		if (pathHitTest.enable || pathHitTest.centralGetter ){ // ヒットテスト要求時の線検索
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

// added 2016.12.1 for GIS ext.
function initGISgeometry( cat, subCat , svgNode ){
	var GISgeometry = null;
	switch (cat){
	case EMBEDSVG:
		// nothing
		break;
	case BITIMAGE:
		if ( BitImageGeometriesCaptureFlag ){
			GISgeometry = new Object();
			GISgeometry.type = "Coverage"; 
		}
		break;
	case POI:
		GISgeometry = new Object();
		GISgeometry.type = "Point"; 
		break;
	case VECTOR2D:
		GISgeometry = new Object();
		switch ( subCat ){
		case PATH:
			GISgeometry.type = "TBD"; 
			break;
		case POLYLINE:
			GISgeometry.type = "MultiLineString";
			break;
		case POLYGON:
			GISgeometry.type = "Polygon";
			break;
		case RECT:
			if ( TreatRectAsPolygonFlag ){
				GISgeometry.type = "Polygon"; 
			} else {
				GISgeometry.type = "Point"; 
			}
			break;
		case CIRCLE:
			GISgeometry.type = "Point"; 
			break;
		case ELLIPSE:
			GISgeometry.type = "Point"; 
			break;
		}
		break;
	}
	if ( GISgeometry ){
		GISgeometry.src= svgNode;
	}
//	console.log("initGISgeo inp cat,subcat,svgNode:",cat, subCat , svgNode);
//	console.log("initGISgeo ans:",GISgeometry);
	return ( GISgeometry );
}

function setSVGvecorPoints( linePolygonNode , defaultStyle){
//	console.log(linePolygonNode );
}

function compressSpaces(s) { return s.replace(/[\s\r\t\n]+/gm,' '); }
function trim(s) { return s.replace(/^\s+|\s+$/g, ''); }


var styleCatalog = new Array("stroke" , "stroke-width" , "stroke-linejoin" , "stroke-linecap" , "fill" , "fill-rule" , "fill-opacity" , "opacity" , "vector-effect" , "display" , "font-size" , "stroke-dasharray" , "marker-end" , "visibility" ,"image-rendering"); 
	
function getStyle( svgNode , defaultStyle , hasHyperLink ){
	// 親のスタイルを継承して該当要素のスタイルを生成する
	// hasUpdateはその要素自身にスタイルattrが付いていたときに設定される
	var hasStyle=false , hasUpdate=false;
	var style = new Array();
	style.fill = null; // Array.prototype.fill()があるので、バッティングしておかしいことがあり得る・・ 2016.12.1
	
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
	} else if ( defaultStyle && defaultStyle.nonScalingOffset ){ // 2017.1.17 debug
		style.nonScalingOffset = defaultStyle.nonScalingOffset;
		hasStyle = true;
	}
	
	
	if ( defaultStyle && defaultStyle.usedParent ){ // use要素のためのhittest用情報・・・ 2017.1.17
		style.usedParent = defaultStyle.usedParent;
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

function isCollided( POIelemId ){ // この機能はtestClickのcheckTickerへの吸収使われなくなったが、有用かもしれないので残置 2018.2.1
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

function isCollided1( POIelemId ){ // こちらはもっと以前から使われていないが、アルゴリズム的に有用かもしれないので残置(たぶんGISに移動するのが良い) 2018.2.1
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

function getPoiObjectsAtPoint( x, y ){
	var hittedPOIs = new Array();
	for ( var i in visiblePOIs ){
		if ( x < visiblePOIs[i].x ||
			x > visiblePOIs[i].x + visiblePOIs[i].width ||
			y < visiblePOIs[i].y ||
			y > visiblePOIs[i].y + visiblePOIs[i].height ) {
				// none
		} else {
			visiblePOIs[i].id = i;
			hittedPOIs.push(visiblePOIs[i]);
		}
	}
	return ( hittedPOIs );
}

// VECTOR2Dの線や面をヒットテストする機能 2013/11/29
var pathHitTest = new Object();
// .enable:  X,Yを指定してヒットテストするときに設置する
// .centralGetter: 通常の描画時に画面の中心にあるオブジェクトを拾う機能を設置する added 2018.1.18
// .x,.y ヒットテストする場所を設置
// .hittedElements* ヒットした情報が返却される　親の要素も返る


function setCentralVectorObjectsGetter(){ // checkTicker()(画面中心のデフォルトヒットテスト)での二重パースを防止するための関数 2018.1.18
	if ( !pathHitTest.enable ){ // getVectorObjectsAtPoint(x,y)が要求されていた時はこの機能を発動させてはまずい
		pathHitTest.enable = false;
		pathHitTest.centralGetter = true;
		pathHitTest.x = mapCanvasSize.width / 2;
		pathHitTest.y = mapCanvasSize.height / 2;
		pathHitTest.hittedElements = new Array();
		pathHitTest.hittedElementsBbox = new Array();
		pathHitTest.hittedElementsUsedParent = new Array();
		if (typeof svgMapAuthoringTool == "object" && svgMapAuthoringTool.isEditingGraphicsElement() ){ // オブジェクトを編集中には、ジェネラルなヒットテストは実施しない
			console.log("now object editing..");
			pathHitTest.enable = false;
			return ( false );
		} else {
			return ( true );
		}
	} else {
		return ( false );
	}
}

function getHittedObjects(){ // 2018.1.17 setCentralVectorObjectsGetter用にgetVectorObjectsAtPointの一部を関数化
	pathHitTest.enable = false;
	pathHitTest.centralGetter = false;
	return {
		elements : pathHitTest.hittedElements,
		bboxes   : pathHitTest.hittedElementsBbox,
		parents  : pathHitTest.hittedElementsUsedParent
	}
}

function getVectorObjectsAtPoint( x, y ){
//	console.log("called getVectorObjectsAtPoint:",x,y," caller:",getVectorObjectsAtPoint.caller);
	pathHitTest.enable = true;
	pathHitTest.centralGetter = false; // 2018.1.18
	pathHitTest.x = x;
	pathHitTest.y = y;
	pathHitTest.hittedElements = new Array();
	pathHitTest.hittedElementsBbox = new Array();
	pathHitTest.hittedElementsUsedParent = new Array();
	if (typeof svgMapAuthoringTool == "object" && svgMapAuthoringTool.isEditingGraphicsElement() ){ // オブジェクトを編集中には、ジェネラルなヒットテストは実施しない
		console.log("now object editing..");
		pathHitTest.enable = false;
		return ( null );
	}
	refreshScreen(); // 本来この関数は非同期の動きをするのでこの呼び方はまずいけれど・・・（ロードさえ生じなければ同期してるはずなので大丈夫だと思う）この呼び出しケースの場合、原理的にはロード生じないはずなのでオーケー・・でもなかった　リドロー完了形のイベントがまともに動かなくなってしまう2017.8.18
	loadCompleted=true; // 2019/12/19 debug　ロード済みの同期呼び出しだから当然・・・ベクトルヒットテスト(checkticker)でおかしくなってた
	return ( getHittedObjects() );
}

function getVectorMetadata( element , parent , bbox ){
	console.log("called getVectorMetadata: ",element , parent , bbox, "  caller:",getVectorMetadata.caller);
	var geolocMin = screen2Geo(bbox.x , bbox.y + bbox.height );
	var geolocMax = screen2Geo(bbox.x + bbox.width , bbox.y  );
	var metadata = "";
	var title ="";
	if ( parent && parent.getAttribute("content") ){
		metadata = parent.getAttribute("content");
	} else if ( element.getAttribute("content") ){
		metadata = element.getAttribute("content");
	}
	
	if ( parent && parent.getAttribute("xlink:title") ){ // xlink:titleをとれるようにした 2018.1.30
		title = parent.getAttribute("xlink:title");
	} else if ( element.getAttribute("xlink:title") ){
		title = element.getAttribute("xlink:title");
	}
	
	var metaSchema ="";
	
	var layerName = getLayerName(getLayer(svgImagesProps[element.ownerDocument.firstChild.getAttribute("about")].rootLayer));
	if ( element.ownerDocument.firstChild.getAttribute("property") ){
		metaSchema = element.ownerDocument.firstChild.getAttribute("property");
	}
	return {
		geolocMin: geolocMin,
		geolocMax: geolocMax,
		metadata: metadata,
		metaSchema: metaSchema,
		layerName: layerName,
		title: title
	}
}

function parseEscapedCsvLine( csv ){
	// ' や " でエスケープされたcsvの1ラインをパースして配列に格納する。(高級split(","))
	var metaData = csv.split(",");
	for ( var j = 0 ; j < metaData.length ; j++ ){
		metaData[j]=trim(metaData[j]);
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
	return ( metaData );
}

// svgMapのcsv型のメタデータをオブジェクトに変換　もしもスキーマがない場合は配列だけが返却
// titleはデフォルトのものを設定可能とした
function getMetadataObject( dataCsv , schemaCsv , title ){
	var data = parseEscapedCsvLine(dataCsv);
	var obj;
	if ( schemaCsv ){
		var schema = parseEscapedCsvLine(schemaCsv);
		if ( data.length == schema.length ){
			obj = new Object();
			for ( var i = 0 ; i < data.length ; i++ ){
				obj[schema[i]] = data[i];
			}
			if ( ! title ){
				if ( obj.name ){
					title = obj.name;
				} else if ( obj.title ){
					title = obj.title;
				} else if ( obj["名前"] ){
					title = obj["名前"];
				} else if ( obj["名称"] ){
					title = obj["名称"];
				} else if ( obj["タイトル"] ){
					title = obj["タイトル"];
				}
			}
		}
	}
	if ( ! title ){
		title = data[0];
	}
	return {
		object: obj,
		title: title,
		array: data
	};
}



// ヒットした2Dベクタオブジェクトがオーサリングシステムをキックするべきものかどうかを調べて必要であればキックする
// getObjectAtPoint()に元々あった機能を切り分け　今はgetObjectAtPoint()を代替したcheckTicker()から呼ばれている
function checkAndKickEditor(hittedVectorObjects , x , y){
	var el = isEditingLayer();
	var ans = false;
	if ( typeof svgMapAuthoringTool == "object" && el ){ // オーサリングシステムがあり、オーサリング中のレイヤがある場合
		if ( hittedVectorObjects && hittedVectorObjects.elements.length > 0 ){ // ヒットしている場合
			var editingObject = getEditingObject(hittedVectorObjects , el );
			if ( editingObject ){ //編集中レイヤのオブジェクトが選択されている場合
				svgMapAuthoringTool.setTargetObject(
					{
						element: editingObject,
						docId: getDocumentId(editingObject) 
					}
				);
				ans = true;
			}
		} else { // 編集システムがあり、編集中の場合(ただし編集中オブジェクトはない)
			// 新しいオブジェクト作成系
//			console.log("call svgMapAuthoringTool.editPoint:",x,y);
			svgMapAuthoringTool.editPoint(x , y);
			ans = true ;
		}
	}
	return ( ans );
}
	
// 入力したオブジェクトの中から初めに見つかった編集中レイヤーのオブジェクトを返却する
// 最初に見つかったものに決め打ちしているのが果たしていいのかどうかは要検討
// getObjectAtPoint()に元々あった機能を切り分け　上のcheckAndKickEditor()から呼ばれている
function getEditingObject(hittedObjects , editingLayer ){
	var editingTarget = -1;
	if (typeof svgMapAuthoringTool == "object" && editingLayer ){
		for ( var i = 0 ; i < hittedObjects.elements.length ; i++ ){
			if ( editingLayer.getAttribute("iid") == getDocumentId(hittedObjects.elements[i]) ){
				editingTarget = i;
				break;
			}
		}
//			console.log("editingTarget:",editingTarget);
	}
	
	if ( editingTarget>=0 ){
		return ( hittedObjects.elements[editingTarget] );
	} else {
		return ( null );
	}
}

// 指定した2Dベクタ要素のプロパティ表示画面をキックするためのプリプロセッサ
// getObjectAtPoint()に元々あった機能を切り分け
function vectorDataWrapperForShowPoiProperty(targetElement , targetBbox , usedParent ){
	var vMeta = getVectorMetadata( targetElement,usedParent,targetBbox);
	var meta = getMetadataObject( vMeta.metadata , vMeta.metaSchema , vMeta.title );
//		var crs = svgImagesProps[getDocumentId(targetElement)].CRS;
	var geolocMin = screen2Geo(targetBbox.x , targetBbox.y + targetBbox.height );
	var geolocMax = screen2Geo(targetBbox.x + targetBbox.width , targetBbox.y );
	
//				var d = targetElement.getAttribute("d");
	
	var contentMeta = targetElement.getAttribute("content"); // useの場合 use先のメタデータにはたいてい意味がない
	if ( usedParent && usedParent.getAttribute("content") ){
		targetElement.setAttribute("content", usedParent.getAttribute("content"));
	}
	
	console.log("targetElement:",targetElement);
	
	/**
	// 選択されたベクタオブジェクトの線の太さだけを変える　2019.4.17 (この実装はやっぱりいまいちユーザビリティよくないのでやめる)
	var origVE=targetElement.getAttribute("vector-effect");
	var origSW=targetElement.getAttribute("stroke-width");
	targetElement.setAttribute("stroke-width","5");
	targetElement.setAttribute("vector-effect","non-scaling-stroke");
	refreshScreen();
	if ( origVE ){
		targetElement.setAttribute("vector-effect",origVE);
	} else {
		targetElement.removeAttribute("vector-effect");
	}
	if ( origSW ){
		targetElement.setAttribute("stroke-width",origSW);
	} else {
		targetElement.removeAttribute("stroke-width");
	}
	**/
	
	// showPoiPropertyWrapper()が想定しているオブジェクト形式に無理やり合わせて、呼び終わったら戻している・・・微妙
//				targetElement.removeAttribute("d");
	targetElement.setAttribute("lat",geolocMin.lat + ","+geolocMax.lat);
	targetElement.setAttribute("lng",geolocMin.lng +","+geolocMax.lng);
	targetElement.setAttribute("data-title",meta.title);
	showPoiPropertyWrapper(targetElement);
//				targetElement.setAttribute("d",d);
	if ( contentMeta){
		targetElement.setAttribute("content", contentMeta);
	} else {
		targetElement.setAttribute("content", "");
	}
	targetElement.removeAttribute("data-title");
	targetElement.removeAttribute("lat");
	targetElement.removeAttribute("lng");
}

// 2D Vector及び、ラスターのPOI(html img要素)のための、クリックなどによるオブジェクト検索機能。 関数名を除き、すべての機能をcheckTickerに集約した 2018.1.31
function getObjectAtPoint( x, y ){
//	console.log("called getObjectAtPoint:",x,y," caller:",getObjectAtPoint.caller);
	checkTicker( x, y );
	
	/**
	
	return ( pathHitTest.targetObject ); // こんなプロパティは存在しない null. TBD
	**/
}

// ビットイメージPOI要素のためのshowPoiPropertyWrapper呼び出し用プリプロセッサ
function showUseProperty( target ){
	var crs = svgImagesProps[getDocumentId(target)].CRS;
	var iprops = getImageProps(target,POI);
	var geoloc = SVG2Geo(iprops.x , iprops.y , crs );
//	var useX = target.getAttribute("x");
//	var useY = target.getAttribute("y");
//	var useTf = target.getAttribute("transform");
	
	var title = document.getElementById(target.getAttribute("iid")).title; // Added title 2017.8.22
	
	// showPoiPropertyWrapper()が想定しているオブジェクト形式に無理やり合わせて、呼び終わったら戻している・・・微妙
	// 2017.2.28　x,y,transformを除去する処理はバグを誘発するので中止
//	target.removeAttribute("x");
//	target.removeAttribute("y");
//	target.removeAttribute("transform");
	target.setAttribute("lat",geoloc.lat);
	target.setAttribute("lng",geoloc.lng);
	target.setAttribute("data-title",title);
//	console.log("showUseProperty",target , target.ownerDocument);
	showPoiPropertyWrapper(target);
//	target.setAttribute("x",useX);
//	target.setAttribute("y",useY);
//	target.setAttribute("transform",useTf);
	target.removeAttribute("data-title");
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
//		console.log("linkedDocOp childDocs:",childDocs,"  docHash:",docHash);
		for ( var i in childDocs ){
			if ( childDocs[i] == CLICKABLE || childDocs[i] == EXIST ){
				// existなのに実存しない？(unloadしているのにexistのままだな)
				linkedDocOp ( func , i , param1, param2 , param3 , param4 , param5 );
			}
		}
	}
}

// linkedDocOpの直径の子供のみ適用版(自身も適用しない)
function childDocOp( func , docHash , param1, param2 , param3 , param4 , param5 ){
	var targetDoc = svgImages[ docHash ];
	var targetDocProps = svgImagesProps[ docHash ];
	
	if ( targetDoc ){
//		func(targetDoc , targetDocProps , param1, param2 , param3 , param4 , param5 );
		
		
		// child Docs再帰処理
		var childDocs = targetDocProps.childImages;
		for ( var i in childDocs ){
			if ( childDocs[i] == CLICKABLE || childDocs[i] == EXIST ){
				// existなのに実存しない？(unloadしているのにexistのままだな)
				
				var targetChildDoc=svgImages[ i ];
				var targetChildDocProps=svgImagesProps[ i ];
				
				func(targetChildDoc , targetChildDocProps , param1, param2 , param3 , param4 , param5 );
			}
		}
	}
}

// showPoiPropertyWrapper: POI or vector2Dのくりっかぶるオブジェクトをクリックしたときに起動する関数
// 　ただし、アンカーの起動はこの関数呼び出し前に判断される
// (フレームワーク化した 2017/1/25)
// 第一引数には、該当する"SVGコンテンツ"の要素が投入されます。
// 便利関数：svgImagesProps[getDocumentId(svgElem)], getImageProps(imgElem,category)
//

var specificShowPoiPropFunctions = {};

function showPoiPropertyWrapper(target){
	var docId = getDocumentId(target);
	var layerId = svgImagesProps[docId].rootLayer;
	
	var layerName = getLayerName(getLayer(layerId));
	target.setAttribute("data-layername",layerName); // 2017.8.22 added
	
	var ans = true;
	if ( specificShowPoiPropFunctions[docId] ){ // targeDoctに対応するshowPoiProperty処理関数が定義されていた場合、それを実行する。
		ans = specificShowPoiPropFunctions[docId](target);
	} else if (specificShowPoiPropFunctions[layerId]){ // targetDocが属する"レイヤー"に対応する　同上
		ans = specificShowPoiPropFunctions[layerId](target);
	} else { // それ以外は・・
		if ( typeof showPoiProperty == "function" ){
			showPoiProperty(target); // 古いソフトでshowPoiPropertyを強制定義している場合の対策
		} else {
			defaultShowPoiProperty(target);
		}
	}
	
	if ( ans == false ){ // レイヤ固有関数による呼び出しでfalseが返ってきたらデフォルト関数を呼び出す。
		if ( typeof showPoiProperty == "function" ){
			showPoiProperty(target); // 古いソフトでshowPoiPropertyを強制定義している場合の対策
		} else {
			defaultShowPoiProperty(target);
		}
	}
	
	target.removeAttribute("data-layername");
}

// setShowPoiProperty: 特定のレイヤー・svg文書(いずれもIDで指定)もしくは、全体に対して別のprop.表示関数を指定できる。
// 指定した関数は、帰り値がfalseだった場合、デフォルトprop.表示関数を再度呼び出す
	
function setShowPoiProperty( func , docId ){
	if ( !func ){ // 消去する
		if ( docId ){
//			specificShowPoiPropFunctions[docId] = null;
			delete specificShowPoiPropFunctions[docId];
		} else {
			// defaultShowPoiPropertyはクリアできない
		}
	} else {
		if ( docId ){ // 特定のレイヤーもしくはドキュメントID向け
			specificShowPoiPropFunctions[docId] = func;
		} else {
			defaultShowPoiProperty = func;
		}
		
	}
}

function defaultShowPoiProperty(target){
	// 何も設定されていない場合のデフォルトパネル
//	console.log ( "Target:" , target , "  parent:", target.parentNode );

//	var metaSchema = target.parentNode.getAttribute("property").split(",");
	var metaSchema = null;
	if ( target.ownerDocument.firstChild.getAttribute("property") ){
		metaSchema = target.ownerDocument.firstChild.getAttribute("property").split(","); // debug 2013.8.27
	}


	var message="<table border='1' style='word-break: break-all;table-layout:fixed;width:100%;border:solid orange;border-collapse: collapse'>";
	
	var titleAndLayerName ="";
	if ( target.getAttribute("data-title")){
		titleAndLayerName = target.getAttribute("data-title") + "/" + target.getAttribute("data-layername") + "\n";
	}
	
	if ( target.getAttribute("content") ){ // contentメタデータがある場合
		
		var metaData = parseEscapedCsvLine(target.getAttribute("content"));
		
		message += "<tr><th style='width=25%'>name</th><th>value</th></tr>";
		if ( titleAndLayerName != ""){
			message += "<tr><td>title/Layer</td><td> " + titleAndLayerName + "</td></tr>";
		}
		
		if ( metaSchema && metaSchema.length == metaData.length ){
			for ( var i = 0 ; i < metaSchema.length ; i++ ){
				var data = "--";
				if ( metaData[i]!=""){
					data = metaData[i];
				}
				message += "<tr><td>"+metaSchema[i] + " </td><td> " + data + "</td></tr>";
			}
		} else {
			for ( var i = 0 ; i < metaData.length ; i++ ){
				var data = "--";
				if ( metaData[i]!=""){
					data = metaData[i];
				}
				message += "<tr><td>"+ i + " </td><td> " + data + "</td></tr>";
			}
		}

	} else { // 無い場合
		var nm = target.attributes;
		for ( var i = 0 ; i < nm.length ; i++ ){
			message += "<tr><td>" + nm.item(i).nodeName + " </td><td> " + domElement.getAttribute(nm.item(i).nodeName) + "</td></tr>";
		}
	}
	
	if ( getHyperLink(target) ){
		message += "<tr><td>link</td> <td><a href='" + getHyperLink(target).href + "' target=`_blank'>" +  getHyperLink(target).href + "</a></td></tr>";
	}
	
	if ( target.getAttribute("lat") ){
		message += "<tr><td>latitude</td> <td>" + getFormattedRange(target.getAttribute("lat")) + "</td></tr>";
		message += "<tr><td>longitude</td> <td>" + getFormattedRange(target.getAttribute("lng")) + "</td></tr>";
	}
	
	message += "</table>";
//	console.log(message);
	showModal(message,400,600);

}

function getFormattedRange( prop ){
	var rangeStr = prop.split(",");
	var ans = "";
	for ( var i = 0 ; i < rangeStr.length ; i++ ){
		ans += numberFormat(Number(rangeStr[i]),6);
		if ( i < rangeStr.length - 1 ){
			ans += ",";
		}
	}
	return ( ans );
}

function showModal( htm , maxW, maxH ){
	var modalDiv;
	if ( document.getElementById("modalDiv") ){
		modalDiv = document.getElementById("modalDiv")
		modalDiv.parentNode.removeChild(modalDiv);
		modalDiv=document.createElement("div");
	} else {
		modalDiv=document.createElement("div");
	}
	if ( window.innerWidth -100 < maxW ){
		maxW = window.innerWidth -100;
	}
	if ( window.innerHeight -140 < maxH ){
		maxH = window.innerHeight -100;
	}
	modalDiv.style.height= (maxH +36) + "px";
	modalDiv.style.width= (maxW +10) + "px";
	modalDiv.style.backgroundColor="rgba(180, 180, 180, 0.4)";
	modalDiv.style.zIndex="1000";
	modalDiv.style.position="absolute";
	modalDiv.style.top="40px";
	modalDiv.style.left="40px";
	modalDiv.style.overflowY="hidden";
	modalDiv.style.overflowX="hidden";
	modalDiv.id="modalDiv";

	var infoDiv=document.createElement("div");
	infoDiv.style.height= maxH + "px";
	infoDiv.style.width= maxW + "px";
	infoDiv.style.backgroundColor="rgba(255,240,220,0.7)";
	infoDiv.style.position="absolute";
	infoDiv.style.top="5px";
	infoDiv.style.left="5px";
	infoDiv.style.overflowY="scroll";
	infoDiv.style.overflowX="hidden";
	infoDiv.id="infoDiv";
	modalDiv.appendChild(infoDiv);

	infoDiv.innerHTML = htm;

	var btn=document.createElement("button");
	var txt=document.createTextNode("CLOSE");
	btn.appendChild(txt);
	btn.onclick=function(){
		modalDiv.parentNode.removeChild(modalDiv);
	};
	btn.style.position="absolute";
	btn.style.width="30%";
	btn.style.bottom="5px";
	btn.style.right="40px";

	modalDiv.appendChild(btn);

	modalDiv.addEventListener("wheel" , MouseWheelListenerFunc, false); //chrome
	modalDiv.addEventListener("mousewheel" , MouseWheelListenerFunc, false); //chrome
	modalDiv.addEventListener("DOMMouseScroll" , MouseWheelListenerFunc, false); //firefox
	document.getElementsByTagName("body")[0].appendChild(modalDiv);
	return(infoDiv);
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

var retryingRefreshScreen = false;
function refreshScreen(noRetry, parentCaller, isRetryCall){
	// スクロール・パンを伴わずに画面の表示を更新(内部のSVGMapDOMとシンクロ)する処理
	// SVGMapコンテンツ全体のDOMトラバースが起きるため基本的に重い処理
	// SVGMapLv0.1.jsは画面の更新は定期的に行われ"ない" 実際は末尾のdynamicLoad()でそれが起きる
	//
	// この関数は、データのロードが起きる可能性があるため、非同期処理になっている。
	// viewBoxは変化しないので、タイルコンテンツの非同期読み込みはないものの、
	// 直前に外部リソースを読み込むDOM編集が起きたケースが非同期になる。
	// 一方、他の非同期読み込みが進んでいるときに動作することは好ましくないので・・
	
	// ペンディングされている間に、更に新たなrefreshScreenが来た場合は、原理的に不要(caputureGISgeomも含め)のはずなので無視する。
	if ( retryingRefreshScreen && !isRetryCall){
		console.log( "Is refreshScreen retry queue:: SKIP this Call" );
		return;
	}
	
	var rsCaller;
	if ( refreshScreen.caller ){
		rsCaller = ((refreshScreen.caller).toString()).substring(0,25);
	} else {
		rsCaller = "undefined";
	}
	if ( rsCaller.indexOf(")")>0){
		rsCaller = rsCaller.substring(0,rsCaller.indexOf(")")+1);
	}
	rsCaller = rsCaller.substring(0,rsCaller.indexOf(")")+1);
	console.log("called refreshScreen: caller:",rsCaller, " parentCaller:",parentCaller);
	if ( loadCompleted == false){ // loadCompletedしてないときに実行すると破綻するのを回避 2019/11/14
		if ( !noRetry ){
			console.log( "NOW LOADING:: delay and retry refreshScreen" );
			setTimeout(function(){
				refreshScreen(noRetry, rsCaller, true);
			}, 10); // 何度でもリトライし必ず実行することにする・・(問題起きるかも？)
			retryingRefreshScreen = true;
		} else {
			console.log( "NOW LOADING:: SKIP refreshScreen" );
		}
		return;
	} else {
		retryingRefreshScreen = false;
	}
//	console.log("called refreshScreen from", refreshScreen.caller);
	loadCompleted = false; // 2016.11.24 debug この関数が呼ばれるときは少なくとも(描画に変化がなくとも) loadCompletedをfalseにしてスタートさせないと、あらゆるケースでの描画完了を検知できない
	dynamicLoad( "root" , mapCanvas ); // 以前はrefreshScreenのためにこの関数を生で呼んでいたが、上のいろんな処理が加わったので、それは廃止している（はず）
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
	refreshScreen(); // 再描画を実行(dynamicLoad("root",mapCanvas)です）
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
		refreshScreen();
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


// setCookie(KVSへの設定 NS競合回避機能付き), getCookies（全データ読み出し）
// 2021/7/12
var localStorageSvgMapSuffix = "svgmap_";

function setCookie( key, value , expire ){
	// 2021/2/3 localStorageに変更し、更に機能を増強していく
	// ひとまず　expire　は無視（無期限）とする
	var rootPath = (new URL(svgImagesProps["root"].Path,location.href)).pathname;
	window.localStorage[localStorageSvgMapSuffix+rootPath+"#"+key]=value;
}

function getCookies(){
	var result = {};
	var rootPath = (new URL(svgImagesProps["root"].Path,location.href)).pathname;
	var lss=localStorageSvgMapSuffix+rootPath+"#";
	for ( var i = 0 ; i < window.localStorage.length ; i++ ){
		if ( (window.localStorage.key(i)).indexOf(lss) == 0 ){
			result[window.localStorage.key(i).substring(lss.length)]=window.localStorage[window.localStorage.key(i)];
		}
	}
	
//	console.log("getCookies resume Result:",result);
		
	return result;
}

function removeCookies(propName) {
//	console.log("removeCookies:",propName)
	var rootPath = (new URL(svgImagesProps["root"].Path,location.href)).pathname;
	var lss=localStorageSvgMapSuffix+rootPath+"#";
	for ( var i = window.localStorage.length-1  ; i >=0  ; i-- ){
		if ( (window.localStorage.key(i)).indexOf(lss) == 0 ){
			if ( propName ){
				if ( (window.localStorage.key(i)).indexOf(propName)>0){
					delete window.localStorage[window.localStorage.key(i)];
				}
			} else {
				delete window.localStorage[window.localStorage.key(i)];
			}
		}
	}
}

// CRC16を一応置いておきます
// https://github.com/donvercety/node-crc16/
function crc16(str){
	const crctab16 = new Uint16Array([
		0X0000, 0X1189, 0X2312, 0X329B, 0X4624, 0X57AD, 0X6536, 0X74BF,
		0X8C48, 0X9DC1, 0XAF5A, 0XBED3, 0XCA6C, 0XDBE5, 0XE97E, 0XF8F7,
		0X1081, 0X0108, 0X3393, 0X221A, 0X56A5, 0X472C, 0X75B7, 0X643E,
		0X9CC9, 0X8D40, 0XBFDB, 0XAE52, 0XDAED, 0XCB64, 0XF9FF, 0XE876,
		0X2102, 0X308B, 0X0210, 0X1399, 0X6726, 0X76AF, 0X4434, 0X55BD,
		0XAD4A, 0XBCC3, 0X8E58, 0X9FD1, 0XEB6E, 0XFAE7, 0XC87C, 0XD9F5,
		0X3183, 0X200A, 0X1291, 0X0318, 0X77A7, 0X662E, 0X54B5, 0X453C,
		0XBDCB, 0XAC42, 0X9ED9, 0X8F50, 0XFBEF, 0XEA66, 0XD8FD, 0XC974,
		0X4204, 0X538D, 0X6116, 0X709F, 0X0420, 0X15A9, 0X2732, 0X36BB,
		0XCE4C, 0XDFC5, 0XED5E, 0XFCD7, 0X8868, 0X99E1, 0XAB7A, 0XBAF3,
		0X5285, 0X430C, 0X7197, 0X601E, 0X14A1, 0X0528, 0X37B3, 0X263A,
		0XDECD, 0XCF44, 0XFDDF, 0XEC56, 0X98E9, 0X8960, 0XBBFB, 0XAA72,
		0X6306, 0X728F, 0X4014, 0X519D, 0X2522, 0X34AB, 0X0630, 0X17B9,
		0XEF4E, 0XFEC7, 0XCC5C, 0XDDD5, 0XA96A, 0XB8E3, 0X8A78, 0X9BF1,
		0X7387, 0X620E, 0X5095, 0X411C, 0X35A3, 0X242A, 0X16B1, 0X0738,
		0XFFCF, 0XEE46, 0XDCDD, 0XCD54, 0XB9EB, 0XA862, 0X9AF9, 0X8B70,
		0X8408, 0X9581, 0XA71A, 0XB693, 0XC22C, 0XD3A5, 0XE13E, 0XF0B7,
		0X0840, 0X19C9, 0X2B52, 0X3ADB, 0X4E64, 0X5FED, 0X6D76, 0X7CFF,
		0X9489, 0X8500, 0XB79B, 0XA612, 0XD2AD, 0XC324, 0XF1BF, 0XE036,
		0X18C1, 0X0948, 0X3BD3, 0X2A5A, 0X5EE5, 0X4F6C, 0X7DF7, 0X6C7E,
		0XA50A, 0XB483, 0X8618, 0X9791, 0XE32E, 0XF2A7, 0XC03C, 0XD1B5,
		0X2942, 0X38CB, 0X0A50, 0X1BD9, 0X6F66, 0X7EEF, 0X4C74, 0X5DFD,
		0XB58B, 0XA402, 0X9699, 0X8710, 0XF3AF, 0XE226, 0XD0BD, 0XC134,
		0X39C3, 0X284A, 0X1AD1, 0X0B58, 0X7FE7, 0X6E6E, 0X5CF5, 0X4D7C,
		0XC60C, 0XD785, 0XE51E, 0XF497, 0X8028, 0X91A1, 0XA33A, 0XB2B3,
		0X4A44, 0X5BCD, 0X6956, 0X78DF, 0X0C60, 0X1DE9, 0X2F72, 0X3EFB,
		0XD68D, 0XC704, 0XF59F, 0XE416, 0X90A9, 0X8120, 0XB3BB, 0XA232,
		0X5AC5, 0X4B4C, 0X79D7, 0X685E, 0X1CE1, 0X0D68, 0X3FF3, 0X2E7A,
		0XE70E, 0XF687, 0XC41C, 0XD595, 0XA12A, 0XB0A3, 0X8238, 0X93B1,
		0X6B46, 0X7ACF, 0X4854, 0X59DD, 0X2D62, 0X3CEB, 0X0E70, 0X1FF9,
		0XF78F, 0XE606, 0XD49D, 0XC514, 0XB1AB, 0XA022, 0X92B9, 0X8330,
		0X7BC7, 0X6A4E, 0X58D5, 0X495C, 0X3DE3, 0X2C6A, 0X1EF1, 0X0F78,
	]);

	// calculate the 16-bit CRC of data with predetermined length.
	function _crc16(data) {
		var res = 0x0ffff;
		for (let b of data) {
			res = ((res >> 8) & 0x0ff) ^ crctab16[(res ^ b) & 0xff];
		}
		return (~res) & 0x0ffff;
	}
	return (_crc16(new TextEncoder().encode(str)))
}

// SHAも置いておきます。
async function sha256(str) {
	//https://scrapbox.io/nwtgck/SHA256のハッシュをJavaScriptのWeb標準のライブラリだけで計算する
	if ( typeof(crypto)!="object"){console.error("crypto is not");return;}
	const buff = new Uint8Array([].map.call(str, (c) => c.charCodeAt(0))).buffer;
	const digest = await crypto.subtle.digest('SHA-256', buff);
	// (from: https://stackoverflow.com/a/40031979)
	return [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
}


// レジューム用localStorageから、レジュームを実行する。 2021/2/3 rev17の改修の中心
// 起動直後のルートコンテナ読み込み時(一回しか起きない想定)実行される
var resumeFirstTime = true;
function checkResume(documentElement, symbols){
//	console.log("checkResume::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::resumeFirstTime:",resumeFirstTime );
	var resumeObj=null ;
	
	var lhash,lh; // ハッシュによる指定用の変数　ちょっとlhash冗長
	if ( location.href.indexOf("#")>=0 ){
		// firefox 旧版のバグ予防のためlocation.hash不使用に切り替え
		lhash = location.href.substring(location.href.indexOf("#"));
		lh = getUrlHash( lhash );
//			console.log(lh);
	}
	
	if ( resumeFirstTime ){
		
		var cook = getCookies();
		//console.log("resumeTxt:",cook.resume);
		
		if ( lh && ( lh.visibleLayer || lh.hiddenLayer ) || cook.resume || cook.customLayers ){
			// 外部リソースを読み込まない(そのhtmlデータ構造も作らない)rootのparseを行い、root svgだけの文書構造をまずは構築する。レイヤーのOnOffAPIの正常動作のため(iidの設定など・・) 2016/12/08 debug
			parseSVG( documentElement , "root" , mapCanvas , false , symbols , null , null , true); 
		}
		
		var lp = getRootLayersProps();
		// 2021/2/4 レイヤーのカスタムOFF＆追加＆変更を設定できるsvgMapCustomLayersManagerの情報を導入する
		// cook.customLayers の中のJSONデータからレイヤーの削除、追加などを実施する
		if ( cook.customLayers && window.svgMapCustomLayersManager ){
			try{
				var customLayers = JSON.parse(cook.customLayers);
				svgMapCustomLayersManager.applyCustomLayers(customLayers);
				parseSVG( documentElement , "root" , mapCanvas , false , symbols , null , null , true); // 2021/3/8 iidを設定する(上と同じ)
				lp = getRootLayersProps();
			} catch ( e ){
				console.error("svgMapCustomLayersManager.applyCustomLayers step error:",e);
			}
		}
		if ( cook.customGeoViewboxes ){ // 2021/4/2 add customViewbox function
			var customGeoViewboxes = JSON.parse(cook.customGeoViewboxes);
			console.log("customGeoViewboxes:",customGeoViewboxes);
			if ( customGeoViewboxes.currentSettingKey ){
				var cvb = customGeoViewboxes.settings[customGeoViewboxes.currentSettingKey];
				if ( cvb ){
					setGeoViewPort(cvb.y,cvb.x,cvb.height,cvb.width , true); // set geoviewport without refresh
				}
			}
		}
		
		if ( cook.resume ){
			resumeObj = JSON.parse(cook.resume);
			resume = resumeObj.resume;
		}
		
		if ( document.getElementById("resumeBox") ){
			if ( resume ){
				document.getElementById("resumeBox").checked = "true";
			} else {
				document.getElementById("resumeBox").checked = "";
			}
		}
		removeCookies("resume"); // resumeという名前のモノだけ削除する
		
//		if ( !resumeObj || (resumeObj && !resumeObj.vbLat )){ // これはハッシュ処理が通らないのでまずい・・ 2021/4/20
//			resumeFirstTime = false;
//			return;
//		}
		
//		console.log("Resume on startup");
//		console.log("geoViewBox:",geoViewBox);
		
		if ( resume && resumeObj  ){
			var vbLat = Number(resumeObj.vbLat);
			var vbLng = Number(resumeObj.vbLng);
			var vbLatSpan = Number(resumeObj.vbLatSpan);
			var vbLngSpan = Number(resumeObj.vbLngSpan);
			
//			var lp = getRootLayersProps();
			var lprev = resumeObj.layersProperties;
			
			var matched=[];
			// titleとhrefが一致しているケース
			for ( var i = 0 ; i < lp.length ; i++ ){
				var key = lp[i].title; // titleがlprevのkeyになっているのは要注意ですよ
				matched.push(false);
				if ( lprev[key] ){
					if ( lprev[key].href == lp[i].href ){
						// titleもhrefも正しいのでOK
						var visible = lprev[key].visible;
						setRootLayersProps(lp[i].id,visible,false);
						matched[i]=true;
						delete lprev[key];
					} else {
						// hrefが変更されている！！　skipしておく
						console.warn("href is unmatched!!!: title:",key,"  href:",lprev[key].href ," : ", lp[i].href,"  SKIP IT");
					}
				}
			}
			
			// 未解決レイヤでtitleは違うがURLが同じモノがあるケース(titleが変更になったとみなす)
			for ( var i = 0 ; i < lp.length ; i++ ){
				if ( matched[i]==false){
					for ( var key in lprev ){
						if (lprev[key].href == lp[i].href ){
							var visible = lprev[key].visible;
							setRootLayersProps(lp[i].id,visible,false);
							matched[i]=true;
							console.log("layer title may be changed, but set visibility");
						}
					}
				}
			}
			
//			resumeFirstTime = false; // 下(setGeoViewPort)でもう一回checkが通ってバグる・・10/27 これは5番目の引数により不要になった 2017.1.31
			setGeoViewPort(vbLat,vbLng,vbLatSpan,vbLngSpan , true); // set geoviewport without refresh
			
//			console.log("Resume setGeoViewPort:", vbLat,vbLng,vbLatSpan,vbLngSpan );
		}
	}
	
	
	if ( resume ){
		saveResumeData();
	}
	
	if ( resumeFirstTime ){ // hashで指定した値はResumeもオーバーライドする 2017.1.31
		if ( lh ){
			var vb;
			if ( lh.svgView ){
				vb = getFragmentView( lhash ); // getUrlHash結果の利用は未実装 2017.1.30
			} else if ( lh.xywh && lh.xywh.indexOf("global:")==0 ){
				var gvb = lh.xywh.substring(7).split(",");
				vb = { x: Number(gvb[0]), y: Number(gvb[1]), width: Number(gvb[2]), height: Number(gvb[3]) , global: true };
				console.log(" global view by Media Fragments: ",  vb);
			}
			
			var passVL = false;
			if ( lh.visibleLayer && lh.visibleLayer.indexOf("*")>=0){
				// ワイルドカード*が設定されていたら、まずは全レイヤーをvisibleにする
				var layers = getLayers();
				for ( var i = 0 ; i < layers.length ; i++ ){
					var layerId = layers[i].getAttribute("iid");
					setRootLayersProps(layerId, true, false);
				}
			}
			
			if ( lh.hiddenLayer ){
				if ( lh.hiddenLayer.indexOf("*")>=0){ // ワイルドカード*が設定されていたら、全レイヤーをhideする　その他のURLは無視する。#オプション部も無視されてしまうが・・
					var layers = getLayers();
					for ( var i = 0 ; i < layers.length ; i++ ){
						var layerId = layers[i].getAttribute("iid");
						setRootLayersProps(layerId, false, false);
					}
				}else {
	//				var hl = decodeURI(lh.hiddenLayer).split(",");
					var hl = decodeURIComponent(lh.hiddenLayer).split(",");
					for ( var i = 0 ; i < hl.length ; i++ ){
						hl[i]=getUrlOptions(hl[i]);
						var layerId = getLayerId(hl[i].name);
	//					console.log( "visible layer name:",hl[i], " is?:",layerId);
						if ( layerId ){
	//						console.log("set visible:",hl[i],layerId);
							setRootLayersProps(layerId, false, false, hl[i].hash);
						}
					}
				}
			}
			if ( lh.visibleLayer ){
//				console.log("visibleLayerOpt:",lh.visibleLayer, "   lh:",lhash,lh);
//				var vl = decodeURI(lh.visibleLayer).split(",");
				var vl = decodeURIComponent(lh.visibleLayer).split(",");
				for ( var i = 0 ; i < vl.length ; i++ ){
//					console.log( "visible layer:",vl[i]);
					vl[i]=getUrlOptions(vl[i]);
					var layerId = getLayerId(vl[i].name); // "*"が入ったままだとおかしなことが起きるかも？？
//					console.log( "visible layer name:",vl[i], " is?:",layerId);
					if ( layerId ){
//						console.log("set visible:",vl[i],layerId);
						setRootLayersProps(layerId, true, false, vl[i].hash);
					}
				}
			}
//				console.log(vb);
			if ( vb && vb.global ){
				setGeoViewPort(vb.y,vb.x,vb.height,vb.width , true); // set geoviewport without refresh
			} else if ( vb ){
				// 後ほどね・・・
			}
		}
//		console.log("rootViewBox:",rootViewBox);
	}
	
	resumeFirstTime = false;
	
//	var cook = getCookies();
//	console.log("END Check Resume :", cook);
}

// URLのハッシュやサーチパートをパースしオブジェクトに投入する 2017.3.8
// 上のcheckResumeでは実際はURLではなくレイヤ名＋ハッシュオプションのデータをパース(クエリは不使用)
function getUrlOptions( url ){
	var hashPos = url.indexOf("#");
	var queryPos = url.indexOf("?");
	if ( queryPos > hashPos ){ // クエリパートはフラグメントパートよりも前にある必要がある
		queryPos = -1;
	}
	
	var hashStr ="";
	var queryStr ="";
	var nameStr = url;
	
	if ( hashPos > 0 ){
		hashStr = nameStr.substring(hashPos);
		nameStr = nameStr.substring(0,hashPos);
//		console.log("hashStr:",hashStr);
	}
	if ( queryPos > 0 ){
		queryStr  = nameStr.substring(queryPos);
		nameStr = nameStr.substring(0,queryPos);
		console.log("queryStr:",queryStr);
	}
	
	return {
		name: nameStr,
		query: queryStr,
		hash: hashStr
	}
	
}

function saveResumeData(){
	var expire = new Date();
	expire.setTime( expire.getTime() + 1000 * 3600 * 24 * resumeSpan); // 3日の有効期限..
	var resumeObj = {};
	//setCookie( "resume", resume , expire );
	resumeObj.resume = resume;
	if ( resume == true ){ // resumeがfalseの場合は、そもそもこれらは不要
		/**
		setCookie( "vbLng", geoViewBox.x , expire );
		setCookie( "vbLat", geoViewBox.y , expire );
		setCookie( "vbLngSpan", geoViewBox.width , expire );
		setCookie( "vbLatSpan", geoViewBox.height , expire );
		**/
		resumeObj.vbLng = geoViewBox.x;
		resumeObj.vbLat = geoViewBox.y;
		resumeObj.vbLngSpan = geoViewBox.width;
		resumeObj.vbLatSpan = geoViewBox.height;
		var lps = getRootLayersProps();
		// クッキーの個数よりもレイヤーがとても多い場合があるので簡略化
//		var layerStatStr="";
		var layersProps={};
		for ( var i = 0 ; i < lps.length ; i++ ){
			var lp = lps[i];
			var key = lp.title; // WARN titleが同じものがあるとここで上書きされることになります！！！ 2021/2/3
			var lpProps = {
				visible:lp.visible,
				editing:lp.editing,
				groupName:lp.groupName,
				groupFeature:lp.groupFeature,
				href:lp.href,
				title:lp.title,
				href:lp.href
			}
			layersProps[key]=lpProps;
			
			/**
			if ( lps[i].visible ){
				if ( lps[i].editing ){
					layerStatStr += "e";
				} else {
					layerStatStr += "v";
				}
			} else {
				layerStatStr += "-";
			}
			**/
		}
		// setCookie ( "layersProperties" , JSON.stringify(layersProps) , expire );
		resumeObj.layersProperties = layersProps;
		
//		setCookie ( "layerStat" , layerStatStr , expire );
	//	console.log("save resume data",decodeURIComponent(document.cookie));
	}
	setCookie ( "resume" , JSON.stringify(resumeObj) , expire );
}

function resumeToggle(evt){
//	console.log(evt.target);
	if ( evt.target.checked ){
		svgMap.setResume(true);
	} else {
		svgMap.setResume(false);
	}
	
}

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

var setLayerUI, updateLayerListUIint;

var GISgeometriesCaptureFlag = false; // for GIS 2016.12.1
var BitImageGeometriesCaptureFlag = false; // for GIS 2018.2.26
var TreatRectAsPolygonFlag = false; // for GIS 2018.8.1

var GISgeometries;

function captureGISgeometries( cbFunc , prop1 , prop2 , prop3 , prop4 , prop5 , prop6 , prop7 ){ // 非同期、callbackFuncいるだろうね
//	console.log(cbFunc);
	if ( GISgeometriesCaptureFlag ){ // 2019/12/24 排他制御
		console.log("Now processing another captureGISgeometries. Try later.");
		cbFunc(false);
		return ( false );
	}
	GISgeometriesCaptureFlag = true;
	delete GISgeometries;
	GISgeometries = new Object;
	// 仕様変更により、viewbox変化ないケースのイベントがscreenRefreshedに変更 2017.3.16
	document.addEventListener("screenRefreshed",
		function cgf(){
			document.removeEventListener("screenRefreshed", cgf, false);
			prepareGISgeometries( cbFunc , prop1 , prop2 , prop3 , prop4 , prop5 , prop6 , prop7 );
		} , false);
	refreshScreen();
}

function prepareGISgeometries(cbFunc , prop1 , prop2 , prop3 , prop4 , prop5 , prop6 , prop7 ){
//	console.log("Called prepareGISgeometries in resp to captGISgeom GISgeometries:", GISgeometries);
//	DEBUG 2017.6.12 geojsonの座標並びが逆だった・・・
	for ( var docId in GISgeometries ){
		var layerGeoms = GISgeometries[docId];
		if ( layerGeoms.length > 0 ){
			var crs = svgImagesProps[docId].CRS;
			
			var invCrs = getInverseMatrix(crs);
			
//			console.log( "layerID:",docId," crs:",crs);
			var geoCrd, geoCrd2;
			for ( var i = 0 ; i < layerGeoms.length ; i++ ){
				var geom = layerGeoms[i];
				if ( geom.type === "Point" ){
					geoCrd = SVG2Geo( geom.svgXY[0] , geom.svgXY[1] , null , invCrs );
					geom.coordinates = [ geoCrd.lng , geoCrd.lat ];
				} else if ( geom.type === "Coverage" ){
					geom.coordinates = new Array();
					if ( ! geom.transform || (geom.transform && geom.transform.b == 0 && geom.transform.c == 0 )){
						if ( ! geom.transform ){
							geoCrd = SVG2Geo( geom.svgXY[0][0] , geom.svgXY[0][1] , null , invCrs );
							geoCrd2 = SVG2Geo( geom.svgXY[1][0] , geom.svgXY[1][1] , null , invCrs );
						} else {
							// transform 一時対応（回転成分がないケースのみ）2019.5.16
							var sxy = transform( geom.svgXY[0][0] , geom.svgXY[0][1] , geom.transform );
							var sxy2 = transform( geom.svgXY[1][0] , geom.svgXY[1][1] , geom.transform );
							geoCrd = SVG2Geo( sxy.x , sxy.y , null , invCrs );
							geoCrd2 = SVG2Geo( sxy2.x , sxy2.y , null , invCrs );
						}
						geom.coordinates.push({lat:Math.min(geoCrd.lat,geoCrd2.lat), lng:Math.min(geoCrd.lng,geoCrd2.lng)});
						geom.coordinates.push({lat:Math.max(geoCrd.lat,geoCrd2.lat), lng:Math.max(geoCrd.lng,geoCrd2.lng)});
						delete geom.transform; // TBDです・・・
					} else {
						geom.coordinates.push({x:geom.svgXY[0][0], y:geom.svgXY[0][1]});
						geom.coordinates.push({x:geom.svgXY[1][0], y:geom.svgXY[1][1]});
						geoTf = matMul(geom.transform,invCrs);
						geom.transform = geoTf;
//						console.log("WARN: 非対角成分transform:",geom);
					}
					
				} else {
					geom.coordinates = new Array();
					if ( geom.svgXY.length == 1 && geom.svgXY[0].length == 1 ){ // Vector EffectのPolygonなどはPointにこの時点で変換する。
						geoCrd = SVG2Geo( geom.svgXY[0][0][0] , geom.svgXY[0][0][1] , null , invCrs );
//						console.log ("conv VE Polygon to Point :", geom.svgXY[0], "  geo:",geoCrd);
						geom.coordinates = [ geoCrd.lng , geoCrd.lat ];
						geom.type = "Point";
					} else {
						for ( var j = 0 ; j < geom.svgXY.length ; j++ ){
							var subP = geom.svgXY[j];
							var wgSubP = new Array();
							var startP;
							if ( (geom.type === "Polygon" && subP.length > 2) || (geom.type === "MultiLineString" && subP.length > 1) ){ // 面の場合３点以上、　線の場合は２点以上が必須でしょう
								for ( var k = 0 ; k < subP.length ; k++ ){
									var point = subP[k];
									geoCrd = SVG2Geo( point[0] , point[1] , null , invCrs );
									if ( k == 0 ){
										var startP = geoCrd;
									}
									wgSubP.push([geoCrd.lng,geoCrd.lat]);
								}
								if ( geom.type === "Polygon" && (startP.lat != geoCrd.lat ||  startP.lng != geoCrd.lng) ){
									wgSubP.push([startP.lng,startP.lat]);
								}
								geom.coordinates.push(wgSubP);
							}
						}
					}
				}
				delete geom.svgXY;
//				console.log(geom.type,":",geom);
			}
		}
	}
	GISgeometriesCaptureFlag = false;
	cbFunc( GISgeometries , prop1 , prop2 , prop3 , prop4 , prop5 , prop6 , prop7 );
}

function reLoadLayer(layerID_Numb_Title){
// 指定したレイヤー(ルートコンテナのレイヤー)をリロードする 2017.10.3
// この関数は必ずリロードが起こることは保証できない。
// なお、確実にリロードさせるには、ルートコンテナの該当レイヤ要素にdata-nocache="true"を
// 設定する必要がある
	console.log("called reLoadLayer : ",layerID_Numb_Title);
	setRootLayersProps(layerID_Numb_Title,false,false);
	refreshScreen(); // これはロードが発生しないはずなので同期で呼び出してしまう
	
	setRootLayersProps(layerID_Numb_Title,true,false);
	refreshScreen();  // これは非同期動作のハズ
}

// 同じ関数がSVGMapLv0.1_LayerUI2_r2.jsにもある・・(getHash)
function getUrlHash(url){
//	console.log(url);
	if ( url.indexOf("#")>=0){
		var lhash = url.substring(url.indexOf("#") +1 );
		if ( lhash.indexOf("?")>0){
			lhash = lhash.substring(0,lhash.indexOf("?"));
		}
		lhash = lhash.split("&");
//		console.log(lhash);
		for ( var i = 0 ; i < lhash.length ; i++ ){
//			console.log(lhash[i]);
			if ( lhash[i].indexOf("=")>0){
				lhash[i] = lhash[i].split("="); //"
			} else if ( lhash[i].indexOf("\(")>0){ // )
				var lhName = lhash[i].substring(0,lhash[i].indexOf("\(") ); // )
				var lhVal = lhash[i].substring(lhash[i].indexOf("\(")+1, lhash[i].length -1  ); // )
				lhash[i] = [ lhName, lhVal];
			}
			lhash[lhash[i][0]]=lhash[i][1];
		}
		return ( lhash );
	} else {
		return ( null );
	}
}

function getElementByIdUsingQuerySelector(qid){
	return this.querySelector('[id="' + qid + '"]')
}

function removeChildren( targetElem ){
	for (var i =targetElem.childNodes.length-1; i>=0; i--) {
		targetElem.removeChild(targetElem.childNodes[i]);
	}

}

var contentProxyParams = { // プロキシ経由でコンテンツを取得するための設定オブジェクト
	getUrlViaProxy: null, // プロキシ経由URL生成関数(svg用)
	getUrlViaImageProxy: null, // 同上(image用)
	crossOriginAnonymous: false,
	getNonlinearTransformationProxyUrl: null, // 2021/1/27 ビットイメージの非線形変換を行うときだけプロキシを使う設定
	crossOriginAnonymousNonlinearTF: false,
}

//, getUrlViaProxy;
function setProxyURLFactory( documentURLviaProxyFunction , imageURLviaProxyFunction , imageCrossOriginAnonymous , imageURLviaProxyFunctionForNonlinearTransformation , imageCrossOriginAnonymousForNonlinearTransformation){
	// 2020/1/30 proxyURL生成のsetterを設けるとともに、ビットイメージに対するproxyも設定できるように
	// 2021/1/27 ビットイメージの非線形変換のためだけに用いるプロキシを別設定可能にした。 APIの仕様がイケてない・・
	if ( typeof ( documentURLviaProxyFunction ) == "function" ){
		contentProxyParams.getUrlViaProxy = documentURLviaProxyFunction;
	} else if ( documentURLviaProxyFunction === null ){
		contentProxyParams.getUrlViaProxy = null;
	}
	
	if ( typeof ( imageURLviaProxyFunction ) == "function" ){
		contentProxyParams.getUrlViaImageProxy = imageURLviaProxyFunction;
	} else if(imageURLviaProxyFunction === null ){
		contentProxyParams.getUrlViaImageProxy = null;
	}
	
	if ( imageCrossOriginAnonymous == true ){
		contentProxyParams.crossOriginAnonymous = true;
	} else if ( imageCrossOriginAnonymous == false ) {
		contentProxyParams.crossOriginAnonymous = false;
	}
	
	if ( typeof ( imageURLviaProxyFunctionForNonlinearTransformation ) == "function" ){
		contentProxyParams.getNonlinearTransformationProxyUrl = imageURLviaProxyFunctionForNonlinearTransformation;
	} else if(imageURLviaProxyFunctionForNonlinearTransformation===null){ // undefinedのときは何もしないようにした方が良いかもということで 2021/1/27
		contentProxyParams.getNonlinearTransformationProxyUrl = null;
	}
	
	if ( imageCrossOriginAnonymousForNonlinearTransformation == true ){
		contentProxyParams.crossOriginAnonymousNonlinearTF = true;
	} else if ( imageCrossOriginAnonymousForNonlinearTransformation == false ) {
		contentProxyParams.crossOriginAnonymousNonlinearTF = false;
	}
	
	console.log("called setProxyURLFactory: contentProxyParams:",contentProxyParams,"    input params:",documentURLviaProxyFunction , imageURLviaProxyFunction , imageCrossOriginAnonymous , imageURLviaProxyFunctionForNonlinearTransformation , imageCrossOriginAnonymousForNonlinearTransformation);
}

function getLinearTransformMatrix(x1i,y1i,x2i,y2i,x3i,y3i,x1o,y1o,x2o,y2o,x3o,y3o){
	// ３基準点の変換の振る舞いから、それに適合する1次変換行列を得るための関数 2020/3/26
	// メルカトル対応に伴い実装
	// input:
	// *i:変換前の座標の3組
	// *o:変換後の座標の3組
	// output:
	// matrix{.a,.b,.c,.d,.e,.f}
	var xs = getTernarySimultaneousEquationsSolution(x1i, y1i, 1, x2i, y2i, 1, x3i, y3i, 1, x1o, x2o, x3o);
	var ys = getTernarySimultaneousEquationsSolution(x1i, y1i, 1, x2i, y2i, 1, x3i, y3i, 1, y1o, y2o, y3o);
	if ( xs && ys ){
		var ansMatrix = {
			a:xs.x1,
			c:xs.x2,
			e:xs.x3,
			b:ys.x1,
			d:ys.x2,
			f:ys.x3
		}
		return ( ansMatrix );
	} else {
		return ( null );
	}
}

function getTernarySimultaneousEquationsSolution(a11, a12, a13, a21, a22, a23, a31, a32, a33, b1, b2, b3){
	// 三元連立方程式の解を得る関数 2020/3/26
	// getLinearTransformMatrixが使用する
	// https://www.cis.twcu.ac.jp/~nagasima/02sek3.pdf
	// x1, x2, x3 : 求める値
	// a11, a12, a13, a21, a22, a23, a31, a32, a33 : 方程式の係数
	var det3 = a11*a22*a33 + a12*a23*a31 + a13*a21*a32 - a11*a23*a32 - a12*a21*a33 - a13*a22*a31;
	if ( det3==0 ){
		return null;
	}
	var x1 = (b1*a22*a33 + a12*a23*b3 + a13*b2*a32 - b1*a23*a32 - a12*b2*a33 - a13*a22*b3)/det3;
	var x2 = (a11*b2*a33 + b1*a23*a31 + a13*a21*b3 - a11*a23*b3 - b1*a21*a33 - a13*b2*a31)/det3;
	var x3 = (a11*a22*b3 + a12*b2*a31 + b1*a21*a32 - a11*b2*a32 - a12*a21*b3 - b1*a22*a31)/det3;
	return{
		x1 : x1,
		x2 : x2,
		x3 : x3
	}
}

return { // svgMap. で公開する関数のリスト 2014.6.6
	// まだ足りないかも？
	// http://d.hatena.ne.jp/pbgreen/20120108/1326038899
	Geo2SVG : Geo2SVG,
	POIviewSelection : POIviewSelection,
	SVG2Geo : SVG2Geo,
	addEvent : addEvent,
	callFunction : function ( fname ,p1,p2,p3,p4,p5){
//		console.log("call callFunc:",fname , p1,p2,p3,p4,p5);
		eval( "var vFunc = " + fname); // "
//		vFunc();
		var ans = vFunc.call(null,p1,p2,p3,p4,p5);
//		eval( fname  ).bind(null,p1,p2,p3,p4,p5);
		return ( ans );
	},
	captureGISgeometries: captureGISgeometries,
	captureGISgeometriesOption: function ( BitImageGeometriesCaptureFlg , TreatRectAsPolygonFlg ){ // 2018.2.26
		// TBD : ロードできてないイメージは外すかどうか, onViewportのもののみにするかどうか のオプションもね
		BitImageGeometriesCaptureFlag = BitImageGeometriesCaptureFlg; // ビットイメージをキャプチャするかどうか
		if ( TreatRectAsPolygonFlg ){
			TreatRectAsPolygonFlag = TreatRectAsPolygonFlg; // rect要素をPoint扱いにするかPolygon扱いにするか
		}
	},
	checkSmartphone : checkSmartphone, // added on rev15
	childDocOp : childDocOp,
	dynamicLoad : dynamicLoad,
	escape : escape,
	geo2Screen : geo2Screen,
	getBBox : getBBox,
	getCentralGeoCoorinates : getCentralGeoCoorinates,
	getConversionMatrixViaGCS : getConversionMatrixViaGCS,
	getElementByImageId : getElementByImgIdNoNS,
	getGeoViewBox : function( ){ 
		return {
			x:geoViewBox.x , 
			y:geoViewBox.y , 
			width:geoViewBox.width, 
			height:geoViewBox.height, 
			cx: geoViewBox.x + 0.5*geoViewBox.width, 
			cy:geoViewBox.y + 0.5*geoViewBox.height
		} 
	},
	getHashByDocPath : getHashByDocPath,
	getHyperLink : getHyperLink,
	getInverseMatrix : getInverseMatrix,
	getLayer : getLayer,
	getLayerId : getLayerId,
	getLayers : getLayers,
	getLinearTransformMatrix: getLinearTransformMatrix,
	getLoadErrorStatistics:getLoadErrorStatistics,
	getMapCanvas : function(){ return (mapCanvas) },
	getMapCanvasSize : function( ){ return (mapCanvasSize) },
	getMouseXY : getMouseXY,
	getNonScalingOffset : getNonScalingOffset,
	getObject : function ( oname ){
		return ( eval ( oname ) );
	},
	getPoiPos : getNonScalingOffset, // for backwards comatibility
	getResume : function( ){ return ( resume) },
	getRoot2Geo : function( ){ return (root2Geo) },
	getRootCrs : function( ){ return (rootCrs) },
	getRootLayersProps : getRootLayersProps,
	getRootViewBox : function( ){ return (rootViewBox) },
	getSvgImages : function( ){ return (svgImages) },
	getSvgImagesProps : function( ){ return (svgImagesProps) },
	getSvgTarget : getSvgTarget,
	getSwLayers : getSwLayers,
	getSymbols : getSymbols,
	getTickerMetadata : getTickerMetadata, // added on rev15
	getTransformedBox : getTransformedBox,
	getUaProp : function (){
		return {
			isIE: isIE,
			isSP: isSP,
			uaProp: uaProp
		}
	},
	getVerticalScreenScale : getVerticalScreenScale,
	getViewBox : getViewBox,
	gps : gps,
	gpsCallback : gpsSuccess, // added on rev15
	handleResult : handleResult,
	ignoreMapAspect : function(){ ignoreMapAspect = true; },
	initLoad : initLoad,
	isIntersect : isIntersect,
	linkedDocOp : linkedDocOp,
	loadSVG : loadSVG,
	matMul : matMul,
	numberFormat : numberFormat,
	override : function ( mname , mval ){
//		console.log("override " + mname );
		eval( mname + " = mval; "); // もっと良い方法はないのでしょうか？
//		console.log("override " + mname + " : " , this[mname] , showPoiProperty , this.showPoiProperty , this);
	},
	parseEscapedCsvLine : parseEscapedCsvLine, // added on rev15
	refreshScreen : refreshScreen,
	registLayerUiSetter : function ( layerUIinitFunc, layerUIupdateFunc ){
		setLayerUI = layerUIinitFunc;
		updateLayerListUIint = layerUIupdateFunc;
	},
	reLoadLayer : reLoadLayer, // added on rev15
	resumeToggle : resumeToggle,
	screen2Geo : screen2Geo,
	setCustomModal : setCustomModal,
	setDevicePixelRatio : setDevicePixelRatio,
	getDevicePixelRatio : getDevicePixelRatio,
	setGeoCenter : setGeoCenter,
	setGeoViewPort : setGeoViewPort,
	setLayerVisibility : setLayerVisibility,
	setMapCanvas : function( mc ){ mapCanvas = mc },
	setMapCanvasCSS : setMapCanvasCSS,
	setMapCanvasSize : function( mcs ){ mapCanvasSize = mcs },
	setPreRenderController : function( layerId, pcf ){ // SVGMapLv0.1_PWAで使用
		if ( typeof(pcf)=="function"){
			if ( layerId ){
				svgImagesProps[layerId].preRenderControllerFunction=pcf;
			} else {
				preRenderSuperControllerFunction = pcf;
			}
		} else {
			if ( layerId ){
				delete (svgImagesProps[layerId].preRenderControllerFunction);
			} else {
				preRenderSuperControllerFunction = null;
			}
		}
	},
	setResume : function( stat ){
//		console.log("setResume:",stat,"   ck:", Object.keys(svgImagesProps).length,svgImagesProps);
		resume = stat;
		if ( !resume || Object.keys(svgImages).length > 0 ){ // 2017.8.22 debug 2017.9.29 dbg2: onload直後でsetResume(true)するとエラーアウトしてresumeできない : 2017.10.03 dbg3: svgImagesPropsは作られていてもsvgImagesがない場合エラーするので・・Object.keys(svgImagesProps).length -> Object.keys(svgImages).length に
			saveResumeData();
		}
	},
	setRootLayersProps : setRootLayersProps,
	setRootViewBox : function( rvb ){ rootViewBox = rvb },
	setShowPoiProperty : setShowPoiProperty, 
	setSmoothZoomInterval : setSmoothZoomInterval,
	setSmoothZoomTransitionTime : setSmoothZoomTransitionTime,
	setSummarizeCanvas : function( val ){ summarizeCanvas = val },
//	setTestClicked : function( ck ) { testClicked = ck}, // Obsolute 2018.2.2
	setUpdateCenterPos : setUpdateCenterPos,
	setProxyURLFactory : setProxyURLFactory,
	setZoomRatio : function( ratio ){ zoomRatio = ratio },
	showModal : showModal,
	showPage : showPage,
	showUseProperty : showUseProperty,
//	testClick : testClick, // Obsolute 2018.2.2
	transform : transform,
	updateLayerListUI : function (){
		// console.log("updateLayerListUI called");
		if ( typeof updateLayerListUIint == "function" ){
			updateLayerListUIint();
		}
	},
	zoomdown : zoomdown,
	zoomup : zoomup
}

})();

window.svgMap = svgMap;


})( window );
