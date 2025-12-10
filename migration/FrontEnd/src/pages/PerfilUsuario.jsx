import React, { useState, useEffect } from 'react'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import './PerfilUsuario.css'; 
import Header from '../components/Header';
// import { Link } from 'react-router-dom';
import ConteineFino from '../components/ConteineFino'
import { useTranslation } from 'react-i18next';
import "../i18n"

function PerfilUsuariocontext(){
    ThemeEffect()
    const {t} = useTranslation();
    
    const [userData, setUserData] = useState({
        idusuarios: '',
        nome: '',
        email: '',
        senha: '',
        numero: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Carregar dados do usuário
    useEffect(() => {
        carregarDadosUsuario();
    }, []);

const carregarDadosUsuario = async () => {
    try {
        console.log('🔄 Carregando dados do usuário...');
        
        const response = await fetch('http://localhost:3001/api/usuario-atual', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📡 Resposta da API:', response.status, response.statusText);
        
        // Verificar se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Resposta não é JSON:', text.substring(0, 200));
            throw new Error('Resposta do servidor não é JSON');
        }
        
        if (response.ok) {
            const user = await response.json();
            console.log('✅ Dados do usuário recebidos:', user);
            
            setUserData({
                idusuarios: user.idusuarios || '',
                nome: user.nome || '',
                email: user.email || '',
                senha: user.senha || '',
                numero: user.numero || ''
            });
        } else {
            const errorData = await response.json();
            console.error('❌ Erro na resposta:', errorData);
            setMessage(errorData.erro || 'Erro ao carregar dados do usuário');
        }
    } catch (error) {
        console.error('💥 Erro de conexão:', error);
        setMessage('Erro de conexão com o servidor: ' + error.message);
    } finally {
        setLoading(false);
    }
};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

   const handleEditarPerfil = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
        console.log('📤 Enviando dados para atualização:', userData);
        
        // CORREÇÃO: Remova o ":id" literal da URL
        const response = await fetch(`http://localhost:3001/api/usuario-atual/${userData.idusuarios}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: userData.nome,
                email: userData.email,
                numero: userData.numero,
                senha: userData.senha || undefined // Enviar senha apenas se foi alterada
            })
        });

        // Verificar se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Resposta não é JSON:', text.substring(0, 200));
            throw new Error('Resposta do servidor não é JSON');
        }
        
        const result = await response.json();
        
        if (response.ok) {
            setMessage('Perfil atualizado com sucesso!');
            // Limpar campo de senha após atualização bem-sucedida
            setUserData(prev => ({ ...prev, senha: '' }));
        } else {
            setMessage(result.erro || 'Erro ao atualizar perfil');
        }
    } catch (error) {
        console.error('💥 Erro ao atualizar perfil:', error);
        setMessage('Erro de conexão com o servidor: ' + error.message);
    }
};

   const handleDeletarConta = async () => {
    if (window.confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.')) {
        try {
            // CORREÇÃO: Usar a URL completa com localhost:3001
            const response = await fetch(`http://localhost:3001/api/usuario-atual/${userData.idusuarios}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ Resposta não é JSON:', text.substring(0, 200));
                throw new Error('Resposta do servidor não é JSON');
            }

            const result = await response.json();
            
            if (response.ok) {
                alert('Conta deletada com sucesso!');
                // Redirecionar para a página inicial
                window.location.href = '/';
            } else {
                setMessage(result.erro || 'Erro ao deletar conta');
            }
        } catch (error) {
            console.error('💥 Erro ao deletar conta:', error);
            setMessage('Erro de conexão: ' + error.message);
        }
    }
};

    if (loading) {
        return (
            <div className="loading-container">
                <div>Carregando...</div>
            </div>
        );
    }

    return(
        <div className='vermelha-PRF'>
            
            <div className='navbar-PRF'>
                <Header />
            </div>

            <div className='conteine-preto-PRF'>
                
                {/* colocar o componente AQUI! */}
                <div className='conteine-fino-MC' >
                    <ConteineFino />
                </div>

                <div className='conteine-grosso-PRF'>

                    <div className='informação-pessoais-PRF' >
                        <h2>{t("perfil.dadospessoais.title")}</h2>
                    </div>
                    
                    <div className="conteine-LINHA2-PRF">
                        <div className='div-LINHA2-PRF'></div>
                    </div>

                    <div className='div-vazia3' >


                    {message && (
                        <div className={`mensagem ${message.includes('sucesso') ? 'mensagem-sucesso' : 'mensagem-erro'}`}>
                            {message}
                        </div>
                    )}



                    </div>


                    <form className='form-perfil' onSubmit={handleEditarPerfil}>
                        <div className='campo-formulario-nome-PRF' >
                            <label className='funcao-cor-Em-SE-SX' htmlFor="nome">
                                {t("perfil.dadospessoais.nome")}
                            </label>
                            <input 
                                type="text" 
                                name="nome" 
                                id="nome"
                                className='input-nome-PRF' 
                                value={userData.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </div> 

                        <div className='campo-formulario-Email-PRF' >
                            <label className='funcao-cor-Em-SE-SX' htmlFor="email">
                                {t("perfil.dadospessoais.email")}
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email"
                                className='input-Email-PRF' 
                                value={userData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div> 

                        <div className='campo-formulario-senha-PRF' >
                            <label className='funcao-cor-Em-SE-SX' htmlFor="senha">
                                {t("perfil.dadospessoais.senha")}
                            </label>
                            <input 
                                type="password" 
                                name="senha" 
                                id="senha"
                                className='input-senha-PRF' 
                                value={userData.senha}
                                onChange={handleInputChange}
                                placeholder="Digite nova senha (deixe em branco para manter atual)"
                            />
                        </div>         

                        <div className='Numero-para-contato-PRF'>
                            <div className='div-vazia-PRE' ></div>

                            <div className='algumacoisa-PRE' >
                                <label className='funcao-cor-Em-SE-SX1' htmlFor="numero">
                                    {t("perfil.dadospessoais.nume")}
                                </label>
                                <input 
                                    className='input-numero' 
                                    name='numero' 
                                    id='numero' 
                                    type="text" 
                                    value={userData.numero}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="div-vazia-2-PRF"></div>

                        <div className='conteine-dos-buttons-PRF'>
                            <button type="submit" className='botao-editar'>
                                {t("perfil.dadospessoais.buto")}
                            </button>
                            <button type="button" className='botao-deletar' onClick={handleDeletarConta}>
                                {t("perfil.dadospessoais.but1")}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    )
}

function PerfilUsuario() {
    return (
        <ThemeProvider>
            <PerfilUsuariocontext/>
        </ThemeProvider>
    )
}

export default PerfilUsuario