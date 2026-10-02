import { useMemo, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { analyseExercise, type SmartAnalysis } from '../utils/smartDetect';
import StepDisplay from './StepDisplay';
import PageHeader from './PageHeader';

interface Props{lang:Lang;onOpenChapter:(id:string)=>void;}
interface ParsedQuestion{raw:string;analysis:SmartAnalysis|null;}

function unescapePdfString(value:string):string{
  return value.replace(/\\([nrtbf()\\])/g,(_,c)=>(({n:'\n',r:'\r',t:'\t',b:'',f:'','(':'(',')':')','\\':'\\'} as Record<string,string>)[c]??c)).replace(/\\([0-7]{1,3})/g,(_,o)=>String.fromCharCode(parseInt(o,8)));
}
function extractPdfTextOperators(source:string):string[]{
  const out:string[]=[];
  const add=(s:string)=>{const clean=unescapePdfString(s).replace(/\s+/g,' ').trim();if(clean.length>1)out.push(clean);};
  for(const m of source.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g))add(m[1]);
  for(const m of source.matchAll(/\[((?:.|\n|\r)*?)\]\s*TJ/g))for(const p of m[1].matchAll(/\(((?:\\.|[^\\)])*)\)/g))add(p[1]);
  return out;
}
async function inflatePdfStreams(raw:string):Promise<string[]>{
  const out:string[]=[];const re=/<<(.*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  for(const m of raw.matchAll(re)){
    if(!/FlateDecode/.test(m[1]))continue;
    try{
      const bytes=Uint8Array.from(m[2],c=>c.charCodeAt(0)&255);
      const DS=(globalThis as any).DecompressionStream;
      if(!DS)continue;
      const stream=new Blob([bytes]).stream().pipeThrough(new DS('deflate'));
      out.push(new TextDecoder('latin1').decode(await new Response(stream).arrayBuffer()));
    }catch{/* unsupported PDF stream */}
  }
  return out;
}
async function extractPdfText(file:File):Promise<string>{
  const bytes=new Uint8Array(await file.arrayBuffer());const raw=new TextDecoder('latin1').decode(bytes);
  const parts=[...extractPdfTextOperators(raw)];
  for(const s of await inflatePdfStreams(raw))parts.push(...extractPdfTextOperators(s));
  const text=parts.join('\n').replace(/\s+([,.;:!?])/g,'$1').trim();
  if(text.length<20)throw new Error('Ce PDF semble être scanné comme une image. Utilise une photo si la reconnaissance de texte est disponible, ou colle le texte du sujet.');
  return text;
}
async function extractImageText(file:File):Promise<string>{
  const Detector=(globalThis as any).TextDetector;
  if(!Detector)throw new Error('La reconnaissance de texte des photos n’est pas disponible sur cet appareil. Tu peux recopier ou coller l’énoncé.');
  const bitmap=await createImageBitmap(file);const blocks=await new Detector().detect(bitmap);
  const text=blocks.map((b:any)=>b.rawValue||b.text||'').filter(Boolean).join('\n').trim();
  if(!text)throw new Error('Aucun texte lisible détecté. Essaie une photo plus nette et prise bien de face.');
  return text;
}
function splitQuestions(text:string):string[]{
  const clean=text.replace(/\r/g,'').replace(/[ \t]+/g,' ').trim();
  if(!clean)return[];
  const markers=/\n(?=(?:PARTIE\s+[IVX]+|ACTIVIT[ÉE]S?\s+[A-ZÉÈÀ ]+|EXERCICE\s*\d+|Exercice\s*\d+|\d+\s*[.)-])\s*)/g;
  const chunks=clean.split(markers).map(s=>s.trim()).filter(s=>s.length>=4);
  return chunks.length?chunks:[clean];
}

export default function SubjectSolver({lang,onOpenChapter}:Props){
  const mg=lang==='mg';
  const [text,setText]=useState('');
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const [questions,setQuestions]=useState<ParsedQuestion[]>([]);
  const solved=useMemo(()=>questions.filter(q=>q.analysis?.steps?.length).length,[questions]);

  const importFile=async(file?:File)=>{
    if(!file)return;
    setBusy(true);setStatus(mg?'Mamaky ny fichier…':'Lecture du fichier…');
    try{
      let extracted='';
      if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf'))extracted=await extractPdfText(file);
      else if(file.type.startsWith('image/'))extracted=await extractImageText(file);
      else extracted=await file.text();
      setText(extracted);
      setStatus(mg?'Vita. Jereo tsara ny texte alohan’ny hamahana azy.':'Texte extrait. Vérifie-le avant de lancer la résolution.');
    }catch(e){setStatus(e instanceof Error?e.message:String(e));}
    finally{setBusy(false);}
  };
  const analyse=()=>{const parts=splitQuestions(text);setQuestions(parts.map(raw=>({raw,analysis:analyseExercise(raw,lang)})));setStatus(parts.length?`${parts.length} ${mg?'ampahany hita':'question(s) détectée(s)'}`:'');};

  return <div className="page-medium animate-fade-up">
    <PageHeader title={mg?'Hamaha sujet BEPC':'Résoudre un sujet BEPC'} description={mg?'Ampidiro PDF, sary na texte. Hozaraina ho fanontaniana ny sujet ary haseho izay azo vahana.':'Importe un PDF, une photo ou colle le texte du sujet. Les questions seront séparées puis traitées une à une.'}/>

    <section className="subject-entry-card">
      <label className="file-dropzone">
        <input type="file" accept="application/pdf,image/*,.txt,.md" className="hidden" onChange={e=>importFile(e.target.files?.[0])}/>
        <span className="file-drop-icon" aria-hidden="true">＋</span>
        <strong>{busy?(mg?'Mamaky…':'Lecture…'):(mg?'Misafidiana fichier':'Importer un fichier')}</strong>
        <small>PDF • image • texte</small>
      </label>
      {status&&<p className="subject-status">{status}</p>}
      <div className="subject-divider"><span>{mg?'na':'ou'}</span></div>
      <label className="field">
        <span className="field-label">{mg?'Texte an’ilay sujet':'Texte du sujet'}</span>
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={9} placeholder={mg?'Apetaho eto ny sujet…':'Colle le sujet ici…'} className="field-input subject-textarea"/>
      </label>
      <button type="button" onClick={analyse} disabled={!text.trim()} className="primary-button w-full">{mg?'Zarazarao ary vahao':'Analyser le sujet'}</button>
    </section>

    {questions.length>0&&<section className="subject-results">
      <div className="subject-summary"><strong>{solved}/{questions.length}</strong><span>{mg?'ampahany voavaha mivantana':'question(s) avec solution directe'}</span></div>
      <div className="subject-question-list">
        {questions.map((q,i)=><article key={i} className="subject-question-card">
          <div className="subject-question-number">{i+1}</div>
          <div className="min-w-0 flex-1">
            <p className="subject-question-text">{q.raw}</p>
            {q.analysis?<div className="subject-analysis">
              <div className="method-card compact">
                <div><p className="method-card-label">{mg?'Fomba':'Méthode'}</p><p className="method-card-title">{q.analysis.title}</p><p className="method-card-description">{q.analysis.reason}</p></div>
                <button type="button" onClick={()=>onOpenChapter(q.analysis!.chapterId)} className="secondary-button">{mg?'Toko':'Chapitre'}</button>
              </div>
              {q.analysis.steps&&<StepDisplay steps={q.analysis.steps} result={q.analysis.result}/>}
            </div>:<p className="feedback feedback-warning">{mg?'Tsy fantatra tsara ity ampahany ity.':'Cette question doit être traitée dans un outil de chapitre.'}</p>}
          </div>
        </article>)}
      </div>
    </section>}
  </div>;
}
