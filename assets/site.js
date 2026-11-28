(function(){
  var d=document, $=function(s,r){return (r||d).querySelector(s)}, $$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};

  // Opened straight from a folder: point directory links at their index.html
  if(location.protocol==='file:'){
    $$('a[href]').forEach(function(a){
      var h=a.getAttribute('href');
      if(/^(https?:|mailto:|#)/.test(h)) return;
      var p=h.split('#'); if(p[0]===''||/\/$/.test(p[0])||p[0]==='.'||p[0]==='..'){
        p[0]=(p[0]==='.'||p[0]==='..'?p[0]+'/':p[0])+'index.html'; a.setAttribute('href',p.join('#'));
      }
    });
  }

  // Settings the pastor publishes from /admin: the latest message, and any week that differs from the usual
  // Sunday 10:00 AM (no service, a different day or time, a short note). Weeks are keyed by their Sunday.
  var S={latestMessage:'',weeks:{},site:{}};
  var BASE=[10,0];   // the usual Sunday start time, Panama
  var LEN=90*60000, DAY=86400000, NOTE=90;
  var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], DW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  function z(n){return (n<10?'0':'')+n}
  // Panama is UTC-5 all year, so Sunday 10:00 AM is always 15:00 UTC.
  function pan(t){return new Date(t.getTime()-5*3600000)}
  function ymd(t){var p=pan(t);return p.getUTCFullYear()+'-'+z(p.getUTCMonth()+1)+'-'+z(p.getUTCDate())}
  function firstSunday(now){
    var p=pan(now), t=new Date(Date.UTC(p.getUTCFullYear(),p.getUTCMonth(),p.getUTCDate(),BASE[0]+5,BASE[1],0));
    t=new Date(t.getTime()+((7-p.getUTCDay())%7)*DAY);
    if(now-t>=LEN) t=new Date(t.getTime()+7*DAY);
    return t;
  }
  function svc(sun){
    var w=S.weeks[ymd(sun)]||{}, t=sun;
    if(!w.off){
      var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(w.date||''), tm=/^(\d\d):(\d\d)$/.exec(w.time||'');
      if(m||tm){
        var p=pan(sun), c=new Date(Date.UTC(m?+m[1]:p.getUTCFullYear(),m?+m[2]-1:p.getUTCMonth(),m?+m[3]:p.getUTCDate(),(tm?+tm[1]:BASE[0])+5,tm?+tm[2]:BASE[1]));
        if(sun-c<7*DAY&&c-sun<DAY) t=c;   // only within that week
      }
    }
    return {sun:sun,off:!!w.off,t:t,moved:t.getTime()!==sun.getTime(),note:String(w.note||'').replace(/\s+/g,' ').trim().slice(0,NOTE)};
  }
  function plan(now){
    var f=firstSunday(now), list=[], next=null, started=false;
    for(var i=0;i<60;i++){
      var v=svc(new Date(f.getTime()+i*7*DAY));
      if(!started&&!v.off&&now-v.t>=LEN) continue;   // moved earlier in its week and already over
      started=true;
      if(list.length<5) list.push(v);
      if(!next&&!v.off) next=v;
      if(next&&list.length>=5) break;
    }
    return {list:list,next:next};
  }
  function clock(t){var p=pan(t),h=p.getUTCHours();return ((h+11)%12+1)+':'+z(p.getUTCMinutes())+' '+(h<12?'AM':'PM')}
  function long(t){var p=pan(t);return DOW[p.getUTCDay()]+', '+MON[p.getUTCMonth()]+' '+p.getUTCDate()}
  function away(ms){
    if(ms<=0) return 'happening now';
    var m=Math.round(ms/60000), h=Math.floor(m/60), dd=Math.floor(h/24);
    if(dd>=2) return 'in '+dd+' days';
    if(dd===1) return 'in 1 day, '+(h-24)+' hr';
    if(h>=1) return 'in '+h+' hr '+(m%60)+' min';
    return 'in '+Math.max(m,1)+' min';
  }
  function tick(){
    var now=new Date(), P=plan(now), s=P.next, first=P.list[0];
    if(!s) return;
    $$('[data-count]').forEach(function(e){e.textContent=away(s.t-now)});
    $$('[data-date]').forEach(function(e){e.textContent=long(s.t)});
    $$('[data-time]').forEach(function(e){e.textContent=clock(s.t)});
    $$('[data-day]').forEach(function(e){e.textContent=DOW[pan(s.t).getUTCDay()]});
    $$('[data-skip]').forEach(function(e){
      e.hidden=!first.off; e.textContent=first.off?'No service '+long(first.sun)+'.'+(first.note?' '+first.note:''):'';
      e.parentNode.classList.toggle('has-skip',first.off);
    });
    $$('[data-notice]').forEach(function(e){e.hidden=!s.note; e.textContent=s.note?long(s.t)+': '+s.note:''});
    $$('[data-weeks]').forEach(function(box){
      $$('li',box).forEach(function(li,i){
        var v=P.list[i], p=pan(v.off?v.sun:v.t);
        $('.mo',li).textContent=MO[p.getUTCMonth()]; $('.day',li).textContent=p.getUTCDate();
        $('.at',li).textContent=v.off?'No service':(v.moved?DW[p.getUTCDay()]+' '+clock(v.t):clock(v.t));
        li.className=v.off?'off':(v===s?'next':(v.moved?'moved':''));
      });
    });
    $$('[data-notes]').forEach(function(ul){
      ul.textContent='';
      P.list.forEach(function(v){
        if(!v.note) return;
        var li=d.createElement('li'), b=d.createElement('b');
        b.textContent=(v.off?long(v.sun)+', no service':long(v.t))+': '; li.appendChild(b); li.appendChild(d.createTextNode(v.note)); ul.appendChild(li);
      });
      ul.hidden=!ul.children.length;
    });
  }
  // Site details the pastor can change: usual time, address, links, giving details, welcome video.
  // Anything not set keeps the wording already on the page.
  function hm(h,m,bare){return ((h+11)%12+1)+':'+z(m)+(bare?'':' '+(h<12?'AM':'PM'))}
  // Upcoming events on the home page: up to three, set in the admin page.
  // An event shows through its own day (Panama time) and then drops off.
  function events(V){
    var box=d.querySelector('[data-events]'); if(!box) return;
    var g=function(k,max){var v=V[k];return typeof v==='string'?v.replace(/\s+/g,' ').trim().slice(0,max||120):''};
    var today=new Date(Date.now()-5*3600000).toISOString().slice(0,10), list=[], PICS={candle:1,picnic:1,lunch:1,lifebridge:1};
    var imgBase=(d.querySelector('img[src*="assets/img/"]')||{getAttribute:function(){return 'assets/img/x'}}).getAttribute('src').replace(/assets\/img\/.*$/,'assets/img/events/');
    for(var i=1;i<=3;i++){
      var p='ev'+i+'.', title=g(p+'title',70), date=g(p+'date',10);
      if(!title||!/^\d{4}-\d\d-\d\d$/.test(date)||date<today) continue;
      var img=typeof V[p+'img']==='string'?V[p+'img'].trim():'', pic=g(p+'pic',20), link=g(p+'link',500);
      list.push({title:title,date:date,time:g(p+'time',30),place:g(p+'place',70),note:g(p+'note',140),
        link:/^https?:\/\/\S+$/.test(link)?link:'', src:(/^https?:\/\/\S+$/.test(img)&&img.length<=600)||/^data:image\/\S+$/.test(img)?img:imgBase+(PICS[pic]?pic:'lifebridge')+'.svg'});
    }
    list.sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0});
    var out=box.querySelector('.evs-list'); out.textContent='';
    if(!list.length){ box.hidden=true; return; }
    var el=function(tag,cls,text){var e=d.createElement(tag); if(cls) e.className=cls; if(text) e.textContent=text; return e};
    var one=list.length===1, wrap=el('div',one?'ov':'evs-grid n'+list.length);
    list.forEach(function(ev){
      var m=ev.date.split('-'), dt=new Date(Date.UTC(+m[0],+m[1]-1,+m[2]));
      var day=dt.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',timeZone:'UTC'});
      var im=el('img'); im.src=ev.src; im.alt=''; im.loading='lazy';
      var c=el('div','c'); c.appendChild(el('p','evs-day',day)); c.appendChild(el('h3','',ev.title));
      if(ev.time||ev.place){ var mt=el('p','evs-meta'); if(ev.time) mt.appendChild(el('b','',ev.time)); if(ev.time&&ev.place) mt.appendChild(d.createElement('br')); if(ev.place) mt.appendChild(d.createTextNode(ev.place)); c.appendChild(mt); }
      if(one&&ev.note) c.appendChild(el('p','evs-meta',ev.note));
      if(ev.link){ var a=el('a',one?'btn':'link','Details'); a.href=ev.link; a.target='_blank'; a.rel='noopener noreferrer'; a.setAttribute('aria-label','Details: '+ev.title); c.appendChild(a); }
      if(one){ wrap.appendChild(im); wrap.appendChild(c); } else { var ar=el('article'); ar.appendChild(im); ar.appendChild(c); wrap.appendChild(ar); }
    });
    out.appendChild(wrap); box.hidden=false;
  }
  function apply(){
    var V=S.site||{}, get=function(k,max){var v=V[k];return typeof v==='string'?v.replace(/\s+/g,' ').trim().slice(0,max||240):''};
    var T=/^(\d\d):(\d\d)$/.exec(get('time')), X={};
    if(T){ BASE=[+T[1],+T[2]]; var a=BASE[0]*60+BASE[1]-15; X.time=hm(BASE[0],BASE[1]); X['time-short']=hm(BASE[0],BASE[1],1); X.arrive=hm(Math.floor(a/60),a%60); }
    $$('[data-s]').forEach(function(e){var k=e.getAttribute('data-s'),v=X[k]||(k in X?'':get(k)); if(v) e.textContent=v});
    events(V);
    $$('[data-copy-s]').forEach(function(e){var v=get(e.getAttribute('data-copy-s')); if(v) e.setAttribute('data-copy',v)});
    $$('[data-link]').forEach(function(e){var v=get(e.getAttribute('data-link'),500); if(/^https?:\/\/\S+$/.test(v)) e.setAttribute('href',v)});
    $$('[data-mail]').forEach(function(e){var v=get(e.getAttribute('data-mail'),120); if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){e.setAttribute('href','mailto:'+v);e.textContent=v}});
    var y=get('give.yappy',300);
    if(y) $$('[data-yappy]').forEach(function(ul){
      ul.textContent=''; y.split(',').slice(0,10).forEach(function(b){b=b.trim().slice(0,40); if(!b) return; var li=d.createElement('li'); li.textContent=b; ul.appendChild(li)});
    });
    var pn=get('place.name'), ps=get('place.street');
    if(pn||ps) $$('[data-mapframe]').forEach(function(f){
      f.src='https://www.google.com/maps?q='+encodeURIComponent((pn||'World Trade Center')+' '+(ps||'Calle 53 Este Marbella')+' Panama City')+'&z=14&output=embed';
    });
    var fe=get('forms.email',120); if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fe)) TO=fe;
  }
  function videoId(u){var m=/(?:youtu\.be\/|[?&]v=|\/(?:embed|live|shorts)\/)([\w-]{11})/.exec(u||'');return m?m[1]:''}
  // The linked video's own thumbnail: the largest size YouTube has for it
  function thumb(id,cb){
    var names=['maxresdefault','sddefault','hqdefault'], i=0;
    (function next(){
      var im=new Image();
      im.onload=function(){ if(im.naturalWidth>120||i>=names.length-1) cb(im.src); else {i++;next()} };   // 120px wide = YouTube's "no such size" placeholder
      im.onerror=function(){ if(i<names.length-1){i++;next()} };
      im.src='https://i.ytimg.com/vi/'+id+'/'+names[i]+'.jpg';
    })();
  }
  function point(box,id){
    if(box.getAttribute('data-vid')===id) return;
    box.setAttribute('data-vid',id);
    box.setAttribute('data-yt','https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1');
    box.setAttribute('data-page','https://www.youtube.com/watch?v='+id);
    thumb(id,function(url){
      if(box.getAttribute('data-vid')!==id) return;
      box.setAttribute('data-thumb',url);
      var btn=$('button.poster',box); if(!btn) return;
      btn.classList.add('thumb');
      btn.setAttribute('style','background-image:linear-gradient(180deg,rgba(11,39,51,0) 50%,rgba(11,39,51,.85)),url('+url+');background-position:center');
    });
  }
  function latest(){
    var id=videoId(S.latestMessage); if(!id) return;
    $$('[data-latest]').forEach(function(box){point(box,id)});
  }
  var WELCOME='Gqqq2FBiNDA';
  function welcome(){
    var w=videoId(String((S.site||{}).welcomeVideo||''))||WELCOME;
    $$('[data-video=welcome]').forEach(function(box){point(box,w)});
    $$('[data-link=welcome]').forEach(function(e){e.setAttribute('href','https://www.youtube.com/watch?v='+w)});
  }
  tick(); setInterval(tick,30000);
  if(window.__lbSite){ S.site=window.__lbSite; apply(); }
  var me=d.currentScript&&d.currentScript.src;
  if(me&&window.fetch&&location.protocol!=='file:'){
    fetch(me.replace(/assets\/site\.js.*$/,'settings.json'),{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
      if(!j){welcome();return}
      if(typeof j.latestMessage==='string') S.latestMessage=j.latestMessage;
      if(j.weeks&&typeof j.weeks==='object') S.weeks=j.weeks;
      if(Array.isArray(j.closed)) j.closed.forEach(function(k){if(!S.weeks[k])S.weeks[k]={off:true}});
      if(j.site&&typeof j.site==='object') S.site=j.site;
      apply(); tick(); latest(); welcome();
    }).catch(function(){welcome()});
  } else welcome();

  // Videos load only when asked for. Some streams can't be shown outside YouTube
  // (a music rights holder blocks it); when YouTube reports that, offer the video on YouTube instead.
  function blocked(box,f,look){
    f.remove();
    var page=box.getAttribute('data-page'), v=d.createElement('div');
    var t=box.getAttribute('data-thumb');
    v.className='poster blocked'; if(t) look='background-image:linear-gradient(rgba(11,39,51,.82),rgba(11,39,51,.82)),url('+t+');background-position:center';
    if(look) v.setAttribute('style',look);
    v.innerHTML='<b>This message plays on YouTube</b><p>YouTube doesn\u2019t allow this one to be shown on other websites, so it opens there instead.</p><span><a class="btn" target="_blank" rel="noopener noreferrer">Watch on YouTube</a></span>';
    v.querySelector('a').href=page; box.appendChild(v);
  }
  $$('[data-yt]').forEach(function(box){
    var btn=$('.poster',box); if(!btn) return;
    btn.addEventListener('click',function(){
      if(location.protocol==='file:'){window.open(box.getAttribute('data-page'),'_blank','noopener');return}
      var src=box.getAttribute('data-yt'), look=btn.getAttribute('style');
      src+=(src.indexOf('?')<0?'?':'&')+'enablejsapi=1&origin='+encodeURIComponent(location.origin);
      var f=d.createElement('iframe'); f.src=src; f.title=btn.getAttribute('aria-label')||'Video';
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy='strict-origin-when-cross-origin'; f.allowFullscreen=true;
      var tries=0, hello=function(){ if(!f.isConnected||tries++>12) return; try{f.contentWindow.postMessage('{"event":"listening","id":1,"channel":"widget"}','*')}catch(e){} setTimeout(hello,500) };
      f.addEventListener('load',hello);
      window.addEventListener('message',function on(e){
        if(!f.isConnected){window.removeEventListener('message',on);return}
        if(e.source!==f.contentWindow) return;
        var m; try{m=typeof e.data==='string'?JSON.parse(e.data):e.data}catch(x){return}
        if(m&&m.event==='onError'&&[100,101,150,153].indexOf(+m.info)>-1){window.removeEventListener('message',on);blocked(box,f,look)}
      });
      box.appendChild(f); btn.remove();
    });
  });

  // Contact form and LifeGroup sign-up: emailed to the pastor through FormSubmit (formsubmit.co)
  var TO='pastor@lifebridgeic.com';
  $$('form[data-form]').forEach(function(f){
    var err=$('.form-err',f), btn=$('button[type=submit]',f), label=btn.textContent, done=f.nextElementSibling;
    function fail(){
      btn.disabled=false; btn.textContent=label; err.hidden=false; err.textContent='That did not send. Please try again, or email us at ';
      var a=d.createElement('a'); a.href='mailto:'+TO; a.textContent=TO; err.appendChild(a); err.appendChild(d.createTextNode('.'));
    }
    f.addEventListener('submit',function(e){
      e.preventDefault(); err.hidden=true;
      if(!f.checkValidity()){f.reportValidity();return}
      var data={_subject:f.getAttribute('data-subject'),_template:'table',_captcha:'false'}, bot=false;
      [].forEach.call(f.elements,function(el){
        if(!el.name||((el.type==='radio'||el.type==='checkbox')&&!el.checked)) return;
        var v=String(el.value).trim(); if(el.name==='_honey'){bot=!!v;return}
        if(v) data[el.name]=v.slice(0,1000);
      });
      var ok=function(){f.hidden=true; done.hidden=false; done.setAttribute('tabindex','-1'); done.focus()};
      if(bot){ok();return}
      if(data.email) data._replyto=data.email;
      btn.disabled=true; btn.textContent='Sending\u2026';
      fetch('https://formsubmit.co/ajax/'+encodeURIComponent(TO),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json()}).then(function(j){ if(j&&String(j.success)==='true') ok(); else fail(); }).catch(fail);
    });
  });

  // Guide photos open larger
  var zs=$$('figure[data-zoom]');
  if(zs.length&&window.HTMLDialogElement){
    var dg=d.createElement('dialog'); dg.className='zoom'; dg.innerHTML='<img alt=""><p></p><button type="button">Close</button>';
    d.body.appendChild(dg);
    dg.addEventListener('click',function(e){ if(e.target===dg||e.target.tagName==='BUTTON') dg.close(); });
    zs.forEach(function(f){
      var im=$('img',f), cap=f.parentNode.querySelector('h3');
      f.setAttribute('tabindex','0'); f.setAttribute('role','button'); f.setAttribute('aria-label','See this photo larger: '+im.alt);
      var open=function(){ $('img',dg).src=im.currentSrc||im.src; $('img',dg).alt=im.alt; $('p',dg).textContent=cap?cap.textContent:''; dg.showModal(); };
      f.addEventListener('click',open);
      f.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();open()} });
    });
  }

  // Reviews: one at a time. A new one appears every 8 seconds; it waits while the pointer or keyboard
  // is on the section, and stops for good once the visitor uses the arrows.
  $$('[data-reviews]').forEach(function(box){
    var qs=$$('blockquote',box), i=0, timer=null, hold=false, taken=false, EVERY=8000;
    if(qs.length<2) return;
    var dots=$$('button[data-go]',box);
    function show(n){ qs[i].classList.remove('on'); i=(n+qs.length)%qs.length; qs[i].classList.add('on'); dots.forEach(function(x,k){x.classList.toggle('on',k===i)}); }
    function stop(){clearInterval(timer);timer=null}
    function start(){stop(); if(!hold&&!taken) timer=setInterval(function(){show(i+1)},EVERY)}
    $('.rev2-quotes',box).setAttribute('aria-live','polite');
    $$('button[data-d]',box).forEach(function(b){b.addEventListener('click',function(){taken=true;stop();show(i+ +b.getAttribute('data-d'))})});
    dots.forEach(function(b){b.addEventListener('click',function(){taken=true;stop();show(+b.getAttribute('data-go'))})});
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // arrows only, no automatic change
    box.addEventListener('mouseenter',function(){hold=true;stop()}); box.addEventListener('mouseleave',function(){hold=false;start()});
    box.addEventListener('focusin',function(){hold=true;stop()}); box.addEventListener('focusout',function(){hold=false;start()});
    d.addEventListener('visibilitychange',function(){if(d.hidden)stop();else start()});
    start();
  });

  // Copy account details
  $$('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var done=function(){b.textContent='Copied';b.classList.add('ok');setTimeout(function(){b.textContent='Copy';b.classList.remove('ok')},1800)};
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(b.getAttribute('data-copy')).then(done,done); else done();
    });
  });

  // Menu
  var dr=$('.drawer'), mb=$('.menu-btn');
  if(dr&&mb){
    var set=function(o){dr.classList.toggle('open',o);mb.setAttribute('aria-expanded',o);d.documentElement.style.overflow=o?'hidden':'';if(o)$('.close',dr).focus();else mb.focus()};
    mb.addEventListener('click',function(){set(true)});
    $$('a[href^="#"]',dr).forEach(function(a){a.addEventListener('click',function(){dr.classList.remove('open');mb.setAttribute('aria-expanded',false);d.documentElement.style.overflow=''})});
    $('.close',dr).addEventListener('click',function(){set(false)});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&dr.classList.contains('open'))set(false)});
  }

  // Mobile action bar appears once the first call to action has scrolled away
  var bar=$('.bar'), first=$('.hero .btn, .lost .btn');
  if(bar&&first&&'IntersectionObserver' in window){
    new IntersectionObserver(function(en){bar.classList.toggle('show',!en[0].isIntersecting&&en[0].boundingClientRect.top<0)}).observe(first);
  }
  // pick-a-topic panels
  $$('[data-tabs]').forEach(function(box){
    var b=$$('[data-t]',box), p=$$('[data-p]',box);
    var show=function(x){b.forEach(function(y){y.setAttribute('aria-selected',y===x)}); p.forEach(function(q){q.hidden=q.getAttribute('data-p')!==x.getAttribute('data-t')})};
    b.forEach(function(x){x.addEventListener('click',function(){show(x)})}); if(b[0]) show(b[0]); box.classList.add('on');
  });
  // the sign-up form asks only for what the ticked interests need
  $$('form[data-form]').forEach(function(f){
    var boxes=$$('.checks input',f); if(!boxes.length) return;
    var sync=function(){
      var on={}, any=false; boxes.forEach(function(b){on[b.getAttribute('data-pick')]=b.checked; if(b.checked) any=true});
      boxes[0].setCustomValidity(any?'':'Tick at least one.');
      $$('[data-if]',f).forEach(function(w){var show=!!on[w.getAttribute('data-if')]; w.hidden=!show; $$('input,textarea',w).forEach(function(i){i.disabled=!show})});
      $$('[data-req-if]',f).forEach(function(i){i.required=!!on[i.getAttribute('data-req-if')]});
      $$('[data-opt-unless]',f).forEach(function(o){o.hidden=!!on[o.getAttribute('data-opt-unless')]});
    };
    boxes.forEach(function(b){b.addEventListener('change',sync)}); f._sync=sync; sync();
  });
  // a button that jumps to the form ticks its own box on the way
  $$('a[data-pick]').forEach(function(a){a.addEventListener('click',function(){
    var c=$('input[data-pick="'+a.getAttribute('data-pick')+'"]'); if(c){c.checked=true; if(c.form&&c.form._sync) c.form._sync()}
  })});
})();
