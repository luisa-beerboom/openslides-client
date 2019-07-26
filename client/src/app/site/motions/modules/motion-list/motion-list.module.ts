import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { MotionExportDialogComponent } from './components/motion-export-dialog/motion-export-dialog.component';
import { MotionListRoutingModule } from './motion-list-routing.module';
import { MotionListComponent } from './components/motion-list/motion-list.component';

@NgModule({
    imports: [CommonModule, MotionListRoutingModule, SharedModule],
    declarations: [MotionListComponent, MotionExportDialogComponent],
    entryComponents: [MotionExportDialogComponent]
})
export class MotionListModule {}
