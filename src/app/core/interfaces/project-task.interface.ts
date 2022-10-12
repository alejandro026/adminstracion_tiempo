import { Timestamp } from 'firebase/firestore';

export interface ProjectTask {
    id?: string;
    name: string;
    description: string;
    completed: boolean;
    priority: number;
    owner: string | null;
    completation_date: Timestamp | null;
    creation_date: Timestamp;
    modification_date: Timestamp;
    project_id: string;
}
