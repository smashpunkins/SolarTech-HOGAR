// --- Función para las tarjetas de beneficios ---
function toggleCard(card) {
    const activeCards = document.querySelectorAll('.benefit-card.active');
    activeCards.forEach(activeCard => {
        if (activeCard !== card) activeCard.classList.remove('active');
    });
    card.classList.toggle('active');
}

// =================================================================================
// CÓDIGO PARA ENVIAR DATOS A GOOGLE SHEETS
// =================================================================================

// ▼▼▼ IMPORTANTE: PEGA AQUÍ TU URL REAL QUE COPIASTE DE GOOGLE (DEBE TERMINAR EN /exec) ▼▼▼
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJST7O1DF7Hw11YgvZOuBLP-HTUfgaNOwBq1EWtb_azYczupR9mhkYKbkAfWzMVcx9fQ/exec';
// ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// --- Lógica del FORMULARIO PRINCIPAL ---
const mainForm = document.getElementById('main-quote-form');

mainForm.addEventListener('submit', function(event) {
    event.preventDefault(); 

    const button = mainForm.querySelector('button');
    const formData = new FormData(mainForm);
    const email = formData.get('Email');

    if (!formData.get('Nombre') || !formData.get('Telefono') || !email) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Por favor, introduce un correo electrónico válido.');
        return;
    }

    button.textContent = 'ENVIANDO...';
    button.disabled = true;
    formData.append('TipoContacto', 'Formulario Completo');

    // USAMOS 'no-cors' PARA EVITAR EL ERROR FALSO DE "NO HAY INTERNET"
    fetch(GOOGLE_SCRIPT_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: formData 
    })
    .then(() => {
        // Con 'no-cors' el navegador no puede leer la respuesta, 
        // así que asumimos que llegó bien (Google casi nunca falla).
        alert(`¡Gracias, ${formData.get('Nombre')}! Tu cotización ha sido recibida.`);
        mainForm.reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar. Verifica tu URL de Google o tu conexión.');
    })
    .finally(() => {
        button.textContent = 'ENVIAR DATOS';
        button.disabled = false;
    });
});


// --- Lógica para el Pop-up (Modal) ---
const openModalButtons = document.querySelectorAll('.open-modal-btn');
const closeModalButton = document.querySelector('.close-btn');
const modalOverlay = document.getElementById('quick-contact-modal');
const sendModalButton = document.getElementById('modal-send-btn');

function openModal() { if (modalOverlay) modalOverlay.classList.add('active'); }
function closeModal() { if (modalOverlay) modalOverlay.classList.remove('active'); }

openModalButtons.forEach(button => button.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

if (sendModalButton) {
    sendModalButton.addEventListener('click', () => {
        const nameInput = document.getElementById('modal-name');
        const phoneInput = document.getElementById('modal-phone');
        const formData = new FormData();

        if (nameInput.value.trim() === '' || phoneInput.value.trim() === '') {
            alert('Por favor, completa tu nombre y teléfono.');
            return;
        }

        formData.append('Nombre', nameInput.value);
        formData.append('Telefono', phoneInput.value);
        formData.append('TipoContacto', 'Pop-up Rápido');

        sendModalButton.textContent = 'ENVIANDO...';
        sendModalButton.disabled = true;

        fetch(GOOGLE_SCRIPT_URL, { 
            method: 'POST', 
            mode: 'no-cors', 
            body: formData 
        })
        .then(() => {
            alert(`¡Gracias, ${nameInput.value}! Te llamaremos pronto.`);
            closeModal();
            nameInput.value = '';
            phoneInput.value = '';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión.');
        })
        .finally(() => {
            sendModalButton.textContent = 'QUIERO QUE ME LLAMEN';
            sendModalButton.disabled = false;
        });
    });
}