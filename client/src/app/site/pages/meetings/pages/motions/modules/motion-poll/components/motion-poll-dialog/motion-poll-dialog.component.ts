import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { PollPercentBaseVerbose, VoteValue } from 'src/app/domain/models/poll';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { MotionPollService } from '../../services';
import { MotionPollFormComponent } from '../motion-poll-form/motion-poll-form.component';

@Component({
    selector: `os-motion-poll-dialog`,
    templateUrl: `./motion-poll-dialog.component.html`,
    styleUrls: [`./motion-poll-dialog.component.scss`]
})
export class MotionPollDialogComponent extends BasePollDialogComponent {
    public PercentBaseVerbose = PollPercentBaseVerbose;

    @ViewChild(MotionPollFormComponent, { static: true })
    protected override pollForm: MotionPollFormComponent | null = null;

    public constructor(
        public motionPollService: MotionPollService,
        dialogRef: MatDialogRef<BasePollDialogComponent>,
        formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) pollData: ViewPoll<ViewMotion>
    ) {
        super(dialogRef, pollData, formBuilder);
    }

    protected getAnalogVoteFields(): VoteValue[] {
        return [`Y`, `N`, `A`];
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        return [this.pollData.content_object];
    }
}
