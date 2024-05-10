export interface CSVParserResult {
    data: string[],
    insideQuotes: boolean,
}

export function parseCSV(
    csvString: string,
    currentRow: string[],
    insideQuotes: boolean = false,
    delimiter: string = ','
): CSVParserResult {
    let columns = csvString.split(delimiter);
    for (let column of columns) {
        if (insideQuotes) {
            if (column.endsWith('"')) {
                insideQuotes = false;
                currentRow[currentRow.length - 1] += '\n' + column.substring(0, column.length - 1);
                continue;
            } 
            currentRow[currentRow.length - 1] += '\n' + column;
            continue;
        }

        if (column.startsWith('"') && !column.endsWith('"')) {
            insideQuotes = true;
            currentRow.push(column.substring(1));
            continue;
        }

        currentRow.push(column);
    }

    if (insideQuotes) {
        return {
            data: currentRow,
            insideQuotes: insideQuotes
        }
    }

    return {
        data: currentRow,
        insideQuotes: insideQuotes
    }
}
