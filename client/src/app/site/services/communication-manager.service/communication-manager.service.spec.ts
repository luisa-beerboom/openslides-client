import { TestBed } from '@angular/core/testing';

import { CommunicationManagerService } from './communication-manager.service';

describe(`CommunicationManagerService`, () => {
    let service: CommunicationManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommunicationManagerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
