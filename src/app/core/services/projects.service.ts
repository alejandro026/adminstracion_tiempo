import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, Query, QueryDocumentSnapshot, QueryFn } from '@angular/fire/compat/firestore';

import { map, switchMap } from 'rxjs/operators';
import { OrderByDirection, Timestamp } from 'firebase/firestore';
import { ProjectFilterOptionValues, SortOptionsValues } from '../enums';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Project } from '../interfaces/project.interface';

@Injectable({
    providedIn: 'root'
})
export class ProjectsService {

    private firstProjectPage: any;
    private secondProjectPage: any;
    private lastProjectPage: any;

    constructor(private firestore: AngularFirestore, private authService: AuthService) { }

    getProjects(filterValue: number, sortValue: number, limit: number) {
        return this.getFilterQuery(filterValue, sortValue, limit).pipe(
            switchMap(query => {
                return this.firestore.collection<Project>('projects', query).get().pipe(
                    map(snap => {
                        if (snap.docs.length > 0) {
                            this.firstProjectPage = snap.docs[0];
                            this.lastProjectPage = snap.docs[snap.docs.length - 1];
                        }

                        if (snap.docs.length > 1) {
                            this.secondProjectPage = snap.docs[1];
                        }

                        const values: Project[] = snap.docs.map(doc => {
                            return {
                                ...doc.data(),
                                id: doc.id
                            };
                        });

                        return values;
                    })
                );
            })
        );
    }

    getProjectsPage(filterValue: number, sortValue: number, limit: number, directionPage: 'next' | 'prev') {
        return this.getFilterQuery(filterValue, sortValue, limit, directionPage).pipe(
            switchMap(query => {
                return this.firestore.collection<Project>('projects', query).get().pipe(
                    map(snap => {
                        if (snap.docs.length === 0) return undefined;

                        if (snap.docs.length > 0) {
                            this.firstProjectPage = snap.docs[0];
                            this.lastProjectPage = snap.docs[snap.docs.length - 1];
                        }

                        if (snap.docs.length > 1) {
                            this.secondProjectPage = snap.docs[1];
                        }

                        const values: Project[] = snap.docs.map(doc => {
                            return {
                                ...doc.data(),
                                id: doc.id
                            };
                        });

                        return values;
                    })
                );
            })
        );
    }

    getProject(id: string) {
        return this.firestore.doc<Project>(`projects/${id}`).get().pipe(
            map(snap => {
                if (!snap.exists) throw new Error('El proyecto no existe');

                const data = snap.data();
                if (!data) throw new Error('El proyecto no existe');

                const project: Project = {
                    ...data,
                    id: snap.id
                };
                return project;
            })
        );
    }

    async saveProject(project: Project) {
        try {
            const result = await this.firestore.collection<Project>('projects').add(project);
            return result;
        } catch (error) {
            return new Error('Problema al guardar el proyecto');
        }
    }

    async updateProject(project: Partial<Project>, projectId: string) {
        try {
            await this.firestore.doc<Project>(`projects/${projectId}`).update({
                ...project,
                modification_date: Timestamp.now()
            });
            return projectId;
        } catch (error) {
            return new Error('Problema al guardar');
        }
    }

    private getFilterQuery(filterValue: number, sortValue: number, limit: number, paginationDirection?: 'next' | 'prev' | 'curr'): Observable<QueryFn<DocumentData>> {
        return this.authService.currentUser.pipe(
            map(user => {
                if (!user) throw new Error('No se encontro el usuario');

                let sortQueryArgs: { field: string, option: OrderByDirection } = {
                    field: 'creation_date',
                    option: 'desc'
                };

                if (sortValue === SortOptionsValues.OLDEST) {
                    sortQueryArgs = {
                        field: 'creation_date',
                        option: 'asc'
                    };
                }

                if (filterValue === ProjectFilterOptionValues.OWN_COMPLETED) {

                    const query: QueryFn<DocumentData> = (ref) => {
                        const queryRef = ref
                            .where('user_id', '==', user.uid)
                            .where('completed', '==', true)
                            .orderBy(sortQueryArgs.field, sortQueryArgs.option);

                        return this.getPaginationQuery(queryRef, paginationDirection, limit, this.firstProjectPage, this.lastProjectPage);
                    };

                    return query;
                }

                if (filterValue === ProjectFilterOptionValues.OWN_IN_PROGRESS) {

                    const query: QueryFn<DocumentData> = (ref) => {
                        const queryRef = ref
                            .where('user_id', '==', user.uid)
                            .where('completed', '==', false)
                            .orderBy(sortQueryArgs.field, sortQueryArgs.option);

                        return this.getPaginationQuery(queryRef, paginationDirection, limit, this.firstProjectPage, this.lastProjectPage);
                    };

                    return query;
                }

                if (filterValue === ProjectFilterOptionValues.COLLABORATOR) {
                    const queryFn: QueryFn<DocumentData> = (ref) => {
                        const queryRef = ref
                            .where('members', 'array-contains', user.email)
                            .orderBy(sortQueryArgs.field, sortQueryArgs.option);

                        return this.getPaginationQuery(queryRef, paginationDirection, limit, this.firstProjectPage, this.lastProjectPage);
                    };

                    return queryFn;
                }

                if (filterValue === ProjectFilterOptionValues.COLLAB_COMPLETED) {
                    const queryFn: QueryFn<DocumentData> = (ref) => {
                        const queryRef = ref
                            .where('members', 'array-contains', user.email)
                            .where('completed', '==', true)
                            .orderBy(sortQueryArgs.field, sortQueryArgs.option);

                        return this.getPaginationQuery(queryRef, paginationDirection, limit, this.firstProjectPage, this.lastProjectPage);
                    };

                    return queryFn;
                }

                if (filterValue === ProjectFilterOptionValues.COLLAB_IN_PROGRESS) {
                    const queryFn: QueryFn<DocumentData> = (ref) => {
                        const queryRef = ref
                            .where('members', 'array-contains', user.email)
                            .where('completed', '==', false)
                            .orderBy(sortQueryArgs.field, sortQueryArgs.option);

                        return this.getPaginationQuery(queryRef, paginationDirection, limit, this.firstProjectPage, this.lastProjectPage);
                    };

                    return queryFn;
                }

                const queryFn: QueryFn<DocumentData> = (ref) => {
                    const queryRef = ref
                        .where('user_id', '==', user.uid)
                        .orderBy(sortQueryArgs.field, sortQueryArgs.option);

                    return this.getPaginationQuery(queryRef, paginationDirection, limit, this.firstProjectPage, this.lastProjectPage);
                };

                return queryFn;
            })
        );
    }

    private getPaginationQuery(queryRef: Query, pageDirection: 'next' | 'prev' | 'curr' | undefined, limit: number, firstCursor: QueryDocumentSnapshot<Project>, lastCursor: QueryDocumentSnapshot<Project>) {
        if (pageDirection && pageDirection === 'next') return queryRef.startAfter(lastCursor).limit(limit);
        if (pageDirection && pageDirection === 'prev') return queryRef.endBefore(firstCursor).limitToLast(limit + 1);
        if (pageDirection && pageDirection === 'curr') return queryRef.startAt(firstCursor).limit(limit);
        return queryRef.limit(limit);
    }
}
