// backend/queue-smart-integration.js
class QueueSmartIntegration {
    constructor(baseURL = 'http://localhost:3000') {
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
    mapProductToMachineConfig(selections, product, itemIndex = null) {
        const tamanhoParaAndares = {
            'P': 1, 'M': 2, 'G': 3
        };

        const corParaMaterial = {
            'Azul': 'PLASTICO_AZUL', 'Vermelho': 'PLASTICO_VERMELHO',
            'Verde': 'PLASTICO_VERDE', 'Amarelo': 'PLASTICO_AMARELO',
            'Preto': 'PLASTICO_PRETO', 'Branco': 'PLASTICO_BRANCO'
        };

        const estampaParaPadrao = {
            'Nuvem': 'PADRAO_NUVENS', 'Estrelas': 'PADRAO_ESTRELAS',
            'Lua': 'PADRAO_LUA', 'SemEstampa': 'PADRAO_LISO'
        };

        return {
            andares: tamanhoParaAndares[selections.tamanho] || 1,
            materialExterno: corParaMaterial[selections.corFora] || 'PLASTICO_BRANCO',
            materialInterno: corParaMaterial[selections.corDentro] || 'PLASTICO_BRANCO',
            tipoMaterial: selections.material === 'Poliester' ? 'POLIESTER' : 'NYLON',
            padrao: estampaParaPadrao[selections.estampa] || 'PADRAO_LISO',
            produtoId: product.id_produto,
            produtoNome: product.nome_produto,
            itemIndex: itemIndex // Para identificar qual item do pedido é este
        };
    }

    // Enviar ITEM INDIVIDUAL para a máquina
    async enviarItemParaMaquina(pedidoData, product, selections, itemIndex, quantidade) {
        try {
            const machineConfig = this.mapProductToMachineConfig(selections, product, itemIndex);
            
            // Para cada unidade do produto, criar um item separado na máquina
            const items = [];
            
            for (let i = 0; i < quantidade; i++) {
                const payload = {
                    orderId: `PED-${pedidoData.id_pedido}-ITEM-${itemIndex}-${i + 1}`,
                    sku: product.id_produto.toString(),
                    configuracao: machineConfig,
                    pedidoInfo: {
                        id_pedido: pedidoData.id_pedido,
                        id_usuario: pedidoData.idusuarios,
                        total: pedidoData.total,
                        item_index: itemIndex,
                        item_unit: i + 1
                    }
                };

                console.log(`📦 Enviando item ${i + 1}/${quantidade} para Queue Smart 4.0:`, payload);

                const result = await this.request('/fila/itens', {
                    method: 'POST',
                    body: JSON.stringify({
                        payload: payload,
                        callbackUrl: this.callbackURL
                    })
                });

                items.push({
                    item_id_maquina: result.id,
                    order_id: payload.orderId,
                    produto_id: product.id_produto,
                    item_index: itemIndex,
                    item_unit: i + 1
                });

                console.log(`✅ Item ${i + 1} enviado para máquina. ID:`, result.id);
            }

            return items;

        } catch (error) {
            console.error('❌ Erro ao enviar item para máquina:', error);
            throw error;
        }
    }

    // Verificar status de um item específico
    async verificarStatusItem(itemId) {
        try {
            const status = await this.request(`/fila/itens/${itemId}`);
            return status;
        } catch (error) {
            console.error('Erro ao verificar status do item:', error);
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

    // Listar todos os itens na fila
    async listarItensFila(limit = 50) {
        try {
            const itens = await this.request(`/fila/itens?limit=${limit}`);
            return itens;
        } catch (error) {
            console.error('Erro ao listar itens da fila:', error);
            throw error;
        }
    }
}

module.exports = QueueSmartIntegration;