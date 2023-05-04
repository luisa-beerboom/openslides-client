import { Directive, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ImportViaBackendPhase } from 'src/app/ui/modules/import-list/components/via-backend-import-list/via-backend-import-list.component';

import { Identifiable } from '../../domain/interfaces';
import { getLongPreview, getShortPreview } from '../../infrastructure/utils';
import { ComponentServiceCollectorService } from '../services/component-service-collector.service';
import { BaseViaBackendImportService } from './base-import.service/base-via-backend-import.service';

@Directive()
export abstract class BaseViaBackendImportListComponent<M extends Identifiable>
    extends BaseComponent
    implements OnInit
{
    /**
     * Helper function for previews
     */
    public getLongPreview = getLongPreview;

    /**
     * Helper function for previews
     */
    public getShortPreview = getShortPreview;

    /**
     * True if the import is in a state in which an import can be conducted
     */
    public get canImport(): boolean {
        return this._state === ImportViaBackendPhase.AWAITING_CONFIRM || this.tryAgain;
    }

    /**
     * True if the import has successfully finished.
     */
    public get finishedSuccessfully(): boolean {
        return this._state === ImportViaBackendPhase.FINISHED;
    }

    /**
     * True if, after an attempted import failed, the view is waiting for the user to confirm the import on the new preview.
     */
    public get tryAgain(): boolean {
        return this._state === ImportViaBackendPhase.TRY_AGAIN;
    }

    /**
     * True while an import is in progress.
     */
    public get isImporting(): boolean {
        return this._state === ImportViaBackendPhase.IMPORTING;
    }

    /**
     * True if the preview can not be imported.
     */
    public get hasErrors(): boolean {
        return this._state === ImportViaBackendPhase.ERROR;
    }

    private _state: ImportViaBackendPhase = ImportViaBackendPhase.LOADING_PREVIEW;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        protected importer: BaseViaBackendImportService<M>
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.importer.currentImportPhaseObservable.subscribe(phase => {
            this._state = phase;
        });
    }

    /**
     * Triggers the importer's import
     */
    public async doImport(): Promise<void> {
        await this.importer.doImport();
    }
}
