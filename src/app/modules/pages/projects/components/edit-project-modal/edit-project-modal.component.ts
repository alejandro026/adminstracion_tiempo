import { Component, HostBinding, OnInit, EventEmitter, Output, Input, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { hiddeModalAnimation } from 'src/app/core/animations/hidde-modal.animation';
import { FormValidators } from 'src/app/core/form-validators';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { Project } from 'src/app/core/interfaces/project.interface';

@Component({
    selector: 'app-edit-project-modal',
    templateUrl: './edit-project-modal.component.html',
    styleUrls: ['./edit-project-modal.component.scss'],
    animations: [
        hiddeModalAnimation
    ]
})
export class EditProjectModalComponent implements OnInit {

    @HostBinding('class') componentClass = 'modal modal-bottom sm:modal-middle';
    @HostBinding('@hiddeModal') hideModalAnimation = '';
    @Output() closeModal = new EventEmitter<ModalCloseValue<Partial<Project>>>();
    @Input() project?: Project;

    nameFormControl: FormControl;
    descriptionFormControl: FormControl;
    completedFormControl: FormControl;
    projectForm: FormGroup;

    constructor() {
        this.nameFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.descriptionFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.completedFormControl = new FormControl(false, [Validators.required]);
        this.projectForm = new FormGroup({
            name: this.nameFormControl,
            description: this.descriptionFormControl,
            completed: this.completedFormControl
        });
    }

    ngOnInit() {
        if (this.project) {
            this.projectForm.setValue({
                name: this.project.name,
                description: this.project.description,
                completed: this.project.completed
            });
        }

        setTimeout(() => {
            this.componentClass += ' modal-open';
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

    saveProject() {
        if (this.projectForm.invalid) return;
        const editedProject: Partial<Project> = {
            name: this.nameFormControl.value,
            description: this.descriptionFormControl.value,
            completed: this.completedFormControl.value,
            modification_date: Timestamp.now()
        };

        this.closeModal.emit({ action: 'ok', value: editedProject });
    }

}
