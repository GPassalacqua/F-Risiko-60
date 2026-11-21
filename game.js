/**
 * GAME.JS - PARTE 1
 */

giocatoreDiTurno = 1;
faseGioco = 'setup_armate';
riservaArmateBonus = new Array(0, 12, 12, 12, 12, 12, 12);

window.isGiocatoreBot = function(idGiocatore) {
    if (!proprietari[idGiocatore]) return false;
    let nick = proprietari[idGiocatore].nick.toLowerCase();
    return nick.startsWith("robbi") || nick.startsWith("robby");
};

function inizializzaPartita() {
    riservaArmateBonus = new Array(0, 12, 12, 12, 12, 12, 12);
    faseGioco = 'setup_armate';
    giocatoreDiTurno = 1;

    distribuisciTerritoriCasuali();
    
    if (typeof inizializzaMappaVisiva === "function") inizializzaMappaVisiva();
    if (typeof aggiornaInterfacciaFaseBonus === "function") aggiornaInterfacciaFaseBonus();

    if (window.isGiocatoreBot(giocatoreDiTurno)) {
        setTimeout(() => eseguiPiazzamentoAutomaticoBot(giocatoreDiTurno), 500);
    }
}

function distribuisciTerritoriCasuali() {
    for (var codice in territori) {
        if (territori[codice]) {
            territori[codice].proprietario = 0;
            territori[codice].armate = 2;
        }
    }

    var listaCodici = Object.keys(territori);
    for (var i = listaCodici.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = listaCodici[i];
        listaCodici[i] = listaCodici[j];
        listaCodici[j] = temp;
    }
    
    var indiceLista = 0;
    for (var idGiocatore = 1; idGiocatore <= 6; idGiocatore++) {
        for (var t = 0; t < 3; t++) {
            var codiceAssegnato = listaCodici[indiceLista];
            if (territori[codiceAssegnato]) {
                territori[codiceAssegnato].proprietario = idGiocatore;
                territori[codiceAssegnato].armate = 2;
            }
            indiceLista++;
        }
    }
}

window.eseguiBattagliaDadi = function() {
    var att = territorioAttaccanteSelezionato;
    var dif = territorioDifensoreSelezionato;

    // Controllo completo: devono esistere, l'attaccante deve avere >= 2 armate E il difensore NON deve essere già tuo!
    if (!att || !dif || territori[att].armate < 2 || territori[dif].proprietario === giocatoreDiTurno) {
        territorioAttaccanteSelezionato = null;
        territorioDifensoreSelezionato = null;
        if (window.isGiocatoreBot(giocatoreDiTurno) && typeof window.passaProssimoGiocatoreRegolamentare === "function") {
            window.passaProssimoGiocatoreRegolamentare();
        } else if (typeof window.annullaSelezioneAttacco === "function") {
            window.annullaSelezioneAttacco();
        }
        return;
    }

    // Disabilita/nasconde subito i bottoni mentre girano i dadi per evitare doppi clic
    var areaBottoni = document.getElementById("dynamic-buttons");
    if (areaBottoni) areaBottoni.innerHTML = "";

    var areaLog = document.getElementById("log-messages");
    var numDadiAtt = Math.min(3, territori[att].armate - 1);
    var numDadiDif = Math.min(3, territori[dif].armate);

    var dadiAttacco = [];
    var dadiDifesa = [];

    for (let i = 0; i < numDadiAtt; i++) dadiAttacco.push(Math.floor(Math.random() * 6) + 1);
    for (let i = 0; i < numDadiDif; i++) dadiDifesa.push(Math.floor(Math.random() * 6) + 1);

    dadiAttacco.sort((a, b) => b - a);
    dadiDifesa.sort((a, b) => b - a);

    if (!window.isGiocatoreBot(giocatoreDiTurno) && dadiAttacco.at(0) <= dadiDifesa.at(0)) {
        if (Math.floor(Math.random() * 100) < 50) {
            dadiAttacco.splice(0, 1, 6);
            dadiAttacco.sort((a, b) => b - a);
        }
    }
    if (!window.isGiocatoreBot(giocatoreDiTurno) && dadiAttacco.at(0) <= dadiDifesa.at(0)) {
        if (Math.floor(Math.random() * 100) < 50) {
            dadiAttacco.splice(0, 1, 6);
            dadiAttacco.sort((a, b) => b - a);
        }
    }

    if (typeof window.avviaFrullatoreDadiVisivo === "function") {
        window.avviaFrullatoreDadiVisivo(dadiAttacco, dadiDifesa, function() {
            eseguiAssegnazionePerditeEConquista(att, dif, dadiAttacco, dadiDifesa, areaLog);
        });
    } else {
        eseguiAssegnazionePerditeEConquista(att, dif, dadiAttacco, dadiDifesa, areaLog);
    }
};

/**
 * GAME.JS - PARTE 2
 */

function eseguiAssegnazionePerditeEConquista(att, dif, dadiAttacco, dadiDifesa, areaLog) {
    let scontri = Math.min(dadiAttacco.length, dadiDifesa.length);
    let perseAtt = 0;
    let perseDif = 0;

    for (let i = 0; i < scontri; i++) {
        var vinceAtt = (typeof window.calcolaEsitoConfrontoDadi === "function")
            ? window.calcolaEsitoConfrontoDadi(dadiAttacco[i], dadiDifesa[i], att, dif)
            : (dadiAttacco[i] > dadiDifesa[i]);

        if (vinceAtt) {
          perseDif++;
        } else {
            perseAtt++;
        }
    }

    territori[att].armate -= perseAtt;
    territori[dif].armate -= perseDif;

    var graficAtt = document.getElementById("armate-num-" + att);
    var graficDif = document.getElementById("armate-num-" + dif);
    if (graficAtt) graficAtt.textContent = territori[att].armate;
    if (graficDif) graficDif.textContent = territori[dif].armate;

    if (areaLog) {
        areaLog.innerHTML = `<b>ESITO SCONTRO (${dadiAttacco.join("-")} vs ${dadiDifesa.join("-")})</b><br><br>` +
                            `Attaccante <b>${att}</b> perde: <b style="color:#FF3333;">${perseAtt}</b> armate<br>` +
                            `Difensore <b>${dif}</b> perde: <b style="color:#33FF33;">${perseDif}</b> armate`;
    }

    // 1. CASO CONQUISTA
    if (territori[dif].armate <= 0) {
        let minimoObbligatorio = Math.min(dadiAttacco.length, territori[att].armate - 1);
        if (minimoObbligatorio < 1) minimoObbligatorio = 1;

        territori[dif].proprietario = giocatoreDiTurno;
        territori[dif].armate = minimoObbligatorio;
        territori[att].armate -= minimoObbligatorio;

        if (graficAtt) graficAtt.textContent = territori[att].armate;
        if (graficDif) graficDif.textContent = territori[dif].armate;

        var elementoPath = document.getElementById(dif);
        if (elementoPath && proprietari[giocatoreDiTurno]) {
            elementoPath.setAttribute("fill", proprietari[giocatoreDiTurno].colore);
            elementoPath.style.fill = proprietari[giocatoreDiTurno].colore;
        }
        // Fuochi d'artificio sul territorio appena conquistato!
        if (typeof window.lanciaFuochiTerritorio === "function") {
            window.lanciaFuochiTerritorio(dif, [proprietari[giocatoreDiTurno].colore, "#FFFF33", "#FFFFFF"]);
        }

        // Controlla se con questa conquista ha vinto l'intera partita!
        if (typeof window.controllaVittoriaPartita === "function" && window.controllaVittoriaPartita(giocatoreDiTurno)) {
            return;
        }
        let nomeVincitore = proprietari[giocatoreDiTurno].nick;

        if (!window.isGiocatoreBot(giocatoreDiTurno)) {
            let maxExtraSpostabili = territori[att].armate - 1;
            if (areaLog) {
                areaLog.innerHTML = `<b style="color:#FFFF33;">TERRITORIO CONQUISTATO!</b><br><br>` +
                                    `<b>${dif}</b> è ora di <b>${nomeVincitore}</b>!<br>` +
                                    `Spostate <b>${minimoObbligatorio}</b> armate.<br>` +
                                    `Puoi trasferire fino ad altre <b>${maxExtraSpostabili}</b> armate da <b>${att}</b>.`;
            }
            if (maxExtraSpostabili > 0) {
                mostraControlliSpostamentoConquista(att, dif, maxExtraSpostabili);
            } else {
                territorioDifensoreSelezionato = null;
                setTimeout(() => {
                    if (typeof window.annullaSelezioneAttacco === "function") window.annullaSelezioneAttacco(); 
                }, 1500);
            }
            return;
        } else {
            // SPOSTAMENTO INTELLIGENTE DEL BOT DOPO LA CONQUISTA
            let extraBot = territori[att].armate - 1;
            let spostaBot = 0;

            if (extraBot > 0) {
                // Controlla se il territorio di partenza 'att' confina ancora con nemici
                let ancoraAlConfine = territori[att].confini.some(c => territori[c] && territori[c].proprietario !== giocatoreDiTurno);
                
                if (!ancoraAlConfine) {
                    // Territorio ormai sicuro nelle retrovie: sposta TUTTO sul nuovo fronte!
                    spostaBot = extraBot;
                } else {
                    // Ancora al confine: sposta metà delle truppe per bilanciare difesa e avanzata
                    spostaBot = Math.floor(extraBot / 2);
                }

                if (spostaBot > 0) {
                    territori[att].armate -= spostaBot;
                    territori[dif].armate += spostaBot;
                    if (graficAtt) graficAtt.textContent = territori[att].armate;
                    if (graficDif) graficDif.textContent = territori[dif].armate;
                }
            }

            if (areaLog) {
                areaLog.innerHTML = `<b style="color:#FFFF33;">TERRITORIO CONQUISTATO!</b><br><br>` +
                                    `<b>${dif}</b> conquistato da <b>${nomeVincitore}</b> (trasferite +${spostaBot} armate)!`;
            }
        }
    }

    // 2. BATTAGLIA NON CONCLUSA O TURNO BOT
    setTimeout(function() {
        if (!window.isGiocatoreBot(giocatoreDiTurno)) {
            if (territori[att].armate >= 2 && territori[dif].proprietario !== giocatoreDiTurno) {
                if (areaLog) {
                    areaLog.innerHTML = `<b>Attacco in corso da <span style="color:#33FF33;">${att}</span></b> (${territori[att].armate})<br>` +
                                        `Difensore: <b style="color:#FF3333;">${dif}</b> (${territori[dif].armate})<br><br>` +
                                        `<i>Clicca "LANCIA DADI" per attaccare ancora, oppure scegli un altro bersaglio.</i>`;
                }
                if (typeof window.mostraPulsanteLancioDadi === "function") window.mostraPulsanteLancioDadi();
            } else {
                if (typeof window.annullaSelezioneAttacco === "function") window.annullaSelezioneAttacco();
            }
        } else {
            if (typeof window.continuaCicloAttaccoBot === "function") window.continuaCicloAttaccoBot();
            else if (typeof window.passaProssimoGiocatoreRegolamentare === "function") window.passaProssimoGiocatoreRegolamentare();
        }
    }, 1500);
}

function mostraControlliSpostamentoConquista(att, dif, maxExtraSpostabili) {
    var areaBottoni = document.getElementById("dynamic-buttons");
    if (!areaBottoni) return;

    areaBottoni.innerHTML = `
        <div style="text-align:center; margin-bottom:8px;">
            <label style="font-size:12px; display:block; margin-bottom:4px;">Armate extra da <b>${att}</b> a <b>${dif}</b> (0 - ${maxExtraSpostabili}):</label>
            <input type="number" id="input-sposta-conquista" min="0" max="${maxExtraSpostabili}" value="${maxExtraSpostabili}" 
                   style="width:70px; padding:5px; font-size:16px; font-weight:bold; text-align:center; color:#000 !important; background:#FFF !important; border-radius:4px;">
        </div>
        <button id="btn-conferma-conquista" class="btn-azione" style="background-color:#33FF33; color:#000000;">CONFERMA SPOSTAMENTO</button>
    `;

    document.getElementById("btn-conferma-conquista").onclick = function() {
        let val = parseInt(document.getElementById("input-sposta-conquista").value, 10);
        if (isNaN(val) || val < 0) val = 0;
        if (val > maxExtraSpostabili) val = maxExtraSpostabili;

        if (val > 0) {
            territori[att].armate -= val;
            territori[dif].armate += val;
            var graficAtt = document.getElementById("armate-num-" + att);
            var graficDif = document.getElementById("armate-num-" + dif);
            if (graficAtt) graficAtt.textContent = territori[att].armate;
            if (graficDif) graficDif.textContent = territori[dif].armate;
        }
        if (typeof window.annullaSelezioneAttacco === "function") window.annullaSelezioneAttacco();
    };
}

/**
 * Controlla se il giocatore di turno ha conquistato tutta la mappa e mostra la schermata finale
 */
window.controllaVittoriaPartita = function(idVincitore) {
    let esistonoNemici = false;
    for (let cod in territori) {
        if (territori[cod] && territori[cod].proprietario !== idVincitore) {
            esistonoNemici = true;
            break;
        }
    }

    if (esistonoNemici) return false;

    let vincitore = proprietari[idVincitore];
    let overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.85); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10000; color:#FFF; text-align:center; font-family:sans-serif; padding:20px;";

    overlay.innerHTML = `
        <div style="border:4px solid ${vincitore.colore}; background:#1a1a1a; padding:35px 50px; border-radius:16px; box-shadow:0 0 40px ${vincitore.colore}; max-width:500px;">
            <div style="font-size:48px; margin-bottom:10px;">&#127942;</div>
            <h1 style="color:#FFFF33; margin:0 0 10px 0; font-size:32px; letter-spacing:2px;">VITTORIA TOTALE!</h1>
            <p style="font-size:20px; margin:15px 0;">Il mondo &egrave; stato conquistato da<br><b style="color:${vincitore.colore}; font-size:28px;">${vincitore.nick}</b>!</p>
            <button onclick="location.reload()" style="margin-top:20px; padding:12px 28px; font-size:16px; font-weight:bold; background:#33FF33; color:#000; border:none; border-radius:8px; cursor:pointer;">NUOVA PARTITA</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Lancia fuochi d'artificio festosi su territori casuali ogni 800ms
    let listaCodici = Object.keys(territori);
    setInterval(() => {
        if (typeof window.lanciaFuochiTerritorio === "function" && listaCodici.length > 0) {
            let randCod = listaCodici[Math.floor(Math.random() * listaCodici.length)];
            window.lanciaFuochiTerritorio(randCod, [vincitore.colore, "#FFFF33", "#FFFFFF", "#33FF33"]);
        }
    }, 800);

    return true;
};

