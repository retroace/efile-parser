/**
 * Get the first tag name from xml string
 * @param xml xml string
 * @returns {string}
 */
export const parseTagName = (xml: string) => {
    let tagStartIndex = -1;
    let tagEndIndex = -1;
    let tagSpaceIndex = -1;
    let isClosing = false;
    let selfClosing = false;
    for (let i = 0; i < xml.length; i++) {
        if (xml[i] === '<') {
            isClosing = (xml[i + 1] === '/');
            tagStartIndex = isClosing ? i + 1 : i;
            continue;
        }
        
        if (tagStartIndex !== -1 && tagSpaceIndex === -1 && xml[i] === ' ') {
            tagSpaceIndex = i;
            continue;
        }
        
        if (tagStartIndex !== -1 && xml[i] === '>') {
            if (xml[i - 1] === '/') {
                isClosing = true;
                selfClosing = true;
            }
            tagSpaceIndex = tagSpaceIndex === -1 ? i : tagSpaceIndex;
            tagEndIndex = i;
            break;
        }
    }
    
    return {
        name: tagSpaceIndex !== -1 ? xml.substring(tagStartIndex + 1, tagSpaceIndex) : null,
        startIndex: tagStartIndex,
        endIndex: tagEndIndex,
        closing: isClosing,
        selfClosing,
    };
};

/**
 * Get the index of end tag for provided tag name
 * @param xml xml string
 * @param tagName tag name to find end tag for
 * @returns {number}
 */
export const indexOfEndTag = (xml: string, tagName: string): number => {
    const endTag = `</${tagName}>`;
    const startTag = `<${tagName}`;
    let additionEndIndex = 0;
    let totalInside = 0;
    
    while (xml.length) {
        const startTagIndex = xml.indexOf(startTag);
        const endTagIndex = xml.indexOf(endTag);
        
        if (endTagIndex === -1) {
            return -1;
        }
        
        if (startTagIndex !== -1 && startTagIndex < endTagIndex) {
            const currentSkipped = startTagIndex + startTag.length;
            additionEndIndex += currentSkipped;
            totalInside += 1;
            xml = xml.substring(currentSkipped);
            continue;
        }
        
        if (totalInside) {
            totalInside -= 1;
            additionEndIndex += endTagIndex + endTag.length;
            if (!totalInside) {
                return additionEndIndex;
            }
            xml = xml.substring(endTagIndex + endTag.length);
            continue;
        }
        
        return additionEndIndex + endTagIndex + endTag.length;
    }
    return -1;
};