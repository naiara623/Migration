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

    // MAPEAR SELEÇÕES PARA CONFIGURAÇÃO DE BLOCO
    mapSelectionsToBlocoConfig(selections, blocoNumero) {
        console.log(`🔄 Mapeando configurações para bloco ${blocoNumero}:`, selections);
        
        // Verifica diferentes formatos de entrada
        let blocoConfig = {};
        
        // Formato 1: Objeto direto (ex: selections.bloco1, selections.bloco2)
        const blocoKey = `bloco${blocoNumero}`;
        if (selections[blocoKey]) {
            blocoConfig = {
                cor: selections[blocoKey].cor || '',
                lamina1: selections[blocoKey].lamina1 || '',
                lamina2: selections[blocoKey].lamina2 || '',
                lamina3: selections[blocoKey].lamina3 || '',
                padrao1: selections[blocoKey].padrao1 || '',
                padrao2: selections[blocoKey].padrao2 || '',
                padrao3: selections[blocoKey].padrao3 || ''
            };
        } 
        // Formato 2: Nomes de colunas individuais (ex: cor1, l1_1, p1_1)
        else {
            const prefix = blocoNumero.toString();
            blocoConfig = {
                cor: selections[`cor${prefix}`] || selections[`cor${blocoNumero}`] || '',
                lamina1: selections[`l${prefix}_1`] || selections[`l${blocoNumero}_1`] || '',
                lamina2: selections[`l${prefix}_2`] || selections[`l${blocoNumero}_2`] || '',
                lamina3: selections[`l${prefix}_3`] || selections[`l${blocoNumero}_3`] || '',
                padrao1: selections[`p${prefix}_1`] || selections[`p${blocoNumero}_1`] || '',
                padrao2: selections[`p${prefix}_2`] || selections[`p${blocoNumero}_2`] || '',
                padrao3: selections[`p${prefix}_3`] || selections[`p${blocoNumero}_3`] || ''
            };
        }
        
        console.log(`✅ Configuração do bloco ${blocoNumero}:`, blocoConfig);
        return blocoConfig;
    }

    // MAPEAR PRODUTO PARA CONFIGURAÇÃO DA MÁQUINA (ATUALIZADO)
    mapProductToMachineConfig(selections, product, itemIndex = null) {
        console.log('🔄 Mapeando produto para configuração da máquina:', { selections, product });
        
        const caixaConfig = {
            codigoProduto: product.id_produto,
            bloco1: this.mapSelectionsToBlocoConfig(selections, 1),
            bloco2: this.mapSelectionsToBlocoConfig(selections, 2),
            bloco3: this.mapSelectionsToBlocoConfig(selections, 3)
        };
        
        const config = {
            caixa: caixaConfig,
            produtoId: product.id_produto,
            produtoNome: product.nome_produto,
            sku: product.sku || product.id_produto.toString(),
            itemIndex: itemIndex,
            timestamp: new Date().toISOString()
        };
        
        console.log('✅ Configuração final para máquina:', config);
        return config;
    }

    // ENVIAR ITEM PARA MÁQUINA (VERSÃO AVANÇADA - ATUALIZADA)
    async enviarItemParaMaquina(pedidoData, product, selections, itemIndex, quantidade) {
        try {
            console.log(`🚀 Enviando item para máquina:`, {
                pedido: pedidoData.id_pedido,
                produto: product.nome_produto,
                itemIndex,
                quantidade
            });

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
                        configuracoes: selections,
                        caixaConfig: machineConfig.caixa
                    }
                };

                console.log(`📤 Enviando payload para máquina:`, payload);

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

                console.log(`✅ Item ${unitNumber}/${quantidade} enviado com sucesso`);

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

    // ENVIAR ITEM DE TESTE (ATUALIZADO)
    async enviarItemTeste(pedidoId = 999, userId = 1) {
        try {
            console.log('🧪 Enviando item de teste...');
            
            const payload = {
                orderId: `TEST-${Date.now()}`,
                sku: "123",
                configuracao: {
                    caixa: {
                        codigoProduto: 999,
                        bloco1: {
                            cor: "Azul",
                            lamina1: "Lamina-A1",
                            lamina2: "Lamina-A2",
                            lamina3: "Lamina-A3",
                            padrao1: "Padrao-A1",
                            padrao2: "Padrao-A2",
                            padrao3: "Padrao-A3"
                        },
                        bloco2: {
                            cor: "Vermelho",
                            lamina1: "Lamina-B1",
                            lamina2: "Lamina-B2",
                            lamina3: "Lamina-B3",
                            padrao1: "Padrao-B1",
                            padrao2: "Padrao-B2",
                            padrao3: "Padrao-B3"
                        },
                        bloco3: {
                            cor: "Verde",
                            lamina1: "Lamina-C1",
                            lamina2: "Lamina-C2",
                            lamina3: "Lamina-C3",
                            padrao1: "Padrao-C1",
                            padrao2: "Padrao-C2",
                            padrao3: "Padrao-C3"
                        }
                    },
                    produtoId: 999,
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

            console.log('📤 Payload de teste:', payload);

            const result = await this.request('/fila/itens', {
                method: 'POST',
                body: JSON.stringify({
                    payload: payload,
                    callbackUrl: this.callbackURL
                })
            });

            console.log('✅ Item de teste enviado com sucesso:', result);
            return result;

        } catch (error) {
            console.error('❌ [QueueSmartAvancado] Erro no envio de teste:', error);
            throw error;
        }
    }

    // CONSULTAR STATUS DE UM ITEM
    async statusItem(idItem) {
        return await this.request(`/fila/itens/${idItem}`);
    }

    // STATUS DA MÁQUINA
    async statusMaquina() {
        return await this.request('/fila/status');
    }

    // LISTAR FILA
    async listarFila(limit = 20) {
        return await this.request(`/fila/itens?limit=${limit}`);
    }

    // LIMPAR FILA
    async limparFila() {
        return await this.request('/fila/limpar', {
            method: 'POST'
        });
    }

    // PROCESSAR CALLBACK
    static processarCallback(body) {
        return {
            orderId: body.orderId,
            itemId: body.idItem,
            status: body.status,
            etapa: body.etapa,
            slot: body.slot,
            porcentagem: body.progresso,
            dadosCaixa: body.dadosCaixa || null,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = QueueSmartIntegrationAvancado;