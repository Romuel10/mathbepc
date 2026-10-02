import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export default function PageHeader({title,description,eyebrow,action}:PageHeaderProps){
  return <header className="page-heading">
    <div className="min-w-0">
      {eyebrow&&<p className="page-eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {description&&<p className="page-description">{description}</p>}
    </div>
    {action&&<div className="page-heading-action">{action}</div>}
  </header>;
}
