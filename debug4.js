const puppeteer=require('puppeteer-core');
const chromium=require('@sparticuz/chromium');
(async()=>{
  chromium.setGraphicsMode=true;chromium.setHeadlessMode=true;
  const browser=await puppeteer.launch({args:chromium.args.concat(['--enable-unsafe-swiftshader']),executablePath:await chromium.executablePath(),headless:'shell'});
  const page=await browser.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.setViewport({width:1280,height:720});
  await page.evaluateOnNewDocument(()=>{
    HTMLElement.prototype.requestPointerLock=function(){};
    document.exitPointerLock=function(){};
    Object.defineProperty(document,'pointerLockElement',{get:()=>null,configurable:true});
  });
  await page.goto('file:///workspace/noclip/noclip.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2500));
  await page.click('#bStart');
  await new Promise(r=>setTimeout(r,4000));
  // 1) glimpse fires
  const g1=await page.evaluate(()=>{DIR.glimpse();return {ent:ENT.state,mesh:ENT.mesh.visible};});
  console.log('GLIMPSE:',JSON.stringify(g1));
  // 2) force the catch: put the entity right next to the player, hunting
  const h1=await page.evaluate(()=>{
    ENT.despawn();
    ENT.x=P.x+0.9;ENT.z=P.z;ENT.state='hunt';ENT.awareness=1.2;ENT.frozen=false;ENT.mesh.visible=true;
    return {d:+Math.hypot(ENT.x-P.x,ENT.z-P.z).toFixed(2)};
  });
  console.log('FORCE HUNT:',JSON.stringify(h1));
  await new Promise(r=>setTimeout(r,2500));
  const h2=await page.evaluate(()=>({state:GAME.state,deadShown:document.getElementById('dead').classList.contains('on')}));
  console.log('AFTER CATCH:',JSON.stringify(h2));
  await page.screenshot({path:'/tmp/shot_dead.png'});
  // 3) retry, then jump to level 2 to inspect its world
  await page.click('#bRetry');
  await new Promise(r=>setTimeout(r,3800));
  const r1=await page.evaluate(()=>({state:GAME.state,lvl:GAME.levelIdx}));
  console.log('RETRY:',JSON.stringify(r1));
  const r2=await page.evaluate(()=>{GAME.nextLevel();return {lvl:GAME.levelIdx,name:W.cfg.name};});
  console.log('NEXT LEVEL:',JSON.stringify(r2));
  await new Promise(r=>setTimeout(r,3200));
  const r3=await page.evaluate(()=>({state:GAME.state,lvlName:W.cfg.name,spdH:ENT.spdH,fogD:+W.scene.fog.density.toFixed(3),amb:W.cfg.amb,bats:W.batteries.length}));
  console.log('L1 WORLD:',JSON.stringify(r3));
  await page.screenshot({path:'/tmp/shot_l1.png'});
  console.log('ERRS:',errs.length?errs.join('|'):'none');
  await browser.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
