import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renderiza Markdown de forma segura (react-markdown no ejecuta HTML crudo). */
export function Markdown({ children }: { children: string }) {
  return (
    <div
      className="prose prose-invert prose-sm max-w-none prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-chalk prose-p:my-2 prose-strong:text-chalk prose-a:text-accent prose-li:my-0.5 prose-table:my-3 prose-th:border prose-th:border-chalk/15 prose-th:bg-pitch-700/60 prose-th:px-2 prose-th:py-1 prose-td:border prose-td:border-chalk/15 prose-td:px-2 prose-td:py-1 prose-code:rounded prose-code:bg-pitch-950 prose-code:px-1 prose-code:before:content-none prose-code:after:content-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          table: (props) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
