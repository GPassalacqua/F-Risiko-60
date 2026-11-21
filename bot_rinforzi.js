/**
 * BOT_RINFORZI.JS - POTENZIATO
 */

window.eseguiRinforziBot = function(idBot) {
    let territoriDelBot = [];
    let conteggioCont = { "Oceania": 0, "SudAmerica": 0, "Europa": 0, "Africa": 0, "NordAmerica": 0, "Asia": 0 };

    for (var cod in territori) {
        if (territori[cod] && territori[cod].proprietario === idBot) {
            territoriDelBot.push(cod);
            let cont = territori[cod].continente;
            if (conteggioCont[cont] !== undefined) conteggioCont[cont]++;
        }
    }

    if (territoriDelBot.length === 0) {
        window.passaProssimoGiocatoreRegolamentare();
        return;
    }

    botUmoreCorrente = UMORI_BOT[Math.floor(Math.random() * UMORI_BOT.length)];
    botAttacchiEffettuati = 0;

    let base = Math.max(3, 3 + Math.floor((territoriDelBot.length - 3) / 2));
    let bonus = 0;
    for (let c in configurazioneContinenti) {
        if (conteggioCont[c] === configurazioneContinenti[c].totale) {
            bonus += configurazioneContinenti[c].bonus;
        }
    }
    let truppeSpettanti = base + bonus;

    // Se il Bot ha appena perso la Capitale, è in PANICO (riceve metà rinforzi per 1 turno)
    if (window.giocatoreInPanico && window.giocatoreInPanico[idBot]) {
        truppeSpettanti = Math.max(1, Math.floor(truppeSpettanti / 2));
        window.giocatoreInPanico[idBot] = false; // Il panico dura 1 solo turno
    }

    var areaLog = document.getElementById("log-messages");
    if (areaLog) {
        areaLog.innerHTML = `<b>Turno di ${proprietari[idBot].nick}</b><br>` +
                            `<span style="color:#FFFF33;">Atteggiamento: <b>${botUmoreCorrente.nome}</b></span><br><br>` +
                            `Sta distribuendo <b>${truppeSpettanti}</b> armate sui confini...`;
    }

    function piazzaUnRinforzo(rimanenti) {
        if (rimanenti <= 0) {
            window.sottoFaseAttuale = 'fase_attacco';
            setTimeout(() => window.avviaFaseAttaccoBot(idBot), 800);
            return;
        }

        let frontiere = territoriDelBot.filter(c => 
            territori[c].confini.some(vic => territori[vic] && territori[vic].proprietario !== idBot)
        );
        if (frontiere.length === 0) frontiere = territoriDelBot;

        let valutazioni = frontiere.map(c => {
            let score = 0;
            let maxNemico = 0;
            let mioCont = territori[c].continente;
            let possiedoInteroCont = (conteggioCont[mioCont] === configurazioneContinenti[mioCont].totale);

            territori[c].confini.forEach(vic => {
                if (territori[vic] && territori[vic].proprietario !== idBot) {
                    if (territori[vic].armate > maxNemico) maxNemico = territori[vic].armate;
                    if (territori[vic].armate <= 2) score += 12;

                    // Bonus altissimo se questo confine tocca l'ULTIMO territorio mancante di un continente!
                    let contVicino = territori[vic].continente;
                    let mancanti = configurazioneContinenti[contVicino].totale - conteggioCont[contVicino];
                    if (mancanti === 1) score += 45;
                }
            });

            // Difesa prioritaria dei continenti già conquistati
            if (possiedoInteroCont && maxNemico >= territori[c].armate) {
                score += (maxNemico - territori[c].armate + 2) * 10;
            } else if (territori[c].armate < maxNemico) {
                score += (maxNemico - territori[c].armate) * 6;
            }

            if (typeof window.valutaImportanzaContinenteBot === "function") {
                score += window.valutaImportanzaContinenteBot(c, idBot) * botUmoreCorrente.focusContinente;
            }
            if (typeof window.bonusObiettivoBot === "function") {
                score += window.bonusObiettivoBot(c, idBot);
            }

            score += Math.random() * 10;
            // Difende la propria Capitale se è al fronte, ed evita di ammassare truppe dove c'è fame
            if (territori[c].isCapitale) score += 25;
            if (territori[c].isSazio === false) score -= 35;
            

            return { c, score };
        });

        valutazioni.sort((a, b) => b.score - a.score);
        let scelto = valutazioni.at(0).c;

        territori[scelto].armate += 1;
        let elArmate = document.getElementById("armate-num-" + scelto);
        if (elArmate) elArmate.textContent = territori[scelto].armate;

        setTimeout(() => piazzaUnRinforzo(rimanenti - 1), 200);
    }

    piazzaUnRinforzo(truppeSpettanti);
};
