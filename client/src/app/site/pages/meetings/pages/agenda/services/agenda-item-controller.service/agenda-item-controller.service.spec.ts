import { TestBed } from '@angular/core/testing';

import { AgendaItemControllerService } from './agenda-item-controller.service';

describe(`AgendaItemControllerService`, () => {
    let service: AgendaItemControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AgendaItemControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
