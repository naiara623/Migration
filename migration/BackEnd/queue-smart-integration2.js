// backend/queue-smart-integration-avancado.js
const fetch = require("node-fetch");

class QueueSmartIntegrationAvancado {
    constructor(baseURL = 'http://52.72.137.244:3000') {
        this.baseURL = baseURL;
        this.callbackURL = 'http://52.72.137.244:3001/api/smart4-callback';
        this.timeout = 10000;
    }

    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            console.log(`🌐 [QueueSmartAvancado] Fazendo requisição para: ${this.baseURL}${endpoint}`);
            
            if (options.body) {
                console.log(`📤 [QueueSmartAvancado] Body:`, JSON.parse(options.body));
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                signal: controller.signal,
                ...options,
            });

            clearTimeout(timeoutId);

            console.log(`✅ [QueueSmartAvancado] Resposta recebida - Status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ [QueueSmartAvancado] Erro HTTP ${response.status}:`, errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log(`📥 [QueueSmartAvancado] Resposta JSON:`, data);
            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.error(`⏰ [QueueSmartAvancado] Timeout na requisição para: ${endpoint}`);
                throw new Error(`Timeout: A requisição excedeu o tempo limite de ${this.timeout}ms`);
            }

            console.error(`❌ [QueueSmartAvancado] Erro na requisição para ${endpoint}:`, error.message);
            throw error;
        }
    }

    // VERIFICAR CONEXÃO COM MAIS DETALHES
    async verificarConexao() {
        try {
            console.log(`🔍 [QueueSmartAvancado] Verificando conexão com a máquina...`);
            
            const rotasParaTestar = ['/saude', '/fila/status', '/'];
            
            for (const rota of rotasParaTestar) {
                try {
                    const resultado = await this.request(rota, { method: 'GET' });
                    console.log(`✅ [QueueSmartAvancado] Rota ${rota} respondeu`);
                    return {
                        conectado: true,
                        rotaTestada: rota,
                        resposta: resultado
                    };
                } catch (error) {
                    continue;
                }
            }
            
            throw new Error('Nenhuma das rotas testadas respondeu');
            
        } catch (error) {
            return {
                conectado: false,
                erro: error.message
            };
        }
    }

    // MAPEAR PRODUTO PARA CONFIGURAÇÃO DA MÁQUINA (VERSÃO AVANÇADA)
    mapProductToMachineConfig(selections, product, itemIndex = null) {
        const tamanhoParaAndares = {
            'P': 1, 'M': 2, 'G': 3, 'PP': 1, 'GG': 3
        };

        const corParaMaterial = {
            'Azul': 'PLASTICO_AZUL', 
            'Vermelho': 'PLASTICO_VERMELHO',
            'Verde': 'PLASTICO_VERDE', 
            'Amarelo': 'PLASTICO_AMARELO',
            'Preto': 'PLASTICO_PRETO', 
            'Branco': 'PLASTICO_BRANCO',
            'Rosa': 'PLASTICO_ROSA',
            'Roxo': 'PLASTICO_ROXO'
        };

        const estampaParaPadrao = {
            'Nuvem': 'PADRAO_NUVENS', 
            'Estrelas': 'PADRAO_ESTRELAS',
            'Lua': 'PADRAO_LUA', 
            'Sol': 'PADRAO_SOL',
            'SemEstampa': 'PADRAO_LISO',
            'Listras': 'PADRAO_LISTRAS',
            'Bolinhas': 'PADRAO_BOLINHAS'
        };

        const materialParaTipo = {
            'Poliester': 'POLIESTER', 
            'Nylon': 'NYLON',
            'Algodão': 'ALGODAO',
            'Seda': 'SEDA'
        };

        return {
            andares: tamanhoParaAndares[selections.tamanho] || 1,
            materialExterno: corParaMaterial[selections.corFora] || 'PLASTICO_BRANCO',
            materialInterno: corParaMaterial[selections.corDentro] || 'PLASTICO_BRANCO',
            tipoMaterial: materialParaTipo[selections.material] || 'NYLON',
            padrao: estampaParaPadrao[selections.estampa] || 'PADRAO_LISO',
            produtoId: product.id_produto,
            produtoNome: product.nome_produto,
            itemIndex: itemIndex
        };
    }

    // ENVIAR ITEM PARA MÁQUINA (VERSÃO AVANÇADA)
    async enviarItemParaMaquina(pedidoData, product, selections, itemIndex, quantidade) {
        try {
            const conexao = await this.verificarConexao();
            if (!conexao.conectado) {
                throw new Error(`Máquina não está respondendo: ${conexao.erro}`);
            }

            const machineConfig = this.mapProductToMachineConfig(selections, product, itemIndex);
            const items = [];
            
            for (let i = 0; i < quantidade; i++) {
                const unitNumber = i + 1;
                const orderId = `PED-${pedidoData.id_pedido}-ITEM-${itemIndex}-${unitNumber}`;
                
                const payload = {
                    orderId: orderId,
                    sku: product.id_produto.toString(),
                    configuracao: machineConfig,
                    pedidoInfo: {
                        id_pedido: pedidoData.id_pedido,
                        id_usuario: pedidoData.idusuarios,
                        total: pedidoData.total,
                        item_index: itemIndex,
                        item_unit: unitNumber,
                        produto_nome: product.nome_produto,
                        configuracoes: selections
                    }
                };

                const result = await this.request('/fila/itens', {
                    method: 'POST',
                    body: JSON.stringify({
                        payload: payload,
                        callbackUrl: this.callbackURL
                    })
                });

                items.push({
                    item_id_maquina: result.id,
                    order_id: orderId,
                    produto_id: product.id_produto,
                    item_index: itemIndex,
                    item_unit: unitNumber,
                    resposta_maquina: result
                });

                if (i < quantidade - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            return items;

        } catch (error) {
            console.error('❌ [QueueSmartAvancado] Erro ao enviar item:', error);
            throw error;
        }
    }

    // ENVIAR ITEM DE TESTE
    async enviarItemTeste(pedidoId = 999, userId = 1) {
        try {
            const payload = {
                orderId: `TEST-${Date.now()}`,
                sku: "123",
                configuracao: {
                    andares: 2,
                    materialExterno: "PLASTICO_AZUL",
                    materialInterno: "PLASTICO_BRANCO",
                    tipoMaterial: "NYLON",
                    padrao: "PADRAO_ESTRELAS",
                    produtoId: 1,
                    produtoNome: "Produto Teste"
                },
                pedidoInfo: {
                    id_pedido: pedidoId,
                    id_usuario: userId,
                    total: 99.99,
                    item_index: 0,
                    item_unit: 1,
                    produto_nome: "Produto Teste"
                }
            };

            const result = await this.request('/fila/itens', {
                method: 'POST',
                body: JSON.stringify({
                    payload: payload,
                    callbackUrl: this.callbackURL
                })
            });

            return result;

        } catch (error) {
            console.error('❌ [QueueSmartAvancado] Erro no envio de teste:', error);
            throw error;
        }
    }
}

module.exports = QueueSmartIntegrationAvancado;