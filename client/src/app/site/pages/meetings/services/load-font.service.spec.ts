import { TestBed } from '@angular/core/testing';

import { LoadFontService } from './load-font.service';

describe(`LoadFontService`, () => {
    let service: LoadFontService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LoadFontService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
