// =========================================================================
// COMANDANTI / GENERALI SUL CAMPO E RISCATTO PRIGIONIERI (generali.js)
// =========================================================================

window.posizioneGenerali = {};      // { 1: "EU1", 2: "AS4", ... } (null se catturato)
window.turniCatturaGenerale = {};   // { 1: 0, 2: 0, ... }
window.carceriereGenerale = {};     // { idPrigioniero: idCarceriere }

// 1. Posiziona il Generale di ogni giocatore sulla sua Capitale a inizio partita
window.inizializzaGenerali = function() {
    if (typeof territori === "undefined") return;
    for (let id = 1; id <= 6; id++) {
        let cap = (typeof window.ottieniCapitaleGiocatore === "function") ? window.ottieniCapitaleGiocatore(id) : null;
        if (!cap) {
            let miei = Object.keys(territori).filter(c => territori[c].proprietario == id);
            cap = miei.length > 0 ? miei.at(0) : null;
        }
        window.posizioneGenerali[id] = cap;
        window.turniCatturaGenerale[id] = 0;
        window.carceriereGenerale[id] = null;
    }
};

// 2. Aggiorna l'effetto grafico del territorio con il Generale (visibile per TUTTI i giocatori!)
window.aggiornaGraficaGenerali = function() {
    if (typeof territori === "undefined") return;

    Object.keys(territori).forEach(function(cod) {
        var testoArmate = document.getElementById("armate-num-" + cod);
        var cerchio = testoArmate ? testoArmate.previousElementSibling : null;
        var testoNome = testoArmate ? testoArmate.nextElementSibling : null;
        if (!cerchio || cerchio.tagName.toLowerCase() !== "circle") return;

        var idGeneralePresente = null;
        for (let id = 1; id <= 6; id++) {
            if (window.posizioneGenerali[id] === cod && territori[cod].proprietario == id) {
                idGeneralePresente = id;
                break;
            }
        }

        if (idGeneralePresente !== null) {
            cerchio.style.setProperty("stroke", "#FFD700", "important");
            cerchio.style.setProperty("stroke-width", "90px", "important");
            cerchio.style.setProperty("filter", "drop-shadow(0px 0px 14px #000000)", "important");

            if (testoNome && !testoNome.textContent.startsWith("\u2694")) {
                testoNome.textContent = "\u2694" + idGeneralePresente + " " + cod;
                testoNome.style.setProperty("fill", "#FFFF00", "important");
            }
        } else {
            cerchio.style.removeProperty("filter");
            if (testoNome && testoNome.textContent.startsWith("\u2694")) {
                testoNome.textContent = cod;
                testoNome.style.setProperty("fill", "#000000", "important");
            }
        }
    });
};

// 3. Aggiorna lo stato del Generale a inizio turno (gestione rilascio dalla cattura)
window.aggiornaGeneraleInizioTurno = function(idG) {
    if (!idG || idG === 0 || idG === "NEUTRALE") return;

    if (window.turniCatturaGenerale[idG] > 0) {
        window.turniCatturaGenerale[idG]--;
        if (window.turniCatturaGenerale[idG] === 0) {
            let cap = (typeof window.ottieniCapitaleGiocatore === "function") ? window.ottieniCapitaleGiocatore(idG) : null;
            window.posizioneGenerali[idG] = cap;
            let logBox = document.getElementById("log-messages");
            if (logBox && typeof proprietari !== "undefined" && proprietari[idG]) {
                logBox.innerHTML = `<b style="color:#FF00FF;">\u2694 GENERALE LIBERATO!</b> Il Generale di ${proprietari[idG].nick} è tornato attivo a ${cap}!<br>` + logBox.innerHTML;
            }
        }
    } else {
        let pos = window.posizioneGenerali[idG];
        if (!pos || !territori[pos] || territori[pos].proprietario != idG) {
            let cap = (typeof window.ottieniCapitaleGiocatore === "function") ? window.ottieniCapitaleGiocatore(idG) : null;
            window.posizioneGenerali[idG] = cap;
        }
    }
};

// Funzione per liberare anticipatamente un Generale nemico in cambio di Riscatto!
window.liberaPrigionieroPerRiscatto = function(idPrigioniero) {
    var idCarceriere = window.carceriereGenerale[idPrigioniero];
    if (!idCarceriere || idCarceriere != giocatoreDiTurno) return;

    // 1. Libera il Generale nella sua Capitale
    var capPrigioniero = (typeof window.ottieniCapitaleGiocatore === "function") ? window.ottieniCapitaleGiocatore(idPrigioniero) : null;
    window.posizioneGenerali[idPrigioniero] = capPrigioniero;
    window.turniCatturaGenerale[idPrigioniero] = 0;
    window.carceriereGenerale[idPrigioniero] = null;

    // 2. Assegna il Riscatto al carceriere (+5 Cibo e +3 Armate di rinforzo!)
    if (window.scorteCapitale) {
        window.scorteCapitale[idCarceriere] = Math.min(40, (window.scorteCapitale[idCarceriere] || 0) + 5);
    }
    if (typeof faseAttuale !== "undefined" && faseAttuale === "RINFORZI" && typeof rinforziDaPiazzare !== "undefined") {
        rinforziDaPiazzare += 3;
        if (typeof aggiornaInterfacciaRinforzi === "function") aggiornaInterfacciaRinforzi();
    } else {
        var miaCap = (typeof window.ottieniCapitaleGiocatore === "function") ? window.ottieniCapitaleGiocatore(idCarceriere) : null;
        if (miaCap && territori[miaCap]) {
            territori[miaCap].armate += 3;
            var elCap = document.getElementById("armate-num-" + miaCap);
            if (elCap) elCap.textContent = territori[miaCap].armate;
        }
    }

    var logBox = document.getElementById("log-messages");
    if (logBox && typeof proprietari !== "undefined") {
        var nomeCarc = proprietari[idCarceriere] ? proprietari[idCarceriere].nick : idCarceriere;
        var nomePrig = proprietari[idPrigioniero] ? proprietari[idPrigioniero].nick : idPrigioniero;
        logBox.innerHTML = `<b style="color:#FFD700;">&#128176; RISCATTO PAGATO!</b> ${nomeCarc} libera il Generale di ${nomePrig} e incassa <b>+3 Armate</b> e <b>+5 Cibo</b>!<br>` + logBox.innerHTML;
    }

    var btnRisc = document.getElementById("btn-riscatto-generale");
    if (btnRisc) btnRisc.remove();
};

// =========================================================================
// AGGANCIO AUTOMATICO A DADI, CONQUISTE, TURNI E LOGISTICA
// =========================================================================
window.addEventListener("load", function() {
    setTimeout(function() {
        window.inizializzaGenerali();
        window.aggiornaGraficaGenerali();
    }, 900);

    setInterval(window.aggiornaGraficaGenerali, 700);

    // 1. Bonus +1 al dado più alto quando il Generale guida l'attacco
    if (typeof window.calcolaEsitoConfrontoDadi === "function") {
        var origDadiGen = window.calcolaEsitoConfrontoDadi;
        window.calcolaEsitoConfrontoDadi = function(dadoAtt, dadoDif, att, dif) {
            var dadoAttMod = dadoAtt;
            var propAtt = territori[att] ? territori[att].proprietario : null;
            if (propAtt && window.posizioneGenerali[propAtt] === att) {
                dadoAttMod = Math.min(6, dadoAtt + 1);
            }
            return origDadiGen(dadoAttMod, dadoDif, att, dif);
        };
    }

    // 2. Avanzamento del Generale in conquista & Cattura con Bottino (blindato!)
    if (typeof window.registraBattagliaLogistica === "function") {
        var origRegGen = window.registraBattagliaLogistica;
        window.registraBattagliaLogistica = function(att, dif, conquistato, vecchioProp) {
            if (conquistato) {
                var nuovoProp = territori[att] ? territori[att].proprietario : null;

                // Controlla se su dif c'era il Generale di QUALSIASI altro giocatore (1..6)!
                for (let idG = 1; idG <= 6; idG++) {
                    if (idG != nuovoProp && window.posizioneGenerali[idG] === dif) {
                        window.posizioneGenerali[idG] = null;
                        window.turniCatturaGenerale[idG] = 3;
                        window.carceriereGenerale[idG] = nuovoProp;

                        if (nuovoProp && window.scorteCapitale) {
                            window.scorteCapitale[nuovoProp] = Math.min(40, (window.scorteCapitale[nuovoProp] || 0) + 6);
                        }

                        var logBox = document.getElementById("log-messages");
                        if (logBox && typeof proprietari !== "undefined") {
                            var nomeVittima = proprietari[idG] ? proprietari[idG].nick : idG;
                            logBox.innerHTML = `<b style="color:#FF00FF;">\u2694 GENERALE CATTURATO!</b> Il Generale di ${nomeVittima} è prigioniero a ${dif} (+6 Cibo bottino)!<br>` + logBox.innerHTML;
                        }
                    }
                }

                // Avanzamento del Generale attaccante
                if (nuovoProp && window.posizioneGenerali[nuovoProp] === att) {
                    window.posizioneGenerali[nuovoProp] = dif;
                }
            }
            return origRegGen.apply(this, arguments);
        };
    }

    // 3. Controllo rilascio Generale a inizio turno (con pagamento automatico 4 Cibo al carceriere!)
    if (typeof window.avviaTurnoRegolamentare === "function") {
        var origTurnoGen = window.avviaTurnoRegolamentare;
        window.avviaTurnoRegolamentare = function() {
            if (typeof giocatoreDiTurno !== "undefined") {
                if (window.turniCatturaGenerale[giocatoreDiTurno] === 1) {
                    var carc = window.carceriereGenerale[giocatoreDiTurno];
                    if (carc && window.scorteCapitale) {
                        var tassa = Math.min(4, window.scorteCapitale[giocatoreDiTurno] || 0);
                        window.scorteCapitale[giocatoreDiTurno] -= tassa;
                        window.scorteCapitale[carc] = Math.min(40, (window.scorteCapitale[carc] || 0) + tassa);
                    }
                    window.carceriereGenerale[giocatoreDiTurno] = null;
                }
                window.aggiornaGeneraleInizioTurno(giocatoreDiTurno);
            }
            origTurnoGen.apply(this, arguments);
        };
    }

    // 4. Auto-schieramento Generali (1..6) + Pulsante Riscatto se hai prigionieri
    setInterval(function() {
        var boxScorte = document.getElementById("info-logistica");
        var controlArea = document.getElementById("control-area");
        if (!boxScorte || typeof giocatoreDiTurno === "undefined" || !giocatoreDiTurno) return;

        // Assicura che TUTTI e 6 i giocatori abbiano il Generale schierato (incluso il 6!)
        for (let id = 1; id <= 6; id++) {
            if (!window.posizioneGenerali[id] && (!window.turniCatturaGenerale[id] || window.turniCatturaGenerale[id] === 0)) {
                let capG = (typeof window.ottieniCapitaleGiocatore === "function") ? window.ottieniCapitaleGiocatore(id) : null;
                if (!capG) {
                    let tG = Object.keys(territori).filter(c => territori[c].proprietario == id);
                    capG = tG.length > 0 ? tG.at(0) : null;
                }
                if (capG) window.posizioneGenerali[id] = capG;
            }
        }

        // Controlla se il giocatore umano ha un Generale nemico prigioniero
        if (controlArea) {
            var prigioniero = null;
            for (let id = 1; id <= 6; id++) {
                if (window.carceriereGenerale[id] == giocatoreDiTurno && window.turniCatturaGenerale[id] > 0) {
                    prigioniero = id;
                    break;
                }
            }

            var btnRisc = document.getElementById("btn-riscatto-generale");
            var isBot = (typeof window.isGiocatoreBot === "function") && window.isGiocatoreBot(giocatoreDiTurno);

            if (prigioniero && !isBot) {
                if (!btnRisc) {
                    btnRisc = document.createElement("button");
                    btnRisc.id = "btn-riscatto-generale";
                    btnRisc.className = "btn-azione";
                    btnRisc.style.cssText = "display:block !important; width:100% !important; background-color:#441155; color:#FF88FF; border:2px solid #FF00FF; font-size:11px; font-weight:bold; padding:6px; margin-bottom:6px; cursor:pointer;";
                    controlArea.insertBefore(btnRisc, document.getElementById("dynamic-buttons"));
                }
                var nomeP = (typeof proprietari !== "undefined" && proprietari[prigioniero]) ? proprietari[prigioniero].nick : prigioniero;
                btnRisc.innerHTML = `&#128176; LIBERA GEN. ${nomeP} (+3 Armate, +5 Cibo)`;
                btnRisc.onclick = function() { window.liberaPrigionieroPerRiscatto(prigioniero); };
            } else if (btnRisc) {
                btnRisc.remove();
            }
        }
    }, 650);
});