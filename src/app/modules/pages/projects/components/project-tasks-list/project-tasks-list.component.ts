import { Component, HostBinding, Input, ViewContainerRef } from '@angular/core';
import { TaskPriorityValues } from 'src/app/core/enums';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { ProjectTask } from 'src/app/core/interfaces/project-task.interface';
import { Project } from 'src/app/core/interfaces/project.interface';
import { AlertControllerService } from 'src/app/core/services/alert-controller.service';
import { ProjectTasksService } from 'src/app/core/services/project-tasks.service';

@Component({
    selector: 'app-project-tasks-list',
    templateUrl: './project-tasks-list.component.html',
    styleUrls: ['./project-tasks-list.component.scss']
})
export class ProjectTasksListComponent {

    @HostBinding('class') componentClass = 'flex flex-col pt-10 pb-8 px-6 xs:px-16';
    @Input() projectTasksList: { task: ProjectTask, selected: boolean }[] = [];
    @Input() project?: Project;
    @Input() projectTasks: ProjectTask[] = [];

    taskActionButtonsState = {
        disabledEdit: true,
        disabledDelete: true,
        disabledNew: false
    };

    showNewProjectTaskModal: boolean;
    showEditProjectTaskModal: boolean;
    projectTaskSelectedToEdit?: ProjectTask;
    showConfirmModalDeleteProjectTasks: boolean;
    confirmModalMessage: string;

    generalTasksCheckValue: boolean;

    constructor(
        private projectTasksService: ProjectTasksService,
        private alertController: AlertControllerService,
        private containerRef: ViewContainerRef
    ) {
        this.showNewProjectTaskModal = false;
        this.showEditProjectTaskModal = false;
        this.showConfirmModalDeleteProjectTasks = false;
        this.confirmModalMessage = '';

        this.generalTasksCheckValue = false;
    }

    onGeneralTasksCheckChange(enabled: boolean) {
        this.taskActionButtonsState = {
            disabledEdit: !enabled || (enabled && this.projectTasksList.length > 1) || (enabled && this.projectTasksList.length === 0),
            disabledDelete: !enabled || (enabled && this.projectTasksList.length === 0),
            disabledNew: false
        };

        this.projectTasksList.forEach(item => {
            item.selected = enabled;
        });
    }

    onProjectTasksCheckChange() {
        const selectedProjectTasks = this.projectTasksList.filter(t => t.selected).length;
        this.taskActionButtonsState = {
            disabledEdit: selectedProjectTasks > 1 || selectedProjectTasks === 0,
            disabledDelete: selectedProjectTasks === 0,
            disabledNew: false
        };
        this.generalTasksCheckValue = selectedProjectTasks === this.projectTasksList.length;
    }

    openNewProjectTaskModal() {
        this.showNewProjectTaskModal = true;
    }

    async onCloseNewProjectTaskModal(modalValue: ModalCloseValue<ProjectTask>) {
        this.showNewProjectTaskModal = false;
        if (modalValue.action !== 'ok' || !modalValue.value || !this.project || !this.project.id) return;
        modalValue.value.project_id = this.project.id;
        const result = await this.projectTasksService.saveNewProjectTask(modalValue.value, this.project.id);

        if (result instanceof Error) {
            this.alertController.showAlert(this.containerRef, result.message, 'error', 3000);
            return;
        }

        this.alertController.showAlert(this.containerRef, 'Tarea guardad exitosamente', 'success', 2000);
        modalValue.value.id = result.id;
        this.projectTasks.unshift(modalValue.value);
        this.projectTasksList.unshift({ selected: false, task: modalValue.value });
    }

    deleteProjectTasks() {
        this.showConfirmModalDeleteProjectTasks = true;
        this.confirmModalMessage = 'Se eliminaran las tareas seleccionadas, desea continuar?';
    }

    async onCloseDeleteProjectTasksConfirmModal(modalValue: ModalCloseValue<any>) {
        this.showConfirmModalDeleteProjectTasks = false;
        const projectTasksSelected = this.projectTasksList.filter(item => item.selected);
        if (modalValue.action !== 'ok' || projectTasksSelected.length === 0 || !this.project || !this.project.id) return;

        const projectTaskIds: string[] = [];
        for (const item of projectTasksSelected) {
            if (item.task.id) projectTaskIds.push(item.task.id);
        }
        const result = await this.projectTasksService.deleteProjectTasks(projectTaskIds, this.project.id);

        if (result instanceof Error) {
            this.alertController.showAlert(this.containerRef, result.message, 'error', 3000); return;
        }

        this.alertController.showAlert(this.containerRef, 'Tareas eliminadas con exito', 'success', 2000);
        this.taskActionButtonsState = {
            disabledEdit: true,
            disabledDelete: true,
            disabledNew: false
        };
        this.generalTasksCheckValue = false;
        const newProjectTasksList = this.projectTasksList.filter(item => !item.selected);
        this.projectTasksList.length = 0;
        this.projectTasksList = newProjectTasksList;
        this.projectTasks.length = 0;
        this.projectTasks = newProjectTasksList.map(item => item.task);
    }

    openEditProjectTaskModal() {
        const projectTasksSelected = this.projectTasksList.filter(item => item.selected);
        if (projectTasksSelected.length !== 1) return;
        this.showEditProjectTaskModal = true;
        this.projectTaskSelectedToEdit = projectTasksSelected[0].task;
    }

    async onCloseEditProjectTaskModal(modalValue: ModalCloseValue<Partial<ProjectTask>>) {
        this.showEditProjectTaskModal = false;
        const projectTasksSelected = this.projectTasksList.filter(item => item.selected);
        if (modalValue.action !== 'ok' || !modalValue.value || projectTasksSelected.length !== 1 || !this.project || !this.project.id) return;

        const result = await this.projectTasksService.updateProjectTask(modalValue.value, this.project.id);
        if (result instanceof Error) {
            this.alertController.showAlert(this.containerRef, result.message, 'error', 3000);
            return;
        }

        this.alertController.showAlert(this.containerRef, 'Cambios guardados con exito', 'success', 2000);
        for (const item of this.projectTasksList) {
            if (item.selected) {
                item.task = {
                    ...item.task,
                    ...modalValue.value
                };
                break;
            }
        }
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

}
