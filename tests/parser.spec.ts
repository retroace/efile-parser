import { Readable } from "stream"
import { LargeXmlParser } from "../src"


describe('Parse XML', () => {
    it(`parses given xml`, async () => {
        const testString = ['someone', 'noone', 'toone', 'please']
        const xml = testString.map(i => `<!-- awesome <we have place></we have place> --><note><to>${i}</to></note>`).join('\n')

        const readStream = Readable.from(`<?xml version="1.0" encoding="UTF-8"?>${xml}`.split('\n'))

        const xmlStream = new LargeXmlParser(readStream)
        const values = xmlStream.parse('note')
        let i = 0
        for await (const val of values) {
            if(val instanceof Object) {
                expect(val).toBeFalsy()
                continue;
            }
            expect(val.includes(testString[i])).toBeTruthy()
            i++
        }
    })

    it(`skip if only comments and opening xml is present`, async () => {
        const testString = ['someone', 'noone', 'toone', 'please']
        const xml = testString.map(i => `<!-- awesome <we have place>${i}</we have place> -->`).join('\n')

        const readStream = Readable.from(`<?xml version="1.0" encoding="UTF-8"?>${xml}`.split('\n'))

        const xmlStream = new LargeXmlParser(readStream)
        const values = xmlStream.parse('we')
        for await (const val of values) { throw Error('Should not go here') }
    })
})