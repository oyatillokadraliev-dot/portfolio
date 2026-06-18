// 1. Находим элементы калькулятора и формы на странице строго по одному разу
const projectOptions = document.querySelectorAll('input[name="project-type"]');
const totalPriceDisplay = document.getElementById('total-price');
const leadForm = document.getElementById('tg-form');

// 2. Функция точного подсчета стоимости для всех новых тарифов
function updateCalculatedPrice() {
    let currentPrice = 0;
    
    projectOptions.forEach(radio => {
        if (radio.checked) {
            currentPrice = parseInt(radio.value);
        }
    });

    if (totalPriceDisplay) {
        // Форматируем число с разделением тысяч (например, 4 900)
        totalPriceDisplay.textContent = currentPrice.toLocaleString('ru-RU');
    }
}

// Навешиваем событие изменения на каждую плашку прайс-листа
projectOptions.forEach(radio => radio.addEventListener('change', updateCalculatedPrice));

// Вызываем функцию один раз при загрузке, чтобы отобразить стартовую цену (4 900)
updateCalculatedPrice();

// 3. Отправка формы на правильный и полный адрес бэкенда Flask
if (leadForm) {
    leadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Собираем имя и контакты клиента из полей ввода
        const clientName = this.querySelector('input[type="text"]').value;
        const clientPhone = this.querySelector('input[type="tel"]').value;
        
        let projectTitle = "Не выбрано";
        projectOptions.forEach(radio => {
            if (radio.checked) {
                // Извлекаем точный текст выбранной услуги из плашки
                const spanText = radio.parentElement.querySelector('span');
                if (spanText) projectTitle = spanText.textContent;
            }
        });
        
        const finalCalculatedPrice = totalPriceDisplay ? totalPriceDisplay.textContent : "0";
        
const BACKEND_URL = 'http://127.0.0.1:5000/api/lead';

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: clientName,
                    phone: clientPhone,
                    project_type: projectTitle,
                    price: finalCalculatedPrice
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('🚀 Успешно! Заявка улетела Али в Telegram. Скоро я свяжусь с вами!');
                this.reset();
            } else {
                alert('Ошибка сервера Flask: ' + result.message);
            }
        } catch (error) {
            console.error('Ошибка отправки запроса на бэкенд:', error);
            alert('Не удалось связаться со скрытым сервером. Пожалуйста, убедитесь, что в Терминале VS Code запущен Flask командой python app.py');
        }
    });
}
// Функция инициализации независимых слайдеров на карточках
function initCardSlider(sliderId) {
    const container = document.getElementById(sliderId);
    if (!container) return;

    const prevBtn = container.querySelector('.prev-btn');
    const nextBtn = container.querySelector('.next-btn');
    const images = container.querySelectorAll('.slider-track .project-img');
    let activeIndex = 0;

    function changeImage(nextIndex) {
        images[activeIndex].classList.remove('active');
        activeIndex = (nextIndex + images.length) % images.length;
        images[activeIndex].classList.add('active');
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Предотвращаем переход по ссылкам карточки
            changeImage(activeIndex + 1);
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            changeImage(activeIndex - 1);
        });
    }
}

// Запускаем слайдеры для обоих проектов
initCardSlider('slider-kadrgram');
initCardSlider('slider-cookbook');
// Функции открытия и закрытия модальных окон
function openModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Отключаем фоновый скролл
    }
}

function closeModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.classList.remove('active');
        document.body.style.overflow = ''; // Возвращаем скролл
    }
}

// Закрытие модалки при нажатии на клавишу Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openedModal = document.querySelector('.modal-overlay.active');
        if (openedModal) closeModal(openedModal.id);
    }
});
