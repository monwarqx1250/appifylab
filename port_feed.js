const fs = require('fs');
const path = require('path');

const file = fs.readFileSync(path.join(__dirname, 'feed.html'), 'utf8');

// Extract everything inside <body> ... </body>
const bodyMatch = file.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.log("No body found");
  process.exit(1);
}

let jsx = bodyMatch[1];
// Remove script tag at the end
jsx = jsx.replace(/<script[^>]*>.*?<\/script>/ig, '');

// Convert class and for
jsx = jsx.replace(/ class="/g, ' className="');
jsx = jsx.replace(/ for="/g, ' htmlFor="');

// Convert HTML comments to JSX comments
jsx = jsx.replace(/<!--([^>]+)-->/g, '{/* $1 */}');

// Make void elements self-closing
const voidElements = ['img', 'input', 'hr', 'br', 'source', 'path', 'circle', 'polyline', 'polygon'];

voidElements.forEach(tag => {
  // Matches <tag ... > but ignores already closed <tag ... />
  const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'ig');
  jsx = jsx.replace(regex, `<${tag}$1 />`);
});

// React complains about inline style strings like `stroke-width` if they are camelCased in svg, though standard html svgs usually work in React 18+ if passed as strings.
// Wait, React requires camelCase for svg attrs like stroke-linecap -> strokeLinecap
jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');
jsx = jsx.replace(/stroke-opacity/g, 'strokeOpacity');
jsx = jsx.replace(/fill-opacity/g, 'fillOpacity');
jsx = jsx.replace(/fill-rule/g, 'fillRule');
jsx = jsx.replace(/clip-rule/g, 'clipRule');

// Also crossOrigin instead of crossorigin
jsx = jsx.replace(/crossorigin/g, 'crossOrigin');
// autoFocus instead of autofocus
jsx = jsx.replace(/autofocus/g, 'autoFocus');

// Remove `<svg ... xmlns:xlink="..." ...>`
jsx = jsx.replace(/xmlns:xlink/g, 'xmlnsXlink');

const output = `
import React from 'react';
import Link from 'next/link';

export default function FeedPage() {
  return (
    <>
      ${jsx}
    </>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'frontend/src/app/feed/page.jsx'), output);
console.log("Feed page ported.");
