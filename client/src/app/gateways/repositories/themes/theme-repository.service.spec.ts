import { TestBed } from '@angular/core/testing';

import { ThemeRepositoryService } from './theme-repository.service';

describe(`ThemeRepositoryService`, () => {
    let service: ThemeRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
