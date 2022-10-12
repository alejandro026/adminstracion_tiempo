import { trigger, transition, style, animate } from '@angular/animations';

export const hiddeModalAnimation = trigger('hiddeModal', [
    transition(':leave', [
        style({
            opacity: '1',
            visibility: 'visible'
        }),
        animate('0.15s', style({
            opacity: '0',
            visibility: 'hidden'
        }))
    ])
]);
