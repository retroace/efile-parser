import { createInterface } from "readline";
import { XML_STATE, parseXMLResponse } from "./parser/xml";
import { parseXMLFromState } from "./parser";

type Byte = number

export interface OptionParam {
    maxLines: number,
    maxSize: Byte,
    maxItem: number
}

const defaultOption: OptionParam = {
  maxLines: 100,
  maxSize: 1 * 1024 * 1024,
  maxItem: 2,
};


/**
 * Parse xml for large files. It supports a lot of functionality
 * @param {*} fileStream Stream to parse string from
 * @param {*} patterns Pattern to extract data from
 * @param {*} option Default option to limit the parsing size
 */
export class LargeXmlParser<T extends NodeJS.ReadableStream> {
  constructor(
    protected readableStream: T, 
    protected options: OptionParam = defaultOption
  ) {}

  async* parse(pattern: string) {
    const rl = createInterface({
      input: this.readableStream,
      crlfDelay: Infinity,
    });

    let lineNumber = 0;
    let initialPath = '';
    let content = '';
    let prefix = '';
    let state: XML_STATE = XML_STATE.PARSE;
    let cached = '';
    let secondIterationFiles = '';

    for await (const line of rl) {
      content += `${secondIterationFiles + prefix + line}\n`;
      secondIterationFiles = '';
      lineNumber += 1;
      prefix = '';

      let limitReached = false;
      // Total Byte Size
      if (content.length >= this.options.maxSize) {
        if (content.length > this.options.maxSize) {
          secondIterationFiles = content.substring(this.options.maxSize);
        }
        content = content.substring(0, this.options.maxSize);
        limitReached = true;
      }

      // Line Check
      if (!limitReached && (lineNumber % this.options.maxLines) === 0) {
        limitReached = true;
        prefix = '';
      }

      if (!limitReached) {
        const currentPath = initialPath ? initialPath.split('.') : [];
        const lastTagToParse = currentPath.length ? currentPath[currentPath.length - 1] : null;
        if (!content.includes(`</${lastTagToParse}`)) {
          continue;
        }
      }

      let parsedObj: parseXMLResponse | null = null;
      try {
        // Parse XML From content
        parsedObj = parseXMLFromState({
          state: state,
          content: prefix + content,
          initialPath,
        }, pattern);
        
        initialPath = parsedObj.currentPath;
        prefix = parsedObj?.prefix ?? '';
        // JS String Manipulation Error Occurs Is this Guard Is Not Kept
        if (prefix.length >= 500000 && state === XML_STATE.CAPTURE_GROUP) {
          cached += prefix;
          prefix = '';
        }

        state = parsedObj.state;
        content = '';
        if (parsedObj.data === null) continue;
        const data = cached + parsedObj.data;
        cached = '';
        yield data;
      } catch (error) {
        cached = '';
        yield { error, data: parsedObj?.data, lineNumber };
      }
    }

    let parsedObj: parseXMLResponse;
    while(content) {
        parsedObj = parseXMLFromState({
            state: state,
            content: content,
            initialPath,
        }, pattern);
        content = parsedObj.prefix
        initialPath = parsedObj.currentPath;
        state = parsedObj.state;
        if(parsedObj.data) yield parsedObj.data
        else return
    }
   
  }
}