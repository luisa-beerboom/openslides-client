import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ViewModelStoreService } from 'app/core/core-services/view-model-store.service';
import { State } from 'app/shared/models/motions/state';
import { StateTitleInformation, ViewState } from 'app/site/motions/models/view-state';
import { ViewWorkflow, WorkflowTitleInformation } from 'app/site/motions/models/view-workflow';
import { BaseRepository, RelationDefinition } from '../base-repository';
import { CollectionStringMapperService } from '../../core-services/collection-string-mapper.service';
import { DataSendService } from '../../core-services/data-send.service';
import { DataStoreService } from '../../core-services/data-store.service';

const StateRelations: RelationDefinition[] = [
    {
        type: 'O2M',
        ownIdKey: 'workflow_id',
        ownKey: 'workflow',
        foreignModel: ViewWorkflow
    },
    {
        type: 'M2M',
        ownIdKey: 'next_states_id',
        ownKey: 'next_states',
        foreignModel: ViewState
    }
];

/**
 * Repository Services for States
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link DataSendService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class StateRepositoryService extends BaseRepository<ViewState, State, StateTitleInformation> {
    /**
     * Creates a WorkflowRepository
     * Converts existing and incoming workflow to ViewWorkflows
     *
     * @param DS Accessing the data store
     * @param mapperService mapping models
     * @param dataSend sending data to the server
     * @param httpService HttpService
     */
    public constructor(
        DS: DataStoreService,
        dataSend: DataSendService,
        mapperService: CollectionStringMapperService,
        viewModelStoreService: ViewModelStoreService,
        translate: TranslateService
    ) {
        super(DS, dataSend, mapperService, viewModelStoreService, translate, State, StateRelations);
    }

    public getTitle = (titleInformation: WorkflowTitleInformation) => {
        return titleInformation.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Workflows' : 'Workflow');
    };
}
