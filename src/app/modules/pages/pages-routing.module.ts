import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth', 'login']);

const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        canActivate: [AngularFireAuthGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        children: [
            {
                path: 'tasks',
                loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule)
            },
            {
                path: 'projects',
                loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule)
            },
            {
                path: '**',
                redirectTo: 'not-found'
            }
        ]
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
export class PagesRoutingModule { }
