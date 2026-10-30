const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const delta=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
export function inCone(p,origin,angle,width=Math.PI/4,r=150){return distance(p,origin)<=r&&delta(Math.atan2(p.y-origin.y,p.x-origin.x),angle)<=width/2;}
export function validateM5sRules(scene,positions){
  const issues=[],add=(player,message)=>issues.push({player,message});
  for(const light of scene.spotlights||[]){
    const occupants=light.active.filter(i=>distance(positions[i],light)<=light.r);
    if(occupants.length!==1||!occupants.includes(light.player))add(light.player,'到期時必須獨佔自己的安全聚光燈；請確認輪次與燈位。');
  }
  for(const bomb of scene.bombs||[]){
    const [a,b]=bomb.players;
    const nearby=positions.map((p,i)=>distance(p,positions[a])<=bomb.r||distance(p,positions[b])<=bomb.r?i:-1).filter(i=>i>=0);
    if(distance(positions[a],positions[b])>bomb.r||nearby.length!==2||bomb.types[a]===bomb.types[b])for(const i of bomb.players)add(i,'α／β 配對失敗：同倒數異色兩人靠攏，且範圍內不可有第三人。');
  }
  for(const bait of scene.coneBaits||[]){
    const ranked=positions.map((p,i)=>({i,d:distance(p,bait.origin)})).sort((a,b)=>a.d-b.d||a.i-b.i);
    if(ranked[0].i!==bait.player)add(bait.player,'伴舞波動引導錯誤：本輪指定者必須是這隻青蛙的最近玩家。');
    const angle=Math.atan2(positions[bait.player].y-bait.origin.y,positions[bait.player].x-bait.origin.x);
    positions.forEach((p,i)=>{if(i!==bait.player&&inCone(p,bait.origin,angle,bait.width))add(i,'被伴舞波動扇形命中；引導者轉到外側，待機組避開射線。');});
  }
  for(const bait of scene.roleCones||[]){
    const angle=Math.atan2(positions[bait.player].y-bait.origin.y,positions[bait.player].x-bait.origin.x);
    positions.forEach((p,i)=>{if(i!==bait.player&&inCone(p,bait.origin,angle,bait.width))add(i,'與本輪職能扇形重疊，請維持八方角度並閃避複讀。');});
  }
  return issues;
}
