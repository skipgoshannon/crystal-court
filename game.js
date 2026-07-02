/* ===========================================================================
   The Beast of Crystal Court — game logic
   Sections: helpers / scene1 / scene2 / boot
   (Library scene, parser, and save system are added in later sections.)
   =========================================================================== */
(() => {
  /* ===================== HELPERS ===================== */
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = s => document.querySelector(s);
  let actx=null, waiter=null;
  function blip(f=200,d=.05,t='square',g=.02){try{if(!actx)return;const o=actx.createOscillator(),x=actx.createGain();o.type=t;o.frequency.value=f;x.gain.value=g;o.connect(x);x.connect(actx.destination);o.start();o.stop(actx.currentTime+d);}catch(e){}}
  const sleep = ms => new Promise(r=>setTimeout(r, reduce?Math.min(ms,100):ms));

  /* ---- ordered (Bayer) dithering, 1-bit ---- */
  const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  function dith(ctx,d){ ctx.__c=ctx.__c||{}; const k=Math.round(d*40); if(ctx.__c[k])return ctx.__c[k];
    const t=document.createElement('canvas');t.width=4;t.height=4;const c=t.getContext('2d');const im=c.createImageData(4,4);
    for(let y=0;y<4;y++)for(let x=0;x<4;x++){const on=((BAYER[y][x]+0.5)/16)<d;const i=(y*4+x)*4;const v=on?243:0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}
    c.putImageData(im,0,0);return ctx.__c[k]=ctx.createPattern(t,'repeat');}

  /* ---- pixel classroom (1-bit, World-of-Horror-ish) ---- */
  const cv=$('#room'), cx=cv.getContext('2d');
  const R=(a,b,c,d)=>cx.fillRect(a|0,b|0,c|0,d|0);
  function fig(x,y,sc){sc=sc||1;
    const H=Math.round(7*sc),T=Math.round(11*sc),L=Math.round(10*sc),Wt=Math.round(9*sc);
    cx.fillStyle='#f3f3f3';                                  // white rim
    R(x-1,y-1,H+2,H+2); R(x-2,y+H-1,Wt+4,T+2); R(x,y+H+T-1,3,L+2); R(x+Wt-3,y+H+T-1,3,L+2);
    cx.fillStyle='#000';                                     // black silhouette
    R(x,y,H,H); R(x-1,y+H,Wt+2,T); R(x+1,y+H+T,2,L); R(x+Wt-2,y+H+T,2,L);
  }
  function room(){
    cx.fillStyle='#000';R(0,0,240,135);
    // back wall faint texture
    cx.fillStyle=dith(cx,.06);R(0,0,240,72);
    // three windows (bright)
    for(let i=0;i<3;i++){const wx=24+i*64;
      cx.fillStyle='#f3f3f3';R(wx,12,44,46);
      cx.fillStyle='#000';R(wx+21,12,2,46);R(wx,33,44,2);R(wx,12,44,2);R(wx,56,44,2);R(wx,12,2,46);R(wx+42,12,2,46);
    }
    // floor with light falloff from windows (dither bands, light->dark)
    const bands=[.5,.42,.34,.28,.22,.17,.13,.1,.07];
    for(let b=0;b<bands.length;b++){cx.fillStyle=dith(cx,bands[b]);R(0,72+b*7,240,7);}
    // back door, right, ajar
    cx.fillStyle='#000';R(196,30,30,42);cx.fillStyle='#f3f3f3';R(196,30,30,2);R(196,30,2,42);R(224,30,2,42);cx.fillStyle='#000';R(220,40,3,8);
    // desks: white outline rows (perspective: bigger toward front)
    cx.strokeStyle='#f3f3f3';cx.lineWidth=1;
    function desk(x,y,w,h){cx.strokeRect(x+.5,y+.5,w,h);cx.beginPath();cx.moveTo(x+2.5,y+h+.5);cx.lineTo(x+2.5,y+h+5);cx.moveTo(x+w-1.5,y+h+.5);cx.lineTo(x+w-1.5,y+h+5);cx.stroke();}
    desk(28,74,20,7);desk(150,74,22,7);desk(78,92,26,9);desk(168,96,28,9);desk(14,112,32,11);desk(150,116,34,11);
    // figures: you + two friends (front), Howie alone by the door (back)
    fig(180,52,.78);   // Howie, by the back door
    fig(70,90,1);      // friend
    fig(94,92,1);      // friend
    fig(40,98,1.18);   // you (front)
  }

  /* ---- continue (Enter / tap) ---- */
  function waitGo(el){el.hidden=false;return new Promise(res=>{waiter=()=>{el.hidden=true;waiter=null;blip(300,.04);res();};});}
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&waiter){e.preventDefault();waiter();}});
  function tapAdvance(e){if(waiter&&!e.target.closest('.chip,.continue,button'))waiter();}
  $('#scene1').addEventListener('click',tapAdvance);
  $('#scene2').addEventListener('click',tapAdvance);
  $('#cont1').onclick=()=>waiter&&waiter();
  $('#cont2').onclick=()=>waiter&&waiter();
  $('#card').onclick=()=>waiter&&waiter();
  function holdOrEnter(ms){return new Promise(res=>{let done=false;const fin=()=>{if(done)return;done=true;waiter=null;res();};waiter=fin;setTimeout(fin,reduce?Math.min(ms,400):ms);});}
  async function transition(text){
    const card=$('#card'),ct=card.querySelector('.cardtext');
    ct.textContent=text;card.hidden=false;void card.offsetWidth;card.classList.add('show');
    await sleep(reduce?200:650);
    await holdOrEnter(1600);
    $('#scene1').hidden=true;$('#scene2').hidden=false;s2narr('');
    card.classList.remove('show');
    await sleep(reduce?80:450);card.hidden=true;
  }

  /* ===================== SCENE 1 ===================== */
  const log=$('#log');
  function addLine(html,cls){const d=document.createElement('div');d.className='line '+(cls||'');d.innerHTML=html;log.appendChild(d);log.scrollTop=log.scrollHeight;}
  const beats=[
    {narr:"Bio let out ten minutes ago. The lecture hall is nearly empty — you, two friends in no hurry to leave, and a quiet guy in the back taking his time with his books."},
    {you:"Okay, you two have to hear this. The old mall — Crystal Court, the one they tore down?"},
    {you:"Supposedly, after midnight, it comes back. The whole place lights up like it's still 1985 — the shoppers, the food court, the theaters, all of it. You can walk right in."},
    {you:"And then at dawn it just… disappears again. Like it was never there."},
    {you:"We should go check it out sometime. For fun."},
    {narr:"The girl beside you already has her keys out. “No way. You are not getting me out there at night — that place was creepy when it was OPEN.”"},
    {narr:"The other one doesn't look up from his phone. “That stuff isn't real.”"},
    {you:"Whatever. You guys are lame."},
    {narr:"They go back to their screens. You grab your bag and head for the door."},
    {narr:"The quiet guy in the back still hasn't left — books half in his arms, just listening. He catches you looking and ducks out the door ahead of you. You don't think about it again."},
  ];
  function renderBeat(b){ log.innerHTML=''; if(b.you) addLine('<b>YOU:</b> “'+b.you+'”','you'); else addLine(b.narr,'narr'); }
  async function scene1(){
    $('#hint1').textContent='press ENTER or tap to continue';
    for(const b of beats){renderBeat(b);blip(b.you?240:190,.03,'square',.015);await waitGo($('#cont1'));}
    $('#hint1').textContent='';await transition("TWO WEEKS LATER");scene2();
  }

  /* ===================== SCENE 2 ===================== */
  const ps=$('#phonescreen'), ts=$('#termscreen');
  const setBar=t=>$('#phonebar').textContent=t;
  const s2narr=t=>$('#s2narr').textContent=t;
  const scrollP=()=>ps.scrollTop=ps.scrollHeight, scrollT=()=>ts.scrollTop=ts.scrollHeight;
  async function youMsg(t){await sleep(340);const d=document.createElement('div');d.className='msg you';d.textContent=t;ps.appendChild(d);blip(260,.03,'square',.015);scrollP();await sleep(640);}
  async function frMsg(t){const dur=Math.min(1600,750+t.length*30);
    const ti=document.createElement('div');ti.className='typing';ti.innerHTML='<i></i><i></i><i></i>';ps.appendChild(ti);scrollP();
    await sleep(dur);ti.remove();
    const d=document.createElement('div');d.className='msg fr';d.textContent=t;ps.appendChild(d);blip(200,.03,'square',.015);scrollP();await sleep(560);}
  function chips(opts){return new Promise(res=>{const c=$('#chips');c.innerHTML='';
    opts.forEach((o,i)=>{const b=document.createElement('button');b.className='chip';b.textContent=o;b.onclick=()=>{blip(300,.04);c.innerHTML='';res(i);};c.appendChild(b);});});}
  // terminal: type a command char-by-char, then print output
  async function cmd(text){const line=document.createElement('div');
    line.innerHTML='<span class="pr">Lenny@rig:~$ </span><span class="ct"></span><span class="cur"></span>';
    ts.appendChild(line);scrollT();const ct=line.querySelector('.ct'),cur=line.querySelector('.cur');
    for(const ch of text){ct.textContent+=ch;if(ch!==' ')blip(1500,.008,'square',.008);await sleep(110);scrollT();}
    cur.remove();await sleep(340);}
  function out(t){const d=document.createElement('div');d.className='out';d.textContent=t;ts.appendChild(d);scrollT();}
  function showView(v){$('#phone').hidden=v!=='phone';$('#terminal').hidden=v!=='terminal';$('#videoview').hidden=v!=='video';}
  function drawVid(){const c=$('#vid'),g=c.getContext('2d');
    g.fillStyle='#000';g.fillRect(0,0,240,135);
    g.fillStyle=dith(g,.12);g.fillRect(0,0,240,80);        // night sky
    g.fillStyle=dith(g,.05);g.fillRect(0,80,240,55);       // dark lot
    g.fillStyle='#000';g.fillRect(0,78,240,2);
    g.fillStyle=dith(g,.55);g.fillRect(108,52,26,30);      // phone glow
    g.fillStyle='#f3f3f3';g.fillRect(116,58,10,14);        // face
    g.fillStyle='#000';g.fillRect(118,62,2,2);g.fillRect(123,62,2,2);}

  async function scene2(){
    $('#scene1').hidden=true;$('#scene2').hidden=false;showView('phone');setBar('Feed');
    s2narr("Your dorm. Past midnight. You're scrolling, half-asleep — your reflection faint in the dark window.");
    await waitGo($('#cont2'));
    s2narr("A post stops your thumb. A friend shared a local news link.");
    const card=document.createElement('div');card.className='newscard';
    card.innerHTML='<div class="lbl">LOCAL NEWS</div><div class="b"><b>STUDENT MISSING; CAR FOUND ON FORMER MALL SITE.</b> Howie Carmichael, 21, last seen two weeks ago. Vehicle recovered on the vacant lot off [—] Road — the former site of Crystal Court Mall, demolished 2005. Police report “no clear leads.”</div>';
    ps.appendChild(card);scrollP();
    await waitGo($('#cont2'));
    s2narr("The quiet one from the doorway. The former site of Crystal Court. You sit up.");
    await waitGo($('#cont2'));
    s2narr("You text Lenny — the only person you know who can find things that aren't supposed to be findable.");
    ps.innerHTML='';setBar('Lenny');
    await youMsg("you up");
    await frMsg("it's 1am. obviously");
    await youMsg("kid from my bio class is missing");
    await youMsg("they found his car on the lot");
    await frMsg("…the lot lot?");
    await youMsg("the lot lot");
    await frMsg("ok that's not nothing");
    s2narr("");
    const a=await chips(["Get the real police report","Check what's online first"]);
    if(a===1){await frMsg("nothing but the same article recycled three times");await frMsg("if you want the real file i have to go get it");}
    await youMsg(a===1?"get it":"can you get into the actual case file?");
    await frMsg("you want me to break into the city case system");
    await frMsg("for fun");
    await frMsg("…yes. obviously. gimme a sec");

    /* ---- full computer-only screen ---- */
    showView('terminal');ts.innerHTML='';
    s2narr("Lenny gets to work.");
    await cmd("ssh archive@pd.pleasantvalley.gov");
    out("tunnel up.  auth ........ ok");
    await sleep(500);
    await cmd("cat cases/4471_carmichael.txt");
    out("=== RECOVERED VEHICLE / CASE 4471 ===\nsubject: CARMICHAEL, William Howard — 21.\ndriver not present.\nground disturbance, center of lot:\nmarkings \"consistent with ritual symbols\", origin unknown.\nsmall metal object photographed in place — NOT COLLECTED.\nstatus: SUSPENDED (no leads).");
    await sleep(700);
    await cmd("ls evidence/phone/");
    out("notes.txt   scan_page.png   draft_01.mp4");
    await sleep(600);
    await cmd("file evidence/phone/draft_01.mp4");
    out("draft_01.mp4: video, 0:48 — unposted youtube draft");
    await sleep(500);
    s2narr("There it is — an unposted video, the last thing Howie made.");
    await chips(["Return to the phone"]);

    /* ---- back to phone ---- */
    showView('phone');setBar('Lenny');s2narr("");
    await frMsg("you seeing this");
    await frMsg("he saved a video the night he went out there");
    await frMsg("never posted it. want it?");
    const v=await chips(["View the video","Not yet"]);
    if(v===0){
      drawVid();showView('video');
      s2narr("A dark, empty lot. Howie's face, lit by his own phone. His mouth starts to move —");
      await waitGo($('#cont2'));
      s2narr("The clip freezes on the first frame. Whatever he was about to say is gone.");
      await waitGo($('#cont2'));
      showView('phone');s2narr("");
      await youMsg("ok that was deeply not okay");
    } else {
      await frMsg("fair. it'll be here when you're ready");
    }

    /* ---- decide to meet at the library ---- */
    await frMsg("but the notes. the symbols. the mall — he was researching something");
    await youMsg("then so are we");
    await youMsg("library opens at 9. meet me there");
    await frMsg("i'll bring the laptop. you bring coffee");
    s2narr("Tomorrow morning, the campus library. Whatever Howie found, you're going to find it too.");
    await waitGo($('#cont2'));
    /* chain forward into Scene 3 (the library) */
    await showCard("THE NEXT MORNING");
    $('#scene2').hidden=true;
    library();
  }

  /* shared transition card that does NOT switch scenes (Scene 1's transition() is hardcoded
     to swap scene1->scene2; this one just shows/holds/fades the card in place). */
  async function showCard(text){
    const card=$('#card'),ct=card.querySelector('.cardtext');
    ct.textContent=text;card.hidden=false;void card.offsetWidth;card.classList.add('show');
    await sleep(reduce?200:650);
    await holdOrEnter(1600);
    card.classList.remove('show');
    await sleep(reduce?80:450);card.hidden=true;
  }

  /* ===================== SAVE SYSTEM (localStorage) =====================
     Author-approved deviation from the "no browser storage" rule, Stage 1 only.
     JSON only; validated on load; never eval'd; no network/telemetry. */
  const SAVE_KEY='bocc.save.v1';
  const DEFAULT_STATE=()=>({v:1,scene:'title',beat:null,
    flags:{loreFound:false,ritualFound:false,incantationWritten:false,reflectionSeen:false},
    inv:{salt:false,knife:false,token:false}});
  let state=DEFAULT_STATE();
  function hasSave(){try{return !!localStorage.getItem(SAVE_KEY);}catch(e){return false;}}
  function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));return true;}catch(e){return false;}}
  function loadGame(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;
    const d=JSON.parse(raw);
    if(!d||typeof d!=='object'||d.v!==1||typeof d.scene!=='string'||typeof d.flags!=='object')return null;
    return d;}catch(e){return null;}}
  function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
  function applyState(d){state=Object.assign(DEFAULT_STATE(),d);
    state.flags=Object.assign(DEFAULT_STATE().flags,(d&&d.flags)||{});
    state.inv=Object.assign(DEFAULT_STATE().inv,(d&&d.inv)||{});}
  function checkpoint(beat){if(beat)state.beat=beat;saveGame();} /* scene is set by each scene on entry */

  /* ===================== TYPED PARSER (verb–noun; never eval) ===================== */
  const VERBS={
    look:['look','l','examine','inspect','x','check','view','see','search'],
    read:['read','study'],
    find:['find','google','lookup','hack','dig','download'],
    take:['take','grab','get','pick','steal'],
    ask:['ask','talk','tell','say'],
    go:['go','leave','exit','walk','head','depart','out'],
    save:['save'],
    help:['help','commands','h'],
  };
  const FILLER=new Set(['the','a','an','to','into','on','for','of','with','up','my','your','some','it','in','through','please','at','about','around']);
  function parse(raw){
    const words=String(raw).toLowerCase().trim().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w&&!FILLER.has(w));
    if(!words.length)return{verb:null,noun:'',words:[]};
    const isVerb=w=>{for(const v in VERBS)if(VERBS[v].includes(w))return v;return null;};
    let verb=null;
    for(const w of words){const v=isVerb(w);if(v){verb=v;break;}}
    const noun=words.filter(w=>!isVerb(w)).join(' ');
    return{verb,noun,words};
  }

  /* ===================== SCENE 3 — LIBRARY ===================== */
  const lcv=$('#lib'), lx=lcv.getContext('2d');
  const s3log=$('#s3log'), pform=$('#parserform'), pin=$('#parser'), cmdhint=$('#cmdhint');
  const LIB_HELP='Type what you want to do.  LOOK · READ BOOK · EXAMINE MICROFILM · SEARCH INTERNET · ASK LENNY · GO · SAVE · HELP';
  const lR=(a,b,c,d)=>lx.fillRect(a|0,b|0,c|0,d|0);

  function drawLib(){
    lx.fillStyle='#000';lR(0,0,240,135);
    lx.fillStyle=dith(lx,.06);lR(0,0,240,80);                       // back wall
    // tall windows, gray morning light (the reflections motif lives here)
    for(let i=0;i<2;i++){const wx=150+i*44;
      lx.fillStyle=dith(lx,.5);lR(wx,10,34,60);
      lx.fillStyle='#000';lR(wx+16,10,2,60);lR(wx,38,34,2);lR(wx,10,34,2);lR(wx,68,34,2);lR(wx,10,2,60);lR(wx+32,10,2,60);
    }
    // bookshelves (line-art) with a scatter of bright spines
    lx.strokeStyle='#f3f3f3';lx.lineWidth=1;
    for(let s=0;s<2;s++){const sx=8+s*64;
      lx.strokeRect(sx+.5,12.5,54,58);
      for(let r=1;r<5;r++){lx.beginPath();lx.moveTo(sx+1,12+r*11.5);lx.lineTo(sx+54,12+r*11.5);lx.stroke();}
      lx.fillStyle=dith(lx,.5);for(let r=0;r<5;r++)for(let b=0;b<6;b++){if((r+b)%3===0)lR(sx+5+b*8,15+r*11.5,5,8);}
    }
    // floor falloff
    const bands=[.34,.28,.22,.17,.13,.1,.07];
    for(let b=0;b<bands.length;b++){lx.fillStyle=dith(lx,bands[b]);lR(0,80+b*8,240,8);}
    // microfilm reader (lit screen in the corner)
    lx.fillStyle='#000';lR(196,84,38,34);lx.strokeStyle='#f3f3f3';lx.strokeRect(196.5,84.5,38,34);
    lx.fillStyle=dith(lx,.5);lR(202,90,26,18);
    // table + glowing laptop
    lx.strokeStyle='#f3f3f3';lx.strokeRect(70.5,104.5,90,16);
    lx.fillStyle='#000';lR(96,96,18,10);lx.strokeStyle='#f3f3f3';lx.strokeRect(96.5,96.5,18,10);
    lx.fillStyle=dith(lx,.55);lR(99,99,12,5);
    // two seated silhouettes (River + Lenny)
    const seat=x=>{lx.fillStyle='#f3f3f3';lR(x-1,75,11,11);lR(x-2,85,15,20);lx.fillStyle='#000';lR(x,76,9,9);lR(x-1,86,13,18);};
    seat(58); seat(150);
  }

  function s3clear(){s3log.innerHTML='';}
  function s3line(html,cls){const d=document.createElement('div');d.className='line '+(cls||'narr');d.innerHTML=html;s3log.appendChild(d);s3log.scrollTop=s3log.scrollHeight;}
  function s3lineText(text,cls){const d=document.createElement('div');d.className='line '+(cls||'narr');d.textContent=text;s3log.appendChild(d);s3log.scrollTop=s3log.scrollHeight;} // safe for user text
  function showParser(on){pform.hidden=!on;cmdhint.textContent=on?LIB_HELP:'';if(on)setTimeout(()=>{try{pin.focus();}catch(e){}},30);}
  async function s3beat(html,cls){s3clear();showParser(false);s3line(html,cls);blip(190,.03,'square',.015);await waitGo($('#cont3'));}
  function getCommand(){return new Promise(res=>{showParser(true);
    const handler=e=>{e.preventDefault();const v=pin.value;pin.value='';if(!v.trim())return;pform.removeEventListener('submit',handler);res(v);};
    pform.addEventListener('submit',handler);});}

  function ready(){return state.flags.loreFound&&state.flags.ritualFound&&state.flags.incantationWritten;}
  function missingHint(){
    if(!state.flags.loreFound) return "Lenny: “Start with what it actually is. Howie all but lived in one book in here — go READ BOOK.”";
    if(!state.flags.ritualFound) return "Lenny: “We know what it is. Now — how did he plan to reach it? The old papers. EXAMINE MICROFILM.”";
    if(!state.flags.incantationWritten) return "Lenny: “We've got the recipe but not the words. Say so and I'll dig — SEARCH INTERNET.”";
    return "Lenny: “Salt, a token, the words, your blood. Everything we can learn is here. The rest is out there — GO when you're ready.”";
  }

  function lookRoom(){
    s3line("The Pleasant Valley history room: sagging shelves of local <b>books</b>, a <b>microfilm</b> reader humming in the corner, tall <b>windows</b> going gray with the morning. Lenny's <b>laptop</b> glows on the table.");
  }
  function doBook(){
    if(state.flags.loreFound){s3line("You read the chapter again. The same cold facts. (You have the lore.)");return;}
    s3line("You find it: a cracked local-history volume, half town record, half occult scrapbook. Its Crystal Court chapter is dog-eared and underlined in a hand that isn't yours. Howie was here.");
    s3line("It calls the thing older than the mall — older than the town. The ground was always a gathering place: a fairground, a market, a meeting of roads. Something settled there and never left.");
    s3line("It collects people, and it keeps them. It wears whatever shape draws a crowd — and in 1985 that was Crystal Court. It lives in <i>reflections</i>: glass, water, dark screens. The ones it takes don't die — they're posed in the windows like mannequins, awake behind their own eyes, for as long as it pleases.");
    s3line("Lenny: “So Howie didn't wander off. Something took him. …Great. Love that for us.”",'lenny');
    state.flags.loreFound=true;checkpoint('book');
  }
  function doMicro(){
    if(state.flags.ritualFound){s3line("You spool back through the same columns. (You have the ritual.)");return;}
    s3line("You wind through decades of the Pleasant Valley Ledger. Every fifteen or twenty years, the same small story: someone gone near the old grounds, always in the dead of night, always under a full moon.");
    s3line("Tucked in a 1968 column on “local superstitions,” a recipe. To open the way: after midnight and before dawn, beneath the moon, mark the old atrium ground with a ring of salt. Bring a token the place has already touched — something it remembers. Speak the words. Pay it a little of your own blood. The way opens only for whoever bleeds.");
    s3line("Lenny: “Salt we can grab from your kitchen. The words I can chase down. The token… and the blood are on you, River.”",'lenny');
    state.flags.ritualFound=true;checkpoint('microfilm');
  }
  function doWindow(){
    s3line("You glance at the tall windows. For half a second your reflection lags — a beat behind you, still watching while you've already turned. Then the light shifts and it's just you again. The book did say: glass.");
    if(!state.flags.reflectionSeen){state.flags.reflectionSeen=true;saveGame();}
  }
  async function doSearchInternet(){
    if(state.flags.incantationWritten){s3line("Lenny: “Already got the words — they're in your notebook. Paper, not a screen.”",'lenny');return;}
    showParser(false);
    /* reuse Scene 2's terminal view for the hack */
    $('#scene3').hidden=true;$('#scene2').hidden=false;showView('terminal');ts.innerHTML='';
    s2narr('Lenny cracks his knuckles and pulls up the Internet Archive.');
    await cmd("ia search 'crystal court' ritual grimoire pleasant valley");
    out("3 results.  1 flagged: restricted — donor scan, not public.");
    await sleep(600);
    await cmd("ia fetch grimoire_1899 --page 114 --raw");
    out("page 114/320 … rendering");
    await sleep(700);
    out("=== TO CALL THE GATHERING ===\n  [the incantation — author to supply, in [LANGUAGE]]\n  spoken over a ring of salt, beneath the moon,\n  and sealed with the blood of the one who would enter.");
    await sleep(700);
    s2narr('You copy the words by hand into your notebook. Paper, not a screen — screens are how it gets in.');
    await chips(['Back to the books']);
    state.flags.incantationWritten=true;checkpoint('archive');
    $('#scene2').hidden=true;$('#scene3').hidden=false;drawLib();
    s3clear();s3line("Back in the quiet of the history room, the words are in your notebook now.");
  }

  async function handleCommand(verb,noun,raw){
    if(!verb){s3lineText('You’re not sure how to “'+raw.trim()+'”. Try a plain verb — LOOK, READ, EXAMINE, SEARCH, ASK, GO. (HELP for the list.)');return false;}
    switch(verb){
      case 'help': s3line(LIB_HELP); s3line("You carry knowledge, not props — READ things rather than TAKE them. SAVE any time."); return false;
      case 'save': saveGame(); s3line("Saved. You can close the page and pick this up later."); return false;
      case 'take': s3line("No need — what matters is what's inside, and your notebook's got it. READ things; you carry the knowledge, not the props."); return false;
      case 'ask': s3line(missingHint(),'lenny'); return false;
      case 'look':
        if(/book|volume|chapter|shelf|shelves|stack|history/.test(noun)) doBook();
        else if(/microfilm|film|reader|newspaper|paper|ledger/.test(noun)) doMicro();
        else if(/window|glass|reflection/.test(noun)) doWindow();
        else if(/laptop|computer|screen|internet|web|archive/.test(noun)) s3line("Lenny's laptop, online and waiting. If you want him to dig for the words, SEARCH INTERNET.");
        else if(/lenny|friend|him|guy/.test(noun)) s3line("Lenny, hunched over the keyboard, coffee going cold. “What?”",'lenny');
        else if(!noun) lookRoom();
        else s3line("You look, but there's nothing like that here.");
        return false;
      case 'read':
        if(/microfilm|film|reader|newspaper|paper|ledger/.test(noun)) doMicro();
        else if(/book|volume|chapter|history/.test(noun)||!noun) doBook();
        else s3line("There's nothing like that to read. (Try READ BOOK or EXAMINE MICROFILM.)");
        return false;
      case 'find':
        await doSearchInternet(); return false;
      case 'go':
        if(ready()){await libraryEnding();return true;}
        s3line("Not yet — you don't have what you came for.");
        s3line(missingHint(),'lenny');
        return false;
    }
    return false;
  }

  async function libraryHub(){
    for(;;){
      const raw=await getCommand();
      const {verb,noun}=parse(raw);
      /* SEARCH/INTERNET handling: 'search' maps to look unless it targets the web */
      if(verb==='look' && /internet|online|archive|web|net|incantation|words|spell/.test(noun)){
        s3clear();s3lineText('> '+raw.trim(),'cmd');
        await doSearchInternet();
        continue;
      }
      s3clear();s3lineText('> '+raw.trim(),'cmd');
      const done=await handleCommand(verb,noun,raw);
      if(done) return;
    }
  }

  async function libraryEnding(){
    showParser(false);
    s3clear();s3line("You've got it all now — what it is, how to reach it, and the words to say. Lenny closes the laptop.");
    await waitGo($('#cont3'));
    s3clear();s3line("Lenny: “So. Tonight. The old lot, after midnight.”",'lenny');
    await waitGo($('#cont3'));
    s3clear();s3line("Salt and a knife to grab at home, the words already in your notebook, a little of your own blood to spend. The way opens only for whoever bleeds — Lenny can drive you out, but he can't cross.");
    await waitGo($('#cont3'));
    s3clear();s3line("<b>YOU:</b> “Then I cross. Let's go get Howie.”",'cmd');
    await waitGo($('#cont3'));
    /* MUSIC HOOK: cue the quiet pre-ritual / prep theme here (author adds later) */
    await showCard("THAT EVENING");
    $('#scene3').hidden=true;
    kitchen();
  }

  async function library(resuming){
    $('#scene1').hidden=true;$('#scene2').hidden=true;$('#scene3').hidden=false;
    $('#chips3').innerHTML='';
    drawLib();
    state.scene='library';
    if(!resuming){
      await s3beat("Morning. The campus library is nearly empty — just the hum of the lights and the smell of old paper. You set two coffees on the table; Lenny already has the laptop open.");
      await s3beat("Lenny: “Okay. A missing kid, a mall that supposedly un-demolishes itself, and police notes about <i>ritual symbols</i>. Where do we even start?”",'lenny');
      await s3beat("Where Howie started, probably. This place keeps what nobody bothers to scan — the town's old history, its newspapers. Whatever he found is in here.");
      checkpoint('hub');
    } else {
      s3clear();s3line("You're back in the Pleasant Valley history room. The coffee's cold, but the work's still here.");
    }
    await libraryHub();
  }

  /* ===================== TOP-DOWN ENGINE (Zelda-style) =====================
     The prototype's first real-time loop. One engine, two maps (kitchen, lot).
     Action-button + text pop-up interactions ("Mode A"); no typed parser here. */
  const wcv=$('#world'), wx=wcv.getContext('2d');
  const wR=(a,b,c,d)=>wx.fillRect(a|0,b|0,c|0,d|0);
  const tdbox=$('#tdbox'), tdtext=$('#tdtext');
  let tdRunning=false, tdPaused=false, raf=0;
  const held={up:false,down:false,left:false,right:false};
  let actionPressed=false;
  const KEYDIR={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',
    w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
  addEventListener('keydown',e=>{
    if(!tdRunning)return;
    const dir=KEYDIR[e.key];
    if(dir){held[dir]=true;e.preventDefault();return;}
    if(!tdPaused&&(e.key===' '||e.key==='e'||e.key==='E'||e.key==='Enter')){actionPressed=true;e.preventDefault();}
  });
  addEventListener('keyup',e=>{const dir=KEYDIR[e.key];if(dir)held[dir]=false;});
  document.querySelectorAll('#touch .dbtn').forEach(b=>{
    const dir=b.getAttribute('data-dir');
    const on=e=>{e.preventDefault();held[dir]=true;};
    const off=e=>{e.preventDefault();held[dir]=false;};
    b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);
    b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);
  });
  $('#actionbtn').addEventListener('pointerdown',e=>{e.preventDefault();if(tdRunning&&!tdPaused)actionPressed=true;});

  function tdSay(html){tdtext.innerHTML=html;tdbox.hidden=false;blip(200,.03,'square',.015);
    return waitGo($('#contTD')).then(()=>{tdbox.hidden=true;});}

  /* collision helpers — rects are [x,y,w,h]; player box matches the sprite (feet at (x,y)) */
  function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}
  function blocked(map,cx,cy){const hw=5,x=cx-hw,y=cy-16,w=hw*2,h=16;
    const b=map.bounds;if(x<b[0]||y<b[1]||x+w>b[0]+b[2]||y+h>b[1]+b[3])return true;
    for(const s of map.solids)if(rectsOverlap(x,y,w,h,s[0],s[1],s[2],s[3]))return true;return false;}
  function moveAABB(map,P,dx,dy){if(dx&&!blocked(map,P.x+dx,P.y))P.x+=dx;if(dy&&!blocked(map,P.x,P.y+dy))P.y+=dy;}
  function itemLive(i){return !(i.flag&&state.inv[i.flag]);}
  function nearest(map,px,py){let best=null,bd=1e9;
    const all=map.items.filter(itemLive).concat(map.pois);
    for(const t of all){const d=Math.hypot(t.x-px,t.y-py),r=t.r||12;if(d<=r&&d<bd){bd=d;best=t;}}return best;}

  /* 1-bit stand-in people (author swaps for sprite art later) */
  function drawRiver(x,y){wx.fillStyle='#000';wR(x-5,y-16,10,16);wx.fillStyle='#f3f3f3';wR(x-4,y-15,8,14);wx.fillStyle='#000';wR(x-3,y-12,2,2);wR(x+1,y-12,2,2);}
  function drawLenny(x,y){wx.fillStyle='#f3f3f3';wR(x-5,y-16,10,16);wx.fillStyle='#000';wR(x-4,y-15,8,14);}
  function drawWorld(map,P,L,prompt){
    map.draw(wx);
    for(const i of map.items)if(itemLive(i)&&i.draw)i.draw(wx,i);
    for(const p of map.pois)if(p.draw)p.draw(wx,p);
    const ppl=[{x:P.x,y:P.y,me:1}];if(L)ppl.push({x:L.x,y:L.y,me:0});ppl.sort((a,b)=>a.y-b.y);
    for(const pr of ppl)pr.me?drawRiver(pr.x,pr.y):drawLenny(pr.x,pr.y);
    if(prompt&&((performance.now()/350)|0)%2===0){const mx=prompt.x,my=prompt.y-(prompt.mk||20);
      wx.fillStyle='#f3f3f3';wR(mx-3,my,6,4);wR(mx-1,my+4,2,3);}
  }

  function runTopDown(map){
    $('#scene1').hidden=true;$('#scene2').hidden=true;$('#scene3').hidden=true;$('#td').hidden=false;
    tdbox.hidden=true;$('#still').hidden=true;
    for(const k in held)held[k]=false;actionPressed=false;
    const P={x:map.spawn.x,y:map.spawn.y},L=map.lennySpawn?{x:map.lennySpawn.x,y:map.lennySpawn.y}:null;
    const SPEED=1.15;tdRunning=true;tdPaused=false;
    function step(){
      if(!tdRunning)return;
      if(!tdPaused){
        let vx=(held.right?1:0)-(held.left?1:0),vy=(held.down?1:0)-(held.up?1:0);
        if(vx&&vy){vx*=.7071;vy*=.7071;}
        moveAABB(map,P,vx*SPEED,vy*SPEED);
        const prompt=nearest(map,P.x,P.y);
        if(actionPressed){actionPressed=false;
          if(prompt){tdPaused=true;blip(300,.04);
            Promise.resolve((prompt.onTake?prompt.onTake(prompt,P,L):prompt.onAction(prompt,P,L)))
              .then(()=>{tdbox.hidden=true;tdPaused=false;});}}
        drawWorld(map,P,L,prompt);
      }
      raf=requestAnimationFrame(step);
    }
    raf=requestAnimationFrame(step);
  }
  function stopTopDown(){tdRunning=false;cancelAnimationFrame(raf);}

  /* ===================== SCENE 4 — KITCHEN (top-down) ===================== */
  function drawKitchen(g){
    g.fillStyle='#000';g.fillRect(0,0,240,135);
    g.fillStyle=dith(g,.05);g.fillRect(0,0,240,20);                 // upper wall
    // floor (faint dithered tiles)
    g.fillStyle=dith(g,.12);g.fillRect(0,20,240,115);
    g.strokeStyle='#555';for(let x=0;x<=240;x+=24){g.beginPath();g.moveTo(x+.5,20);g.lineTo(x+.5,135);g.stroke();}
    for(let y=44;y<135;y+=24){g.beginPath();g.moveTo(0,y+.5);g.lineTo(240,y+.5);g.stroke();}
    g.strokeStyle='#f3f3f3';g.lineWidth=1;
    const counter=(x,w)=>{g.fillStyle='#000';g.fillRect(x,20,w,20);g.strokeRect(x+.5,20.5,w,20);};
    counter(10,100);counter(134,16);                                // top counters (gap = doorway)
    // drawer faces + handles on the left counter
    g.strokeStyle='#f3f3f3';
    [28,55,82].forEach(dx=>{g.strokeRect(dx+.5,26.5,22,9);g.fillStyle='#f3f3f3';g.fillRect(dx+8,30,6,2);});
    // stove + 4 burners
    g.fillStyle='#000';g.fillRect(150,20,36,20);g.strokeRect(150.5,20.5,36,20);
    g.fillStyle=dith(g,.5);[157,173].forEach(bx=>[26,33].forEach(by=>g.fillRect(bx,by,6,4)));
    // sink basin
    g.fillStyle='#000';g.fillRect(186,20,44,20);g.strokeRect(186.5,20.5,44,20);g.fillStyle=dith(g,.4);g.fillRect(196,25,24,10);
    // doorway (gap) marker — way out
    g.fillStyle=dith(g,.25);g.fillRect(110,8,24,12);g.fillStyle='#f3f3f3';g.fillRect(110,8,2,12);g.fillRect(132,8,2,12);
    // table
    g.fillStyle='#000';g.fillRect(96,72,48,26);g.strokeRect(96.5,72.5,48,26);
    // fridge (right wall)
    g.fillStyle='#000';g.fillRect(212,46,20,40);g.strokeRect(212.5,46.5,20,40);g.fillStyle='#f3f3f3';g.fillRect(214,64,2,8);
  }
  async function kitchenDrawer(name,flag,found,empty){
    if(state.inv[flag]){await tdSay(empty);return;}
    state.inv[flag]=true;checkpoint(name);await tdSay(found);
  }
  function kitchenMap(){return {
    id:'kitchen',draw:drawKitchen,spawn:{x:120,y:120},
    bounds:[10,40,220,92],
    solids:[[10,20,100,20],[134,20,16,20],[150,20,36,20],[186,20,44,20],[96,72,48,26],[212,46,20,40]],
    items:[],
    pois:[
      {x:39,y:42,r:18,mk:18,onAction:()=>kitchenDrawer('salt','salt',
        "You slide the drawer open. Behind the takeout menus — a heavy blue cylinder of salt. You drop it in your bag.",
        "Just the empty space where the salt was.")},
      {x:66,y:42,r:18,mk:18,onAction:()=>tdSay("Dish towels, rubber bands, a dead battery. The junk drawer earns its name.")},
      {x:93,y:42,r:18,mk:18,onAction:()=>kitchenDrawer('knife','knife',
        "Under the spare keys: your dad's old pocketknife, bone handle worn smooth. You fold it into your pocket.",
        "Empty now — the knife's in your pocket.")},
      {x:122,y:42,r:18,mk:18,onAction:async()=>{
        if(state.inv.salt&&state.inv.knife){stopTopDown();await showCard("THE OLD LOT · AFTER MIDNIGHT");lot();}
        else await tdSay("Not yet. You came down for the salt and your dad's old pocketknife.");}},
    ],
  };}
  function kitchen(resuming){state.scene='kitchen';checkpoint('kitchen');
    runTopDown(kitchenMap());
    if(!resuming)setTimeout(()=>{if(tdRunning&&!tdPaused){tdPaused=true;
      tdSay("Past eleven. Your kitchen, lights low. Salt and a knife — the ritual needs both.")
        .then(()=>{tdPaused=false;});}},120);
  }

  /* ===================== SCENE 5 — PARKING LOT (top-down) ===================== */
  function drawLot(g){
    g.fillStyle='#000';g.fillRect(0,0,240,135);
    // cement lot (upper) — light, cracked
    g.fillStyle=dith(g,.16);g.fillRect(0,0,240,98);
    g.strokeStyle='#555';for(let x=20;x<240;x+=40){g.beginPath();g.moveTo(x+.5,8);g.lineTo(x+.5,90);g.stroke();}
    // cracks
    g.strokeStyle='#777';g.beginPath();g.moveTo(40,30);g.lineTo(70,55);g.lineTo(60,80);g.moveTo(180,20);g.lineTo(160,60);g.stroke();
    // moon
    g.fillStyle='#f3f3f3';g.beginPath();g.arc(208,24,12,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.arc(203,21,11,0,7);g.fill();
    // grass band (lower)
    g.fillStyle=dith(g,.6);g.fillRect(0,98,240,37);g.fillStyle='#000';g.fillRect(0,96,240,2);
    // Howie's sigil burned/scrawled on the cement
    g.strokeStyle='#f3f3f3';g.lineWidth=1;g.beginPath();g.arc(120,50,17,0,7);g.stroke();
    g.beginPath();g.moveTo(120,35);g.lineTo(120,65);g.moveTo(105,50);g.lineTo(135,50);
    g.moveTo(109,39);g.lineTo(131,61);g.moveTo(131,39);g.lineTo(109,61);g.stroke();
    // the parked car (on the grass)
    g.fillStyle='#000';g.fillRect(150,104,52,22);g.strokeStyle='#f3f3f3';g.strokeRect(150.5,104.5,52,22);
    g.fillStyle=dith(g,.4);g.fillRect(156,108,16,8);g.fillRect(180,108,16,8);
  }
  function ritualReady(){return state.inv.salt&&state.inv.knife&&state.inv.token&&state.flags.incantationWritten;}
  function lotMissing(){const need=[];if(!state.inv.token)need.push("the token from the ground");if(!state.inv.salt)need.push("the salt");if(!state.inv.knife)need.push("the knife");return need;}
  function lotMap(){return {
    id:'lot',draw:drawLot,spawn:{x:120,y:120},lennySpawn:{x:140,y:120},
    bounds:[6,8,228,122],
    solids:[[150,104,52,22]],
    items:[{x:150,y:58,flag:'token',r:12,mk:14,
      draw:(g,i)=>{g.fillStyle='#f3f3f3';g.fillRect(i.x-3,i.y-3,6,6);g.fillStyle='#000';g.fillRect(i.x-1,i.y-1,2,2);},
      onTake:async i=>{state.inv.token=true;checkpoint('token');
        await tdSay("A small tarnished medallion, half-pressed into the asphalt where the police left it — too odd to bag, too dull to steal. It's warm. <b>You pocket the token.</b>");}}],
    pois:[{x:120,y:50,r:20,mk:24,onAction:async()=>{
      if(!ritualReady()){const m=lotMissing();
        await tdSay(m.length?("Howie's circle, scratched into the cement. You're not ready — you still need "+m.join(", ")+".")
          :"Howie's circle. You have everything but the words — and those are in your notebook. (You should be ready.)");return;}
      stopTopDown();await ritualSequence();}}],
  };}
  function lot(resuming){state.scene='lot';checkpoint('lot');
    runTopDown(lotMap());
    if(!resuming)setTimeout(()=>{if(tdRunning&&!tdPaused){tdPaused=true;
      tdSay("The old lot. Past midnight, dead quiet, the moon high. Somewhere up on the cracked cement is Howie's circle — and the token the police left behind. <b>Lenny stays by the car.</b> (Find the token, then the circle.)")
        .then(()=>{tdPaused=false;});}},120);
  }

  /* ---- the summoning + the framed "awe" still + Lenny stays behind ---- */
  async function ritualSequence(){
    tdbox.hidden=false;
    await tdSay("You shake the salt out in a slow ring over Howie's faded sigil.");
    await tdSay("You set the token in the center. It hums, cold, against the cement.");
    await tdSay("From your notebook you read the words aloud — the older tongue catching strange in your mouth.");
    await tdSay("You open the knife and draw it across your palm. Three dark drops fall onto the salt.");
    /* MUSIC HOOK: ritual stinger / the mall "powering on" swell (author adds later) */
    await tdSay("The air pulls tight — like the whole lot took a breath and held it.");
    await ritualAftermath();
  }
  const stillart=$('#stillart'),sx=stillart.getContext('2d');
  function drawAweFaces(){ /* 1-bit stand-in — author replaces with the real portrait */
    sx.fillStyle='#000';sx.fillRect(0,0,240,135);
    sx.fillStyle=dith(sx,.5);sx.fillRect(0,0,240,46);              // glow from above (the mall's light)
    const face=(cx,white)=>{const top=54;
      sx.fillStyle='#f3f3f3';sx.fillRect(cx-22,top-2,44,2);        // lit hairline
      sx.fillStyle=white?'#f3f3f3':'#000';sx.fillRect(cx-20,top,40,58);
      sx.fillStyle=white?'#000':'#f3f3f3';sx.fillRect(cx-19,top+1,38,56);   // face fill
      // wide eyes (awe)
      sx.fillStyle=white?'#f3f3f3':'#000';sx.fillRect(cx-12,top+22,9,7);sx.fillRect(cx+3,top+22,9,7);
      sx.fillStyle=white?'#000':'#f3f3f3';sx.fillRect(cx-9,top+24,3,3);sx.fillRect(cx+6,top+24,3,3);
      // small open mouth
      sx.fillRect(cx-3,top+42,6,5);
    };
    face(74,false); face(166,true);
  }
  function stillBeat(html){$('#stilltext').innerHTML=html;return waitGo($('#contStill'));}
  async function ritualAftermath(){
    tdbox.hidden=true;stopTopDown();
    $('#scene1').hidden=true;$('#scene2').hidden=true;$('#scene3').hidden=true;$('#td').hidden=false;
    drawAweFaces();$('#still').hidden=false;
    await stillBeat("Light slams up out of the empty lot — glass and chrome and a thousand windows. <b>Crystal Court stands whole again</b>, humming like it never left 1985. You and Lenny stare up at it, mouths open.");
    await stillBeat("<b>Lenny:</b> “…Okay. It's real. It's <i>extremely</i> real.”");
    await stillBeat("He takes a step toward the light with you — and stops short, palm flat against nothing, like a wall only he can feel.");
    await stillBeat("<b>Lenny:</b> “I can't. It won't let me in. The way only opened for you.”");
    await stillBeat("<b>YOU:</b> “Then come back to the car. I'm not doing the next part with you standing here looking like that.”");
    await stillBeat("<b>Lenny:</b> “No — listen. It's better this way. I stay out here, I keep digging — floor plans, the old book, anything Howie missed. And if it goes wrong, I'm the one who can call for help.”");
    await stillBeat("Neither of you says the obvious: that there's no help to call for a place that isn't supposed to exist. But it makes the standing-still bearable, so you both let it stand.");
    await stillBeat("<b>YOU:</b> “Keep your phone on. I mean it.”  <b>Lenny:</b> “Glued to my hand. Go get him.”");
    /* MUSIC HOOK: lonely "crossing over" theme as River steps in (author adds later) */
    await showCard("CRYSTAL COURT — OPEN TILL DAWN");
    lotEndPlaceholder();
  }
  function lotEndPlaceholder(){
    clearSave(); /* nothing past this is built yet; start fresh next time */
    drawAweFaces();$('#still').hidden=false;
    $('#stilltext').innerHTML='';
    const p=document.createElement('div');p.textContent='—  TO BE CONTINUED  —';$('#stilltext').appendChild(p);
    const q=document.createElement('div');q.className='subtle';q.textContent='River steps inside. (The mall interior comes next.)';$('#stilltext').appendChild(q);
    const again=document.createElement('button');again.className='chip';again.textContent='↻ Play again';again.onclick=()=>{clearSave();location.reload();};
    $('#stilltext').appendChild(again);
    $('#contStill').hidden=true;
  }

  function resumeFromSave(){
    switch(state.scene){
      case 'kitchen': kitchen(true); break;
      case 'lot': lot(true); break;
      case 'library': library(true); break;
      default: scene1();
    }
  }

  /* ===================== BOOT ===================== */
  room();
  $('#scene3').addEventListener('click',tapAdvance);
  $('#cont3').onclick=()=>waiter&&waiter();
  $('#td').addEventListener('click',tapAdvance);   // advance pop-ups by tapping the world (not the buttons)
  $('#still').addEventListener('click',tapAdvance);
  $('#contTD').onclick=()=>waiter&&waiter();
  $('#contStill').onclick=()=>waiter&&waiter();
  function startAudio(){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}blip(330,.06,'square',.03);}
  (function initTitle(){const d=loadGame();if(d){applyState(d);$('#continueBtn').hidden=false;}})();
  $('#startBtn').onclick=()=>{startAudio();state=DEFAULT_STATE();$('#titleScreen').style.display='none';scene1();};
  $('#continueBtn').onclick=()=>{startAudio();$('#titleScreen').style.display='none';resumeFromSave();};
})();
