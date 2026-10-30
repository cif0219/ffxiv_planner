import test from 'node:test';
import assert from 'node:assert/strict';
import {createM5sRun} from '../dist/m5s-engine.mjs';
import {M5S_CHAPTERS,M5S_WAYMARKS} from '../dist/m5s-data.mjs';
import {ROLES,validateScene,inside,plans,distance} from '../dist/raid-engine.mjs';
const copy=s=>s.targets.map(p=>({...p}));
test('M5S covers three phases and every seeded recommended solution satisfies the actual rules',()=>{
  const variants=new Set();
  for(let seed=0;seed<96;seed++){
    const run=createM5sRun({seed});assert.deepEqual(run.chapters.map(c=>c.id),M5S_CHAPTERS.map(c=>c.id));
    assert.deepEqual([...new Set(run.chapters.map(c=>c.phase))],[1,2,3]);
    const records=run.chapters[1].scenes.filter(s=>s.id.endsWith('read'));
    assert.notEqual(records[0].record,records[1].record);assert.notEqual(records[0].sequence.length,records[1].sequence.length);
    for(const c of run.chapters)for(const s of c.scenes){
      assert.equal(s.targets.length,8);assert.ok(s.targets.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
      assert.deepEqual(validateScene(run,s,copy(s)),[],`${seed}/${c.id}/${s.id}`);
      if(s.record)variants.add(s.record);
    }
    for(const id of ['m5s-fever1','m5s-fever2'])assert.equal(run.chapters.find(c=>c.id===id).scenes.length,9);
  }
  assert.deepEqual([...variants].sort(),['A','B']);
  assert.deepEqual(createM5sRun({seed:42}),createM5sRun({seed:42}));
  assert.notDeepEqual(createM5sRun({seed:42}).assignment,createM5sRun({seed:43}).assignment);
  for(const role of ROLES)assert.equal(createM5sRun({role}).me,ROLES.indexOf(role));
  assert.throws(()=>createM5sRun({role:'invalid'}),RangeError);
  assert.equal(M5S_WAYMARKS.length,8);
});
test('steel, donut, halfroom, checkerboard and replay cones reject danger independently of suggested zones',()=>{
  const run=createM5sRun({seed:8});
  const samples=[
    [run.chapters[1].scenes.find(s=>s.id==='record-1-cut-0'),{x:10,y:10}],
    [run.chapters[3].scenes[0],{x:50,y:50}],
    [run.chapters[3].scenes[1],{x:90,y:50}],
    [run.chapters[2].scenes[0],null],
  ];
  for(const [s,bad] of samples){const p=copy(s),h=s.hazards[0];p[4]=bad??{x:h.x+h.w/2,y:h.y+h.h/2};if(!inside(p[4],h))p[4]={x:h.x+h.w/2,y:h.y+h.h/2};assert.ok(validateScene(run,{...s,zones:[],roleCones:[]},p).some(e=>e.message.includes('危險範圍')));}
  const replay=run.chapters[3].scenes[1],p=copy(replay),h=replay.hazards.find(h=>h.kind==='cone');p[4]={x:50+Math.cos(h.angle)*9,y:50+Math.sin(h.angle)*9};
  assert.ok(validateScene(run,{...replay,zones:[],roleCones:[]},p).some(e=>e.message.includes('危險範圍')));
  assert.equal(inside({x:10,y:0},{kind:'cone',x:0,y:0,r:20,width:Math.PI/4,angle:0}),true);
  assert.equal(inside({x:-10,y:0},{kind:'cone',x:0,y:0,r:20,width:Math.PI/4,angle:0}),false);
});
test('audio bombs enforce the due pair, opposite colours and no third player',()=>{
  const run=createM5sRun({seed:4}),s=run.chapters[4].scenes.find(s=>s.bombs?.length),bomb=s.bombs[0],[a,b]=bomb.players,p=copy(s);
  p[b]={x:50,y:50};assert.ok(validateScene(run,s,p).some(e=>e.message.includes('α／β')));
  const q=copy(s),third=ROLES.findIndex((_,i)=>!bomb.players.includes(i));q[third]={...q[a]};assert.ok(validateScene(run,s,q).some(e=>e.message.includes('第三人')));
  const types=[...bomb.types];types[b]=types[a];assert.ok(validateScene(run,{...s,bombs:[{...bomb,types}]},copy(s)).some(e=>e.message.includes('異色')));
  assert.equal(run.chapters[4].scenes.filter(s=>s.bombs?.length).length,4);
});
test('spotlights enforce exclusive occupancy by the current duration group',()=>{
  const run=createM5sRun({seed:5}),s=run.chapters[2].scenes.find(s=>s.spotlights?.length),bare={...s,zones:[]},p=copy(s),[a,b]=s.spotlights;
  p[a.player]={...p[b.player]};assert.ok(validateScene(run,bare,p).some(e=>e.message.includes('獨佔')));
  const q=copy(s);q[a.player]={x:50,y:50};assert.ok(validateScene(run,bare,q).some(e=>e.message.includes('聚光燈')));
});
test('frog bait selects the nearest actual player and rejects cones crossing a standby player',()=>{
  const run=createM5sRun({seed:5}),s=run.chapters[11].scenes[0],bait=s.coneBaits[0],p=copy(s),wrong=4;
  p[wrong]={...bait.origin};assert.ok(validateScene(run,{...s,zones:[]},p).some(e=>e.message.includes('最近玩家')));
  const q=copy(s),a=Math.atan2(q[bait.player].y-bait.origin.y,q[bait.player].x-bait.origin.x);q[wrong]={x:bait.origin.x+Math.cos(a)*20,y:bait.origin.y+Math.sin(a)*20};
  assert.ok(validateScene(run,{...s,zones:[]},q).some(e=>e.message.includes('扇形命中')));
  assert.ok(run.chapters[11].scenes[1].coneBaits.every(b=>b.player>=4));
});
test('continuous demo can reach every M5S checkpoint within the teaching deadline for all roles',()=>{
  for(let seed=0;seed<16;seed++)for(const role of ROLES){const run=createM5sRun({seed,role});let p=ROLES.map((_,i)=>({x:39+i%4*7,y:43+Math.floor(i/4)*9}));
    for(const c of run.chapters)for(const s of c.scenes){for(let age=0;age<s.duration;age+=.1)p=p.map((pos,i)=>{const t=plans(run,s)[i].target,d=distance(pos,t),amount=2.7;return d<=amount?{...t}:{x:pos.x+(t.x-pos.x)/d*amount,y:pos.y+(t.y-pos.y)/d*amount};});assert.deepEqual(validateScene(run,s,p),[],`${seed}/${role}/${c.id}/${s.id}`);}
  }
});
