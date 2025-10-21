import React, { useState } from "react";

import "./ModalConfig.css";

export default function ModalConfig({ onClose, isOpen, product, onAddCarrinho }) {
  if (!isOpen || !product) return null;

  // Estado para armazenar as seleções do usuário
  const [selections, setSelections] = useState({
    tamanho: 'M', // valor padrão
    corDentro: '',
    corFora: '',
    material: 'Nylon', // valor padrão
    estampa: ''
  });

  // Função para atualizar as seleções
  const handleSelectionChange = (type, value) => {
    setSelections(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAddToCart = async (product) => {
  try {
    // Verificar se usuário está logado
    const userCheck = await fetch('http://localhost:3001/api/usuario-atual', {
      credentials: 'include'
    });
    
    if (!userCheck.ok) {
      alert("Você precisa estar logado para adicionar ao carrinho.");
      return;
    }

    const response = await fetch('http://localhost:3001/api/carrinho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        id_produto: product.id_produto,
        quantidade: 1,
        tamanho: product.tamanho || '',
        cor: product.cor || ''
      }),
    });

    if (response.ok) {
      alert('Produto adicionado ao carrinho!');
      if (onClose) onClose();
    } else {
      const errorData = await response.json();
      alert(errorData.erro || 'Erro ao adicionar ao carrinho');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao adicionar ao carrinho');
  }
};

  return (
    <div className="modal-mudar" onClick={onClose}>
      <div className="modal-containe0r" onClick={(e) => e.stopPropagation()}>
        <div className="esquerda">
          <div className="fotoProduto">
            <img 
              className="ProdutoFot" 
              src={product.imagem_url || "image 99.png"} 
              alt={product.nome_produto} 
            />
            
            <div className="preco">
              <h1 className="preço1">R$ {product.valor_produto}</h1>
            </div>

            <div className="gostei">
              <img className="curti" src="Love.png" alt="Adicionar aos favoritos" />
            </div>
          </div>
        </div>

        <div className="meio"></div>

        <div className="direita"> 
          <div className="NomeProduto1">
            <div className="NomeProduto">
              <h1 className="NomeProduct">{product.nome_produto}</h1>
            </div>
          </div>
          
          <div className="DescriçãoProduto">
            <div className="Descrição">
              <h4 className="DescricaoOfi">{product.descricao}</h4>
            </div>
          </div>

          <div className="buu-oi">
            <div className="Mudancas1"></div>

            <div className="Mudancas">
              <div className="conteiner-mudanças">
                {/* Tamanho */}
                <div className="inp2uts">
                  <label className="buti">Tamanho:</label>
                  <div className="radio-input">
                    <input 
                      type="radio" 
                      id="value-1" 
                      name="Tamanho" 
                      value="P" 
                      checked={selections.tamanho === 'P'}
                      onChange={() => handleSelectionChange('tamanho', 'P')}
                    />
                    <div className="circle"></div> 
                    <label className="labelinput">P</label>
                    
                    <input 
                      type="radio" 
                      id="value-2" 
                      name="Tamanho" 
                      value="M" 
                      checked={selections.tamanho === 'M'}
                      onChange={() => handleSelectionChange('tamanho', 'M')}
                    />
                    <div className="circle"></div> 
                    <label className="labelinput">M</label>
                    
                    <input 
                      type="radio" 
                      id="value-3" 
                      name="Tamanho" 
                      value="G" 
                      checked={selections.tamanho === 'G'}
                      onChange={() => handleSelectionChange('tamanho', 'G')}
                    />
                    <div className="circle"></div> 
                    <label className="labelinput">G</label>
                  </div>
                </div>

                {/* Cores */}
                <div className="inp2ut3s">
                  <div className="label">
                    <label className="buti">Cor de Dentro:</label>
                  </div>
                  <div className="oibu">
                    <input 
                      className="color4" 
                      type="radio" 
                      name="corDentro" 
                      value="Azul"
                      onChange={() => handleSelectionChange('corDentro', 'Azul')}
                    />
                    <input 
                      className="color5" 
                      type="radio" 
                      name="corDentro" 
                      value="Vermelho"
                      onChange={() => handleSelectionChange('corDentro', 'Vermelho')}
                    />
                    <input 
                      className="color6" 
                      type="radio" 
                      name="corDentro" 
                      value="Verde"
                      onChange={() => handleSelectionChange('corDentro', 'Verde')}
                    /> 
                    <input 
                      className="color7" 
                      type="radio" 
                      name="corDentro" 
                      value="Amarelo"
                      onChange={() => handleSelectionChange('corDentro', 'Amarelo')}
                    />
                    <input 
                      className="color8" 
                      type="radio" 
                      name="corDentro" 
                      value="Preto"
                      onChange={() => handleSelectionChange('corDentro', 'Preto')}
                    />
                    <input 
                      className="color9" 
                      type="radio" 
                      name="corDentro" 
                      value="Branco"
                      onChange={() => handleSelectionChange('corDentro', 'Branco')}
                    />
                  </div>
                </div>

                <div className="inp2ut3s">
                  <div className="label">
                    <label className="buti">Cor de fora:</label>
                  </div>
                  <div className="oibu">
                    <input 
                      className="color10" 
                      type="radio" 
                      name="corFora" 
                      value="Azul"
                      onChange={() => handleSelectionChange('corFora', 'Azul')}
                    />
                    <input 
                      className="color11" 
                      type="radio" 
                      name="corFora" 
                      value="Vermelho"
                      onChange={() => handleSelectionChange('corFora', 'Vermelho')}
                    />
                    <input 
                      className="color12" 
                      type="radio" 
                      name="corFora" 
                      value="Verde"
                      onChange={() => handleSelectionChange('corFora', 'Verde')}
                    /> 
                    <input 
                      className="color13" 
                      type="radio" 
                      name="corFora" 
                      value="Amarelo"
                      onChange={() => handleSelectionChange('corFora', 'Amarelo')}
                    />
                    <input 
                      className="color14" 
                      type="radio" 
                      name="corFora" 
                      value="Preto"
                      onChange={() => handleSelectionChange('corFora', 'Preto')}
                    />
                    <input 
                      className="color15" 
                      type="radio" 
                      name="corFora" 
                      value="Branco"
                      onChange={() => handleSelectionChange('corFora', 'Branco')}
                    />
                  </div>
                </div>

                {/* Material */}
                <div className="inp2uts">
                  <label className="buti">Material:</label>
                  <div className="radio-input">
                    <input 
                      type="radio" 
                      id="material-1" 
                      name="Material" 
                      value="Poliester" 
                      checked={selections.material === 'Poliester'}
                      onChange={() => handleSelectionChange('material', 'Poliester')}
                    />
                    <div className="circle"></div> 
                    <label className="labelinput">Poliester</label>
                    
                    <input 
                      type="radio" 
                      id="material-2" 
                      name="Material" 
                      value="Nylon" 
                      checked={selections.material === 'Nylon'}
                      onChange={() => handleSelectionChange('material', 'Nylon')}
                    />
                    <div className="circle"></div> 
                    <label className="labelinput">Nylon</label>
                  </div>
                </div>

                {/* Estampas */}
                <div className="inp2uts">
                  <label className="buti">Estampas:</label>
                  <div className="oibu">
                    <label className="Nuvem">
                      <input 
                        className="Nuvemoi" 
                        type="radio" 
                        name="estampa" 
                        value="Nuvem"
                        checked={selections.estampa === 'Nuvem'}
                        onChange={() => handleSelectionChange('estampa', 'Nuvem')}
                      />
                    </label>
                    
                    <div className="radio1">
                      <input 
                        type="radio" 
                        name="estampa" 
                        id="rating-1" 
                        value="Estrelas"
                        checked={selections.estampa === 'Estrelas'}
                        onChange={() => handleSelectionChange('estampa', 'Estrelas')}
                      />
                      <label title="1 stars" htmlFor="rating-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                          <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                        </svg>
                      </label>
                    </div>

                    <label>
                      <input 
                        className="luaoi" 
                        type="radio" 
                        id="estampa-bolinhas" 
                        name="estampa" 
                        value="Lua"
                        checked={selections.estampa === 'Lua'}
                        onChange={() => handleSelectionChange('estampa', 'Lua')}
                      />
                    </label>

                    <input 
                      className="colorsem" 
                      type="radio" 
                      name="estampa" 
                      value="SemEstampa"
                      checked={selections.estampa === 'SemEstampa'}
                      onChange={() => handleSelectionChange('estampa', 'SemEstampa')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="avaliacoes">
              {/* Avaliações */}
              <div className="conteiner-avaliacoes">
                <div className="fot-user1">
                  <img className="Fto1" src="FotoPerfil.jpg" alt="Foto de perfil" />
                  <h3 className="User1">Naiara.RS</h3>
                </div>

                <div className="Estrelas3">
                  <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                  <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                  <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                  <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                  <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                </div>

                <div className="Escritas1">
                  <h4 className="EscritaAvalia">Gostei bastante da mala, super duradora e veio do jeito que eu pedi</h4>
                </div>
              </div>

              <div className="Buton-carrinho">
                <button className="buton-carrinho2" onClick={handleAddToCart}>
                  Adicionar ao carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}