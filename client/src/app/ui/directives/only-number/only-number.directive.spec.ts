import { OnlyNumberDirective } from './only-number.directive';

describe(`OnlyNumberDirective`, () => {
    it(`should create an instance`, () => {
        const directive = new OnlyNumberDirective(null);
        expect(directive).toBeTruthy();
    });
});
