import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
    providedIn: 'root'
})
export class ProjectMembersService {

    constructor(private firestore: AngularFirestore) { }

    async deleteMembers(newMembers: string[], deletedMembers: string[], projectId: string) {
        try {
            const snapshotProjectTasks = await this.firestore.firestore.collection(`projects/${projectId}/project_tasks`).get();
            const projectRef = this.firestore.firestore.doc(`projects/${projectId}`);

            if (snapshotProjectTasks.empty) {
                await projectRef.update({ members: newMembers });
                return projectId;
            };

            return await this.firestore.firestore.runTransaction(async trans => {
                const doc = await trans.get(projectRef);
                if (!doc.exists) {
                    return Promise.reject(new Error('El proyecto no existe'));
                }
                trans.update(projectRef, { members: newMembers });
                snapshotProjectTasks.forEach(doc => {
                    if (deletedMembers.includes(doc.data()['owner'])) trans.update(doc.ref, { owner: null });
                });
                return projectId;
            });
        } catch (error) {
            if (error instanceof Error) {
                return new Error(error.message);
            }

            return new Error('Problema al eliminar miembro(s)');
        }
    }

    async editMember(newMembers: string[], newMemberValue: string, oldMemberValue: string, projectId: string) {
        try {
            const snapshotProjectTasks = await this.firestore.firestore.collection(`projects/${projectId}/project_tasks`).get();
            const projectRef = this.firestore.firestore.doc(`projects/${projectId}`);

            if (snapshotProjectTasks.empty) {
                await projectRef.update({ members: newMembers });
                return projectId;
            }

            return await this.firestore.firestore.runTransaction(async trans => {
                const doc = await trans.get(projectRef);
                if (!doc.exists) {
                    return Promise.reject(new Error('El proyecto no existe'));
                }
                trans.update(projectRef, { members: newMembers });
                snapshotProjectTasks.forEach(doc => {
                    if (doc.data()['owner'] === oldMemberValue) trans.update(doc.ref, { owner: newMemberValue });
                });
                return projectId;
            });
        } catch (error) {
            if (error instanceof Error) {
                return new Error(error.message);
            }

            return new Error('Problema al guardar los cambios');
        }
    }

}
