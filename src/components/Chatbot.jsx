import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  TextField, 
  Paper, 
  Typography, 
  Avatar, 
  Slide, 
  Fade,
  Divider
} from '@mui/material';
import { 
  Send as SendIcon, 
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Chat as ChatIcon 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
   const messages = [
  { text: "¡Hola! Soy el asistente de BookBox. ¿En qué puedo ayudarte hoy?", sender: 'bot' },
  { text: "Puedes preguntarme sobre nuestros productos, precios o hacer una reserva.", sender: 'bot' }
];

const quickReplies = [
  "¿Qué libros tienen disponibles?",
  "¿Cuáles son sus horarios?",
  "¿Hacen envíos?",
  "¿Aceptan pagos con tarjeta?"
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(messages);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    // Agregar mensaje del usuario
    const userMessage = { text: message, sender: 'user' };
    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simular respuesta del bot después de un retraso
    setTimeout(() => {
      const botResponses = [
        "Entiendo tu consulta. Déjame verificar esa información...",
        "Gracias por tu mensaje. Estoy procesando tu solicitud...",
        "¡Buena pregunta! Déjame buscar esa información para ti...",
        "Nuestro equipo se pondrá en contacto contigo pronto con más detalles."
      ];
      const botMessage = { 
        text: botResponses[Math.floor(Math.random() * botResponses.length)], 
        sender: 'bot' 
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    setMessage(reply);
    // Desencadenar el envío automático después de un breve retraso
    setTimeout(handleSendMessage, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
            <Paper 
              elevation={6} 
              sx={{ 
                width: 350, 
                maxWidth: '90vw', 
                height: 500, 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {/* Encabezado del chat */}
              <Box 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BotIcon />
                  <Typography variant="subtitle1">Asistente Virtual</Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => setIsOpen(false)} 
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Área de mensajes */}
              <Box 
                sx={{ 
                  flex: 1, 
                  p: 2, 
                  overflowY: 'auto', 
                  bgcolor: 'background.paper',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                  }
                }}
              >
                {chatMessages.map((msg, index) => (
                  <Fade key={index} in={true} timeout={300}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          maxWidth: '80%'
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0.5,
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                          }}
                        >
                          {msg.sender === 'bot' && (
                            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                              <BotIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                          )}
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              fontWeight: 500,
                              color: msg.sender === 'user' ? 'primary.main' : 'text.secondary'
                            }}
                          >
                            {msg.sender === 'user' ? 'Tú' : 'Asistente'}
                          </Typography>
                        </Box>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.100',
                            color: msg.sender === 'user' ? 'white' : 'text.primary',
                            borderTopLeftRadius: msg.sender === 'user' ? 12 : 2,
                            borderTopRightRadius: msg.sender === 'user' ? 2 : 12,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                        >
                          <Typography variant="body2">{msg.text}</Typography>
                        </Paper>
                      </Box>
                    </Box>
                  </Fade>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Respuestas rápidas */}
              {chatMessages.length <= 2 && (
                <Box sx={{ p: 1, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ px: 1, display: 'block', mb: 1 }}>
                    ¿En qué puedo ayudarte?
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1 }}>
                    {quickReplies.map((reply, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Paper
                          elevation={0}
                          onClick={() => handleQuickReply(reply)}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 4,
                            bgcolor: 'primary.light',
                            color: 'white',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          <Typography variant="caption">{reply}</Typography>
                        </Paper>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Área de entrada de texto */}
              <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Escribe tu mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target)}
                    onKeyPress={handleKeyPress}
                    multiline
                    maxRows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 4,
                        bgcolor: 'background.paper'
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    sx={{ 
                      alignSelf: 'flex-end',
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      },
                      '&:disabled': {
                        bgcolor: 'grey.300'
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Nuestro asistente te responderá en breve
                </Typography>
              </Box>
            </Paper>
          </Slide>
        )}
      </AnimatePresence>

      {/* Botón flotante del chat */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconButton
          color="primary"
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 60,
            height: 60,
            boxShadow: 6,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon fontSize="large" />}
        </IconButton>
      </motion.div>
    </Box>
  );
};

export default Chatbot;