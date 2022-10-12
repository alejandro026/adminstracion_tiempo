import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-not-found-page',
    templateUrl: './not-found-page.component.html',
    styleUrls: ['./not-found-page.component.scss']
})
export class NotFoundPageComponent {

    constructor(private router: Router) {
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

    backTo() {
        this.router.navigate(['app', 'tasks']);
    }
}
