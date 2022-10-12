import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from './shared/components/alert/alert.component';

@NgModule({
    declarations: [
        AppComponent,
        AlertComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebase)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
