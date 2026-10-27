const COOLDOWN_KEY = "suggestionLastSentAt";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
let sendingSuggestion = false;

function getCooldownRemaining() {
    const lastSentAt = Number(localStorage.getItem(COOLDOWN_KEY));

    if (!Number.isFinite(lastSentAt) || lastSentAt <= 0) {
        return 0;
    }

    return Math.max(0, lastSentAt + COOLDOWN_MS - Date.now());
}

function updateCooldownButton() {
    const boton = document.getElementById("enviar");
    if (!boton) {
        return;
    }

    const tiempoRestante = getCooldownRemaining();
    boton.disabled = sendingSuggestion || tiempoRestante > 0;

    if (tiempoRestante > 0) {
        setTimeout(updateCooldownButton, tiempoRestante);
    }
}

function cooldown() {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
    updateCooldownButton();
}

async function enviarSugerencia(event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const sugerencia = document.getElementById("sugerencia").value.trim();

    if (!titulo || !sugerencia) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    if (sendingSuggestion || getCooldownRemaining() > 0) {
        alert("Solo puedes enviar una sugerencia cada 24 horas.");
        updateCooldownButton();
        return;
    }

    sendingSuggestion = true;
    updateCooldownButton();

    try {
        const respuesta = await fetch("https://ntfy.sh/mywebpage4857", {
            method: "POST",
            body: sugerencia,
            headers: {
                Title: titulo,
                Priority: "5",
                Tags: "warning,skull"
            }
        });

        if (!respuesta.ok) {
            throw new Error(`El servidor respondió con el estado ${respuesta.status}.`);
        }

        cooldown();
        alert("Sugerencia enviada correctamente.");
    } catch (error) {
        console.error("No se pudo enviar la sugerencia:", error);
        alert("No se pudo enviar la sugerencia. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
        sendingSuggestion = false;
        updateCooldownButton();
    }
}

updateCooldownButton();
