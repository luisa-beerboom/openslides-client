import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OsFilter } from 'src/app/site/base/base-filter.service';
import { BaseMeetingFilterListService } from 'src/app/site/pages/meetings/base/base-meeting-filter-list.service';
import { MeetingActiveFiltersService } from 'src/app/site/pages/meetings/services/meeting-active-filters.service';
import { DelegationType } from 'src/app/site/pages/meetings/view-models/delegation-type';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { GroupControllerService } from '../../../../modules/groups/services/group-controller.service';
import { ParticipantListServiceModule } from '../participant-list-service.module';

@Injectable({
    providedIn: ParticipantListServiceModule
})
export class ParticipantListFilterService extends BaseMeetingFilterListService<ViewUser> {
    /**
     * set the storage key name
     */
    protected storageKey = `UserList`;

    private userGroupFilterOptions: OsFilter<ViewUser> = {
        property: `group_ids`,
        label: `Groups`,
        options: []
    };

    public constructor(
        store: MeetingActiveFiltersService,
        groupRepo: GroupControllerService,
        private translate: TranslateService
    ) {
        super(store);
        this.updateFilterForRepo({
            repo: groupRepo,
            filter: this.userGroupFilterOptions
        });
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewUser>[] {
        const staticFilterOptions: OsFilter<ViewUser>[] = [
            {
                property: `isPresentInMeeting`,
                label: `Presence`,
                options: [
                    { condition: true, label: this.translate.instant(`Is present`) },
                    { condition: [false, null], label: this.translate.instant(`Is not present`) }
                ]
            },
            {
                property: `is_active`,
                label: this.translate.instant(`Active`),
                options: [
                    { condition: true, label: this.translate.instant(`Is active`) },
                    { condition: [false, null], label: this.translate.instant(`Is not active`) }
                ]
            },
            {
                property: `is_physical_person`,
                label: this.translate.instant(`Committee`),
                options: [
                    { condition: true, label: this.translate.instant(`Is not a committee`) },
                    { condition: [false, null], label: this.translate.instant(`Is a committee`) }
                ]
            },
            {
                property: `isLastEmailSend`,
                label: this.translate.instant(`Last email send`),
                options: [
                    { condition: true, label: this.translate.instant(`Got an email`) },
                    { condition: [false, null], label: this.translate.instant(`Didn't get an email`) }
                ]
            },
            {
                property: `isVoteWeightOne`,
                label: this.translate.instant(`Vote weight`),
                options: [
                    { condition: [false, null], label: this.translate.instant(`Has changed vote weight`) },
                    { condition: true, label: this.translate.instant(`Has unchanged vote weight`) }
                ]
            },
            {
                property: `delegationType`,
                label: this.translate.instant(`Delegation of vote`),
                options: [
                    {
                        condition: DelegationType.Transferred,
                        label: this.translate.instant(`Voting right received from (principals)`)
                    },
                    {
                        condition: DelegationType.Received,
                        label: this.translate.instant(`Voting right delegated to (proxy)`)
                    },
                    {
                        condition: DelegationType.Neither,
                        label: this.translate.instant(`No delegation of vote`)
                    }
                ]
            }
        ];
        return staticFilterOptions.concat(this.userGroupFilterOptions);
    }
}
