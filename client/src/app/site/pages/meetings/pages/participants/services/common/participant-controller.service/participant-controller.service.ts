import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { User } from 'src/app/domain/models/users/user';
import { Action, ActionService } from 'src/app/gateways/actions';
import { GetUserScopePresenterService } from 'src/app/gateways/presenter';
import {
    FullNameInformation,
    RawUser,
    UserPatchFn,
    UserRepositoryService,
    UserStateField
} from 'src/app/gateways/repositories/users';
import { UserAction } from 'src/app/gateways/repositories/users/user-action';
import { toDecimal } from 'src/app/infrastructure/utils';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { UserService } from 'src/app/site/services/user.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { UserDeleteDialogService } from 'src/app/ui/modules/user-components';

import { ParticipantCommonServiceModule } from '../participant-common-service.module';

export const MEETING_RELATED_FORM_CONTROLS = [
    `structure_level`,
    `number`,
    `vote_weight`,
    `about_me`,
    `comment`,
    `group_ids`,
    `vote_delegations_from_ids`,
    `vote_delegated_to_id`,
    `is_present`
];

@Injectable({
    providedIn: ParticipantCommonServiceModule
})
export class ParticipantControllerService extends BaseMeetingControllerService<ViewUser, User> {
    private _participantListSubject = new BehaviorSubject<ViewUser[]>([]);

    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: UserRepositoryService,
        private userController: UserControllerService,
        private userDeleteDialog: UserDeleteDialogService,
        private presenter: GetUserScopePresenterService,
        private userService: UserService,
        private actions: ActionService
    ) {
        super(controllerServiceCollector, User, repo);
        repo.getViewModelListObservable().subscribe(users => {
            const meetingUsers = users.filter(user => user.meeting_ids.includes(this.activeMeetingId));
            this._participantListSubject.next(meetingUsers);
        });
    }

    public override getViewModelList(): ViewUser[] {
        return this._participantListSubject.value;
    }

    public override getViewModelListObservable(): Observable<ViewUser[]> {
        return this._participantListSubject.asObservable();
    }

    public create(...participants: Partial<User>[]): Promise<Identifiable[]> {
        return this.repo.create(...participants.map(participant => this.validatePayload(participant)));
    }

    public update(patch: UserPatchFn, ...users: ViewUser[]): Action<void> {
        if (typeof patch === `function`) {
            const updatePatch = (user: ViewUser) => {
                const participantPayload = patch(user);
                return this.validatePayload(participantPayload);
            };
            return this.repo.update(updatePatch, ...users);
        }
        return this.repo.update(this.validatePayload(patch as Partial<User>), ...users);
    }

    public updateSelf(patch: UserPatchFn, participant: ViewUser): Promise<void> {
        return this.repo.updateSelf(patch, participant);
    }

    public delete(...participants: Identifiable[]): Action<void> {
        return this.repo.delete(...participants) as Action<void>;
    }

    public bulkGenerateNewPasswords(...users: ViewUser[]): Promise<void> {
        return this.repo.bulkGenerateNewPasswords(users);
    }

    public resetPasswordToDefault(...users: Identifiable[]): Promise<void> {
        return this.repo.resetPasswordToDefault(users);
    }

    public setPassword(user: Identifiable, password: string, useAsDefault?: boolean): Promise<void> {
        return this.repo.setPassword(user, password, useAsDefault);
    }

    public setPasswordSelf(user: Identifiable, newPassword: string, oldPassword: string): Promise<void> {
        return this.repo.setPasswordSelf(user, oldPassword, newPassword);
    }

    /**
     * Should determine if the user (Operator) has the
     * correct permission to perform the given action.
     *
     * actions might be:
     * - delete         (deleting the user) (users.can_manage and not ownPage)
     * - seeName        (title, first, last, gender, about) (user.can_see_name or ownPage)
     * - seeOtherUsers  (title, first, last, gender, about) (user.can_see_name)
     * - seePersonal    (mail, username, structure level) (ownPage)
     * - manage         (everything) (user.can_manage)
     * - changePersonal (mail, username, about) (user.can_manage or ownPage)
     * - changePassword (user.can_change_password)
     *
     * @param action the action the user tries to perform
     */
    public isAllowed(action: string, isOwnPage: boolean): boolean {
        return this.userService.isAllowed(action, isOwnPage);
    }

    public togglePresenceByNumber(...numbers: string[]): Promise<Identifiable[]> {
        const payload = numbers.map(number => ({
            meeting_id: this.activeMeetingId,
            number
        }));
        return this.actions
            .create<Identifiable>({ action: UserAction.TOGGLE_PRESENCE_BY_NUMBER, data: payload })
            .resolve() as any;
    }

    public async sendInvitationEmails(
        users: Identifiable[],
        meetingIds: Ids = [this.activeMeetingId!]
    ): Promise<string> {
        const response = await this.repo.sendInvitationEmails(users, meetingIds);

        const numEmails = response.filter(email => email.sent).length;
        const noEmails = response.filter(email => !email.sent);
        let responseMessage: string;
        if (numEmails === 0) {
            responseMessage = this.translate.instant(`No emails were send.`);
        } else if (numEmails === 1) {
            responseMessage = this.translate.instant(`One email was send sucessfully.`);
        } else {
            responseMessage = this.translate.instant(`%num% emails were send sucessfully.`);
            responseMessage = responseMessage.replace(`%num%`, numEmails.toString());
        }

        if (noEmails.length) {
            responseMessage += ` `;

            if (noEmails.length === 1) {
                responseMessage += this.translate.instant(
                    `The user %user% has no email, so the invitation email could not be send.`
                );
            } else {
                responseMessage += this.translate.instant(
                    `The users %user% have no email, so the invitation emails could not be send.`
                );
            }

            // This one builds a username string like "user1, user2 and user3" with the full names.
            const usernames = noEmails
                .map(email => this.getViewModel(email.recipient_user_id))
                .filter(user => !!user)
                .map(user => user!.short_name);
            let userString: string;
            if (usernames.length > 1) {
                const lastUsername = usernames.pop();
                userString = usernames.join(`, `) + ` ` + this.translate.instant(`and`) + ` ` + lastUsername;
            } else {
                userString = usernames.join(`, `);
            }
            responseMessage = responseMessage.replace(`%user%`, userString);
        }

        return responseMessage;
    }

    public setPresent(isPresent: boolean, ...users: ViewUser[]): Action<void> {
        this.repo.preventAlterationOnDemoUsers(users);
        const payload: any[] = users.map(user => ({
            id: user.id,
            meeting_id: this.activeMeetingId,
            present: isPresent
        }));
        return this.actions.create({ action: UserAction.SET_PRESENT, data: payload });
    }

    public async removeUsersFromMeeting(
        users: ViewUser[],
        meeting: ViewMeeting | null = this.activeMeeting
    ): Promise<boolean> {
        const result = await this.presenter.call({ user_ids: users.map(user => user.id) });
        const toDelete = Object.keys(result)
            .map(key => parseInt(key, 10))
            .filter(key => {
                const fqid = `${result[key].collection}/${result[key].id}`;
                return fqid === meeting!.fqid;
            });
        const toDeleteUsers = toDelete.map(id => this.getViewModel(id)!);
        const toRemove = users.map(user => user.id).difference(toDelete);
        const toRemoveUsers = toRemove.map(id => this.getViewModel(id) as ViewUser);

        const prompt = await this.userDeleteDialog.open({ toDelete: toDeleteUsers, toRemove: toRemoveUsers });
        const answer = await firstValueFrom(prompt.afterClosed());
        if (answer) {
            const patch = { group_$_ids: { [this.activeMeetingId!]: [] } };
            await this.delete(...toDeleteUsers)
                .concat(this.update(patch, ...toRemoveUsers))
                .resolve();
        }
        return answer;
    }

    /**
     * Sets the state of many users. The "state" means any boolean attribute of a user like active or physical person.
     *
     * @param users The users to set the state
     * @param field The boolean field to set
     * @param value The value to set this field to.
     */
    public async setState(field: UserStateField, value: boolean, ...users: ViewUser[]): Promise<void> {
        this.repo.preventAlterationOnDemoUsers(users);
        await this.update(user => ({ id: user.id, [field]: value }), ...users).resolve();
    }

    public getLastSentEmailTimeString(user: ViewUser): string {
        return this.userController.lastSentEmailTimeString(user);
    }

    public getViewModelByNumber(participantNumber: string): ViewUser | null {
        return this.getViewModelList().find(user => user.number() === participantNumber) || null;
    }

    public getRandomPassword(): string {
        return this.userController.getRandomPassword();
    }

    public parseStringIntoUser(name: string): FullNameInformation {
        return this.userController.parseStringIntoUser(name);
    }

    /**
     * Creates a new User from a string
     *
     * @param name: String to create the user from -> assuming its the fullname of a user (not their username)
     * @returns Promise with a created user id and the raw name used as input
     */
    public async createFromString(name: string): Promise<RawUser> {
        const newUser = this.parseStringIntoUser(name);
        const newUserPayload: any = {
            ...newUser,
            is_active: true,
            group_ids: [this.activeMeeting?.default_group_id]
        };
        const identifiable = (await this.create(newUserPayload))[0];
        const getNameFn = () => this.userController.getShortName(newUser);
        return {
            id: identifiable.id,
            ...newUser,
            fqid: `${User.COLLECTION}/${identifiable.id}`,
            getTitle: getNameFn,
            getListTitle: getNameFn
        };
    }

    protected override onMeetingIdChanged(): void {
        this._participantListSubject.next([]);
    }

    private validatePayload(participant: Partial<User>): any {
        return {
            ...participant,
            structure_level_$: participant.structure_level_$ || {
                [this.activeMeetingId!]: participant.structure_level
            },
            group_$_ids: participant.group_$_ids || { [this.activeMeetingId!]: participant.group_ids },
            number_$: participant.number_$ || { [this.activeMeetingId!]: participant.number },
            vote_weight_$: participant.vote_weight_$ || {
                [this.activeMeetingId!]: toDecimal(participant.vote_weight as any)
            },
            vote_delegated_$_to_id: participant.vote_delegated_$_to_id || {
                [this.activeMeetingId!]: participant.vote_delegated_to_id
            },
            vote_delegations_$_from_ids: participant.vote_delegations_$_from_ids || {
                [this.activeMeetingId!]: participant.vote_delegations_from_ids
            }
        };
    }
}
