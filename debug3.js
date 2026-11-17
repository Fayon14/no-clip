const puppeteer=require('puppeteer-core');
const chromium=require('@sparticuz/chromium');
(async()=>{
  chromium.setGraphicsMode=true;chromium.setHeadlessMode=true;
  const browser=await puppeteer.launch({args:chromium.args.concat(['--enable-unsafe-swiftshader']),executablePath:await chromium.executablePath(),headless:'shell'});
  const page=await browser.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.setViewport({width:1280,height:720});
  await page.evaluateOnNewDocument(()=>{
    // test-only: neutralize pointer lock so synthetic mouse events cannot steer the view
    HTMLElement.prototype.requestPointerLock=function(){};
    document.exitPointerLock=function(){};
    Object.defineProperty(document,'pointerLockElement',{get:()=>null,configurable:true});
  });
  await page.goto('file:///workspace/noclip/noclip.html',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2500));
  await page.click('#bStart');
  await new Promise(r=>setTimeout(r,4000));
  // find a corridor cell: floor with walls on both sides, face along it
  const aim=await page.evaluate(()=>{
    const N=W.level.N;
    for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){
      if(W.level.at(x,y)===0&&W.level.at(x,y-1)===1&&W.level.at(x,y+1)===1&&W.level.at(x+1,y)===0){
        const cs=W.cfg.cell;
        P.x=x*cs+cs/2;P.z=y*cs+cs/2;P.yaw=-Math.PI/2;P.pitch=0; // face +X down the corridor
        return {x,y};
      }
    }
    return null;
  });
  console.log('AIM:',JSON.stringify(aim));
  await page.evaluate(()=>{P.pitch=0;P.yaw=-Math.PI/2;});
  await new Promise(r=>setTimeout(r,900));
  await page.screenshot({path:'/tmp/shot_corridor.png'});
  // walk down it
  await page.keyboard.down('KeyW');
  await new Promise(r=>setTimeout(r,2500));
  await page.keyboard.up('KeyW');
  await page.screenshot({path:'/tmp/shot_corridor2.png'});
  const st=await page.evaluate(()=>({yaw:P.yaw.toFixed(2),pitch:P.pitch,x:P.x.toFixed(1),z:P.z.toFixed(1),t:GAME.t.toFixed(1)}));
  console.log('STATE:',JSON.stringify(st));
  console.log('ERRS:',errs.length?errs.join('|'):'none');
  await browser.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
