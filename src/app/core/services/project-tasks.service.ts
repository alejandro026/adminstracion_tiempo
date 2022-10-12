import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { ProjectTask } from '../interfaces/project-task.interface';

@Injectable({
    providedIn: 'root'
})
export class ProjectTasksService {

    constructor(private firestore: AngularFirestore) { }

    getProjectTasks(projectId: string) {
        return this.firestore.collection<ProjectTask>(
            `projects/${projectId}/project_tasks`,
            ref => ref.orderBy('creation_date', 'desc')
        ).get().pipe(
            map(snap => {
                const projectTasks: ProjectTask[] = snap.docs.map(doc => {
                    return {
                        ...doc.data() as any,
                        id: doc.id
                    };
                });
                return projectTasks;
            })
        );
    }

    async saveNewProjectTask(projectTask: ProjectTask, projectId: string) {
        try {
            const result = await this.firestore.collection<ProjectTask>(`projects/${projectId}/project_tasks`).add(projectTask);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return error;
            }
            return new Error('Problema al guardar la tarea');
        }
    }

    async deleteProjectTasks(projectTaskIds: string[], projectId: string) {
        try {
            return await this.firestore.firestore.runTransaction(async trans => {
                try {
                    for (const taskId of projectTaskIds) {
                        trans.delete(this.firestore.doc<ProjectTask>(`projects/${projectId}/project_tasks/${taskId}`).ref);
                    }
                    return projectId;
                } catch (error) {
                    if (error instanceof Error) {
                        return error;
                    }
                    return new Error('Problema al eliminar tareas');
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                return error;
            }
            return new Error('Problema al eliminar tareas');
        }
    }

    async updateProjectTask(projectTask: Partial<ProjectTask>, projectId: string) {
        try {
            if (!projectTask.id) {
                throw new Error('La tarea no existe');
            }

            await this.firestore.doc(`projects/${projectId}/project_tasks/${projectTask.id}`).update(projectTask);
            return projectTask.id;
        } catch (error) {
            if (error instanceof Error) return error;
            return new Error('Problema al guardar cambios');
        }
    }

}
