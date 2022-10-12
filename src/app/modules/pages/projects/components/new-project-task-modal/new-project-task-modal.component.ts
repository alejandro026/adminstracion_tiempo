import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { TaskPriorityValues } from 'src/app/core/enums';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { ProjectTask } from 'src/app/core/interfaces/project-task.interface';
import { SelectOption } from 'src/app/core/interfaces/select-option.interface';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { UserInfo } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';
import { hiddeModalAnimation } from 'src/app/core/animations/hidde-modal.animation';
import { FormValidators } from 'src/app/core/form-validators';

@Component({
    selector: 'app-new-project-task-modal',
    templateUrl: './new-project-task-modal.component.html',
    styleUrls: ['./new-project-task-modal.component.scss'],
    animations: [
        hiddeModalAnimation
    ]
})
export class NewProjectTaskModalComponent implements OnInit {

    @HostBinding('class') containerClass = 'modal modal-bottom sm:modal-middle';
    @HostBinding('@hiddeModal') hiddeAnimationModal = '';
    @Output() closeModal = new EventEmitter<ModalCloseValue<ProjectTask>>();
    @Input() membersProject: string[] = [];

    projectTaskForm: FormGroup;
    nameFormControl: FormControl;
    descriptionFormControl: FormControl;
    priorityFormControl: FormControl;
    ownerFormControl: FormControl;

    currentUser?: UserInfo;

    priorityOptions: SelectOption[] = [
        { value: TaskPriorityValues.HIGH, text: 'Alta' },
        { value: TaskPriorityValues.MEDIUM, text: 'Media' },
        { value: TaskPriorityValues.LOW, text: 'Baja' },
        { value: TaskPriorityValues.NO_PRIORITY, text: 'Sin prioridad' }
    ];

    constructor(
        private projectService: ProjectsService,
        private authService: AuthService
    ) {
        this.nameFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.descriptionFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.priorityFormControl = new FormControl(TaskPriorityValues.NO_PRIORITY, [Validators.required]);
        this.ownerFormControl = new FormControl(null);
        this.projectTaskForm = new FormGroup({
            name: this.nameFormControl,
            description: this.descriptionFormControl,
            priority: this.priorityFormControl,
            owner: this.ownerFormControl
        });

        this.authService.currentUser.pipe(take(1)).subscribe({
            next: user => {
                if (user) this.currentUser = user;
            }
        });
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.containerClass += ' modal-open';
        }, 50);

        if (this.membersProject.length > 0) {
            this.ownerFormControl.setValue(this.membersProject[0]);
        }
    }

    @HostListener('click', ['$event'])
    onClickComponent(event: any) {
        if (event.target.classList.contains('modal')) {
            this.closeModal.emit({ action: 'cancel' });
        }
    }

    saveProjectTask() {
        if (this.projectTaskForm.invalid || !this.currentUser) return;

        const newProjectTask: ProjectTask = {
            name: this.nameFormControl.value,
            description: this.descriptionFormControl.value,
            priority: this.priorityFormControl.value,
            owner: this.ownerFormControl.value,
            completation_date: null,
            completed: false,
            creation_date: Timestamp.now(),
            modification_date: Timestamp.now(),
            project_id: ''
        };

        this.closeModal.emit({ action: 'ok', value: newProjectTask });
    }

    close() {
        this.closeModal.emit({ action: 'cancel' });
    }

}
