# EFile Parser
EFile Parser is a Node.js library that allows you to efficiently read XML and CSV files, supporting custom delimiters for CSV files. E in Efile stands for efficient file parser

## Installation
Using npm

```bash
npm install efile-parser
```


## Usage

### Reading XML Files
For reading xml files 

```javascript
import { createReadStream } from "fs"

const readStream = createReadStream('pathToFile')
const xmlStream = new LargeXmlParser(readStream)
const fileParser = xmlStream.parse('tagNameToParse') // Provide your tag name. Tag name are case sensitive
let i = 0
for await (const text of fileParser) {
    // Returns text between tagNameToParse
    // Use another library to parse text from xml to json
}
```


### Reading CSV Files
For reading csv files 

```javascript
import { createReadStream } from "fs"

const readStream = createReadStream('pathToFile')
const csvTransformer = new LargeCSVParser(readStream, { delimiter: ',' }) // second argument is optional. Provide \t for tsv
const fileParser = csvTransformer.parse()
for await (const parsedObj of fileParser) {
    // parsed obj contains these properties
    // data         contains csv data in array
    // rowNumber    gives you current row number
    // startLine    starting line in file
    // endLine      end line in file
}
```
