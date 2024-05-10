import { indexOfEndTag, parseTagName } from "../utils/tag";

export enum XML_STATE {
    PARSE='parse',
    FIND_CLOSING_TAG='close',
    CAPTURE_GROUP='capture',
    GO_INSIDE='in'
}

export interface parseXMLParamOption {
    state: XML_STATE,
    content: string,
    initialPath: string
}

export interface parseXMLResponse {
  prefix: string,
  state: XML_STATE,
  data: string | null
  currentPath: string
}
/**
 *
 * Parse xml and set data to it's state
 * @param {*} content XML content can be a partial content as long as we have previous context
 * @param {*} state State that parsing is currently is in
 * @param {*} pattern Pattern to match and look into
 */
export function parseXMLFromState(
    { state, content, initialPath, }: parseXMLParamOption,
    pattern: string = '*'
): parseXMLResponse {
    let prefix = '';
  
    const currentPath = initialPath ? initialPath.split('.') : [];
    const patternArr = pattern.split('.');
    const lastTagToParse = patternArr[patternArr.length - 1];
  
    while (content.length) {
      // Navigate upto closing tag
      if (state === XML_STATE.FIND_CLOSING_TAG) {
        const tagName = lastTagToParse;
        const endTagIndex = indexOfEndTag(content, tagName);
        if (endTagIndex === -1) {
          return {
            state: XML_STATE.FIND_CLOSING_TAG,
            prefix: '',
            data: null,
            currentPath: currentPath.join('.'),
          };
        }
        currentPath.pop();
        state = XML_STATE.PARSE;
        content = content.substring(endTagIndex);
        continue;
      }
  
      const tagStartIndex = content.indexOf('<');
  
      // CAPTURE GROUP STATE
      if (state === XML_STATE.CAPTURE_GROUP) {
        const endTagIndex = indexOfEndTag(content, lastTagToParse);
        if (endTagIndex === -1) {
          return {
            state: XML_STATE.CAPTURE_GROUP,
            prefix: content.substring(tagStartIndex),
            data: null,
            currentPath: currentPath.join('.'),
          };
        }
        currentPath.pop();
        return {
          state: XML_STATE.PARSE,
          prefix: content.substring(endTagIndex),
          data: content.substring(tagStartIndex, endTagIndex),
          currentPath: currentPath.join('.'),
        };
      }
  
      const tagNameAttr = parseTagName(content.substring(tagStartIndex, tagStartIndex + 1000));
      const currentTagName = tagNameAttr.name;
      if (currentTagName === null) {
        state = XML_STATE.PARSE;
        content = '';
        continue;
      }
      
      // xml tag
      if (content[tagStartIndex + 1] === '?') {
        const tagEndIndex = content.substring(tagStartIndex).indexOf('?>');
        state = XML_STATE.PARSE;
        content = content.substring(tagStartIndex + tagEndIndex + 2);
        continue;
      }
      
      // Doctypes and comments
      if (content[tagStartIndex + 1] === '!') {
        const closing = content[tagStartIndex + 2] === '-' ? '-->' : '>';
        const tagEndIndex = content.substring(tagStartIndex).indexOf(closing);
        state = XML_STATE.PARSE;
        content = content.substring(tagStartIndex + tagEndIndex + closing.length);
        continue;
      }
  
      currentPath.push(currentTagName);
      const skipTagNameIndex = tagStartIndex + (currentTagName?.length ?? 0) + 2;
      if (state === XML_STATE.GO_INSIDE) {
        const currentPathStr = currentPath.join('.');
        if (pattern.includes(currentPathStr)) {
          prefix = '';
          if (pattern === currentPathStr) {
            state = XML_STATE.CAPTURE_GROUP;
            content = content.substring(tagStartIndex);
            continue;
          }
          state = XML_STATE.GO_INSIDE;
          content = content.substring(skipTagNameIndex);
          continue;
        } else {
          state = XML_STATE.FIND_CLOSING_TAG;
          content = content.substring(skipTagNameIndex);
          continue;
        }
      }
  
      if (state === XML_STATE.PARSE) {
        const currentPathStr = currentPath.join('.');
        if (pattern.includes(currentPathStr)) {
          state = currentPathStr === pattern ? XML_STATE.CAPTURE_GROUP : XML_STATE.GO_INSIDE;
          prefix = '';
          content = content.substring(currentPathStr === pattern ? tagStartIndex : skipTagNameIndex);
          continue;
        }
  
        state = XML_STATE.FIND_CLOSING_TAG;
        content = content.substring(skipTagNameIndex);
        continue;
      }
  
      // Moving toward correct location
      content = content.substring(tagStartIndex);
    }
  
    return {
      prefix,
      state: XML_STATE.PARSE,
      data: null,
      currentPath: currentPath.join('.'),
    }
}