import { TestBed } from '@angular/core/testing';

import { RepositoryServiceCollectorService } from './repository-service-collector.service';

describe(`RepositoryServiceCollectorService`, () => {
    let service: RepositoryServiceCollectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RepositoryServiceCollectorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
