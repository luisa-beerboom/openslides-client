import { TestBed } from '@angular/core/testing';

import { ApplauseBarDisplayService } from './applause-bar-display.service';

describe(`ApplauseBarDisplayService`, () => {
    let service: ApplauseBarDisplayService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ApplauseBarDisplayService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
