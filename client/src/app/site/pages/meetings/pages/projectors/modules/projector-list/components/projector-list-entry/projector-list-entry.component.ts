import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { Permission } from 'src/app/domain/definitions/permission';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { Id } from 'src/app/domain/definitions/key-types';
import { ProjectorEditDialogService } from '../../../../components/projector-edit-dialog/services/projector-edit-dialog.service';
import { firstValueFrom } from 'rxjs';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
    selector: 'os-projector-list-entry',
    templateUrl: './projector-list-entry.component.html',
    styleUrls: ['./projector-list-entry.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProjectorListEntryComponent {
    public readonly permission = Permission;

    /**
     * The projector shown by this entry.
     */
    @Input()
    public set projector(value: ViewProjector) {
        this._projector = value;
    }

    public get projector(): ViewProjector {
        return this._projector;
    }

    public get projectionTarget(): '_blank' | '_self' {
        if (this.operator.hasPerms(Permission.projectorCanManage)) {
            return `_self`;
        } else {
            return `_blank`;
        }
    }

    private get activeMeetingId(): Id {
        return this.activeMeetingService.meetingId!;
    }

    private _projector!: ViewProjector;

    /**
     * Constructor. Initializes the update form.
     */
    public constructor(
        private translate: TranslateService,
        private repo: ProjectorControllerService,
        private promptService: PromptService,
        private dialog: ProjectorEditDialogService,
        private operator: OperatorService,
        private activeMeetingService: ActiveMeetingService
    ) {}

    /**
     * Starts editing for the given projector.
     */
    public async editProjector(): Promise<void> {
        const dialogRef = await this.dialog.open(this.projector);
        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            this.repo.update(result, this.projector);
        }
    }

    /**
     * Handler to set the selected projector as the meeting reference projector
     */
    public setProjectorAsReference(): void {
        this.repo.setReferenceProjector(this.projector);
    }

    /**
     * Determines the detail link by permission.
     * Without manage permission, the user should see the full screen projector
     * and not the detail view
     */
    public getDetailLink(): string {
        if (this.operator.hasPerms(Permission.projectorCanManage)) {
            return `/${this.activeMeetingId}/projectors/detail/${this.projector.sequential_number}`;
        } else {
            return `/${this.activeMeetingId}/projector/${this.projector.sequential_number}`;
        }
    }

    /**
     * Delete the projector.
     */
    public async onDeleteButton(): Promise<void> {
        const title = _(`Are you sure you want to delete this projector?`);
        if (await this.promptService.open(title, this.projector.name)) {
            this.repo.delete(this.projector);
        }
    }
}