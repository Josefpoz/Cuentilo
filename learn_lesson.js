/* Cuentilo P14 · zehn A1-Lektionen, Grammatikhappen und drei Lernwerkstätten.
   Dialogue flow, editable sentence tiles, case-insensitive validation.
   Learn responses and corrective reviews NEVER write to Vocab SRS or its cards.
   Existing legacy P13 lesson progress key remains untouched. */
window.CuentiloLearnLesson = (() => {
  'use strict';
  const course=window.CUENTILO_P131_COURSE;
  const STORE='cuentilo-learn-p131-course-v1';
  const legacyKey='cuentilo-learn-p13-lesson1-v1';
  const workshops=course.workshops||[];
  const wsById=Object.fromEntries(workshops.map(w=>[w.id,w]));
  const wsFresh=()=>({step:0,answers:{},tiles:{},tileVerified:{},completed:false});
  const workshopActive=()=>!!wsById[whole.active];
  const wsState=()=>whole.workshops[whole.active];
  const root=document.getElementById('p13LearnLesson');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fresh=()=>({step:0,answers:{},tiles:{},tileVerified:{},tileErrors:{},listened:false,reviewDone:{},reviewFails:{},reviewFeedback:null,reviewCursor:0,completed:false,finishedAt:null});
  const sequences={};
  const byId=Object.fromEntries(course.lessons.map(l=>[l.id,l]));
  for(const l of course.lessons){
    const dia=window.PalabraDialogues?.getLesson(l.dialogue_id);
    const qCount=dia?.questions?.length||0;
    sequences[l.id]=[
      {kind:'welcome'},
      ...l.words.flatMap((item,i)=>[{kind:'word',id:item.id,item,index:i},...(l.snacks||[]).filter(sn=>sn.afterWordId===item.id).map(sn=>({kind:'snack',id:sn.id,item:sn}))]),
      {kind:'listen-start'},
      ...Array.from({length:qCount},(_,i)=>({kind:'listen-q',id:l.id+'-listen-'+i,index:i})),
      {kind:'transcript'},{kind:'note'},{kind:'review'},
      ...l.practice.map((item,i)=>({kind:item.type==='build'?'build':'choice',id:item.id,item,index:i})),
      {kind:'final-start'},...l.final.map((item,i)=>({kind:'final-build',id:l.id+'-final-'+i,item,index:i})),
      {kind:'complete'}
    ];
  }
  const valid=s=>{
    if(!s||typeof s!=='object'||Array.isArray(s))return fresh();
    const m={...fresh(),...s};
    for(const k of ['answers','tiles','tileVerified','tileErrors','reviewDone','reviewFails']) if(!m[k]||typeof m[k]!=='object'||Array.isArray(m[k]))m[k]={};
    if(!Number.isInteger(m.step)||m.step<0)m.step=0;
    return m;
  };
  const initial=()=>({version:1,p132ReverseDone:true,p14Migrated:true,active:'l1',lessons:Object.fromEntries(course.lessons.map(l=>[l.id,fresh()])),workshops:Object.fromEntries(workshops.map(w=>[w.id,wsFresh()]))});
  let whole;
  try{let raw=JSON.parse(localStorage.getItem(STORE)||'null');whole=raw&&raw.version===1&&raw.lessons?{version:1,p132ReverseDone:!!raw.p132ReverseDone,p14Migrated:!!raw.p14Migrated,active:byId[raw.active]||wsById[raw.active]?raw.active:'l1',lessons:Object.fromEntries(course.lessons.map(l=>[l.id,valid(raw.lessons[l.id])])),workshops:Object.fromEntries(workshops.map(w=>[w.id,raw.workshops?.[w.id]&&typeof raw.workshops[w.id]==='object'?{...wsFresh(),...raw.workshops[w.id]}:wsFresh()]))}:initial()}catch(_){whole=initial()}
  let navigate=null,openedTranslations=new Set();
  // P13.2 preserves P13.1 course progress. Answered reverse-direction cards are reset only if the learner is still on that exact word.
  const legacyReverseAnswers={"l1":{"p131-l1-word-02":"C","p131-l1-word-06":"D","p131-l1-word-08":"A","p131-l1-word-11":"C"},"l2":{"p131-l2-word-02":"A","p131-l2-word-05":"C","p131-l2-word-07":"A","p131-l2-word-09":"C"},"l3":{"p131-l3-word-01":"C","p131-l3-word-07":"C","p131-l3-word-11":"B","p131-l3-word-12":"C"}};
  function migrateLegacyReverse(){
    if(whole.p132ReverseDone)return;
    for(const l of course.lessons){const st=whole.lessons[l.id],seq=sequences[l.id];if(st.completed)continue;
      for(const w of l.words){if(w.direction!=='de-es')continue;
        const wi=seq.findIndex(t=>t.kind==='word'&&t.id===w.id), oldAnswer=st.answers[w.id];
        if(st.step<=wi){delete st.answers[w.id];delete st.reviewDone[w.id];delete st.reviewFails[w.id];}
        else if(oldAnswer!==undefined){const oldCorrect=legacyReverseAnswers[l.id]?.[w.id];
          st.answers[w.id]=oldAnswer===oldCorrect?w.correct:w.choices.find(c=>c.id!==w.correct).id;
        }
      }
    }
    whole.p132ReverseDone=true;
    try{localStorage.setItem(STORE,JSON.stringify(whole))}catch(_){}
  }
  migrateLegacyReverse();
  // Migration: older P13.3 step indices are mapped by semantic step identity;
  // inserting Grammatikhappen must never move learners silently to a different question.
  function migrateP14(){
    if(whole.p14Migrated)return;
    for(const l of course.lessons.slice(0,3)){
      const old=[{kind:'welcome'},...l.words.map(item=>({kind:'word',id:item.id})),{kind:'listen-start'},
        ...Array.from({length:window.PalabraDialogues?.getLesson(l.dialogue_id)?.questions?.length||0},(_,i)=>({kind:'listen-q',id:l.id+'-listen-'+i})),
        {kind:'transcript'},{kind:'note'},{kind:'review'},
        ...l.practice.map(item=>({kind:item.type==='build'?'build':'choice',id:item.id})),
        {kind:'final-start'},...l.final.map((_,i)=>({kind:'final-build',id:l.id+'-final-'+i})),{kind:'complete'}];
      const st=whole.lessons[l.id],prev=old[Math.min(st.step,old.length-1)];
      if(st.completed)st.step=sequences[l.id].length-1;
      else if(prev){const j=sequences[l.id].findIndex(t=>t.kind===prev.kind&&(!prev.id||t.id===prev.id));if(j>=0)st.step=j;}
    }
    whole.p14Migrated=true;
    try{localStorage.setItem(STORE,JSON.stringify(whole))}catch(_){}
  }
  migrateP14();
  const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(whole))}catch(_){}};
  const lesson=()=>byId[whole.active];
  const state=()=>whole.lessons[whole.active];
  const steps=()=>sequences[whole.active];
  const current=()=>steps()[Math.min(state().step,steps().length-1)];
  const dia=()=>window.PalabraDialogues?.getLesson(lesson().dialogue_id);
  const pct=l=>Math.round(100*Math.min(whole.lessons[l.id].step,sequences[l.id].length-1)/(sequences[l.id].length-1));
  const title=(name,overline)=>`<div class="p13-head"><span class="eyebrow">${esc(overline||'LEKTION '+lesson().id.slice(1)+' · A1')}</span><h1>${esc(name)}</h1></div>`;
  const actions=(label='Weiter →',can=true)=>`<div class="p13-actions"><button type="button" class="secondary" data-p131="back">← Zurück</button><button type="button" class="primary" data-p131="next" ${can?'':'disabled'}>${esc(label)}</button></div>`;
  const audio=(w,id)=>window.PalabraAudio?.buttons(w,{compact:true,label:'Wort anhören',cardId:id})||'';
  const stopAudio=()=>{window.PalabraGrammarAudio?.stop?.();window.PalabraAudio?.stop?.()};
  function questionInfo(id){
    const l=lesson();let a=l.words.find(w=>w.id===id)||l.practice.find(p=>p.id===id&&p.type==='choice');
    if(a)return a;
    const k=Number(id.split('-listen-')[1]);
    if(id.startsWith(l.id+'-listen-')&&Number.isInteger(k)){
      const q=dia()?.questions[k];if(!q)return null;
      return {id,prompt:q.q,choices:q.choices.map((t,i)=>({id:String.fromCharCode(65+i),text:t})),correct:String.fromCharCode(65+q.correct),feedback:q.why,spanish:null,insight:l.id==='l2'&&k===2?'💡 Im Spanischen hat man sein Alter: „tengo 27 años“ bedeutet wörtlich „ich habe 27 Jahre“. Man verwendet tener (haben), nicht ser (sein).':null};
    }
    return null;
  }
  function allWrongIds(){
    const l=lesson(),s=state(),ids=l.words.map(x=>x.id); // Only vocabulary MC errors require a review.
    return ids.filter(id=>{let q=questionInfo(id);return q&&Object.prototype.hasOwnProperty.call(s.answers,id)&&s.answers[id]!==q.correct});
  }
  const pending=()=>allWrongIds().filter(id=>!state().reviewDone[id]);
  function choices(q,{review=false}={}){
    const s=state(),feedback=review?s.reviewFeedback:(Object.prototype.hasOwnProperty.call(s.answers,q.id)?{id:q.id,chosen:s.answers[q.id],correct:s.answers[q.id]===q.correct}:null);
    const shown=review&&feedback?.id===q.id?feedback:!review?feedback:null;
    const opts=[...q.choices];
    if(review){const shift=((s.reviewFails[q.id]||0)+q.id.length)%opts.length;opts.push(...opts.splice(0,shift));opts.reverse();}
    const selected=shown?.chosen;
    const isWord=lesson().words.some(w=>w.id===q.id);
    return `<h2 class="p13-prompt">${esc(q.prompt)}</h2><div class="p13-choices" role="group" aria-label="Antwort auswählen">
      ${opts.map(o=>`<button type="button" class="p13-choice ${shown&&o.id===q.correct?'is-correct':''} ${shown&&o.id===selected&&o.id!==q.correct?'is-wrong':''}" data-p131="${review?'review-choice':'choice'}" data-id="${esc(q.id)}" data-choice="${esc(o.id)}" ${shown?'disabled':''} aria-pressed="${selected===o.id}"><span class="p13-choice-id">${esc(o.id)}</span><span>${esc(o.text)}</span></button>`).join('')}</div>
      ${shown?`<div class="p13-feedback" role="status"><strong>${shown.correct?'✓ ¡Muy bien!':'Noch nicht ganz.'}</strong><p>${esc(q.feedback)}</p>${shown.correct&&q.insight?`<p class="p132-language-insight">${esc(q.insight)}</p>`:''}${shown.correct&&isWord&&q.direction==='de-es'?`<div class="p132-answer-audio"><span lang="es">${esc(q.spanish)}</span>${audio(q.spanish,q.source_card_id)}</div>`:''}${!shown.correct&&!review?`<small>${isWord?'Dieses Wort kommt vor den Anwendungsaufgaben noch einmal. Kein SRS-Eintrag.':'Höre den Dialog bei Bedarf noch einmal. Hörfragen werden nicht wiederholt.'}</small>`:''}</div>`:''}`;
  }
  // Comparing orthography must never punish a correct answer for casing alone.
  const sameToken=(a,b)=>String(a||'').normalize('NFC').toLocaleLowerCase('es').trim()===String(b||'').normalize('NFC').toLocaleLowerCase('es').trim();
  function tileTask(id,task,kind){
    const s=state(),selected=Array.isArray(s.tiles[id])?s.tiles[id]:[], verified=!!s.tileVerified[id],errors=s.tileErrors[id]||0;
    const lookup=Object.fromEntries(task.tiles.map(t=>[t.id,t.text]));
    // A casing-only duplicate is not a useful distractor. Prefer the canonical correct tile.
    const canonical=new Map();
    for(const t of task.tiles){const k=t.text.normalize('NFC').toLocaleLowerCase('es').trim();
      const prior=canonical.get(k);
      if(!prior||(!task.correct_order.includes(prior.id)&&task.correct_order.includes(t.id)))canonical.set(k,t);
    }
    const available=task.tiles.filter(t=>canonical.get(t.text.normalize('NFC').toLocaleLowerCase('es').trim())===t);
    const usable=available.filter(t=>!selected.includes(t.id) && !selected.some(id=>sameToken(lookup[id],t.text)));
    const placed=selected.length?selected.map((tid,i)=>verified?`<span class="p133-locked-tile">${esc(lookup[tid])}</span>`:
      `<span class="p133-selected-unit" draggable="true" data-p133-index="${i}" title="Baustein ziehen oder mit den Pfeilen verschieben"><button type="button" class="p133-token-word" data-p131="remove-tile" data-tile="${esc(tid)}" aria-label="${esc(lookup[tid])} entfernen">${esc(lookup[tid])} <span aria-hidden="true">×</span></button><span class="p133-token-tools"><button type="button" class="p133-move" data-p131="move-tile" data-index="${i}" data-shift="-1" ${i===0?'disabled':''} aria-label="${esc(lookup[tid])} nach links verschieben">←</button><button type="button" class="p133-move" data-p131="move-tile" data-index="${i}" data-shift="1" ${i===selected.length-1?'disabled':''} aria-label="${esc(lookup[tid])} nach rechts verschieben">→</button></span></span>`).join(' '):'<span class="muted">Tippe die Wörter in der richtigen Reihenfolge an …</span>';
    return `<div class="p133-composer"><p class="p13-prompt">${esc(task.prompt||task.task)}</p><p class="muted p133-compose-tip">${kind==='final'?'Antworte im Gespräch. Einige Wörter sind Ablenkungen.':'Baue den Satz aus den passenden Bausteinen.'} Du kannst eingesetzte Wörter jederzeit verschieben.</p>
      <div class="p13-build-target p133-build-target" lang="es" aria-label="Dein zusammengesetzter Satz">${placed}</div>
      ${!verified?`<p class="p133-reorder-help">Zum Umstellen: ← → verwenden oder Baustein ziehen. × entfernt nur dieses Wort.</p>`:''}
      <div class="p13-tiles" aria-label="Verfügbare Wortbausteine">${usable.map(t=>`<button type="button" class="p13-tile" data-p131="tile" data-tile="${esc(t.id)}">${esc(t.text)}</button>`).join('')}</div>
      ${errors&&!verified?`<div class="p13-feedback" role="status"><strong>Das passt noch nicht.</strong><p>${esc(errors>=2?task.hint||'Prüfe, welche Wörter tatsächlich in den Satz gehören.':'Prüfe die Antwort und verschiebe oder entferne einzelne Bausteine.')}</p></div>`:''}
      ${verified?`<div class="p13-feedback" role="status"><strong>✓ ¡Muy bien!</strong><p>${esc(task.feedback)}</p>${task.insight?`<p class="p132-language-insight">${esc(task.insight)}</p>`:''}</div>`:''}
      ${!verified?`<div class="p131-build-actions"><button type="button" class="secondary" data-p131="clear-tiles">↺ Zurücksetzen</button><button type="button" class="primary" data-p131="check-tiles" ${selected.length?'':'disabled'}>Satz prüfen →</button></div>`:actions(kind==='final'?'Antwort senden →':'Weiter →')}
      </div>`;
  }
  function grammarNote(){const l=lesson();return l.snacks?.length?'':`<div class="p133-inline-note"><strong>💡 Sprachblick · ${esc(l.note.title)}</strong><p>${esc(l.note.body)}</p></div>`}
  function listeningSuccessFeedback(){
    const l=lesson(),n=dia()?.questions?.length||0;if(!n)return '';
    const q=questionInfo(l.id+'-listen-'+(n-1));
    if(!q||state().answers[q.id]!==q.correct)return '';
    return `<div class="p13-feedback p133-transition-feedback" role="status"><strong>✓ ¡Muy bien! Den Dialog hast du verstanden.</strong>${q.insight?`<p class="p132-language-insight">${esc(q.insight)}</p>`:''}</div>`;
  }
  function finalDialogue(t){
    const l=lesson(),s=state();const previous=l.final.slice(0,t.index);
    const history=previous.map((turn,i)=>{const id=l.id+'-final-'+i;
      if(!s.tileVerified[id])return '';
      const dict=Object.fromEntries(turn.tiles.map(tile=>[tile.id,tile.text]));const sentence=(s.tiles[id]||turn.correct_order).map(key=>dict[key]||'').join(' ');
      return `<div class="p133-chat-line p133-speaker"><span class="p133-speaker-label">${esc(turn.speaker)}</span><div class="p133-bubble">${esc(turn.question)}</div></div><div class="p133-chat-line p133-learner"><span class="p133-speaker-label">Du</span><div class="p133-bubble" lang="es">${esc(sentence)}</div></div>`;
    }).join('');
    return `${title('Dein Gespräch','DIALOGWERKSTATT · ANTWORT '+(t.index+1)+' / '+l.final.length)}
      <div class="panel p13-card p133-dialogue-window"><div class="p133-dialogue-top"><span class="p133-live-dot"></span><strong>Du bist im Gespräch</strong><small>${t.index+1} von ${l.final.length} Antworten</small></div>
      <div class="p133-chat-log" aria-label="Bisheriges Gespräch">${history}<div class="p133-chat-line p133-speaker"><span class="p133-speaker-label">${esc(t.item.speaker)}</span><div class="p133-bubble" lang="es">${esc(t.item.question)}</div></div></div>
      ${tileTask(t.id,t.item,'final')}</div>`;
  }
  function questionsPreview(){return `<div class="p132-question-frame"><strong>Darauf achtest du gleich:</strong><ol>${dia().questions.map(q=>`<li>${esc(q.q)}</li>`).join('')}</ol><p class="muted">Die Fragen kennst du schon vor dem Hören. Du darfst beim Anhören mitlesen.</p></div>`}
  function dialogueControls(){return `<div class="p132-dialogue-controls" role="group" aria-label="Dialog-Audio"><button type="button" class="primary" data-dialogue-play="${esc(lesson().dialogue_id)}" data-p131-listen="yes">▶ Dialog anhören</button><button type="button" class="secondary" data-dialogue-play="${esc(lesson().dialogue_id)}" data-dialogue-slow="true" data-p131-listen="yes">▶ 0,8× langsam</button><button type="button" class="secondary" data-dialogue-pause disabled>⏸ Pause</button><span class="p132-dialogue-progress" data-dialogue-progress role="status"></span></div>`}
  function transcript(showTranslations=false){
    const first=dia().lines[0]?.[0];
    return `<div class="p132-chat-scene reading-scene" aria-label="Dialog mit Sprechblasen">${dia().lines.map(([speaker,es,de],i)=>`<div class="chat-line ${speaker===first?'':'mine'}" data-dialogue-turn="${i}"><span class="chat-name">${esc(speaker)}</span><div class="chat-bubble" lang="es">${esc(es).replace(/[⟦⟧]/g,'')}</div><div class="p132-turn-actions">${window.PalabraGrammarAudio?.hasTurn?.(dia().id,i)?`<button type="button" class="chat-play-turn" data-dialogue-id="${esc(dia().id)}" data-dialogue-line="${i}" aria-label="Sprechblase ${i+1} anhören">▶ Anhören</button>`:''}${showTranslations?`<button type="button" class="p13-mini-btn" data-p131="translation" data-line="${i}">${openedTranslations.has(i)?'Übersetzung verbergen':'Übersetzen'}</button>`:''}</div>${showTranslations&&openedTranslations.has(i)?`<p class="p132-translation">${esc(de)}</p>`:''}</div>`).join('')}</div>`;
  }
  function grammarSnack(sn){
    const tiles=(sn.examples||[]).map(e=>`<div class="p14-sample"><strong lang="es">${esc(e.es)}</strong><small>${esc(e.de)}</small>${audio(e.es,e.cardId||'')}</div>`).join('');
    return `${title(sn.title, 'GRAMMATIKHAPPEN · '+(sn.tag||'SPRACHE ENTDECKEN'))}<div class="panel p13-card p14-snack"><div class="p14-snack-icon" aria-hidden="true">✦</div><p>${esc(sn.body)}</p><div class="p14-sample-grid">${tiles}</div>${sn.takeaway?`<div class="p14-rule"><strong>Merke</strong><p>${esc(sn.takeaway)}</p></div>`:''}<p class="muted">Höre einzelne Beispiele so oft an, wie du möchtest. Dieser Sprachblick ist kein Test.</p>${actions('Weiter zu den Wörtern →')}</div>`;
  }
  const wsSteps=w=>[...w.steps,{kind:'complete'}];
  function workshopRender(){
    const w=wsById[whole.active],st=wsState(),seq=wsSteps(w);st.step=Math.min(st.step,seq.length-1);
    const t=seq[st.step],index=st.step;
    const buttons=(enabled=true,label='Weiter →')=>`<div class="p13-actions"><button type="button" class="secondary" data-ws="back">← Zurück</button><button type="button" class="primary" data-ws="next" ${enabled?'':'disabled'}>${label}</button></div>`;
    let content='';
    if(t.kind==='explain')content=`<div class="p14-workshop-intro"><p>${esc(t.body)}</p><div class="p14-workshop-examples">${(t.examples||[]).map(example=>`<div>${esc(example)}</div>`).join('')}</div></div>${buttons()}`;
    if(t.kind==='choice'){
      const v=st.answers[index];content=`<p class="p13-prompt">${esc(t.prompt)}</p><div class="p13-choices">${t.choices.map((o,i)=>`<button type="button" class="p13-choice ${v!==undefined&&i===t.correct?'is-correct':''} ${v===i&&i!==t.correct?'is-wrong':''}" data-ws="choose" data-index="${i}" ${v!==undefined?'disabled':''}><span class="p13-choice-id">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}</div>${v!==undefined?`<div class="p13-feedback" role="status"><strong>${v===t.correct?'✓ ¡Muy bien!':'Das schauen wir uns an.'}</strong><p>${esc(t.feedback)}</p></div>`:''}${buttons(v!==undefined)}`;
    }
    if(t.kind==='build'){
      const chosen=st.tiles[index]||[],done=!!st.tileVerified[index];const available=t.tiles.map((txt,i)=>({txt,i})).filter(q=>!chosen.includes(q.i));
      const row=chosen.map((token,i)=>`<span class="p133-selected-unit"><button type="button" class="p133-token-word" data-ws="remove" data-token="${token}" ${done?'disabled':''}>${esc(t.tiles[token])} ×</button>${done?'':`<span class="p133-token-tools"><button type="button" class="p133-move" data-ws="move" data-at="${i}" data-shift="-1" ${i===0?'disabled':''}>←</button><button type="button" class="p133-move" data-ws="move" data-at="${i}" data-shift="1" ${i===chosen.length-1?'disabled':''}>→</button></span>`}</span>`).join('');
      content=`<p class="p13-prompt">${esc(t.prompt)}</p><div class="p13-build-target p133-build-target" lang="es">${row||'<span class="muted">Wähle passende Bausteine …</span>'}</div><div class="p13-tiles">${available.map(({txt,i})=>`<button type="button" class="p13-tile" data-ws="tile" data-token="${i}">${esc(txt)}</button>`).join('')}</div>${st.failed===index?'<p class="p14-ws-error">Noch nicht ganz. Ordne die Bausteine neu oder entferne einen.</p>':''}${done?`<div class="p13-feedback"><strong>✓ ¡Muy bien!</strong><p>${esc(t.feedback)}</p></div>${buttons()}`:`<div class="p13-actions"><button type="button" class="secondary" data-ws="clear">↺ Zurücksetzen</button><button type="button" class="primary" data-ws="check" ${chosen.length?'':'disabled'}>Satz prüfen →</button></div>`}`;
    }
    if(t.kind==='complete'){
      if(!st.completed){st.completed=true;save()}
      content=`<div class="p13-complete"><div class="p13-star">✦</div><h2>Werkstatt geschafft!</h2><p>Du hast Bekanntes verknüpft und in eigenen Sätzen angewendet.</p><p class="muted">Ohne SRS-Einträge und ohne Vocab-Wiederholung.</p><button type="button" class="primary" data-ws="next-lesson">Nächste Lektion starten →</button><button type="button" class="secondary" data-ws="hub">Zum Lernweg →</button><button type="button" class="secondary" data-ws="restart">Werkstatt erneut üben ↻</button></div>`;
    }
    root.innerHTML=`<div class="p13-meta"><span>${esc(w.title)} · ${index+1}/${seq.length}</span><span>${Math.round(index/Math.max(1,seq.length-1)*100)} %</span></div><div class="p13-meter"><span style="width:${Math.round(index/Math.max(1,seq.length-1)*100)}%"></span></div>${title(t.title||w.title,'GRAMMATIKWERKSTATT · A1')}<div class="panel p13-card p14-workshop">${index===0?`<p>${esc(w.intro)}</p>`:''}${content}</div>`;
    renderHome();
  }
  function workshopAction(b){
    const w=wsById[whole.active],st=wsState(),seq=wsSteps(w),t=seq[st.step],action=b.dataset.ws;
    if(action==='hub'){stopAudio();navigate?.('learn-hub');return}
    if(action==='next-lesson')return open('l'+(w.after+1));
    if(action==='restart'){whole.workshops[w.id]=wsFresh();save();return render()}
    if(action==='back'){st.step=Math.max(0,st.step-1);save();return render()}
    if(action==='next'){
      if(t.kind==='choice'&&st.answers[st.step]===undefined)return;
      if(t.kind==='build'&&!st.tileVerified[st.step])return;
      st.step=Math.min(seq.length-1,st.step+1);save();return render();
    }
    if(action==='choose'){if(t.kind==='choice'&&st.answers[st.step]===undefined)st.answers[st.step]=Number(b.dataset.index)}
    if(t.kind==='build'){
      const idx=st.step,a=Array.isArray(st.tiles[idx])?[...st.tiles[idx]]:[];
      if(st.tileVerified[idx])return;
      if(action==='tile'&&!a.includes(Number(b.dataset.token)))a.push(Number(b.dataset.token));
      if(action==='remove'){const token=Number(b.dataset.token);const at=a.indexOf(token);if(at>=0)a.splice(at,1)}
      if(action==='clear')a.length=0;
      if(action==='move'){const i=Number(b.dataset.at),j=i+Number(b.dataset.shift);if(j>=0&&j<a.length){[a[i],a[j]]=[a[j],a[i]]}}
      st.tiles[idx]=a;
      if(action==='check'){
        const sentence=a.map(i=>t.tiles[i]);if(sentence.length===t.correct.length&&sentence.every((v,i)=>sameToken(v,t.correct[i])))st.tileVerified[idx]=true;
        else st.failed=idx;
      }else delete st.failed;
    }
    save();render();
  }
  function renderStep(t){
    const l=lesson(),s=state();
    if(t.kind==='welcome')return `${title(l.title,'A1 · BASIS 1 · PAKET '+l.package)}<div class="panel p13-card"><div class="p13-scene-label">${esc(l.subtitle)}</div><p>${esc(l.intro)}</p><div class="p13-hint">Neue Wörter kommen als Multiple Choice – teils Spanisch → Deutsch, teils Deutsch → Spanisch. Danach liest und hörst du den Originaldialog mit sichtbaren Fragen. Nur Wortfehler werden wiederholt; am Ende baust du eigene Antworten.</div><p class="muted">Learn bleibt vom Vocab-SRS getrennt.</p><div class="p13-actions"><button type="button" class="primary" data-p131="next">Wörter entdecken →</button></div></div>`;
    if(t.kind==='snack')return grammarSnack(t.item);
    if(t.kind==='word')return `${title('Wörter entdecken','LEKTION '+l.package+' · WORT '+(t.index+1)+' / '+l.words.length)}<div class="panel p13-card"><div class="p132-direction">${t.item.direction==='de-es'?'DEUTSCH → SPANISCH':'SPANISCH → DEUTSCH'}</div><div class="p13-spanish" ${t.item.direction==='de-es'?'lang="de"':'lang="es"'}>${esc(t.item.direction==='de-es'?t.item.german:t.item.spanish)}</div>${t.item.direction==='de-es'?'':`<div class="p13-audio">${audio(t.item.spanish,t.item.source_card_id)}</div>`}${choices(t.item)}${actions('Weiter →',s.answers[t.id]!==undefined)}</div>`;
    if(t.kind==='listen-start')return `${title('Hören und mitlesen','A1 · DIALOG MIT TEXT')}<div class="panel p13-card"><p>Jetzt begegnen sich die Figuren im Originaldialog <strong>${esc(dia().title)}</strong>. Die Fragen stehen bereits hier, damit du weißt, worauf du achten kannst.</p>${questionsPreview()}${dialogueControls()}${transcript(true)}<p class="p13-listen-state" role="status">${s.listened?'Du kannst jetzt die Fragen beantworten.':'Höre das Gespräch mindestens einmal an und lies dabei mit.'}</p>${actions('Zu den Fragen →',s.listened)}</div>`;
    if(t.kind==='listen-q')return `${title('Was hast du verstanden?','DIALOG · FRAGE '+(t.index+1)+' / '+dia().questions.length)}<div class="panel p13-card"><p class="muted">Die Antworten findest du im Gespräch. Du kannst es erneut anhören und gleichzeitig mitlesen.</p>${dialogueControls()}${transcript(true)}<div class="p132-listen-question">${choices(questionInfo(t.id))}</div>${actions('Weiter →',s.answers[t.id]!==undefined)}</div>`;
    if(t.kind==='transcript')return `${title('Dialog genauer ansehen','MITLESEN & VERSTEHEN')}<div class="panel p13-card"><p>Du kennst die Antworten jetzt. Wenn etwas unklar war, höre einzelne Sprechblasen erneut an und blende ihre Übersetzung ein.</p>${dialogueControls()}${transcript(true)}${actions('Sprachblick →')}</div>`;
    if(t.kind==='note')return `${title(l.note.title,'KURZER SPRACHBLICK')}<div class="panel p13-card"><p>${esc(l.note.body)}</p>${actions('Gelerntes festigen →')}</div>`;
    if(t.kind==='review'){
      const missed=allWrongIds(),todo=pending(),f=s.reviewFeedback;
      if(!missed.length)return `${title('Alles auf Anhieb erkannt!','WISSENSLÜCKEN SCHLIESSEN')}<div class="panel p13-card"><p>Alle Vokabel-Multiple-Choice-Fragen waren beim ersten Versuch richtig. Hörfehler werden hier bewusst nicht erneut abgefragt.</p>${actions('Jetzt anwenden →')}</div>`;
      if(!todo.length&&!f)return `${title('Wissenslücken geschlossen','WIEDERHOLUNG ERLEDIGT')}<div class="panel p13-card"><p>Du hast alle ${missed.length} ursprünglich falsch beantworteten Wortfragen noch einmal richtig gelöst.</p><div class="p13-hint">Fehler sind Teil des Lernens. Die Wiederholung beeinflusst deine Vocab-SRS-Termine nicht.</div>${actions('Jetzt anwenden →')}</div>`;
      let id=f?.id||todo[s.reviewCursor%todo.length];const q=questionInfo(id);
      return `${title('Nochmal in Ruhe','WIEDERHOLUNG · '+(missed.length-todo.length)+' / '+missed.length+' GEKLÄRT')}<div class="panel p13-card">${listeningSuccessFeedback()}<p class="muted">Diese Frage war beim ersten Versuch noch schwierig. Versuch es erneut; die Antwortpositionen wechseln.</p>${q.spanish?`<div class="p13-spanish" ${q.direction==='de-es'?'lang="de"':'lang="es"'}>${esc(q.direction==='de-es'?q.german:q.spanish)}</div>${q.direction==='de-es'?'':`<div class="p13-audio">${audio(q.spanish,q.source_card_id)}</div>`}`:''}${choices(q,{review:true})}${f?`<div class="p13-actions"><button type="button" class="primary" data-p131="review-advance">${f.correct?'Weiter →':'Noch einmal üben →'}</button></div>`:''}</div>`;
    }
    if(t.kind==='choice')return `${title('Das kann ich anwenden','ANWENDEN · AUFGABE '+(t.index+1)+' / '+l.practice.length)}<div class="panel p13-card">${t.index===0?`${listeningSuccessFeedback()}${grammarNote()}`:''}${choices(t.item)}${actions('Weiter →',s.answers[t.id]!==undefined)}</div>`;
    if(t.kind==='build')return `${title('Satzwerkstatt','ANWENDEN · AUFGABE '+(t.index+1)+' / '+l.practice.length)}<div class="panel p13-card">${t.index===0?grammarNote():''}${tileTask(t.id,t.item,'practice')}</div>`;
    if(t.kind==='final-start')return `${title('Du führst das Gespräch!','ABSCHLUSS · DIALOGWERKSTATT')}<div class="panel p13-card"><p>${esc(l.final_intro)}</p><div class="p13-hint"><strong>${l.final.length} Gesprächsschritte</strong> · mehrere richtige Bausteine · zusätzliche Ablenkungen. Auch grammatisch mögliche, aber unpassende Antworten können vorkommen.</div>${actions('Gespräch starten →')}</div>`;
    if(t.kind==='final-build')return finalDialogue(t);
    if(t.kind==='complete'){
      const answered=[...l.words.map(w=>w.id),...dia().questions.map((_,i)=>l.id+'-listen-'+i),...l.practice.filter(x=>x.type==='choice').map(x=>x.id)].every(id=>s.answers[id]!==undefined);
      const built=[...l.practice.filter(x=>x.type==='build').map(x=>x.id),...l.final.map((_,i)=>l.id+'-final-'+i)].every(id=>s.tileVerified[id]);
      if(answered&&built&&!pending().length&&!s.completed){s.completed=true;s.finishedAt=new Date().toISOString();save()}
      return `${title('¡Excelente!','LEKTION '+l.package+' · ABSCHLUSS')}<div class="panel p13-card p13-complete"><div class="p13-star">✦</div><h2>${s.completed?'Lektion geschafft!':'Fast geschafft!'}</h2><p>Du hast neue Ausdrücke erkannt, einen echten Dialog gelesen und gehört und in ${l.final.length} Gesprächsschritten selbst geantwortet.</p><p class="muted">Learn-Fortschritt gespeichert; Vocab und SRS bleiben unverändert.</p>${course.lessons.findIndex(x=>x.id===l.id)<course.lessons.length-1?`<button type="button" class="primary" data-p131="next-lesson">${workshops.some(w=>w.after===l.package)?'Zur Grammatikwerkstatt →':'Nächste Lektion starten →'}</button>`:''}<button type="button" class="secondary" data-p131="hub">Zum Lernweg →</button><button type="button" class="secondary" data-p131="vocab">Diese Wörter in Vocab öffnen →</button><button type="button" class="secondary" data-p131="restart">Lektion neu starten ↻</button></div>`;
    }
    return `<div class="panel">Unbekannter Schritt.</div>`;
  }
  // Retain P13.1/P13.2 step indices, but remove redundant intermediate screens.
  function visibleStep(n,dir=1){
    const seq=steps(),hi=seq.length-1;let index=Math.max(0,Math.min(hi,n));
    while(index>0&&index<hi){const kind=seq[index].kind;
      if(kind==='transcript'||kind==='note'||kind==='final-start'||(kind==='review'&&!pending().length&&!state().reviewFeedback)) index+=dir;
      else break;
    }
    return Math.max(0,Math.min(hi,index));
  }
  function render(){if(!root)return;if(workshopActive()){workshopRender();return;}const s=state();s.step=visibleStep(s.step,1);root.innerHTML=`<div class="p13-meta"><span>Lektion ${lesson().package} · ${s.step+1} / ${steps().length}</span><span>${pct(lesson())} %</span></div><div class="p13-meter"><span style="width:${pct(lesson())}%"></span></div>`+renderStep(current());renderHome()}
  function renderHome(){
    const el=document.getElementById('p131CourseList');if(!el)return;
    const stations=[];
    const shortNames=['¡Hola!','¿De dónde eres?','Un café','Con hielo','Mañana','A las cinco','Mi familia','Pasatiempos','La farmacia','La estación'];
    const workshopLabels=['Erste Sätze','Fragen & Verbformen','Wörter verändern sich'];
    const workshopSubtitles=['Subjekt · Artikel · Satzbau','Personen · Verben · Fragen','Plural · Adjektive · Vorlieben'];
    for(const l of course.lessons){
      const state=whole.lessons[l.id];
      stations.push({id:l.id,kind:'lesson',number:l.package,title:shortNames[l.package-1]||l.title,subtitle:l.subtitle,image:`assets/lesson-art/lesson-${String(l.package).padStart(2,'0')}.webp`,done:!!state.completed,started:!!state.step,percent:pct(l)});
      const w=workshops.find(x=>x.after===l.package);
      if(w){const state=whole.workshops[w.id];const number=workshops.indexOf(w)+1;
        stations.push({id:w.id,kind:'workshop',number,title:workshopLabels[number-1]||w.title,subtitle:workshopSubtitles[number-1]||w.subtitle,image:'assets/lesson-art/workshop.webp',done:!!state.completed,started:!!state.step,percent:state.completed?100:Math.min(99,Math.round(state.step/5*100))});
      }
    }
    const completed=stations.filter(x=>x.done).length;
    const current=stations.find(x=>!x.done)||stations[stations.length-1];
    const resume=stations.find(x=>!x.done&&x.started)||current;
    const p=Math.round(100*completed/Math.max(stations.length,1));
    const completedNode=document.getElementById('ctCourseCompleted'),percentNode=document.getElementById('ctCoursePercent'),bar=document.getElementById('ctCourseBar'),continueBtn=document.getElementById('ctContinueBtn');
    if(completedNode)completedNode.textContent=`${completed} von ${stations.length} Stationen geschafft`;
    if(percentNode)percentNode.textContent=p+' %';
    if(bar)bar.style.width=p+'%';
    if(continueBtn){continueBtn.dataset.courseStart=resume.id;continueBtn.innerHTML=completed===stations.length?'Kurs erneut entdecken <span aria-hidden="true">↗</span>':resume.started?'Hier weitermachen <span aria-hidden="true">↗</span>':'Nächste Station öffnen <span aria-hidden="true">↗</span>'}
    el.innerHTML=stations.map((x,i)=>{
      const active=x.id===resume.id, status=x.done?'done':active?'current':'upcoming';
      const n=x.kind==='workshop'?String.fromCharCode(64+x.number):String(x.number);
      const label=x.kind==='lesson'?`Lektion ${n}`:`Werkstatt ${n}`;
      const statusWord=x.done?'Abgeschlossen':x.started?`Fortsetzen · ${x.percent} %`:active?'Als Nächstes':'Entdecken';
      const node=x.done?'✓':active?'●':x.kind==='workshop'?'✦':'○';
      return `<div class="ct-station ct-${status} ct-${x.kind}" data-station-id="${esc(x.id)}" style="--ct-station-index:${i}">
        <span class="ct-station-node" aria-hidden="true">${node}</span>
        <button type="button" class="ct-station-card" data-course-start="${esc(x.id)}" aria-label="${esc(label+' – '+x.title+', '+statusWord)}">
          <img class="ct-station-image" src="${esc(x.image)}" alt="" loading="lazy" width="90" height="90">
          <span class="ct-station-copy"><small class="ct-station-kicker">${esc(label)}</small><strong>${esc(x.title)}</strong><span class="ct-station-subtitle">${esc(x.subtitle)}</span>${x.started&&!x.done?`<span class="ct-station-mini"><span style="width:${x.percent}%"></span></span>`:''}</span>
          <span class="ct-station-mark" aria-hidden="true">${x.done?'✓':active?'›':'↗'}</span>
        </button>
      </div>`;
    }).join('');
  }
  function go(n){stopAudio();if(workshopActive()){const st=wsState();st.step=Math.max(0,Math.min(wsSteps(wsById[whole.active]).length-1,n));save();return render()}const s=state();s.step=visibleStep(n,n<s.step?-1:1);s.reviewFeedback=null;save();render();window.scrollTo?.(0,0)}
  function next(){if(workshopActive())return;const t=current(),s=state();if((t.kind==='word'||t.kind==='choice'||t.kind==='listen-q')&&s.answers[t.id]===undefined)return;if(t.kind==='listen-start'&&!s.listened)return;if((t.kind==='build'||t.kind==='final-build')&&!s.tileVerified[t.id])return;if(t.kind==='review'&&(pending().length||s.reviewFeedback))return;go(s.step+1)}
  function open(id='l1',navigateFn){if(typeof id==='function'){navigateFn=id;id='l1'}if(typeof navigateFn==='function')navigate=navigateFn;whole.active=byId[id]||wsById[id]?id:'l1';openedTranslations.clear();save();navigate?.('learn-lesson');render()}
  function backHub(){stopAudio();navigate?.('learn-hub')}
  root?.addEventListener('click',ev=>{
    const b=ev.target.closest('button');if(!b)return;
    if(workshopActive()){if(b.dataset.ws)workshopAction(b);return;}
    if(b.hasAttribute('data-p131-listen')){state().listened=true;save();const next=root.querySelector('[data-p131="next"]');if(next)next.disabled=false;const msg=root.querySelector('.p13-listen-state');if(msg)msg.textContent='Wiedergabe angefordert. Du kannst fortfahren.';return;}
    if(b.hasAttribute('data-dialogue-play')||b.hasAttribute('data-dialogue-line')||b.hasAttribute('data-palabra-say'))return;
    const action=b.dataset.p131,s=state(),t=current();if(!action)return;
    if(action==='next')return next();
    if(action==='next-lesson'){const i=course.lessons.findIndex(l=>l.id===whole.active);if(i>=0&&i<course.lessons.length-1){const w=workshops.find(w=>w.after===lesson().package);return open(w?w.id:course.lessons[i+1].id)}return backHub()}
    if(action==='back')return go(s.step-1);
    if(action==='hub')return backHub();
    if(action==='vocab'){stopAudio();window.CuentiloVocabOpenPackage?.('palabra-basis-1',lesson().package);return}
    if(action==='restart'){whole.lessons[whole.active]=fresh();save();return go(0)}
    if(action==='translation'){const i=Number(b.dataset.line);openedTranslations.has(i)?openedTranslations.delete(i):openedTranslations.add(i);render();return}
    if(action==='choice'){if(s.answers[t.id]===undefined){s.answers[t.id]=b.dataset.choice;save();if(t.kind==='listen-q'&&t.index===dia().questions.length-1&&b.dataset.choice===questionInfo(t.id).correct){go(s.step+1)}else render()}return}
    if(action==='review-choice'){
      if(s.reviewFeedback)return;
      const q=questionInfo(b.dataset.id),good=b.dataset.choice===q.correct;
      if(good)s.reviewDone[q.id]=true;else s.reviewFails[q.id]=(s.reviewFails[q.id]||0)+1;
      s.reviewFeedback={id:q.id,chosen:b.dataset.choice,correct:good};save();render();return;
    }
    if(action==='review-advance'){s.reviewFeedback=null;s.reviewCursor++;save();if(!pending().length)return go(s.step+1);render();return}
    if(action==='tile'){const arr=s.tiles[t.id]||[];if(!s.tileVerified[t.id]&&!arr.includes(b.dataset.tile)){s.tiles[t.id]=arr.concat(b.dataset.tile);save();render()}return}
    if(action==='remove-tile'){if(!s.tileVerified[t.id]){s.tiles[t.id]=(s.tiles[t.id]||[]).filter(x=>x!==b.dataset.tile);save();render()}return}
    if(action==='move-tile'){
      if(s.tileVerified[t.id])return;const arr=[...(s.tiles[t.id]||[])],i=Number(b.dataset.index),j=i+Number(b.dataset.shift);
      if(Number.isInteger(i)&&j>=0&&j<arr.length){[arr[i],arr[j]]=[arr[j],arr[i]];s.tiles[t.id]=arr;save();render()};return;
    }
    if(action==='clear-tiles'){if(!s.tileVerified[t.id]){s.tiles[t.id]=[];save();render()}return}
    if(action==='check-tiles'){
      const chosen=s.tiles[t.id]||[],correct=t.item.correct_order;
      const words=Object.fromEntries(t.item.tiles.map(tile=>[tile.id,tile.text]));
      if(chosen.length&&chosen.length===correct.length&&chosen.every((x,i)=>x===correct[i]||sameToken(words[x],words[correct[i]])))s.tileVerified[t.id]=true;
      else s.tileErrors[t.id]=(s.tileErrors[t.id]||0)+1;
      save();render();return;
    }
  });
  let draggingIndex=null;
  root?.addEventListener('dragstart',ev=>{const e=ev.target.closest('.p133-selected-unit');const t=current();if(!e||!t||!['build','final-build'].includes(t.kind)||state().tileVerified[t.id])return;
    draggingIndex=Number(e.dataset.p133Index);ev.dataTransfer?.setData('text/plain',String(draggingIndex));if(ev.dataTransfer)ev.dataTransfer.effectAllowed='move';e.classList.add('p133-dragging');
  });
  root?.addEventListener('dragover',ev=>{const e=ev.target.closest('.p133-selected-unit');if(e&&draggingIndex!==null){ev.preventDefault();if(ev.dataTransfer)ev.dataTransfer.dropEffect='move'}});
  root?.addEventListener('drop',ev=>{const e=ev.target.closest('.p133-selected-unit');const t=current();if(!e||draggingIndex===null||!t||state().tileVerified[t.id])return;
    ev.preventDefault();const arr=[...(state().tiles[t.id]||[])],dest=Number(e.dataset.p133Index);
    if(Number.isInteger(dest)&&dest>=0&&dest<arr.length&&draggingIndex>=0&&draggingIndex<arr.length&&draggingIndex!==dest){const [word]=arr.splice(draggingIndex,1);arr.splice(dest,0,word);state().tiles[t.id]=arr;save();render()};draggingIndex=null;
  });
  root?.addEventListener('dragend',()=>{draggingIndex=null;root.querySelectorAll('.p133-dragging').forEach(x=>x.classList.remove('p133-dragging'))});
  document.addEventListener('click',ev=>{const b=ev.target.closest('[data-course-start]');if(b)open(b.dataset.courseStart,window.CuentiloNavigate||navigate)});
  const exportState=()=>JSON.parse(JSON.stringify(whole));
  function restoreState(obj){
    if(obj?.version===1&&obj.lessons){whole={version:1,p132ReverseDone:!!obj.p132ReverseDone,p14Migrated:!!obj.p14Migrated,active:byId[obj.active]||wsById[obj.active]?obj.active:'l1',lessons:Object.fromEntries(course.lessons.map(l=>[l.id,valid(obj.lessons[l.id])])),workshops:Object.fromEntries(workshops.map(w=>[w.id,obj.workshops?.[w.id]&&typeof obj.workshops[w.id]==='object'?{...wsFresh(),...obj.workshops[w.id]}:wsFresh()]))};migrateLegacyReverse();migrateP14();save();renderHome()}
    else if(obj?.version===1&&obj.answers){ // P13 legacy backup: archive and allow new lesson format to start fresh
      try{localStorage.setItem(legacyKey,JSON.stringify(obj))}catch(_){}
      renderHome();
    }
  }
  return {open,render,renderHome,exportState,restoreState,getStepCount:id=>wsById[id||whole.active]?wsSteps(wsById[id||whole.active]).length:sequences[id||whole.active].length,getCourse:()=>course.lessons.map(l=>({id:l.id,title:l.title,steps:sequences[l.id].length}))};
})();
