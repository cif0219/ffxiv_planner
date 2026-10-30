import {ROLES,shuffle} from './engine.mjs';
import {seededRandom} from './raid-engine.mjs';
import {TOP_CHAPTERS} from './top-data.mjs';
const pt=(x,y)=>({x,y}),center=pt(50,50),all=ROLES.map((_,i)=>i);
const circle=(x,y,r)=>({kind:'circle',x,y,r}),rect=(x,y,w,h)=>({kind:'rect',x,y,w,h});
const copy=t=>t.map(p=>({...p}));
const ring=(radius=32,rotation=0)=>all.map(i=>pt(50+Math.sin(i*Math.PI/4+rotation)*radius,50-Math.cos(i*Math.PI/4+rotation)*radius));
const idle=()=>all.map(i=>pt(41+i%4*6,46+Math.floor(i/4)*8));
function scene(id,name,body,targets,extra={}){return {id,name,body,targets:copy(targets),duration:8,labels:all.map(()=>name),hazards:[],stacks:[],spreads:[],towers:[],facing:[],arena:'circle',roles:ROLES,zones:targets.map((p,i)=>({...p,players:[i],r:5})),...extra};}
const numbered=rng=>{const order=shuffle(all,rng);return {order,number:all.map(i=>Math.floor(order.indexOf(i)/2)+1),pairs:Array.from({length:4},(_,i)=>order.slice(i*2,i*2+2))};};
const spreadRules=(players=all,r=7)=>players.map(player=>({player,r}));
function loop(rng){const a=numbered(rng),s=[];
  s.push(scene('read','循環程序・辨認號碼','先找到同號搭檔。接下來每輪兩人踩塔、另外兩人接線。',ring(25),{labels:a.number.map(n=>`${n} 號`),duration:5}));
  for(let n=0;n<4;n++){const tower=a.pairs[n],tether=a.pairs[(n+2)%4],t=idle(),rotation=Math.floor(rng()*4)*Math.PI/2;
    const turn=p=>pt(50+(p.x-50)*Math.cos(rotation)-(p.y-50)*Math.sin(rotation),50+(p.x-50)*Math.sin(rotation)+(p.y-50)*Math.cos(rotation));
    tower.forEach((i,k)=>t[i]=turn(pt(k?76:24,50)));tether.forEach((i,k)=>t[i]=turn(pt(50,k?88:12)));
    s.push(scene(`loop-${n}`,`第 ${n+1} 輪・${n+1} 號塔／${(n+2)%4+1} 號線`,'本輪號碼踩塔；隔兩號者接線到外側。待機者避開接線者的大圈。',t,{labels:a.number.map((num,i)=>`${num} 號・${tower.includes(i)?'踩塔':tether.includes(i)?'接線':'待機'}`),towers:tower.map((i,k)=>({...t[i],r:6,players:[i],label:`${n+1}-${k+1}`})),spreads:spreadRules(tether,15),tethers:tether.map(player=>({player,origin:center,color:'#be9fe1'}))}));
  }return s;
}
function panto(rng,variant){const a=numbered(rng),s=[];
  for(let n=0;n<4;n++){const missile=a.pairs[n],rest=all.filter(i=>!missile.includes(i)),angle=n*Math.PI/4*(variant==='fire-first'?-1:1),c=pt(50+Math.sin(angle)*25,50-Math.cos(angle)*25),t=idle();
    rest.forEach((i,k)=>t[i]=pt(c.x+(k%3-1)*1.5,c.y+Math.floor(k/3)*1.5));missile.forEach((i,k)=>{const a=angle+(k?1:-1)*Math.PI/2;t[i]=pt(50+Math.sin(a)*38,50-Math.cos(a)*38);});
    const old=n?pt(50+Math.sin(angle-(variant==='fire-first'?-1:1)*Math.PI/4)*25,50-Math.cos(angle-(variant==='fire-first'?-1:1)*Math.PI/4)*25):pt(50,50);
    s.push(scene(`missile-${n}`,`第 ${n+1} 輪・導彈與六人分攤`,`${variant==='fire-first'?'火追分攤':'分攤追火'}：本輪兩人向外放導彈，其餘六人離開上一輪火圈後集合。`,t,{labels:a.number.map((num,i)=>`${num} 號・${missile.includes(i)?'導彈散開':'六人分攤'}`),hazards:[circle(old.x,old.y,10)],spreads:spreadRules(missile,12),stacks:[{player:rest[0],players:rest,count:6,r:6}]}));
  }
  const t=ring(28);t[0]=pt(50,12);t[1]=pt(50,88);[1,2,3,5,6,7].forEach((slot,k)=>t[k+2]=ring(28)[slot]);
  s.push(scene('tank-bait','波動炮・雙坦外引','雙坦到南北外側引導，其餘六人維持分散，不要比坦克更遠。',t,{spreads:spreadRules(all,8),rankRules:[{origin:center,players:[0,1],far:true,label:'外側誘導'}]}));return s;
}
function synergy(rng){const a=numbered(rng),remote=rng()<.5,s=[],glyph=['○','×','△','□'],t=idle();
  a.pairs.forEach((pair,n)=>pair.forEach((i,k)=>t[i]=pt(k?(remote?81:65):(remote?19:35),23+n*18)));
  const labels=a.number.map(n=>`${glyph[n-1]}・${remote?'遠距離':'中距離'}`),links=a.pairs.map(players=>({players,min:remote?55:24,max:remote?75:40,label:remote?'遠距離故障':'中距離故障'}));
  s.push(scene('symbols','圖形配對・故障距離','同圖形為一組。左右列按 ○ × △ □ 排列；以搭檔距離判定故障。',t,{labels,links}));
  const safe=copy(t).map(p=>pt(p.x,p.y<50?30:70));a.pairs.forEach((pair,n)=>pair.forEach((i,k)=>safe[i].y=(n<2?24:66)+n%2*10));
  s.push(scene('clones','男女分身・避開中線','本題男分身中心大圈、女分身中線攻擊。分開走到上下安全列，同時維持圖形距離。',safe,{labels,links,hazards:[rect(0,41,100,18),circle(50,50,18)]}));
  const kb=t.map(p=>pt(50+(p.x-50)*.46,50+(p.y-50)*.46));
  s.push(scene('eye','光眼與擊退','離開光眼中線，靠近場中保留擊退空間。此步只判定擊退落點；距離故障留待下一步。',kb,{labels,knockback:{origin:center,amount:18},hazards:[rect(46,0,8,100)]}));
  const groups=[a.pairs.flatMap(p=>[p[0]]),a.pairs.flatMap(p=>[p[1]])],stack=idle();groups.forEach((g,k)=>g.forEach((i,j)=>stack[i]=pt(k?73:27,48+j)));
  s.push(scene('spotlight','聚光燈・左右四人分攤','左右兩列各自集合，兩個分攤不可重疊。',stack,{labels:all.map(i=>groups[0].includes(i)?'左組・四人':'右組・四人'),stacks:groups.map(g=>({player:g[0],players:g,count:4,r:7}))}));return s;
}
function limitless(rng){const s=[],t=all.map(i=>pt(44+i%3*5,16+Math.floor(i/3)*3));t[0]=pt(50,10);t[1]=pt(50,90);
  s.push(scene('arrows','天箭・人群 A 點／雙坦 A C 拉線','莫古力更新分工：人群在 A 點引導，MT 北側 A、ST 南側 C 拉線。接線為分工檢查點。',t,{labels:all.map(i=>i<2?`${i?'C':'A'} 點拉線`:'A 點誘導天箭'),tethers:[0,1].map(player=>({player,origin:pt(player?60:40,50),color:'#dba879'}))}));
  const dodge=all.map(i=>pt(i<2?(i?78:22):42+i%3*6,i<2?50:43+Math.floor(i/3)*7));
  s.push(scene('dodge','天箭鎖定・離開 A 點直線','天箭已固定，離開北側攻擊路徑，雙坦遠離人群接死刑。',dodge,{hazards:[rect(37,0,26,35)],spreads:spreadRules([0,1],12)}));
  const order=shuffle(all.filter(i=>i>=2),rng),meteors=order.slice(0,3),rest=all.filter(i=>!meteors.includes(i)),m=idle();meteors.forEach((i,k)=>m[i]=[pt(18,27),pt(82,27),pt(50,87)][k]);rest.forEach((i,k)=>m[i]=pt(45+k*2,50));
  s.push(scene('meteor','隕石散開・其餘人分攤','三名隕石點名到外圈，其餘五人集合承接分攤。',m,{labels:all.map(i=>meteors.includes(i)?'隕石・外側':'五人分攤'),spreads:spreadRules(meteors,20),stacks:[{player:rest[0],players:rest,count:5,r:9}]}));return s;
}
function transition(rng){const a=shuffle(all,rng),spread=a.slice(0,4),pairs=[a.slice(4,6),a.slice(6,8)],t=idle();spread.forEach((i,k)=>t[i]=ring(36)[k*2]);pairs.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(k?72:28,70+j*2)));
  return [scene('wave','波動・外圈待機','觀察中心波動，本輪先站外圈。',ring(34),{hazards:[circle(50,50,24)]}),scene('sniper','狙擊・四散開與兩組二人','四名分散者各自到外圈；兩組高出力狙擊由無點名者各補一人。',t,{labels:all.map(i=>spread.includes(i)?'狙擊散開':pairs.some(g=>g[0]===i)?'二人狙擊':'無點名・補分攤'),spreads:spreadRules(spread,14),stacks:pairs.map(g=>({player:g[0],players:g,count:2,r:6}))})];
}
function hello(rng){const a=shuffle(all,rng),s=[],places=[pt(20,30),pt(22,72),pt(80,30),pt(78,72),pt(38,28),pt(38,72),pt(62,28),pt(62,72)];
  for(let n=0;n<4;n++){const t=idle(),roles=all.map(()=>''),towers=[];a.forEach((player,k)=>{const slot=(k+n*2)%8;t[player]={...places[slot]};roles[player]=`${slot<4?slot<2?'紅毒':'藍毒':'接毒'}・${slot%2?'南':'北'}`;if(slot>=4)towers.push({...t[player],r:5,players:[player],label:slot<6?'紅':'藍',color:slot<6?'#eaa0a0':'#9cbde8'});});
    s.push(scene(`hello-${n}`,`你好世界 ${n+1}／4・站位檢查點`,'本題已給定毒與踩塔分工。紅藍毒留外側，接毒者進入同色塔。此處不模擬毒傳遞、免疫或斷線時機。',t,{labels:roles,towers,spreads:spreadRules(a.filter((_,k)=>(k+n*2)%8<4),10),display:'預設狀態檢查點・請配合原片學習完整傳毒順序'}));
  }return s;
}
function monitors(rng){const a=shuffle(all,rng),t=idle(),points=[pt(51,20),pt(50,50),pt(51,80),pt(25,17),pt(25,24),pt(75,45),pt(75,55),pt(25,80)];a.forEach((i,k)=>t[i]={...points[k]});
  const directions=[0,Math.PI,0].map((_,k)=>rng()<.5?1:-1),angles=[Math.PI,0,Math.PI],receivers=[[a[3],a[4]],[a[5],a[6]],[a[7],a[1]]];
  const beams=a.slice(0,3).map((player,k)=>({player,offset:directions[k]*Math.PI/2,receivers:receivers[k],angle:angles[k]}));
  const facingAngles=beams.map(b=>({player:b.player,angle:b.angle-b.offset}));
  return [scene('monitors','小電視・三炮口朝向','頭上的「左炮／右炮」相對角色朝向。把炮口指向自己的兩名承接者；每炮選取該半場最近兩人。此為炮口原理專練，非完整八人傷害分配。',t,{labels:all.map(i=>{const k=a.indexOf(i);return k<3?`${directions[k]>0?'右炮':'左炮'}・承接 ${receivers[k].map(j=>ROLES[j]).join('/')}`:'電視承接';}),monitors:beams,facingAngles,facing:facingAngles.map(r=>({player:r.player,toward:pt(t[r.player].x+Math.cos(r.angle)*20,t[r.player].y+Math.sin(r.angle)*20)})),duration:12})];
}
function blue(){const s=[];for(let n=0;n<3;n++){
  s.push(scene(`spread-${n}`,`波動炮 ${n+1}・八方分散`,'先散開誘導波動炮。預覽位置是本輪結算位置。',ring(n===1?34:25),{spreads:spreadRules(all,9),hazards:n===1?[circle(50,50,22)]:[]}));
  const groups=[[0,2,4,6],[1,3,5,7]],t=idle();groups.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(k?70:30,48+j)));
  s.push(scene(`stack-${n}`,`波動炮 ${n+1}・兩組四人`,'波動結束後到兩側分攤，兩組保持距離。',t,{stacks:groups.map(g=>({player:g[0],players:g,count:4,r:7}))}));
  }return s;
}
// World transfers are independent checkpoints. Two nearest/farthest receivers are
// ranked from the holder, without pretending to simulate sequential bounces.
function worlds(rng,id,round=0){const a=shuffle(all,rng),slots=[pt(24,50),pt(30,42),pt(30,58),pt(70,50),pt(19,25),pt(19,75),pt(55,21),pt(55,79)],t=idle();a.forEach((i,k)=>t[i]={...slots[k]});const near=a[0],far=a[3];
  return scene(`${id}-world-${round}`,`近遠世界 ${round+1}・距離分工檢查點`,'近世界接手者靠近近世界，遠世界接手者遠離遠世界。以本輪預設分工練距離；實戰兩次彈跳在此合併為距離排序，不模擬動力累計。',t,{labels:all.map(i=>{const k=a.indexOf(i);return k===0?'近世界':k===3?'遠世界':k<3?'近世界接手':k<6?'遠世界接手':'誘導／待機';}),rankRules:[{origin:near,players:a.slice(1,3),exclude:[near,far],label:'近世界接手'},{origin:far,players:a.slice(4,6),exclude:[near,far],far:true,label:'遠世界接手'}],tethers:[{player:near,origin:pt(18,50),color:'#b4dfba'},{player:far,origin:pt(82,50),color:'#b6b1ea'}],duration:10});
}
function delta(rng){const a=numbered(rng),t=idle();a.pairs.forEach((g,k)=>g.forEach((i,j)=>t[i]=pt(k%2?78:22,k<2?23+j*8:69+j*8)));
  return [scene('tethers','一運・藍綠線分區','先依題目給定的藍／綠線到四個分區。此步是分區檢查點，不含拳頭或完整斷線。',t,{labels:a.number.map(n=>`${n<3?'藍線':'綠線'}・第 ${n%2?1:2} 組`),links:a.pairs.map((players,k)=>({players,min:6,max:14,label:k<2?'藍線搭檔':'綠線搭檔'}))}),scene('eye','一運・光眼與半場','避開光眼中央直線，本題安全半場在西側。其餘複合攻擊拆為下一步。',all.map(i=>pt(22+(i%2)*10,22+Math.floor(i/2)*18)),{hazards:[rect(44,0,12,100),rect(56,0,44,100)]}),worlds(rng,'delta')];
}
function sigma(rng){const a=shuffle(all,rng),double=rng()<.5?2:3,count=8-double,locations=ring(32).filter((_,i)=>i<count),t=idle(),towers=[];let cursor=0;
  locations.forEach((p,k)=>{const members=a.slice(cursor,cursor+(k<double?2:1));cursor+=members.length;members.forEach((i,j)=>t[i]=pt(p.x+(j?1.5:0),p.y));towers.push({...p,r:5,players:members,count:members.length,label:`${members.length} 人`});});
  return [scene('sigma-towers',`二運・${count} 塔分工`,'此題已預分配塔位。雙人塔站兩人，單人塔站一人；不能替錯塔。五／六塔為獨立檢查點，未從圖形推導。',t,{labels:all.map(i=>`${towers.findIndex(z=>z.players.includes(i))+1} 號塔`),towers}),scene('sigma-laser','二運・旋轉雷射安全區','觀察雷射結算半場，移到安全側。本步使用靜態結算區。',all.map(i=>pt(60+(i%2)*10,24+Math.floor(i/2)*17)),{hazards:[rect(0,0,50,100)]}),worlds(rng,'sigma')];
}
function omega(rng){const s=[];for(let n=0;n<2;n++){const left=rng()<.5,t=all.map(i=>pt(left?20+(i%2)*6:74+(i%2)*6,27+Math.floor(i/2)*15));s.push(scene(`omega-dodge-${n}`,`三運・第 ${n+1} 輪男女分身`,'依本輪半場波動與中心範圍，移到安全半場。第二輪會重新分配。',t,{hazards:[rect(left?50:0,0,50,100),circle(50,50,22)],display:`本輪安全：${left?'西':'東'}側外圍`}));}s.push(worlds(rng,'omega',0),worlds(rng,'omega',1));return s;}
function arrow(){const s=[];for(let n=0;n<4;n++){const outside=n%2===0;s.push(scene(`arrow-${n}`,`宇宙天箭 ${n+1}・${outside?'外':'內'}側安全`,'觀察上一波結算後再進入原本的危險區。本教學把天箭拆為內外輪替。',ring(outside?35:16),{hazards:outside?[circle(50,50,26)]:[rect(0,0,100,25),rect(0,75,100,25),rect(0,25,25,50),rect(75,25,25,50)]}));}
  const t=idle();t[0]=pt(44,46);t[1]=pt(56,46);all.slice(2).forEach((i,k)=>t[i]=pt(47+k%3*2,78+Math.floor(k/3)*2));
  s.push(scene('dive','宇宙龍炎・雙坦近／六人遠','雙坦站最近，六人遠側集合。本步依實際距離選最近二人與最遠一人。',t,{stacks:[{player:2,players:all.slice(2),count:6,r:7}],spreads:spreadRules([0,1],9),rankRules:[{origin:center,players:[0,1],label:'宇宙龍炎近端'},{origin:center,players:[2,3,4,5,6,7],far:true,label:'宇宙龍炎遠端'}]}));return s;
}
function wave(){const s=[];for(let n=0;n<3;n++){const t=ring(32,n*Math.PI/12);s.push(scene(`puddle-${n}`,`地火 ${n+1}・離開上一組落點`,'八方散開並沿同一方向移動。地火在上一組位置結算，此處以三組代表連續六次地火。',t,{hazards:n?ring(32,(n-1)*Math.PI/12).map(p=>circle(p.x,p.y,6)):[],spreads:spreadRules(all,7)}));}s.push(scene('protean','波動炮・八方誘導','各自引導八方波動炮，不要與相鄰隊友重疊。',ring(32),{spreads:spreadRules(all,10)}));
  const t=all.map(i=>pt(50,i<2?62+i*6:75+(i-2)*1.5));s.push(scene('wild-charge','衝鋒分攤・坦克站前','以北側王為來源，雙坦站在分攤隊伍最前方。',t,{stacks:[{player:4,players:all,count:8,r:25}],rankRules:[{origin:pt(50,0),players:[0,1],label:'衝鋒分攤前排'}]}));return s;
}
function meteor(rng){const marked=shuffle(all,rng).slice(0,3),rest=all.filter(i=>!marked.includes(i)),t=idle();marked.forEach((i,k)=>t[i]=[pt(20,28),pt(80,28),pt(50,86)][k]);rest.forEach((i,k)=>t[i]=pt(45+k*2,50));
  return [scene('cosmo-meteor','宇宙隕石・點名離開人群','本題提供三名隕石點名分散、其餘五人集合的檢查點。未重現隕石整段的全部分攤與放置順序。',t,{labels:all.map(i=>marked.includes(i)?'隕石點名':'中央集合'),spreads:spreadRules(marked,18),stacks:[{player:rest[0],players:rest,count:5,r:9}]}),scene('magic','魔數・集合與 LB 流程提示','集合。實戰需坦克 LB3 承傷、治療 LB3 清除狀態，再處理第二次魔數。本工具不模擬 LB 或傷害；完成此步只代表教學結束。',idle(),{duration:5,display:'坦 LB3 → 魔數 → 治療 LB3；實戰須依隊伍時間軸施放'})];
}
export function createTopRun({role='D1',branch='stack-first',seed=Date.now()}={}){
  if(!ROLES.includes(role))throw new RangeError('Unknown role');seed=Number(seed)>>>0;const rng=seededRandom(seed);branch=branch==='fire-first'?'fire-first':'stack-first';
  const builders=[()=>loop(rng),()=>panto(rng,branch),()=>synergy(rng),()=>limitless(rng),()=>transition(rng),()=>hello(rng),()=>monitors(rng),blue,()=>delta(rng),()=>sigma(rng),()=>omega(rng),arrow,wave,()=>meteor(rng)];
  const chapters=TOP_CHAPTERS.map((c,k)=>({...c,scenes:builders[k]().map((s,i)=>({...s,chapter:c.id,index:i}))}));
  return {raidId:'top',role,me:ROLES.indexOf(role),branch,seed,chapters};
}
