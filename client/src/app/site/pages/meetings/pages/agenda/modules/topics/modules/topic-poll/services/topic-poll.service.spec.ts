import { TestBed } from '@angular/core/testing';

import { TopicPollService } from './topic-poll.service';

describe(`TopicPollService`, () => {
    let service: TopicPollService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TopicPollService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
