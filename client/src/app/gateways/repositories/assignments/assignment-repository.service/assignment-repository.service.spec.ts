import { TestBed } from '@angular/core/testing';

import { AssignmentRepositoryService } from './assignment-repository.service';

describe(`AssignmentRepositoryService`, () => {
    let service: AssignmentRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
