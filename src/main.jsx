
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Menu, Play, Star, ChevronRight, Bookmark, X, Sparkles, Tv, CalendarDays, ShieldCheck, Plus, Trash2, RefreshCw, Download, ExternalLink } from 'lucide-react';
import './style.css';

const seed = [
 ['Naruto','Action',2002,'8.3',220,'A young ninja works toward his dream of becoming the strongest leader of his village.'],
 ['One Piece','Adventure',1999,'9.0',1000,'A spirited pirate crew sails across the seas in search of the legendary One Piece treasure.'],
 ['Demon Slayer: Kimetsu no Yaiba','Action',2019,'8.5',63,'A young swordsman joins a corps of demon hunters after tragedy strikes his family.'],
 ['Jujutsu Kaisen','Supernatural',2020,'8.6',47,'A student is drawn into a hidden world of curses and extraordinary sorcerers.'],
 ['Solo Leveling','Fantasy',2024,'8.7',25,'The weakest hunter begins an extraordinary journey after receiving a mysterious power.'],
 ['Attack on Titan','Action',2013,'8.6',89,'Humanity fights for survival behind enormous walls in a world of terrifying mysteries.'],
 ['Bleach','Action',2004,'8.2',366,'A teenager gains the powers of a Soul Reaper and protects people from dangerous spirits.'],
 ['Black Clover','Fantasy',2017,'8.1',170,'A boy without magic refuses to give up on his dream of becoming the Wizard King.'],
 ['Blue Lock','Sports',2022,'8.1',38,'Young footballers compete in an intense programme designed to create the ultimate striker.'],
 ['My Hero Academia','Action',2016,'7.9',159,'A boy born without powers pursues his dream of becoming a hero.'],
 ['Spy x Family','Comedy',2022,'8.5',37,'A spy, an assassin and a telepath form an unusual family while hiding their secrets.'],
 ['Chainsaw Man','Action',2022,'8.4',12,'A young devil hunter gets a new chance at life after an unexpected transformation.'],
 ['Haikyu!!','Sports',2014,'8.4',85,'A determined volleyball player chases his dream of reaching the top of the court.'],
 ['Fullmetal Alchemist: Brotherhood','Fantasy',2009,'9.1',64,'Two brothers search for a way to restore what they lost through alchemy.'],
 ['Death Note','Mystery',2006,'8.6',37,'A gifted student discovers a mysterious notebook that changes his life.'],
 ['Tokyo Revengers','Drama',2021,'7.8',50,'A young man gets a chance to revisit the past and change the future.'],
 ['Dr. Stone','Adventure',2019,'8.1',57,'A science-minded teenager works to rebuild civilisation after a mysterious event.'],
 ['Mob Psycho 100','Supernatural',2016,'8.5',37,'A quiet middle-schooler with powerful psychic abilities tries to live an ordinary life.'],
 ['Frieren: Beyond Journey’s End','Fantasy',2023,'9.3',28,'An elven mage reflects on friendship, time and the meaning of life after a great adventure.'],
 ['Your Name','Romance',2016,'8.8',1,'Two teenagers discover a mysterious connection that crosses distance and time.']
].map((x,i)=>({mal_id:'seed-'+i,title:x[0],genre:x[1],year:x[2],score:x[3],episodes:x[4],synopsis:x[5],images:{jpg:{large_image_url:`https://placehold.co/420x600/0b1930/45b7ff?text=${encodeURIComponent(x[0])}`}},status:'Catalogue entry',source:'AnimeVault catalogue'}));

const genres=['All','Action','Adventure','Comedy','Drama','Fantasy','Mystery','Romance','Sports','Supernatural'];
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}};
function App(){
 const [items,setItems]=useState(()=>read('av_custom',seed));
 const [query,setQuery]=useState(''); const [genre,setGenre]=useState('All');
 const [selected,setSelected]=useState(null); const [saved,setSaved]=useState(()=>read('av_saved',[]));
 const [tab,setTab]=useState('Home'); const [menu,setMenu]=useState(false);
 const [loading,setLoading]=useState(false); const [notice,setNotice]=useState('');
 const [admin,setAdmin]=useState(false); const [form,setForm]=useState({title:'',genre:'Action',year:'2026',synopsis:'',poster:''});
 const [apiMode,setApiMode]=useState(false);

 useEffect(()=>{localStorage.setItem('av_saved',JSON.stringify(saved))},[saved]);
 useEffect(()=>{localStorage.setItem('av_custom',JSON.stringify(items))},[items]);
 const filtered=useMemo(()=>items.filter(a=>(genre==='All'||a.genre===genre)&&a.title.toLowerCase().includes(query.toLowerCase())&&(tab!=='My List'||saved.includes(a.mal_id))),[items,genre,query,tab,saved]);
 const scrollTo=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
 const toggleSave=id=>setSaved(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 async function loadOnline(){
  setLoading(true);setNotice('');
  try{
   const r=await fetch('https://api.jikan.moe/v4/top/anime?limit=25');
   if(!r.ok) throw new Error('Anime catalogue service is temporarily unavailable.');
   const j=await r.json();
   const online=j.data.map(a=>({mal_id:a.mal_id,title:a.title,genre:a.genres?.[0]?.name||'Other',year:a.year||a.aired?.prop?.from?.year||'—',score:a.score||'N/A',episodes:a.episodes||'—',synopsis:a.synopsis||'No synopsis available.',images:a.images,status:a.status||'Catalogue listing',source:'MyAnimeList catalogue'}));
   setItems(prev=>{const custom=prev.filter(x=>String(x.mal_id).startsWith('custom-'));return [...custom,...online]});
   setApiMode(true);setNotice('Online anime catalogue loaded. Posters and details are provided by the public Jikan catalogue API.');
  }catch(e){setNotice('Could not load the online catalogue right now. Your built-in collection is still available. Check your internet connection and try again.')}
  finally{setLoading(false)}
 }
 function addAnime(e){
  e.preventDefault(); if(!form.title.trim())return;
  const entry={mal_id:'custom-'+Date.now(),title:form.title.trim(),genre:form.genre,year:form.year||'—',score:'—',episodes:'—',synopsis:form.synopsis||'Description coming soon.',images:{jpg:{large_image_url:form.poster||`https://placehold.co/420x600/0b1930/45b7ff?text=${encodeURIComponent(form.title)}`}},status:'Added by admin',source:'Admin entry'};
  setItems(prev=>[entry,...prev]);setForm({title:'',genre:'Action',year:'2026',synopsis:'',poster:''});setNotice('Anime added to this browser’s local catalogue.');setAdmin(false);
 }
 function removeAnime(id){if(!String(id).startsWith('custom-'))return;setItems(prev=>prev.filter(a=>a.mal_id!==id));setSaved(prev=>prev.filter(x=>x!==id))}
 const imageFor=a=>a.images?.jpg?.large_image_url||a.images?.jpg?.image_url||'https://placehold.co/420x600/0b1930/45b7ff?text=Anime';
 return <div className="app">
  <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">A<span>V</span></span><span>ANIME<span className="blue">VAULT</span><small>YOUR ANIME UNIVERSE</small></span></a>
   <nav className={menu?'nav open':'nav'}>{['Home','Explore','Genres','My List'].map(x=><button className={tab===x?'nav-link active':'nav-link'} onClick={()=>{setTab(x);setMenu(false);scrollTo(x==='Home'?'top':x==='Genres'?'genres':'library')}} key={x}>{x}</button>)}</nav>
   <div className="top-actions"><label className="searchbox"><Search size={17}/><input value={query} onChange={e=>{setQuery(e.target.value);scrollTo('library')}} placeholder="Search anime..."/></label><button className="icon-btn mobile-menu" onClick={()=>setMenu(!menu)} aria-label="Menu">{menu?<X/>:<Menu/>}</button></div>
  </header>
  <main id="top">
   <section className="hero"><div className="hero-bg"></div><div className="hero-content"><div className="eyebrow"><span className="pulse"></span> THE ULTIMATE ANIME DESTINATION</div><h1>YOUR NEXT<br/><span>OBSESSION</span><br/>STARTS HERE.</h1><p>Discover legendary stories, unforgettable characters and worlds waiting to be explored.</p><div className="hero-buttons"><button className="primary-btn" onClick={()=>scrollTo('library')}><Sparkles size={17}/> Explore Anime</button><button className="ghost-btn" onClick={()=>scrollTo('genres')}>Browse Genres <ChevronRight size={17}/></button></div><div className="hero-stats"><div><b>{items.length.toString().padStart(2,'0')}</b><span>CATALOGUE TITLES</span></div><i></i><div><b>∞</b><span>WORLDS TO EXPLORE</span></div><i></i><div><b>24/7</b><span>ANIME VIBES</span></div></div></div><div className="hero-side"><div className="vertical-label">DISCOVER · WATCH · REPEAT</div><div className="hero-card"><span>EDITOR'S PICK</span><strong>THE ANIME<br/>UNIVERSE</strong><small>CURATED FOR YOU</small></div></div><div className="hero-bottom">SCROLL TO EXPLORE <span>↓</span></div></section>
   <section className="ticker"><div>✦ FIND YOUR NEXT FAVOURITE <b>✦</b> EXPLORE NEW WORLDS <b>✦</b> CELEBRATE ANIME <b>✦</b> FIND YOUR NEXT FAVOURITE <b>✦</b></div></section>
   <section className="section" id="genres"><div className="section-head"><div><div className="eyebrow">FIND YOUR VIBE</div><h2>Explore by <span>Genre</span></h2></div><p>Every mood has an anime.<br/>Find the story that speaks to you.</p></div><div className="genre-row">{genres.map((g,i)=><button key={g} className={'genre-chip '+(genre===g?'chosen':'')} onClick={()=>{setGenre(g);setTab('Explore');scrollTo('library')}}><span>{['✦','⚔','🧭','☻','◈','✧','⌕','♡','球','☯'][i]}</span>{g}</button>)}</div></section>
   <section className="section library" id="library"><div className="section-head"><div><div className="eyebrow">THE VAULT IS OPEN</div><h2>{tab==='My List'?'Your':query?'Search Results':genre==='All'?'Discover Anime':genre+' Anime'} <span>{tab==='My List'?'Watchlist':'Library'}</span></h2></div><div className="result-count">{filtered.length.toString().padStart(2,'0')} TITLES <span>AVAILABLE</span></div></div>
    <div className="toolbar"><button className="ghost-btn small" onClick={loadOnline} disabled={loading}><RefreshCw size={15} className={loading?'spin':''}/>{loading?'Loading catalogue...':'Load online anime catalogue'}</button><button className="ghost-btn small" onClick={()=>setAdmin(true)}><Plus size={15}/> Admin: Add anime</button></div>
    {notice&&<div className="notice">{notice}</div>}
    <div className="anime-grid">{filtered.map(a=><article className="anime-card" key={a.mal_id}><div className="poster" style={{backgroundImage:`linear-gradient(180deg,transparent 20%,rgba(4,8,16,.96) 100%),url("${imageFor(a)}")`}}><span className="tag">{a.source==='Admin entry'?'ADMIN ADDED':a.score!=='N/A'?'CATALOGUE':'FEATURED'}</span><button className={'save-btn '+(saved.includes(a.mal_id)?'saved':'')} onClick={()=>toggleSave(a.mal_id)} aria-label="Save anime"><Bookmark size={17} fill={saved.includes(a.mal_id)?'currentColor':'none'}/></button><button className="play-btn" onClick={()=>setSelected(a)} aria-label={'View '+a.title}><Play size={20} fill="currentColor"/></button><div className="poster-info"><span>{String(a.genre).toUpperCase()} · {a.year}</span><h3>{a.title}</h3></div></div><div className="card-meta"><span><Star size={13} fill="currentColor"/> {a.score||'—'}</span><span><Tv size={13}/> {a.episodes||'—'} eps</span><button onClick={()=>setSelected(a)}>Details <ChevronRight size={14}/></button></div></article>)}</div>
    {filtered.length===0&&<div className="empty"><Search size={30}/><h3>{tab==='My List'?'Your list is empty':'No anime found'}</h3><p>{tab==='My List'?'Save anime with the bookmark icon to see them here.':'Try another title or choose a different genre.'}</p><button className="ghost-btn" onClick={()=>{setQuery('');setGenre('All');setTab('Explore')}}>Clear filters</button></div>}
   </section>
   <section className="cta"><div className="cta-icon"><Sparkles size={25}/></div><div><div className="eyebrow">YOUR WATCHLIST, YOUR WORLD</div><h2>Keep your favourites <span>close.</span></h2><p>Save titles to your list. Your list is stored in this browser.</p></div><button className="primary-btn" onClick={()=>{setTab('My List');setQuery('');scrollTo('library')}}>My Watchlist <ChevronRight size={17}/></button></section>
  </main>
  <footer><a className="brand" href="#top"><span className="brand-mark">A<span>V</span></span><span>ANIME<span className="blue">VAULT</span><small>YOUR ANIME UNIVERSE</small></span></a><p>Discover stories. Explore worlds. Love anime.</p><span className="copyright">© 2026 ANIMEVAULT · CATALOGUE DEMO</span></footer>
  {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="detail-modal" onClick={e=>e.stopPropagation()}><button className="close-modal" onClick={()=>setSelected(null)}><X/></button><div className="modal-art" style={{backgroundImage:`linear-gradient(90deg,#080d18 0%,transparent 100%),url("${imageFor(selected)}")`}}></div><div className="modal-content"><div className="eyebrow">{selected.status} · {selected.year}</div><h2>{selected.title}</h2><div className="modal-meta"><span><Star size={14} fill="currentColor"/> {selected.score||'—'}</span><span>{selected.genre}</span><span>{selected.episodes||'—'} episodes</span></div><p>{selected.synopsis}</p><div className="episode-box"><b><ShieldCheck size={16}/> EPISODE & DOWNLOAD INFORMATION</b><p>AnimeVault displays catalogue information. Episode downloads can only be linked when the publisher or rights holder authorises distribution. No unauthorised episode files are hosted here.</p><button className="primary-btn" onClick={()=>toggleSave(selected.mal_id)}><Bookmark size={16}/> {saved.includes(selected.mal_id)?'Saved to My List':'Add to My List'}</button></div></div></div></div>}
  {admin&&<div className="modal-backdrop" onClick={()=>setAdmin(false)}><div className="admin-modal" onClick={e=>e.stopPropagation()}><button className="close-modal" onClick={()=>setAdmin(false)}><X/></button><div className="eyebrow">ANIMEVAULT MANAGEMENT</div><h2>Add an anime</h2><p className="admin-note">This simple demo saves entries in this browser only. It is not a secure public admin system.</p><form onSubmit={addAnime}><label>Anime title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Naruto"/></label><label>Genre<select value={form.genre} onChange={e=>setForm({...form,genre:e.target.value})}>{genres.filter(g=>g!=='All').map(g=><option key={g}>{g}</option>)}</select></label><label>Release year<input value={form.year} onChange={e=>setForm({...form,year:e.target.value})} placeholder="2026"/></label><label>Poster image URL (optional)<input value={form.poster} onChange={e=>setForm({...form,poster:e.target.value})} placeholder="https://..."/></label><label>Description<textarea value={form.synopsis} onChange={e=>setForm({...form,synopsis:e.target.value})} placeholder="Short anime description"/></label><button className="primary-btn" type="submit"><Plus size={16}/> Add to catalogue</button></form><div className="admin-list"><h3>Your admin-added titles</h3>{items.filter(a=>String(a.mal_id).startsWith('custom-')).map(a=><div key={a.mal_id}><span>{a.title}</span><button onClick={()=>removeAnime(a.mal_id)} aria-label={'Remove '+a.title}><Trash2 size={15}/></button></div>)}</div></div></div>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
