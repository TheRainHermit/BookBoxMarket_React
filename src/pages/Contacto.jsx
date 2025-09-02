import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  Snackbar,
  IconButton,
  Divider,
  Link,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Cargar datos guardados del localStorage al cargar el componente
  useEffect(() => {
    const savedFormData = localStorage.getItem('contactFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico no válido';
    }
    if (!formData.message.trim()) newErrors.message = 'El mensaje es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Guardar en localStorage
      localStorage.setItem('contactFormData', JSON.stringify(newData));
      return newData;
    });
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simular envío del formulario
    setTimeout(() => {
      console.log('Formulario enviado:', formData);
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: '¡Mensaje enviado con éxito!',
        severity: 'success'
      });
      // Limpiar formulario después del envío
      setFormData({ name: '', email: '', phone: '', message: '' });
      localStorage.removeItem('contactFormData');
    }, 1500);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '+573194247585';
    const message = 'Hola, me gustaría más información sobre sus servicios.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={styles.heroSection}>
            <Typography variant="h3" component="h1" sx={styles.sectionTitle}>
              Contáctanos
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Estamos aquí para ayudarte. Envíanos un mensaje y nos pondremos en contacto contigo lo antes posible.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Formulario de contacto */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={styles.contactCard}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Fila con tres columnas para nombre, correo y presupuesto */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      variant="outlined"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      sx={styles.inputField}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      type="email"
                      variant="outlined"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                      sx={styles.inputField}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Presupuesto"
                      type="number"
                      variant="outlined"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      sx={styles.inputField}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Área de mensaje que ocupa todo el ancho */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mensaje"
                      variant="outlined"
                      multiline
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      error={!!errors.message}
                      helperText={errors.message}
                      sx={{
                        ...styles.inputField,
                        '& .MuiOutlinedInput-root': {
                          alignItems: 'flex-start'
                        },
                        '& .MuiInputAdornment-root': {
                          height: 'auto'
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignItems: 'flex-start' }}>
                            <MessageIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? null : <SendIcon />}
                  sx={styles.submitButton}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </Button>
              </form>
            </Paper>
          </Grid>

          {/* Información de contacto */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ ...styles.contactCard, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircleIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Información de contacto
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Estamos disponibles para responder a tus preguntas y comentarios. No dudes en ponerte en contacto con nosotros a través de cualquiera de estos medios.
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Box
                  component={motion.div}
                  whileHover={{ x: 5 }}
                  sx={styles.contactItem}
                >
                  <EmailIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Correo electrónico</Typography>
                    <Link
                      href="mailto:contacto@bookboxmarket.com"
                      color="primary"
                      underline="hover"
                      sx={{ fontWeight: 500 }}
                    >
                      contacto@bookboxmarket.com
                    </Link>
                  </Box>
                </Box>

                <Box
                  component={motion.div}
                  whileHover={{ x: 5 }}
                  sx={styles.contactItem}
                  onClick={handleWhatsAppClick}
                  style={{ cursor: 'pointer' }}
                >
                  <WhatsAppIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">WhatsApp</Typography>
                    <Typography color="primary" sx={{ fontWeight: 500 }}>+57 3194247585</Typography>
                  </Box>
                </Box>

                <Box
                  component={motion.div}
                  whileHover={{ x: 5 }}
                  sx={styles.contactItem}
                >
                  <LocationIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Ubicación</Typography>
                    <Typography color="text.primary" sx={{ fontWeight: 500 }}>Cali, Colombia</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%'
              }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: 'text.primary',
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  Síguenos en redes sociales
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    width: '100%'
                  }}
                >
                  {[
                    { icon: <FacebookIcon />, color: '#1877F2', label: 'Facebook' },
                    { icon: <TwitterIcon />, color: '#1DA1F2', label: 'Twitter' },
                    { icon: <InstagramIcon />, color: '#E4405F', label: 'Instagram' },
                    { icon: <LinkedInIcon />, color: '#0A66C2', label: 'LinkedIn' }
                  ].map((social, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -3, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconButton
                        aria-label={social.label}
                        sx={{
                          color: 'white',
                          backgroundColor: `${social.color} !important`,
                          '&:hover': {
                            backgroundColor: `${social.color} !important`,
                            opacity: 0.9
                          }
                        }}
                      >
                        {social.icon}
                      </IconButton>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Chatbot */}
      <Chatbot />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      />
    </Box>
  );
};

// Estilos reutilizables
const styles = {
  heroSection: {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: 4,
    p: { xs: 3, md: 5 },
    mb: 6,
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '1px solid rgba(0,0,0,0.05)'
  },
  sectionTitle: {
    fontWeight: 700,
    mb: 2,
    background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
    fontSize: { xs: '2rem', md: '2.5rem' }
  },
  contactCard: {
    height: '100%',
    borderRadius: 3,
    p: { xs: 3, md: 4 },
    transition: 'all 0.3s ease',
    border: '1px solid rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    }
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: '#f8f9fa',
      '&:hover fieldset': {
        borderColor: '#3498db',
      },
      '&.Mui-focused fieldset': {
        borderWidth: 2,
        borderColor: '#2c3e50',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#2c3e50',
    }
  },
  submitButton: {
    py: 1.5,
    fontSize: '1.1rem',
    fontWeight: 600,
    borderRadius: 2,
    textTransform: 'none',
    letterSpacing: 0.5,
    mt: 3,
    background: 'linear-gradient(45deg, #2c3e50 0%, #34495e 100%)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
      background: 'linear-gradient(45deg, #2c3e50 0%, #2c3e50 100%)',
    }
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    p: 2.5,
    borderRadius: 2,
    bgcolor: 'background.paper',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    mb: 2,
    '&:hover': {
      transform: 'translateX(5px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.1)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    }
  }
};

export default Contacto;