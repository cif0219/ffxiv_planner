import test from 'node:test';
import assert from 'node:assert/strict';
import {createTopRun} from '../dist/top-engine.mjs';
import {TOP_CHAPTERS} from '../dist/top-data.mjs';
import {ROLES,validateScene,suggestedFacing,knockback,plans,distance} from '../dist/raid-engine.mjs';
const solution=s=>({p:s.targets.map(p=>({...p})),f:s.targets.map((p,i)=>suggestedFacing(s,i,p))});
test('TOP includes all six phases and reproducible valid solutions across both P1 variants',()=>{
  for(let seed=1;seed<=64;seed++)for(const branch of ['stack-first','fire-first']){
    const run=createTopRun({seed,branch});
    assert.deepEqual([...new Set(run.chapters.map(c=>c.phase))],[1,2,3,4,5,6]);
    assert.deepEqual(run.chapters.map(c=>c.id),TOP_CHAPTERS.map(c=>c.id));
    for(const c of run.chapters)for(const s of c.scenes){const {p,f}=solution(s);assert.equal(p.length,8);assert.deepEqual(validateScene(run,s,p,f),[],`${seed}/${branch}/${c.id}/${s.id}`);}
  }
  assert.deepEqual(createTopRun({seed:42}),createTopRun({seed:42}));
  assert.notDeepEqual(createTopRun({seed:42}),createTopRun({seed:43}));
  for(const role of ROLES)assert.equal(createTopRun({seed:1,role}).me,ROLES.indexOf(role));
  assert.throws(()=>createTopRun({role:'invalid'}),RangeError);
});
test('towers enforce order, ownership and multi-person occupancy',()=>{
  const run=createTopRun({seed:7}),s=run.chapters[0].scenes[1],{p,f}=solution(s),a=s.towers[0].players[0],b=s.towers[1].players[0];
  [p[a],p[b]]=[p[b],p[a]];assert.ok(validateScene(run,s,p,f).some(e=>e.message.includes('塔')));
  const towers=run.chapters.find(c=>c.id==='top-sigma').scenes[0],q=solution(towers),double=towers.towers.find(t=>t.count===2);
  q.p[double.players[1]]={x:50,y:50};assert.ok(validateScene(run,towers,q.p,q.f).some(e=>e.message.includes('共 2 人')));
});
test('glitches fail on incorrect partner distance even within a valid personal zone',()=>{
  const run=createTopRun({seed:8}),s=run.chapters.find(c=>c.id==='top-synergy').scenes[0],{p,f}=solution(s),[a,b]=s.links[0].players;
  p[a]={...p[b]};assert.ok(validateScene(run,s,p,f).some(e=>e.message.includes('故障')));
});
test('circular floor, monitor rotation and near/far ranks fail independently of personal checkpoints',()=>{
  const run=createTopRun({seed:8}),monitor=run.chapters.find(c=>c.id==='top-monitors').scenes[0],m=solution(monitor);
  const bare={...monitor,zones:[],facing:[],facingAngles:[]};m.f[monitor.monitors[0].player]+=Math.PI;
  assert.ok(validateScene(run,bare,m.p,m.f).some(e=>e.message.includes('小電視')));
  const world=run.chapters.find(c=>c.id==='top-delta').scenes.at(-1),w=solution(world),rule=world.rankRules[0],wrong=world.rankRules[1].players[0];
  w.p[wrong]={...w.p[rule.origin]};assert.ok(validateScene(run,{...world,zones:[]},w.p,w.f).some(e=>e.message.includes('最近')));
  const plain={...world,zones:[],rankRules:[]};w.p[0]={x:94,y:94};assert.ok(validateScene(run,plain,w.p,w.f).some(e=>e.message.includes('圓形場地')));
});
test('continuous demo reaches and resolves every TOP checkpoint before its deadline',()=>{
  for(let seed=1;seed<=8;seed++)for(const branch of ['stack-first','fire-first']){
    const run=createTopRun({seed,branch});let p=ROLES.map((_,i)=>({x:39+i%4*7,y:43+Math.floor(i/4)*9}));
    for(const c of run.chapters)for(const s of c.scenes){let f=[];
      for(let age=0;age<s.duration;age+=.05){p=p.map((pos,i)=>{const t=plans(run,s)[i].target,d=distance(pos,t),amount=27*.05;return d<=amount?{...t}:{x:pos.x+(t.x-pos.x)/d*amount,y:pos.y+(t.y-pos.y)/d*amount};});f=p.map((pos,i)=>suggestedFacing(s,i,pos));}
      assert.deepEqual(validateScene(run,s,p,f),[],`${seed}/${branch}/${c.id}/${s.id}`);
      if(s.knockback)p=p.map(pos=>knockback(pos,s.knockback.origin,s.knockback.amount));
    }
  }
});
