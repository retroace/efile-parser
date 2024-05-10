import { indexOfEndTag, parseTagName } from "../src/utils/tag"

describe('TagParser', () => {

    it.each([
        ['<something>', 'something'],
        ['hello<how are you></how>', 'how'],
        ['hello<!--  -->', '!--'],
        ['hello<!DOCTYPE  -->', '!DOCTYPE'],
    ])(`%# returns proper tag names`, (xml, expectedTag) => {
        const tagName = parseTagName(xml)
        expect(tagName.name).toEqual(expectedTag)
    })


    it.each([
        ['', 'soething', -1],
        ['</SOETHING>', 'soething', -1],
        ['</soething', 'soething', -1],
        ['</soething>', 'soething', 11],
        ['<soething></soething>', 'soething', 21],
    ])('%# returns proper end tag index', (xml, tagName, index) => {
        const endIndex = indexOfEndTag(xml, tagName)
        expect(endIndex).toBe(index)
    })
})