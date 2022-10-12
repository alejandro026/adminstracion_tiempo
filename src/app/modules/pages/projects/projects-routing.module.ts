import { NgModule } from '@angular/core';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { ProjectDetailGuard } from 'src/app/core/guards/project-detail.guard';
import { NewProjectComponent } from './new-project/new-project.component';
import { ProjectDetailMemberComponent } from './project-detail-member/project-detail-member.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectsComponent } from './projects.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth', 'login']);

const routes: Routes = [
    {
        path: '',
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
        component: ProjectsComponent
    },
    {
        path: 'new-project',
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
        component: NewProjectComponent
    },
    {
        path: 'o/:project_id',
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard, ProjectDetailGuard],
        component: ProjectDetailComponent
    },
    {
        path: 'c/:project_id',
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
        component: ProjectDetailMemberComponent
    },
    {
        path: '**',
        redirectTo: 'not-found'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectsRoutingModule { }
