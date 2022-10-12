import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { hiddeModalAnimation } from 'src/app/core/animations/hidde-modal.animation';
import { Task } from 'src/app/core/interfaces/task.interface';

@Component({
    selector: 'app-task-detail-modal',
    templateUrl: './task-detail-modal.component.html',
    styleUrls: ['./task-detail-modal.component.scss'],
    animations: [
        hiddeModalAnimation
    ]
})
export class TaskDetailModalComponent implements OnInit {

    @HostBinding('class') componentClass = 'modal modal-bottom sm:modal-middle';
    @HostBinding('@hiddeModal') hiddeAnimationComponent = '';
    @Output() closeModal = new EventEmitter();
    @Input() task?: Task;

    constructor() { }

    ngOnInit() {
        setTimeout(() => {
            this.componentClass += ' modal-open';
        }, 50);
    }

    close() {
        this.closeModal.emit();
    }

    @HostListener('click', ['$event'])
    onClickComponent(event: any) {
        if (event.target.classList.contains('modal')) {
            this.closeModal.emit();
        }
    }

}
