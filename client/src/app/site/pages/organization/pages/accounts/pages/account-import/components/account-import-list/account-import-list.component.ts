import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/domain/models/users/user';
import { BaseViaBackendImportListComponent } from 'src/app/site/base/base-via-backend-import-list.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { AccountControllerService } from '../../../../services/common/account-controller.service';
import { accountHeadersAndVerboseNames } from '../../definitions';
import { AccountImportService } from '../../services/account-import.service/account-import.service';

@Component({
    selector: `os-account-import-list`,
    templateUrl: `./account-import-list.component.html`,
    styleUrls: [`./account-import-list.component.scss`]
})
export class AccountImportListComponent extends BaseViaBackendImportListComponent<User> {
    public possibleFields = Object.keys(accountHeadersAndVerboseNames);

    public columns: ImportListHeaderDefinition[] = Object.keys(accountHeadersAndVerboseNames).map(header => ({
        property: header,
        label: (<any>accountHeadersAndVerboseNames)[header],
        isTableColumn: true
    }));

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public override importer: AccountImportService,
        private accountController: AccountControllerService
    ) {
        super(componentServiceCollector, translate, importer);
    }

    // public override ngOnInit(): void {
    //     super.ngOnInit();
    //     this.loadUsers();
    // }

    // private async loadUsers(): Promise<void> {
    //     try {
    //         // const request = await this.accountController.getAllOrgaUsersModelRequest();
    //         // this.subscribe(request, `load_users`);
    //     } catch (e) {
    //         console.log(`Error`, e);
    //     }
    // }

    // /**
    //  * Guess the type of the property, since
    //  * `const type = typeof User[property];`
    //  * always returns undefined
    //  */
    // protected guessType(userProperty: keyof GeneralUser): 'string' | 'number' | 'boolean' {
    //     const numberProperties: (keyof GeneralUser)[] = [`id`, `vote_weight`];
    //     const booleanProperties: (keyof GeneralUser)[] = [`is_physical_person`, `is_active`];
    //     if (numberProperties.includes(userProperty)) {
    //         return `number`;
    //     } else if (booleanProperties.includes(userProperty)) {
    //         return `boolean`;
    //     } else {
    //         return `string`;
    //     }
    // }
}
