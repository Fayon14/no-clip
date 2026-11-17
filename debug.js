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
  await page.click('#bStart');
  await new Promise(r=>setTimeout(r,3400));
  const info=await page.evaluate(()=>{
    const cs=W.cfg.cell, N=W.level.N;
    const cam=W.cam;
    const rc=new THREE.Raycaster();
    rc.set(cam.position, new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion));
    const hits=rc.intersectObjects(W.scene.children,true).slice(0,8).map(h=>({d:+h.distance.toFixed(2),t:h.object.type,n:(h.object.name||''),mat:h.object.material&&h.object.material.type}));
    // find a floor cell with a wall 1 cell north, teleport near it
    let spot=null;
    outer: for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){
      if(W.level.at(x,y)===0&&W.level.at(x,y-1)===1&&W.level.at(x-1,y)===0){spot={x,y};break outer;}
    }
    return {
      camPos:[+cam.position.x.toFixed(1),+cam.position.y.toFixed(2),+cam.position.z.toFixed(1)],
      camRot:[+cam.rotation.x.toFixed(2),+cam.rotation.y.toFixed(2),+cam.rotation.z.toFixed(2)],
      wallCount:W.wallMesh.count,
      wallBounds:JSON.stringify(W.wallMesh.geometry.boundingSphere?{r:+W.wallMesh.geometry.boundingSphere.radius.toFixed(1)}:null),
      hits, spot, spawnCell:[W.level.spawn.x,W.level.spawn.y],
      cellOfPlayer:[Math.floor(P.x/cs),Math.floor(P.z/cs)],
      sceneKids:W.scene.children.map(o=>o.type)
    };
  });
  console.log(JSON.stringify(info,null,1));
  // teleport right against a wall, face it, screenshot
  await page.evaluate(()=>{
    const cs=W.cfg.cell, s=infoSpotFix();
    function infoSpotFix(){return null;}
  }).catch(()=>{});
  const spot=info.spot;
  if(spot){
    await page.evaluate((sp)=>{
      P.x=sp.x*W.cfg.cell+W.cfg.cell/2; P.z=sp.y*W.cfg.cell+W.cfg.cell*0.75; P.yaw=Math.PI; P.pitch=0;
    },spot);
    await new Promise(r=>setTimeout(r,400));
    await page.screenshot({path:'/tmp/shot_wall.png'});
  }
  console.log('ERRS:',errs.length?errs.join('|'):'none');
  await browser.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
