// En AuthModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    InputAdornment,
    Divider,
    Alert,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff, Close } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiSelect: {
            styleOverrides: {
                select: {
                    backgroundColor: 'white',
                    '&:focus': {
                        backgroundColor: 'white',
                    },
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: '#333',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f44336',
                        borderWidth: '2px',
                    },
                },
            },
        },
    },
});

const AuthModal = ({ open, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        pais: '',
        codigo_postal: '',
        fecha_nto: null,
        preferencias_literarias: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const isLogin = mode === 'login';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setForm(prev => ({ ...prev, fecha_nto: date }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            if (!form.email || !form.password) {
                setError('Por favor completa todos los campos');
                return;
            }
        } else {
            // Validación de registro
            const requiredFields = ['nombre', 'apellido', 'email', 'password', 'confirmPassword'];
            const missingFields = requiredFields.filter(field => !form[field]);

            if (missingFields.length > 0) {
                setError('Por favor completa todos los campos obligatorios');
                return;
            }

            if (form.password !== form.confirmPassword) {
                setError('Las contraseñas no coinciden');
                return;
            }

            if (form.password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
        }

        setLoading(true);

        try {
            if (isLogin) {
                await login(form.email, form.password);
            } else {
                await register(form);
            }
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error en autenticación:', error);
            setError(error.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            confirmPassword: '',
            telefono: '',
            direccion: '',
            ciudad: '',
            pais: '',
            codigo_postal: '',
            fecha_nto: null,
            preferencias_literarias: ''
        });
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <DialogTitle sx={{ p: 0 }}>
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </DialogTitle>
                    <IconButton onClick={handleClose} size="small">
                        <Close />
                    </IconButton>
                </Box>

                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Nombres"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        margin="normal"
                                        required
                                        autoComplete="given-name"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Apellidos"
                                        name="apellido"
                                        value={form.apellido}
                                        onChange={handleChange}
                                        margin="normal"
                                        required
                                        autoComplete="family-name"
                                    />
                                </Grid>
                            </Grid>
                        )}

                        <TextField
                            fullWidth
                            label="Correo electrónico"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoComplete="email"
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={isLogin ? 12 : 6}>
                                <TextField
                                    fullWidth
                                    label="Contraseña"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            {!isLogin && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Confirmar contraseña"
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                            )}
                        </Grid>

                        {!isLogin && (
                            <>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Teléfono"
                                            name="telefono"
                                            value={form.telefono}
                                            onChange={handleChange}
                                            margin="normal"
                                            autoComplete="tel"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{
                                        '& .MuiFormControl-root': {
                                            marginTop: '16px',
                                            marginBottom: '8px',
                                            '& .MuiInputBase-root': {
                                                height: '56px',
                                                '& input': {
                                                    padding: '16.5px 14px',
                                                    height: '1.1876em',
                                                    color: 'white'
                                                }
                                            }
                                        }
                                    }}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                                            <DatePicker
                                                label="Fecha de nacimiento"
                                                value={form.fecha_nto}
                                                onChange={handleDateChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        sx={{
                                                            '& .MuiInputLabel-root': {
                                                                color: 'rgba(255, 255, 255, 0.7)',
                                                                '&.Mui-focused': {
                                                                    color: '#f44336',
                                                                }
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'rgba(255, 255, 255, 0.5)'
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'rgba(255, 255, 255, 0.8)'
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#f44336',
                                                                borderWidth: '2px'
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>

                                <TextField
                                    fullWidth
                                    label="Dirección"
                                    name="direccion"
                                    value={form.direccion}
                                    onChange={handleChange}
                                    margin="normal"
                                    autoComplete="address-line1"
                                />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Ciudad"
                                            name="ciudad"
                                            value={form.ciudad}
                                            onChange={handleChange}
                                            margin="normal"
                                            autoComplete="address-level2"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="País"
                                            name="pais"
                                            value={form.pais}
                                            onChange={handleChange}
                                            margin="normal"
                                            autoComplete="country"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Código Postal"
                                            name="codigo_postal"
                                            value={form.codigo_postal}
                                            onChange={handleChange}
                                            margin="normal"
                                            autoComplete="postal-code"
                                        />
                                    </Grid>
                                </Grid>

                                <ThemeProvider theme={theme}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel
                                            id="preferencias-label"
                                            sx={{
                                                color: 'rgba(0, 0, 0, 0.6)',
                                                '&.Mui-focused': {
                                                    color: '#f44336',
                                                }
                                            }}
                                        >
                                            Preferencias literarias
                                        </InputLabel>
                                        <Select
                                            labelId="preferencias-label"
                                            name="preferencias_literarias"
                                            value={form.preferencias_literarias}
                                            onChange={handleChange}
                                            label="Preferencias literarias"
                                            sx={{
                                                '& .MuiSelect-select': {
                                                    color: '#fff',  // Texto en blanco
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#f44336',
                                                    borderWidth: '2px',
                                                },
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 200,
                                                        backgroundColor: '#333',  // Fondo oscuro para el menú
                                                        '& .MuiMenuItem-root': {
                                                            color: '#fff',  // Texto en blanco
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                            },
                                                            '&.Mui-selected': {
                                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value="Ficción">Ficción</MenuItem>
                                            <MenuItem value="No Ficción">No Ficción</MenuItem>
                                            <MenuItem value="Ciencia Ficción">Ciencia Ficción</MenuItem>
                                            <MenuItem value="Fantasía">Fantasía</MenuItem>
                                            <MenuItem value="Romance">Romance</MenuItem>
                                            <MenuItem value="Misterio">Misterio</MenuItem>
                                            <MenuItem value="Terror">Terror</MenuItem>
                                            <MenuItem value="Biografía">Biografía</MenuItem>
                                            <MenuItem value="Autoayuda">Autoayuda</MenuItem>
                                            <MenuItem value="Otros">Otros</MenuItem>
                                        </Select>
                                    </FormControl>
                                </ThemeProvider>
                            </>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ py: 1.5 }}
                            >
                                {loading
                                    ? isLogin
                                        ? 'Iniciando sesión...'
                                        : 'Creando cuenta...'
                                    : isLogin
                                        ? 'Iniciar Sesión'
                                        : 'Registrarse'}
                            </Button>

                            <Divider sx={{ my: 2 }}>o</Divider>

                            <Typography variant="body2" align="center">
                                {isLogin
                                    ? '¿No tienes una cuenta? '
                                    : '¿Ya tienes una cuenta? '}
                                <Button
                                    color="primary"
                                    onClick={toggleMode}
                                    sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                                >
                                    {isLogin ? 'Regístrate' : 'Inicia sesión'}
                                </Button>
                            </Typography>
                        </Box>
                    </form>
                </DialogContent>
            </Box>
        </Dialog>
    );
};

export default AuthModal;