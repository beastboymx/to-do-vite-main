import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Typography, TextField, Button, List, 
    ListItem, ListItemText, ListItemSecondaryAction, IconButton, 
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, Snackbar 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CheckCircle as OnlineIcon, Cancel as OfflineIcon } from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import { saveTask, getTasks, deleteTask } from '../utils/localDB';
import { checkConnection, listenForReconnection } from '../utils/connectionStatus';

interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    pendingSync?: boolean;
    isDeleted?: boolean; // Nuevo campo para marcar tareas eliminadas
}

const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isOnline, setIsOnline] = useState(checkConnection());
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const fetchTasks = async () => {
        const offlineTasks = await getTasks();
        if (isOnline) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/tasks', {
                    headers: { Authorization: token },
                });
                setTasks([...response.data, ...offlineTasks]);
            } catch (error) {
                showSnackbar('Error al obtener las tareas.');
            }
        } else {
            setTasks(offlineTasks);
        }
    };

    const handleAddTask = async () => {
        const newTask: Task = {
            id: Date.now(),
            title: taskTitle,
            description: taskDescription,
            status: 'Pendiente',
            pendingSync: !isOnline,
        };

        if (isOnline) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post('http://localhost:5000/api/tasks', newTask, {
                    headers: { Authorization: token },
                });
                setTasks(prev => [...prev, response.data]);
                showSnackbar('Tarea agregada exitosamente.');
            } catch (error) {
                showSnackbar('Error al agregar tarea.');
            }
        } else {
            await saveTask(newTask);
            setTasks(prev => [...prev, newTask]);
            showSnackbar('Tarea agregada exitosamente (sin conexión).');
        }

        setTaskTitle('');
        setTaskDescription('');
    };

    const syncTasksWithServer = async () => {
        const offlineTasks = await getTasks();
        const token = localStorage.getItem('token');

        // Sincronizar eliminaciones
        const deletedTasks = offlineTasks.filter(task => task.isDeleted);

        for (const task of deletedTasks) {
            try {
                await axios.delete(`http://localhost:5000/api/tasks/${task.id}`, {
                    headers: { Authorization: token },
                });
                await deleteTask(task.id); // Eliminar de la base de datos local
            } catch (error) {
                console.error('Error al sincronizar eliminación de tarea:', error);
            }
        }

        // Sincronizar tareas creadas o editadas
        for (const task of offlineTasks) {
            if (task.pendingSync) {
                try {
                    if (String(task.id).length > 10) {
                        // Nueva tarea creada offline
                        const response = await axios.post('http://localhost:5000/api/tasks', task, {
                            headers: { Authorization: token },
                        });
                        setTasks(prev => prev.filter(t => t.id !== task.id).concat(response.data));
                    } else {
                        // Tarea editada offline
                        await axios.put(`http://localhost:5000/api/tasks/${task.id}`, task, {
                            headers: { Authorization: token },
                        });
                    }
                    await deleteTask(task.id); // Eliminar de la base de datos local
                } catch (error) {
                    console.error('Error al sincronizar tarea:', error);
                }
            }
        }

        fetchTasks();
    };

    const handleEditClick = (task: Task) => {
        setEditTask(task);
        setOpen(true);
    };

    const handleUpdateTask = async () => {
        if (!editTask) return;
    
        if (isOnline) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:5000/api/tasks/${editTask.id}`, editTask, {
                    headers: { Authorization: token },
                });
                setTasks(prev => prev.map(task => task.id === editTask.id ? editTask : task)); // Actualiza la tarea en la lista
                showSnackbar('Tarea actualizada exitosamente.');
            } catch (error) {
                showSnackbar('Error al actualizar tarea.');
            }
        } else {
            await saveTask({ ...editTask, pendingSync: true });
            setTasks(prev => prev.map(task => task.id === editTask.id ? { ...editTask, pendingSync: true } : task)); // Actualiza la tarea en la lista
            showSnackbar('Tarea actualizada exitosamente (sin conexión).');
        }
    
        setOpen(false);
    };

    const handleDeleteTask = (task: Task) => {
        setTaskToDelete(task);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;

        if (isOnline) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/tasks/${taskToDelete.id}`, {
                    headers: { Authorization: token },
                });
                setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
                showSnackbar('Tarea eliminada exitosamente.');
            } catch (error) {
                showSnackbar('Error al eliminar tarea.');
            }
        } else {
            // Marcar la tarea como eliminada en modo offline
            await saveTask({ ...taskToDelete, isDeleted: true });
            setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
            showSnackbar('Tarea eliminada exitosamente (sin conexión).');
        }

        setDeleteDialogOpen(false);
    };

    const updateConnectionStatus = () => {
        setIsOnline(checkConnection());
    };

    useEffect(() => {
        fetchTasks();
        listenForReconnection(syncTasksWithServer);
        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);

        return () => {
            window.removeEventListener('online', updateConnectionStatus);
            window.removeEventListener('offline', updateConnectionStatus);
        };
    }, []);

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4">
                    Mis Tareas 
                    {isOnline ? <OnlineIcon sx={{ color: 'green', ml: 1 }} /> : <OfflineIcon sx={{ color: 'red', ml: 1 }} />}
                </Typography>

                <TextField fullWidth label="Nueva Tarea" variant="outlined" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                <TextField fullWidth label="Descripción" variant="outlined" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} sx={{ mt: 2 }} />
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleAddTask} fullWidth>Agregar Tarea</Button>

                <List sx={{ mt: 4 }}>
                    {tasks.map(task => (
                        <ListItem key={task.id} divider>
                            <ListItemText
                                primary={`${task.title || 'Sin título'} ${task.pendingSync ? '(Pendiente de sincronización)' : ''}`}
                                secondary={`Estado: ${task.status || 'Sin estado'} | Descripción: ${task.description || 'No especificada'}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => handleEditClick(task)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" onClick={() => handleDeleteTask(task)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>¿Estás seguro de que deseas eliminar esta tarea?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" color="error" onClick={confirmDeleteTask}>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Editar Tarea</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Título" value={editTask?.title || ''} onChange={(e) => setEditTask(prev => prev ? { ...prev, title: e.target.value } : null)} />
                    <TextField fullWidth label="Descripción" value={editTask?.description || ''} onChange={(e) => setEditTask(prev => prev ? { ...prev, description: e.target.value } : null)} sx={{ mt: 2 }} />
                    <Select fullWidth value={editTask?.status || 'Pendiente'} onChange={(e) => setEditTask(prev => prev ? { ...prev, status: e.target.value } : null)} sx={{ mt: 2 }}>
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="En Progreso">En Progreso</MenuItem>
                        <MenuItem value="Completada">Completada</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleUpdateTask}>Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <MuiAlert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </MuiAlert>
            </Snackbar>
        </Container>
    );
};

export default Dashboard;