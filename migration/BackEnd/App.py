from flask import Flask, request, jsonify
from flask_cors import CORS
import re

# Inicializa o Flask
app = Flask(__name__)
# Habilita CORS para permitir que o frontend React (em outra porta/domínio) se comunique
CORS(app)

# Dicionário para simular o estado da conversa e o idioma selecionado
conversation_state = {}

# --- RESPOSTAS PRONTAS MULTILÍNGUES ---
RESPONSES = {
    "pt": {
        "welcome": "Olá! Sou seu assistente virtual e irei te atender hoje. Qual é a sua dúvida?",
        "status_ask_code": "Claro! Para verificar o status do seu pedido, por favor, digite o **código de rastreio** (ex: BR123456789).",
        "status_in_transit": "Ótima notícia! Seu pedido **[CODIGO]** está em trânsito e a previsão de entrega é de 3 a 5 dias úteis.",
        "status_delivered": "Seu pedido **[CODIGO]** foi entregue com sucesso há 2 dias. Esperamos que tenha gostado!",
        "status_not_found": "Desculpe, não encontrei o pedido com o código **[CODIGO]**. Por favor, verifique se o código está correto e tente novamente.",
        "coupon_info": "Os cupons de desconto são aplicados no carrinho de compras, antes de finalizar o pagamento. Eles só podem ser usados uma vez e não são cumulativos com outras promoções. Verifique as regras de validade na página de promoções!",
        "delivery_estimate": "A estimativa de entrega padrão é de 5 a 10 dias úteis após a confirmação do pagamento. Para uma estimativa mais precisa, verifique o prazo ao inserir seu CEP no carrinho.",
        "fallback": "Desculpe, não entendi sua pergunta. Posso te ajudar com **status de pedidos**, **informações sobre cupons** ou **estimativas de entrega**."
    },
    "en": {
        "welcome": "Hello! I'm your virtual assistant and I'll be assisting you today. What is your question?",
        "status_ask_code": "Sure! To check your order status, please enter the **tracking code** (e.g., BR123456789).",
        "status_in_transit": "Great news! Your order **[CODIGO]** is in transit and is expected to be delivered within 3 to 5 business days.",
        "status_delivered": "Your order **[CODIGO]** was successfully delivered 2 days ago. We hope you enjoyed it!",
        "status_not_found": "Sorry, I couldn't find the order with the code **[CODIGO]**. Please check if the code is correct and try again.",
        "coupon_info": "Discount coupons are applied in the shopping cart before finalizing the payment. They can only be used once and cannot be combined with other promotions. Check the validity rules on the promotions page!",
        "delivery_estimate": "The standard delivery estimate is 5 to 10 business days after payment confirmation. For a more accurate estimate, check the deadline when entering your zip code in the cart.",
        "fallback": "Sorry, I didn't understand your question. I can help you with **order status**, **coupon information**, or **delivery estimates**."
    },
    "es": {
        "welcome": "¡Hola! Soy tu asistente virtual y te atenderé hoy. ¿Cuál es tu pregunta?",
        "status_ask_code": "¡Claro! Para verificar el estado de tu pedido, por favor, ingresa el **código de seguimiento** (ej: BR123456789).",
        "status_in_transit": "¡Buenas noticias! Tu pedido **[CODIGO]** está en tránsito y se espera que se entregue dentro de 3 a 5 días hábiles.",
        "status_delivered": "Tu pedido **[CODIGO]** fue entregado con éxito hace 2 días. ¡Esperamos que lo hayas disfrutado!",
        "status_not_found": "Lo siento, no pude encontrar el pedido con el código **[CODIGO]**. Por favor, verifica si el código es correcto e inténtalo de nuevo.",
        "coupon_info": "Los cupones de descuento se aplican en el carrito de compras antes de finalizar el pago. Solo se pueden usar una vez y no son acumulables con otras promociones. ¡Consulta las reglas de validez en la página de promociones!",
        "delivery_estimate": "La estimación de entrega estándar es de 5 a 10 días hábiles después de la confirmación del pago. Para una estimación más precisa, verifica el plazo al ingresar tu código postal en el carrito.",
        "fallback": "Lo siento, no entendí tu pregunta. Puedo ayudarte con **estado de pedidos**, **información sobre cupones** o **estimaciones de entrega**."
    }
}

def detect_language(message):
    """
    Detecta o idioma com base nas palavras-chave de saudação.
    Retorna o código do idioma ('pt', 'en', 'es') ou None.
    """
    message = message.lower().strip()
    if any(keyword in message for keyword in ["olá", "oi", "bom dia", "boa tarde", "boa noite"]):
        return "pt"
    if any(keyword in message for keyword in ["hello", "hi", "good morning", "good afternoon"]):
        return "en"
    if any(keyword in message for keyword in ["hola", "buenos días", "buenas tardes"]):
        return "es"
    return None

def get_response(user_message, session_id):
    """
    Lógica de regras para determinar a resposta do bot.
    """
    message = user_message.lower().strip()
    
    # 1. Tenta detectar o idioma na primeira mensagem ou usa o idioma da sessão
    lang = conversation_state.get(session_id, {}).get("lang")
    
    if not lang:
        lang = detect_language(message)
        if lang:
            conversation_state[session_id] = {"lang": lang}
        else:
            # Se não detectar, assume Português como padrão
            lang = "pt"
            conversation_state[session_id] = {"lang": lang}

    # Obtém o dicionário de respostas para o idioma selecionado
    lang_responses = RESPONSES.get(lang, RESPONSES["pt"]) # Fallback para PT se o idioma for inválido
    
    # 2. Trata o estado da conversa (se o bot está esperando um código)
    if conversation_state.get(session_id, {}).get("state") == "waiting_for_code":
        # Verifica se a mensagem parece um código de rastreio (ex: letras e números)
        if re.match(r'^[a-z0-9]{6,}$', message):
            # Simulação de verificação de código
            conversation_state[session_id]["state"] = None # Reseta o estado
            
            if "br123" in message:
                return lang_responses["status_delivered"].replace("[CODIGO]", user_message)
            elif "br456" in message:
                return lang_responses["status_in_transit"].replace("[CODIGO]", user_message)
            else:
                return lang_responses["status_not_found"].replace("[CODIGO]", user_message)
        else:
            # Se não for um código, repete o pedido
            return lang_responses["status_ask_code"] # Reutiliza a mensagem de pedir código

    # 3. Trata as palavras-chave
    if any(keyword in message for keyword in ["olá", "oi", "bom dia", "hello", "hi", "hola"]):
        return lang_responses["welcome"]
    
    if any(keyword in message for keyword in ["status", "pedido", "rastreio", "encomenda", "order", "tracking", "estado"]):
        conversation_state[session_id]["state"] = "waiting_for_code"
        return lang_responses["status_ask_code"]

    if any(keyword in message for keyword in ["cupom", "desconto", "voucher", "coupon", "descuento"]):
        return lang_responses["coupon_info"]

    if any(keyword in message for keyword in ["entrega", "prazo", "demora", "tempo", "delivery", "estimate", "entrega", "plazo"]):
        return lang_responses["delivery_estimate"]

    # 4. Resposta padrão (Fallback)
    return lang_responses["fallback"]


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Endpoint da API que recebe a mensagem do usuário e retorna a resposta do bot.
    """
    # 1. Recebe a mensagem do frontend
    try:
        data = request.get_json()
        user_message = data.get('message')
        # Em um sistema real, você usaria um ID de usuário real.
        session_id = "user_session_123" 
    except Exception:
        return jsonify({"response": "Erro: Mensagem inválida."}), 400

    if not user_message:
        return jsonify({"response": "Erro: O campo 'message' está vazio."}), 400

    # 2. Obtém a resposta baseada nas regras
    bot_response = get_response(user_message, session_id)
    
    # 3. Retorna a resposta para o frontend
    return jsonify({"response": bot_response})

if __name__ == '__main__':
    # O servidor irá rodar na porta 5000.
    # Lembre-se de usar a URL: http://localhost:5000/api/chat no seu componente React!
    app.run(debug=True, host='0.0.0.0', port=5000)