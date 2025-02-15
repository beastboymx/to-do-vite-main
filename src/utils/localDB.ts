import { DataObjectSharp, Upgrade } from '@mui/icons-material';
import {openDB} from 'idb';

const DB_NAME = 'taskDB';
const STORE_NAME = 'task';

export const dbPromise = openDB(DB_NAME, 1,{
    upgrade(db){
        if(!db.objectStoreNames.contains(STORE_NAME)){
            db.createObjectStore(STORE_NAME, {keyPath: 'id', autoIncrement: true});
        }
    }
});

//Guardar una tarea en la base de datos local
export async function saveTask(task){
    const db = await dbPromise;
    return db.put(STORE_NAME, task);
}

//Obetener todas las tareas de la base de datos local
export async function getTasks(){
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
}

export async function deleteTask(id) {
    console.log("Intentando eliminar la tarea con id:", id);
    const db = await dbPromise;
    const result = await db.delete(STORE_NAME, id);
    console.log("Resultado de la eliminación:", result);
    return result;
}


