import React, { useState, useEffect } from 'react';
import './PerfilAdm.css';
import { ThemeEffect } from '../../ThemeEffect';
import { ThemeContext } from '../../ThemeContext';
import Header from '../../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../../i18n";

function ContextPerfilAdm() {
  ThemeEffect();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    nome_adm: '',
    email_adm: '',
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Primeiro verificar se é admin
      const checkResponse = await fetch('http://localhost:3001/api/check-admin', {
        credentials: 'include'
      });

      if (checkResponse.status === 401) {
        navigate('/login');
        return;
      }

      const checkData = await checkResponse.json();
      
      if (!checkData.isAdmin) {
        navigate('/');
        return;
      }

      // Buscar dados completos do admin
      const response = await fetch('http://localhost:3001/api/admin-data', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData({
          ...adminData,
          nome_adm: data.nome_adm || '',
          email_adm: data.email_adm || '',
          senha_atual: '',
          nova_senha: '',
          confirmar_senha: ''
        });
      } else {
        setMessage('Erro ao carregar dados do administrador');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do admin:', error);
      setMessage('Erro de conexão com o servidor');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData({
      ...adminData,
      [name]: value
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      fetchAdminData();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (isEditing) {
      if (!adminData.nome_adm.trim()) {
        setMessage('O nome é obrigatório');
        setMessageType('error');
        return;
      }

      if (!adminData.email_adm.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email_adm)) {
        setMessage('Email inválido');
        setMessageType('error');
        return;
      }

      if (adminData.nova_senha || adminData.confirmar_senha) {
        if (!adminData.senha_atual) {
          setMessage('Para alterar a senha, informe a senha atual');
          setMessageType('error');
          return;
        }

        if (adminData.nova_senha.length < 6) {
          setMessage('A nova senha deve ter pelo menos 6 caracteres');
          setMessageType('error');
          return;
        }

        if (adminData.nova_senha !== adminData.confirmar_senha) {
          setMessage('As senhas não coincidem');
          setMessageType('error');
          return;
        }
      }
    }

    try {
      const payload = {
        nome_adm: adminData.nome_adm,
        email_adm: adminData.email_adm
      };

      if (adminData.senha_atual) {
        payload.senha_atual = adminData.senha_atual;
      }
      
      if (adminData.nova_senha) {
        payload.nova_senha = adminData.nova_senha;
      }

      const response = await fetch('http://localhost:3001/api/admin-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Dados atualizados com sucesso!');
        setMessageType('success');
        
        setAdminData({
          ...adminData,
          senha_atual: '',
          nova_senha: '',
          confirmar_senha: ''
        });
        
        setIsEditing(false);
        
        setTimeout(() => {
          fetchAdminData();
        }, 2000);
      } else {
        setMessage(data.erro || 'Erro ao atualizar dados');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage('Erro de conexão com o servidor');
      setMessageType('error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className='vermelha-ADM'>
        <div className='navbar-ADM'><Header/></div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 80px)',
          fontSize: '18px',
          color: '#667eea'
        }}>
          Carregando dados do administrador...
        </div>
      </div>
    );
  }

  return (
    <div className='vermelha-ADM'>
      <div className='navbar-ADM'><Header/></div>

      <div className='conteine-preto-ADM'>
        <div className='conteine-fino-ADM'>
          <div className='conteine-img-nomeUsu-ADM'>
            <div className='conteine-da-img-ADM'>
              <div className='div-img-ADM'><img src="User1.png" alt="" /></div>
            </div>

            <div className='div-nome-ADM'>
              <input 
                className='input-nome-ADM' 
                type="text" 
                value={adminData.nome_adm}
                readOnly={!isEditing}
                name="nome_adm"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className='conteineLINHA'>
            <div className='A-LINHA'></div>
          </div>

          <div className='conteine-dos-links'>
            <div className="links">
              <h3 className='li-loja'>
                <Link className='Loja-Link' to="/loja">{t("navbar.nav.min")}</Link>
              </h3>
              <button 
                onClick={handleLogout} 
                style={{
                  background: 'transparent',
                  border: '1px solid #ff4444',
                  color: '#ff4444',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  width: '100%',
                  fontSize: '14px'
                }}
              >
                Sair da Conta
              </button>
            </div>
          </div>
        </div>

        <div className='conteine-grosso-ADM'>
          <div className='informação-pessoais-ADM'>
            <h2>Informações Pessoais</h2>
          </div>

          <div className="conteine-LINHA2-ADM">
            <div className='div-LINHA2-ADM'></div>
          </div>

          {message && (
            <div style={{
              padding: '10px',
              margin: '10px 0',
              borderRadius: '4px',
              backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
              color: messageType === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {message}
            </div>
          )}

          <div className='campo-formulario-nome-ADM'>
            <label className='funcao-cor-Em-SE-SXADM' htmlFor="">Nome:</label>
            <input 
              type="text" 
              name="nome_adm"
              className='input-nome-ADM2' 
              value={adminData.nome_adm}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          <div className='campo-formulario-Email-ADM'>
            <label className='funcao-cor-Em-SE-SXADM' htmlFor="">Email:</label>
            <input 
              type="text" 
              name="email_adm"
              className='input-Email-ADM' 
              value={adminData.email_adm}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          {isEditing ? (
            <>
              <div className='campo-formulario-senha-ADM'>
                <label className='funcao-cor-Em-SE-SXADM' htmlFor="">Senha Atual:</label>
                <input 
                  type="password" 
                  name="senha_atual"
                  className='input-senha-ADM' 
                  value={adminData.senha_atual}
                  onChange={handleInputChange}
                  placeholder="Informe a senha atual para alterar"
                />
              </div>

              <div className='campo-formulario-senha-ADM'>
                <label className='funcao-cor-Em-SE-SXADM' htmlFor="">Nova Senha:</label>
                <input 
                  type="password" 
                  name="nova_senha"
                  className='input-senha-ADM' 
                  value={adminData.nova_senha}
                  onChange={handleInputChange}
                  placeholder="Nova senha (opcional)"
                />
              </div>

              <div className='campo-formulario-senha-ADM'>
                <label className='funcao-cor-Em-SE-SXADM' htmlFor="">Confirmar Senha:</label>
                <input 
                  type="password" 
                  name="confirmar_senha"
                  className='input-senha-ADM' 
                  value={adminData.confirmar_senha}
                  onChange={handleInputChange}
                  placeholder="Confirmar nova senha"
                />
              </div>
            </>
          ) : (
            <div className='campo-formulario-senha-ADM'>
              <label className='funcao-cor-Em-SE-SXADM' htmlFor="">Senha:</label>
              <input 
                type="password" 
                className='input-senha-ADM' 
                value="••••••••"
                readOnly
                placeholder="Clique em EDITAR para alterar"
              />
            </div>
          )}

          <div className='conteine-dos-buttons-ADM'>
            <button 
              className='botao-editar-ADM' 
              onClick={handleEditToggle}
            >
              {isEditing ? 'CANCELAR' : 'EDITAR'}
            </button>
            
            {isEditing && (
              <button 
                className='botao-deletar-ADM'
                onClick={handleSave}
              >
                SALVAR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PerfilAdm() {
  return (
    <ThemeContext>
      <ContextPerfilAdm/>
    </ThemeContext>
  );
}

export default PerfilAdm;