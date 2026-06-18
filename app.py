import os
from flask import Flask, request, jsonify
from flask_cors import CORS  # Нужен, чтобы сайт на GitHub Pages мог слать запросы на твой Flask
import requests

app = Flask(__name__)
CORS(app)  # Разрешаем запросы со сторонних сайтов

# Переменные конфигурации (Замени на свои данные)
TELEGRAM_TOKEN = "8677318219:AAFB8pYD0wQGBe8yF2zWlfAMC24UMat6Ma4"
TELEGRAM_CHAT_ID = "1485466486"

@app.route('/api/lead', methods=['POST'])
def handle_lead():
    try:
        # Получаем данные JSON, которые прислал JavaScript с сайта
        data = request.json
        name = data.get('name', 'Не указано')
        phone = data.get('phone', 'Не указано')
        project_type = data.get('project_type', 'Не указано')
        price = data.get('price', 'Не указано')

        # Формируем красивое сообщение для Telegram
        message = (
            f"🔥 **Новая заявка с сайта-портфолио!**\n\n"
            f"👤 **Имя:** {name}\n"
            f"📞 **Контакты:** {phone}\n"
            f"🛠 **Выбранный проект:** {project_type}\n"
            f"💳 **Рассчитанная цена:** {price} ₽"
        )

        # Отправляем запрос в Telegram API
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "Markdown"
        }
        
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            return jsonify({"status": "success", "message": "Заявка успешно отправлена!"}), 200
        else:
            return jsonify({"status": "error", "message": "Ошибка отправки в Telegram"}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Запускаем локально на порту 5000
    app.run(debug=True, port=5000)
