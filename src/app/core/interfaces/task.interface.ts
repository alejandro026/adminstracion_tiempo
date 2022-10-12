import { Timestamp } from 'firebase/firestore';

export interface Task {
    id?: string;
    name: string;
    description: string;
    completed: boolean;
    priority: number;
    creation_date: Timestamp;
    modification_date: Timestamp;
    user_id: string;
}
