const fetch = require("node-fetch");

class QueueSmartIntegration {
    constructor(baseURL = 'http://52.72.137.244:3000') {
        this.baseURL = baseURL;
        this.callbackURL = 'http://52.72.137.244:3001/api/smart4-callback';
        this.timeout = 10000;
    }

    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${text}`);
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // VERIFICAR CONEXÃO
    async verificarConexao() {
        try {
            return await this.request('/fila/status');
        } catch {
            return { conectado: false };
        }
    }

    // NOVA FUNÇÃO: MAPEAR CONFIGURAÇÕES DA TABELA PARA BLOCO DE CONFIGURAÇÃO
    mapSelectionsToBlocoConfig(selections, blocoNumero) {
        // Verifica se existe um bloco específico ou usa valores padrão
        const blocoKey = `bloco${blocoNumero}`;
        
        // Verifica se temos configurações específicas para este bloco
        if (selections[blocoKey]) {
            const bloco = selections[blocoKey];
            return {
                cor: bloco.cor || '',
                lamina1: bloco.lamina1 || '',
                lamina2: bloco.lamina2 || '',
                lamina3: bloco.lamina3 || '',
                padrao1: bloco.padrao1 || '',
                padrao2: bloco.padrao2 || '',
                padrao3: bloco.padrao3 || ''
            };
        }
        
        // Se não houver bloco específico, verifica se temos configurações gerais
        // que correspondam ao padrão de nomes de colunas da tabela
        const prefix = blocoNumero.toString();
        return {
            cor: selections[`cor${prefix}`] || selections.cor || '',
            lamina1: selections[`l${prefix}_1`] || selections.lamina1 || '',
            lamina2: selections[`l${prefix}_2`] || selections.lamina2 || '',
            lamina3: selections[`l${prefix}_3`] || selections.lamina3 || '',
            padrao1: selections[`p${prefix}_1`] || selections.padrao1 || '',
            padrao2: selections[`p${prefix}_2`] || selections.padrao2 || '',
            padrao3: selections[`p${prefix}_3`] || selections.padrao3 || ''
        };
    }

    // MAPEAR CONFIG -> CAIXA (ATUALIZADO PARA NOVA ESTRUTURA)
    mapToCaixa(product, selections) {
        return {
            codigoProduto: product.id_produto,
            bloco1: this.mapSelectionsToBlocoConfig(selections, 1),
            bloco2: this.mapSelectionsToBlocoConfig(selections, 2),
            bloco3: this.mapSelectionsToBlocoConfig(selections, 3)
        };
    }

    // ENVIAR ITEM (VERSÃO SIMPLES - ATUALIZADA)
    async enviarItem(orderId, product, selections) {
        const caixa = this.mapToCaixa(product, selections);

        const payload = {
            orderId,
            sku: product.sku || "KIT",
            caixa,
            // Incluir metadados adicionais se necessário
            produtoInfo: {
                nome: product.nome_produto,
                descricao: product.descricao
            }
        };

        return await this.request('/fila/itens', {
            method: 'POST',
            body: JSON.stringify({
                payload,
                callbackUrl: this.callbackURL
            })
        });
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

    // ENVIAR ITEM DE TESTE
    async enviarItemTeste() {
        const produtoTeste = {
            id_produto: 999,
            nome_produto: "Produto Teste",
            sku: "TEST-001"
        };

        const configuracaoTeste = {
            bloco1: {
                cor: "Azul",
                lamina1: "L1",
                lamina2: "L2",
                lamina3: "L3",
                padrao1: "P1",
                padrao2: "P2",
                padrao3: "P3"
            },
            bloco2: {
                cor: "Vermelho",
                lamina1: "L1",
                lamina2: "L2",
                lamina3: "L3",
                padrao1: "P1",
                padrao2: "P2",
                padrao3: "P3"
            },
            bloco3: {
                cor: "Verde",
                lamina1: "L1",
                lamina2: "L2",
                lamina3: "L3",
                padrao1: "P1",
                padrao2: "P2",
                padrao3: "P3"
            }
        };

        const orderId = `TEST-${Date.now()}`;

        return await this.enviarItem(orderId, produtoTeste, configuracaoTeste);
    }

    // CALLBACK RECEBIDO DA MÁQUINA
    static processarCallback(body) {
        return {
            orderId: body.orderId,
            itemId: body.idItem,
            status: body.status,
            etapa: body.etapa,
            slot: body.slot,
            porcentagem: body.progresso,
            dadosCaixa: body.dadosCaixa || null
        };
    }
}

module.exports = QueueSmartIntegration;