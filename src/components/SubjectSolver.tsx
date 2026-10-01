import { useMemo, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { analyseExercise, type SmartAnalysis } from '../utils/smartDetect';
import StepDisplay from './StepDisplay';

interface Props{lang:Lang;onOpenChapter:(id:string)=>void;}
interface ParsedQuestion{raw:string;analysis:SmartAnalysis|null;}

function unescapePdfString(value:string):string{
  return value.replace(/\\([nrtbf()\\])/g,(_,c)=>(({n:'\n',r:'\r',t:'\t',b:'',f:'','(':'(',')':')','\\':'\\'} as Record<string,string>)[c]??c)).replace(/\\([0-7]{1,3})/g,(_,o)=>String.fromCharCode(parseInt(o,8)));
}
function extractPdfTextOperators(source:string):string[]{
  const out:string[]=[];
  const add=(s:string)=>{const clean=unescapePdfString(s).replace(/\s+/g,' ').trim();if(clean.length>1)out.push(clean);};
  for(const m of source.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)) add(m[1]);
  for(const m of source.matchAll(/\[((?:.|\n|\r)*?)\]\s*TJ/g)) for(const p of m[1].matchAll(/\(((?:\\.|[^\\)])*)\)/g)) add(p[1]);
  return out;
}
async function inflatePdfStreams(raw:string):Promise<string[]>{
  const out:string[]=[]; const re=/<<(.*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  for(const m of raw.matchAll(re)){
    if(!/FlateDecode/.test(m[1])) continue;
    try{
      const bytes=Uint8Array.from(m[2],c=>c.charCodeAt(0)&255);
      const DS=(globalThis as any).DecompressionStream;
      if(!DS) continue;
      const stream=new Blob([bytes]).stream().pipeThrough(new DS('deflate'));
      const buf=await new Response(stream).arrayBuffer();
      out.push(new TextDecoder('latin1').decode(buf));
    }catch{/* some PDF streams use unsupported predictors; skip them */}
  }
  return out;
}
async function extractPdfText(file:File):Promise<string>{
  const bytes=new Uint8Array(await file.arrayBuffer()); const raw=new TextDecoder('latin1').decode(bytes);
  const parts=[...extractPdfTextOperators(raw)];
  for(const s of await inflatePdfStreams(raw)) parts.push(...extractPdfTextOperators(s));
  const text=parts.join('\n').replace(/\s+([,.;:!?])/g,'$1').trim();
  if(text.length<20) throw new Error('Ce PDF semble être scanné comme une image. Sur ce téléphone, utilise une photo si la reconnaissance de texte est disponible, ou colle le texte du sujet.');
  return text;
}
async function extractImageText(file:File):Promise<string>{
  const Detector=(globalThis as any).TextDetector;
  if(!Detector) throw new Error('La reconnaissance automatique de texte des photos n’est pas disponible dans ce navigateur Android. Tu peux garder la photo ouverte et recopier/coller l’énoncé dans la zone de texte.');
  const bitmap=await createImageBitmap(file); const detector=new Detector(); const blocks=await detector.detect(bitmap);
  const text=blocks.map((b:any)=>b.rawValue||b.text||'').filter(Boolean).join('\n').trim();
  if(!text) throw new Error('Aucun texte lisible détecté. Essaie une photo plus nette et prise bien de face.');
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
  const mg=lang==='mg'; const [text,setText]=useState(''); const [status,setStatus]=useState(''); const [busy,setBusy]=useState(false); const [questions,setQuestions]=useState<ParsedQuestion[]>([]);
  const solved=useMemo(()=>questions.filter(q=>q.analysis?.steps?.length).length,[questions]);
  const importFile=async(file?:File)=>{if(!file)return;setBusy(true);setStatus(mg?'Mamaky ny fichier…':'Lecture du fichier…');try{let extracted='';if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf'))extracted=await extractPdfText(file);else if(file.type.startsWith('image/'))extracted=await extractImageText(file);else extracted=await file.text();setText(extracted);setStatus(mg?'Vita ny famakiana. Jereo ny texte vao vahana.':'Texte extrait. Vérifie-le avant de lancer la résolution.');}catch(e){setStatus(e instanceof Error?e.message:String(e));}finally{setBusy(false);}};
  const analyse=()=>{const parts=splitQuestions(text);setQuestions(parts.map(raw=>({raw,analysis:analyseExercise(raw,lang)})));setStatus(parts.length?`${parts.length} ${mg?'ampahany hita':'bloc(s) détecté(s)'}`:'');};
  return <div className="max-w-4xl mx-auto animate-fade-up"><span className="inline-flex px-3 py-1 rounded-full bg-[--color-accent-subtle] text-[--color-accent] text-[11px] font-bold">BEPC Madagascar</span><h1 className="text-2xl sm:text-4xl font-extrabold mt-3">{mg?'Hamaha sujet BEPC':'Résoudre un sujet BEPC'}</h1><p className="mt-2 text-sm text-[--color-text-secondary]">{mg?'Afaka mametraka PDF misy texte, sary raha manohana OCR ny téléphone, na mandika ny sujet eto ianao. Haseho mazava izay voavaha ho azy sy izay mila fitaovana manokana.':'Importe un PDF contenant du texte, une photo si ton appareil prend en charge la détection de texte, ou colle directement l’énoncé. L’application distingue ce qu’elle sait résoudre automatiquement de ce qui doit être traité dans un chapitre.'}</p>
    <div className="mt-5 rounded-2xl border border-[--color-border] bg-[--color-card] p-4 sm:p-5"><label className="flex items-center justify-center min-h-24 rounded-xl border-2 border-dashed border-[--color-border] bg-[--color-inset] cursor-pointer text-center p-4"><input type="file" accept="application/pdf,image/*,.txt,.md" className="hidden" onChange={e=>importFile(e.target.files?.[0])}/><span className="text-sm font-bold text-[--color-accent]">{busy?(mg?'Miandry…':'Lecture…'):(mg?'Misafidiana PDF na sary':'Choisir un PDF, une photo ou un fichier texte')}</span></label>{status&&<p className="text-xs text-[--color-text-secondary] mt-3">{status}</p>}<textarea value={text} onChange={e=>setText(e.target.value)} rows={10} placeholder={mg?'Na apetaho eto ny sujet…':'Ou colle ici le texte du sujet…'} className="mt-4 w-full resize-y rounded-xl border border-[--color-input-border] bg-[--color-input-bg] px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[--color-input-focus]"/><button onClick={analyse} disabled={!text.trim()} className="mt-3 w-full py-3.5 rounded-xl bg-[--color-accent] text-white font-bold disabled:opacity-40 cursor-pointer">{mg?'Zarazarao ary vahao':'Analyser et résoudre les questions'}</button></div>
    {questions.length>0&&<div className="mt-6"><div className="rounded-xl bg-[--color-accent-subtle] p-3 text-xs text-[--color-text-secondary]"><strong>{solved}/{questions.length}</strong> {mg?'ampahany voavaha mivantana. Ny hafa dia alefa amin’ny toko mifanaraka.':'bloc(s) résolus directement. Les autres sont orientés vers l’outil du chapitre correspondant.'}</div><div className="space-y-4 mt-4">{questions.map((q,i)=><div key={i} className="rounded-2xl border border-[--color-border] bg-[--color-card] p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-muted]">Question / bloc {i+1}</p><p className="mt-2 text-sm whitespace-pre-wrap leading-relaxed">{q.raw}</p>{q.analysis?<div className="mt-3 border-t border-[--color-border] pt-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold text-sm">{q.analysis.title}</p><p className="text-xs text-[--color-text-secondary]">{q.analysis.reason}</p></div><button onClick={()=>onOpenChapter(q.analysis!.chapterId)} className="px-3 py-2 rounded-xl bg-[--color-btn-bg] text-xs font-bold cursor-pointer">{mg?'Sokafy ny toko':'Ouvrir le chapitre'}</button></div>{q.analysis.steps&&<StepDisplay steps={q.analysis.steps} result={q.analysis.result}/>}</div>:<p className="mt-3 text-xs text-[--color-warn-text]">{mg?'Tsy fantatra tsara ity ampahany ity.':'Cette partie n’a pas été reconnue avec assez de certitude.'}</p>}</div>)}</div></div>}
  </div>;
}
