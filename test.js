const puppeteer=require('puppeteer-core');
const chromium=require('@sparticuz/chromium');
(async()=>{
  chromium.setGraphicsMode=true;
  chromium.setHeadlessMode=true;
  const browser=await puppeteer.launch({
    args:chromium.args.concat(['--enable-unsafe-swiftshader']),
    executablePath:await chromium.executablePath(),
    headless:'shell'
  });
  const page=await browser.newPage();
  const errs=[];
  page.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text());});
  await page.setViewport({width:1280,height:720});
  await page.goto('file:///workspace/noclip/noclip.html',{waitUntil:'load',timeout:30000});
  await new Promise(r=>setTimeout(r,3500));
  const booted=await page.evaluate(()=>({three:!!window.THREE,booted:!!W.renderer,grain:!!GAME.grainG}));
  console.log('BOOT:',JSON.stringify(booted));
  await page.screenshot({path:'/tmp/shot_title.png'});
  // start the game
  await page.click('#bStart');
  await new Promise(r=>setTimeout(r,3600));
  const st=await page.evaluate(()=>({state:GAME.state,lvl:GAME.levelIdx,px:P.x.toFixed(1),pz:P.z.toFixed(1),san:P.sanity,bat:P.bat}));
  console.log('AFTER START:',JSON.stringify(st));
  await page.screenshot({path:'/tmp/shot_play.png'});
  // walk forward a bit
  await page.keyboard.down('KeyW');
  await new Promise(r=>setTimeout(r,1200));
  await page.keyboard.up('KeyW');
  const st2=await page.evaluate(()=>({px:P.x.toFixed(2),pz:P.z.toFixed(2),light:P.lightOn}));
  console.log('AFTER WALK:',JSON.stringify(st2));
  // toggle flashlight + check entity build + director alive
  const st3=await page.evaluate(()=>({entState:ENT.state,phase:DIR.phase,dread:+DIR.dread.toFixed(2),panels:W.panelCells.length,bats:W.batteries.length}));
  console.log('WORLD:',JSON.stringify(st3));
  await page.screenshot({path:'/tmp/shot_walk.png'});
  console.log('ERRORS:',errs.length?errs.join(' | '):'none');
  await browser.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
