import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseViaBackendImportListComponent } from 'src/app/site/base/base-via-backend-import-list.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { accountHeadersAndVerboseNames } from '../../definitions';
import { AccountImportService } from '../../services/account-import.service/account-import.service';

@Component({
    selector: `os-account-import-list`,
    templateUrl: `./account-import-list.component.html`,
    styleUrls: [`./account-import-list.component.scss`]
})
export class AccountImportListComponent extends BaseViaBackendImportListComponent {
    public possibleFields = Object.keys(accountHeadersAndVerboseNames);

    public columns: ImportListHeaderDefinition[] = Object.keys(accountHeadersAndVerboseNames).map(header => ({
        property: header,
        label: (<any>accountHeadersAndVerboseNames)[header],
        isTableColumn: true
    }));

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public override importer: AccountImportService
    ) {
        super(componentServiceCollector, translate, importer);
    }
}
