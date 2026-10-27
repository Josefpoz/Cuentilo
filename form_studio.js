/* Cuentilo P10 — shared, standalone verb forms studio; accessible from Learn, Grammar, Stories.
 * Explore changes nothing in SRS. Puzzles explicitly log to P9 practice journal.
 */
window.CuentiloFormStudio=(()=>{'use strict';
 const V=window.CuentiloVerbs;
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const examples=[
  {id:'p10-si-tuviera',lemma:'tener',tense:'subra',person:0,es:'Si ___ más dinero, viajaría más.',de:'Wenn ich mehr Geld hätte, würde ich mehr reisen.'},
  {id:'p10-tengo',lemma:'tener',tense:'pres',person:0,es:'Yo ___ hambre.',de:'Ich habe Hunger.'},
  {id:'p10-hablabamos',lemma:'hablar',tense:'impf',person:3,es:'De niños, ___ mucho.',de:'Als Kinder redeten wir viel.'},
  {id:'p10-queria',lemma:'querer',tense:'cond',person:0,es:'Yo ___ viajar a México.',de:'Ich würde gern nach Mexiko reisen.'},
  {id:'p10-pudieras',lemma:'poder',tense:'subra',person:1,es:'Si ___ venir, sería genial.',de:'Wenn du kommen könntest, wäre das toll.'},
  {id:'p10-vinieron',lemma:'venir',tense:'pret',person:5,es:'Ayer ___ mis amigos.',de:'Gestern kamen meine Freunde.'},
  {id:'p10-hicimos',lemma:'hacer',tense:'pret',person:3,es:'Ayer ___ la cena.',de:'Gestern machten wir das Abendessen.'},
  {id:'p10-haga',lemma:'hacer',tense:'sub',person:2,es:'Espero que ella ___ la tarea.',de:'Ich hoffe, dass sie die Aufgabe erledigt.'},
  {id:'p10-escribiria',lemma:'escribir',tense:'cond',person:0,es:'Yo ___ una carta.',de:'Ich würde einen Brief schreiben.'},
  {id:'p10-viviremos',lemma:'vivir',tense:'fut',person:3,es:'Mañana ___ aquí.',de:'Morgen werden wir hier wohnen.'},
  {id:'p11-subse',lemma:'tener',tense:'subse',person:0,es:'Si ___ más tiempo...',de:'Bilde die alternative -se-Form im Subjuntivo Imperfekt.'},
  {id:'p11-perfecto',lemma:'hacer',tense:'perf',person:0,es:'Hoy ___ la cena.',de:'Bilde das Pretérito perfecto compuesto.'},
  {id:'p11-plus',lemma:'escribir',tense:'plus',person:3,es:'Ya ___ la carta.',de:'Bilde das Pluscuamperfecto.'},
  {id:'p11-subperfect',lemma:'tener',tense:'subperf',person:1,es:'Espero que ___ suerte.',de:'Bilde das Perfecto de subjuntivo.'},
  {id:'p11-subplus',lemma:'ver',tense:'subplus',person:0,es:'Si lo ___ antes...',de:'Bilde das Pluscuamperfecto de subjuntivo.'},
  {id:'p11-futureperfect',lemma:'leer',tense:'futperf',person:2,es:'Para mañana ___ el libro.',de:'Bilde das Futuro perfecto.'},
  {id:'p11-condperfect',lemma:'decir',tense:'condperf',person:0,es:'Yo se lo ___, pero...',de:'Bilde das Condicional compuesto.'},
  {id:'p11-imperative',lemma:'hablar',tense:'imper',person:1,es:'¡___ con ella!',de:'Bilde den Imperativo afirmativo (tú).'},
  {id:'p11-neg-imperative',lemma:'hablar',tense:'imperneg',person:1,es:'¡___ tan rápido!',de:'Bilde den Imperativo negativo (tú).'}
 ];
 const safeTenses=['pres','impf','pret','fut','cond','sub','subra','subse','perf','plus','subperf','subplus','futperf','condperf','imper','imperneg'];
 // P12.1: Modus → gültige Zeitformen; condicional gehört grammatisch zum indicativo.
 const moodGroups={
  indicativo:['pres','impf','pret','perf','plus','fut','futperf','cond','condperf'],
  subjuntivo:['sub','subra','subse','subperf','subplus'],
  imperativo:['imper','imperneg']
 };
 const moodNames={indicativo:'Indicativo',subjuntivo:'Subjuntivo',imperativo:'Imperativo'};
 const tenseNames={pres:'Presente',impf:'Imperfecto',pret:'Indefinido',perf:'Perfecto compuesto',plus:'Pluscuamperfecto',fut:'Futuro simple',futperf:'Futuro perfecto',cond:'Condicional simple',condperf:'Condicional compuesto',sub:'Presente',subra:'Imperfecto (-ra)',subse:'Imperfecto (-se)',subperf:'Perfecto',subplus:'Pluscuamperfecto',imper:'Afirmativo',imperneg:'Negativo'};
 const moodFor=t=>Object.keys(moodGroups).find(m=>moodGroups[m].includes(t))||'indicativo';
 const fold=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();

 let root,source='learn-hub',navigateFn=null,mode='explore',lemma='tener',tense='pres',mood='indicativo',verbQuery='tener',person=0,story=null,quizIndex=0,selectedStem=null,selectedEnding=null,checked=false,attempts=0,hint=false,answerShown=false,lastRight=false,initialised=false;
 const selected=()=>examples[quizIndex];
 function resetPuzzle(){selectedStem=null;selectedEnding=null;checked=false;attempts=0;hint=false;answerShown=false;lastRight=false;}
 function chooseLemma(requested){let x=V.baseOf(requested);if(x){lemma=x.lemma;return true}return false}
 function open(opts={},go){if(typeof go==='function')navigateFn=go;source=['stories','grammar','practice-lab','learn-hub','words'].includes(opts.source)?opts.source:'learn-hub';
  if(opts.lemma)chooseLemma(opts.lemma); verbQuery=lemma;
  if(opts.tense&&safeTenses.includes(opts.tense))tense=opts.tense;
  mood=moodFor(tense);
  if(Number.isInteger(opts.person)&&opts.person>=0&&opts.person<6)person=opts.person;
  if(mood==='imperativo'&&person===0)person=1;
  story=opts.story||null;mode=opts.mode==='puzzle'?'puzzle':'explore';resetPuzzle();
  if(navigateFn)navigateFn('form-studio');else document.querySelector('[data-page="learn-hub"]')?.click();render();
 }
 function init(){if(initialised)return;root=$('cuentiloFormStudio');if(!root)return;root.addEventListener('click',onClick);root.addEventListener('input',onInput);initialised=true;}
 function morphBlock(s){if(!s)return `<span class="fs-empty">Keine Form für diese Person</span>`;
  const form=s.form||s;if(!s.ending)return `<strong>${esc(form)}</strong>`;
  return `<span class="fs-stem">${esc(s.stem)}</span><span class="fs-ending">${esc(s.ending)}</span>`;}
 function renderVerbOptions(){
  const all=[...new Set([lemma,...V.supported])];
  const q=fold(verbQuery),found=q?all.filter(v=>fold(v).includes(q)):all;
  const matches=found.slice(0,12);
  return `<div class="fs-card-grid fs-verb-grid" role="group" aria-label="Verbauswahl">${matches.map(v=>`<button type="button" data-fs-lemma="${esc(v)}" class="fs-choice-card ${v===lemma?'selected':''}" aria-pressed="${v===lemma}">${esc(v)}</button>`).join('')}</div>${!found.length?'<p class="fs-picker-hint">Kein Treffer. Versuch einen anderen Suchbegriff.</p>':found.length>12?`<p class="fs-picker-hint">${found.length} Treffer · zeige die ersten 12. Tippe weiter, um ein Verb zu finden.</p>`:''}`;
 }
 function renderExplore(){const form=V.generate(lemma,tense,person),split=V.split(lemma,tense,person),aux=V.explain(lemma,tense,person);const any=V.analyse(form||'',lemma).filter(c=>c.tense===tense);
  return `<div class="fs-picker">
   <section class="fs-picker-section" aria-label="Verb auswählen"><div class="fs-picker-title"><h3>1 · Verb</h3><span>${esc(lemma)}</span></div>
    <label class="fs-search-label" for="fs-lemma-search">Verb suchen</label>
    <input type="search" id="fs-lemma-search" value="${esc(verbQuery)}" placeholder="z. B. tener, hablar …" autocomplete="off" spellcheck="false">
    <div id="fs-lemma-results">${renderVerbOptions()}</div></section>
   <section class="fs-picker-section" aria-label="Modus auswählen"><div class="fs-picker-title"><h3>2 · Modus</h3></div>
    <div class="fs-card-grid fs-mood-grid" role="group" aria-label="Grammatischer Modus">${Object.keys(moodGroups).map(m=>`<button type="button" data-fs-mood="${m}" class="fs-choice-card ${mood===m?'selected':''}" aria-pressed="${mood===m}">${mood===m?'✓ ':''}${moodNames[m]}</button>`).join('')}</div></section>
   <section class="fs-picker-section" aria-label="Zeitform auswählen"><div class="fs-picker-title"><h3>3 · Tempus</h3><span>${moodNames[mood]}</span></div>
    <div class="fs-card-grid fs-tense-grid" role="group" aria-label="Gültige Zeitformen">${moodGroups[mood].map(t=>`<button type="button" data-fs-tense="${t}" class="fs-choice-card ${tense===t?'selected':''}" aria-pressed="${tense===t}">${tenseNames[t]}</button>`).join('')}</div></section>
   <section class="fs-picker-section" aria-label="Person auswählen"><div class="fs-picker-title"><h3>4 · Person</h3></div>
    <div class="fs-card-grid fs-person-grid" role="group" aria-label="Grammatische Person">${V.PERSONS.map((p,i)=>`<button type="button" data-fs-person="${i}" class="fs-choice-card ${person===i?'selected':''}" aria-pressed="${person===i}" ${V.generate(lemma,tense,i)?'':'disabled'}>${esc(p)}</button>`).join('')}</div></section>
  </div>
  <div class="fs-display"><span>DEINE VERBFORM</span><div lang="es" class="fs-word">${morphBlock(split)}</div>${form?window.PalabraAudio?.buttons(form,{label:'Verbform'})||'':''}<p>${esc(V.LABEL[tense])} · ${esc(V.PERSONS[person])}</p></div>
  ${lemma==='tener'&&person===0?`<div class="fs-meaning"><strong>Bedeutung im Kontext</strong><p lang="es">${esc({pres:'Tengo dinero.',impf:'Antes tenía dinero.',pret:'Ayer tuve dinero.',fut:'Tendré dinero.',cond:'Tendría dinero.',sub:'Espero que tenga dinero.',subra:'Si tuviera dinero, viajaría.',subse:'Si tuviese dinero, viajaría.',perf:'Hoy he tenido dinero.',plus:'Había tenido dinero.',subperf:'Espero que haya tenido dinero.'}[tense]||'')}</p><p>${esc({pres:'Ich habe Geld.',impf:'Früher hatte ich Geld.',pret:'Gestern hatte ich Geld.',fut:'Ich werde Geld haben.',cond:'Ich hätte Geld.',sub:'Ich hoffe, dass ich Geld habe.',subra:'Wenn ich Geld hätte, würde ich reisen.',subse:'Wenn ich Geld hätte, würde ich reisen.',perf:'Heute habe ich Geld gehabt.',plus:'Ich hatte Geld gehabt.',subperf:'Ich hoffe, dass ich Geld gehabt habe.'}[tense]||'')}</p></div>`:''}
  <div class="fs-note"><strong>Warum diese Form?</strong><p>${esc(aux)}</p>${any.length>1?'<p>Hinweis: Dieselbe geschriebene Form kann zu mehreren Personen gehören. Der Satzkontext entscheidet.</p>':''}</div>
  ${story?`<div class="fs-source"><strong>Aus deiner Geschichte</strong><p>Wort: <em lang="es">${esc(story.form)}</em></p>${story.analyses?.length?`<p>${esc([...new Set(story.analyses.map(a=>V.LABEL[a.tense]))].join(' / '))}</p>`:''}${story.unverified?'<p>Die konkrete Story-Form konnte noch nicht eindeutig bestätigt werden; ihre Originalannotation bleibt erhalten.</p>':''}</div>`:''}
  <div class="fs-nonfinite"><h3>Weitere Verbformen</h3><p><b>Infinitiv:</b> ${esc(lemma)} · <b>Gerundium:</b> ${esc(V.gerund(V.baseOf(lemma).base))} · <b>Partizip:</b> ${esc(V.participle(V.baseOf(lemma).base))}</p></div>
  <div class="fs-table"><h3>Alle Personen vergleichen</h3><div class="fs-person-list">${V.paradigm(lemma,tense).map((x,i)=>`<button type="button" class="fs-person-row ${person===i?'selected':''}" data-fs-person="${i}" ${x?'':'disabled'}><span>${esc(V.PERSONS[i])}</span><strong lang="es">${esc(x||'—')}</strong></button>`).join('')}</div></div>
  <button class="primary fs-full" data-fs-practice-current ${!split?.form?'disabled':''}>Diese Form als Rätsel üben →</button>`;}
 function unique(arr){return [...new Set(arr.filter(Boolean))]}
 function puzzleData(task){let target=V.split(task.lemma,task.tense,task.person);return target&&!target.ending?{...target,stem:'',ending:target.form,kind:'whole'}:target}
 function puzzleOptions(task){const correct=puzzleData(task);if(!correct)return {stems:[],endings:[],correct:null};
  const stemCandidates=[];const endingCandidates=[];
  const tenses=['pres','impf','pret','fut','cond','sub','subra','subse','perf','plus','subperf','subplus','futperf','condperf','imper','imperneg'];
  for(const t of tenses){for(const who of [task.person,0,3,5]){const x=V.split(task.lemma,t,who);if(x?.ending){stemCandidates.push(x.stem);endingCandidates.push(x.ending)}}}
  if(correct.kind==='whole') {stemCandidates.length=0;endingCandidates.length=0;for(const t of tenses){for(const i of [0,1,2,3,4,5]){const f=V.generate(task.lemma,t,i);if(f&&f!==correct.form)endingCandidates.push(f);}}}
  if(correct.kind==='compound')endingCandidates.push(...['tenido','hecho','dicho','escrito','visto','vivido','hablado']);
  const hash=s=>[...s].reduce((a,c)=>(a*33+c.charCodeAt(0))>>>0,5381);
  const mix=a=>unique(a).sort((a,b)=>hash(task.id+':'+a)-hash(task.id+':'+b));
  const stems=correct.kind==='whole'?['']:mix([correct.stem,...stemCandidates]).slice(0,5),ends=mix([correct.ending,...endingCandidates]).slice(0,6);
  if(!stems.includes(correct.stem))stems[stems.length-1]=correct.stem;
  if(!ends.includes(correct.ending))ends[ends.length-1]=correct.ending;
  // The order is deterministic, and distractors are authentic pieces from the same verb.
  return {stems:stems.slice(0,5),endings:ends.slice(0,6),correct};
 }
 function renderPuzzle(){const task=mode==='puzzle-custom'?{id:`p10-${lemma}-${tense}-${person}`,lemma,tense,person,es:'Bilde die gefragte Verbform.',de:'Verb: '+lemma}:selected();
  const options=puzzleOptions(task),target=options.correct;
  if(!target?.ending)return `<p class="fs-note">Diese Sonderform ist nicht sinnvoll in Stamm und Endung zerlegbar. Du kannst ihre ganze Form im Entdeckermodus vergleichen.</p><button class="secondary" data-fs-mode="explore">Zurück zum Entdecken</button>`;
  const joined=(selectedStem||'')+(target.kind==='whole'?'':target.joiner||'')+(selectedEnding||'');const isRight=joined===target.form&&(target.kind==='whole'||selectedStem===target.stem)&&selectedEnding===target.ending;
  return `<div class="fs-puzzle-head"><span>${mode==='puzzle-custom'?'DEINE AUSGEWÄHLTE FORM':`RÄTSEL ${quizIndex+1} VON ${examples.length}`}</span><h3>${esc(task.de)}</h3><p lang="es">${esc(task.es)}</p><small>${esc(task.lemma)} · ${esc(V.LABEL[task.tense])} · ${esc(V.PERSONS[task.person])}</small></div>
  <div class="fs-forming"><span>DU BAUST:</span><strong lang="es">${target.kind==='whole'?'':selectedStem?esc(selectedStem):'____'}<i>${target.kind==='whole'?'':target.joiner||''}${selectedEnding?esc(selectedEnding):'___'}</i></strong></div>
  ${target.kind==='whole'?'':`<h3 class="fs-part-title">1. ${target.kind==='compound'?'Wähle das Hilfsverb':target.kind==='negative-imperative'?'Wähle die Verneinung':'Wähle den Stamm'}</h3><div class="fs-tiles">${options.stems.map(x=>`<button type="button" data-fs-stem="${esc(x)}" class="${selectedStem===x?'selected':''}">${esc(x)}${target.kind?'':'−'}</button>`).join('')}</div>`}
  <h3 class="fs-part-title">${target.kind==='whole'?'Wähle die richtige vollständige Verbform':'2. '+(target.kind==='compound'?'Wähle das Partizip':target.kind==='negative-imperative'?'Wähle die Verbform':'Wähle die Endung')}</h3><div class="fs-tiles">${options.endings.map(x=>`<button type="button" data-fs-ending="${esc(x)}" class="${selectedEnding===x?'selected':''}">${target.kind?'':'−'}${esc(x)}</button>`).join('')}</div>
  <div class="fs-actions"><button type="button" class="secondary" data-fs-hint>✧ Hinweis</button><button type="button" class="secondary" data-fs-reveal>◉ Lösung</button></div>
  ${hint?`<p class="fs-note"><strong>Hinweis:</strong> ${esc(V.explain(task.lemma,task.tense,task.person))}</p>`:''}
  ${answerShown?`<p class="fs-note">Gesucht: <strong lang="es">${esc(target.form)}</strong> (${target.kind==='whole'?'Ganzform':esc(target.stem)+' + '+esc(target.ending)}).</p>`:''}
  ${(answerShown||(checked&&lastRight))?(window.PalabraAudio?.buttons(target.form,{label:'Lösung'})||''):''}
  ${checked?`<div class="fs-feedback ${lastRight?'good':''}" role="status"><strong>${lastRight?'✓ ¡Excelente!':'Noch nicht ganz.'}</strong><p>${lastRight?`Richtig: ${esc(target.stem)} + ${esc(target.ending)} = ${esc(target.form)}.`:'Versuche es erneut. Prüfe sowohl den Stamm als auch die Endung.'}</p></div>`:''}
  <div class="fs-action-row"><button type="button" class="primary" data-fs-check ${(!selectedEnding||(target.kind!=='whole'&&!selectedStem))?'disabled':''}>Form prüfen</button><button type="button" class="secondary" data-fs-next>Nächstes Rätsel →</button></div><p class="fs-footnote">Rätselversuche werden im separaten Übungsjournal erfasst, niemals im Vocab-SRS.</p>`;
 }
 function render(){if(!root)root=$('cuentiloFormStudio');if(!root)return;
  root.innerHTML=`<div class="fs-heading"><span class="eyebrow">CUENTILO · GRAMMATIK ENTDECKEN</span><h1>Formenwerkstatt</h1><p>Finde heraus, wie Verben gebaut werden – oder setze ihre Formen selbst zusammen.</p></div>
  <div class="fs-tabs" role="group" aria-label="Modus"><button data-fs-mode="explore" class="${mode==='explore'?'selected':''}" aria-pressed="${mode==='explore'}">✧ Entdecken</button><button data-fs-mode="puzzle" class="${mode!=='explore'?'selected':''}" aria-pressed="${mode!=='explore'}">◈ Rätseln</button></div>
  ${mode==='explore'?renderExplore():renderPuzzle()}<p class="fs-footnote">Das Verb-Inventar deckt Cuentilo ab. Nicht alle theoretischen Sonderformen sind abschließend unabhängig geprüft. Die Analyse von Story-Wörtern berücksichtigt ihre bisherigen Kontextannotation; morphologische Sonderfälle werden gesondert geprüft.</p>`;
 }
 function onInput(e){if(e.target.id!=='fs-lemma-search')return;verbQuery=e.target.value;const target=$('fs-lemma-results');if(target)target.innerHTML=renderVerbOptions();}
 function onClick(e){const b=e.target.closest('button');if(!b||!root?.contains(b))return;
  if(b.dataset.fsMode){mode=b.dataset.fsMode;resetPuzzle();render();return;}
  if(b.hasAttribute('data-fs-lemma')){if(!chooseLemma(b.dataset.fsLemma))return;verbQuery=lemma;story=null;resetPuzzle();render();return;}
  if(b.hasAttribute('data-fs-mood')){const next=b.dataset.fsMood;if(!moodGroups[next])return;mood=next;if(!moodGroups[mood].includes(tense))tense=moodGroups[mood][0];if(mood==='imperativo'&&person===0)person=1;resetPuzzle();render();return;}
  if(b.hasAttribute('data-fs-tense')){const next=b.dataset.fsTense;if(!moodGroups[mood].includes(next))return;tense=next;if(mood==='imperativo'&&person===0)person=1;resetPuzzle();render();return;}
  if(b.hasAttribute('data-fs-person')){const next=Number(b.dataset.fsPerson);if(!Number.isInteger(next)||next<0||next>5||!V.generate(lemma,tense,next))return;person=next;render();return;}
  if(b.hasAttribute('data-fs-practice-current')){mode='puzzle-custom';resetPuzzle();render();return;}
  if(b.hasAttribute('data-fs-stem')){selectedStem=b.dataset.fsStem;checked=false;render();return;}
  if(b.hasAttribute('data-fs-ending')){selectedEnding=b.dataset.fsEnding;checked=false;render();return;}
  if(b.hasAttribute('data-fs-hint')){hint=!hint;render();return;}
  if(b.hasAttribute('data-fs-reveal')){answerShown=!answerShown;render();return;}
  if(b.hasAttribute('data-fs-check')){
   const task=mode==='puzzle-custom'?{id:`p10-${lemma}-${tense}-${person}`,lemma,tense,person}:selected();const correct=puzzleData(task);
   if((correct.kind!=='whole'&&!selectedStem)||!selectedEnding||!correct)return;
   attempts++;lastRight=(correct.kind==='whole'||selectedStem===correct.stem)&&selectedEnding===correct.ending;checked=true;
   window.CuentiloPractice?.recordExternal?.({id:task.id,correct:lastRight,attempt:attempts,hintUsed:hint,solutionViewed:answerShown});render();return;
  }
  if(b.hasAttribute('data-fs-next')){quizIndex=mode==='puzzle-custom'?0:(quizIndex+1)%examples.length;mode='puzzle';resetPuzzle();render();return;}
 }
 function back(){if(navigateFn)navigateFn(source);else document.querySelector(`[data-page="${source}"]`)?.click()}
 return {init,render,open,back,examples,mode:()=>mode};
})();
