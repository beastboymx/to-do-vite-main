const taskModel = require('../models/taskModel');

//Obtener todas las tareas id
const getAllTasks = async (req, res) => {
    try {
        const tasks = await taskModel.getAllTaskByUserId(req.user.id)
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener tareas' });
    }
};
//Obtener una tarea por id
const getTask = async (req, res) => {
    try {
        const task = await taskModel.getTaskByIdAndUserId(req.user.id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no enccontrada o no pertenece al usuario' });
        }
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

//Agregar Tarea
const addTask = async (req, res) => {
    const { title, description, status } = req.body;
    const userId = req.user.id; // Asegúrate de que estás obteniendo el ID del usuario correctamente

    if (!title) {
        return res.status(400).json({ message: 'El título es obligatorio' });
    }

    try {
        const newTask = await taskModel.createTask({
            title,
            description: description || 'No especificada',
            status: status || 'Pendiente',
            user_id: userId,
        });

        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la tarea' });
    }
};

// Actualizar una tarea existente
const updateTask = async (req, res) => {
    const { title, description, status } = req.body;
    const taskId = req.params.id;

    try {
        const updatedTask = await taskModel.updateTaskById(taskId, {
            title,
            description,
            status,
            user_id: req.user.id // Asegúrate de que el usuario esté asociado
        });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario' });
        }

        // Solo envía la respuesta una vez
        return res.json({ message: 'Tarea actualizada correctamente' });
    } catch (error) {
        console.error(error);
        // Asegúrate de que no se envíe otra respuesta aquí
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error al actualizar la tarea' });
        }
    }
};

const deleteTask = async (req, res) => {
    const taskId = req.params.id;

    try {
        const result = await taskModel.deleteTaskById(taskId, req.user.id); // Asegúrate de pasar el user_id para verificar la propiedad

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario' });
        }

        res.json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la tarea' });
    }
};

module.exports = { getAllTasks, getTask, addTask, updateTask, deleteTask };
