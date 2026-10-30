export const TOP_PHASES = {1:'歐米茄',2:'歐米茄雙子',3:'完美歐米茄',4:'藍屏',5:'動力運動會',6:'阿爾法歐米茄'};
export const TOP_SOURCES = [
  {title:'莫古力攻略組 · 絕歐上篇（P1–P4）',url:'https://www.bilibili.com/video/BV1Fk4y1n7MD/'},
  {title:'莫古力攻略組 · 絕歐下篇（P5–P6）',url:'https://www.bilibili.com/video/BV1vz4y1B7xP/'},
  {title:'莫古力 · 更新說明與一圖流入口',url:'https://www.bilibili.com/opus/800287973844189204'},
  {title:'Cactbot · 絕歐事件與機制交叉參考',url:'https://github.com/quisquous/cactbot/tree/main/ui/raidboss/data/06-ew/ultimate'},
];
const upper=p=>`${TOP_SOURCES[0].url}?p=${p}`,lower=p=>`${TOP_SOURCES[1].url}?p=${p}`;
// Times are phase-local event references, never a continuous encounter clock.
export const TOP_CHAPTERS = [
  {id:'top-loop',phase:1,title:'循環程序',en:'PROGRAM LOOP',time:15,source:upper(1),tips:['先記住自己的 1–4 號與同號搭檔。','踩塔依 1 → 2 → 3 → 4；接線依 3 → 4 → 1 → 2。','本工具將接線簡化為本輪接線者到外側，並判定兩條線的隔離。']},
  {id:'top-panto',phase:1,title:'全能之主',en:'PANTOKRATOR',time:69.2,source:upper(1),tips:['本輪同號兩人離開人群放導彈，其他六人分攤。','可切換莫古力提供的「分攤追火／火追分攤」兩種練法。','火焰以固定結算圈呈現；不模擬連續追蹤與傷害。']},
  {id:'top-synergy',phase:2,title:'協作程序 PT',en:'PARTY SYNERGY',time:30.9,source:upper(2),tips:['同圖形為一組，先依圖形排成左右兩列。','中距離故障維持中距離；遠距離故障拉遠。','辨識男女分身安全區，再處理光眼、擊退與兩組分攤。本工具使用分段安全區。']},
  {id:'top-limitless',phase:2,title:'協作程序 LB',en:'LIMITLESS SYNERGY',time:82.4,source:upper(2),tips:['莫古力更新配置：人群往 A 點誘導天箭，雙坦在 A／C 拉線。','點名與非點名分開，依序避開天箭，再處理隕石與分攤。','本段接線、隕石採教學檢查點，未重現動態搶線。']},
  {id:'top-transition',phase:3,title:'轉場・狙擊與波動',en:'SNIPER CANNON',time:14.3,source:upper(3),tips:['四名分散、兩名二人分攤、兩名無點名。','無點名者各補一個二人分攤。','波動以分段內外安全區呈現，留意後續場邊手臂。']},
  {id:'top-hello',phase:3,title:'你好，世界',en:'HELLO, WORLD',time:41.3,source:upper(3),tips:['先辨識紅藍毒、大小圈及長短線。','四輪依狀態輪轉，接毒、踩塔與斷線必須配合。','此章是預設狀態的站位檢查點；毒色輪轉、免疫與連線傳遞尚未逐幀重現，請配合原片。']},
  {id:'top-monitors',phase:3,title:'探測式波動炮・小電視',en:'OVERSAMPLED WAVE CANNON',time:171.4,source:upper(3),tips:['三人帶左／右小電視，另外五人負責承接。','朝向與站位都會改變實際命中對象。','本章練習各電視精確命中兩名承接者；採工具教學配置，未完整實作莫古力鏡像式與固定式排隊。']},
  {id:'top-blue',phase:4,title:'藍屏・波動炮',en:'BLUE SCREEN',time:21.4,source:upper(3),tips:['連續三輪分散引導與分攤，不要提前進入隊友的線。','波動圈結算後再內外換位。','教學只判定走位，並不代表通過實戰 DPS 檢定。']},
  {id:'top-delta',phase:5,title:'一運・德爾塔',en:'RUN: DYNAMIS · DELTA',time:40,source:lower(1),tips:['辨識藍／綠線與近／遠世界，按分工分開。','依序處理光眼、拳頭、分身、電視與世界傳遞。','本章只練接線分區、避光眼與近遠世界距離；拳頭互撞和完整斷線順序尚未重現。']},
  {id:'top-sigma',phase:5,title:'二運・西格瑪',en:'RUN: DYNAMIS · SIGMA',time:121.7,source:lower(2),tips:['先辨認圖形搭檔與故障距離，再依塔的人數分工。','擊退前確認自己負責的塔，再躲旋轉雷射。','本章以預設五／六塔檢查點練踩塔與世界傳遞；未重現全部圖形換位與雷射追蹤。']},
  {id:'top-omega',phase:5,title:'三運・歐米茄',en:'RUN: DYNAMIS · OMEGA',time:210.7,source:lower(3),tips:['先連續判讀兩輪男女分身與半場波動。','依近遠世界、順序與動力層數分配兩輪傳遞。','本章提供兩輪預設傳遞檢查點；動力層數是題目給定，並非從一運累計，未重現完整手搖標記。']},
  {id:'top-arrow',phase:6,title:'宇宙天箭與宇宙龍炎',en:'COSMO ARROW / DIVE',time:82.2,source:lower(4),tips:['天箭按地板先後順序換位，先觀察再移動。','宇宙龍炎：雙坦引導最近兩發，六人承接最遠一發。','天箭採內外交換的分段路徑，非所有原始地板組合。']},
  {id:'top-wave',phase:6,title:'無限波動炮',en:'UNLIMITED WAVE CANNON',time:115.4,source:lower(4),tips:['先依序放下地火，再八方向誘導波動炮。','最後重新集合，由坦克站在衝鋒分攤最前方。','第二組天箭與波動炮在此拆段教學，實戰會有複合機制。']},
  {id:'top-meteor',phase:6,title:'宇宙隕石與魔數',en:'COSMO METEOR / MAGIC NUMBER',time:null,source:lower(4),tips:['隕石點名者離開人群，其他人分攤與避開落點。','魔數需要坦克 LB3 與治療 LB3；此處只練集合流程。','此章不提供 LB 按鍵或傷害模擬；完成代表走完教學，不是實戰通關。']},
];
export const TOP_LIMIT = '依莫古力上下篇章節建立的分段教學版。已核對公開章節與更新說明，尚未逐幀核對全片。P3 你好世界、P5 運動會使用預設狀態檢查點；不含完整毒、斷線、拳頭、手搖與動力層數累計。場地半徑、範圍、故障距離與倒數是教學值。各章可直接連到原攻略分 P。';
