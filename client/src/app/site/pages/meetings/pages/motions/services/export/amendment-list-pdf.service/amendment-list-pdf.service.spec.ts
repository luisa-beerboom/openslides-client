import { TestBed } from '@angular/core/testing';

import { AmendmentListPdfService } from './amendment-list-pdf.service';

describe(`AmendmentListPdfService`, () => {
    let service: AmendmentListPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AmendmentListPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
