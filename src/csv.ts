import { createInterface } from "readline";
import { CSVParserResult, parseCSV } from "./parser/csv";

export interface OptionParam {
    delimiter: string
}

const defaultOption: OptionParam = {
  delimiter: ','
};


export class LargeCSVParser<T extends NodeJS.ReadableStream> {
    constructor(
        protected readableStream: T, 
        protected options: OptionParam = defaultOption
    ) {}


    async* parse() {
        const rl = createInterface({
            input: this.readableStream,
            crlfDelay: Infinity,
        });
      
        let fileLineNumber = 0;
        let startLineNumber: number | null = null;
        let rowNumber = 0;
        let result: CSVParserResult = { data: [], insideQuotes: false }
        
        for await (const line of rl) {
            const currentRow = line
            fileLineNumber += 1
            
            result = parseCSV(currentRow, result.data, result.insideQuotes, this.options.delimiter)
            const data = result.data
            
            if(startLineNumber === null && result.insideQuotes) {
                startLineNumber = fileLineNumber
            }

            if(!result.insideQuotes) {
                rowNumber += 1
                result = { data: [], insideQuotes: false }
                const startLine = startLineNumber ? startLineNumber : fileLineNumber
                startLineNumber = null
                yield {
                    data: data,
                    endLine: fileLineNumber,
                    startLine: startLine,
                    rowNumber: rowNumber
                }
            }

        }
    }
}
