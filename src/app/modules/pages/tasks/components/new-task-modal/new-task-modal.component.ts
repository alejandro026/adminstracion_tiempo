import { Component, EventEmitter, HostBinding, HostListener, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserInfo } from '@angular/fire/auth';
import { TaskPriorityValues } from 'src/app/core/enums';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { SelectOption } from 'src/app/core/interfaces/select-option.interface';
import { Task } from 'src/app/core/interfaces/task.interface';
import { AuthService } from 'src/app/core/services/auth.service';
import { Timestamp } from 'firebase/firestore';
import { take } from 'rxjs';
import { hiddeModalAnimation } from 'src/app/core/animations/hidde-modal.animation';
import { FormValidators } from 'src/app/core/form-validators';

@Component({
    selector: 'app-new-task-modal',
    templateUrl: './new-task-modal.component.html',
    styleUrls: ['./new-task-modal.component.scss'],
    animations: [
        hiddeModalAnimation
    ]
})
export class NewTaskModalComponent implements OnInit {

    @HostBinding('class') modalClass = 'modal modal-bottom sm:modal-middle';
    @HostBinding('id') componentId = 'new-task-modal';
    @HostBinding('@hiddeModal') animationModal = '';
    @Output() closeModal = new EventEmitter<ModalCloseValue<Task>>();

    priorityOptions: SelectOption[] = [
        { value: TaskPriorityValues.HIGH, text: 'Alta' },
        { value: TaskPriorityValues.MEDIUM, text: 'Media' },
        { value: TaskPriorityValues.LOW, text: 'Baja' },
        { value: TaskPriorityValues.NO_PRIORITY, text: 'Sin prioridad' }
    ];

    formNewTask: FormGroup;
    nameFormControl: FormControl;
    descriptionFormControl: FormControl;
    priorityFormControl: FormControl;
    currentUser?: UserInfo;

    constructor(private authService: AuthService) {
        this.nameFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.descriptionFormControl = new FormControl('');
        this.priorityFormControl = new FormControl(TaskPriorityValues.NO_PRIORITY, [Validators.required]);

        this.formNewTask = new FormGroup({
            name: this.nameFormControl,
            description: this.descriptionFormControl,
            priority: this.priorityFormControl
        });

        this.authService.currentUser.pipe(take(1)).subscribe({
            next: user => {
                if (user) this.currentUser = user;
            }
        });
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.modalClass = this.modalClass + ' modal-open';
        }, 50);
    }

    close() {
        this.closeModal.emit({ action: 'cancel' });
    }

    @HostListener('click', ['$event'])
    onClickComponent(event: any) {
        if (event.target.classList.contains('modal')) {
            this.closeModal.emit({ action: 'cancel' });
        }
    }

    saveTask() {
        if (this.formNewTask.invalid || !this.currentUser) return;

        const newTask: Task = {
            name: this.nameFormControl.value,
            description: this.descriptionFormControl.value,
            priority: this.priorityFormControl.value,
            completed: false,
            creation_date: Timestamp.fromDate(new Date()),
            modification_date: Timestamp.fromDate(new Date()),
            user_id: this.currentUser.uid
        };

        this.closeModal.emit({
            action: 'ok',
            value: newTask
        });
    }

}
