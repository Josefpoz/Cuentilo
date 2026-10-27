/* Cuentilo P10: centralized Spanish morphology. Curated verbs only, never invent inflections for unknown lemmas.
 * Preserves story token text, contextual meaning and all legacy lexicon/SRS records.
 */
window.CuentiloVerbs=(()=>{'use strict';
 const R=window.CUENTILO_VERB_REGISTER||{supported:[],aliases:{}};
 const P=['yo','tú','él / ella / usted','nosotros','vosotros','ellos / ustedes'];
 const LABEL={infinitive:'Infinitiv',gerund:'Gerundium',participle:'Partizip',pres:'Presente · Indicativo',impf:'Imperfecto · Indicativo',pret:'Indefinido · Indicativo',fut:'Futuro · Indicativo',cond:'Condicional',sub:'Presente · Subjuntivo',subra:'Imperfecto · Subjuntivo (-ra)',subse:'Imperfecto · Subjuntivo (-se)',perf:'Pretérito perfecto compuesto',plus:'Pluscuamperfecto',subperf:'Perfecto · Subjuntivo',subplus:'Pluscuamperfecto · Subjuntivo',futperf:'Futuro perfecto',condperf:'Condicional compuesto',imper:'Imperativo afirmativo',imperneg:'Imperativo negativo'};
 const finite=Object.keys(LABEL).filter(x=>!['infinitive','gerund','participle'].includes(x)),persons=P;
 const endings={pres:{ar:['o','as','a','amos','áis','an'],er:['o','es','e','emos','éis','en'],ir:['o','es','e','imos','ís','en']},impf:{ar:['aba','abas','aba','ábamos','abais','aban'],er:['ía','ías','ía','íamos','íais','ían'],ir:['ía','ías','ía','íamos','íais','ían']},pret:{ar:['é','aste','ó','amos','asteis','aron'],er:['í','iste','ió','imos','isteis','ieron'],ir:['í','iste','ió','imos','isteis','ieron']},fut:['é','ás','á','emos','éis','án'],cond:['ía','ías','ía','íamos','íais','ían'],sub:{ar:['e','es','e','emos','éis','en'],er:['a','as','a','amos','áis','an'],ir:['a','as','a','amos','áis','an']}};
 const fixed={
 defender:{pres:['defiendo','defiendes','defiende','defendemos','defendéis','defienden'],sub:['defienda','defiendas','defienda','defendamos','defendáis','defiendan']},
 servir:{pres:['sirvo','sirves','sirve','servimos','servís','sirven'],sub:['sirva','sirvas','sirva','sirvamos','sirváis','sirvan'],pret:['serví','serviste','sirvió','servimos','servisteis','sirvieron']},
 ser:{pres:['soy','eres','es','somos','sois','son'],impf:['era','eras','era','éramos','erais','eran'],pret:['fui','fuiste','fue','fuimos','fuisteis','fueron'],sub:['sea','seas','sea','seamos','seáis','sean']},
 ir:{pres:['voy','vas','va','vamos','vais','van'],impf:['iba','ibas','iba','íbamos','ibais','iban'],pret:['fui','fuiste','fue','fuimos','fuisteis','fueron'],sub:['vaya','vayas','vaya','vayamos','vayáis','vayan']},
 estar:{pres:['estoy','estás','está','estamos','estáis','están'],sub:['esté','estés','esté','estemos','estéis','estén']},
 haber:{pres:['he','has','ha','hemos','habéis','han'],impf:['había','habías','había','habíamos','habíais','habían'],pret:['hube','hubiste','hubo','hubimos','hubisteis','hubieron'],sub:['haya','hayas','haya','hayamos','hayáis','hayan']},
 tener:{pres:['tengo','tienes','tiene','tenemos','tenéis','tienen'],sub:['tenga','tengas','tenga','tengamos','tengáis','tengan']},
 venir:{pres:['vengo','vienes','viene','venimos','venís','vienen'],sub:['venga','vengas','venga','vengamos','vengáis','vengan']},
 hacer:{pres:['hago','haces','hace','hacemos','hacéis','hacen'],sub:['haga','hagas','haga','hagamos','hagáis','hagan']},
 decir:{pres:['digo','dices','dice','decimos','decís','dicen'],sub:['diga','digas','diga','digamos','digáis','digan']},
 poder:{pres:['puedo','puedes','puede','podemos','podéis','pueden'],sub:['pueda','puedas','pueda','podamos','podáis','puedan']},
 poner:{pres:['pongo','pones','pone','ponemos','ponéis','ponen'],sub:['ponga','pongas','ponga','pongamos','pongáis','pongan']},
 salir:{pres:['salgo','sales','sale','salimos','salís','salen'],sub:['salga','salgas','salga','salgamos','salgáis','salgan']},
 saber:{pres:['sé','sabes','sabe','sabemos','sabéis','saben'],sub:['sepa','sepas','sepa','sepamos','sepáis','sepan']},
 querer:{pres:['quiero','quieres','quiere','queremos','queréis','quieren'],sub:['quiera','quieras','quiera','queramos','queráis','quieran']},
 dar:{pres:['doy','das','da','damos','dais','dan'],pret:['di','diste','dio','dimos','disteis','dieron'],sub:['dé','des','dé','demos','deis','den']},
 ver:{pres:['veo','ves','ve','vemos','veis','ven'],impf:['veía','veías','veía','veíamos','veíais','veían'],pret:['vi','viste','vio','vimos','visteis','vieron'],sub:['vea','veas','vea','veamos','veáis','vean']},
 andar:{pret:['anduve','anduviste','anduvo','anduvimos','anduvisteis','anduvieron']},
 traer:{pres:['traigo','traes','trae','traemos','traéis','traen'],sub:['traiga','traigas','traiga','traigamos','traigáis','traigan']},
 oír:{pres:['oigo','oyes','oye','oímos','oís','oyen'],sub:['oiga','oigas','oiga','oigamos','oigáis','oigan'],pret:['oí','oíste','oyó','oímos','oísteis','oyeron']},
 caer:{pres:['caigo','caes','cae','caemos','caéis','caen'],sub:['caiga','caigas','caiga','caigamos','caigáis','caigan'],pret:['caí','caíste','cayó','caímos','caísteis','cayeron']},
 leer:{pret:['leí','leíste','leyó','leímos','leísteis','leyeron']},
 creer:{pret:['creí','creíste','creyó','creímos','creísteis','creyeron']},
 conducir:{pres:['conduzco','conduces','conduce','conducimos','conducís','conducen'],sub:['conduzca','conduzcas','conduzca','conduzcamos','conduzcáis','conduzcan']},
 traducir:{pres:['traduzco','traduces','traduce','traducimos','traducís','traducen'],sub:['traduzca','traduzcas','traduzca','traduzcamos','traduzcáis','traduzcan']},
 producir:{pres:['produzco','produces','produce','producimos','producís','producen'],sub:['produzca','produzcas','produzca','produzcamos','produzcáis','produzcan']},
 conocer:{pres:['conozco','conoces','conoce','conocemos','conocéis','conocen'],sub:['conozca','conozcas','conozca','conozcamos','conozcáis','conozcan']},
 dormir:{pres:['duermo','duermes','duerme','dormimos','dormís','duermen'],sub:['duerma','duermas','duerma','durmamos','durmáis','duerman'],pret:['dormí','dormiste','durmió','dormimos','dormisteis','durmieron']},
 morir:{pres:['muero','mueres','muere','morimos','morís','mueren'],sub:['muera','mueras','muera','muramos','muráis','mueran'],pret:['morí','moriste','murió','morimos','moristeis','murieron']},
 pedir:{pres:['pido','pides','pide','pedimos','pedís','piden'],sub:['pida','pidas','pida','pidamos','pidáis','pidan'],pret:['pedí','pediste','pidió','pedimos','pedisteis','pidieron']},
 seguir:{pres:['sigo','sigues','sigue','seguimos','seguís','siguen'],sub:['siga','sigas','siga','sigamos','sigáis','sigan'],pret:['seguí','seguiste','siguió','seguimos','seguisteis','siguieron']},
 conseguir:{pres:['consigo','consigues','consigue','conseguimos','conseguís','consiguen'],sub:['consiga','consigas','consiga','consigamos','consigáis','consigan'],pret:['conseguí','conseguiste','consiguió','conseguimos','conseguisteis','consiguieron']},
 sentir:{pres:['siento','sientes','siente','sentimos','sentís','sienten'],sub:['sienta','sientas','sienta','sintamos','sintáis','sientan'],pret:['sentí','sentiste','sintió','sentimos','sentisteis','sintieron']},
 preferir:{pres:['prefiero','prefieres','prefiere','preferimos','preferís','prefieren'],sub:['prefiera','prefieras','prefiera','prefiramos','prefiráis','prefieran'],pret:['preferí','preferiste','prefirió','preferimos','preferisteis','prefirieron']},
 repetir:{pres:['repito','repites','repite','repetimos','repetís','repiten'],sub:['repita','repitas','repita','repitamos','repitáis','repitan'],pret:['repetí','repetiste','repitió','repetimos','repetisteis','repitieron']},
 elegir:{pres:['elijo','eliges','elige','elegimos','elegís','eligen'],sub:['elija','elijas','elija','elijamos','elijáis','elijan'],pret:['elegí','elegiste','eligió','elegimos','elegisteis','eligieron']},
 corregir:{pres:['corrijo','corriges','corrige','corregimos','corregís','corrigen'],sub:['corrija','corrijas','corrija','corrijamos','corrijáis','corrijan'],pret:['corregí','corregiste','corrigió','corregimos','corregisteis','corrigieron']},
 jugar:{pres:['juego','juegas','juega','jugamos','jugáis','juegan'],sub:['juegue','juegues','juegue','juguemos','juguéis','jueguen']},
 empezar:{pres:['empiezo','empiezas','empieza','empezamos','empezáis','empiezan'],sub:['empiece','empieces','empiece','empecemos','empecéis','empiecen']},
 comenzar:{pres:['comienzo','comienzas','comienza','comenzamos','comenzáis','comienzan'],sub:['comience','comiences','comience','comencemos','comencéis','comiencen']},
 pensar:{pres:['pienso','piensas','piensa','pensamos','pensáis','piensan'],sub:['piense','pienses','piense','pensemos','penséis','piensen']},
 cerrar:{pres:['cierro','cierras','cierra','cerramos','cerráis','cierran'],sub:['cierre','cierres','cierre','cerremos','cerréis','cierren']},
 entender:{pres:['entiendo','entiendes','entiende','entendemos','entendéis','entienden'],sub:['entienda','entiendas','entienda','entendamos','entendáis','entiendan']},
 perder:{pres:['pierdo','pierdes','pierde','perdemos','perdéis','pierden'],sub:['pierda','pierdas','pierda','perdamos','perdáis','pierdan']},
 volver:{pres:['vuelvo','vuelves','vuelve','volvemos','volvéis','vuelven'],sub:['vuelva','vuelvas','vuelva','volvamos','volváis','vuelvan']},
 contar:{pres:['cuento','cuentas','cuenta','contamos','contáis','cuentan'],sub:['cuente','cuentes','cuente','contemos','contéis','cuenten']},
 encontrar:{pres:['encuentro','encuentras','encuentra','encontramos','encontráis','encuentran'],sub:['encuentre','encuentres','encuentre','encontremos','encontréis','encuentren']},
 mostrar:{pres:['muestro','muestras','muestra','mostramos','mostráis','muestran'],sub:['muestre','muestres','muestre','mostremos','mostréis','muestren']},
 recordar:{pres:['recuerdo','recuerdas','recuerda','recordamos','recordáis','recuerdan'],sub:['recuerde','recuerdes','recuerde','recordemos','recordéis','recuerden']},
 probar:{pres:['pruebo','pruebas','prueba','probamos','probáis','prueban'],sub:['pruebe','pruebes','pruebe','probemos','probéis','prueben']},
 construir:{pres:['construyo','construyes','construye','construimos','construís','construyen'],sub:['construya','construyas','construya','construyamos','construyáis','construyan'],pret:['construí','construiste','construyó','construimos','construisteis','construyeron']},
 incluir:{pres:['incluyo','incluyes','incluye','incluimos','incluís','incluyen'],sub:['incluya','incluyas','incluya','incluyamos','incluyáis','incluyan'],pret:['incluí','incluiste','incluyó','incluimos','incluisteis','incluyeron']},
 huir:{pres:['huyo','huyes','huye','huimos','huís','huyen'],sub:['huya','huyas','huya','huyamos','huyáis','huyan'],pret:['huí','huiste','huyó','huimos','huisteis','huyeron']}
 };
 const stemChange={
  ei:['asentir','referir','requerir','advertir','ascender','atender','apretar','encender','negar','despertar','convertir','perseguir','reunir','sentarse','pensar','cerrar','entender','perder','comenzar','empezar','sentir','preferir','distinguir','fregar','querer','negarse'],
  ou:['acordar','acostarse','colgar','costar','contar','demostrar','devolver','doler','encontrar','mover','mostrar','oler','poder','probar','recordar','resolver','soltar','sonar','volver','dormir','morir','jugar'],
  eiSimple:['advertir','convertir','mentir','sentir','preferir','perseguir','divertir','consentir'],
  eiRaise:['asentir','referir','requerir','convertir','perseguir','advertir','referir','requerir','asentir','sentir','preferir','mentir','divertir','consentir'],
  ee:['perseguir','pedir','servir','repetir','seguir','conseguir','elegir','corregir','despedir','vestir','medir','reír','sonreír'],
 };
 const otherFixed={
 llover:{pres:['lluevo','llueves','llueve','llovemos','llovéis','llueven'],sub:['llueva','lluevas','llueva','llovamos','llováis','lluevan']},
 mentir:{pres:['miento','mientes','miente','mentimos','mentís','mienten'],sub:['mienta','mientas','mienta','mintamos','mintáis','mientan'],pret:['mentí','mentiste','mintió','mentimos','mentisteis','mintieron']},
 reunir:{pres:['reúno','reúnes','reúne','reunimos','reunís','reúnen'],sub:['reúna','reúnas','reúna','reunamos','reunáis','reúnan']},
 fiar:{pres:['fío','fías','fía','fiamos','fiáis','fían'],sub:['fíe','fíes','fíe','fiemos','fiéis','fíen']},
  caber:{pres:['quepo','cabes','cabe','cabemos','cabéis','caben'],sub:['quepa','quepas','quepa','quepamos','quepáis','quepan']},
  valer:{pres:['valgo','vales','vale','valemos','valéis','valen'],sub:['valga','valgas','valga','valgamos','valgáis','valgan']},
  oler:{pres:['huelo','hueles','huele','olemos','oléis','huelen'],sub:['huela','huelas','huela','olamos','oláis','huelan']},
  reír:{pres:['río','ríes','ríe','reímos','reís','ríen'],sub:['ría','rías','ría','riamos','riáis','rían'],pret:['reí','reíste','rio','reímos','reísteis','rieron']},
  sonreír:{pres:['sonrío','sonríes','sonríe','sonreímos','sonreís','sonríen'],sub:['sonría','sonrías','sonría','sonriamos','sonriáis','sonrían'],pret:['sonreí','sonreíste','sonrió','sonreímos','sonreísteis','sonrieron']},
  enviar:{pres:['envío','envías','envía','enviamos','enviáis','envían'],sub:['envíe','envíes','envíe','enviemos','enviéis','envíen']},
  confiar:{pres:['confío','confías','confía','confiamos','confiáis','confían'],sub:['confíe','confíes','confíe','confiemos','confiéis','confíen']},
  continuar:{pres:['continúo','continúas','continúa','continuamos','continuáis','continúan'],sub:['continúe','continúes','continúe','continuemos','continuéis','continúen']},
  distinguir:{pres:['distingo','distingues','distingue','distinguimos','distinguís','distinguen'],sub:['distinga','distingas','distinga','distingamos','distingáis','distingan']},
  oír:fixed.oír
 };Object.assign(fixed,otherFixed);
 const FAMILY_MAP={contener:'tener',detener:'tener',mantener:'tener',obtener:'tener',sostener:'tener',proponer:'poner',componer:'poner',disponer:'poner',suponer:'poner',convenir:'venir',intervenir:'venir',prevenir:'venir',sobresalir:'salir',reproducir:'producir',reconocer:'conocer',prever:'ver',oponer:'poner',desconfiar:'confiar',devolver:'volver',reconstruir:'construir'};
 function familyOf(base){const root=FAMILY_MAP[base];return root?{root,prefix:base.slice(0,-root.length)}:null;}
 function patternFor(base){
  if((stemChange.ee.includes(base)||stemChange.ee.includes(base+'se')))return 'ei';
  if((stemChange.ei.includes(base)||stemChange.ei.includes(base+'se')))return 'ie';
  if((stemChange.ou.includes(base)||stemChange.ou.includes(base+'se')))return base==='jugar'?'ue':'ue';
  return null;
 }
 function replaceVowel(stem,pattern){const last=stem.lastIndexOf(pattern==='ue'?'o':'e');
  return last<0?stem:stem.slice(0,last)+(pattern==='ue'?'ue':pattern==='ie'?'ie':'i')+stem.slice(last+1);
 }
 const irregularPret={caber:['cup','normal'],introducir:['introduj','j'],tener:['tuv','normal'],estar:['estuv','normal'],andar:['anduv','normal'],venir:['vin','normal'],poder:['pud','normal'],poner:['pus','normal'],saber:['sup','normal'],querer:['quis','normal'],haber:['hub','normal'],hacer:['hic','hacer'],decir:['dij','j'],traer:['traj','j'],conducir:['conduj','j'],traducir:['traduj','j'],producir:['produj','j']};
 const futureRoots={tener:'tendr',poner:'pondr',venir:'vendr',salir:'saldr',poder:'podr',saber:'sabr',haber:'habr',hacer:'har',decir:'dir',querer:'querr',caber:'cabr',valer:'valdr'};
 const participles={descubrir:'descubierto',leer:'leído',creer:'creído',caer:'caído',traer:'traído',oír:'oído',abrir:'abierto',cubrir:'cubierto',decir:'dicho',escribir:'escrito',hacer:'hecho',morir:'muerto',poner:'puesto',resolver:'resuelto',romper:'roto',ver:'visto',volver:'vuelto',freír:'frito'};
 const gerunds={ir:'yendo',ser:'siendo',reír:'riendo',sonreír:'sonriendo',convertir:'convirtiendo',mentir:'mintiendo',reunir:'reuniendo',ir:'yendo',decir:'diciendo',dormir:'durmiendo',morir:'muriendo',pedir:'pidiendo',sentir:'sintiendo',servir:'sirviendo',repetir:'repitiendo',seguir:'siguiendo',conseguir:'consiguiendo',preferir:'prefiriendo',elegir:'eligiendo',corregir:'corrigiendo',poder:'pudiendo',venir:'viniendo',leer:'leyendo',creer:'creyendo',caer:'cayendo',oír:'oyendo',traer:'trayendo',construir:'construyendo',incluir:'incluyendo',huir:'huyendo'};
 const irregularTu={decir:'di',hacer:'haz',ir:'ve',poner:'pon',salir:'sal',ser:'sé',tener:'ten',venir:'ven'};
 const spelling=(base,root,mode,i)=>{
  if(mode==='pret'&&i===0){if(base.endsWith('car'))return root.replace(/c$/,'qu');if(base.endsWith('gar'))return root.replace(/g$/,'gu');if(base.endsWith('zar'))return root.replace(/z$/,'c');}
  if(mode==='sub'&&base.endsWith('car'))return root.replace(/c$/,'qu');
  if(mode==='sub'&&base.endsWith('gar'))return root.replace(/g$/,'gu');
  if(base.endsWith('guar')&&(mode==='sub'||mode==='pret'&&i===0))return root.replace(/gu$/,'gü');
  if(mode==='sub'&&base.endsWith('zar'))return root.replace(/z$/,'c');
  return root;
 };
 function canonical(input){let s=String(input||'').normalize('NFC').trim().toLocaleLowerCase('es');if(R.aliases[s])s=R.aliases[s];return s;}
 function baseOf(input){const lemma=canonical(input);if(lemma.endsWith('se')&&R.supported.includes(lemma))return {lemma,base:lemma.slice(0,-2),reflexive:true};if(R.supported.includes(lemma))return {lemma,base:lemma,reflexive:false};if(lemma.endsWith('se')&&R.supported.includes(lemma.slice(0,-2)))return {lemma,base:lemma.slice(0,-2),reflexive:true};return null;}
 function allowed(lemma){return !!baseOf(lemma)}
 function acuteLast(s){const m=[...s].map((c,i)=>/[aeiou]/.test(c)?i:-1).filter(i=>i>=0);if(!m.length)return s;const i=m[m.length-1];return s.slice(0,i)+({a:'á',e:'é',i:'í',o:'ó',u:'ú'}[s[i]])+s.slice(i+1)}
 function accentEnclitic(word){if(/[áéíóú]/.test(word))return word;
  const nuclei=[...word.matchAll(/[aeiouáéíóú]+/g)];if(nuclei.length<2)return word;
  const n=nuclei[nuclei.length-2];const at=n.index+(n[0].includes('e')?n[0].lastIndexOf('e'):n[0].length-1);
  const letter=word[at],accent={a:'á',e:'é',i:'í',o:'ó',u:'ú'}[letter];return accent?word.slice(0,at)+accent+word.slice(at+1):word;
 }
 function participle(base){if(participles[base])return participles[base];const f=familyOf(base);if(f&&participle(f.root)!==f.root.slice(0,-2)+(f.root.endsWith('ar')?'ado':'ido'))return f.prefix+participle(f.root);
   if(base==='describir')return 'descrito'; if(base==='prever')return 'previsto';if(base==='reír')return 'reído';if(base==='sonreír')return 'sonreído';
   return base.slice(0,-2)+(base.endsWith('ar')?'ado':'ido')}

 function gerund(base){if(gerunds[base])return gerunds[base]; const f=familyOf(base);if(f&&gerunds[f.root])return f.prefix+gerunds[f.root];
   if(base.endsWith('uir')&&!base.endsWith('guir'))return base.slice(0,-2)+'yendo';
   if(base.endsWith('eer'))return base.slice(0,-2)+'yendo';
   return base.slice(0,-2)+(base.endsWith('ar')?'ando':'iendo')}

 function pretArray(base){if(fixed[base]?.pret)return fixed[base].pret.slice();
  const family=familyOf(base);if(family)return pretArray(family.root).map((s,i)=>base==='prever'&&i===0?'preví':family.prefix+s);
  if(base.endsWith('uir')&&!base.endsWith('guir'))return ['í','iste','yó','imos','isteis','yeron'].map((s,i)=>base.slice(0,-2)+s);
  if(base.endsWith('eer'))return ['í','íste','yó','ímos','ísteis','yeron'].map((s,i)=>base.slice(0,-2)+s);
  if(stemChange.eiRaise.includes(base)||stemChange.ee.includes(base)||['dormir','morir'].includes(base)){
   const forms=Array.from({length:6},(_,i)=>spelling(base,base.slice(0,-2),'pret',i)+endings.pret[base.slice(-2)][i]);
   for(const i of [2,5]){const changed=replaceVowel(base.slice(0,-2),['dormir','morir'].includes(base)?'ue':'i');forms[i]=changed+endings.pret[base.slice(-2)][i]};return forms;
  }
if(irregularPret[base]){const [root,kind]=irregularPret[base];const suff=['e','iste','o','imos','isteis',kind==='j'?'eron':'ieron'];return suff.map((x,i)=>base==='hacer'&&i===2?'hizo':root+x)}
  return Array.from({length:6},(_,i)=>spelling(base,base.slice(0,-2),'pret',i)+endings.pret[base.slice(-2)][i]);}
 function generate(input,tense,idx){const p=baseOf(input);if(!p||!LABEL[tense]||!Number.isInteger(idx)||idx<0||idx>5)return null;
  if(p.base==='prever'&&tense==='pret'&&idx===0)return 'preví';
  const {base,reflexive}=p,conj=(base.endsWith('ír')?'ir':base.slice(-2)),stem=base.slice(0,-2),fixedFor=fixed[base]?.[tense];let result=null;
  const family=familyOf(base);
  if(family&&!['imperneg','imper','perf','plus','subperf','subplus','futperf','condperf'].includes(tense)&&!reflexive){const inherited=generate(family.root,tense,idx);if(inherited)return family.prefix+inherited;}

  if(tense==='pres'||tense==='impf'||tense==='pret'||tense==='sub'){
   if(fixedFor)result=fixedFor[idx];
   else if(tense==='pret')result=pretArray(base)[idx];
   else if(tense==='sub'){
    const yo=fixed[base]?.pres?.[0];let subStem=stem;
    if(yo&&yo.endsWith('go'))subStem=yo.slice(0,-1);
    if((base.endsWith('ecer')||base.endsWith('ocer')||base.endsWith('ucir'))&&base!=='hacer')subStem=stem.replace(/c$/,'zc');
    if(base.endsWith('ger')||base.endsWith('gir'))subStem=stem.replace(/g$/,'j');
    if(base.endsWith('guir'))subStem=stem.replace(/gu$/,'g');
    if(base.endsWith('uir')&&!base.endsWith('guir'))subStem=stem+'y';
    if(patternFor(base)&&!(idx===3||idx===4)){subStem=replaceVowel(stem,patternFor(base))}
    if((base.endsWith('ir')&&patternFor(base))&&(idx===3||idx===4))subStem=replaceVowel(stem,'i');

    if(base==='conocer')subStem='conozc';
    const safeStem=spelling(base,subStem,'sub',idx);
    result=safeStem+endings.sub[conj][idx];
   }else if(tense==='pres'){
     let changedStem=stem;
     if(base.endsWith('uir')&&!base.endsWith('guir'))changedStem=idx===3||idx===4?stem:stem+'y';
     if(base.endsWith('ecer')||base.endsWith('ocer')||base.endsWith('ucir')){if(idx===0)changedStem=stem.replace(/c$/,'zc')}
     if((base.endsWith('ger')||base.endsWith('gir'))&&idx===0)changedStem=stem.replace(/g$/,'j');
     if(base.endsWith('guir')&&idx===0)changedStem=stem.replace(/gu$/,'g');
     if(patternFor(base)&&![3,4].includes(idx))changedStem=replaceVowel(stem,patternFor(base));
     result=changedStem+endings.pres[conj][idx];
   }else result=stem+endings[tense][conj][idx];
  }else if(tense==='fut'||tense==='cond')result=(futureRoots[base]||(base==='oír'?'oir':(base==='reír'||base==='sonreír'?base.replace('í','i'):base)))+endings[tense][idx];
  else if(tense==='subra'||tense==='subse'){
   const form=pretArray(base)[5],core=form.replace(/ron$/,'');
   const suffix=(tense==='subra'?['ra','ras','ra','ramos','rais','ran']:['se','ses','se','semos','seis','sen'])[idx];
   result=(idx===3?acuteLast(core):core)+suffix;
  }else if(['perf','plus','subperf','subplus','futperf','condperf'].includes(tense)){
   const aux=tense==='perf'?fixed.haber.pres[idx]:tense==='plus'?fixed.haber.impf[idx]:tense==='subperf'?fixed.haber.sub[idx]:tense==='subplus'?generate('haber','subra',idx):generate('haber',tense==='futperf'?'fut':'cond',idx);
   result=aux+' '+participle(base);
  }else if(tense==='imper'||tense==='imperneg'){
   if(idx===0)return null;
   const s=generate(base,'sub',idx);
   if(tense==='imperneg')result='no '+s;
   else if(idx===1)result=irregularTu[base]||generate(base,'pres',2);
   else if(idx===4)result=base.slice(0,-1)+'d';
   else result=s;
  }
  if(!result)return null;
  if(reflexive){const cl=['me','te','se','nos','os','se'][idx];if(tense==='imper'&&idx!==0){
     if(base==='ir')result=['','vete','váyase','vámonos','idos','váyanse'][idx];
     else if(idx===4)result=result.replace(/d$/,'')+'os';
     else if(idx===3)result=accentEnclitic(result.replace(/s$/,''))+'nos';
     else result=accentEnclitic(result)+cl;
   }else if(tense==='imperneg')result='no '+cl+' '+result.replace(/^no /,'');else result=cl+' '+result;}
  return result;
 }
 function paradigm(lemma,tense){return P.map((_,i)=>generate(lemma,tense,i))}
 function explain(lemma,tense,idx){const p=baseOf(lemma);if(!p)return null;
  let info='Die Form richtet sich nach Person, Zeitform und Modus.';
  if(tense==='subra'||tense==='subse')info='Der Subjuntivo Imperfekt wird vom Stamm der 3. Person Plural im Indefinido gebildet. Bei nosotros erhält der Stamm einen Akzent. Er steht unter anderem in hypothetischen si-Sätzen mit Konditional im Hauptsatz.';
  else if(tense==='sub')info='Der Subjuntivo steht häufig nach Ausdrücken für Wünsche, Zweifel und Bewertungen; der Zusammenhang im Satz entscheidet.';
  else if(tense==='impf')info='Das Imperfecto beschreibt häufig gewohnheitsmäßige, andauernde oder hintergründige Vorgänge in der Vergangenheit.';
  else if(tense==='pret')info='Das Indefinido stellt häufig abgeschlossene Ereignisse in der Vergangenheit dar.';
  else if(tense==='cond')info='Das Condicional dient unter anderem für hypothetische Folgen und höfliche Wünsche.';
  else if(tense==='fut')info='Das Futuro simple beschreibt unter anderem Zukünftiges oder eine Vermutung.';
  else if(tense==='perf'||tense==='plus'||tense==='subperf')info='Zusammengesetzte Form: eine passende Form von haber plus Partizip. Die Bedeutung hängt vom zeitlichen und syntaktischen Kontext ab.';
  else if(tense==='imper'||tense==='imperneg')info='Die Befehlsform unterscheidet sich bei bejahter und verneinter Aufforderung.';
  return info;
 }
 // A validated form search is prepared from the closed register. Ambiguous forms retain all candidates.
 let reverse=null;function formIndex(){if(reverse)return reverse;reverse=new Map();for(const lemma of R.supported){for(const tense of finite){for(let person=0;person<6;person++){
  const form=generate(lemma,tense,person);if(!form)continue;const key=form.toLocaleLowerCase('es');if(!reverse.has(key))reverse.set(key,[]);reverse.get(key).push({lemma,tense,person});
 }}}return reverse;}
 function analyse(form,lemmaHint){const word=String(form||'').trim().normalize('NFC').toLocaleLowerCase('es');const possibles=(formIndex().get(word)||[]);if(!lemmaHint)return possibles;
  const wanted=baseOf(lemmaHint);return wanted?possibles.filter(x=>x.lemma===wanted.base):possibles;}
 function lower(s){return String(s||'').trim().normalize('NFC').toLocaleLowerCase('es')}
 function unaccent(s){return lower(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
 const clitics=['nos','los','las','les','me','te','se','os','lo','la','le'];
 function peel(word){let w=lower(word),removed=[];for(let i=0;i<3;i++){
  let c=clitics.find(x=>w.endsWith(x)&&w.length>=x.length+2);if(!c)break;w=w.slice(0,-c.length);removed.unshift(c);
 }return {bare:w,clitics:removed}}
 function filterContext(cases,label){label=lower(label);let target='';
  if(/indefinido/.test(label))target='pret';else if(/imperfecto/.test(label))target='impf';
  else if(/condicional/.test(label))target='cond';else if(/futuro/.test(label))target='fut';
  else if(/subjuntivo/.test(label))target='sub';else if(/presente|präsens/.test(label))target='pres';
  else if(/infinitiv/.test(label))target='infinitive';else if(/gerund/.test(label))target='gerund';
  else if(/partizip/.test(label))target='participle';
  return target&&cases.some(x=>x.tense===target)?cases.filter(x=>x.tense===target):cases;
 }
 function fromStory(token){if(!token||token.pos!=='verb')return null;
  const surface=String(token.text||'').trim(),low=lower(surface),rawLemma=lower(token.lemma);
  if(R.nonverbalMismatches?.[token.id])return {nonverbal:true,form:surface,original:rawLemma,corrected:R.nonverbalMismatches[token.id]};
  const lemma=canonical(rawLemma),entry=baseOf(lemma);
  if(!entry)return {unknown:true,form:surface,lemma:token.lemma};
  let cases=analyse(surface,lemma);
  if(low==='vení'&&entry.base==='venir')cases=[{lemma:entry.lemma,tense:'imper',person:1,usage:'Imperativ mit voseo (Regionalform)'}];
  if(low==='traé'&&entry.base==='traer')cases=[{lemma:entry.lemma,tense:'imper',person:1,usage:'Imperativ mit voseo (Regionalform)'}];
  if(low==='hay'&&entry.base==='haber')cases=[{lemma:entry.lemma,tense:'pres',person:null,usage:'unpersönliche Form'}];
  if(!cases.length){
   const stripped=low.replace(/^(me|te|se|nos|os)\s+/,'');const peeled=peel(stripped);
   for(const t of finite){for(let i=0;i<6;i++){
    let candidate=generate(entry.lemma,t,i);if(!candidate)continue;
    let candidateBare=lower(candidate).replace(/^(no\s+)?(me|te|se|nos|os)\s+/,'').replace(/^no\s+/,'');
    if(stripped===candidateBare){cases.push({lemma:entry.lemma,tense:t,person:i,usage:entry.reflexive?'Reflexivpronomen als separates Wort':null});continue;}
    if(peeled.clitics.length&&t==='imper'&&unaccent(peeled.bare)===unaccent(candidateBare))cases.push({lemma:entry.lemma,tense:t,person:i,usage:'angehängtes Pronomen'});
   }}
   const ger=gerund(entry.base),part=participle(entry.base);
   if(low===entry.lemma||low===entry.base)cases.push({lemma:entry.lemma,tense:'infinitive',person:null});
   if(low===ger)cases.push({lemma:entry.lemma,tense:'gerund',person:null});
   if(low===part)cases.push({lemma:entry.lemma,tense:'participle',person:null});
   if(!cases.length&&peeled.clitics.length){
    if(unaccent(peeled.bare)===unaccent(entry.base))cases.push({lemma:entry.lemma,tense:'infinitive',person:null,usage:'angehängtes Pronomen'});
    if(unaccent(peeled.bare)===unaccent(ger))cases.push({lemma:entry.lemma,tense:'gerund',person:null,usage:'angehängtes Pronomen'});
   }
   if(!cases.length){const partStem=part.replace(/[oa]$/,'');if([partStem+'a',partStem+'os',partStem+'as'].includes(low))cases.push({lemma:entry.lemma,tense:'participle',person:null,usage:'Partizip mit Genus-/Numerus-Anpassung'});}
  }
  cases=filterContext(cases,token.form);
  const seen=new Set();cases=cases.filter(c=>{const k=c.tense+':'+c.person;if(seen.has(k))return false;seen.add(k);return true});
  return {lemma:entry.lemma,form:surface,analyses:cases,unverified:!cases.length};
 }
 // Didactic split is guaranteed by concatenating the selected parts; in strong preterites the stem is not the infinitive stem.
 function split(lemma,tense,person){const form=generate(lemma,tense,person);if(!form)return null;
  if(['perf','plus','subperf','subplus','futperf','condperf'].includes(tense)){const at=form.lastIndexOf(' ');if(at>=0)return {stem:form.slice(0,at),ending:form.slice(at+1),form,joiner:' ',kind:'compound'};}
  if(tense==='imperneg'){const i=form.lastIndexOf(' ');return i>=0?{stem:form.slice(0,i),ending:form.slice(i+1),form,joiner:' ',kind:'negative-imperative'}:{stem:form,ending:'',form};}
  if(form.includes(' ')&&tense==='imper')return {stem:form,ending:'',form};
  const p=baseOf(lemma);if(!p)return null;const base=p.base;
  if(tense==='imper'&&person>0){const e=person===1?(base.endsWith('ar')?'a':'e'):person===4?(base.endsWith('ar')?'ad':base.endsWith('er')?'ed':'id'):endings.sub[base.endsWith('ír')?'ir':base.slice(-2)][person];if(form.endsWith(e)&&form.length>e.length)return {stem:form.slice(0,-e.length),ending:e,form};}
  if(['pres','impf','pret','sub','subra','subse','fut','cond'].includes(tense)){
   const endingsOrdered={pres:{ar:endings.pres.ar,er:endings.pres.er,ir:endings.pres.ir},impf:endings.impf,pret:endings.pret,sub:endings.sub,subra:{ar:['ra','ras','ra','ramos','rais','ran'],er:['ra','ras','ra','ramos','rais','ran'],ir:['ra','ras','ra','ramos','rais','ran']},subse:{ar:['se','ses','se','semos','seis','sen'],er:['se','ses','se','semos','seis','sen'],ir:['se','ses','se','semos','seis','sen']},fut:{ar:endings.fut,er:endings.fut,ir:endings.fut},cond:{ar:endings.cond,er:endings.cond,ir:endings.cond}};
   const suffix=endingsOrdered[tense][base.endsWith('ír')?'ir':base.slice(-2)][person];if(form.endsWith(suffix))return {stem:form.slice(0,-suffix.length),ending:suffix,form};
  }return {stem:form,ending:'',form};
 }
 return {PERSONS:P,LABEL,finite,supported:R.supported,aliases:R.aliases,baseOf,allowed,generate,paradigm,analyse,fromStory,explain,split,participle,gerund};
})();
