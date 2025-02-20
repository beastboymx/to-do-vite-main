import React, { useState } from "react";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

// Interfaz para tipar la respuesta de la API
interface ErrorResponse {
  message: string;
}

// Función para obtener la URL base de la API
const getBaseUrl = () => {
  const isLocal = window.location.hostname === "localhost";
  return isLocal ? "http://localhost:5000" : "http://192.168.100.12:5000";
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para guardar los datos del formulario y errores
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para validar los datos del formulario
  const validateForm = () => {
    if (!name || !email || !password) {
      setErrorMessages("Todos los campos son obligatorios.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessages("Por favor, ingresa un correo electrónico válido.");
      return false;
    }
    if (password.length < 6) {
      setErrorMessages("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    return true;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validamos antes de enviar los datos
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${getBaseUrl()}/api/users/register`,
        { name, email, password }
      );
      console.log("Registro exitoso", response.data);
      navigate("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(axiosError);
      
      // Accedemos de manera segura al mensaje de error
      setErrorMessages(
        axiosError?.response?.data?.message || "Error al registrar usuario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Registro
        </Typography>
        <Box component="form" noValidate sx={{ mt: 2 }} onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Correo Electrónico"
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Contraseña"
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMessages && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errorMessages}
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            type="submit"
            disabled={isSubmitting} // Deshabilitar mientras se procesa
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
