// Bookmarks, reading history and Back up / Restore, shared by the PBP and Kirtan readers.
// Kept in this browser only (localStorage). Both sites share one origin, so every key carries
// the reader's prefix. Every change re-reads storage first, so an old tab left open can't save
// its stale list over newer bookmarks.
//   o.prefix   'pbp' | 'kirtan'           o.app, o.version, o.title   backup file labels
//   o.id(v)    a clean bookmark id, or null      o.hist(x)  a clean history entry, or null
//   o.histKey  history keeps one entry per this field
//   o.describe(id)  extra fields written into the backup beside each bookmark
//   o.changed(otherTab)  the bookmark list changed (here, or in another tab)
function savedStore(o){
  const BK=o.prefix+'.bookmarks.v1', HIST=o.prefix+'.history.v1', BKUP=o.prefix+'.backup.v1';
  const S={ok:true, list:[]};
  S.read=k=>{
    try{ const v=JSON.parse(localStorage.getItem(k)||'[]'); S.ok=true; return Array.isArray(v)?v:[] }
    catch(e){ S.ok=false; return k===BK?S.list:[] }
  };
  const write=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); return true }catch(e){ return false } };
  S.edit=fn=>{ S.list=S.read(BK); fn(S.list); S.ok=write(BK,S.list); o.changed(false) };
  S.reload=()=>(S.list=S.read(BK));
  S.has=id=>S.list.some(x=>x.id===id);
  S.toggle=id=>{
    S.edit(l=>{ const i=l.findIndex(x=>x.id===id); if(i>=0) l.splice(i,1); else l.push({id, t:Date.now(), note:''}) });
    if(S.has(id)) try{ navigator.storage.persist() }catch(e){}   // ask the browser not to clear us (harmless if refused)
  };
  S.setNote=(id,note)=>S.edit(l=>{ const x=l.find(y=>y.id===id); if(x) x.note=note });
  S.remove=id=>S.edit(l=>{ const i=l.findIndex(y=>y.id===id); if(i>=0) l.splice(i,1) });
  // newest first, one entry per histKey
  const saveHist=l=>write(HIST,l.sort((a,b)=>b.t-a.t).slice(0,30));
  S.history=()=>S.read(HIST);
  S.addHistory=e=>saveHist([e,...S.read(HIST).filter(x=>x[o.histKey]!==e[o.histKey])]);
  S.lastBackup=()=>{ try{ return +localStorage.getItem(BKUP)||0 }catch(e){ return 0 } };
  addEventListener('storage',e=>{ if(e.key===BK){ S.list=S.read(BK); o.changed(true) } });

  // Back up: the share sheet on phones (save to Files / iCloud / Notes), a download elsewhere.
  // Resolves true once saved, false if the person cancelled.
  S.backup=async()=>{
    S.list=S.read(BK);
    const out={app:o.app, version:o.version, exported:new Date().toISOString(),
      bookmarks:S.list.map(x=>Object.assign({id:x.id, t:x.t, note:x.note||''}, o.describe(x.id))),
      history:S.read(HIST)};
    const name=o.prefix+'-bookmarks-'+new Date().toISOString().slice(0,10)+'.json';
    const file=new File([JSON.stringify(out,null,1)],name,{type:'application/json'});
    const done=()=>{ try{ localStorage.setItem(BKUP,String(Date.now())) }catch(e){} return true };
    if(navigator.canShare&&navigator.canShare({files:[file]}))
      try{ await navigator.share({files:[file],title:o.title}); return done() }
      catch(e){ if(e.name==='AbortError') return false }   // cancelled; anything else falls back to download
    const a=document.createElement('a'); a.href=URL.createObjectURL(file); a.download=name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    return done();
  };
  // Restore merges a backup into what's here (never deletes). Returns a message to show.
  S.restore=text=>{
    let arr, hist=[];
    try{ const d=JSON.parse(text); arr=Array.isArray(d)?d:d.bookmarks; if(!Array.isArray(arr)) throw 0;
         if(Array.isArray(d.history)) hist=d.history }
    catch(e){ return 'That file doesn’t look like a bookmarks backup.' }
    let added=0;
    S.edit(l=>arr.forEach(x=>{
      const id=x&&o.id(x.id); if(!id) return;
      const have=l.find(y=>y.id===id);
      if(!have){ l.push({id, t:+x.t||Date.now(), note:String(x.note||'')}); added++ }
      else if(!have.note&&x.note) have.note=String(x.note);
    }));
    const by={};   // history: keep the newest entry per key from either side
    [...S.read(HIST),...hist].map(o.hist).forEach(x=>{ if(x&&!(by[x[o.histKey]]&&by[x[o.histKey]].t>=x.t)) by[x[o.histKey]]=x });
    saveHist(Object.values(by));
    return added+' bookmark'+(added==1?'':'s')+' added'+(arr.length>added?' ('+(arr.length-added)+' already here)':'')+'.';
  };
  S.list=S.read(BK);
  return S;
}
