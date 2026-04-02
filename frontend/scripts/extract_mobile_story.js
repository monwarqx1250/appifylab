const fs = require('fs');
const path = require('path');

const pageFile = 'src/app/feed/page.jsx';
let content = fs.readFileSync(pageFile, 'utf-8');

function extractComponentByClass(name, startClassString, dir = 'src/components/feed') {
    fs.mkdirSync(dir, { recursive: true });
    
    const startIndex = content.indexOf(startClassString);
    if (startIndex === -1) {
        console.error(`Could not find start marker for ${name} using ${startClassString}`);
        return;
    }
    
    // Parse matching </div>
    let currentPos = startIndex;
    let openBrackets = 0;
    let tagRegex = /<(\/?)div/g;
    tagRegex.lastIndex = startIndex;
    
    let blockEndIndex = -1;
    let foundFirst = false;
    
    while(true) {
        const match = tagRegex.exec(content);
        if(!match) break;
        
        if(match[1] === '') {
            openBrackets++;
            foundFirst = true;
        } else if(match[1] === '/') {
            openBrackets--;
        }
        
        if(foundFirst && openBrackets === 0) {
            blockEndIndex = match.index + '</div>'.length;
            break;
        }
    }
    
    if (blockEndIndex === -1) {
        console.error(`Could not find matching </div> for ${name}`);
        return;
    }

    const componentCodeOriginal = content.substring(startIndex, blockEndIndex);
    
    const componentContent = `import React from 'react';
import Link from 'next/link';

export default function ${name}() {
    return (
${componentCodeOriginal}
    );
}
`;
    fs.writeFileSync(path.join(dir, `${name}.jsx`), componentContent);
    console.log(`Extracted ${name}`);
    
    const replacement = `<${name} />`;
    content = content.substring(0, startIndex) + replacement + content.substring(blockEndIndex);
}

extractComponentByClass('StoryCarouselMobile', '<div className="_feed_inner_ppl_card_mobile _mar_b16">');

const imports = `import StoryCarouselMobile from '@/components/feed/StoryCarouselMobile';\n`;
const importAnchor = "import StoryCarousel from '@/components/feed/StoryCarousel';";
content = content.replace(importAnchor, importAnchor + '\n' + imports);

fs.writeFileSync(pageFile, content);
console.log('Main file updated.');
