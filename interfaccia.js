/**
 * INTERFACCIA.JS - PARTE 1
 */

window.onload = function() {
    inizializzaMappaVisiva();
};

function inizializzaMappaVisiva() {
    if (typeof territori === 'undefined' || typeof proprietari === 'undefined') return;

    for (let codice in territori) {
        let infoTerritorio = territori[codice];
        let idProprietario = infoTerritorio.proprietario;
        let coloreConfigurato = proprietari[idProprietario].colore;

        let elementoPath = document.getElementById(codice);
        if (elementoPath) {
            elementoPath.setAttribute("fill", coloreConfigurato);
            elementoPath.style.fill = coloreConfigurato;

            let gruppoInfo = document.querySelector(`[data-target="${codice}"]`);
            if (gruppoInfo) {
                try {
                    let boundingBox = elementoPath.getBBox();
                    let centroX = boundingBox.x + (boundingBox.width / 2);
                    let centroY = boundingBox.y + (boundingBox.height / 2);
                    let dx = parseFloat(gruppoInfo.getAttribute("data-dx")) || 0;
                    let dy = parseFloat(gruppoInfo.getAttribute("data-dy")) || 0;
                    gruppoInfo.setAttribute("transform", `translate(${centroX + dx}, ${centroY + dy}) scale(1, -1)`);
                } catch (e) {}
            }
        }

        let elementoArmate = document.getElementById("armate-num-" + codice);
        if (elementoArmate) elementoArmate.textContent = infoTerritorio.armate;
    }
}
/**
 * INTERFACCIA.JS - PARTE 2
 */

function iniziaGioco() {
    for (let i = 1; i <= 6; i++) {
        let inputNick = document.getElementById("box" + i);
        if (inputNick && inputNick.value.trim() !== "") {
            proprietari[i].nick = inputNick.value.trim();
        }
    }

    let setupArea = document.getElementById("setup-area");
    let gameArea = document.getElementById("game-area");

    if (setupArea) {
        setupArea.classList.add("hidden");
        setupArea.style.display = "none";
    }
    if (gameArea) {
        gameArea.classList.remove("hidden");
        gameArea.style.display = "block";
    }

    let pannelloLaterale = document.getElementById("side-panel");
    if (pannelloLaterale) {
        pannelloLaterale.style.backgroundColor = proprietari[giocatoreDiTurno].colore; 
    }

    let areaLog = document.getElementById("log-messages");
    if (areaLog) {
        areaLog.innerHTML = `Partita Iniziata!<br>&Egrave; il turno di: <b>${proprietari[giocatoreDiTurno].nick}</b>`;
    }

    inizializzaPartita(); 
}

function eseguiPiazzamentoUniversale(idGiocatore, codiceTerritorio) {
    let dati = territori[codiceTerritorio];
    dati.armate = (dati.armate || 0) + 1;
    
    if (faseGioco === 'setup_armate') {
        riservaArmateBonus[idGiocatore] -= 1;
    } else {
        rinforziDisponibiliTurno -= 1;
    }
    
    let elementoArmate = document.getElementById("armate-num-" + codiceTerritorio);
    if (elementoArmate) elementoArmate.textContent = dati.armate;
}

function passaProssimoGiocatoreSetup() {
    giocatoreDiTurno++;
    if (giocatoreDiTurno > 6) {
        giocatoreDiTurno = 1; 
        faseGioco = 'gioco';  

        var setupArea = document.getElementById("setup-area");
        var gameArea = document.getElementById("game-area");
        if (setupArea) setupArea.style.display = "none";
        if (gameArea) {
            gameArea.classList.remove("hidden");
            gameArea.style.display = "block";
        }

        if (typeof window.avviaTurnoRegolamentare === "function") {
            window.avviaTurnoRegolamentare();
        }
    } else {
        aggiornaInterfacciaFaseBonus();
        if (window.isGiocatoreBot(giocatoreDiTurno)) {
            setTimeout(function() {
                eseguiPiazzamentoAutomaticoBot(giocatoreDiTurno);
            }, 500);
        }
    }
}
/**
 * INTERFACCIA.JS - PARTE 3
 */

function eseguiPiazzamentoAutomaticoBot(idBot) {
    let territoriDelBot = [];
    for (let tId in territori) {
        if (territori[tId].proprietario === idBot) territoriDelBot.push(tId);
    }

    if (territoriDelBot.length === 0) {
        passaProssimoGiocatoreSetup();
        return;
    }

    while (riservaArmateBonus[idBot] > 0) {
        let territorioCasuale = territoriDelBot[Math.floor(Math.random() * territoriDelBot.length)];
        eseguiPiazzamentoUniversale(idBot, territorioCasuale);
    }
    passaProssimoGiocatoreSetup();
}

function aggiornaInterfacciaFaseBonus() {
    if (faseGioco === 'gioco') return;

    let pannelloLaterale = document.getElementById("side-panel");
    if (pannelloLaterale && proprietari[giocatoreDiTurno]) {
        pannelloLaterale.style.backgroundColor = proprietari[giocatoreDiTurno].colore;
    }

    let areaLog = document.getElementById("log-messages");
    if (areaLog) {
        let armateRimaste = riservaArmateBonus[giocatoreDiTurno];
        if (!window.isGiocatoreBot(giocatoreDiTurno)) {
            areaLog.innerHTML = `Fase Rinforzi Iniziali!<br>&Egrave; il turno di: <b>${proprietari[giocatoreDiTurno].nick}</b><br>` +
                                `Hai <b>${armateRimaste}</b> armate bonus da distribuire sui tuoi 3 territori.<br>` +
                                `<i>Clicca su uno dei tuoi territori colorati per aggiungere un'armata.</i>`;
        } else {
            areaLog.innerHTML = `Fase Rinforzi Iniziali!<br>&Egrave; il turno di: <b>${proprietari[giocatoreDiTurno].nick}</b><br>` +
                                `Il computer sta distribuendo le sue <b>${armateRimaste}</b> armate iniziali...<br><i>Attendere prego...</i>`;
        }
    }
}

function aggiornaInterfacciaPartitaReale() {
    let pannelloLaterale = document.getElementById("side-panel");
    if (pannelloLaterale && proprietari[giocatoreDiTurno]) {
        pannelloLaterale.style.backgroundColor = proprietari[giocatoreDiTurno].colore;
    }

    let areaLog = document.getElementById("log-messages");
    if (areaLog) {
        if (!window.isGiocatoreBot(giocatoreDiTurno)) {
            areaLog.innerHTML = `<b>Fase Rinforzi di Turno</b><br><br>Tocca a te: <b>${proprietari[giocatoreDiTurno].nick}</b><br><br>` +
                                `Hai <b>${rinforziDisponibiliTurno}</b> armate di rinforzo da distribuire.<br><br><i>Clicca su un tuo territorio colorato.</i>`;
        } else {
            areaLog.innerHTML = `<b>Fase Rinforzi di Turno</b><br><br>Tocca al computer: <b>${proprietari[giocatoreDiTurno].nick}</b><br><br>` +
                                `Sto calcolando le mosse di rinforzo...<br><br><i>Attendere prego...</i>`;
        }
    }
}

window.selezionaTerritorio = function(codice) {
    var tempoAttuale = Date.now();
    if (typeof window.ultimoClicTempo !== 'undefined' && (tempoAttuale - window.ultimoClicTempo < 250)) return;
    window.ultimoClicTempo = tempoAttuale;

    if (typeof territori === 'undefined' || !territori[codice] || window.isGiocatoreBot(giocatoreDiTurno)) return;
    
    let dati = territori[codice];
    
    if (faseGioco === 'setup_armate') {
        if (dati.proprietario === giocatoreDiTurno) {
            if (typeof riservaArmateBonus !== 'undefined' && riservaArmateBonus[giocatoreDiTurno] > 0) {
                eseguiPiazzamentoUniversale(giocatoreDiTurno, codice);
                if (riservaArmateBonus[giocatoreDiTurno] === 0) passaProssimoGiocatoreSetup();
                else aggiornaInterfacciaFaseBonus();
            }
        } else {
            let areaLog = document.getElementById("log-messages");
            if (areaLog) areaLog.innerHTML += `<br><span style="color:#FF3333; font-weight:bold;">&times; Puoi rinforzare solo i tuoi territori colorati!</span>`;
        }
    } else {
        if (window.sottoFaseAttuale === 'fase_rinforzi') {
            if (dati.proprietario === giocatoreDiTurno && rinforziDisponibiliTurno > 0) {
                eseguiPiazzamentoUniversale(giocatoreDiTurno, codice);
                if (typeof window.piazzaRinforzoRegolamentareSuTerritorio === 'function') window.piazzaRinforzoRegolamentareSuTerritorio(codice, true); 
            } else if (dati.proprietario !== giocatoreDiTurno) {
                let areaLog = document.getElementById("log-messages");
                if (areaLog) areaLog.innerHTML += `<br><span style="color:#FF3333; font-weight:bold;">&times; Puoi mettere i rinforzi solo sui tuoi territori colorati!</span>`;
            }
        } 
        else if (window.sottoFaseAttuale === 'fase_attacco' && typeof window.gestisciClicFaseAttacco === 'function') {
            window.gestisciClicFaseAttacco(codice);
        }
        else if (window.sottoFaseAttuale === 'fase_manovra' && typeof window.gestisciClicFaseManovra === 'function') {
            window.gestisciClicFaseManovra(codice);
        }
    }
};
