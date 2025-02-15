const express = require('express');
const { getAllTasks, addTask, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const autheticate = require('../middlewares/autheticate');
const router = express.Router();

//Ruta para obtener todas las tareas
router.get('/', autheticate, getAllTasks);

//Ruta para obtener todas las tareas
router.get('/:id', autheticate, getTask);

// Ruta para crear una nueva tarea
router.post('/', autheticate, addTask);

// Ruta para actualizar una tarea existente
router.put('/:id', autheticate, updateTask);

// Ruta para eliminar una tarea
router.delete('/:id', autheticate, deleteTask)

module.exports = router;

