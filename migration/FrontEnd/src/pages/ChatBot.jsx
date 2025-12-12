import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css'
import Header from '../components/Header'

function ChatBot() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  const API_URL = 'http://localhost:3001/api/chat';
  
  // Mensagem inicial do bot
  useEffect(() => {
    const welcomeMessage = {
      sender: 'bot',
      text: 'Olá! Sou o assistente virtual da loja. Posso ajudar com:\n\n🛍️ Informações sobre produtos\n📦 Status de pedidos\n🚚 Informações de entrega\n💳 Formas de pagamento\n👤 Sua conta\n\nComo posso ajudar você hoje?'
    };
    setChatHistory([welcomeMessage]);
  }, []);
  
  // Scroll automático para a última mensagem
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);
  
  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || isLoading) return;
    
    // Adiciona mensagem do usuário
    const userMessage = { sender: 'user', text: trimmedMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      
      const data = await response.json();
      
      // Adiciona resposta do chatbot
      const botResponse = { sender: 'bot', text: data.response };
      setChatHistory(prev => [...prev, botResponse]);
      
    } catch (error) {
      console.error('Erro ao comunicar com o chatbot:', error);
      const errorMessage = { 
        sender: 'bot', 
        text: 'Desculpe, estou com dificuldades para me conectar no momento. Por favor, tente novamente mais tarde ou entre em contato com nosso suporte.' 
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para enviar com Enter (exceto Shift+Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };
  
  return (
    <div className='Div-Chat'>
      <div className='Navbar-Chat'>
        <Header />
      </div>
      
      <div className='Div-Chatbot'>
        <div className="chat-container">
          
          <div className="chat-history">
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`message-row ${msg.sender}`}
              >
                <span className="message-bubble">
                  {msg.text}
                </span>
              </div>
            ))}
            
            {/* Indicador de digitação quando carregando */}
            {isLoading && (
              <div className="message-row bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={sendMessage} className="input-area">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua dúvida sobre produtos, pedidos, entrega..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;