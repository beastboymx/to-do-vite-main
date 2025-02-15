const pool = require('../config/db');

//crear usuario
const createUser = async (user) => {
    const { name, email, password } = user;
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, password]);

    return { id: result.insertID, name, email };
}

//Obtener usuario por email
const getUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

// Verificar si existe el usuario
const userExists = async (email) => {
    const [rows] = await pool.query('SELECT  COUNT(*) as count FROM users WHERE email = ?', [email])
    return rows[0].count > 0;
}

//Obtner usuario por id
const getUserById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    return rows[0];
}

//Actualizar el usuario
const updateUser = async (id, updates) => {
    const fields = [];
    const values = [];

    for (const key in updates) {
        fields.push(`${key} = ?`)
        values.push(updates[key])
    }
    values.push(id);

    const query = `UPDATE users SET ${fields.join(',')} WHERE id = ?`;
    const [result] = await pool.query(query.values);

    return result.affectedRows > 0;
}

//Eliminar usuario
const deleteUser = async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

module.exports = { createUser, getUserByEmail, userExists, getUserById, updateUser, deleteUser };