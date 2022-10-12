import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of, take } from 'rxjs';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { ProjectTask } from 'src/app/core/interfaces/project-task.interface';
import { Project } from 'src/app/core/interfaces/project.interface';
import { AlertControllerService } from 'src/app/core/services/alert-controller.service';
import { ProjectTasksService } from 'src/app/core/services/project-tasks.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
    selector: 'app-project-detail',
    templateUrl: './project-detail.component.html',
    styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {

    projectId?: string;
    loading: boolean;
    project?: Project;
    projectTasks: ProjectTask[];
    projectTasksList: { task: ProjectTask, selected: boolean }[];
    membersList: { member: string, selected: boolean }[];

    showEditProjectModal: boolean;

    constructor(
        private activateRoute: ActivatedRoute,
        private projectService: ProjectsService,
        private projectTasksService: ProjectTasksService,
        private alertController: AlertControllerService,
        private containerRef: ViewContainerRef
    ) {
        this.activateRoute.params.pipe(take(1)).subscribe({
            next: (params) => {
                this.projectId = params['project_id'];
            }
        });
        this.loading = true;
        this.projectTasks = [];
        this.projectTasksList = [];
        this.membersList = [];

        this.showEditProjectModal = false;
    }

    ngOnInit() {
        if (this.projectId) {
            this.getData(this.projectId);
        }
    }

    getData(projectId: string) {
        this.loading = true;
        forkJoin({
            project: this.getProject$(projectId).pipe(
                catchError(err => of(new Error(err.message)))
            ),
            projectTasks: this.getTasksProject$(projectId).pipe(
                catchError(err => of(new Error(err.message)))
            )
        }).subscribe({
            next: projectData => {
                if (projectData.project instanceof Error) {
                    const err = projectData.project;
                    this.alertController.showAlert(this.containerRef, err.message ? err.message : 'Problema al cargar el proyecto', 'error', 3000);
                    this.loading = false;
                } else if (projectData.projectTasks instanceof Error) {
                    const err = projectData.projectTasks;
                    this.alertController.showAlert(this.containerRef, err.message ? err.message : 'Problema al cargar las tareas', 'error', 3000);
                    this.loading = false;
                } else {
                    this.project = projectData.project;
                    this.membersList = projectData.project.members.map(m => ({ member: m, selected: false }));
                    this.projectTasks = projectData.projectTasks;
                    this.projectTasksList = projectData.projectTasks.map((t: any) => ({ task: t, selected: false }));
                    this.loading = false;
                }
            }
        });
    }

    getProject$(projectId: string) {
        return this.projectService.getProject(projectId)
            .pipe(take(1));
    }

    getTasksProject$(projectId: string) {
        return this.projectTasksService.getProjectTasks(projectId)
            .pipe(take(1));
    }

    openEditProjectModal() {
        this.showEditProjectModal = true;
    }

    onCloseEditProjectModal(modalValue: ModalCloseValue<Partial<Project>>) {
        this.showEditProjectModal = false;
        if (modalValue.action === 'cancel' || !modalValue.value || !this.project || !this.project.id) return;

        const result = this.projectService.updateProject(modalValue.value, this.project.id);

        if (result instanceof Error) {
            this.alertController.showAlert(this.containerRef, result.message, 'error', 3000);
            return;
        }

        this.alertController.showAlert(this.containerRef, 'Cambios guardados con exito', 'success', 2000);
        this.project.name = modalValue.value.name ?? this.project.name;
        this.project.description = modalValue.value.description ?? this.project.description;
        this.project.completed = modalValue.value.completed ?? this.project.completed;
    }
}
