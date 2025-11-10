import React, { useState } from 'react';
import './ChatBot.css'
import Header from '../components/Header'

function ChatBot() {
     // 1. Variáveis de Estado (Memória do Componente)
      const [message, setMessage] = useState(''); // Armazena o texto que o usuário está digitando
      const [chatHistory, setChatHistory] = useState([]); // Armazena todas as mensagens da conversa
      
      // *** IMPORTANTE: SUBSTITUA ESTA URL PELA URL DO SEU SERVIDOR FLASK ***
      const API_URL = 'http://localhost:5000/api/chat'; 
    
      // 2. Função de Envio de Mensagem
      const sendMessage = async (e ) => {
        e.preventDefault(); // Previne que a página recarregue ao enviar o formulário
        if (!message.trim()) return; // Não envia mensagens vazias
    
        // Adiciona a mensagem do usuário ao histórico
        const userMessage = { sender: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage(''); // Limpa o campo de input
    
        try {
          // Faz a requisição POST para a API do chatbot
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
          });
    
          const data = await response.json();
          
          // Adiciona a resposta do chatbot ao histórico
          const botResponse = { sender: 'bot', text: data.response };
          setChatHistory(prev => [...prev, botResponse]);
    
        } catch (error) {
          console.error('Erro ao comunicar com o chatbot:', error);
          const errorMessage = { sender: 'bot', text: 'Desculpe, o servidor do chatbot está indisponível no momento.' };
          setChatHistory(prev => [...prev, errorMessage]);
        }
      };
  return (
    <div className='Div-Chat'>
        <div className='Navbar-Chat'>
            <Header />
        </div>

        <div className='Div-Chatbot'>
             <div className="chat-container">
      
      {/* Área de Histórico de Mensagens */}
      {/* Substituído o estilo inline pelo className="chat-history" */}
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          // Substituído o estilo inline pelo className="message-row" e a classe dinâmica (user/bot)
          <div 
            key={index} 
            className={`message-row ${msg.sender}`}
          >
            {/* Substituído o estilo inline pelo className="message-bubble" */}
            <span className="message-bubble">
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      
      {/* Formulário de Envio */}
      {/* Substituído o estilo inline pelo className="input-area" */}
      <form onSubmit={sendMessage} className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          // Estilos inline removidos, o CSS em chat_style.css cuidará disso
        />
        <button 
          type="submit" 
          // Estilos inline removidos, o CSS em chat_style.css cuidará disso
        >
          Enviar
        </button>
      </form>
    </div>
        </div>

    </div>
  )
}

export default ChatBot