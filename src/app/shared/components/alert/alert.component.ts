import { Component } from '@angular/core';
import { showAlertAnimation } from 'src/app/core/animations/show-alert.animation';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
    animations: [
        showAlertAnimation
    ]
})
export class AlertComponent {

    message: string;
    type?: 'success' | 'warning' | 'error';
    horizontal?: 'left' | 'center' | 'right' = 'right';
    vertical?: 'top' | 'bottom' = 'top';

    constructor() {
        this.message = '';
    }

}
