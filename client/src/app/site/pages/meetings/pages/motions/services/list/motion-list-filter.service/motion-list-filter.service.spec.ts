import { TestBed } from '@angular/core/testing';

import { MotionListFilterService } from './motion-list-filter.service';

describe(`MotionListFilterService`, () => {
    let service: MotionListFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionListFilterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
