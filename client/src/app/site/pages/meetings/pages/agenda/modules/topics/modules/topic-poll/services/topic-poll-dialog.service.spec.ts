import { TestBed } from '@angular/core/testing';

import { TopicPollDialogService } from './topic-poll-dialog.service';

describe(`TopicPollDialogService`, () => {
    let service: TopicPollDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TopicPollDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
