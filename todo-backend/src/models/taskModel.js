const pool = require('../config/db');

const getAllTaskByUserId = async (userId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks WHERE user_id = ?', [userId])
        return rows;
    } catch {
        (error)
        console.log("Error al obtener tareas", error.message);
        throw error;
    }
};

const getTaskByIdAndUserId = async (taskId, userId) => {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId])
    return rows[0];
};

const createTask = async (task) => {
    const { title, description, status, user_id } = task;
    const [result] = await pool.query(
        'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)',
        [title, description, status, user_id]
    );

    return { id: result.insertId, title, description, status, user_id }; // Devuelve la nueva tarea
};

const updateTaskById = async (taskId, task) => {
    const { title, description, status, user_id } = task;
    const [result] = await pool.query(
        'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
        [title, description, status, taskId, user_id]
    );

    return result.affectedRows > 0; // Devuelve true si se actualizó al menos una fila
};

const deleteTaskById = async (taskId, userId) => {
    const [result] = await pool.query(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, userId]
    );

    return result; // Devuelve el resultado de la consulta
};

module.exports = { getAllTaskByUserId, getTaskByIdAndUserId, createTask, updateTaskById, deleteTaskById };