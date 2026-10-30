import {ROLES,createEncounter,checkpointPositions,tickFusion,livePlan,liveConcept,validateRound,shuffle,distance} from './engine.mjs';
import {chapterOrder} from './raids.mjs';
import {validateTopRules} from './top-rules.mjs';
import {validateM5sRules,inCone} from './m5s-rules.mjs';
export {ROLES,distance};
const pt=(x,y)=>({x,y});
const clone=p=>p.map(v=>({...v}));
const spread=[pt(35,20),pt(65,20),pt(20,65),pt(80,65),pt(20,35),pt(80,35),pt(35,80),pt(65,80)];
const pairs=[[0,4],[1,5],[2,6],[3,7]];
const groups=[[0,2,4,6],[1,3,5,7]];
const circle=(x,y,r)=>({kind:'circle',x,y,r});
const rect=(x,y,w,h)=>({kind:'rect',x,y,w,h});
const corners=[pt(14,14),pt(14,86),pt(86,86),pt(86,14)];
export function seededRandom(seed){let x=Number(seed)>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export function inside(p,h){return h.kind==='circle'?distance(p,h)<=h.r:h.kind==='rect'?p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h:h.kind==='annulus'?distance(p,h)>=h.inner&&distance(p,h)<=h.r:h.kind==='cone'?inCone(p,h,h.angle,h.width,h.r):false;}
export function angleTo(a,b){return Math.atan2(b.y-a.y,b.x-a.x);}
export function angleDelta(a,b){return Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));}
export function knockback(p,origin,amount){const d=distance(p,origin);return d<.001?{...p}:pt(p.x+(p.x-origin.x)/d*amount,p.y+(p.y-origin.y)/d*amount);}
function base(id,name,body,targets=spread,extra={}){return {id,name,body,duration:8,targets:clone(targets),labels:ROLES.map(()=>''),hazards:[],stacks:[],spreads:[],towers:[],facing:[],...extra};}
function dispersed(id,name,body,targets=spread,extra={}){return base(id,name,body,targets,{spreads:ROLES.map((_,player)=>({player,r:7})),...extra});}
function party(id,name,body){const t=ROLES.map((_,i)=>i<2?pt(45+i*10,18):pt(42+(i%3)*8,55+Math.floor((i-2)/3)*8));return base(id,name,body,t,{zones:[{players:[0,1],x:50,y:18,r:14}],duration:5});}
function tank(id='tank'){return base(id,'雙坦死刑 → 重新集合','雙坦分開接死刑，其他人離開坦克。實戰需減傷與換坦；此處判定位置。',ROLES.map((_,i)=>i===0?pt(22,18):i===1?pt(78,18):pt(40+(i%3)*9,58+Math.floor(i/5)*10)),{spreads:[{player:0,r:12},{player:1,r:12}],zones:[{players:[0],x:22,y:18,r:12},{players:[1],x:78,y:18,r:12}]});}
function sun(rng,id='sun',stored){const bird=rng()<.5,stack=stored??(rng()<.5);let t;
  if(stack){t=ROLES.map((_,i)=>{const g=pairs.findIndex(a=>a.includes(i));return pt(bird?(g%2?58:42):(g%2?84:16),g<2?27:73);});}
  else t=ROLES.map((_,i)=>pt(bird?(i%2?59:41):(i%2?85:15),16+Math.floor(i/2)*22));
  return base(id,`${bird?'鳥・中間安全':'蛇・兩側安全'} ＋ ${stack?'四組二人分攤':'八人分散'}`,'讀蛇鳥範圍，並同時結算之前記住的概念。',t,{hazards:bird?[rect(0,0,33,100),rect(67,0,33,100)]:[rect(33,0,34,100)],stacks:stack?pairs.map(g=>({player:g[0],count:2,r:7})):[],spreads:stack?[]:ROLES.map((_,player)=>({player,r:7})),labels:ROLES.map(()=>stack?'二人':'分散')});
}
function torches(rng,id='torch',corner=false){const k=Math.floor(rng()*4),c=corner?corners[k]:[pt(37.5,12.5),pt(87.5,37.5),pt(62.5,87.5),pt(12.5,62.5)][k];const h=[];for(let y=0;y<4;y++)for(let x=0;x<4;x++)if(Math.floor(c.x/25)!==x||Math.floor(c.y/25)!==y)h.push(rect(x*25,y*25,25,25));return base(id,'火線・尋找安全格','觀察藍色火線圍出的格子，移動到沒有被封住的格子。本段以結算時的危險格呈現。',ROLES.map((_,i)=>pt(c.x+(i%4-1.5)*3,c.y+(Math.floor(i/4)-.5)*5)),{hazards:h,duration:10});}
function footprint(id='footprint'){return base(id,'獸形・中心擊退','先靠近中央，預覽箭頭表示擊退後落點。落點碰到外圈會失敗。',ROLES.map((_,i)=>{const a=i*Math.PI/4;return pt(50+Math.cos(a)*11,50+Math.sin(a)*11);}),{knockback:{origin:pt(50,50),amount:24},duration:6});}
function snakes(rng,second=false){const s=[],order=shuffle([0,1,2,3,4,5,6,7],rng),sn=[pt(27,17),pt(83,27),pt(73,83),pt(17,73)];
  s.push(base('kick','蛇形・離開腳下','離開王的圓形腳下範圍。',spread,{hazards:[circle(50,50,25)]}));
  const roles=ROLES.map((_,i)=>{const n=order.indexOf(i);return {turn:Math.floor(n/4),eye:n%2===0,snake:Math.floor(n%4/2)};});
  for(let round=0;round<2;round++){
    const sources=second?sn:sn.slice(round*2,round*2+2);
    const t=ROLES.map((_,i)=>{const a=second?sn[Math.floor(order.indexOf(i)/2)]:sources[roles[i].snake];return pt(a.x<50?a.x+10:a.x-10,a.y<50?a.y+10:a.y-10);});
    const gazeTargets=second?t.map(p=>pt(p.x<50?6:94,p.y<50?6:94)):t;
    s.push(base(`gaze-${round}`,`第 ${round+1} 輪・背對蛇眼`,'蛇的石化讀條結算時，背對所有正在讀條的蛇。點選朝向按鈕，或 Q／E 旋轉視角。',gazeTargets,{facing:ROLES.map((_,player)=>({player,away:sources})),sources,labels:roles.map(r=>second?`${round===r.turn?'眼睛':'毒'} ${round+1}`:`${r.turn+1} 順・${r.eye?'眼':'毒'}`),duration:6}));
    const active=second?ROLES.map((_,i)=>i).filter(i=>order.indexOf(i)%2===round):ROLES.map((_,i)=>i).filter(i=>roles[i].turn===round&&roles[i].eye);
    const eyes=t.map(p=>({...p}));const facing=active.map(player=>({player,toward:second?sn[Math.floor(order.indexOf(player)/2)]:sources[roles[player].snake]}));
    s.push(base(`eye-${round}`,'眼睛朝蛇・其他人背對','有眼睛且輪到本輪者面向指定蛇，避免把隊友放進扇形。其他人保持背對。',eyes,{facing,sources,cones:facing,labels:roles.map((r,i)=>active.includes(i)?'眼睛 → 蛇':'等待')}));
    const poisons=second?ROLES.map((_,i)=>i).filter(i=>order.indexOf(i)%2!==round):ROLES.map((_,i)=>i).filter(i=>roles[i].turn===round&&!roles[i].eye);
    const p=clone(t);poisons.forEach(i=>p[i]={...(second?sn[Math.floor(order.indexOf(i)/2)]:sources[roles[i].snake])});
    s.push(base(`poison-${round}`,'毒爆發・靠近指定蛇','帶毒者靠近已石化的蛇，其他人離開毒圈。',p,{spreads:poisons.map(player=>({player,r:7})),zones:poisons.map(player=>({players:[player],...p[player],r:6})),sources,labels:ROLES.map((_,i)=>poisons.includes(i)?'毒':'避毒')}));
  }
  if(second){const t=ROLES.map((_,i)=>{const g=i<4?0:1;return pt(g?80:20,40+(i%4)*3);});t[0]=pt(20,20);t[4]=pt(80,20);s.push(base('crown','分身直線・皇冠與四人分攤','分身直線消滅中間兩蛇；皇冠在外側，另外三人靠近同組分攤者。',t,{hazards:[rect(40,0,20,100)],stacks:[{player:1,count:4,r:25},{player:5,count:4,r:25}],zones:[{players:[0],x:20,y:20,r:5},{players:[4],x:80,y:20,r:5}],labels:ROLES.map((_,i)=>i===0||i===4?'皇冠・外側':'四人分攤')}));}
  s.push(party('snake-heal','蛇機制結束・集合','回到中央接全屏攻擊。'));return s;
}
function beasts(rng,second=false){const s=[footprint()];if(!second){const assigned=shuffle(pairs,rng);s.push(dispersed('uplift','隆起・記住點名順序','八人散開，頭上數字是接下來跳躍的順序。',spread,{labels:ROLES.map((_,i)=>`第 ${assigned.findIndex(p=>p.includes(i))+1} 跳`)}));
    for(let n=0;n<4;n++){const g=assigned[n],target=pt(n%2?75:25,20);const t=ROLES.map((_,i)=>g.includes(i)?pt(target.x+(g.indexOf(i)?2:-2),target.y):pt(44+(i%3)*5,50+Math.floor(i/3)*6));s.push(base(`stomp-${n}`,`第 ${n+1} 跳・最遠二人`,'本輪兩人到遠處一起引導跳躍，其餘隊員靠近中央，避免搶到最遠距離。',t,{stacks:[{player:g[0],count:2,r:8}],bait:{players:g,origin:pt(50,50)},labels:ROLES.map((_,i)=>g.includes(i)?'本輪引導':`第 ${assigned.findIndex(p=>p.includes(i))+1} 跳`)}));}return s;}
  const impact=rng()<.5;for(let n=0;n<2;n++){const west=n===0,origin=pt(west?0:100,50);s.push(base(`trail-${n}`,`炎之足跡 ${n+1}・衝刺與${n===0?'分攤':'擊退'}`,'避開中線，在外側接擊退。預先讓擊退落點連接下一段安全區。',ROLES.map((_,i)=>pt(west?31:69,18+Math.floor(i/2)*21)),{hazards:[rect(38,0,24,100)],knockback:{origin:pt(50,50),amount:14},stacks:n===0?pairs.map(p=>({player:p[0],count:2,r:5})):[],duration:9}));
    const kb=n===0?impact:!impact;s.push(base(`quadrupedal-${n}`,kb?'四足衝擊・朝來源靠近':'四足重擊・遠離來源','依王的動作判讀擊退或大圈；擊退要靠近，重擊要遠離。',ROLES.map((_,i)=>kb?pt(west?20:80,40+i*3):pt(west?83:17,15+i*10)),{hazards:kb?[]:[circle(origin.x,origin.y,65)],knockback:kb?{origin,amount:35}:null,duration:8}));}
  s.push(torches(rng,'beast-torch',true));return s;
}
function natural(rng,inverse=false){const purple=shuffle(rng()<.5?[0,1,2,3]:[4,5,6,7],rng).slice(0,2),others=ROLES.map((_,i)=>i).filter(i=>!purple.includes(i)),rev=[inverse&&rng()<.7,inverse&&rng()<.7];if(inverse&&!rev.some(Boolean))rev[0]=true;
  const rawStack=rng()<.5,rawFire=rng()<.5,left=rng()<.5,row=rng()<.5?14:39,s=[];
  for(let n=0;n<4;n++){
    const fire=n>=2,which=fire?1:0,raw=fire?(n===2?rawFire:!rawFire):(n===0?rawStack:!rawStack),effective=rev[which]?!raw:raw;
    const y=n%2?53-row:row;const hazard=inverse||fire?[rect(0,y===14?26:1,100,23),rect(0,52,100,48)]:n===1?[rect(left?50:0,0,50,100)]:[];
    const center=pt(!inverse&&!fire&&n===1?(left?25:75):50,y);const t=ROLES.map(()=>({...center}));purple.forEach((i,k)=>t[i]=pt(center.x+(k?3:-3),y));
    const activeGroups=fire?(effective?[others.slice(0,2),others.slice(2,4),others.slice(4,6)]:[others.slice(0,3),others.slice(3,6)]):effective?[others]:others.map(i=>[i]);
    const xs=fire?(effective?[17,50,83]:[19,81]):effective?[center.x]:(!inverse&&n===1?(left?[6,13,20,27,34,41]:[59,66,73,80,87,94]):[8,24,40,60,76,92]);
    activeGroups.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(xs[k]+(g.length===1?0:(j-(g.length-1)/2)*.7),y)));
    if(fire){
      purple.forEach((i,k)=>t[i]=pt(50,y-(k?8:11)));
      if(effective)activeGroups.forEach((g,k)=>g.forEach((i,j)=>t[i]=k===1?pt(50,y+8-j*4):pt(k===0?34+j*4:66-j*4,y-8)));
      else activeGroups.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(k===0?40-j*4:60+j*4,y)));
    }
    // Keep purple circles clear of every non-purple damage group, including spread slots.
    if(!fire)purple.forEach((i,k)=>t[i]=pt(!inverse&&n===1?(left?46:54):50,y+(k?7:-7)));
    s.push(base(`na-${n}`,`${inverse?'逆轉判讀・':''}${fire?'火冰':'分散／分攤'} ${n%2+1}`,'紫圈隔離。觀察頭上原始效果與逆轉狀態，再選擇正確人數與安全區。',t,{duration:10,hazards:hazard,stacks:activeGroups.filter(g=>g.length>1).map(g=>({player:g[0],count:g.length,r:fire&&!effective?9:5})),spreads:!fire&&!effective?others.map(player=>({player,r:3})):[],isolation:purple.map(player=>({player,others,r:4})),zones:purple.map(player=>({players:[player],...t[player],r:4})),labels:ROLES.map((_,i)=>purple.includes(i)?`紫圈${rev[purple.indexOf(i)]?'・逆轉':''}`:fire?(effective?'二人火':'三人冰'):effective?'六人分攤':'分散'),display:`紫圈 ${which+1} 圖示：${fire?(raw?'火（三組二人）':'冰（兩組三人）'):(raw?'集合':'分散')}${rev[which]?' ／ 帶有逆轉狀態':''}`,purple,fireOrigin:fire?t[purple[1]]:null,elemental:fire?effective?'fire':'ice':null,activeGroups}));
  }s.push(tank('na-tank'));return s;
}
function desolation(rng){const left=shuffle([0,1,2,3],rng),right=shuffle([4,5,6,7],rng),s=[],waiting=ROLES.map((_,i)=>pt(i<4?8:92,12+(i%4)*24));s.push(dispersed('desolation-order','四輪點名・分散等待','坦補在左，DPS 在右。記下自己的序號；未輪到時保持散開。',waiting,{labels:ROLES.map((_,i)=>`第 ${(i<4?left:right).indexOf(i)+1} 組`)}));
  for(let n=0;n<4;n++){const active=[left[n],right[n]],y=[14,38,62,38][n];const drop=clone(waiting);active.forEach((i,k)=>drop[i]=pt(k?79:21,y));s.push(base(`drop-${n}`,`第 ${n+1} 組・放下地火`,'輪到的人先在塔外停留，地火鎖定後再進塔。',drop,{zones:active.map(player=>({players:[player],...drop[player],r:4})),labels:ROLES.map((_,i)=>active.includes(i)?'地火鎖定':'等待'),duration:5}));const t=clone(waiting);active.forEach((i,k)=>t[i]=pt(k?65:35,y));s.push(base(`tower-${n}`,`第 ${n+1} 組・離開火圈並踩塔`,'地火已固定在剛才的位置。進入自己一側的塔，其他人不可搶塔。',t,{hazards:active.map(i=>circle(drop[i].x,drop[i].y,9)),towers:active.map((player,k)=>({...t[player],r:6,players:[player],label:String(n+1)})),labels:ROLES.map((_,i)=>active.includes(i)?'踩塔':'等待')}));}return s;
}
function hc2(rng){const codes=shuffle(['sA','sB','sC','lA','lB','lC','none','none'],rng),idx=c=>codes.indexOf(c),empty=codes.map((c,i)=>c==='none'?i:-1).filter(i=>i>=0),long=shuffle([idx('lA'),idx('lB'),idx('lC')],rng),corner={A:pt(10,10),B:pt(10,90),C:pt(90,90)};
  const element=rng()<.5?'water':'lightning',types=element==='water'?['A','C']:['B','C'],first=types.map(t=>idx('s'+t)),unused=idx('s'+(element==='water'?'B':'A'));
  const labels=codes.map(c=>c==='none'?'無狀態':`${c[0]==='s'?'短':'長'} ${c[1].replace('A','α').replace('B','β').replace('C','γ')}`);labels[long[0]]+='・二人';labels[long[1]]+='・單人';
  const initial=codes.map((c,i)=>c[0]==='s'?{...corner[c[1]]}:c==='none'?pt(20+empty.indexOf(i)*3,10):i===long[1]?pt(85,25):pt(55,55));
  const s=[base('hc2-explode','短概念・複製 α','無狀態兩人接短 α。長概念二人分攤與未帶分攤長概念集合；單人分攤獨立。',initial,{labels,spreads:[{player:idx('sB'),r:9},{player:idx('sC'),r:9}],stacks:[{player:long[0],count:2,r:7},{player:long[1],count:1,r:7}],zones:codes.map((c,i)=>c[0]==='s'||c==='none'?{players:[i],...initial[i],r:5}:null).filter(Boolean)})];
  const firePair=empty,fusionTargets=ROLES.map((_,i)=>pt(7,12+i*11));first.forEach((i,k)=>fusionTargets[i]=pt(49+k*2,35));firePair.forEach((i,k)=>fusionTargets[i]=pt(49+k*2,70));
  s.push(base('hc2-fuse','第一輪・火與屬性合成',`兩個短概念合成${element==='water'?'水':'雷'}；複製 α 的兩人合成火。靠近搭檔持續兩秒。`,fusionTargets,{fusion:[first,firePair],fusionEligible:[...first,...firePair,unused],labels:ROLES.map((_,i)=>first.includes(i)?element==='water'?'水合成':'雷合成':firePair.includes(i)?'α + α → 火':labels[i]),duration:10}));
  const safe=rng()<.5?46:54,t=ROLES.map((_,i)=>pt(safe<50?10:90,10+i*11));first.forEach((i,k)=>t[i]=pt(safe,k?74:26));
  s.push(base('hc2-towers1','兩塔・火概念分開待機','屬性合成者踩兩塔；火概念與其他人保持分開，全部躲到安全半場。',t,{hazards:[rect(safe<50?50:0,0,50,100)],towers:first.map((i,k)=>({...t[i],r:7,players:[i],label:element==='water'?'水':'雷'})),labels:ROLES.map((_,i)=>first.includes(i)?'踩塔':firePair.includes(i)?'火':'等待')}));
  const late=clone(t);['A','B','C'].forEach(c=>late[idx('l'+c)]={...corner[c]});const others=ROLES.map((_,i)=>i).filter(i=>codes[i][0]!=='l');others.forEach((i,k)=>late[i]=pt(66+(k%3)*10,8+Math.floor(k/3)*12));
  s.push(base('hc2-long','長概念・三角爆發','長 α／β／γ 回到各自角落引爆，其他五人往右上保持間隔。',late,{zones:['A','B','C'].map(c=>({players:[idx('l'+c)],...corner[c],r:5})),spreads:['A','B','C'].map(c=>({player:idx('l'+c),r:18})),labels:codes.map((c,i)=>c[0]==='l'?labels[i]:firePair.includes(i)?'火':'等待')}));
  const wind=[idx('lA'),idx('lB')],other=[idx('lC'),unused],f=ROLES.map((_,i)=>({...late[i]}));wind.forEach((i,k)=>f[i]=pt(69+k*2,50));other.forEach((i,k)=>f[i]=pt(29+k*2,50));const tether=[...first,...firePair],edges=[pt(50,6),pt(50,94),pt(6,50),pt(94,50)];tether.forEach((i,k)=>f[i]={...edges[k]});
  s.push(base('hc2-fuse2','第二輪・風合成與分身牽線','長 α + β 在東側合成風，西側合成水或雷。第一輪的四人到四邊取得牽線。',f,{fusion:[wind,other],labels:ROLES.map((_,i)=>wind.includes(i)?'α + β → 風':other.includes(i)?element==='water'?'雷':'水':'牽線到邊緣'),zones:tether.map((i,k)=>({players:[i],...edges[k],r:5})),duration:10}));
  const final=clone(f),towers=[pt(63,37),pt(63,63),pt(37,37),pt(37,63)];[...wind,...other].forEach((i,k)=>final[i]={...towers[k]});const bait=[pt(16,6),pt(84,94),pt(6,84),pt(94,16)];tether.forEach((i,k)=>final[i]={...bait[k]});
  s.push(base('hc2-towers2','四塔・把分身直線帶離中央','合成者各踩一塔；牽線者轉到外側，把分身直線留在外圍。',final,{towers:[...wind,...other].map((player,k)=>({...towers[k],r:6,players:[player],label:k<2?'風':element==='water'?'雷':'水'})),zones:tether.map((i,k)=>({players:[i],...bait[k],r:5})),hazards:[rect(0,0,100,10),rect(0,90,100,10),rect(0,10,10,80),rect(90,10,10,80)],hazardImmune:tether,labels:ROLES.map((_,i)=>wind.includes(i)?'風塔':other.includes(i)?'屬性塔':'外側牽線')}));
  const phoenix=[...firePair.map((i,k)=>[i,wind[k]])],p=ROLES.map((_,i)=>pt(14+(i%4)*24,18+Math.floor(i/4)*64));phoenix.forEach((g,k)=>g.forEach((i,j)=>p[i]=pt(49+j*2,k?68:32)));
  s.push(base('hc2-phoenix','火 + 風・不死鳥合成','北組火 + 風、南組火 + 風，持續靠近兩秒。其他人不要誤合成。實戰須補滿血。',p,{fusion:phoenix,labels:ROLES.map((_,i)=>firePair.includes(i)?'火 → 不死鳥':wind.includes(i)?'風 → 不死鳥':'保持分離'),duration:10}));
  s.push(party('ego','不死鳥・跨越自我消亡','已完成不死鳥合成。回到中央，進入永燃階段。傷害與補血不在此模擬範圍。'));return s;
}
function dominion(rng){const hit=[...shuffle([0,1,2,3],rng).slice(0,2),...shuffle([4,5,6,7],rng).slice(0,2)],first=ROLES.map((_,i)=>i).filter(i=>!hit.includes(i)),s=[dispersed('dom-spread','支配者・辨認土耐性降低','八人散開；帶有土耐性降低者等待第二輪塔。',spread,{labels:ROLES.map((_,i)=>hit.includes(i)?'土耐降低・二塔':'無狀態・一塔')})];
  const locations=[pt(25,25),pt(75,25),pt(25,75),pt(75,75)];[first,hit].forEach((g,n)=>{const t=ROLES.map((_,i)=>pt(40+(i%4)*6,45+Math.floor(i/4)*10));g.forEach((i,k)=>t[i]={...locations[k]});s.push(base(`dom-tower-${n}`,`第 ${n+1} 輪・四人踩塔`,'依頭上狀態輪流踩四塔，每座只需要一人。',t,{towers:g.map((player,k)=>({...locations[k],r:7,players:[player],label:String(n+1)})),labels:ROLES.map((_,i)=>g.includes(i)?'本輪踩塔':'中央等待')}));});return s;
}
export function createRaidRun({role='D1',branch='snake',seed=Date.now()}={}){
  if(!ROLES.includes(role))throw new RangeError('Unknown role');const rng=seededRandom(seed),hc=createEncounter({role,rng}),stored=rng()<.5;
  const chapters=chapterOrder(branch).map(c=>({...c,scenes:[]}));
  for(const c of chapters){switch(c.id){
    case 'opening':c.scenes=[party('genesis','創世之火・全屏攻擊','雙坦在北側，其餘人在中央集合。實戰需要減傷。'),base('memory','預存概念',`記住：本局是${stored?'四組二人分攤':'八人分散'}。這個概念稍後才會結算。`,spread,{duration:4,labels:ROLES.map(()=>stored?'預存・二人':'預存・分散')}),torches(rng),sun(rng,'opening-sun',stored),tank()];break;
    case 'snake1':c.scenes=snakes(rng);break;case 'snake2':c.scenes=snakes(rng,true);break;
    case 'beast1':c.scenes=beasts(rng);break;case 'beast2':c.scenes=beasts(rng,true);break;
    case 'manifold':{const near=rng()<.5;const t=ROLES.map((_,i)=>{const a=i*Math.PI/4,r=(i<4)===near?14:34;return pt(50+Math.cos(a)*r,50+Math.sin(a)*r);});c.scenes=[sun(rng,'illusion'),dispersed('manifold-bait','近距離四人誘導・交換遠近','沒有中第一輪火的四人靠近王，引導四條放射。另一組保持在外側。',t,{nearest:{origin:pt(50,50),players:near?[0,1,2,3]:[4,5,6,7]},labels:ROLES.map((_,i)=>(i<4)===near?'近距離誘導':'外側等待')}),sun(rng,'manifold-sun'),torches(rng,'manifold-torch',true),party('manifold-heal','創世之火','安全格集合。')];break;}
    case 'fourfold':{c.scenes=[base('four-memory','記住預存概念',`本局預存：${stored?'二人分攤':'八人分散'}。先處理三輪地火，最後再用到。`,spread,{labels:ROLES.map(()=>stored?'預存・二人':'預存・分散')})];for(let n=0;n<3;n++){const north=(rng()<.5),y=north?80:20;c.scenes.push(base(`vent-${n}`,`地火 ${n+1}・追蹤火蛇落點`,'冒泡火池與火蛇落點所在半場危險，換到另一邊。第二輪同時處理即時分散。',ROLES.map((_,i)=>pt(10+(i%4)*26,y+Math.floor(i/4)*10-5)),{hazards:[rect(0,north?0:50,100,50)],spreads:n===1?ROLES.map((_,player)=>({player,r:5})):[],duration:8}));}c.scenes.push(sun(rng,'fourfold-sun',stored),tank('four-tank'));break;}
    case 'door':c.scenes=[party('transition','前半結束・轉場','前半走位演練完成。下一步進入後半，自然支配與概念支配各有兩次。')];break;
    case 'na1':c.scenes=[party('aioniopyr','創世之炎與雙坦普攻','雙坦靠近北側共同接普攻，其他人在中央。'),tank('p2-tank'),...natural(rng)];break;
    case 'na2':c.scenes=natural(rng,true);break;
    case 'hc1':c.scenes=[0,1,3,4].map(n=>base(`hc1-${n}`,['短概念爆發','第一輪合成與兩塔','','長概念爆發與複製','第二輪合成與四塔'][n],'沿用菓子站位：看狀態圖標、合成元素與本步個人任務。',checkpointPositions(hc,n),{hcStep:n,duration:[8,12,0,6,12][n]}));break;
    case 'desolation':c.scenes=desolation(rng);break;case 'hc2':c.scenes=hc2(rng);break;
    case 'dominion1':case 'dominion2':c.scenes=dominion(rng);break;
    case 'finale':c.scenes=[party('final-raidwide','永燃・最後全屏攻擊','完成最後集合。實戰需要在自我消亡狂暴前擊倒王。'),base('complete','全副本走位演練完成','你已走過 P8S 前後半的主要機制。回到副本入口查看本機紀錄，或切換角色再練。',spread,{duration:3})];break;
  }c.scenes.forEach((s,i)=>{s.chapter=c.id;s.index=i;});}
  return {role,me:ROLES.indexOf(role),branch,seed,chapters,hc};
}
export function plans(run,scene,holds=[]){if(scene.hcStep!==undefined)return ROLES.map((_,i)=>livePlan(run.hc,scene.hcStep,i,holds));return scene.targets.map((target,i)=>({target,action:scene.labels[i]||scene.name}));}
export function sceneLabels(run,scene,holds=[]){if(scene.hcStep!==undefined)return ROLES.map((_,i)=>liveConcept(run.hc,scene.hcStep,i,holds).text);return scene.labels;}
export function fusionPairsFor(run,scene){return scene.hcStep===1?[run.hc.firstPair]:scene.hcStep===4?run.hc.secondPairs:scene.fusion||[];}
export function tickHolds(run,scene,positions,holds,dt){if(scene.hcStep!==undefined)return tickFusion(run.hc,scene.hcStep,positions,holds,dt);return (scene.fusion||[]).map(([a,b],i)=>holds[i]>=2?2:distance(positions[a],positions[b])<=6?Math.min(2,(holds[i]||0)+dt):0);}
export function tickAccidentalFusion(run,scene,positions,holds,previous={},dt=0){
  const pairs=fusionPairsFor(run,scene),timers={},issues=[];if(!pairs.length)return {timers,issues};
  const eligible=scene.hcStep!==undefined?ROLES.map((_,i)=>i).filter(i=>['concept','animal'].includes(liveConcept(run.hc,scene.hcStep,i,holds).kind)):scene.fusionEligible||ROLES.map((_,i)=>i);
  for(const i of eligible)for(const j of eligible){if(j<=i||pairs.some(p=>p.includes(i)&&p.includes(j)))continue;
    const key=`${i}:${j}`,amount=distance(positions[i],positions[j])<=6?(previous[key]||0)+dt:0;timers[key]=amount;
    if(amount>=2){issues.push({player:i,message:`與非搭檔 ${ROLES[j]} 持續接觸兩秒，發生錯誤合成。`});issues.push({player:j,message:`與非搭檔 ${ROLES[i]} 持續接觸兩秒，發生錯誤合成。`});}
  }return {timers,issues};
}
export function suggestedFacing(scene,player,p){const rule=scene.facing.find(r=>r.player===player);if(!rule)return -Math.PI/2;if(rule.toward)return angleTo(p,rule.toward);let best=0,score=-1;for(let a=0;a<Math.PI*2;a+=Math.PI/32){const min=Math.min(...rule.away.map(q=>angleDelta(a,angleTo(p,q))));if(min>score){best=a;score=min;}}return best;}
export function validateScene(run,scene,positions,facings=[],holds=[]){
  if(scene.hcStep!==undefined)return validateRound(run.hc,scene.hcStep,positions,holds);
  const issues=[],add=(player,message)=>issues.push({player,message});
  positions.forEach((p,i)=>{const landing=scene.knockback?knockback(p,scene.knockback.origin,scene.knockback.amount):p;if(landing.x<2||landing.x>98||landing.y<2||landing.y>98)add(i,'落點碰到場地火牆。靠近擊退來源，保留落點空間。');if(!scene.hazardImmune?.includes(i)&&scene.hazards.some(h=>inside(p,h)||inside(landing,h)))add(i,'站在危險範圍內；先確認安全半場或安全格。');});
  for(const {player,r} of scene.spreads)for(let j=0;j<8;j++)if(j!==player&&distance(positions[player],positions[j])<r)add(player,`範圍與 ${ROLES[j]} 重疊，請拉開距離。`);
  for(const {player,r,count,players} of scene.stacks){const nearby=positions.map((p,i)=>distance(p,positions[player])<=r?i:-1).filter(i=>i>=0);if(nearby.length!==count)add(player,`分攤需要 ${count} 人，目前 ${nearby.length} 人。`);else if(players?.some(i=>!nearby.includes(i)))add(player,'分攤人數正確，但搭檔不符合本輪分工。');}
  for(const tower of scene.towers){const occupants=positions.map((p,i)=>distance(p,tower)<=tower.r?i:-1).filter(i=>i>=0),count=tower.count??1;if(occupants.length!==count||occupants.some(i=>!tower.players.includes(i))){const player=tower.players.includes(run.me)?run.me:tower.players[0];add(player,`第 ${tower.label} 塔需要指定的 ${tower.players.map(i=>ROLES[i]).join('/')} ${count===1?'單獨踩塔':`共 ${count} 人踩塔`}。`);}}
  for(const z of scene.zones||[])for(const i of z.players)if(distance(positions[i],z)>z.r)add(i,'沒有站在本輪需要的位置，請依狀態前往目標區域。');
  for(const b of scene.isolation||[])for(const i of b.others)if(distance(positions[b.player],positions[i])<b.r)add(i,'靠近了紫圈玩家，會引發全隊失敗。');
  for(const rule of scene.facing){const a=facings[rule.player]??-Math.PI/2,p=positions[rule.player];if(rule.toward&&angleDelta(a,angleTo(p,rule.toward))>Math.PI/5)add(rule.player,'眼睛沒有面向指定蛇；先轉向再結算。');if(rule.away?.some(q=>angleDelta(a,angleTo(p,q))<Math.PI/2))add(rule.player,'面向正在讀條的蛇眼，會被石化。');}
  if(scene.bait){const b=scene.bait;const active=Math.min(...b.players.map(i=>distance(positions[i],b.origin))),other=Math.max(...positions.filter((_,i)=>!b.players.includes(i)).map(p=>distance(p,b.origin)));if(active<=other+2)for(const i of b.players)add(i,'本輪引導組必須比其他人離王更遠。');}
  if(scene.nearest){const b=scene.nearest;const active=Math.max(...b.players.map(i=>distance(positions[i],b.origin))),other=Math.min(...positions.filter((_,i)=>!b.players.includes(i)).map(p=>distance(p,b.origin)));if(active>=other)for(const i of b.players)add(i,'本輪四人必須比外側組更靠近王。');}
  if(scene.elemental){const origin=positions[scene.purple[1]],rank=positions.map((p,i)=>({i,d:distance(p,origin)})).filter(a=>!scene.purple.includes(a.i)).sort((a,b)=>a.d-b.d);const baiters=scene.elemental==='fire'?rank.slice(-3):rank.slice(0,2);const hitGroups=new Set(baiters.map(b=>scene.activeGroups.findIndex(g=>g.includes(b.i))));if(hitGroups.size!==scene.activeGroups.length)for(const b of baiters)add(b.i,'火需由最遠三組、冰需由最近兩組各一人引導。請調整組內遠近。');}
  (scene.fusion||[]).forEach((pair,k)=>{if(!(holds[k]>=2))pair.forEach(i=>add(i,'尚未與正確搭檔持續靠近兩秒完成合成。'));});
  return issues.concat(validateTopRules(scene,positions,facings),validateM5sRules(scene,positions));
}
