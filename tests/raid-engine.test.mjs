import test from 'node:test';
import assert from 'node:assert/strict';
import {createRaidRun,plans,validateScene,suggestedFacing,tickHolds,tickAccidentalFusion,fusionPairsFor,knockback,inside,ROLES} from '../dist/raid-engine.mjs';
import {chapterOrder} from '../dist/raids.mjs';

test('every recommended solution passes geometry and role rules for both branches and seeded assignments',()=>{
  const failures=[];
  for(const branch of ['snake','beast'])for(let seed=1;seed<=40;seed++){
    const run=createRaidRun({seed,branch});
    for(const c of run.chapters)for(const scene of c.scenes){
      assert.equal(scene.targets.length,8,`${c.id}/${scene.id} targets`);
      const holds=fusionPairsFor(run,scene).map(()=>2);
      const positions=plans(run,scene,holds).map(p=>({...p.target}));
      const facing=positions.map((p,i)=>suggestedFacing(scene,i,p));
      const issues=validateScene(run,scene,positions,facing,holds);
      if(issues.length&&failures.length<12)failures.push({seed,branch,chapter:c.id,scene:scene.id,issues});
    }
  }
  assert.deepEqual(failures,[]);
});
test('phase timeline branches retain human intermissions and repeat matching transformations',()=>{
  assert.deepEqual(chapterOrder('snake').slice(0,8).map(c=>c.id),['opening','snake1','manifold','beast1','fourfold','snake2','beast2','door']);
  assert.deepEqual(chapterOrder('beast').slice(0,8).map(c=>c.id),['opening','beast1','manifold','snake1','fourfold','beast2','snake2','door']);
  for(const branch of ['snake','beast'])for(const phase of [1,2]){
    const times=chapterOrder(branch).filter(c=>c.phase===phase).map(c=>c.time);
    assert.deepEqual(times,[...times].sort((a,b)=>a-b));
  }
});
test('failure rules detect missed towers, overlapping spreads, incorrect gaze and lethal knockbacks',()=>{
  const run=createRaidRun({seed:4});
  const tower=run.chapters.find(c=>c.id==='dominion1').scenes[1],p=tower.targets.map(v=>({...v}));
  p[tower.towers[0].players[0]]={x:50,y:50};assert.ok(validateScene(run,tower,p).some(i=>i.message.includes('塔')));
  const spread=run.chapters.find(c=>c.id==='beast1').scenes[1];assert.ok(validateScene(run,spread,ROLES.map(()=>({x:50,y:50}))).some(i=>i.message.includes('重疊')));
  const gaze=run.chapters.find(c=>c.id==='snake1').scenes[1],f=gaze.targets.map((p,i)=>suggestedFacing(gaze,i,p));
  f[0]+=Math.PI;assert.ok(validateScene(run,gaze,gaze.targets,f).some(i=>i.player===0&&i.message.includes('石化')));
  const kb=run.chapters.find(c=>c.id==='beast1').scenes[0],k=kb.targets.map(p=>({...p}));k[0]={x:95,y:50};assert.ok(validateScene(run,kb,k).some(i=>i.message.includes('火牆')));
  assert.ok(knockback(k[0],{x:50,y:50},24).x>100);
});
test('HC2 fusion requires proximity, resets interrupted holds and latches completed pairs',()=>{
  const run=createRaidRun({seed:5}),scene=run.chapters.find(c=>c.id==='hc2').scenes[1];
  const p=scene.targets.map(p=>({...p}));let holds=tickHolds(run,scene,p,[],1);
  assert.deepEqual(holds,[1,1]);const a=scene.fusion[0][0];p[a]={x:5,y:5};holds=tickHolds(run,scene,p,holds,.5);assert.equal(holds[0],0);
  assert.ok(validateScene(run,scene,p,[],holds).some(i=>i.message.includes('兩秒')));
  holds=[2,2];assert.deepEqual(tickHolds(run,scene,p,holds,1),holds);
});
test('seed reproduces assignments and every selectable role owns its own player index',()=>{
  assert.deepEqual(createRaidRun({seed:18}),createRaidRun({seed:18}));
  for(const role of ROLES)assert.equal(createRaidRun({role,seed:3}).me,ROLES.indexOf(role));
  assert.throws(()=>createRaidRun({role:'invalid'}),RangeError);
});

test('continuous autopilot can move, fuse and resolve every step within its teaching deadline',()=>{
  for(const branch of ['snake','beast'])for(let seed=1;seed<=12;seed++){
    const run=createRaidRun({seed,branch});let positions=ROLES.map((_,i)=>({x:39+i%4*7,y:43+Math.floor(i/4)*9}));
    for(const chapter of run.chapters)for(const scene of chapter.scenes){
      let holds=fusionPairsFor(run,scene).map(()=>0),facings=[],timers={};
      const dt=.025;
      for(let time=0;time<scene.duration;time+=dt){
        const plan=plans(run,scene,holds);
        positions=positions.map((p,i)=>{const t=plan[i].target,d=Math.hypot(t.x-p.x,t.y-p.y),a=27*dt;return d<=a?{...t}:{x:p.x+(t.x-p.x)/d*a,y:p.y+(t.y-p.y)/d*a};});
        facings=positions.map((p,i)=>suggestedFacing(scene,i,p));
        holds=tickHolds(run,scene,positions,holds,dt);
        const accidental=tickAccidentalFusion(run,scene,positions,holds,timers,dt);timers=accidental.timers;
        assert.deepEqual(accidental.issues,[],`${chapter.id}/${scene.id} accidental fusion`);
      }
      assert.deepEqual(validateScene(run,scene,positions,facings,holds),[],`${branch}/${seed}/${chapter.id}/${scene.id}`);
      if(scene.knockback)positions=positions.map(p=>knockback(p,scene.knockback.origin,scene.knockback.amount));
    }
  }
});

test('sustained wrong-partner contact fails while briefly crossing does not',()=>{
  const run=createRaidRun({seed:8}),scene=run.chapters.find(c=>c.id==='hc2').scenes[1],p=scene.targets.map(p=>({...p}));
  const a=scene.fusion[0][0],b=scene.fusion[1][0];p[a]={x:50,y:50};p[b]={x:50,y:50};
  const first=tickAccidentalFusion(run,scene,p,[],{},1);assert.deepEqual(first.issues,[]);
  assert.ok(tickAccidentalFusion(run,scene,p,[],first.timers,1).issues.some(i=>i.player===a));
  p[b]={x:90,y:90};assert.equal(tickAccidentalFusion(run,scene,p,[],first.timers,1).timers[`${Math.min(a,b)}:${Math.max(a,b)}`],0);
});

test('shared tile boundaries and circle edges remain hazardous',()=>{
  const a={kind:'rect',x:0,y:0,w:25,h:25},b={kind:'rect',x:25,y:0,w:25,h:25};
  assert.ok(inside({x:25,y:10},a));assert.ok(inside({x:25,y:10},b));
  assert.ok(inside({x:5,y:0},{kind:'circle',x:0,y:0,r:5}));
});
