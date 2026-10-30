const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const delta=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
export function monitorHits(beam,positions,facings){
  const origin=positions[beam.player],angle=(facings[beam.player]??-Math.PI/2)+beam.offset;
  return positions.map((p,i)=>({i,d:distance(origin,p),angle:Math.atan2(p.y-origin.y,p.x-origin.x)}))
    .filter(p=>p.i!==beam.player&&p.d>.01&&delta(p.angle,angle)<Math.PI/2-.001)
    .sort((a,b)=>a.d-b.d||a.i-b.i).slice(0,2).map(p=>p.i);
}
export function validateTopRules(scene,positions,facings=[]){
  const issues=[],add=(player,message)=>issues.push({player,message});
  if(scene.arena==='circle')positions.forEach((p,i)=>{let landing=p;if(scene.knockback){const o=scene.knockback.origin,d=distance(p,o);if(d)landing={x:p.x+(p.x-o.x)/d*scene.knockback.amount,y:p.y+(p.y-o.y)/d*scene.knockback.amount};}if(distance(landing,{x:50,y:50})>46)add(i,'落點超出圓形場地，會墜落。');});
  for(const link of scene.links||[]){const [a,b]=link.players,d=distance(positions[a],positions[b]);if(d<link.min||d>link.max)for(const i of link.players)add(i,`${link.label}：搭檔距離需在 ${link.min}–${link.max} 教學單位，目前 ${d.toFixed(1)}。`);}
  for(const rule of scene.rankRules||[]){const origin=Number.isInteger(rule.origin)?positions[rule.origin]:rule.origin;
    const ranked=positions.map((p,i)=>({i,d:distance(p,origin)})).filter(p=>!(rule.exclude||[]).includes(p.i)).sort((a,b)=>rule.far?b.d-a.d:a.d-b.d);
    const selected=ranked.slice(0,rule.players.length).map(p=>p.i);
    if(rule.players.some(i=>!selected.includes(i)))for(const i of rule.players)add(i,`${rule.label}：應由 ${rule.players.map(j=>scene.roles[j]).join('／')} 成為${rule.far?'最遠':'最近'}目標，請調整距離。`);
  }
  for(const beam of scene.monitors||[]){const hits=monitorHits(beam,positions,facings);if(hits.length!==2||beam.receivers.some(i=>!hits.includes(i)))add(beam.player,'小電視朝向或距離不正確，未命中指定兩名承接者。請確認左／右炮口與朝向。');}
  for(const rule of scene.facingAngles||[])if(delta(facings[rule.player]??-Math.PI/2,rule.angle)>.22)add(rule.player,'角色朝向錯誤。請依炮口方向調整 Q／E 或朝向按鈕。');
  return issues;
}
