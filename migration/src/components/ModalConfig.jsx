import React, { useState } from "react";
import "./ModalConfig.css";

export default function ModalConfig({ isOpen, onClose, onAddCarrinho }) {
  if (!isOpen) return null;

  const [config, setConfig] = useState({
    corFora: "",
    corDentro: "",
    tamanho: "",
    estampa: "",
    material: ""
  });

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    console.log("Configuração escolhida:", config);
    onAddCarrinho(config); // manda os dados pra cima
    onClose(); // fecha modal
  };

  return (
    <div className="modal-mudar" onClick={onClose}>
      <div className="modal-containe0r" onClick={(e) => e.stopPropagation()}>
        <div className="esquerda">
            <div className="fotoProduto">

<div className="preco">
    <h1 className="preço1">R$ 299.90</h1>
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
  <h1 className="NomeProduct">Mochila Viagem Pro</h1>
</div>

            </div>
              <div className="DescriçãoProduto">
                <div className="Descrição">

                 <h4 className="DescricaoOfi">Mochila resistente e espaçosa, feita em tecido impermeável de alta durabilidade, ideal para longas viagens. Possui vários compartimentos organizadores, incluindo bolso acolchoado exclusivo para notebook, espaço para roupas e divisórias internas para acessórios.</h4>
                </div>
              </div>

              <div className="buu-oi">
                <div className="Mudancas1"></div>

                <div className="Mudancas">
                  <div className="conteiner-mudanças">

                    <div className="inp2uts">
                      <label className="buti">Tamanho:</label>
                   <div className="radio-input">
        <input type="radio" id="value-1" name="value-radio" defaultValue="value-1" />
        <div className="circle">
        </div> 
        <input defaultChecked type="radio" id="value-2" name="value-radio" defaultValue="value-2" />
        <div className="circle">
        </div> 
        <input type="radio" id="value-3" name="value-radio" defaultValue="value-3" />
        <div className="circle">
        </div>
      </div>
                    </div>

                      <div className="inp2ut3s">
                      <div className="label">

                        <label className="buti">Cor de fora:</label>
</div>

<div className="oibu">
                      <input className="color4" type="radio" name="corDentro"/>
                      <input className="color5" type="radio" name="corDentro"/>
                      <input className="color6" type="radio" name="corDentro"/> 
                      <input className="color7" type="radio" name="corDentro"/>
                      <input className="color8" type="radio" name="corDentro"/>
                      <input className="color9" type="radio" name="corDentro"/>

</div>
                     

                    
                      </div>

                    <div className="inp2ut3s">
                      <div className="label">

                        <label className="buti">Cor de fora:</label>
</div>

<div className="oibu">
                      <input className="color10" type="radio" name="corFora"/>
                      <input className="color11" type="radio" name="corFora"/>
                      <input className="color12" type="radio" name="corFora"/> 
                      <input className="color13" type="radio" name="corFora"/>
                      <input className="color14" type="radio" name="corFora"/>
                      <input className="color15" type="radio" name="corFora"/>

</div>
                     

                    
                      </div>
                      

                    <div className="inp2uts">
                      <label className="buti">Material:</label>
                       <div className="oibu">
                      <input className="color1" type="radio" name="material"/>
                      <label>Poliester</label>
                      <input className="color2" type="radio" name="material"/>
                      <label>Nylon</label>


</div>
                    </div>

                    
<div className="inp2uts">
                      <label className="buti">Estampas:</label>
                      <input type="text"  className="TamanhoMala"/>
                    </div>

                  
                  </div>
                </div>

                <div className="avaliacoes">
                  <div className="conteiner-avaliacoes">
                    <div className="fot-user1"><img className="Fto1" src="FotoPerfil.jpg" alt="Foto de perfil" />
                    <h3 className="User1">Naiara.RS</h3></div>

                    <div className="Estrelas3">
                      <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                      <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                      <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                      <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                      <img className="estrelass" src="Star.png" alt="Estrelas avaliatorias" />
                    </div>

                    <div className="Escritas1">
                      <h4 className="EscritaAvalia"> Gostei bastante da mala, super duradora e veio do jeito que eu pedi</h4>
                    </div>
                    
                  </div>

                  <div className="Buton-carrinho">
                    <button className="buton-carrinho2">Adicionar ao carrinho</button>
                  </div>
                </div>
              </div>
            
        </div>
       
      </div>
    </div>
  );
}
