import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundPageComponent } from './shared/components/not-found-page/not-found-page.component';

const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'app',
        loadChildren: () => import('./modules/pages/pages.module').then(m => m.PagesModule)
    },
    {
        path: 'not-found',
        component: NotFoundPageComponent
    },
    {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'not-found'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
