/**
 * BOT_ATTACCO.JS
 * Gestione degli attacchi intelligenti e della prosecuzione offensiva del Bot.
 */

window.avviaFaseAttaccoBot = function(idBot) {
    territorioAttaccanteSelezionato = null;
    territorioDifensoreSelezionato = null;

    // Se ha raggiunto il limite di attacchi del suo umore, passa alla manovra
    if (botAttacchiEffettuati >= botUmoreCorrente.maxAttacchi) {
        window.eseguiManovraBot(idBot);
        return;
    }

    let candidatiAttacco = [];

    for (let cod in territori) {
        if (territori[cod].proprietario === idBot && territori[cod].armate >= 2) {
            let mieArmate = territori[cod].armate;

            for (let conf of territori[cod].confini) {
                if (territori[conf] && territori[conf].proprietario !== idBot) {
                    let sueArmate = territori[conf].armate;
                    let prob = window.calcolaProbVittoriaBot(mieArmate, sueArmate);

                    // Attacca solo se supera la soglia di coraggio del suo umore attuale
                    if (prob >= botUmoreCorrente.sogliaProb) {
                        let score = prob * 100;
                        score += window.valutaImportanzaContinenteBot(conf, idBot) * 1.5;
                        if (sueArmate === 1) score += 15; // Bersaglio facile
                        // Logistica: attacca con priorità i nemici affamati e le Capitali!
                        if (territori[conf].isSazio === false) score += 25; // Vince i pareggi!
                        if (territori[conf].isCapitale) score += 35;        // Obiettivo Capitale!
                        if (territori[cod].isSazio === false) score -= 20;  // Evita di attaccare se affamato
                        if (typeof window.bonusObiettivoBot === "function") score += window.bonusObiettivoBot(conf, idBot);
                        if (typeof window.bonusFortezzePortiBot === "function") score += window.bonusFortezzePortiBot(conf);
                        score += Math.random() * 28;      // Imprevedibilità nella scelta

                        candidatiAttacco.push({ da: cod, a: conf, prob, score });
                    }
                }
            }
        }
    }

    if (candidatiAttacco.length === 0) {
        window.eseguiManovraBot(idBot);
        return;
    }

    candidatiAttacco.sort((a, b) => b.score - a.score);
    let mossa = candidatiAttacco.at(0);

    territorioAttaccanteSelezionato = mossa.da;
    territorioDifensoreSelezionato = mossa.a;
    botAttacchiEffettuati++;

    var areaLog = document.getElementById("log-messages");
    if (areaLog) {
        areaLog.innerHTML = `<b>ATTACCO DI ${proprietari[idBot].nick.toUpperCase()}!</b> (${botUmoreCorrente.nome})<br><br>` +
                            `Attacca da <b style="color:#33FF33;">${mossa.da}</b> (${territori[mossa.da].armate}) ` +
                            `verso <b style="color:#FF3333;">${mossa.a}</b> (${territori[mossa.a].armate})<br>` +
                            `<small>Probabilità stimata: ${(mossa.prob * 100).toFixed(0)}%</small><br><br>` +
                            `<i>Lancio dei dadi in corso...</i>`;
    }

    setTimeout(function() {
        if (typeof window.eseguiBattagliaDadi === "function") {
            window.eseguiBattagliaDadi();
        }
    }, 1200);
};

// Richiamata da game.js subito dopo l'esito del lancio dadi
window.continuaCicloAttaccoBot = function() {
    let att = territorioAttaccanteSelezionato;
    let dif = territorioDifensoreSelezionato;

    // Se il Bot ha appena conquistato il territorio, sposta metà delle armate rimaste
    if (att && dif && territori[dif].proprietario === giocatoreDiTurno && territori[att].armate > 2) {
        let daSpostare = Math.floor((territori[att].armate - 1) / 2);
        if (daSpostare > 0) {
            territori[att].armate -= daSpostare;
            territori[dif].armate += daSpostare;

            let gAtt = document.getElementById("armate-num-" + att);
            let gDif = document.getElementById("armate-num-" + dif);
            if (gAtt) gAtt.textContent = territori[att].armate;
            if (gDif) gDif.textContent = territori[dif].armate;
        }
    }

    territorioAttaccanteSelezionato = null;
    territorioDifensoreSelezionato = null;

    // Decide in base alla sua "furia" se continuare ad attaccare o passare alla manovra
    if (Math.random() <= botUmoreCorrente.furia) {
        setTimeout(() => window.avviaFaseAttaccoBot(giocatoreDiTurno), 700);
    } else {
        window.eseguiManovraBot(giocatoreDiTurno);
    }
};
