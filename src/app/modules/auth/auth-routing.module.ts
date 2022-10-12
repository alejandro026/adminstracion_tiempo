import { NgModule } from '@angular/core';
import { AngularFireAuthGuard, redirectLoggedInTo } from '@angular/fire/compat/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const redirectLoggedInToTasks = () => redirectLoggedInTo(['app', 'tasks']);

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [AngularFireAuthGuard],
        data: { authGuardPipe: redirectLoggedInToTasks }
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [AngularFireAuthGuard],
        data: { authGuardPipe: redirectLoggedInToTasks }
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [AngularFireAuthGuard],
        data: { authGuardPipe: redirectLoggedInToTasks }
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
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
export class AuthRoutingModule { }
