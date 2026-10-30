export const M5S_PHASES={1:'登天夜狂熱',2:'返場夜狂熱',3:'高能夜狂熱'};
export const M5S_SOURCES=[
  {title:'MMW × 蘇帕醬噗 · M5S 攻略詳解',url:'https://www.bilibili.com/video/BV1pNNyzxEh6/'},
  {title:'XivStrat · M5S 圖文攻略與站位宏',url:'https://xivstrat.com/07/m5s/'},
  {title:'XivStrat · 遊戲標點檔 UISAVE.DAT',url:'https://xivstrat.com/waymarks/07/AacCruiserweight/UISAVE.DAT'},
  {title:'M5S–M8S 傷害時間軸 · M5S 分頁',url:'https://docs.qq.com/sheet/DQm1qQ1FFS2xIZ3pQ?tab=oxe3v1'},
];
// Normalized from the published waymark diagram; NOT decoded from UISAVE.DAT.
export const M5S_WAYMARKS=[
  {label:'A',x:50,y:25,color:'#e999a7'},{label:'B',x:75,y:50,color:'#e6d47e'},
  {label:'C',x:50,y:75,color:'#8fcbe6'},{label:'D',x:25,y:50,color:'#c09ee7'},
  {label:'1',x:18.75,y:18.75,color:'#e999a7'},{label:'2',x:81.25,y:18.75,color:'#e6d47e'},
  {label:'3',x:81.25,y:81.25,color:'#8fcbe6'},{label:'4',x:18.75,y:81.25,color:'#c09ee7'},
];
const chapter=(id,phase,title,en,time,anchor,tips)=>({id:`m5s-${id}`,phase,title,en,time,source:`https://xivstrat.com/07/m5s/p${phase}/#${anchor}`,tips});
// Pull-relative cast-start references read from XivStrat's rendered article.
// The QQ damage sheet rounds damage times (e.g. first Deep Cut at 00:15).
export const M5S_CHAPTERS=[
  chapter('opening',1,'開場・經典銘心','DEEP CUT',9.2,'deep-cut',['雙坦各自在王前方兩側承接扇形，其餘人到王背後。','傷害表首輪記為約 00:15、魔法 300,000，另有流血；此處只練扇形位置。']),
  chapter('records',1,'A／B 面・連指向','FLIP / TWIST',22.5,'flip-to-x-side',['先記住 A 或 B 面，再讀連指向次數與首刀方向。','同一側連打 2–4 次後，只換邊一次；接著處理預存 A／B 面。','A 面以八方角度專練、B 面以兩組四人檢查人數；不是攻略的統一內環站位。']),
  chapter('floor1',1,'第一次熱舞場地','FUNKY FLOOR',72.6,'funky-floor',['西 MT 組、東 ST 組；內側近戰、外側遠程。','辨識交替地板，再在自己的倒數結束時獨佔安全聚光燈。','燈位與地板採離散結算畫面；24／32 秒為實戰狀態標籤，教學步驟倒數另計。']),
  chapter('fever1',1,'登天夜狂熱・八輪','ARCADY NIGHT FEVER',149.5,'arcady-night-fever',['首次固定鋼鐵，之後八輪內外交替，第九輪只剩最後一次扇形複讀。','坦補在北、DPS 在南；被點名後暫時偏移，閃避上一輪原地複讀。','α／β 與配對已按本局配置給定，不從傷害命中動態生成狀態。']),
  chapter('bombs',1,'放縱勁舞・αβ 配對','LET’S DANCE!',176.3,'lets-dance',['八隻青蛙由左至右記錄半場刀，依次躲避。','α／β 依倒數由短到長從北排到南；同倒數的異色兩人靠攏。','僅本輪到期者檢查配對；第三人、錯色或距離太遠都會失敗。']),
  chapter('waves',2,'舞浪全開・地火節奏','RIDE THE WAVES',228.8,'ride-the-waves',['初始安全列為 2／5 或 4／7，南半場的拐點固定到 3／6 列。','4 拍二人分攤，8 拍全員分散；兩輪節奏必定不同。','採分段地火安全列，未模擬拉王、近戰射程或連續爆炸。']),
  chapter('frogs',2,'青蛙舞者・龍龍鳳鳳','FROGTOURAGE',298.8,'frogtourage',['觀察青蛙轉彎後相背或相向，判讀 AC 或 BD 外側安全。','在狹窄安全區內同時處理 4 拍分攤或 8 拍分散。','畫面呈現劃線完成後的範圍，不播放青蛙完整行進動畫。']),
  chapter('lights',2,'聚光燈與伴舞波動','DISCO INFERNAL',320.1,'disco-infernal',['短倒數組先站燈、長倒數組先引導扇形；第二輪交換。','依同色標點找燈與青蛙。ST／D4 對應黃色；MT／D3、H1／D1、H2／D2 各一組。','誘導以青蛙實際最近者及扇形命中判定；燈的移動拆為兩個結算畫面。']),
  chapter('fever2',2,'返場夜狂熱・八輪','ARCADY NIGHT ENCORE',378.5,'arcady-night-encore',['再次處理八輪鋼鐵／月環與扇形複讀。','這次不附加 α／β，仍需閃避第九次複讀。']),
  chapter('remix',2,'徹夜狂歡・四向半場刀','LET’S DANCE! REMIX',405.3,'lets-dance-remix',['青蛙新增前／後兩種姿勢，可能攻擊東、西、南、北任一半場。','依畫面順序逐次判讀八刀；這段沒有 α／β 配對。']),
  chapter('hustle',3,'小運動會 I・連續左右刀','DO THE HUSTLE',446,'frogtourage-part-1',['兩輪相鄰斜角青蛙各形成一個安全四分之一場。','先躲兩輪青蛙，再躲面北的王；兩輪青蛙安全區可能相同。']),
  chapter('bait',3,'小運動會 II・換組誘導','FROGTOURAGE / WAVE',470.6,'frogtourage-part-2',['第一輪坦補引導、第二輪 DPS 引導，避免連吃耐性降低。','一輪中間安全、一輪兩側安全，兩輪劃線方向不同。','靠近自己的斜角青蛙，同時讓扇形避開待機組。']),
  chapter('combo',3,'小運動會 III・八分之一','COMBINED HUSTLE',501.6,'frogtourage-part-3',['王面北的半場刀與兩隻青蛙同時結算。','取三個半場的交集；安全位置在 A 或 C 兩側的八分之一場。']),
  chapter('floor3',3,'最後地板・節奏與內外','FUNKY FLOOR / BEATS',522.1,'funky-floor',['這次只有交替地板，沒有聚光燈。','4／8 拍各一次，中間穿插鋼鐵／月環。','每一步呈現結算當刻的地板，教學倒數經過放慢。']),
  chapter('finale',3,'連續全屏與終演','HI-NRG FEVER',555,'hi-nrg-fever',['兩次歡慶時刻後準備終局；傷害與減傷不在模擬範圍。','XivStrat 記錄 10:05.7 狂暴讀條結束、約 10:07 傷害結算。','完成代表走完教學，不代表通過實戰輸出門檻。']),
];
export const M5S_LIMIT='依 XivStrat 三階段圖文與宏建立的分段走位演練。已核對原影片資訊、標點示意及傷害表開場；尚未逐幀核對影片或完整匯入傷害表。實戰時間取圖文讀條起點；教學倒數另計。地板、燈、地火與青蛙採離散結算，αβ 為預設配對；A／B 面為拆解專練。八標點按示意圖換算，未解碼 UISAVE.DAT。不計算傷害、治療、減傷、仇恨或輸出。';
