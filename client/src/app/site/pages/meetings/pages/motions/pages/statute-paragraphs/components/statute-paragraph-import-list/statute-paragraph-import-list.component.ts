import { Component, OnInit } from '@angular/core';
import { MotionStatuteParagraph } from 'src/app/domain/models/motions/motion-statute-paragraph';
import { BaseImportListComponent } from 'src/app/site/base/base-import-list.component';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { TranslateService } from '@ngx-translate/core';
import { StatuteParagraphImportService } from '../../services/statute-paragraph-import.service';
import { statuteParagraphHeadersAndVerboseNames } from '../../definitions';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
    selector: 'os-statute-paragraph-import-list',
    templateUrl: './statute-paragraph-import-list.component.html',
    styleUrls: ['./statute-paragraph-import-list.component.scss']
})
export class StatuteParagraphImportListComponent extends BaseImportListComponent<MotionStatuteParagraph> {
    public possibleFields = Object.values(statuteParagraphHeadersAndVerboseNames);

    public columns: ImportListHeaderDefinition[] = Object.keys(statuteParagraphHeadersAndVerboseNames).map(header => ({
        prop: `newEntry.${header}`,
        label: _(statuteParagraphHeadersAndVerboseNames[header]),
        isTableColumn: true,
        isRequired: true
    }));

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        public override importer: StatuteParagraphImportService
    ) {
        super(componentServiceCollector, translate, importer);
    }
}