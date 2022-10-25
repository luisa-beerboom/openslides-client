import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { VoteDecryptGatewayService } from 'src/app/gateways/vote-decrypt-gateway.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { OrganizationControllerService } from 'src/app/site/pages/organization/services/organization-controller.service';

import { PollControllerService } from '../../../../services/poll-controller.service';

@Component({
    selector: `os-voting-cryptography-info-dialog`,
    templateUrl: `./voting-cryptography-info-dialog.component.html`,
    styleUrls: [`./voting-cryptography-info-dialog.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class VotingCryptographyInfoDialogComponent {
    public get pubKey(): string {
        return this._pubKey;
    }

    public get poll(): ViewPoll {
        return this._poll;
    }

    public waiting = new BehaviorSubject<boolean>(false);

    private _pubKey: string;
    private _poll: ViewPoll;

    constructor(
        private orgaRepo: OrganizationControllerService,
        private pollRepo: PollControllerService,
        private decryptGateway: VoteDecryptGatewayService,
        @Inject(MAT_DIALOG_DATA) pollData: ViewPoll
    ) {
        this.orgaRepo
            .getViewModelObservable(ORGANIZATION_ID)
            .pipe(
                map(orga => orga.vote_decrypt_public_main_key),
                distinctUntilChanged()
            )
            .subscribe(mainKey => (this._pubKey = mainKey));
        this.pollRepo
            .getViewModelObservable(pollData.id)
            .pipe(distinctUntilChanged())
            .subscribe(poll => (this._poll = poll));
    }

    public async verifyPoll(): Promise<void> {
        if (!this._poll) {
            return;
        }
        this.waiting.next(true);
        await this.decryptGateway.reVerifyPoll(this.poll);
        this.waiting.next(false);
    }
}
