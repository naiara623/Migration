// backend/queue-smart-integration.js
class QueueSmartIntegration {
    constructor(baseURL = 'http://localhost:3000') { // URL da Queue Smart 4.0
        this.baseURL = baseURL;
        this.callbackURL = 'http://localhost:3001/api/smart4-callback';
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Queue Smart API Error:', error);
            throw error;
        }
    }

    // Mapear configurações do produto para parâmetros da máquina
    mapProductToMachineConfig(selections, product) {
        // Mapeamento de tamanhos para andares da caixa
        const tamanhoParaAndares = {
            'P': 1,  // Pequeno = 1 andar
            'M': 2,  // Médio = 2 andares  
            'G': 3   // Grande = 3 andares
        };

        // Mapeamento de cores para tipos de material
        const corParaMaterial = {
            'Azul': 'PLASTICO_AZUL',
            'Vermelho': 'PLASTICO_VERMELHO',
            'Verde': 'PLASTICO_VERDE',
            'Amarelo': 'PLASTICO_AMARELO',
            'Preto': 'PLASTICO_PRETO',
            'Branco': 'PLASTICO_BRANCO'
        };

        // Mapeamento de estampas para padrões
        const estampaParaPadrao = {
            'Nuvem': 'PADRAO_NUVENS',
            'Estrelas': 'PADRAO_ESTRELAS',
            'Lua': 'PADRAO_LUA',
            'SemEstampa': 'PADRAO_LISO'
        };

        return {
            andares: tamanhoParaAndares[selections.tamanho] || 1,
            materialExterno: corParaMaterial[selections.corFora] || 'PLASTICO_BRANCO',
            materialInterno: corParaMaterial[selections.corDentro] || 'PLASTICO_BRANCO',
            tipoMaterial: selections.material === 'Poliester' ? 'POLIESTER' : 'NYLON',
            padrao: estampaParaPadrao[selections.estampa] || 'PADRAO_LISO',
            produtoId: product.id_produto,
            produtoNome: product.nome_produto
        };
    }

    // Enviar pedido para a máquina
    async enviarPedidoParaMaquina(pedidoData, product, selections) {
        try {
            const machineConfig = this.mapProductToMachineConfig(selections, product);
            
            const payload = {
                orderId: `PED-${pedidoData.id_pedido}-${Date.now()}`,
                sku: product.id_produto.toString(),
                configuracao: machineConfig,
                pedidoInfo: {
                    id_pedido: pedidoData.id_pedido,
                    id_usuario: pedidoData.idusuarios,
                    total: pedidoData.total
                }
            };

            console.log('📦 Enviando pedido para Queue Smart 4.0:', payload);

            const result = await this.request('/fila/itens', {
                method: 'POST',
                body: JSON.stringify({
                    payload: payload,
                    callbackUrl: this.callbackURL
                })
            });

            console.log('✅ Pedido enviado para máquina. ID:', result.id);
            return result;

        } catch (error) {
            console.error('❌ Erro ao enviar pedido para máquina:', error);
            throw error;
        }
    }

    // Verificar status do pedido na máquina
    async verificarStatusPedido(itemId) {
        try {
            const status = await this.request(`/fila/itens/${itemId}`);
            return status;
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            throw error;
        }
    }

    // Obter posição na fila
    async obterPosicaoFila(itemId) {
        try {
            const posicao = await this.request(`/fila/itens/${itemId}/posicao`);
            return posicao;
        } catch (error) {
            console.error('Erro ao obter posição:', error);
            throw error;
        }
    }

    // Status geral da máquina
    async statusMaquina() {
        try {
            const status = await this.request('/fila/status');
            return status;
        } catch (error) {
            console.error('Erro ao obter status da máquina:', error);
            throw error;
        }
    }
}

module.exports = QueueSmartIntegration;