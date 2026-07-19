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
        totalPriceDisplay.textContent = currentPrice.toLocaleString('ru-RU');
    }
}

projectOptions.forEach(radio => radio.addEventListener('change', updateCalculatedPrice));
updateCalculatedPrice();

// 3. Отправка заявки напрямую в Telegram API (без Flask)
if (leadForm) {
    leadForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const clientName = this.querySelector('input[type="text"]').value;
        const clientPhone = this.querySelector('input[type="tel"]').value;

        let projectTitle = "Не выбрано";
        projectOptions.forEach(radio => {
            if (radio.checked) {
                const spanText = radio.parentElement.querySelector('span');
                if (spanText) projectTitle = spanText.textContent;
            }
        });

        const finalCalculatedPrice = totalPriceDisplay ? totalPriceDisplay.textContent : "0";

        const TELEGRAM_TOKEN = "8677318219:AAFB8pYD0wQGBe8yF2zWlfAMC24UMat6Ma4";
        const TELEGRAM_CHAT_ID = "1485466486";

        const message = `🔥 Новая заявка с сайта!\n\n👤 Имя: ${clientName}\n📞 Контакты: ${clientPhone}\n🛠 Проект: ${projectTitle}\n💳 Цена: ${finalCalculatedPrice} ₽`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message
                })
            });

            const result = await response.json();

            if (result.ok) {
                alert('🚀 Успешно! Заявка улетела в Telegram. Скоро свяжусь с вами!');
                this.reset();
                updateCalculatedPrice();
            } else {
                alert('Ошибка Telegram: ' + result.description);
            }
        } catch (error) {
            alert('Ошибка сети: ' + error.message);
        }
    });
}

// 4. Функции открытия и закрытия модальных окон
function openModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
        targetModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 5. Функция инициализации независимых слайдеров внутри карточек и модальных окон
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
            e.preventDefault();
            e.stopPropagation(); // Не закрываем модалку при клике на стрелку
            changeImage(activeIndex + 1);
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            changeImage(activeIndex - 1);
        });
    }
}

// Запускаем слайдеры для всех карточек и модальных окон
initCardSlider('slider-kadrgram');
initCardSlider('slider-cookbook');
initCardSlider('slider-astregion');
initCardSlider('slider-zoo30');

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openedModal = document.querySelector('.modal-overlay.active');
        if (openedModal) closeModal(openedModal.id);
    }
});

// 6. Появление элементов при скролле (лёгкая fade + slide-up анимация)
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// 7. Плавный подсчёт цифр в блоке "Почему выбирают меня"
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = target;
        }
    }
    requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));
