import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Usa la dirección IP de la máquina donde corre el backend
      const response = await axios.post(
        "http://192.168.100.12:5000/api/auth/login",  // Cambia localhost por la IP de la red local
        {
          email,
          password,
        }
      );

      console.log("Token recibido:", response.data.token); // Verificar si se recibe el token
      localStorage.setItem("token", `Bearer ${response.data.token}`);
      setErrorMessage("");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Error al iniciar sesión. Verifique sus credenciales."
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Iniciar Sesión
        </Typography>
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <Box component="form" noValidate sx={{ mt: 2 }} onSubmit={handleSubmit}>
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
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            type="submit"
          >
            Ingresar
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            ¿No tienes una cuenta?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/register")}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
