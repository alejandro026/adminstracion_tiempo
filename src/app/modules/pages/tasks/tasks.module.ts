import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeES from '@angular/common/locales/es-GT';

import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewTaskModalComponent } from './components/new-task-modal/new-task-modal.component';
import { EditTaskModalComponent } from './components/edit-task-modal/edit-task-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TaskDetailModalComponent } from './components/task-detail-modal/task-detail-modal.component';

registerLocaleData(localeES, 'es-GT');

@NgModule({
    declarations: [
        TasksComponent,
        NewTaskModalComponent,
        EditTaskModalComponent,
        TaskDetailModalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TasksRoutingModule,
        SharedModule
    ],
    providers: [
        {
            provide: LOCALE_ID,
            useValue: 'es-GT'
        }
    ]
})
export class TasksModule { }
