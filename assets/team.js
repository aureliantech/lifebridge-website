/* LifeBridge team pages: who is signed in and who is on the list. */
(function(w){
  var PK='lifebridge-team-people', MK='lifebridge-team-me';
  function people(){
    var p=[{name:'Nate Korpi',email:'pastor@lifebridgeic.com',role:'admin'}];
    try{var j=JSON.parse(localStorage.getItem(PK)||'null'); if(Array.isArray(j)&&j.length&&j.every(function(x){return x&&typeof x.name==='string'&&typeof x.email==='string'})&&j.some(function(x){return x.role==='admin'})) p=j.slice(0,100)}catch(e){}
    return p;
  }
  function find(e){e=String(e||'').trim().toLowerCase();return people().filter(function(p){return p.email===e})[0]||null}
  function me(){var e='';try{e=localStorage.getItem(MK)||''}catch(x){}return e?find(e):null}
  var VK='lifebridge-team-tasks';
  function tasks(){var o={};try{var j=JSON.parse(localStorage.getItem(VK)||'null'); if(j&&typeof j==='object') Object.keys(j).forEach(function(k){if(/^vol\.[\w.]+$/.test(k)&&typeof j[k]==='string') o[k]=j[k].slice(0,500)})}catch(e){} return o}
  w.Team={
    tasks:tasks, saveTasks:function(o){try{localStorage.setItem(VK,JSON.stringify(o))}catch(e){}},
    people:people, find:find, me:me,
    save:function(p){try{localStorage.setItem(PK,JSON.stringify(p))}catch(e){}},
    signIn:function(e){try{localStorage.setItem(MK,String(e).trim().toLowerCase())}catch(x){}},
    signOut:function(home){try{localStorage.removeItem(MK)}catch(x){} location.href=home},
    first:function(p){return p?p.name.split(' ')[0]:''},
    // Sends anyone who is not signed in (or not an admin, where that is needed) back to the team page.
    guard:function(home,admin){var m=me(); if(!m){location.replace(home);return null} if(admin&&m.role!=='admin'){location.replace(home);return null} return m},
    head:function(m,home){var a=document.getElementById('me'),o=document.getElementById('out'); if(a){a.textContent=m.email;a.hidden=false} if(o){o.hidden=false;o.addEventListener('click',function(){w.Team.signOut(home)})}
      [].forEach.call(document.querySelectorAll('[data-admin]'),function(x){x.hidden=m.role!=='admin'})}
  };
})(window);
