import { trigger, transition, style, animate } from '@angular/animations';

export const showAlertAnimation = trigger('showAlert', [
    transition(':enter', [
        style({
            opacity: '0',
            transform: 'scale(0.9)'
        }),
        animate('0.1s', style({
            opacity: '1',
            transform: 'scale(1.1)'
        })),
        animate('0.1s', style({
            transform: 'scale(1)'
        }))
    ])
]);
