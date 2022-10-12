import { Component, HostBinding, OnInit, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { hiddeModalAnimation } from 'src/app/core/animations/hidde-modal.animation';
import { TaskPriorityValues } from 'src/app/core/enums';
import { FormValidators } from 'src/app/core/form-validators';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { ProjectTask } from 'src/app/core/interfaces/project-task.interface';
import { SelectOption } from 'src/app/core/interfaces/select-option.interface';

@Component({
    selector: 'app-edit-project-task-modal',
    templateUrl: './edit-project-task-modal.component.html',
    styleUrls: ['./edit-project-task-modal.component.scss'],
    animations: [
        hiddeModalAnimation
    ]
})
export class EditProjectTaskModalComponent implements OnInit {

    @HostBinding('class') containerClass = 'modal modal-bottom sm:modal-middle';
    @HostBinding('@hiddeModal') hiddeAnimationModal = '';
    @Output() closeModal = new EventEmitter<ModalCloseValue<Partial<ProjectTask>>>();
    @Input() projectTask?: ProjectTask;
    @Input() members: string[] = [];

    projectTaskForm: FormGroup;
    nameFormControl: FormControl;
    descriptionFormControl: FormControl;
    priorityFormControl: FormControl;
    ownerFormControl: FormControl;
    completedFormControl: FormControl;

    priorityOptions: SelectOption[] = [
        { value: TaskPriorityValues.HIGH, text: 'Alta' },
        { value: TaskPriorityValues.MEDIUM, text: 'Media' },
        { value: TaskPriorityValues.LOW, text: 'Baja' },
        { value: TaskPriorityValues.NO_PRIORITY, text: 'Sin prioridad' }
    ];

    constructor() {
        this.nameFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.descriptionFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.priorityFormControl = new FormControl(TaskPriorityValues.NO_PRIORITY, [Validators.required]);
        this.ownerFormControl = new FormControl(null);
        this.completedFormControl = new FormControl(false);
        this.projectTaskForm = new FormGroup({
            name: this.nameFormControl,
            description: this.descriptionFormControl,
            priority: this.priorityFormControl,
            owner: this.ownerFormControl,
            completed: this.completedFormControl
        });
    }

    ngOnInit() {
        if (this.projectTask) {
            this.projectTaskForm.setValue({
                name: this.projectTask.name,
                description: this.projectTask.description,
                priority: this.projectTask.priority,
                owner: this.projectTask.owner,
                completed: this.projectTask.completed
            });
        }

        setTimeout(() => {
            this.containerClass += ' modal-open';
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

    saveProjectTask() {
        if (this.projectTaskForm.invalid) return;

        this.closeModal.emit({
            action: 'ok',
            value: {
                id: this.projectTask?.id,
                name: this.nameFormControl.value,
                description: this.descriptionFormControl.value,
                priority: this.priorityFormControl.value,
                owner: this.ownerFormControl.value,
                completed: this.completedFormControl.value,
                modification_date: Timestamp.now(),
                completation_date: this.completedFormControl.value ? Timestamp.now() : null
            }
        });
    }

}
