const puppeteer=require('puppeteer-core');
const chromium=require('@sparticuz/chromium');
(async()=>{
  chromium.setGraphicsMode=true;chromium.setHeadlessMode=true;
  const browser=await puppeteer.launch({args:chromium.args.concat(['--enable-unsafe-swiftshader']),executablePath:await chromium.executablePath(),headless:'shell'});
  const page=await browser.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.setViewport({width:1280,height:720});
  await page.goto('file:///workspace/noclip/noclip.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2500));
  const t0=await page.evaluate(()=>({yaw:P.yaw,pitch:P.pitch,state:GAME.state}));
  console.log('BEFORE START:',JSON.stringify(t0));
  await page.click('#bStart');
  await new Promise(r=>setTimeout(r,3400));
  const t1=await page.evaluate(()=>({
    yaw:P.yaw,pitch:P.pitch,state:GAME.state,
    locked:!!document.pointerLockElement,
    q:[+W.cam.quaternion.x.toFixed(3),+W.cam.quaternion.y.toFixed(3),+W.cam.quaternion.z.toFixed(3),+W.cam.quaternion.w.toFixed(3)],
    t:+GAME.t.toFixed(2)
  }));
  console.log('AFTER START:',JSON.stringify(t1));
  // freeze frame check: sample rotation across 3 frames
  const seq=[];
  for(let i=0;i<3;i++){
    seq.push(await page.evaluate(()=>[+W.cam.rotation.x.toFixed(3),+W.cam.rotation.y.toFixed(3),+W.cam.rotation.z.toFixed(3)]));
    await new Promise(r=>setTimeout(r,120));
  }
  console.log('ROT SEQUENCE:',JSON.stringify(seq));
  console.log('ERRS:',errs.length?errs.join('|'):'none');
  await browser.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
