import { LargeCSVParser } from "../src"
import { createReadStream } from "fs"
import { join } from "path"


describe('Parse CSV/TSV', () => {
    it(`parses given csv from file`, async () => {
        const readStream = createReadStream(join(__dirname, 'mock', 'new.csv'))

        const csvTransformer = new LargeCSVParser(readStream, { delimiter: ',' })
        const values = csvTransformer.parse()
        let i = 0
        for await (const val of values) {
            expect(val.data[0]).toEqual(i === 0 ? 'S.No' : String(i))
            i = i + 1;
        }
    })

    it(`parses given tsv from file`, async () => {
        const readStream = createReadStream(join(__dirname, 'mock', 'tnew.csv'))

        const csvTransformer = new LargeCSVParser(readStream, { delimiter: '\t' })
        const values = csvTransformer.parse()
        let i = 0
        for await (const val of values) {
            expect(val.data[0]).toEqual(i === 0 ? 'S.No' : String(i))
            i = i + 1;
        }
    })
})