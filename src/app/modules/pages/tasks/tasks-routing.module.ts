import { NgModule } from '@angular/core';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { TasksComponent } from './tasks.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth', 'login']);

const routes: Routes = [
    {
        path: '',
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        canActivate: [AngularFireAuthGuard],
        component: TasksComponent
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
export class TasksRoutingModule { }
