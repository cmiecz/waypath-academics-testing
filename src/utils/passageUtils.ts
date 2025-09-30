import React from 'react';

/**
 * Parses passage content and creates highlighted text with anchor references
 * @param content - The passage content with anchor references like [1], [2], etc.
 * @param currentAnchor - The anchor reference to highlight (e.g., "[1]")
 * @param highlightedRef - Ref to attach to the highlighted anchor for scrolling
 * @returns Array of React elements with highlighting applied
 */
export const parsePassageWithHighlighting = (
  content: string,
  currentAnchor?: string,
  highlightedRef?: React.RefObject<HTMLSpanElement | null>
): React.ReactNode[] => {
  // Debug logging
  console.log('parsePassageWithHighlighting called with:', { 
    content: content.substring(0, 200) + '...', 
    currentAnchor,
    contentLength: content.length 
  });
  
  // If no current anchor, return the content as a single text element
  if (!currentAnchor) {
    console.log('No current anchor, returning plain text');
    return [content];
  }
  
  // Regular expression to match anchor references like [1], [2], etc.
  const anchorRegex = /\[(\d+)\]/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let anchorCount = 0;
  
  while ((match = anchorRegex.exec(content)) !== null) {
    const anchorText = match[0]; // e.g., "[1]"
    const anchorNumber = match[1]; // e.g., "1"
    const matchStart = match.index;
    anchorCount++;
    
    console.log(`Found anchor ${anchorCount}: "${anchorText}" at position ${matchStart}, isCurrent: ${currentAnchor === anchorText}`);
    
    // Add text before the anchor
    if (matchStart > lastIndex) {
      const beforeText = content.slice(lastIndex, matchStart);
      console.log(`Adding text before anchor: "${beforeText.substring(0, 50)}..."`);
      parts.push(beforeText);
    }
    
    // Add the highlighted anchor
    const isCurrentAnchor = currentAnchor === anchorText;
    console.log(`Adding anchor "${anchorText}", isCurrent: ${isCurrentAnchor}`);
    
    if (isCurrentAnchor) {
      // Use a span with highlighting styles and ref for scrolling
      parts.push(
        React.createElement('span', {
          key: `anchor-${anchorNumber}`,
          ref: highlightedRef,
          style: {
            backgroundColor: '#fef3c7',
            color: '#92400e',
            fontWeight: 'bold',
            padding: '2px 4px',
            borderRadius: '4px',
            display: 'inline-block',
            margin: '0 2px',
          }
        }, anchorText)
      );
    } else {
      // Regular anchor without highlighting
      parts.push(anchorText);
    }
    
    lastIndex = matchStart + anchorText.length;
  }
  
  // Add remaining text after the last anchor
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    console.log(`Adding remaining text: "${remainingText.substring(0, 50)}..."`);
    parts.push(remainingText);
  }
  
  console.log(`parsePassageWithHighlighting returning ${parts.length} parts`);
  return parts;
};

/**
 * Extracts anchor reference from question text
 * @param questionText - The question text that may contain an anchor reference
 * @returns The anchor reference if found (e.g., "[1]") or undefined
 */
export const extractAnchorReference = (questionText: string): string | undefined => {
  const match = questionText.match(/\[(\d+)\]/);
  return match ? match[0] : undefined;
};
