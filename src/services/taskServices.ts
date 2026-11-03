import type { NexTask, Task } from "../types/types";

const STORAGE_KEY = "tasks";

const delay = () => new Promise(resolve => setTimeout(resolve, 2000));


export const getTasks = async () : Promise<Task []> => {
    await delay();
    const localTasks = localStorage.getItem(STORAGE_KEY);
    return JSON.parse((localTasks || "[]" )as string )as Task [];
};

export const addTask = async (task: NexTask): Promise<Task> => {
    await delay();
    const localTasks = localStorage.getItem(STORAGE_KEY);
    const tasks : Task[] = localTasks === null ? [] : JSON.parse(localTasks);

    const newTask : Task = {
        ...task,
        id: crypto.randomUUID(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...tasks, newTask]));
    
    return newTask;
    
};

export const updateTask = async (task: Task): Promise<Task> => {
    await delay();
    const {id, ...changes} = task;
    const localTasks = localStorage.getItem(STORAGE_KEY);
    const tasks : Task[] = localTasks === null ? [] : JSON.parse(localTasks);

    const updateTasks = tasks.map((task)=> 
        task.id === id ? { ...task, changes } : task,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updateTasks));

    return task;

};

export const deleteTask = async (task:Task) : Promise<Task> => {
    await delay();

    const {id} = task;
    const localTasks = localStorage.getItem(STORAGE_KEY);
    const tasks : Task[] = localTasks === null ? [] : JSON.parse(localTasks);
    const newTask = tasks.filter((task) => task.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTask));

    return task;
};

