import React from 'react'
import "./Pagar.css"

function Pagar({ isOpen, onClose}) {

    if (!isOpen) return null;

  return (
     <div className='englobaTudo-Modal' onClick={onClose}>
       <div className='grande-modal' onClick={(e) => e.stopPropagation()}>

            <div  className='conteiner-0-pagar' > 

                <div className='conteiner-1-pagar'  >

                    <h1>Resumo Da Compra</h1>

                </div>

                <div className='conteiner-2-pagar' >

                    <div className='div-img-NMusuario-pagar' >

                        <div className='div-vazia-pagar' ></div>

                        {/* div do pino de mapa */}
                        <div className='div-img-pino-pagar' >
                            <img className='imagem-pino' src="pino-mapa.png" alt="" />
                        </div>

                        <div className='NM-Usuario-pagar'>

                        {/* aqui vai ser chamado o nome do usuario */}
                            <input type="text" />
                        </div>

                    </div>

                     <div className='div-detalheEndereço-pagar' >

                        <div className='div-numerocontato-pagar' >
                            <label className='lebels-pagar' >Número Para Contato:</label>
                            <input  className='inputs-pagar' type="text"  />
                        </div>

                        <div className='div-bairro-pagar' >
                            <label className='lebels-pagar' >Bairro:</label>
                            <input className='inputs-pagar' type="text"  />

                        </div>

                        <div  className='div-cidade-pagar' >
                            <label className='lebels-pagar' >Cidade:</label>
                            <input className='inputs-pagar' type="text"  />
                        </div>

                        <div className='div-estado-pagar' >
                            <label className='lebels-pagar' >Estado:</label>
                            <input className='inputs-pagar' type="text"  />
                        </div>


                     </div>

                </div>

                <div className='conteiner-3-pagar' >

                    <div className='titulo-ProdutoSelec-pagar' >
                        <h6>Produto Selecionado</h6>
                    </div>

                    <div className='div-img-descri-pagar' >

                        <div className='div-vazia0-pagar' ></div>

                        <div className='div-imagem-pagar' ></div>

                        <div className='div-descricao-produto-pagar' >

                            <div className='descriçãoProduto-pagar' >

                                <input type="text" />
                            </div>
                            
                             <div className='preco-pagar' >

                                <input type="text" />
                             </div>


                        </div>

                    </div>


                </div>

                 <div className='conteiner-4-pagar' >

                    <div className='titulo-detalhePG-pagar' >

                        <h6>Detalhes do Pagamento</h6>
                    </div>

                    <div className='div-detalhes-buttons-pagar' >

                        <div className='div-vazia2-pagar'></div>

                         <div className='detalhe-pagar' >
                            
                                <div className='div-metodoPg-pagar' >
                                <label className='labels-detalhe' >Metodo de Pagamento:</label>
                                <input  className='inputs-detalhes' type="text"  />
                            </div>

                            <div className='div-CupomInse-pagar' >
                                <label className='labels-detalhe' >Cupom Inserido:</label>
                                <input className='inputs-detalhes' type="text"  />

                            </div>

                            <div  className='div-QTProduto-pagar' >
                                <label className='labels-detalhe' >Quantidade de Produto:</label>
                                <input className='inputs-detalhes' type="text"  />
                            </div>

                            <div className='div-VL-produto-pagar' >
                                <label className='labels-detalhe' > Valor Total do Produto:</label>
                                <input className='inputs-detalhes' type="text"  />
                            </div>
                            
                            <div className='div-TTL-Frete-pagar' >
                                <label className='labels-detalhe' >Total do Frete:</label>
                                <input className='inputs-detalhes' type="text"  />
                            </div>

                            <div className='div-Desconto-pagar' >
                                <label className='labels-detalhe' >Desconto:</label>
                                <input className='inputs-detalhes' type="text"  />
                            </div>

                            <div className='div-Total Apagar-pagar' >
                                <label className='labels-detalhe' >Total Apagar:</label>
                                <input className='inputs-detalhes' type="text"  />
                            </div>

                        </div> 

                         <div className='div-buttons-pagar' >

                            <div className="botoes-container">
                                <button className="btn-cancelar">Cancelar</button>
                                <button className="btn-confirmar">Fazer pedido</button>
                            </div>
                         </div>


                    </div>

                 </div>

            </div>  
        

       </div>
     </div>
  )
}

export default Pagar