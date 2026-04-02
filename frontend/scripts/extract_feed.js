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
    
    // We need to parse matching </div> brackets.
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
            // open tag
            openBrackets++;
            foundFirst = true;
        } else if(match[1] === '/') {
            // close tag
            openBrackets--;
        }
        
        if(foundFirst && openBrackets === 0) {
            // We found the closing div
            blockEndIndex = match.index + '</div>'.length;
            break;
        }
    }
    
    if (blockEndIndex === -1) {
        console.error(`Could not find matching </div> for ${name}`);
        return;
    }

    // Since the actual start class string might not be the exact open bracket (it might be e.g. `<div className="xxx"`),
    // wait, we ensure startClassString starts with `<div` for the search.
    
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

// 1. Extract CreatePostBox
extractComponentByClass('CreatePostBox', '<div className="_feed_inner_text_area  _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">');

// 2. Extract StoryCarousel
// Notice: StoryCarousel had `{/* For Desktop */}` right before it. We'll simply extract the node:
extractComponentByClass('StoryCarousel', '<div className="_feed_inner_ppl_card _mar_b16">');

// 3. Extract PostCard
// This will just grab the first post card and replace it. 
// For now, let's just extract the first one and replace it. The second one we can manually delete or replace via script.
extractComponentByClass('PostCard', '<div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">');
// Re-run to catch the second instance of PostCard
extractComponentByClass('PostCard', '<div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">');


// Insert the imports
const imports = `import StoryCarousel from '@/components/feed/StoryCarousel';
import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';
`;
const importAnchor = "import Link from 'next/link';";
content = content.replace(importAnchor, importAnchor + '\n' + imports);

fs.writeFileSync(pageFile, content);
console.log('Main file updated.');
