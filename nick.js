/**
 * NICK.JS
 */
let nickPartita = [];

function validaEFinisciDigitazione(inputElement, numeroSlot) {
    let valore = inputElement.value.trim();
    const testoDefault = `Robby ${numeroSlot}`;

    if (valore === "") {
        inputElement.value = testoDefault;
        return;
    }

    let lower = valore.toLowerCase();
    if ((lower.includes("robbi") || lower.includes("robby")) && valore !== testoDefault) {
        alert("Non puoi utilizzare il nome riservato ai Bot ('Robby')!");
        inputElement.value = testoDefault;
        setTimeout(() => {
            inputElement.focus();
            inputElement.select();
        }, 10);
    }
}

function pulisciPlaceholder(inputElement, testoDefault) {
    if (inputElement.value === testoDefault || inputElement.value === testoDefault.replace("Robby", "Robbi")) {
        inputElement.value = "";
    }
}

function salvaNickEProcedi() {
    nickPartita = new Array();
    nickPartita.push("Euno");

    for (let i = 1; i <= 6; i++) {
        const inputCasella = document.getElementById(`box${i}`);
        let valore = inputCasella.value.trim();
        let lower = valore.toLowerCase();

        if ((lower.includes("robbi") || lower.includes("robby")) && valore !== `Robby ${i}` && valore !== `Robbi ${i}`) {
            alert(`Errore nello Slot ${i}: Il nome non può contenere "Robby"!`);
            inputCasella.focus();
            return;
        }

        if (valore === "") {
            valore = `Robby ${i}`;
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
