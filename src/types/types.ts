export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    userId: string;
    createdAt: string;
}

/* omite la key Id, puesto que la creara firestore*/
export type NexTask = Omit< Task, "id">;

