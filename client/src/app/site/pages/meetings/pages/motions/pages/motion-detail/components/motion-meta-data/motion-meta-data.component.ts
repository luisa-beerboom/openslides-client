import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { ChangeRecoMode } from 'src/app/domain/models/motions/motions.constants';
import { ViewMotion, ViewMotionCategory, ViewMotionState, ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { MotionForwardDialogService } from '../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { MotionPermissionService } from '../../../../services/common/motion-permission.service/motion-permission.service';
import { BaseMotionDetailChildComponent } from '../../base/base-motion-detail-child.component';
import { MotionDetailServiceCollectorService } from '../../services/motion-detail-service-collector.service/motion-detail-service-collector.service';

@Component({
    selector: `os-motion-meta-data`,
    templateUrl: `./motion-meta-data.component.html`,
    styleUrls: [`./motion-meta-data.component.scss`]
})
export class MotionMetaDataComponent extends BaseMotionDetailChildComponent {
    public motionBlocks: MotionBlock[] = [];

    public categories: ViewMotionCategory[] = [];

    public tags: ViewTag[] = [];

    public recommendationReferencingMotions: ViewMotion[] = [];

    /**
     * Determine if the name of supporters are visible
     */
    public showSupporters = false;

    /**
     * @returns the current recommendation label (with extension)
     */
    public get recommendationLabel(): string {
        return this.repo.getExtendedRecommendationLabel(this.motion);
    }

    public get isRecommendationEnabled(): boolean {
        return (
            (this.perms.isAllowed(`change_metadata`) || !!this.motion.recommendation) &&
            !!this.recommender &&
            !!this.getPossibleRecommendations().length
        );
    }

    /**
     * @returns the current state label (with extension)
     */
    public get stateLabel(): string {
        return this.repo.getExtendedStateLabel(this.motion);
    }

    public get isDifferedChangeRecoMode(): boolean {
        return this.viewService.currentChangeRecommendationMode === ChangeRecoMode.Diff;
    }

    /**
     * Custom recommender as set in the settings
     */
    public recommender: string | null = null;

    public motionObserver: Observable<ViewMotion[]> = of([]);

    /**
     * All amendments to this motion
     */
    public override amendments: ViewMotion[] = [];

    public override set showAllAmendments(is: boolean) {
        this.viewService.showAllAmendmentsStateSubject.next(is);
    }

    public get showForwardButton(): boolean {
        return (
            !!this.motion.state?.allow_motion_forwarding &&
            this.operator.hasPerms(Permission.motionCanForward) &&
            this._forwardingAvailable &&
            !this.motion.derived_motions.length
        );
    }

    private _forwardingAvailable: boolean = false;

    /**
     * The subscription to the recommender config variable.
     */
    private recommenderSubscription: Subscription | null = null;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        motionServiceCollector: MotionDetailServiceCollectorService,
        public perms: MotionPermissionService,
        private operator: OperatorService,
        private motionForwardingService: MotionForwardDialogService,
        private meetingController: MeetingControllerService
    ) {
        super(componentServiceCollector, translate, motionServiceCollector);

        if (operator.hasPerms(Permission.motionCanManage)) {
            this.motionForwardingService.forwardingMeetingsAvailable().then(forwardingAvailable => {
                this._forwardingAvailable = forwardingAvailable;
            });
        } else {
            this._forwardingAvailable = false;
        }
    }

    /**
     * Sets the state
     *
     * @param id Motion state id
     */
    public setState(id: number): void {
        this.repo.setState(id, this.motion).resolve();
    }

    public resetState(): void {
        this.repo.resetState(this.motion).resolve();
    }

    /**
     * triggers the update this motion's state extension according to the current string
     */
    public setStateExtension(nextExtension: string): void {
        this.repo.setStateExtension(this.motion, nextExtension);
    }

    /**
     * Sets the recommendation
     *
     * @param id Motion recommendation id
     */
    public setRecommendation(id: number): void {
        this.repo.setRecommendation(id, this.motion).resolve();
    }

    public resetRecommendation(): void {
        this.repo.resetRecommendation(this.motion).resolve();
    }

    /**
     * triggers the update this motion's recommendation extension according to the current string
     * in {@link newRecommendationExtension}
     */
    public setRecommendationExtension(nextExtension: string): void {
        this.repo.setRecommendationExtension(this.motion, nextExtension);
    }

    /**
     * Sets the category for current motion
     *
     * @param id Motion category id
     */
    public setCategory(id: number | null): void {
        if (id === this.motion.category_id) {
            id = null;
        }
        this.repo.setCategory(id, this.motion);
    }

    /**
     * Adds or removes a tag to the current motion
     *
     * @param {MouseEvent} event
     * @param {number} id Motion tag id
     */
    public setTag(event: MouseEvent, id: number): void {
        event.stopPropagation();
        this.repo.toggleTag(this.motion, id);
    }

    /**
     * Add the current motion to a motion block
     *
     * @param id Motion block id
     */
    public setBlock(id: number | null): void {
        if (id === this.motion.block_id) {
            id = null;
        }
        this.repo.setBlock(id, this.motion);
    }

    /**
     * Supports the motion (as requested user)
     */
    public support(): void {
        this.repo.support(this.motion).catch(this.raiseError);
    }

    /**
     * Unsupports the motion
     */
    public unsupport(): void {
        this.repo.unsupport(this.motion).catch(this.raiseError);
    }

    /**
     * Opens the dialog with all supporters.
     * TODO: open dialog here!
     */
    public openSupportersDialog(): void {
        this.showSupporters = !this.showSupporters;
    }

    /**
     * Check if a recommendation can be followed. Checks for permissions and additionally if a recommentadion is present
     */
    public canFollowRecommendation(): boolean {
        return this.perms.isAllowed(`createpoll`, this.motion) && !!this.motion.recommendation?.recommendation_label;
    }

    public async forwardMotionToMeetings(): Promise<void> {
        await this.motionForwardingService.forwardMotionsToMeetings(this.motion);
    }

    /**
     * Handler for the 'follow recommendation' button
     */
    public onFollowRecButton(): void {
        this.repo.followRecommendation(this.motion);
    }

    public getPossibleRecommendations(): ViewMotionState[] {
        const allStates = this.motion.state?.workflow?.states || [];
        return allStates.filter(state => state.recommendation_label).sort((a, b) => a.weight - b.weight);
    }

    public getOriginMotions(): ViewMotion[] {
        const copy = [...(this.motion.all_origins || [])];
        return copy.reverse();
    }

    public getMeetingNameForMotion(motion: ViewMotion): string {
        return motion.meeting?.name ?? this.meetingController.getViewModelUnsafe(motion.meeting_id)?.name;
    }

    protected override getSubscriptions(): Subscription[] {
        return [
            this.amendmentRepo.getViewModelListObservableFor(this.motion).subscribe(value => (this.amendments = value)),
            this.tagRepo.getViewModelListObservable().subscribe(value => (this.tags = value)),
            this.categoryRepo.getViewModelListObservable().subscribe(value => (this.categories = value)),
            this.blockRepo.getViewModelListObservable().subscribe(value => (this.motionBlocks = value)),
            this.repo
                .getRecommendationReferencingMotions(this.motion?.id)
                ?.subscribe(motions => (this.recommendationReferencingMotions = motions))
        ];
    }

    protected override onAfterInit(): void {
        this.motionObserver = this.repo.getViewModelListObservable();
        this.setupRecommender();
    }

    /**
     * Observes the repository for changes in the motion recommender
     */
    private setupRecommender(): void {
        if (this.motion) {
            const configKey: keyof Settings = this.motion.isStatuteAmendment()
                ? `motions_statute_recommendations_by`
                : `motions_recommendations_by`;
            if (this.recommenderSubscription) {
                this.recommenderSubscription.unsubscribe();
            }
            this.recommenderSubscription = this.meetingSettingsService.get(configKey).subscribe(recommender => {
                this.recommender = recommender;
            });
        }
    }
}
