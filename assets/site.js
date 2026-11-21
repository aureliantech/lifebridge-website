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

  // Settings the pastor publishes from /admin: the latest message, and any Sundays with no service
  var S={latestMessage:'',closed:[]};
  var LEN=90*60000, DAY=86400000;
  var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function z(n){return (n<10?'0':'')+n}
  // Panama is UTC-5 all year, so Sunday 10:00 AM is always 15:00 UTC.
  function pan(t){return new Date(t.getTime()-5*3600000)}
  function ymd(t){var p=pan(t);return p.getUTCFullYear()+'-'+z(p.getUTCMonth()+1)+'-'+z(p.getUTCDate())}
  function closed(t){return S.closed.indexOf(ymd(t))>-1}
  function firstSunday(now){
    var t=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),15,0,0));
    t.setUTCDate(t.getUTCDate()+((7-t.getUTCDay())%7));
    if(now-t>=LEN) t.setUTCDate(t.getUTCDate()+7);
    return t;
  }
  function nextOpen(from){var t=from,i=0;while(closed(t)&&i++<52)t=new Date(t.getTime()+7*DAY);return t}
  function away(ms){
    if(ms<=0) return 'happening now';
    var m=Math.round(ms/60000), h=Math.floor(m/60), dd=Math.floor(h/24);
    if(dd>=2) return 'in '+dd+' days';
    if(dd===1) return 'in 1 day, '+(h-24)+' hr';
    if(h>=1) return 'in '+h+' hr '+(m%60)+' min';
    return 'in '+Math.max(m,1)+' min';
  }
  function long(t){var p=pan(t);return MON[p.getUTCMonth()]+' '+p.getUTCDate()}
  function tick(){
    var now=new Date(), first=firstSunday(now), s=nextOpen(first);
    $$('[data-count]').forEach(function(e){e.textContent=away(s-now)});
    $$('[data-date]').forEach(function(e){e.textContent='Sunday, '+long(s)});
    $$('[data-skip]').forEach(function(e){
      var off=closed(first); e.hidden=!off; e.textContent=off?'No service Sunday, '+long(first)+'.':'';
      e.parentNode.classList.toggle('has-skip',off);
    });
    $$('[data-weeks]').forEach(function(box){
      $$('li',box).forEach(function(li,i){
        var t=new Date(first.getTime()+i*7*DAY), p=pan(t), off=closed(t);
        $('.mo',li).textContent=MO[p.getUTCMonth()]; $('.day',li).textContent=p.getUTCDate();
        $('.at',li).textContent=off?'No service':'10:00 AM';
        li.className=off?'off':(t.getTime()===s.getTime()?'next':'');
      });
    });
  }
  function videoId(u){var m=/(?:youtu\.be\/|[?&]v=|\/(?:embed|live|shorts)\/)([\w-]{11})/.exec(u||'');return m?m[1]:''}
  function latest(){
    var id=videoId(S.latestMessage); if(!id) return;
    $$('[data-latest]').forEach(function(box){
      box.setAttribute('data-yt','https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1');
      box.setAttribute('data-page','https://www.youtube.com/watch?v='+id);
    });
  }
  tick(); setInterval(tick,30000);
  var me=d.currentScript&&d.currentScript.src;
  if(me&&window.fetch&&location.protocol!=='file:'){
    fetch(me.replace(/assets\/site\.js.*$/,'settings.json'),{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
      if(!j) return;
      if(typeof j.latestMessage==='string') S.latestMessage=j.latestMessage;
      if(Array.isArray(j.closed)) S.closed=j.closed;
      tick(); latest();
    }).catch(function(){});
  }

  // Videos load only when asked for
  $$('[data-yt]').forEach(function(box){
    var btn=$('.poster',box); if(!btn) return;
    btn.addEventListener('click',function(){
      if(location.protocol==='file:'){window.open(box.getAttribute('data-page'),'_blank','noopener');return}
      var f=d.createElement('iframe'); f.src=box.getAttribute('data-yt'); f.title=btn.getAttribute('aria-label')||'Video';
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy='strict-origin-when-cross-origin'; f.allowFullscreen=true; box.appendChild(f); btn.remove();
    });
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
    $('.close',dr).addEventListener('click',function(){set(false)});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&dr.classList.contains('open'))set(false)});
  }

  // Mobile action bar appears once the first call to action has scrolled away
  var bar=$('.bar'), first=$('.hero .btn, .lost .btn');
  if(bar&&first&&'IntersectionObserver' in window){
    new IntersectionObserver(function(en){bar.classList.toggle('show',!en[0].isIntersecting&&en[0].boundingClientRect.top<0)}).observe(first);
  }

  // The one flourish: the elevator arrives at 2
  var lamp=$('.lamp[data-arrive]');
  if(lamp&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var seq=['L','1','2'], i=0; lamp.classList.add('off'); lamp.textContent=seq[0];
    var go=function(){i++; lamp.textContent=seq[i]; if(i<2) setTimeout(go,520); else lamp.classList.remove('off')};
    setTimeout(go,700);
  }
})();
