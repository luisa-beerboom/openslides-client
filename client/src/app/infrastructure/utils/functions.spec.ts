import {
    getLongPreview,
    getShortPreview,
    joinTypedArrays,
    reconvertChars,
    splitTypedArray,
    stripHtmlTags,
    toBase64,
    toBoolean,
    toDecimal
} from './functions';

describe(`utils: functions`, () => {
    describe(`toBase64 function`, () => {
        it(`test with a blob`, async () => {
            const blob = new Blob([`A blobbery blobby blob blob.`]);
            expect(await toBase64(blob)).toBe(`QSBibG9iYmVyeSBibG9iYnkgYmxvYiBibG9iLg==`);
        });

        it(`test with a file`, async () => {
            const file = new File([`A filery fily file file.`], `Peter`);
            expect(await toBase64(file)).toBe(`QSBmaWxlcnkgZmlseSBmaWxlIGZpbGUu`);
        });
    });

    describe(`reconvertChars function`, () => {
        it(`test every reconverted value`, () => {
            expect(
                reconvertChars(
                    `&auml;&#228;&Auml;&#196;&ouml;&#246;&Ouml;&#214;&uuml;&Uuml;&aring;&#229;&Aring;&#197;&szlig;&#223;`
                )
            ).toBe(`ääÄÄööÖÖüÜååÅÅßß`);
        });
    });

    describe(`stripHtmlTags function`, () => {
        it(`test with simple tags`, () => {
            expect(stripHtmlTags(`<div>Hello World!</div> `)).toBe(`Hello World!`);
            expect(stripHtmlTags(`<div>Hello World!<p>This is a paragraph.</p></div>`)).toBe(
                `Hello World!This is a paragraph.`
            );
        });
        it(`test with single tag`, () => {
            expect(stripHtmlTags(`<div>Hello World!</div><span>Please enter your data:</span><input> `)).toBe(
                `Hello World!Please enter your data:`
            );
            expect(
                stripHtmlTags(`<div>Hello World!</div><span>Please enter your data:</span><input class="data" /> `)
            ).toBe(`Hello World!Please enter your data:`);
        });
    });

    describe(`toBoolean function`, () => {
        it(`test with various values`, () => {
            expect(toBoolean(`1`)).toBe(true);
            expect(toBoolean(`on`)).toBe(true);
            expect(toBoolean(`true`)).toBe(true);
            expect(toBoolean(`0`)).toBe(false);
            expect(toBoolean(`off`)).toBe(false);
            expect(toBoolean(`false`)).toBe(false);
            expect(toBoolean(``)).toBe(false);
            expect(toBoolean(`A hat`)).toBe(false);
            expect(toBoolean(`A stick`)).toBe(false);
            expect(toBoolean(`An umbrella`)).toBe(false);
        });
    });

    describe(`toDecimal function`, () => {
        it(`test with various acceptable values`, () => {
            expect(toDecimal(`1`)).toBe(`1.000000`);
            expect(toDecimal(`1.234`)).toBe(`1.234000`);
            expect(toDecimal(`1.23456789`)).toBe(`1.234568`);
            expect(toDecimal(1)).toBe(`1.000000`);
            expect(toDecimal(1.234)).toBe(`1.234000`);
            expect(toDecimal(1.23456789)).toBe(`1.234568`);
            expect(toDecimal(undefined)).toBe(null);
        });

        it(`test with various unacceptable values`, () => {
            expect(() => toDecimal(`1,234`)).toThrowError(`Can't convert "1,234" to number`);
            expect(() => toDecimal(`fourtytwo`)).toThrowError(`Can't convert "fourtytwo" to number`);
        });
    });

    describe(`getLongPreview function`, () => {
        const loremIpsum =
            `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labor`
                .split(` `)
                .join(``);

        it(`test with empty string`, () => {
            expect(getLongPreview(``)).toBe(``);
            expect(getLongPreview(``, 100)).toBe(``);
        });

        it(`test with shorter string`, () => {
            expect(getLongPreview(loremIpsum.slice(0, 150))).toBe(loremIpsum.slice(0, 150));
            expect(getLongPreview(loremIpsum.slice(0, 150)).length).toBe(150);
            expect(getLongPreview(loremIpsum.slice(0, 150), 100)).toBe(
                `Loremipsumdolorsitamet,consetetursadipscingelit [...] liquyamerat,seddiamvoluptua.Atveroeosetaccusam`
            );
            expect(getLongPreview(loremIpsum.slice(0, 150), 100).length).toBe(100);
        });

        it(`test with longer string`, () => {
            expect(getLongPreview(loremIpsum)).toBe(
                `Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroeosetaccu [...] dgubergren,noseatakimatasanctusestLoremipsumdolorsitamet.Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlabor`
            );
            expect(getLongPreview(loremIpsum).length).toBe(300);
            expect(getLongPreview(loremIpsum, 100)).toBe(
                `Loremipsumdolorsitamet,consetetursadipscingelit [...] elitr,seddiamnonumyeirmodtemporinviduntutlabor`
            );
            expect(getLongPreview(loremIpsum, 100).length).toBe(100);
        });

        it(`test with string lengths around 300`, () => {
            expect(getLongPreview(loremIpsum.slice(0, 301))).toBe(
                `Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroeosetaccu [...] toduodoloresetearebum.Stetclitakasdgubergren,noseatakimatasanctusestLoremipsumdolorsitamet.Loremipsumdolorsitamet,consetetursadipscingelitr,seddia`
            );
            expect(getLongPreview(loremIpsum.slice(0, 301)).length).toBe(300);
            expect(getLongPreview(loremIpsum.slice(0, 300))).toBe(loremIpsum.slice(0, 300));
            expect(getLongPreview(loremIpsum.slice(0, 300)).length).toBe(300);
            expect(getLongPreview(loremIpsum.slice(0, 299))).toBe(loremIpsum.slice(0, 299));
            expect(getLongPreview(loremIpsum.slice(0, 299)).length).toBe(299);
        });

        it(`test with empty spaces`, () => {
            expect(getLongPreview(`0 1 2 3 4 5 6 7 8 9`, 16)).toBe(`0 1 2 [...] 8 9`);
            expect(getLongPreview(`0 1 2 3 4 5 6 7 8 9`, 16).length).toBe(15);
        });

        it(`test with uneven size`, () => {
            expect(getLongPreview(`abcdefghijklmnopqrstuvwxyz`, 15)).toBe(`abcd [...] wxyz`);
            expect(getLongPreview(`abcdefghijklmnopqrstuvwxyz`, 15).length).toBe(15);
        });

        it(`test with html tags`, () => {
            expect(getLongPreview(`<p>abcdefghijklmnopqrstuvwxyz</p>`, 16)).toBe(`abcde [...] wxyz`);
            expect(getLongPreview(`<p>abcdefghijklmnopqrstuvwxyz</p>`, 16).length).toBe(16);
        });
    });

    describe(`getShortPreview function`, () => {
        const loremIpsum =
            `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labor`
                .split(` `)
                .join(``);

        it(`test with empty string`, () => {
            expect(getShortPreview(``)).toBe(``);
        });

        it(`test with shorter string`, () => {
            expect(getShortPreview(loremIpsum.slice(0, 20))).toBe(`Loremipsumdolorsitam`);
            expect(getShortPreview(loremIpsum.slice(0, 20)).length).toBe(20);
        });

        it(`test with longer string`, () => {
            expect(getShortPreview(loremIpsum)).toBe(`Loremipsumdolorsitamet,consetetursadipscingelit...`);
            expect(getShortPreview(loremIpsum).length).toBe(50);
        });

        it(`test with string lengths around 50`, () => {
            expect(getShortPreview(loremIpsum.slice(0, 51))).toBe(`Loremipsumdolorsitamet,consetetursadipscingelit...`);
            expect(getShortPreview(loremIpsum.slice(0, 51)).length).toBe(50);
            expect(getShortPreview(loremIpsum.slice(0, 50))).toBe(loremIpsum.slice(0, 50));
            expect(getShortPreview(loremIpsum.slice(0, 50)).length).toBe(50);
            expect(getShortPreview(loremIpsum.slice(0, 49))).toBe(loremIpsum.slice(0, 49));
            expect(getShortPreview(loremIpsum.slice(0, 49)).length).toBe(49);
        });

        it(`test with empty spaces`, () => {
            expect(getShortPreview(`Letters: a b c d e f g h i j k l m n o p q r s t u v w x y z`)).toBe(
                `Letters: a b c d e f g h i j k l m n o p q r s...`
            );
            expect(getShortPreview(`Letters: a b c d e f g h i j k l m n o p q r s t u v w x y z`).length).toBe(49);
        });

        it(`test with html tags`, () => {
            expect(getShortPreview(`<p>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz</p>`)).toBe(
                `abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstu...`
            );
            expect(getShortPreview(`<p>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz</p>`).length).toBe(50);
        });
    });

    describe(`joinTypedArrays function`, () => {
        it(`join two UInt8Arrays`, () => {
            let a = Uint8Array.from([1, 2, 3, 4]);
            let b = Uint8Array.from([5, 6, 7, 8]);

            let joined = joinTypedArrays(Uint8Array, a, b);
            let expected = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);

            expect(joined).toEqual(expected);
        });
    });

    describe(`splitTypedArray function`, () => {
        it(`split array no seperator at end`, () => {
            let a = Uint8Array.from([1, 2, 10, 3, 4]);

            let joined = splitTypedArray(10, a);
            let expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperator at end`, () => {
            let a = Uint8Array.from([1, 2, 10, 3, 4, 10]);

            let joined = splitTypedArray(10, a);
            let expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4, 10])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperator at start`, () => {
            let a = Uint8Array.from([10, 1, 2, 10, 3, 4]);

            let joined = splitTypedArray(10, a);
            let expected = [Uint8Array.from([10]), Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperators following directly`, () => {
            let a = Uint8Array.from([1, 2, 10, 10, 3, 4]);

            let joined = splitTypedArray(10, a);
            let expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });
    });
});
