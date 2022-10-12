import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeES from '@angular/common/locales/es-GT';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewProjectComponent } from './new-project/new-project.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { NewMemberModalComponent } from './components/new-member-modal/new-member-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EditMemberModalComponent } from './components/edit-member-modal/edit-member-modal.component';
import { NewProjectTaskModalComponent } from './components/new-project-task-modal/new-project-task-modal.component';
import { EditProjectTaskModalComponent } from './components/edit-project-task-modal/edit-project-task-modal.component';
import { ProjectDetailMemberComponent } from './project-detail-member/project-detail-member.component';
import { EditProjectModalComponent } from './components/edit-project-modal/edit-project-modal.component';
import { ProjectMembersListComponent } from './components/project-members-list/project-members-list.component';
import { ProjectTasksListComponent } from './components/project-tasks-list/project-tasks-list.component';

registerLocaleData(localeES, 'es-GT');

@NgModule({
    declarations: [
        ProjectsComponent,
        NewProjectComponent,
        ProjectDetailComponent,
        NewMemberModalComponent,
        EditMemberModalComponent,
        NewProjectTaskModalComponent,
        EditProjectTaskModalComponent,
        ProjectDetailMemberComponent,
        EditProjectModalComponent,
        ProjectMembersListComponent,
        ProjectTasksListComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ProjectsRoutingModule,
        SharedModule
    ],
    providers: [
        {
            provide: LOCALE_ID,
            useValue: 'es-GT'
        }
    ]
})
export class ProjectsModule { }
