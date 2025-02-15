import axios from 'axios';
import { getTasks, saveTask } from '../utils/localDB';

export const syncTasksWithServer = async () => {
    if (!navigator.onLine) return; // Cambié la condición para que se ejecute si no hay conexión
    const token = localStorage.getItem('token');
    const tasks = await getTasks();
    const unsyncedTasks = tasks.filter((task) => !task.synced);

    for (const task of unsyncedTasks) {
        try {
            // Crea un nuevo objeto sin la propiedad 'synced'
            const { synced, ...taskData } = task; // Desestructuración para excluir 'synced'

            const response = await axios.post(
                'http://localhost:5000/api/tasks',
                taskData, // Usa el nuevo objeto aquí
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            task.synced = true;
            task.id = response.data.id;
            await saveTask(task);
        } catch (error) {
            console.error('Error al sincronizar tarea:', error);
        }
    }
};
