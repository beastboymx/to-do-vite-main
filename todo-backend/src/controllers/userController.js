const { createUser, getUserByEmail: getUserByEmailModel, getAllUsers: getAllUsersModel } = require('../models/userModel');
const bcrypt = require('bcrypt');

//crear usuario
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    //validar los campos
    if (!name || !email || !password) {
        return res.status(400).json({ msg: "Por favor llene todos los campos" });
    }
    try {
        //Encriptar la contraseña   
        const hashedPassword = await bcrypt.hash(password, 10);

        //Crear usuario
        const newUser = await createUser({ name, email, password: hashedPassword });
        res.status(201).json(newUser);
    } catch (error) {
        console.log(error);
        if (error.code === 'ERR_DUP_ENTRY') {
            return res.status(400).json({ msg: "El email o el usuario ya existe" })
        }
        res.status(500).json({ msg: "Error en el servidor, no pudo registrar el usuario" })
    }
}

// Controlador para obtener usuario por email
const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await getUserByEmailModel(email);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador para obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersModel();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, getUserByEmail, getAllUsers };