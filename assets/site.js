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

  // Next service. Panama is UTC-5 all year, so Sunday 10:00 AM is always 15:00 UTC.
  var LEN=90*60000;
  function nextService(now){
    var t=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),15,0,0));
    t.setUTCDate(t.getUTCDate()+((7-t.getUTCDay())%7));
    if(now-t>=LEN) t.setUTCDate(t.getUTCDate()+7);
    return t;
  }
  function away(ms){
    if(ms<=0) return 'happening now';
    var m=Math.round(ms/60000), h=Math.floor(m/60), dd=Math.floor(h/24);
    if(dd>=2) return 'in '+dd+' days';
    if(dd===1) return 'in 1 day, '+(h-24)+' hr';
    if(h>=1) return 'in '+h+' hr '+(m%60)+' min';
    return 'in '+Math.max(m,1)+' min';
  }
  var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function tick(){
    var now=new Date(), s=nextService(now), txt=away(s-now);
    // date as it reads in Panama
    var p=new Date(s.getTime()-5*3600000), date=MON[p.getUTCMonth()]+' '+p.getUTCDate();
    $$('[data-count]').forEach(function(e){e.textContent=txt});
    $$('[data-date]').forEach(function(e){e.textContent='Sunday, '+date});
    $$('[data-live]').forEach(function(e){e.hidden=!(s-now<=0)});
  }
  tick(); setInterval(tick,30000);

  // Add this Sunday to a calendar
  function z(n){return (n<10?'0':'')+n}
  function stamp(t){return t.getUTCFullYear()+z(t.getUTCMonth()+1)+z(t.getUTCDate())+'T'+z(t.getUTCHours())+z(t.getUTCMinutes())+'00Z'}
  $$('[data-ics]').forEach(function(b){
    b.addEventListener('click',function(){
      var s=nextService(new Date()), e=new Date(s.getTime()+LEN);
      var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LifeBridge International Church//EN','BEGIN:VEVENT',
        'UID:'+stamp(s)+'@lifebridgeic.com','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(s),'DTEND:'+stamp(e),
        'SUMMARY:Sunday at LifeBridge','LOCATION:World Trade Center\\, Floor 2\\, Calle 53 Este\\, Marbella\\, Panama City',
        'DESCRIPTION:Service starts at 10:00 AM\\, about 90 minutes\\, entirely in English. Take the lobby elevator to Floor 2. Directions: https://maps.app.goo.gl/PTKHtnqcWMbLNssR7',
        'URL:https://lifebridgeic.com/visit','END:VEVENT','END:VCALENDAR'].join('\r\n');
      var a=d.createElement('a'); a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
      a.download='lifebridge-sunday.ics'; d.body.appendChild(a); a.click(); a.remove();
      var was=b.textContent; b.textContent='Added — check your downloads'; setTimeout(function(){b.textContent=was},2600);
    });
  });

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
