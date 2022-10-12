import { Injectable, ViewContainerRef } from '@angular/core';
import { AlertComponent } from 'src/app/shared/components/alert/alert.component';

@Injectable({
    providedIn: 'root'
})
export class AlertControllerService {

    constructor() { }

    showAlert(
        containerRef: ViewContainerRef,
        message: string,
        type?: 'success' | 'warning' | 'error',
        duration: number = 1000,
        horizontal: 'left' | 'center' | 'right' = 'right',
        vertical: 'top' | 'bottom' = 'top'
    ) {
        const alert = containerRef.createComponent(AlertComponent);
        alert.instance.message = message;
        alert.instance.type = type;

        alert.location.nativeElement.querySelector('.alert').classList.add(`${vertical}-4`);
        if (vertical === 'top') {
            alert.location.nativeElement.querySelector('.alert').style.top = '16px';
        }

        if (vertical === 'bottom') {
            alert.location.nativeElement.querySelector('.alert').style.bottom = '16px';
        }

        if (horizontal === 'left') {
            alert.location.nativeElement.querySelector('.alert').style.left = '16px';
        }

        if (horizontal === 'right') {
            alert.location.nativeElement.querySelector('.alert').style.right = '16px';
        }

        if (horizontal === 'center') {
            alert.location.nativeElement.querySelector('.alert').style.left = '50%';
            alert.location.nativeElement.querySelector('.alert').style.transform = 'translateX(-50%)';
        }

        document.body.insertAdjacentElement('beforeend', alert.location.nativeElement);

        setTimeout(() => {
            alert.location.nativeElement.querySelector('.alert').style.transition = 'opacity 0.1s ease-in-out, transform 0.1s ease-in-out';
            alert.location.nativeElement.querySelector('.alert').style['z-index'] = '100';
            alert.location.nativeElement.querySelector('.alert').style.opacity = '0';
            alert.location.nativeElement.querySelector('.alert').style.transform += ' scale(0.9)';
            setTimeout(() => {
                alert.destroy();
            }, 400);
        }, duration);
    }


}
