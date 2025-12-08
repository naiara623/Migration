// backend/queue-smart-integration.js
class QueueSmartIntegration {
    constructor(baseURL = 'http://52.72.137.244:3000') {
        this.baseURL = baseURL;
        this.callbackURL = 'http://52.72.137.244:3001/api/smart4-callback';
        this.timeout = 10000; // 10 segundos de timeout
    }

    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            console.log(`🌐 [QueueSmart] Fazendo requisição para: ${this.baseURL}${endpoint}`);
            console.log(`📦 [QueueSmart] Método: ${options.method || 'GET'}`);
            
            if (options.body) {
                console.log(`📤 [QueueSmart] Body:`, JSON.parse(options.body));
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

            console.log(`✅ [QueueSmart] Resposta recebida - Status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ [QueueSmart] Erro HTTP ${response.status}:`, errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log(`📥 [QueueSmart] Resposta JSON:`, data);
            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.error(`⏰ [QueueSmart] Timeout na requisição para: ${endpoint}`);
                throw new Error(`Timeout: A requisição excedeu o tempo limite de ${this.timeout}ms`);
            }

            console.error(`❌ [QueueSmart] Erro na requisição para ${endpoint}:`, error.message);
            
            if (error.code === 'ECONNREFUSED') {
                throw new Error(`Conexão recusada: Verifique se a Queue Smart 4.0 está rodando em ${this.baseURL}`);
            }
            
            if (error.code === 'ENOTFOUND') {
                throw new Error(`Host não encontrado: Não foi possível resolver ${this.baseURL}`);
            }

            throw error;
        }
    }

    // Verificar se a máquina está respondendo
    async verificarConexao() {
        try {
            console.log(`🔍 [QueueSmart] Verificando conexão com a máquina...`);
            
            // Tentar várias rotas para ver qual responde
            const rotasParaTestar = ['/saude', '/fila/status', '/'];
            
            for (const rota of rotasParaTestar) {
                try {
                    console.log(`🔍 [QueueSmart] Testando rota: ${rota}`);
                    const resultado = await this.request(rota, { method: 'GET' });
                    console.log(`✅ [QueueSmart] Rota ${rota} respondeu:`, resultado);
                    return {
                        conectado: true,
                        rotaTestada: rota,
                        resposta: resultado
                    };
                } catch (error) {
                    console.log(`⚠️ [QueueSmart] Rota ${rota} falhou:`, error.message);
                    continue;
                }
            }
            
            throw new Error('Nenhuma das rotas testadas respondeu');
            
        } catch (error) {
            console.error(`❌ [QueueSmart] Falha na verificação de conexão:`, error.message);
            return {
                conectado: false,
                erro: error.message
            };
        }
    }

    // Mapear configurações do produto para parâmetros da máquina
    mapProductToMachineConfig(selections, product, itemIndex = null) {
        console.log(`🎨 [QueueSmart] Mapeando configurações:`, { selections, product, itemIndex });

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

        const config = {
            andares: tamanhoParaAndares[selections.tamanho] || 1,
            materialExterno: corParaMaterial[selections.corFora] || 'PLASTICO_BRANCO',
            materialInterno: corParaMaterial[selections.corDentro] || 'PLASTICO_BRANCO',
            tipoMaterial: materialParaTipo[selections.material] || 'NYLON',
            padrao: estampaParaPadrao[selections.estampa] || 'PADRAO_LISO',
            produtoId: product.id_produto,
            produtoNome: product.nome_produto,
            itemIndex: itemIndex
        };

        console.log(`✅ [QueueSmart] Configuração mapeada:`, config);
        return config;
    }

    // Enviar ITEM INDIVIDUAL para a máquina
    async enviarItemParaMaquina(pedidoData, product, selections, itemIndex, quantidade) {
        try {
            console.log(`🚀 [QueueSmart] Iniciando envio de item para máquina:`, {
                pedidoId: pedidoData.id_pedido,
                produtoId: product.id_produto,
                itemIndex,
                quantidade
            });

            // Primeiro verificar se a máquina está respondendo
            const conexao = await this.verificarConexao();
            if (!conexao.conectado) {
                throw new Error(`Máquina não está respondendo: ${conexao.erro}`);
            }

            const machineConfig = this.mapProductToMachineConfig(selections, product, itemIndex);
            
            // Para cada unidade do produto, criar um item separado na máquina
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

                console.log(`📦 [QueueSmart] Enviando item ${unitNumber}/${quantidade}:`, {
                    orderId: payload.orderId,
                    produto: payload.pedidoInfo.produto_nome,
                    configuracao: machineConfig
                });

                const result = await this.request('/fila/itens', {
                    method: 'POST',
                    body: JSON.stringify({
                        payload: payload,
                        callbackUrl: this.callbackURL
                    })
                });

                console.log(`✅ [QueueSmart] Item ${unitNumber} enviado com sucesso:`, {
                    itemId: result.id,
                    orderId: orderId,
                    resposta: result
                });

                items.push({
                    item_id_maquina: result.id,
                    order_id: orderId,
                    produto_id: product.id_produto,
                    item_index: itemIndex,
                    item_unit: unitNumber,
                    resposta_maquina: result
                });

                // Pequena pausa entre itens para não sobrecarregar a máquina
                if (i < quantidade - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            console.log(`🎉 [QueueSmart] Todos os ${items.length} itens enviados com sucesso`);
            return items;

        } catch (error) {
            console.error('❌ [QueueSmart] Erro ao enviar item para máquina:', {
                pedidoId: pedidoData.id_pedido,
                produtoId: product.id_produto,
                erro: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    // Enviar item SIMPLES para teste rápido
    async enviarItemTeste(pedidoId = 999, userId = 1) {
        try {
            console.log('🧪 [QueueSmart] Enviando item de teste...');

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

            console.log('📤 [QueueSmart] Payload de teste:', payload);

            const result = await this.request('/fila/itens', {
                method: 'POST',
                body: JSON.stringify({
                    payload: payload,
                    callbackUrl: this.callbackURL
                })
            });

            console.log('✅ [QueueSmart] Item de teste enviado com sucesso:', result);
            return result;

        } catch (error) {
            console.error('❌ [QueueSmart] Erro no envio de teste:', error);
            throw error;
        }
    }

    // Verificar status de um item específico
    async verificarStatusItem(itemId) {
        try {
            console.log(`🔍 [QueueSmart] Verificando status do item: ${itemId}`);
            
            const status = await this.request(`/fila/itens/${itemId}`);
            
            console.log(`📊 [QueueSmart] Status do item ${itemId}:`, status);
            return status;

        } catch (error) {
            console.error(`❌ [QueueSmart] Erro ao verificar status do item ${itemId}:`, error);
            throw error;
        }
    }

    // Status geral da máquina
    async statusMaquina() {
        try {
            console.log(`🔧 [QueueSmart] Obtendo status geral da máquina...`);
            
            const status = await this.request('/fila/status');
            
            console.log(`📊 [QueueSmart] Status da máquina:`, status);
            return status;

        } catch (error) {
            console.error('❌ [QueueSmart] Erro ao obter status da máquina:', error);
            throw error;
        }
    }

    // Listar todos os itens na fila
    async listarItensFila(limit = 20) {
        try {
            console.log(`📋 [QueueSmart] Listando itens na fila (limite: ${limit})...`);
            
            const itens = await this.request(`/fila/itens?limit=${limit}`);
            
            console.log(`📦 [QueueSmart] ${itens.items?.length || 0} itens na fila`);
            return itens;

        } catch (error) {
            console.error('❌ [QueueSmart] Erro ao listar itens da fila:', error);
            throw error;
        }
    }

    // Limpar fila (útil para testes)
    async limparFila() {
        try {
            console.log(`🧹 [QueueSmart] Limpando fila...`);
            
            const resultado = await this.request('/fila/limpar', {
                method: 'POST'
            });
            
            console.log(`✅ [QueueSmart] Fila limpa:`, resultado);
            return resultado;

        } catch (error) {
            console.error('❌ [QueueSmart] Erro ao limpar fila:', error);
            throw error;
        }
    }

    // Obter estatísticas da fila
    async estatisticasFila() {
        try {
            console.log(`📈 [QueueSmart] Obtendo estatísticas da fila...`);
            
            // Tentar obter status primeiro
            const status = await this.statusMaquina();
            
            // Tentar listar itens
            const itens = await this.listarItensFila(50);
            
            const estatisticas = {
                status: status,
                totalItens: itens.items?.length || 0,
                itensPendentes: itens.items?.filter(item => item.status !== 'COMPLETED').length || 0,
                itensConcluidos: itens.items?.filter(item => item.status === 'COMPLETED').length || 0,
                timestamp: new Date().toISOString()
            };
            
            console.log(`📊 [QueueSmart] Estatísticas:`, estatisticas);
            return estatisticas;

        } catch (error) {
            console.error('❌ [QueueSmart] Erro ao obter estatísticas:', error);
            throw error;
        }
    }
}

module.exports = QueueSmartIntegration;