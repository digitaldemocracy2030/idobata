// src/components/MarkdownViewer.tsx
import type React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight"; // Syntax highlighting
import rehypeRaw from "rehype-raw"; // To handle raw HTML, like embedded images
import rehypeSanitize from "rehype-sanitize"; // Sanitize HTML for security
import remarkGfm from "remark-gfm"; // GFM (Tables, strikethrough, task lists, etc.)
// Import highlight.js styles (choose a theme)
// You might need to install highlight.js: npm install highlight.js
// Then import the CSS in a global CSS file (e.g., index.css) or here.
// Example: import 'highlight.js/styles/github.css'; // Or github-dark.css, etc.
// Ensure the CSS is imported somewhere in your project for highlighting to work visually.

interface MarkdownViewerProps {
  content: string; // The Markdown content string
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <div className="markdown-body prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Enable GFM features
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]} // Enable raw HTML, sanitize, and syntax highlighting
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          blockquote: ({ children, ...props }) => {
            const childrenText = children?.toString() || "";
            const sourceIdMatch = childrenText.match(/^\[([^\]]+)\]\s/);
            const sourceId = sourceIdMatch ? sourceIdMatch[1] : null;

            let displayContent = children;
            if (sourceId) {
              const modifiedText = childrenText.replace(/^\[[^\]]+\]\s/, "");
              displayContent = (
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  remarkPlugins={[remarkGfm]}
                >
                  {modifiedText}
                </ReactMarkdown>
              );
            }

            return (
              <blockquote
                className="border-l-4 border-neutral-300 pl-4 italic bg-neutral-50 p-4 rounded-r-md relative mb-6"
                data-source-url={
                  sourceId
                    ? `https://github.com/digitaldemocracy2030/idobata/issues/${sourceId}`
                    : ""
                }
                {...props}
              >
                {displayContent}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
