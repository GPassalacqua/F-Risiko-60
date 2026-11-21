// =========================================================================
// LOGISTICA, CIBO E CAPITALI (logistica.js)
// =========================================================================

window.scorteCapitale = {}; // Magazzino cibo per ogni giocatore

// 1. INIZIALIZZA CAPITALI E STATO TERRITORI (da chiamare a inizio partita)
window.inizializzaLogistica = function() {
    window.scorteCapitale = {};
    var giocatoriConCapitale = {};

    // Inizializza proprietà su tutti i 60 territori
    Object.keys(territori).forEach(function(cod) {
        var t = territori[cod];
        t.turniDevastato = 0; // 0 = pace, 1 = attaccato, 2 = conquistato
        t.isSazio = true;
        t.isCapitale = false;

        // Assegna la prima capitale trovata a ogni giocatore
        if (t.proprietario && t.proprietario !== 0 && t.proprietario !== "NEUTRALE" && !giocatoriConCapitale[t.proprietario]) {
            t.isCapitale = true;
            giocatoriConCapitale[t.proprietario] = cod;
            window.scorteCapitale[t.proprietario] = 15; // Scorta iniziale di partenza
        }
    });
};

// 2. TROVA LA CAPITALE DI UN GIOCATORE (se persa, ne elegge una nuova)
window.ottieniCapitaleGiocatore = function(giocatore) {
    if (!giocatore || giocatore === "NEUTRALE") return null;

    var listaMiei = Object.keys(territori).filter(c => territori[c].proprietario === giocatore);
    if (listaMiei.length === 0) return null;

    // Controlla se ha già una capitale valida
    var cap = listaMiei.find(c => territori[c].isCapitale);
    if (cap) return cap;

    // Se l'ha persa, elegge capitale il suo territorio con più armate (e azzera metà scorte)
    listaMiei.sort((a, b) => territori[b].armate - territori[a].armate);
    var nuovaCap = listaMiei[0];
    territori[nuovaCap].isCapitale = true;
    window.scorteCapitale[giocatore] = Math.floor((window.scorteCapitale[giocatore] || 0) / 2);
    return nuovaCap;
};

// 3. CONTROLLA SE UN TERRITORIO È COLLEGATO ALLA CAPITALE (BFS sui confini)
window.isCollegatoAllaCapitale = function(codiceTerritorio, giocatore) {
    var capitale = window.ottieniCapitaleGiocatore(giocatore);
    if (!capitale) return false;
    if (codiceTerritorio === capitale) return true;

    var visitati = new Set([capitale]);
    var coda = [capitale];

    while (coda.length > 0) {
        var attuale = coda.shift();
        var confini = territori[attuale].confini || [];

        for (var i = 0; i < confini.length; i++) {
            var vicino = confini[i];
            if (territori[vicino] && territori[vicino].proprietario === giocatore && !visitati.has(vicino)) {
                if (vicino === codiceTerritorio) return true;
                visitati.add(vicino);
                coda.push(vicino);
            }
        }
    }
    return false;
};

// 4. CALCOLA PRODUZIONE E DISTRIBUZIONE CIBO A INIZIO TURNO
window.aggiornaRifornimentiTurno = function(giocatore) {
    if (!giocatore || giocatore === "NEUTRALE") return;

    var capitale = window.ottieniCapitaleGiocatore(giocatore);
    if (!capitale) return;

    if (typeof window.scorteCapitale[giocatore] === "undefined") {
        window.scorteCapitale[giocatore] = 10;
    }

    var mieiTerritori = Object.keys(territori).filter(c => territori[c].proprietario === giocatore);
    var territoriInDeficit = [];

    // Fase A: Riduci devastazione, produci cibo locale e raccogli surplus verso la Capitale
    mieiTerritori.forEach(function(cod) {
        var t = territori[cod];
        if (t.turniDevastato > 0) t.turniDevastato--;

        var produzione = 5; // Pace
        if (t.turniDevastato === 1) produzione = 2; // Attaccato di recente
        if (t.turniDevastato >= 2) produzione = 1; // Appena conquistato

        var bilancio = produzione - t.armate;

        if (bilancio >= 0) {
            t.isSazio = true;
            // Se collegato alla Capitale (o è la Capitale stessa), invia il surplus al magazzino (max 40)
            if (bilancio > 0 && window.isCollegatoAllaCapitale(cod, giocatore)) {
                window.scorteCapitale[giocatore] = Math.min(40, window.scorteCapitale[giocatore] + bilancio);
            }
        } else {
            // Ha bisogno di cibo dalla Capitale
            territoriInDeficit.push({ cod: cod, bisogno: Math.abs(bilancio), armate: t.armate });
        }
    });

    // Fase B: Distribuisci scorte dalla Capitale (priorità agli eserciti più grandi)
    territoriInDeficit.sort((a, b) => b.armate - a.armate);

    territoriInDeficit.forEach(function(item) {
        var collegato = window.isCollegatoAllaCapitale(item.cod, giocatore);
        if (collegato && window.scorteCapitale[giocatore] >= item.bisogno) {
            window.scorteCapitale[giocatore] -= item.bisogno;
            territori[item.cod].isSazio = true;
        } else {
            territori[item.cod].isSazio = false; // AFFAMATO!
        }
    });
};

window.giocatoreInPanico = {}; // Tiene traccia di chi ha appena perso la Capitale

// 5. REGISTRA DANNI DA BATTAGLIA / CONQUISTA (Saccheggio + 1 Armata Bonus + Panico)
window.registraBattagliaLogistica = function(att, dif, conquistato, vecchioProprietario) {
    if (territori[att]) {
        territori[att].turniDevastato = Math.max(territori[att].turniDevastato || 0, 1);
    }
    if (territori[dif]) {
        if (conquistato) {
            // Se il territorio conquistato era una CAPITALE nemica
            if (territori[dif].isCapitale) {
                var vecchioProp = vecchioProprietario || territori[dif].proprietario;
                var nuovoProp = territori[att] ? territori[att].proprietario : null;
                var scorteNemiche = window.scorteCapitale[vecchioProp] || 0;
                var bottino = Math.floor(scorteNemiche / 2);

                if (nuovoProp) {
                    // 1. Bottino scorte cibo
                    window.scorteCapitale[nuovoProp] = Math.min(40, (window.scorteCapitale[nuovoProp] || 0) + bottino);
                    // 2. +1 Armata bonus subito sul territorio conquistato
                    territori[dif].armate += 1;
                    var grafDif = document.getElementById("armate-num-" + dif);
                    if (grafDif) grafDif.textContent = territori[dif].armate;
                }

                // 3. Attiva il Turno di Panico per chi ha perso la Capitale (CORRETTO!)
                if (vecchioProp && vecchioProp !== 0 && vecchioProp !== "NEUTRALE") {
                    window.giocatoreInPanico[vecchioProp] = true;
                }

                // Messaggio nel Log Partita
                var logBox = document.getElementById("log-messages");
                if (logBox) {
                    var nomePerdente = (typeof proprietari !== "undefined" && proprietari[vecchioProp]) ? proprietari[vecchioProp].nick : vecchioProp;
                    logBox.innerHTML = `<b style="color:#FFD700;">&#9813; CAPITALE CONQUISTATA (${dif})!</b> +1 Armata bonus, +${bottino} Cibo! ${nomePerdente} in PANICO!<br>` + logBox.innerHTML;
                }
            }

            // Spegne SEMPRE lo stato di Capitale sul territorio appena conquistato
            territori[dif].turniDevastato = 2;
            territori[dif].isCapitale = false;
            territori[dif].isSazio = false;

            // Se chi ha perso il territorio era un giocatore attivo, gli fa eleggere subito la nuova Capitale
            if (vecchioProprietario && vecchioProprietario !== 0 && vecchioProprietario !== "NEUTRALE") {
                window.ottieniCapitaleGiocatore(vecchioProprietario);
            }
        } else {
            territori[dif].turniDevastato = Math.max(territori[dif].turniDevastato || 0, 1);
        }
    }
};


// 6. REGOLA DEL PAREGGIO E MODIFICATORI DADI IN BASE ALLA FAME
window.calcolaEsitoConfrontoDadi = function(dadoAtt, dadoDif, att, dif) {
    var attSazio = territori[att] ? (territori[att].isSazio !== false) : true;
    var difSazio = territori[dif] ? (territori[dif].isSazio !== false) : true;

    // Penalità -1 al dado dell'attaccante se è affamato contro un difensore sazio
    var valoreAtt = (!attSazio && difSazio) ? Math.max(1, dadoAtt - 1) : dadoAtt;

    // Regola del pareggio:
    // Se l'attaccante è SAZIO e il difensore è AFFAMATO -> il pareggio premia l'ATTACCO (>=)
    if (attSazio && !difSazio) {
        return valoreAtt >= dadoDif;
    }

    // In tutti gli altri casi -> il pareggio premia la DIFESA (>)
    return valoreAtt > dadoDif;
};

// =========================================================================
// COLLEGAMENTO AUTOMATICO A GAME.JS (non serve toccare game.js!)
// =========================================================================

window.addEventListener("load", function() {
    // 1. Avvia la logistica 1 secondo dopo il caricamento della mappa iniziale
    setTimeout(function() {
        if (typeof territori !== "undefined") {
            window.inizializzaLogistica();
            if (typeof giocatoreDiTurno !== "undefined") {
                window.aggiornaRifornimentiTurno(giocatoreDiTurno);
            }
            if (typeof window.aggiornaGraficaLogistica === "function") {
                window.aggiornaGraficaLogistica();
            }
        }
    }, 1000);

    // 2. Aggancia automaticamente il cambio turno di game.js
    if (typeof window.passaProssimoGiocatoreRegolamentare === "function") {
        var originalePassaTurno = window.passaProssimoGiocatoreRegolamentare;
        window.passaProssimoGiocatoreRegolamentare = function() {
            originalePassaTurno.apply(this, arguments);
            if (typeof giocatoreDiTurno !== "undefined") {
                window.aggiornaRifornimentiTurno(giocatoreDiTurno);
            }
            if (typeof window.aggiornaGraficaLogistica === "function") {
                window.aggiornaGraficaLogistica();
            }
        };
    }

    // 3. Aggancia automaticamente la fine della battaglia di game.js
    if (typeof window.eseguiAssegnazionePerditeEConquista === "function") {
        var originaleBattaglia = window.eseguiAssegnazionePerditeEConquista;
        window.eseguiAssegnazionePerditeEConquista = function() {
            var difPrima = typeof territorioDifensoreSelezionato !== "undefined" ? territorioDifensoreSelezionato : null;
            var attPrima = typeof territorioAttaccanteSelezionato !== "undefined" ? territorioAttaccanteSelezionato : null;
            var propPrima = (difPrima && territori[difPrima]) ? territori[difPrima].proprietario : null;

            originaleBattaglia.apply(this, arguments);

            if (attPrima && difPrima && territori[difPrima]) {
                var conquistato = (territori[difPrima].proprietario !== propPrima);
                window.registraBattagliaLogistica(attPrima, difPrima, conquistato, propPrima);
                if (typeof window.aggiornaGraficaLogistica === "function") {
                    window.aggiornaGraficaLogistica();
                }
            }
        };
    }
});

// =========================================================================
// AGGIORNAMENTO PANNELLO E COLORI CERCHIETTI
// =========================================================================
setInterval(function() {
    var gameArea = document.getElementById("game-area");
    var boxScorte = document.getElementById("info-logistica");

    if (!gameArea || gameArea.classList.contains("hidden") || !boxScorte) return;
    if (typeof territori === "undefined" || typeof giocatoreDiTurno === "undefined" || !giocatoreDiTurno) return;

    // Inizializza al volo appena inizia la partita
    if (Object.keys(window.scorteCapitale).length === 0) {
        window.inizializzaLogistica();
        window.aggiornaRifornimentiTurno(giocatoreDiTurno);
    }

    // Controllo di sicurezza: massimo 1 sola Capitale per giocatore e 0 per Euno (neutrale)
    var capitaliTrovate = {};
    Object.keys(territori).forEach(function(cod) {
        var t = territori[cod];
        if (t.isCapitale) {
            if (!t.proprietario || t.proprietario === 0 || t.proprietario === "NEUTRALE" || capitaliTrovate[t.proprietario]) {
                t.isCapitale = false; // Spegne eventuali doppioni
            } else {
                capitaliTrovate[t.proprietario] = cod;
            }
        }
    });

    // 1. Forza il colore interno (fill) dei cerchietti con !important
    Object.keys(territori).forEach(function(cod) {
        var t = territori[cod];
        var testoArmate = document.getElementById("armate-num-" + cod);
        var cerchio = testoArmate ? testoArmate.previousElementSibling : null;

        if (cerchio && cerchio.tagName.toLowerCase() === "circle") {
            if (t.isCapitale) {
                cerchio.style.setProperty("fill", "#FFD700", "important"); // ORO per la Capitale
                if (testoArmate) testoArmate.style.setProperty("fill", "#000000", "important");
            } else if (t.proprietario !== 0 && t.proprietario !== "NEUTRALE" && t.isSazio === false) {
                cerchio.style.setProperty("fill", "#FF4444", "important"); // ROSSO per gli affamati
                if (testoArmate) testoArmate.style.setProperty("fill", "#FFFFFF", "important");
            } else if (t.proprietario !== 0 && t.proprietario !== "NEUTRALE") {
                cerchio.style.setProperty("fill", "#FFFFFF", "important"); // BIANCO normale per i sazi
                if (testoArmate) testoArmate.style.setProperty("fill", "#000000", "important");
            } else {
                cerchio.style.setProperty("fill", "#CCCCCC", "important"); // GRIGIO per Euno (neutrale)
                if (testoArmate) testoArmate.style.setProperty("fill", "#000000", "important");
            }
        }
    });

    // 2. Aggiorna il riquadro testuale compatto e SENZA lampeggio
    var scorte = window.scorteCapitale[giocatoreDiTurno] || 0;
    var cap = window.ottieniCapitaleGiocatore(giocatoreDiTurno) || "N/D";
    var affamati = Object.keys(territori).filter(c => territori[c].proprietario === giocatoreDiTurno && territori[c].isSazio === false).length;

    // Se il Generale non ha ancora posizione, lo piazza subito sulla Capitale
    if (window.posizioneGenerali && !window.posizioneGenerali[giocatoreDiTurno] && cap !== "N/D" && (!window.turniCatturaGenerale || !window.turniCatturaGenerale[giocatoreDiTurno])) {
        window.posizioneGenerali[giocatoreDiTurno] = cap;
    }

    var rigaGenerale = "";
    if (window.posizioneGenerali) {
        var posGen = window.posizioneGenerali[giocatoreDiTurno];
        var cattGen = (window.turniCatturaGenerale && window.turniCatturaGenerale[giocatoreDiTurno]) || 0;
        var statoGen = cattGen > 0 ? `<span style="color:#FF66FF;">Catt. (${cattGen}T)</span>` : `<span style="color:#FF66FF;"><b>${posGen || cap}</b> (+1)</span>`;
        rigaGenerale = `<br>&#9876; <b>Gen:</b> ${statoGen}`;
    }

    var rigaMeteo = "";
    if (window.meteoAttuale) {
        rigaMeteo = ` | ${window.meteoAttuale.icona} <span style="color:${window.meteoAttuale.colore};"><b>${window.meteoAttuale.nome}</b></span>`;
    }

    var statoCibo = affamati > 0
        ? `<span style="color:#ff6666;"><b>[!] ${affamati} affamati</b></span>`
        : `<span style="color:#88ff88;"><b>[OK] Sazio</b></span>`;

    boxScorte.innerHTML =
        `&#9813; <b>Cap:</b> <span style="color:#FFD700;">${cap}</span> | &#9752; <b>Cibo:</b> ${scorte}/40<br>` +
        statoCibo + rigaGenerale + rigaMeteo;
}, 600);
