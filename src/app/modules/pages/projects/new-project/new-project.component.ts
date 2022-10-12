import { Component, HostBinding, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { take } from 'rxjs';
import { Project } from 'src/app/core/interfaces/project.interface';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { UserInfo } from '@angular/fire/auth';
import { AlertControllerService } from 'src/app/core/services/alert-controller.service';
import { Router } from '@angular/router';
import { FormValidators } from 'src/app/core/form-validators';

@Component({
    selector: 'app-new-project',
    templateUrl: './new-project.component.html',
    styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent implements OnInit {

    @HostBinding('id') containerId = 'new-project-container';

    newProjectForm: FormGroup;
    nameFormControl: FormControl;
    descriptionFormControl: FormControl;
    membersProjectForm: FormGroup;
    members: string[];
    user?: UserInfo | null;

    constructor(
        private projectsService: ProjectsService,
        private authService: AuthService,
        private alertController: AlertControllerService,
        private router: Router,
        private containerRef: ViewContainerRef
    ) {
        this.nameFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.descriptionFormControl = new FormControl('', [Validators.required, FormValidators.noEmpty]);
        this.newProjectForm = new FormGroup({
            name: this.nameFormControl,
            description: this.descriptionFormControl
        });

        this.members = [];

        this.membersProjectForm = new FormGroup({
            member: new FormControl('', [
                Validators.pattern(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)
            ])
        });
    }

    ngOnInit(): void {
        this.authService.currentUser.pipe(take(1)).subscribe(user => {
            this.user = user;
        });

        this.membersProjectForm.get('member')?.addValidators(FormValidators.noRepeatMember(this.members));
    }

    addMember() {
        let memberValue: string = this.membersProjectForm.get('member')?.value;
        memberValue = memberValue.trim();
        if (this.membersProjectForm.invalid || memberValue.replace(/\s/g, '').length === 0) return;

        this.members.push(memberValue);
        this.membersProjectForm.reset();
    }

    removeMember(index: number) {
        this.members.splice(index, 1);
    }

    async saveProject() {
        if (this.newProjectForm.invalid) {
            this.newProjectForm.get('name')?.markAsDirty();
            return;
        }

        if (!this.user || !this.user.email) {
            this.alertController.showAlert(
                this.containerRef,
                'Problema al obtener usuario',
                'error', 3000
            );
            return;
        }

        const newProject: Project = {
            name: this.nameFormControl.value,
            description: this.descriptionFormControl.value,
            owner: this.user.email,
            completed: false,
            members: this.members,
            user_id: this.user.uid,
            creation_date: Timestamp.now(),
            modification_date: Timestamp.now()
        };

        const result = await this.projectsService.saveProject(newProject);

        if (result instanceof Error) {
            this.alertController.showAlert(
                this.containerRef,
                'Problema al guardar el proyecto, intentalo nuevamente',
                'error', 3000
            );
        } else {
            this.alertController.showAlert(
                this.containerRef,
                'Proyecto guardado con exito',
                'success', 2000
            );
            this.router.navigate(['app', 'projects']);
        }
    }

    cancel() {
        this.router.navigate(['app', 'projects']);
    }
}
