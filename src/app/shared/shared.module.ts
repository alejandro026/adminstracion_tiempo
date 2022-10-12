import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { MaxLengthPipe } from './pipes/max-length.pipe';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';

@NgModule({
    declarations: [
        ConfirmModalComponent,
        MaxLengthPipe,
        NotFoundPageComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        ConfirmModalComponent,
        MaxLengthPipe
    ]
})
export class SharedModule { }
