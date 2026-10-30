import {ROLES,shuffle} from './engine.mjs';
import {seededRandom} from './raid-engine.mjs';
import {M5S_CHAPTERS,M5S_WAYMARKS} from './m5s-data.mjs';
const all=ROLES.map((_,i)=>i),th=[0,1,2,3],dps=[4,5,6,7],center={x:50,y:50};
const pt=(x,y)=>({x,y}),polar=(r,a)=>pt(50+Math.cos(a)*r,50+Math.sin(a)*r);
const rect=(x,y,w,h)=>({kind:'rect',x,y,w,h}),circle=r=>({kind:'circle',...center,r});
const donut=()=>({kind:'annulus',...center,inner:12.5,r:150});
const cone=(angle,width=Math.PI/4)=>({kind:'cone',...center,angle,width,r:150});
const angles=[-112.5,-67.5,-157.5,-22.5,112.5,67.5,157.5,22.5].map(a=>a*Math.PI/180);
const ring=r=>angles.map(a=>polar(r,a));
const pairs=[[0,6],[1,7],[2,4],[3,5]],groups=[[0,2,4,6],[1,3,5,7]];
const idle=()=>all.map(i=>pt(43+i%4*4,45+Math.floor(i/4)*10));
const spreadRules=(players=all,r=12.5)=>players.map(player=>({player,r}));
function scene(id,name,body,targets,extra={}){return {id,name,body,targets:targets.map(p=>({...p})),duration:7,labels:all.map(()=>name),hazards:[],stacks:[],spreads:[],towers:[],facing:[],roles:ROLES,waymarks:M5S_WAYMARKS,...extra};}
function half(direction){return {W:rect(0,0,50,100),E:rect(50,0,50,100),N:rect(0,0,100,50),S:rect(0,50,100,50)}[direction];}
const directionName={W:'西',E:'東',N:'北',S:'南'};
function halfTargets(direction){return idle().map(p=>pt(direction==='W'?p.x+18:direction==='E'?p.x-18:p.x,direction==='N'?p.y+18:direction==='S'?p.y-18:p.y));}
function tank(){const t=idle();t[0]=pt(30,22);t[1]=pt(70,22);all.slice(2).forEach((i,k)=>t[i]=pt(39+k%3*11,70+Math.floor(k/3)*10));return scene('tank','經典銘心・雙坦分開','雙坦站王前左右，其他六人站背後；觀察扇形，不要進入坦克射線。',t,{roleCones:[0,1].map(player=>({player,origin:center,width:Math.PI/4})),zones:[0,1].map(i=>({...t[i],players:[i],r:5})),spreads:spreadRules([0,1],14)});}
function stored(rng,id,options={}){const side=options.side??(rng()<.5?'A':'B'),count=options.count??(2+Math.floor(rng()*3)),first=rng()<.5?'W':'E',other=first==='W'?'E':'W',s=[];
  s.push(scene(`${id}-read`,`放入 ${side} 面・記憶 ${count} 連指向`,`先記住 ${side} 面：${side==='A'?'扇形分散':'四人分攤'}。青蛙先打${directionName[first]}側 ${count} 次，再打另一側一次。`,idle(),{duration:5,record:side,sequence:[...Array(count).fill(first),other],sequenceIndex:-1}));
  for(let n=0;n<=count;n++){const direction=n<count?first:other;s.push(scene(`${id}-cut-${n}`,`${count} 連指向 ${n+1}／${count+1}・${directionName[direction]}刀`,n<count?'同側尚未打完，維持安全側。':'現在才換邊；接下來處理之前預存的 A／B 面。',halfTargets(direction),{hazards:[half(direction)],record:side,sequence:[...Array(count).fill(first),other],sequenceIndex:n,duration:5}));}
  let t=ring(32);if(side==='B'){t=idle();groups.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(47+j*2,k?76:24)));}
  const marked=side==='A'?[shuffle([0,1],rng)[0],shuffle([2,3],rng)[0],shuffle([4,5],rng)[0],shuffle([6,7],rng)[0]]:[];
  // A-side is an angular spread exercise, intentionally separate from the macro's unified formation.
  s.push(scene(`${id}-resolve`,`播放 ${side} 面・${side==='A'?'職能扇形':'四四分攤'}`,'處理延遲生效的唱片。這裡採分開的角度與人數專練站位。',t,{record:side,spreads:side==='A'?spreadRules(all,9):[],coneBaits:marked.map(player=>({player,origin:center,width:Math.PI/4})),stacks:side==='B'?groups.map(g=>({player:g[0],players:g,count:4,r:8})):[]}));
  // A-side targets are role-selected rather than nearest-selected.
  if(side==='A'){s.at(-1).roleCones=s.at(-1).coneBaits;s.at(-1).coneBaits=[];}
  return s;
}
function openingRecords(rng){const first=stored(rng,'record-1'),count=first[0].sequence.length-1,others=[2,3,4].filter(n=>n!==count);return [...first,...stored(rng,'record-2',{side:first[0].record==='A'?'B':'A',count:others[Math.floor(rng()*2)]})];}
function inout(rng,id,{floor=false,parity=0}={}){const outFirst=rng()<.5;return [0,1].map(n=>{const outside=n===0?outFirst:!outFirst,t=ring(outside?26:9.5),hazards=[outside?circle(17.5):donut()];if(floor){hazards.push(...checker(parity));t.forEach((p,i)=>t[i]=safeCell(p,parity,q=>outside?Math.hypot(q.x-50,q.y-50)>20:Math.hypot(q.x-50,q.y-50)<12));}return scene(`${id}-${n}`,`${outFirst?'內翻外轉':'外翻內轉'} ${n+1}・${outside?'遠離鋼鐵':'進入月環'}`,'先看當下的圓形或月環，再處理地板；不要提前切換內外。',t,{hazards,duration:6});});}
function checker(parity){const h=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++)if((x+y)%2===parity)h.push(rect(x*12.5,y*12.5,12.5,12.5));return h;}
function safeCell(p,parity,filter=()=>true){const candidates=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++){const q=pt(x*12.5+6.25,y*12.5+6.25);if((x+y)%2!==parity&&filter(q))candidates.push(q);}return candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];}
function floor1(rng){const parity=rng()<.5?0:1,shortTH=rng()<.5,s=[scene('floor-read','熱舞場地・辨認交替格','燈即將開始移動。坦克與近戰找內燈，治療與遠程找外燈；西 MT 組、東 ST 組。',ring(30).map(p=>safeCell(p,parity)),{hazards:checker(parity),labels:all.map(i=>`${(i<4)===shortTH?24:32} 秒邀請`),duration:5})];
  s.push(...inout(rng,'floor-io',{floor:true,parity}));
  const cells=[pt(43.75,parity?43.75:56.25),pt(56.25,parity?56.25:43.75),pt(18.75,parity?18.75:81.25),pt(81.25,parity?81.25:18.75)];
  for(let n=0;n<2;n++){const active=(n===0)===shortTH?th:dps,t=all.map((_,i)=>safeCell(pt(30+i%4*12,68),parity));active.forEach((i,k)=>t[i]={...cells[k]});s.push(scene(`floor-light-${n}`,`${n?32:24} 秒組・安全聚光燈`,'本輪到期的四人各佔一盞安全燈；另一組避開危險地板等下一輪。燈位為停止時的檢查點。',t,{hazards:checker(parity),labels:all.map(i=>active.includes(i)?`${n?32:24} 秒・進燈`:'下一輪／已完成・待機'),spotlights:active.map((player,k)=>({...cells[k],player,active,r:4})),zones:active.map(player=>({...t[player],players:[player],r:4}))}));}
  s.push(...stored(rng,'floor-record'));return s;
}
function feverOrder(rng){const a=shuffle(th,rng),b=shuffle(dps,rng),firstTH=rng()<.5;return all.map((_,i)=>(i%2===0)===firstTH?a[Math.floor(i/2)]:b[Math.floor(i/2)]);}
function fever(rng,id,order,withBombs,bombLabels){const s=[];for(let n=0;n<9;n++){const outside=n%2===0,t=ring(n===8?26:outside?26:9.5),hazards=n===8?[]:[outside?circle(17.5):donut()];if(n){const prev=order[n-1],a=angles[prev],toward=prev<4?-Math.PI/2:Math.PI/2,turn=Math.atan2(Math.sin(toward-a),Math.cos(toward-a));t[prev]=polar(n===8?26:outside?26:9.5,a+Math.sign(turn||1)*Math.PI/6);hazards.push(cone(a));}s.push(scene(`${id}-${n}`,n===8?'第九輪・只躲最後扇形':`第 ${n+1}／8 輪・${outside?'鋼鐵':'月環'}・點 ${ROLES[order[n]]}`,n===8?'沒有內外圈了，但最後一發扇形仍會在上一輪位置複讀。':'被點名者承接本輪扇形，上一輪被點者在自己的職能半場偏移，避開固定位置的複讀。',t,{hazards,roleCones:n<8?[{player:order[n],origin:center,width:Math.PI/4}]:[],labels:all.map(i=>`${n<8&&i===order[n]?'本輪點名':n&&i===order[n-1]?'閃複讀':'八方待機'}${withBombs?'・'+bombLabels[i]:''}`),duration:6}));}return s;}
function bombs(rng,assignment){const {pairs:bp,types,labels}=assignment,sequence=Array.from({length:8},()=>rng()<.5?'W':'E'),s=[];
  for(let n=0;n<8;n++){const direction=sequence[n],t=idle(),x=direction==='W'?54:46;bp.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(x+j*.8,18+k*21)));const active=n%2===1?bp[Math.floor(n/2)]:[];s.push(scene(`dance-${n}`,`放縱勁舞 ${n+1}／8・${directionName[direction]}刀${active.length?'＋αβ 到期':''}`,'依序躲半場刀。同倒數兩人站在同一排，靠近中線；每兩刀檢查一組 α／β。',t,{hazards:[half(direction)],labels:labels.map((label,i)=>`${label}・${active.includes(i)?'本輪配對':n<bp.findIndex(g=>g.includes(i))*2?'等待':'排隊'}`),sequence,sequenceIndex:n,bombs:active.length?[{players:active,types,r:5}]:[],duration:5}));}return s;
}
function waveHazards(start,final){const h=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++){const safe=y>=4&&final?[2,5]:start;if(!safe.includes(x)&&(final||y<4))h.push(rect(x*12.5,y*12.5,12.5,12.5));}return h;}
function waves(rng){const start=rng()<.5?[1,4]:[3,6],stackFirst=rng()<.5,s=[];for(let n=0;n<2;n++){const stack=n===0?stackFirst:!stackFirst,t=idle();
  if(stack)pairs.forEach((g,k)=>{const x=(k%2===0?start[0]:start[1])*12.5+6.25,y=k<2?25:75;g.forEach((i,j)=>t[i]=pt(n&&y>50?(k%2?68.75:31.25):x,y+j));});
  else [6,7,2,3,4,5,0,1].forEach((i,k)=>t[i]=pt((n&&k>=4?[2,5]:start)[k%2]*12.5+6.25,18.75+Math.floor(k/2)*21));
  s.push(scene(`waves-${n}`,`地火第 ${n+1} 輪・${stack?'4 拍分攤':'8 拍分散'}`,'讀取北側安全列，地火通過南半場後沿拐點調整；不要站進橘色爆炸格。',t,{hazards:waveHazards(start,!!n),stacks:stack?pairs.map(g=>({player:g[0],players:g,count:2,r:8})):[],spreads:stack?[]:spreadRules(),display:`初始第 ${start.map(x=>x+1).join('／')} 列安全；南側轉第 3／6 列。`}));}
  s.push(...inout(rng,'waves-io'),...stored(rng,'waves-record'),tank());return s;
}
function frogs(rng){const ac=rng()<.5,stack=rng()<.5,hazards=[rect(0,25,100,50),rect(0,0,25,25),rect(75,0,25,25),rect(0,75,25,25),rect(75,75,25,25)],t=idle();
  if(stack)pairs.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(k%2?63:37,k<2?13+j:86+j)));
  else groups.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(29+j*14,k?87:13)));
  if(!ac){t.forEach((p,i)=>t[i]=pt(p.y,p.x));hazards.forEach(h=>{[h.x,h.y]=[h.y,h.x];[h.w,h.h]=[h.h,h.w];});}
  return [scene('frog-lines',`青蛙劃線・${ac?'AC':'BD'} 外側安全＋${stack?'4':'8'} 拍`,'觀察青蛙相向或相背轉彎，找出最後的安全區，同時完成節奏。',t,{hazards,stacks:stack?pairs.map(g=>({player:g[0],players:g,count:2,r:8})):[],spreads:stack?[]:spreadRules()})];
}
function lights(rng){const shortTH=rng()<.5,start=rng()<.5?0:Math.PI/4,clockwise=rng()<.5?1:-1,s=[];for(let n=0;n<2;n++){const active=(n===0)===shortTH?dps:th,t=idle(),spotlights=[],coneBaits=[];
  pairs.forEach((g,k)=>{
    // Pair ordering: NW, NE, SW, SE.
    const angle=[-3,-1,3,1][k]*Math.PI/4+n*clockwise*Math.PI/4+start;
    const bait=g.find(i=>active.includes(i)),light=g.find(i=>i!==bait),origin=polar(16,angle);t[bait]=polar(25,angle);t[light]=polar(42,angle+clockwise*Math.PI/4);coneBaits.push({player:bait,origin,width:Math.PI/4});spotlights.push({...t[light],player:light,active:all.filter(i=>!active.includes(i)),r:4});
  });s.push(scene(`lights-${n}`,`第 ${n+1} 輪・${active===th?'坦補':active===dps?'DPS':active[0]<4?'坦補':'DPS'} 引導／另一組進燈`,'長倒數先引導、短倒數先找燈，下一輪互換。引導者比其他人靠近青蛙，扇形朝外避開燈內玩家。',t,{spotlights,coneBaits,labels:all.map(i=>active.includes(i)?'最近引導・朝外':`${n?20:10} 秒・聚光燈`),duration:8}));}s.push(...stored(rng,'lights-record'));return s;}
function remix(rng){const sequence=Array.from({length:8},()=>['N','E','S','W'][Math.floor(rng()*4)]);return sequence.map((d,n)=>scene(`remix-${n}`,`四向半場刀 ${n+1}／8・${directionName[d]}刀`,'觀察青蛙舉手方向，逐次移到對側；北刀向南、南刀向北、東西同理。',halfTargets(d),{hazards:[half(d)],sequence,sequenceIndex:n,duration:5}));}
function hustle(rng){const s=[];for(let n=0;n<2;n++){const east=rng()<.5,south=rng()<.5,t=idle().map(p=>pt(p.x+(east?25:-25),p.y+(south?25:-25)));s.push(scene(`hustle-${n}`,`第 ${n+1} 輪・雙青蛙左右刀`,'兩隻青蛙的半場刀同時結算，走進兩者共同的安全四分之一場。',t,{hazards:[half(east?'W':'E'),half(south?'N':'S')]}));}const d=rng()<.5?'W':'E';s.push(scene('boss-hustle','王的左右刀','青蛙兩輪結束後，再處理王面北的左右刀。',halfTargets(d),{hazards:[half(d)]}));return s;}
function bait(rng){const firstMiddle=rng()<.5,s=[];for(let n=0;n<2;n++){const middle=n===0?firstMiddle:!firstMiddle,active=n?dps:th,t=idle(),coneBaits=[];pairs.forEach((g,k)=>{const west=k%2===0,north=k<2,origin=pt(west?35:65,north?35:65),player=g.find(i=>active.includes(i)),other=g.find(i=>i!==player);t[player]=pt(west?25:75,north?31:69);t[other]=middle?pt(west?42:58,north?44:56):pt(west?18:82,north?45:55);coneBaits.push({origin,player,width:Math.PI/4});});
    const hazards=middle?[rect(0,0,100,25),rect(0,75,100,25)]:[rect(30,0,40,100)];s.push(scene(`bait-${n}`,`劃線第 ${n+1} 輪・${middle?'中間':'兩側'}安全・${n?'DPS':'坦補'}引導`,'本輪組靠近斜角青蛙，另一組躲開向外射出的扇形。下一輪必須換組。',t,{hazards,coneBaits,labels:all.map(i=>active.includes(i)?'本輪最近引導':'待機・避開射線'),duration:8}));}return s;}
function combo(rng){const a=[-5,-3,3,5][Math.floor(rng()*4)]*Math.PI/8,t=all.map(i=>polar(27+i*1.3,a+(i%2?.06:-.06)));return [scene('combined','王＋雙青蛙・八分之一安全區','同時避開三個半場，尋找靠近 A 或 C 側的狹窄交集。',t,{hazards:[cone(a-Math.PI/8-Math.PI/2,Math.PI),cone(a+Math.PI/8+Math.PI/2,Math.PI),half(Math.cos(a)>0?'W':'E')]}),tank()];}
function floor3(rng){const parity=rng()<.5?0:1,stackFirst=rng()<.5,s=[];for(let n=0;n<2;n++){const stack=n===0?stackFirst:!stackFirst,t=ring(34).map(p=>safeCell(p,parity));if(stack)pairs.forEach((g,k)=>{const q=safeCell(polar(30,[-3,-1,3,1][k]*Math.PI/4),parity);g.forEach((i,j)=>t[i]=pt(q.x+j*.5,q.y));});s.push(scene(`last-beats-${n}`,`交替地板・第 ${n+1} 次 ${stack?'4':'8'} 拍`,'只在安全格內分散或與固定搭檔分攤；這次沒有聚光燈。',t,{hazards:checker(parity),stacks:stack?pairs.map(g=>({player:g[0],players:g,count:2,r:8})):[],spreads:stack?[]:spreadRules()}));if(!n)s.push(...inout(rng,'last-io',{floor:true,parity:1-parity}));}return s;}
function finale(){return [scene('raidwide-1','歡慶時刻 I・集合','回中央準備全屏攻擊，實戰請依傷害時間軸安排減傷與補血。',idle()),scene('raidwide-2','歡慶時刻 II・再次集合','本工具只判定集合位置；全屏傷害不計算生命值。',idle()),scene('enrage','高能夜狂熱・教學終點','實戰約 10:07 狂暴結算。完成本步表示走完演練，輸出門檻仍需實戰驗證。',idle(),{duration:5,zones:[{...center,players:all,r:20}]})];}
export function createM5sRun({role='D1',branch='xivstrat',seed=Date.now()}={}){
  if(!ROLES.includes(role))throw new RangeError('Unknown role');seed=Number(seed)>>>0;const rng=seededRandom(seed),order=feverOrder(rng),a=order.filter((_,i)=>i%2===0),b=order.filter((_,i)=>i%2===1),types=all.map(i=>a.includes(i)?'α':'β');
  const pattern=rng()<.5?[2,0,1,3]:[3,1,0,2],otherPattern=pattern.map(n=>3-n),bp=Array.from({length:4},(_,n)=>[a[pattern.indexOf(n)],b[otherPattern.indexOf(n)]]),labels=all.map(i=>`${types[i]}・${8+bp.findIndex(g=>g.includes(i))*5} 秒`),assignment={pairs:bp,types,labels};
  const builders=[()=>[tank()],()=>openingRecords(rng),()=>floor1(rng),()=>fever(rng,'fever',order,true,labels),()=>bombs(rng,assignment),()=>waves(rng),()=>frogs(rng),()=>lights(rng),()=>fever(rng,'encore',feverOrder(rng),false,labels),()=>remix(rng),()=>hustle(rng),()=>bait(rng),()=>combo(rng),()=>floor3(rng),finale];
  return {raidId:'m5s',role,me:ROLES.indexOf(role),branch:'xivstrat',seed,assignment,chapters:M5S_CHAPTERS.map((c,k)=>({...c,scenes:builders[k]().map((s,i)=>({...s,chapter:c.id,index:i}))}))};
}
