import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { NavbarComponent } from './layout/navbar/navbar.component';


@NgModule({
    declarations: [
        PagesComponent,
        NavbarComponent
    ],
    imports: [
        CommonModule,
        PagesRoutingModule
    ]
})
export class PagesModule { }
