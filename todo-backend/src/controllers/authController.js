const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');


const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(400).json({ msg: "Credenciales incorrectas" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({ msg: "Credenciales incorrectas" })
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.json({ token })
    } catch (error) {
        console.log('Error en login', error);
        res.status(500).json({ msg: 'Error en el servidor' })
    }
}

module.exports = { login }