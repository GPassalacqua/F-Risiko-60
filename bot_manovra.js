/**
 * BOT_MANOVRA.JS - POTENZIATO
 * Svuota tutte le retrovie verso i confini con maggiore pressione nemica.
 */

window.eseguiManovraBot = function(idBot) {
    window.sottoFaseAttuale = 'fase_manovra';

    let interniConSurplus = [];
    for (let cod in territori) {
        if (territori[cod].proprietario === idBot && territori[cod].armate > 1) {
            let haNemici = territori[cod].confini.some(c => territori[c] && territori[c].proprietario !== idBot);
            if (!haNemici) interniConSurplus.push(cod);
        }
    }

    interniConSurplus.sort((a, b) => territori[b].armate - territori[a].armate);

    // Sposta le truppe da TUTTI i territori interni sicuri verso il confine più minacciato
    interniConSurplus.forEach(origine => {
        let viciniAmici = territori[origine].confini.filter(c => territori[c] && territori[c].proprietario === idBot);
        if (viciniAmici.length > 0) {
            // Valuta quale vicino amico ha più nemici o più armate nemiche attorno
            viciniAmici.sort((a, b) => {
                let minacciaA = territori[a].confini.reduce((somma, v) => 
                    (territori[v] && territori[v].proprietario !== idBot) ? somma + territori[v].armate : somma, 0);
                let minacciaB = territori[b].confini.reduce((somma, v) => 
                    (territori[v] && territori[v].proprietario !== idBot) ? somma + territori[v].armate : somma, 0);
                return minacciaB - minacciaA;
            });

            let destinazione = viciniAmici.at(0);
            let spostate = territori[origine].armate - 1;

            if (spostate > 0) {
                territori[origine].armate = 1;
                territori[destinazione].armate += spostate;

                let gOrig = document.getElementById("armate-num-" + origine);
                let gDest = document.getElementById("armate-num-" + destinazione);
                if (gOrig) gOrig.textContent = 1;
                if (gDest) gDest.textContent = territori[destinazione].armate;
            }
        }
    });

    setTimeout(() => {
        window.passaProssimoGiocatoreRegolamentare();
    }, 600);
};
