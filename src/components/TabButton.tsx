export default function TabButton({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){
  return <button type="button" onClick={onClick} className={`tab-button ${active?'tab-button-active':''}`}>{children}</button>;
}

export function ExampleButton({onClick,children}:{onClick:()=>void;children:React.ReactNode}){
  return <button type="button" onClick={onClick} className="example-chip">{children}</button>;
}

export function OpButton({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){
  return <button type="button" onClick={onClick} className={`operator-button ${active?'operator-button-active':''}`}>{children}</button>;
}

export function SignButton({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){
  return <button type="button" onClick={onClick} className={`sign-button ${active?'sign-button-active':''}`}>{children}</button>;
}
