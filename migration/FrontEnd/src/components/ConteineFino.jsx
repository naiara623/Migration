import React from 'react'
import './ConteineFino.css'
import { Link } from 'react-router-dom';


function ConteineFino() {
  return (
    <div>
        <div className='conteine-fino-MC2' >
                    <div className='conteine-icon-nomeUsu-MC2'>
                        <div className='icone-user-MC2' >
                            <img src="User1.png" alt="" className='img-USER-MC2' />
                        </div>
                        <div className='conteine-nomeUsu-MC2'>
                            <Link className='nomeUsuario-MC2' to='/Perfil-usuario'> <h3>Nome_Usuario</h3></Link>
                        </div>
                    </div>
                    <div className='div-LINHA1-MC2' >
                        <div className='conteine-LINHA1-MC2'></div>
                    </div>
                    <div className='conteine-M-F-E-MC2'>
                        <Link className='nome-minhascompras-MC2' to='/MinhasCompras'> <h3>Minhas compras</h3></Link>
                        <Link className='nome-meusFavorito-MC2' to='/MeusFavoritos'><h3>Meus Favoritos</h3></Link>
                        <Link className='nome-endereço-MC2' to='/Endereco'><h3>Endereço</h3></Link>
                    </div>
                </div>
    </div>
  )
}

export default ConteineFino