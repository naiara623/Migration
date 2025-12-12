// backend/queue-smart-integration.js - VERSÃO CORRETA
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

    // MAPEAR CONFIG -> CAIXA (PARA PRODUTOS PERSONALIZADOS)
    mapToCaixa(product, selections) {
        return {
            codigoProduto: product.id_produto,
            bloco1: {
                cor: selections.cor1,
                lamina1: selections.l1_1,
                lamina2: selections.l1_2,
                lamina3: selections.l1_3,
                padrao1: selections.p1_1,
                padrao2: selections.p1_2,
                padrao3: selections.p1_3
            },
            bloco2: {
                cor: selections.cor2,
                lamina1: selections.l2_1,
                lamina2: selections.l2_2,
                lamina3: selections.l2_3,
                padrao1: selections.p2_1,
                padrao2: selections.p2_2,
                padrao3: selections.p2_3
            },
            bloco3: {
                cor: selections.cor3,
                lamina1: selections.l3_1,
                lamina2: selections.l3_2,
                lamina3: selections.l3_3,
                padrao1: selections.p3_1,
                padrao2: selections.p3_2,
                padrao3: selections.p3_3
            }
        };
    }

    // ENVIAR ITEM (VERSÃO SIMPLES)
    async enviarItem(orderId, product, selections) {
        const caixa = this.mapToCaixa(product, selections);

        const payload = {
            orderId,
            sku: product.sku || "KIT",
            caixa
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

    // CALLBACK RECEBIDO DA MÁQUINA
    static processarCallback(body) {
        return {
            orderId: body.orderId,
            itemId: body.idItem,
            status: body.status,
            etapa: body.etapa,
            slot: body.slot,
            porcentagem: body.progresso
        };
    }
}

module.exports = QueueSmartIntegration;