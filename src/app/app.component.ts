import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor() {
        const storageTheme = localStorage.getItem('theme');
        const html = document.querySelector('html');
        if (storageTheme && (storageTheme === 'light' || storageTheme === 'dark')) {
            if (html) {
                html.dataset['theme'] = storageTheme;
            }
        } else {
            if (html) {
                html.dataset['theme'] = 'light';
            }
            localStorage.setItem('theme', 'light');
        }
    }
}
