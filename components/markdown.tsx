import type { ReactNode } from "react";

/**
 * Deliberately tiny Markdown subset renderer for challenge briefs:
 * headings, paragraphs, lists, fenced code, inline code, bold, italics, links.
 * No raw HTML, no dangerouslySetInnerHTML — everything becomes React nodes.
 */

const inline = (text: string, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const safe = /^(https?:\/\/|\/|#|mailto:)/.test(href);
        nodes.push(
          safe ? (
            <a key={key} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              {label}
            </a>
          ) : (
            label
          ),
        );
      }
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

export function Markdown({ content, className }: { content: string; className?: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;
  let key = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${key++}`}>{inline(paragraph.join(" "), `p-${key}`)}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${key++}`}>
        {list.map((item, i) => (
          <li key={i}>{inline(item, `li-${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (line.trimStart().startsWith("```")) {
      if (code) {
        blocks.push(
          <pre key={`code-${key++}`}>
            <code>{code.join("\n")}</code>
          </pre>,
        );
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(raw);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(<h3 key={`h3-${key++}`}>{inline(line.slice(4), `h3-${key}`)}</h3>);
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(<h2 key={`h2-${key++}`}>{inline(line.slice(3), `h2-${key}`)}</h2>);
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      list.push(line.slice(2));
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\d+\.\s/, ""));
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  if (code) {
    blocks.push(
      <pre key={`code-${key++}`}>
        <code>{code.join("\n")}</code>
      </pre>,
    );
  }

  return <div className={className}>{blocks}</div>;
}
