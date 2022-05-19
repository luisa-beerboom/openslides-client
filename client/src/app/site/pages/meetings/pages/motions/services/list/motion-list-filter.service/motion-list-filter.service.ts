import { Injectable } from '@angular/core';
import {
    OsFilterOption,
    OsFilter,
    OsFilterOptions,
    BaseFilterListService
} from 'src/app/site/base/base-filter.service';
import { ViewMotion } from '../../../view-models';
import { AmendmentType } from 'src/app/domain/models/motions/motions.constants';
import { StorageService } from 'src/app/gateways/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'src/app/site/services/operator.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { Restriction } from 'src/app/domain/models/motions/motion-state';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { MotionsListServiceModule } from '../motions-list-service.module';
import { MotionWorkflowControllerService } from '../../../modules/workflows/services';
import { MotionBlockControllerService } from '../../../modules/motion-blocks/services';
import { MotionCommentSectionControllerService } from '../../../modules/comments/services';
import { TagControllerService } from '../../../modules/tags/services';
import { MotionCategoryControllerService } from '../../../modules/categories/services';
import { HistoryService } from 'src/app/site/pages/meetings/pages/history/services/history.service';
import { BaseMeetingFilterListService } from 'src/app/site/pages/meetings/base/base-meeting-filter-list.service';

/**
 * Filter description to easier parse dynamically occurring workflows
 */
interface WorkflowFilterDesc {
    name: string;
    filter: OsFilterOption[];
}

interface WorkflowConfiguration {
    statuteEnabled: boolean;
    statute: Id | null;
    motion: Id | null;
    amendment: Id | null;
}

/**
 * Filter the motion list
 */
@Injectable({
    providedIn: MotionsListServiceModule
})
export class MotionListFilterService extends BaseMeetingFilterListService<ViewMotion> {
    /**
     * set the storage key name
     */
    // protected storageKey = `MotionList`;

    /**
     * Listen to the configuration for change in defined/used workflows
     */
    protected enabledWorkflows: WorkflowConfiguration = {
        statuteEnabled: false,
        statute: null,
        motion: null,
        amendment: null
    };

    /**
     * Determine to show amendments in the motion list
     */
    private showAmendmentsInMainTable: boolean = false;

    /**
     * Filter definitions for the workflow filter. Options will be generated by
     * getFilterOptions (as the workflows available may change)
     */
    private stateFilterOptions: OsFilter<ViewMotion> = {
        property: `state_id`,
        label: `State`,
        options: []
    };

    private categoryFilterOptions: OsFilter<ViewMotion> = {
        property: `category_id`,
        label: `Category`,
        options: []
    };

    private motionBlockFilterOptions: OsFilter<ViewMotion> = {
        property: `block_id`,
        label: `Motion block`,
        options: []
    };

    private motionCommentFilterOptions: OsFilter<ViewMotion> = {
        property: `usedCommentSectionIds`,
        label: `Comment`,
        options: []
    };

    private recommendationFilterOptions: OsFilter<ViewMotion> = {
        property: `recommendation_id`,
        label: `Recommendation`,
        options: []
    };

    private tagFilterOptions: OsFilter<ViewMotion> = {
        property: `tag_ids`,
        label: `Tags`,
        options: []
    };

    private hasSpeakerOptions: OsFilter<ViewMotion> = {
        property: `hasSpeakers`,
        label: `Speakers`,
        options: [
            { condition: true, label: this.translate.instant(`Has speakers`) },
            { condition: false, label: this.translate.instant(`Has no speakers`) }
        ]
    };

    private AmendmentFilterOption: OsFilter<ViewMotion> = {
        property: `amendmentType`,
        label: `Amendment`,
        options: [
            { condition: AmendmentType.Amendment, label: this.translate.instant(`Is amendment`) },
            { condition: AmendmentType.Parent, label: this.translate.instant(`Has amendments`) },
            { condition: AmendmentType.Lead, label: this.translate.instant(`Is no amendment and has no amendments`) }
        ]
    };

    private personalNoteFilterOptions: any[] = [
        {
            property: `isFavorite`,
            label: this.translate.instant(`Favorites`),
            options: [
                {
                    condition: true,
                    label: this.translate.instant(`Is favorite`)
                },
                {
                    condition: false,
                    label: this.translate.instant(`Is not favorite`)
                }
            ]
        },
        {
            property: `hasNotes`,
            label: this.translate.instant(`Personal notes`),
            options: [
                {
                    condition: true,
                    label: this.translate.instant(`Has notes`)
                },
                {
                    condition: false,
                    label: this.translate.instant(`Does not have notes`)
                }
            ]
        }
    ];

    public constructor(
        baseFilterListService: BaseFilterListService<ViewMotion>,
        store: StorageService,
        history: HistoryService,
        categoryRepo: MotionCategoryControllerService,
        motionBlockRepo: MotionBlockControllerService,
        commentRepo: MotionCommentSectionControllerService,
        tagRepo: TagControllerService,
        private workflowRepo: MotionWorkflowControllerService,
        protected translate: TranslateService,
        private operator: OperatorService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(baseFilterListService, store, history, `MotionList`);
        this.getWorkflowConfig();
        this.getShowAmendmentConfig();

        this.updateFilterForRepo({
            repo: categoryRepo,
            filter: this.categoryFilterOptions,
            noneOptionLabel: this.translate.instant(`No category set`)
        });

        this.updateFilterForRepo({
            repo: motionBlockRepo,
            filter: this.motionBlockFilterOptions,
            noneOptionLabel: this.translate.instant(`No motion block set`)
        });

        this.updateFilterForRepo({
            repo: commentRepo,
            filter: this.motionCommentFilterOptions,
            noneOptionLabel: this.translate.instant(`No comment`)
        });

        this.updateFilterForRepo({
            repo: tagRepo,
            filter: this.tagFilterOptions,
            noneOptionLabel: this.translate.instant(`No tags`)
        });

        this.subscribeWorkflows();
        this.operator.operatorUpdated.subscribe(() => {
            this.setFilterDefinitions();
        });
    }

    /**
     * @override
     * @param motions The motions without amendments, if the according config was set
     */
    protected override preFilter(motions: ViewMotion[]): ViewMotion[] | void {
        if (!this.showAmendmentsInMainTable) {
            return motions.filter(motion => !motion.lead_motion_id);
        }
    }

    /**
     * Listen to changes for the 'motions_amendments_main_table' config value
     */
    private getShowAmendmentConfig(): void {
        this.meetingSettingsService.get(`motions_amendments_in_main_list`).subscribe(show => {
            this.showAmendmentsInMainTable = show;
        });
    }

    private getWorkflowConfig(): void {
        this.meetingSettingsService.get(`motions_default_statute_amendment_workflow_id`).subscribe(id => {
            this.enabledWorkflows.statute = +id;
        });

        this.meetingSettingsService.get(`motions_default_workflow_id`).subscribe(id => {
            this.enabledWorkflows.motion = +id;
        });

        this.meetingSettingsService.get(`motions_statutes_enabled`).subscribe(bool => {
            this.enabledWorkflows.statuteEnabled = bool;
        });
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewMotion>[] {
        let filterDefinitions = [
            this.stateFilterOptions,
            this.categoryFilterOptions,
            this.motionBlockFilterOptions,
            this.recommendationFilterOptions,
            this.motionCommentFilterOptions,
            this.tagFilterOptions
        ];

        // only add the filter if the user has the correct permission
        if (this.operator.hasPerms(Permission.listOfSpeakersCanSee)) {
            filterDefinitions.push(this.hasSpeakerOptions);
        }

        if (this.showAmendmentsInMainTable) {
            filterDefinitions.push(this.AmendmentFilterOption);
        }

        if (!this.operator.isAnonymous) {
            filterDefinitions = filterDefinitions.concat(this.personalNoteFilterOptions);
        }

        return filterDefinitions;
    }

    /**
     * Subscribes to changing Workflows, and updates the state and recommendation filters accordingly.
     */
    private subscribeWorkflows(): void {
        this.workflowRepo.getViewModelListObservable().subscribe(workflows => {
            if (!workflows || !workflows.length) {
                return;
            }
            const workflowFilters: WorkflowFilterDesc[] = [];
            const recoFilters: WorkflowFilterDesc[] = [];

            const finalStates: number[] = [];
            const nonFinalStates: number[] = [];

            // get all relevant information
            for (const workflow of workflows) {
                if (this.isWorkflowEnabled(workflow.id)) {
                    workflowFilters.push({
                        name: workflow.name,
                        filter: []
                    });

                    recoFilters.push({
                        name: workflow.name,
                        filter: []
                    });

                    for (const state of workflow.states) {
                        // get the restriction array, but remove the is_submitter condition, if present
                        const restrictions = state.restrictions?.filter(
                            r => r !== Restriction.motionsIsSubmitter
                        ) as unknown as Permission[];

                        if (!restrictions || !restrictions.length || this.operator.hasPerms(...restrictions)) {
                            // sort final and non final states
                            if (state.isFinalState) {
                                finalStates.push(state.id);
                            } else {
                                nonFinalStates.push(state.id);
                            }

                            workflowFilters[workflowFilters.length - 1].filter.push({
                                condition: state.id,
                                label: state.name
                            });

                            if (state.recommendation_label) {
                                recoFilters[workflowFilters.length - 1].filter.push({
                                    condition: state.id,
                                    label: state.recommendation_label
                                });
                            }
                        }
                    }
                }
            }

            this.setStateFilters(workflowFilters, finalStates, nonFinalStates);
            this.setRecommendationFilters(recoFilters);
            this.setFilterDefinitions();
        });
    }

    private setStateFilters(workflowFilters: WorkflowFilterDesc[], finalStates: Id[], nonFinalStates: Id[]): void {
        // convert to filter options
        if (!workflowFilters || !workflowFilters.length) {
            return;
        }
        let workflowOptions: OsFilterOptions = [];
        // add "done" and "undone"
        workflowOptions.push({
            label: _(`Done`),
            condition: finalStates
        });
        workflowOptions.push({
            label: _(`Undone`),
            condition: nonFinalStates
        });
        workflowOptions.push(`-`);

        for (const filterDef of workflowFilters) {
            workflowOptions.push(filterDef.name);
            workflowOptions = workflowOptions.concat(filterDef.filter);
        }

        this.stateFilterOptions.options = workflowOptions;
    }

    private setRecommendationFilters(recoFilters: WorkflowFilterDesc[]): void {
        if (!recoFilters || !recoFilters.length) {
            return;
        }
        let recoOptions: OsFilterOptions = [];

        for (const filterDef of recoFilters) {
            recoOptions.push(filterDef.name);
            recoOptions = recoOptions.concat(filterDef.filter);
        }

        recoOptions.push(`-`);
        recoOptions.push({
            label: _(`No recommendation`),
            condition: null
        });
        this.recommendationFilterOptions.options = recoOptions;
    }

    protected isWorkflowEnabled(workflowId: number): boolean {
        return (
            workflowId === this.enabledWorkflows.motion ||
            (this.enabledWorkflows.statuteEnabled && workflowId === this.enabledWorkflows.statute)
        );
    }
}
