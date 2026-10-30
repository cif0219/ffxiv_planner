export const RAIDS = [
  {id:'m5s',code:'M5S',title:'阿卡狄亞・中量級 1',en:'AAC CRUISERWEIGHT M1 · SAVAGE',boss:'派對小子',tier:'阿卡狄亞中量級',expansion:'黃金的遺產',patch:'7.2',status:'ready',tags:['零式','8 人','MMW × XivStrat'],description:'踩著節拍讀半場刀，追著聚光燈找到自己的位置。三階段、十五章的派對走位演練。',accent:'#d4a1d5'},
  {id:'top',code:'TOP',title:'歐米茄驗證絕境戰',en:'THE OMEGA PROTOCOL · ULTIMATE',boss:'歐米茄',tier:'絕境戰',expansion:'曉月之終途',patch:'6.31',status:'ready',tags:['絕歐','8 人','莫古力・教學版'],description:'從循環程序到阿爾法歐米茄。依莫古力攻略章節建立的分段走位與機制原理演練，進階機制採預設檢查點。',accent:'#9fbddd'},
  {id:'p8s', code:'P8S', title:'煉獄之章・第四層', en:'ABYSSOS · THE EIGHTH CIRCLE', boss:'赫淮斯托斯', tier:'煉獄之章', expansion:'曉月之終途', patch:'6.2', status:'ready', tags:['零式','8 人','前半 + 後半'], description:'從蛇與獸的變身，到概念的重組。在攻略裡理解，在場地上熟練。', accent:'#dba879'},
  {id:'p5s', code:'P5S', title:'煉獄之章・第一層', en:'ABYSSOS · THE FIFTH CIRCLE', boss:'紅寶石獸', tier:'煉獄之章', expansion:'曉月之終途', status:'planned', tags:['零式','8 人'], description:'毒池、反射與八連跳。', accent:'#aa8bbd'},
  {id:'p6s', code:'P6S', title:'煉獄之章・第二層', en:'ABYSSOS · THE SIXTH CIRCLE', boss:'赫格莫涅', tier:'煉獄之章', expansion:'曉月之終途', status:'planned', tags:['零式','8 人'], description:'寄生、交換與場地變換。', accent:'#8ea6bb'},
  {id:'p7s', code:'P7S', title:'煉獄之章・第三層', en:'ABYSSOS · THE SEVENTH CIRCLE', boss:'阿格提斯', tier:'煉獄之章', expansion:'曉月之終途', status:'planned', tags:['零式','8 人'], description:'生命之果與三次收割。', accent:'#9cad87'},
  {id:'p12s', code:'P12S', title:'天獄之章・第四層', en:'ANABASEIOS · THE TWELFTH CIRCLE', boss:'雅典娜', tier:'天獄之章', expansion:'曉月之終途', status:'planned', tags:['零式','8 人'], description:'下一段攻略旅程，等待展開。', accent:'#b1abd7'},
];
export const SOURCES = [
  {title:'Cactbot · P8S 實戰事件時間軸', url:'https://github.com/quisquous/cactbot/blob/main/ui/raidboss/data/06-ew/raid/p8s.txt'},
  {title:'P8S 機制資料與影片索引', url:'https://ffxiv.consolegameswiki.com/wiki/P8S'},
  {title:'菓子攻略 · 原版概念支配 I 站位', url:'https://www.bilibili.com/video/BV1q3411Q7jg/'},
];
export const CHAPTERS = {
  opening:{id:'opening',phase:1,title:'開場・創世之火',en:'GENESIS OF FLAME',time:12.1,summary:'記住預存的分散或分攤，再讀火線與蛇鳥。',tips:['概念技能會延後結算；看完讀條仍要記住。','蛇：中間危險。鳥：兩側危險。','雙坦死刑分開引導並換坦。']},
  snake1:{id:'snake1',phase:1,title:'蛇 I',en:'GORGOMANTEIA I',time:63.9,summary:'先背對石化，再用視線與毒處理自己的蛇。',tips:['先看順序，再看眼睛或毒的狀態。','蛇讀條時背對；自己的眼睛結算時轉向指定蛇。','毒必須在蛇已石化後靠近處理。']},
  manifold:{id:'manifold',phase:1,title:'幻影創造・萬象之火',en:'MANIFOLD FLAMES',time:140.2,summary:'分身蛇鳥、近距離誘導與火線連續處理。',tips:['辨識分身安全線，遠近組交換。','蛇鳥範圍和分攤／放射要同時處理。','最後觀察火線，集合至安全角落。']},
  beast1:{id:'beast1',phase:1,title:'獸 I',en:'REARING RAMPAGE',time:196.4,summary:'記住自己被點名的輪次，依序引導最遠距離雙人跳。',tips:['擊退前靠近中心，保留落點空間。','四次點名決定四次跳躍的順序。','輪到自己時與搭檔一起成為最遠的兩人。']},
  fourfold:{id:'fourfold',phase:1,title:'四重火炎',en:'FOURFOLD FIRES',time:252.8,summary:'追蹤三輪地火，並處理即時與預存的分攤。',tips:['先記預存技能，別被地火蓋過記憶。','依冒泡火池與蛇的落點換安全區。','最後蛇鳥與預存分攤一起結算。']},
  snake2:{id:'snake2',phase:1,title:'蛇 II',en:'GORGOMANTEIA II',time:314.6,summary:'雙輪石化與毒，避開分身，再處理皇冠與四人分攤。',tips:['每人都有眼睛與毒，依順序交替。','分身會消滅兩條蛇，找出留下的兩條。','皇冠站外側，分攤組在蛇的內側。']},
  beast2:{id:'beast2',phase:1,title:'獸 II・炎之足跡',en:'BLAZING FOOTFALLS',time:396.6,summary:'記憶衝刺、擊退與大圈順序，讓落點連接下一個安全區。',tips:['Impact 是擊退；Crush 是大圈。','衝刺路徑不能站人；在黑線外側吃擊退。','分攤會與第一個衝刺同時結算。']},
  door:{id:'door',phase:1,title:'前半終局',en:'GENESIS / PHASE TRANSITION',time:459.9,summary:'整理走位，進入後半獨立時間軸。',tips:['前後半時間軸分別從零開始。','這裡練習機制流程，不計算傷害與 DPS 門檻。']},
  na1:{id:'na1',phase:2,title:'自然支配 I',en:'NATURAL ALIGNMENT I',time:40.4,summary:'紫圈保持隔離，其餘六人依序分散、分攤與火冰。',tips:['兩位紫圈不可被其他機制命中。','火：最遠三人各兩人分攤。冰：最近兩人各三人分攤。','分身安全列會交替；每次都重新判讀。']},
  hc1:{id:'hc1',phase:2,title:'概念支配 I',en:'HIGH CONCEPT I',time:118.6,summary:'短概念爆發、合成兩塔、複製長概念，再合成四塔。',tips:['沿用原專案的菓子配置與實際合成判定。','兩個概念持續靠近 2 秒才完成合成。','踩塔同時躲左右刀；塔要有對應屬性。']},
  desolation:{id:'desolation',phase:2,title:'萬象灰燼',en:'LIMITLESS DESOLATION',time:185.3,summary:'記住點名輪次，先放地火，再按順序踩塔。',tips:['坦補左、DPS 右，每組各四個點名順序。','地火鎖定後離開，不能把火帶進塔內。','依原點名順序踩塔，不能提早替別人踩。']},
  na2:{id:'na2',phase:2,title:'自然支配 II・逆轉',en:'INVERSE MAGICKS',time:241.5,summary:'讀出各紫圈是否逆轉，再判斷真正的分散、分攤、火與冰。',tips:['逆轉只影響帶有逆轉狀態的紫圈。','畫面保留原始圖示；有逆轉才把效果反過來。','第二次不沿用第一次的安全列。']},
  hc2:{id:'hc2',phase:2,title:'概念支配 II・不死鳥',en:'HIGH CONCEPT II',time:331.7,summary:'複製 α、合成火，處理牽線與四塔，讓火與風合成不死鳥。',tips:['無狀態的兩人先接短 α，取得火概念的材料。','火 + 風合成不死鳥；水／雷不參與最後合成。','牽線者帶開直線，其他四人踩第二輪塔。']},
  dominion1:{id:'dominion1',phase:2,title:'支配者之塔 I',en:'DOMINION I',time:434.6,summary:'四人先中地火，其餘四人先踩塔，再交換。',tips:['有土耐性降低的四人不能踩第一輪塔。','每塔只站一人；第二輪由先中地火者接手。']},
  dominion2:{id:'dominion2',phase:2,title:'支配者之塔 II',en:'DOMINION II',time:463.9,summary:'重新判斷點名，完成第二次換組踩塔。',tips:['點名重新分配，不沿用上一組。','連續全屏傷害需在實戰安排減傷。']},
  finale:{id:'finale',phase:2,title:'終局・自我消亡',en:'EGO DEATH',time:506.3,summary:'回顧完整流程，完成本次走位演練。',tips:['最後一次自我消亡是狂暴，實戰需在讀條完成前擊倒。','完成本模擬代表走位通過，不代表實戰傷害達標。']},
};
export function chapterOrder(branch='snake') {
  return ['opening',branch==='beast'?'beast1':'snake1','manifold',branch==='beast'?'snake1':'beast1','fourfold',branch==='beast'?'beast2':'snake2',branch==='beast'?'snake2':'beast2','door','na1','hc1','desolation','na2','hc2','dominion1','dominion2','finale'].map(id=>({...CHAPTERS[id],time:branch==='beast'?({beast1:63.9,manifold:114.1,snake1:170.2,fourfold:252.6,beast2:314.3,snake2:393.2,door:459.4}[id]??CHAPTERS[id].time):CHAPTERS[id].time}));
}
export function timeLabel(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
