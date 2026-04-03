import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

const rawDocs = import.meta.glob<string>('@/docs/**/*.md', { query: '?raw', import: 'default', eager: true });

const docsMap: Record<string, string> = Object.fromEntries(
  Object.entries(rawDocs).map(([path, content]) => {
    const key = path.replace('/src/docs/', '').replace('.md', '').toLowerCase();

    return [key, content];
  }),
);

export default function MarkDownViewer({ doc, docKey }: { doc?: string; docKey?: string }) {
  const content = docKey ? docsMap[docKey] : (doc ?? '');
  return (
    <div className="prose max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
