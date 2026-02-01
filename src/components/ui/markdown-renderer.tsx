import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div 
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-p:text-foreground prose-p:leading-relaxed prose-p:my-1.5',
        'prose-headings:text-foreground prose-headings:font-semibold',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
        'prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
        'prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg',
        'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
        className
      )}
    >
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  if (!content?.trim()) {
    return (
      <div className={cn('p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground italic', className)}>
        Preview will appear here...
      </div>
    );
  }

  return (
    <div className={cn('p-3 rounded-lg bg-muted/30', className)}>
      <MarkdownRenderer content={content} />
    </div>
  );
}
