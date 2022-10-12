import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { forkJoin, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { TaskPriorityValues } from 'src/app/core/enums';
import { ProjectTask } from 'src/app/core/interfaces/project-task.interface';
import { Project } from 'src/app/core/interfaces/project.interface';
import { AlertControllerService } from 'src/app/core/services/alert-controller.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProjectTasksService } from 'src/app/core/services/project-tasks.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
    selector: 'app-project-detail-member',
    templateUrl: './project-detail-member.component.html',
    styleUrls: ['./project-detail-member.component.scss']
})
export class ProjectDetailMemberComponent implements OnInit {

    projectId?: string;
    loading: boolean;
    project?: Project;
    projectTasks: ProjectTask[];
    projectTasksList: { task: ProjectTask, selected: boolean }[];
    membersList: { member: string, selected: boolean }[];

    constructor(
        private activateRoute: ActivatedRoute,
        private projectService: ProjectsService,
        private projectTasksService: ProjectTasksService,
        private authService: AuthService,
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


    getPriorityText(priorityValue: number) {
        if (priorityValue === TaskPriorityValues.HIGH) return 'Alta';
        if (priorityValue === TaskPriorityValues.MEDIUM) return 'Media';
        if (priorityValue === TaskPriorityValues.LOW) return 'Baja';

        return 'Sin prioridad';
    }

    getPriorityBageColor(priorityValue: number) {
        if (priorityValue === TaskPriorityValues.HIGH) return 'badge-error';
        if (priorityValue === TaskPriorityValues.MEDIUM) return 'badge-warning';
        if (priorityValue === TaskPriorityValues.LOW) return 'badge-success';

        return '';
    }

    get user() {
        return this.authService.currentUser;
    }

    async completeProjectTask(projectTask: ProjectTask, completed: boolean, btnRef: any) {
        if (!this.project?.id) return;
        const taskUpdated: Partial<ProjectTask> = {
            id: projectTask.id,
            completed,
            completation_date: completed ? Timestamp.now() : null
        };
        btnRef.disabled = true;
        const result = await this.projectTasksService.updateProjectTask(taskUpdated, this.project?.id);
        if (result instanceof Error) {
            this.alertController.showAlert(this.containerRef, result.message, 'error', 3000);
            return;
        }
        btnRef.disabled = false;
        projectTask.completed = completed;
        projectTask.creation_date = Timestamp.now();
    }

}
