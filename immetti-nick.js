// Array globale per i nickname della partita
let nickPartita = [];

/**
 * Controlla il testo inserito quando l'utente finisce di digitare (al blur o con Invio)
 */
function validaEFinisciDigitazione(inputElement, numeroSlot) {
    let valore = inputElement.value.trim();
    const testoDefault = `Robbi ${numeroSlot}`;

    // Se il valore è vuoto, ripristina semplicemente il placeholder di default
    if (valore === "") {
        inputElement.value = testoDefault;
        return;
    }

    // Se l'utente ha scritto qualcosa che contiene "robbi" (escluso il testo di default stesso)
    if (valore.toLowerCase().includes("robbi") && valore !== testoDefault) {
        alert("Non puoi utilizzare il nome 'Robbi'!");
        
        // Ripristina immediatamente il testo predefinito "Robbi X"
        inputElement.value = testoDefault;
        
        // Riporta il cursore all'interno della casella per riprendere la digitazione
        setTimeout(() => {
            inputElement.focus();
            inputElement.select(); // Seleziona il testo per permettere di riscrivere sopra subito
        }, 10);
    }
}

function pulisciPlaceholder(inputElement, testoDefault) {
    if (inputElement.value === testoDefault) {
        inputElement.value = "";
    }
}

function salvaNickEProcedi() {
    nickPartita = [];
    
    // REGOLA: La posizione 0 contiene solo ed esclusivamente "Euno"
    nickPartita[0] = "Euno";

    for (let i = 1; i <= 6; i++) {
        const inputCasella = document.getElementById(`box${i}`);
        let valore = inputCasella.value.trim();

        // Controllo finale di sicurezza prima di iniziare la partita
        if (valore.toLowerCase().includes("robbi") && valore !== `Robbi ${i}`) {
            alert(`Errore nello Slot ${i}: Il nome non può contenere "Robbi"!`);
            inputCasella.focus();
            return;
        }

        if (valore === "") {
            valore = `Robbi ${i}`;
            inputCasella.value = valore;
        }
        nickPartita[i] = valore;
    }

    sbloccaColonnaSinistra();
}

function sbloccaColonnaSinistra() {
    const elementiSinistra = document.querySelectorAll('.nascondi-fase-nick');
    elementiSinistra.forEach(elemento => {
        elemento.classList.remove('nascondi-fase-nick');
    });

    document.getElementById("btn-conferma-nick").style.display = "none";
}
