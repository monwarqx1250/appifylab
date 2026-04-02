const fs = require('fs');
const path = require('path');

const pageFile = 'src/app/feed/page.jsx';
let content = fs.readFileSync(pageFile, 'utf-8');

function extractSidebar(name, marker, dir = 'src/components/layout') {
    fs.mkdirSync(dir, { recursive: true });
    
    const startIndex = content.indexOf(marker);
    if (startIndex === -1) {
        console.error(`Could not find start marker for ${name}`);
        return;
    }
    
    // Find the second occurrence of the same marker
    const endIndex = content.indexOf(marker, startIndex + marker.length);
    if (endIndex === -1) {
        console.error(`Could not find end marker for ${name}`);
        return;
    }
    
    const blockEndIndex = endIndex + marker.length;
    const componentCodeOriginal = content.substring(startIndex, blockEndIndex);
    
    const componentContent = `import React from 'react';
import Link from 'next/link';

export default function ${name}() {
    return (
        <>
${componentCodeOriginal}
        </>
    );
}
`;
    fs.writeFileSync(path.join(dir, `${name}.jsx`), componentContent);
    console.log(`Extracted ${name}`);
    
    const replacement = `<${name} />`;
    content = content.substring(0, startIndex) + replacement + content.substring(blockEndIndex);
}

extractSidebar('LeftSidebar', '{/*  Left Sidebar  */}');
extractSidebar('RightSidebar', '{/*  Right Sidebar  */}');

// Insert the imports right after 'use client'; or imports block
const imports = `import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
`;
const importAnchor = "import Link from 'next/link';";
content = content.replace(importAnchor, importAnchor + '\n' + imports);

fs.writeFileSync(pageFile, content);
console.log('Main file updated.');
