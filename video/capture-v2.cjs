const {chromium}=require('/tmp/seal-browser-RwFdAn/node_modules/playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const {performance}=require('node:perf_hooks');
const root=__dirname, out=path.join(root,'v2');
const base=process.env.DEMO_ORIGIN || 'https://15.252.126.21.sslip.io';
let browser;
(async()=>{
 await fs.mkdir(path.join(out,'frames'),{recursive:true});
 browser=await chromium.launch({headless:true,executablePath:'/home/thequacker/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--disable-background-timer-throttling']});
 const ctx=await browser.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const page=await ctx.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await ctx.addInitScript(()=>{
  document.addEventListener('DOMContentLoaded',()=>{
   const style=document.createElement('style');style.textContent='#film-cursor{position:fixed;z-index:2147483647;width:25px;height:31px;pointer-events:none;left:1450px;top:810px;filter:drop-shadow(0 2px 2px #0005)}#film-label{position:fixed;left:22px;bottom:16px;z-index:2147483646;padding:10px 16px;border-radius:4px;background:#162135ee;color:white;font:600 14px Arial,sans-serif;letter-spacing:.3px;pointer-events:none}';document.head.append(style);
   const cursor=document.createElement('div');cursor.id='film-cursor';cursor.innerHTML='<svg viewBox="0 0 25 31"><path d="M2 2V25L8 19L13 29L18 26L13 17H23Z" fill="white" stroke="#172234" stroke-width="1.7"/></svg>';document.body.append(cursor);
   document.addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});
   document.addEventListener('mousedown',()=>cursor.style.transform='scale(.83)');document.addEventListener('mouseup',()=>cursor.style.transform='scale(1)');
  });
 });
 await page.goto(base+'/app');await page.getByRole('heading',{name:'Your week. Your way.'}).waitFor();
 await page.evaluate(async()=>{for(const [merchant,amount] of [['Samosa after class',5000],['Burger with friends',5000]]){const s=await(await fetch('/api/state')).json();const r=await fetch('/api/actions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({walletId:s.walletId,version:s.state.version,action:{type:'add-expense',expense:{id:crypto.randomUUID(),merchant,amount,category:'meals',date:s.state.weekStart,note:'',fastFood:true,source:'manual'}}})});if(!r.ok)throw Error(await r.text());}});
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
 const frames=[],marks=[],cuts=[];let recording=true,paused=false,frame=0;const started=performance.now();
 const loop=(async()=>{while(recording){const t=performance.now();if(!paused){try{const name=`frame-${String(frame++).padStart(6,'0')}.jpg`;const bytes=await page.screenshot({type:'jpeg',quality:97,timeout:10000});await fs.writeFile(path.join(out,'frames',name),bytes);frames.push({file:name,t:(t-started)/1000});}catch{}}await new Promise(r=>setTimeout(r,Math.max(0,85-(performance.now()-t))));}})();
 const hold=ms=>page.waitForTimeout(ms);
 async function mark(name,label){const t=(performance.now()-started)/1000;marks.push({name,t});console.log(name,t.toFixed(2));await page.evaluate(label=>{let el=document.getElementById('film-label');if(!el){el=document.createElement('div');el.id='film-label';document.body.append(el)}el.textContent=label;},label);}
 async function click(locator){for(let attempt=0;attempt<4;attempt++){try{await locator.waitFor({state:'visible',timeout:10000});await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();if(!b)throw Error('Element moved');await page.mouse.move(b.x+b.width*.5,b.y+b.height*.5,{steps:18});await hold(180);await locator.click();await hold(300);return;}catch(e){if(attempt===3)throw e;await hold(400);}}}
 async function type(locator,value){await click(locator);await locator.fill('');await locator.pressSequentially(value,{delay:28});}
 try{
  await mark('opening','Pocket Pact · Live product walkthrough');await hold(6500);
  await click(page.getByRole('link',{name:'Try the web app'}).first());await page.getByRole('heading',{name:'Your week. Your way.'}).waitFor();
  await mark('overview','Ananya · Wallet owner');await hold(7000);
  await click(page.getByRole('link',{name:'Our pact',exact:true}));await page.getByRole('heading',{name:'On the same page.'}).waitFor();
  await mark('plan','A weekly plan, agreed together');await hold(4500);await page.mouse.wheel(0,420);await hold(3000);
  await click(page.getByRole('link',{name:'Overview',exact:true}));await page.getByRole('heading',{name:'Your week. Your way.'}).waitFor();
  await click(page.getByRole('button',{name:'Upload receipt',exact:true}));
  await mark('capture','Record a purchase · photo + a few words');
  await page.getByLabel('Upload expense photo').setInputFiles('/home/thequacker/pocket-pact/apps/web/public/images/meal-example.webp');await hold(1800);
  await type(page.getByLabel('Anything else to add? (optional)'),'Burger and fries after lab. I paid ₹180.');await hold(1500);
  const aiStart=(performance.now()-started)/1000;
  let analyzed=false;
  for(let attempt=0;attempt<3&&!analyzed;attempt++){
   await click(page.getByRole('button',{name:'Read my expense'}));
   try{await page.getByRole('heading',{name:'Does this look right?'}).waitFor({timeout:35000});analyzed=true;}catch{console.log('Provider timed out; retrying actual request',attempt+1);}
  }
  if(!analyzed)throw Error('AI provider unavailable after retries');
  const aiEnd=(performance.now()-started)/1000;
  if(aiEnd-aiStart>4)cuts.push({start:aiStart+2.5,end:aiEnd-.25});
  await mark('review','AI suggests · Ananya checks and confirms');await hold(2500);
  await type(page.getByLabel('Where or what?'),'Lunch after lab');await page.getByLabel('Amount (₹)',{exact:true}).fill('180');await page.getByLabel(/^Category/).selectOption('meals');await page.getByLabel('This was a fast-food meal',{exact:false}).check();await hold(2000);
  await mark('flag','A third fast-food meal · add the missing context');
  const note=page.getByLabel(/What would you like Kunal to know/);await note.scrollIntoViewIfNeeded();await hold(2200);
  await type(note,'The mess was closed after lab. Grabbed a burger with friends.');await click(page.getByLabel(/^Share this attachment/));await hold(2500);
  await click(page.getByRole('button',{name:'Save ₹180'}));await page.getByRole('dialog').waitFor({state:'hidden'});await hold(2200);
  await mark('supporter','Switch to Kunal · Supporter view');
  await click(page.locator('#persona'));await page.locator('#persona').selectOption('supporter');await page.getByRole('heading',{name:/A little closer/}).waitFor();await hold(2000);
  await click(page.locator('nav a[href="/family"]').first());await click(page.getByRole('button',{name:/Lunch after lab/}));await hold(4800);
  const reply=page.getByLabel('A note for Ananya (optional)');await reply.scrollIntoViewIfNeeded();await hold(1200);await type(reply,'Thanks for explaining. Let’s plan for late classes next week.');await hold(1300);
  await click(page.getByRole('button',{name:'Acknowledge expense'}));await page.getByRole('dialog').waitFor({state:'hidden'});
  await click(page.getByRole('button',{name:/Acknowledged/}));await click(page.getByRole('button',{name:/Lunch after lab/}));await hold(4000);await page.keyboard.press('Escape');
  await click(page.getByRole('link',{name:'Insights',exact:true}));await page.getByText('7 expenses',{exact:true}).waitFor();await mark('insights','Monthly insights · spending and conversations');await hold(6500);
  await page.goto(base+'/account');await page.getByRole('heading',{name:'Start your shared wallet.'}).waitFor();await mark('accounts','Separate accounts · private invitations · multiple wallets');await hold(5000);
  await page.goto('file://'+path.join(root,'architecture-v2.html')+'?scene=current');await page.evaluate(()=>document.fonts.ready);await mark('architecture','');await page.evaluate(()=>document.getElementById('film-label')?.remove());await page.mouse.move(1525,825);await hold(20000);
  await page.goto('file://'+path.join(root,'architecture-v2.html')+'?scene=scale');await mark('scale','');await page.evaluate(()=>document.getElementById('film-label')?.remove());await page.mouse.move(1525,825);await hold(13000);
  await page.goto('file://'+path.join(root,'architecture-v2.html')+'?scene=credits');await mark('credits','');await page.evaluate(()=>{document.getElementById('film-label')?.remove();document.getElementById('film-cursor')?.remove()});await hold(8500);
 }finally{
  recording=false;await loop;
  const editedTime=t=>t-cuts.reduce((n,c)=>n+Math.max(0,Math.min(t,c.end)-c.start),0);
  const kept=frames.filter(f=>!cuts.some(c=>f.t>=c.start&&f.t<c.end)).map(f=>({...f,t:editedTime(f.t)}));
  await fs.writeFile(path.join(out,'timing.json'),JSON.stringify({marks:marks.map(m=>({...m,t:editedTime(m.t)})),duration:editedTime((performance.now()-started)/1000),errors,frames:kept.length,cuts},null,2));
  let concat='';for(let i=0;i<kept.length;i++){concat+=`file 'frames/${kept[i].file}'\nduration ${i+1<kept.length?(kept[i+1].t-kept[i].t).toFixed(6):'0.100000'}\n`;}
  concat+=`file 'frames/${kept.at(-1).file}'\n`;await fs.writeFile(path.join(out,'frames.ffconcat'),concat);await browser.close();console.log('DONE',kept.length,'frames');
 }
})().catch(async e=>{console.error(e);await browser?.close();process.exit(1)});
