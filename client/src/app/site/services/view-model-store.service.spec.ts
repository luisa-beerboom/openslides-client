import { TestBed } from '@angular/core/testing';

import { ViewModelStoreService } from './view-model-store.service';

describe(`ViewModelStoreService`, () => {
    let service: ViewModelStoreService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ViewModelStoreService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
