import { AfterViewInit, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { hiddeModalAnimation } from 'src/app/core/animations/hidde-modal.animation';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss'],
    animations: [
        hiddeModalAnimation
    ]
})
export class ConfirmModalComponent implements AfterViewInit {

    @HostBinding('class') modalClass = 'modal modal-bottom sm:modal-middle';
    @HostBinding('@hiddeModal') animationHiddeModal = '';
    @Input() message: string = 'Esta seguro?';
    @Output() closeModal = new EventEmitter<ModalCloseValue<any>>();

    constructor() { }

    ngAfterViewInit() {
        setTimeout(() => {
            this.modalClass += ' modal-open';
        }, 200);
    }

    cancel() {
        this.closeModal.emit({ action: 'cancel' });
    }

    confirm() {
        this.closeModal.emit({ action: 'ok' });
    }

}
