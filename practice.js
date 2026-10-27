/* Cuentilo P9 — reusable, data-driven practice engine; independent of Vocab SRS. */
(function(){'use strict';
 const BANK=window.CUENTILO_PRACTICE_BANK;
 const KEY='cuentilo-practice-p9-v1',MAX_RECORDS=500;
 const GROUPS=[{id:'choice',title:'Erkennen',subtitle:'Die richtige Antwort finden',symbol:'◉'},
   {id:'form',title:'Formenwerkstatt',subtitle:'Wortformen zusammensetzen',symbol:'◈'},
   {id:'build',title:'Satzwerkstatt',subtitle:'Sätze selbst bauen',symbol:'▧'}];
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const all=BANK?.questions||[];
 let group='choice',position=0,root=null,inited=false;
 const draft=new Map();
 function blank(){return {selected:null,built:[],attempts:0,hint:false,solution:false,hintUsed:false,solutionViewed:false,correct:false,result:null}}
 function validateBank(){
  if(BANK?.schema!==1||typeof BANK.bankId!=='string'||!Array.isArray(all)||!all.length)throw Error('Ungültiger Übungskatalog');
  const ids=new Set();
  for(const q of all){
   if(!q.id||ids.has(q.id)||!GROUPS.some(g=>g.id===q.type)||!q.prompt||!q.explanation||!q.hint||!Array.isArray(q.skills)||!q.skills.length||!q.topic||!q.goal)throw Error('Ungültige Übung: '+q.id);
   ids.add(q.id);
   if(q.type==='choice'||q.type==='form'){
    const options=q.choices||[],unique=new Set(options.map(o=>o.id));
    if(options.length<2||unique.size!==options.length||!unique.has(q.correct)||options.some(o=>!o.text))throw Error('Ungültige Auswahl: '+q.id);
   }
   if(q.type==='form'&&(!q.stem||!q.prefix||typeof q.suffix!=='string'))throw Error('Ungültige Form: '+q.id);
   if(q.type==='build'){
    const ts=q.tokens||[],tokens=new Set(ts.map(t=>t.id));
    if(ts.length<2||tokens.size!==ts.length||ts.some(t=>!t.text)||!q.acceptedOrders?.length||q.acceptedOrders.some(a=>a.length!==ts.length||new Set(a).size!==ts.length||a.some(k=>!tokens.has(k))))throw Error('Ungültiger Satz: '+q.id);
   }
  }
  return true;
 }
 validateBank();
 // Keep cumulative task state even when the bounded event log rolls over. Unknown
 // stable IDs are retained so newer lesson banks and old backups can coexist.
 const goodId=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9._-]{2,100}$/.test(id);
 function emptyJournal(){return {schema:1,records:[],attemptedIds:[],solvedIds:[],firstTryIds:[],totalAttempts:0}}
 function cleanJournal(value){
  if(!value||value.schema!==1||!Array.isArray(value.records))return emptyJournal();
  const records=value.records.slice(-MAX_RECORDS).filter(r=>r&&goodId(r.questionId)&&typeof r.correct==='boolean'&&Number.isFinite(r.attempt)).map(r=>({
   questionId:r.questionId,correct:r.correct,attempt:Math.max(1,Math.min(1000,Math.floor(r.attempt))),
   hintUsed:!!r.hintUsed,solutionViewed:!!r.solutionViewed,firstTryUnassisted:!!r.firstTryUnassisted,
   at:typeof r.at==='string'?r.at.slice(0,35):'',type:GROUPS.some(g=>g.id===r.type)?r.type:'choice'
  }));
  const copyIds=k=>Array.isArray(value[k])?value[k].filter(goodId).slice(-10000):[];
  const attempted=new Set([...copyIds('attemptedIds'),...records.map(r=>r.questionId)]);
  const solved=new Set([...copyIds('solvedIds'),...records.filter(r=>r.correct).map(r=>r.questionId)]);
  const firstTry=new Set([...copyIds('firstTryIds'),...records.filter(r=>r.firstTryUnassisted).map(r=>r.questionId)]);
  const total=Number.isSafeInteger(value.totalAttempts)?Math.max(records.length,value.totalAttempts):records.length;
  return {schema:1,records,attemptedIds:[...attempted],solvedIds:[...solved],firstTryIds:[...firstTry],totalAttempts:total};
 }
 function loadJournal(){try{return cleanJournal(JSON.parse(localStorage.getItem(KEY)))}catch(_){return emptyJournal()}}
 let journal=loadJournal();
 function saveJournal(){try{localStorage.setItem(KEY,JSON.stringify(journal))}catch(e){console.warn('Cuentilo Übungsjournal konnte nicht gespeichert werden:',e.message)}}
 function exportState(){return JSON.parse(JSON.stringify(journal))}
 function restoreState(value){if(!value||value.schema!==1||!Array.isArray(value.records))return false;journal=cleanJournal(value);saveJournal();render();return true}
 function tasks(){return all.filter(q=>q.type===group)}
 function task(){return tasks()[position]}
 function state(q=task()){if(!draft.has(q.id))draft.set(q.id,blank());return draft.get(q.id)}
 function completedCount(){return all.filter(q=>journal.solvedIds.includes(q.id)).length}
 function cleanFirstCount(){return all.filter(q=>journal.firstTryIds.includes(q.id)).length}
 function answer(q,s){
  if(q.type==='build')return s.built.map(id=>q.tokens.find(t=>t.id===id)?.text||'').join(' ');
  if(q.type==='form')return q.stem+(q.choices.find(x=>x.id===s.selected)?.text||'');
  return q.choices.find(x=>x.id===s.selected)?.text||'';
 }
 function correctAnswer(q){
  if(q.type==='build')return q.acceptedOrders[0].map(id=>q.tokens.find(t=>t.id===id).text).join(' ');
  const c=q.choices.find(x=>x.id===q.correct);
  return q.type==='form'?q.stem+c.text:c.text;
 }
 function isCorrect(q,s){return q.type==='build'?q.acceptedOrders.some(a=>a.join('\u0000')===s.built.join('\u0000')):s.selected===q.correct}
 function canCheck(q,s){return q.type==='build'?s.built.length===q.tokens.length:!!s.selected}
 function resetResult(s){s.result=null;s.correct=false}
 function check(){const q=task(),s=state();if(!canCheck(q,s)||s.correct)return;
  s.attempts++;const right=isCorrect(q,s);const prior=journal.attemptedIds.includes(q.id);
  const firstTryUnassisted=right&&!prior&&s.attempts===1&&!s.hintUsed&&!s.solutionViewed;
  s.correct=right;s.result=right?'right':'wrong';
  journal.records.push({questionId:q.id,type:q.type,at:new Date().toISOString(),correct:right,attempt:s.attempts,hintUsed:s.hintUsed,solutionViewed:s.solutionViewed,firstTryUnassisted});
  journal.records=journal.records.slice(-MAX_RECORDS);
  journal.totalAttempts++;
  if(!prior)journal.attemptedIds.push(q.id);
  if(right&&!journal.solvedIds.includes(q.id))journal.solvedIds.push(q.id);
  if(firstTryUnassisted&&!journal.firstTryIds.includes(q.id))journal.firstTryIds.push(q.id);
  saveJournal();render();
 }
 function recordExternal(evt){
  if(!evt||!goodId(evt.id)||typeof evt.correct!=='boolean')return false;
  const prior=journal.attemptedIds.includes(evt.id),n=Math.max(1,Math.min(1000,Number(evt.attempt)||1));
  const firstTryUnassisted=evt.correct&&!prior&&n===1&&!evt.hintUsed&&!evt.solutionViewed;
  journal.records.push({questionId:evt.id,type:'form',at:new Date().toISOString(),correct:evt.correct,attempt:n,
    hintUsed:!!evt.hintUsed,solutionViewed:!!evt.solutionViewed,firstTryUnassisted});
  journal.records=journal.records.slice(-MAX_RECORDS);journal.totalAttempts++;
  if(!prior)journal.attemptedIds.push(evt.id);
  if(evt.correct&&!journal.solvedIds.includes(evt.id))journal.solvedIds.push(evt.id);
  if(firstTryUnassisted&&!journal.firstTryIds.includes(evt.id))journal.firstTryIds.push(evt.id);
  saveJournal();return true;
 }
 function indexFor(id){return tasks().findIndex(q=>q.id===id)}
 function render(){if(!root)root=$('practiceLabArea');if(!root)return;
  const q=task();if(!q)return;const s=state(q);
  const name=GROUPS.find(x=>x.id===group).title;
  const groups=GROUPS.map(g=>`<button type="button" class="p9-type ${group===g.id?'is-current':''}" data-p9-group="${g.id}" aria-pressed="${group===g.id}"><span>${g.symbol}</span><strong>${g.id==='form'?'Formen<wbr>werkstatt':g.title}</strong><small>${g.subtitle}</small></button>`).join('');
  const indicators=tasks().map((x,i)=>`<button type="button" class="p9-dot ${i===position?'is-current':''}" data-p9-index="${i}" aria-label="${name}: Beispiel ${i+1}" aria-current="${i===position?'step':'false'}">${i+1}</button>`).join('');
  let activity='';
  if(q.type==='choice'){
   activity=`${q.context?`<div class="p9-context" lang="es">${esc(q.context)}</div>`:''}${q.sentence?`<div class="p9-sentence" lang="es">${esc(q.sentence)}</div>`:''}<div class="p9-choices" role="group" aria-label="Antwortmöglichkeiten">${q.choices.map(c=>`<button type="button" data-p9-select="${esc(c.id)}" class="p9-option ${s.selected===c.id?'is-selected':''}" aria-pressed="${s.selected===c.id}" ${s.correct?'disabled':''}>${esc(c.text)}</button>`).join('')}</div>`;
  }else if(q.type==='form'){
   const ending=q.choices.find(c=>c.id===s.selected)?.text||'';
   activity=`<p class="p9-instruction">Wähle die Endung, damit das Wort zur Person passt.</p><div class="p9-form-display" lang="es"><span>${esc(q.prefix)}</span> <strong>${esc(q.stem)}<em>${ending?esc(ending):'···'}</em></strong> <span>${esc(q.suffix)}</span></div><div class="p9-choice-label">WÄHLE DIE ENDUNG</div><div class="p9-endings" role="group" aria-label="Verbendungen">${q.choices.map(c=>`<button type="button" data-p9-select="${esc(c.id)}" class="p9-ending ${s.selected===c.id?'is-selected':''}" aria-pressed="${s.selected===c.id}" ${s.correct?'disabled':''}>−${esc(c.text)}</button>`).join('')}</div>`;
  }else{
   const remaining=q.tokens.filter(t=>!s.built.includes(t.id));
   activity=`${q.context?`<div class="p9-translation">${esc(q.context)}</div>`:''}<div class="p9-build-zone" aria-label="Zusammengesetzter Satz">${s.built.length?s.built.map((id,i)=>{const t=q.tokens.find(x=>x.id===id);return `<button type="button" class="p9-built-chip" data-p9-remove="${i}" ${s.correct?'disabled':''}>${esc(t.text)} <span aria-hidden="true">×</span></button>`}).join(''):'<span class="p9-placeholder">Tippe die Bausteine in der richtigen Reihenfolge an …</span>'}</div><div class="p9-choice-label">SATZBAUSTEINE</div><div class="p9-wordbank">${remaining.map(t=>`<button type="button" class="p9-wordchip" data-p9-add="${esc(t.id)}" ${s.correct?'disabled':''}>${esc(t.text)}</button>`).join('')||'<span class="p9-placeholder">Alle Bausteine eingesetzt</span>'}</div><button type="button" data-p9-clear class="p9-reset" ${!s.built.length||s.correct?'disabled':''}>↺ Satz zurücksetzen</button>`;
  }
  const assistance=`<div class="p9-help-row"><button class="p9-help" type="button" data-p9-hint ${s.hint?'aria-expanded="true"':'aria-expanded="false"'}>✧ ${s.hint?'Hinweis ausblenden':'Hinweis anzeigen'}</button><button class="p9-help" type="button" data-p9-solution ${s.solution?'aria-expanded="true"':'aria-expanded="false"'}>◉ ${s.solution?'Lösung ausblenden':'Lösung anzeigen'}</button></div>${s.hint?`<div class="p9-support"><strong>Hinweis</strong><p>${esc(q.hint)}</p></div>`:''}${s.solution?`<div class="p9-support"><strong>Lösung</strong><p lang="es">${esc(correctAnswer(q))}</p></div>`:''}`;
  const feedback=s.result?`<div role="status" aria-live="polite" class="p9-feedback ${s.correct?'p9-success':'p9-try'}"><strong>${s.correct?'✓ ¡Muy bien!':'Noch nicht ganz.'}</strong><p>${s.correct?esc(q.explanation):'Überprüfe die Form oder Reihenfolge. Du kannst es erneut versuchen oder dir einen Hinweis ansehen.'}</p>${s.correct&&q.roles?.length?`<div class="p9-roles">${q.roles.map(r=>`<div><strong>${esc(r.text)}</strong><small>${esc(r.role)}</small></div>`).join('')}</div>`:''}</div>`:'';
  root.innerHTML=`<div class="p9-dashboard"><div><div class="eyebrow">ÜBUNGSLABOR · PROTOTYP</div><h2>Drei Wege zur Sprache.</h2><p>Probier unsere neuen interaktiven Aufgaben aus. Deine Antworten beeinflussen das Vocab-SRS nicht.</p></div><div class="p9-counter"><strong>${completedCount()} / ${all.length}</strong><small>Beispiele gelöst</small></div></div>
   <div class="p9-type-grid">${groups}</div>
   <div class="p9-exercise"><div class="p9-card-meta"><span>${esc(name)} · ${esc(q.level)}</span><span>${esc(q.skills.join(' · '))}</span></div><div class="p9-example-nav" aria-label="Beispiel auswählen">${indicators}</div><h3>${esc(q.prompt)}</h3>${activity}${assistance}${feedback}${q.lemma?`<button type="button" class="p9-help" data-p9-open-studio>◈ Dieses Verb in der Formenwerkstatt erforschen →</button>`:''}<div class="p9-actions"><button type="button" class="primary" data-p9-check ${!canCheck(q,s)||s.correct?'disabled':''}>Antwort prüfen</button><button type="button" class="secondary" data-p9-next>${position===tasks().length-1?'Nächster Aufgabentyp →':'Nächstes Beispiel →'}</button></div><p class="p9-note">Lernziel: ${esc(q.goal)} · ${s.attempts} Prüfversuch${s.attempts===1?'':'e'}. Hinweise und Lösungsaufrufe werden separat erfasst.</p></div>
   <div class="p9-footer"><strong>Dein Übungsjournal</strong><p>${journal.totalAttempts} Prüfversuche erfasst · ${cleanFirstCount()} Aufgaben im ersten Versuch ohne Hilfe gelöst. Das ist noch kein Kompetenzwert.</p></div>`;
 }
 function handle(e){const button=e.target.closest('button');if(!button||!root?.contains(button))return;
  const q=task(),s=state(q);
  if(button.hasAttribute('data-p9-open-studio')){window.CuentiloFormStudio?.open({source:'practice-lab',lemma:q.lemma},window.CuentiloNavigate);return}
  if(button.hasAttribute('data-p9-group')){group=button.dataset.p9Group;position=0;render();return}
  if(button.hasAttribute('data-p9-index')){position=Number(button.dataset.p9Index);render();return}
  if(button.hasAttribute('data-p9-select')){if(s.correct)return;s.selected=button.dataset.p9Select;resetResult(s);render();return}
  if(button.hasAttribute('data-p9-add')){if(s.correct)return;const id=button.dataset.p9Add;if(q.tokens.some(t=>t.id===id)&&!s.built.includes(id)){s.built.push(id);resetResult(s)}render();return}
  if(button.hasAttribute('data-p9-remove')){if(s.correct)return;s.built.splice(Number(button.dataset.p9Remove),1);resetResult(s);render();return}
  if(button.hasAttribute('data-p9-clear')){if(s.correct)return;s.built=[];resetResult(s);render();return}
  if(button.hasAttribute('data-p9-hint')){s.hint=!s.hint;if(s.hint)s.hintUsed=true;render();return}
  if(button.hasAttribute('data-p9-solution')){s.solution=!s.solution;if(s.solution)s.solutionViewed=true;render();return}
  if(button.hasAttribute('data-p9-check')){check();return}
  if(button.hasAttribute('data-p9-next')){if(position<tasks().length-1)position++;else {group=GROUPS[(GROUPS.findIndex(g=>g.id===group)+1)%GROUPS.length].id;position=0}render();return}
 }
 function init(){if(inited)return;root=$('practiceLabArea');if(!root)return;root.addEventListener('click',handle);inited=true}
 function counts(){return {questions:all.length,completed:completedCount(),attempts:journal.totalAttempts,unassistedFirst:cleanFirstCount()}}
 window.CuentiloPractice={init,render,counts,exportState,restoreState,validateBank,recordExternal};
})();
