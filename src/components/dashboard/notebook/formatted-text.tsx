import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export function FormattedText({ text, className = '' }: FormattedTextProps) {
  // A robust approach to parse links, bold, and custom color tags
  // 1. **text** -> bold
  // 2. [color:#FF0000]text[/color] or [color:red]text[/color] -> colored text
  // 3. URLs (http:// or https://) -> clickable links

  // We need to parse this safely to avoid XSS if we were using dangerouslySetInnerHTML,
  // but by building an array of React elements we keep it perfectly safe.

  const parts = [];
  let currentString = text;
  let keyCounter = 0;

  // Regex patterns
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const colorRegex = /\[color:([^\]]+)\](.*?)\[\/color\]/g;

  // A helper function to split by a regex and map matches to a render function
  const processPattern = (
    inputParts: (string | React.ReactNode)[],
    regex: RegExp,
    renderMatch: (match: RegExpExecArray, key: number) => React.ReactNode
  ) => {
    const result: (string | React.ReactNode)[] = [];

    inputParts.forEach(part => {
      if (typeof part !== 'string') {
        result.push(part); // Already processed node
        return;
      }

      let lastIndex = 0;
      let match;
      // Reset regex state since we use global 'g' flag
      regex.lastIndex = 0;

      while ((match = regex.exec(part)) !== null) {
        // Push preceding text
        if (match.index > lastIndex) {
          result.push(part.substring(lastIndex, match.index));
        }

        // Push rendered node
        result.push(renderMatch(match, keyCounter++));

        lastIndex = regex.lastIndex;
      }

      // Push remaining text
      if (lastIndex < part.length) {
        result.push(part.substring(lastIndex));
      }
    });

    return result;
  };

  // 1. Process Color Tags
  let elements = processPattern([text], colorRegex, (match, key) => (
    <span key={key} style={{ color: match[1] }}>
      {match[2]}
    </span>
  ));

  // 2. Process Bold within the text parts
  elements = processPattern(elements, boldRegex, (match, key) => (
    <strong key={key} className="font-bold">
      {match[1]}
    </strong>
  ));

  // 3. Process URLs within the text parts
  elements = processPattern(elements, urlRegex, (match, key) => {
    const url = match[1];
    return (
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 hover:underline transition-colors break-words font-medium"
        onClick={(e) => e.stopPropagation()} // Prevent modal open/close on link click
      >
        {url}
      </a>
    );
  });

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {elements}
    </div>
  );
}
