/**
 * FASI_GIOCO.JS - PARTE 1
 */
window.sottoFaseAttuale = 'fase_rinforzi'; 
var rinforziDisponibiliTurno = 0;
var territorioAttaccanteSelezionato = null;
var territorioDifensoreSelezionato = null;
var ultimoClicTempo = 0;

var configurazioneContinenti = {
    "Oceania":     { totale: 7,  bonus: 2 },
    "SudAmerica":  { totale: 8,  bonus: 3 },
    "Europa":      { totale: 9,  bonus: 4 },
    "Africa":      { totale: 10, bonus: 5 },
    "NordAmerica": { totale: 12, bonus: 6 },
    "Asia":        { totale: 14, bonus: 7 }
};

window.avviaTurnoRegolamentare = function() {
    faseGioco = 'gioco'; 
    window.sottoFaseAttuale = 'fase_rinforzi'; 

    var setupArea = document.getElementById("setup-area");
    var gameArea = document.getElementById("game-area");
    var areaBottoni = document.getElementById("dynamic-buttons");

    if (setupArea) setupArea.style.display = "none";
    if (gameArea) {
        gameArea.classList.remove("hidden");
        gameArea.style.display = "block";
    }

    if (!window.isGiocatoreBot(giocatoreDiTurno)) {
        let totTerritori = 0;
        let conteggioPerContinente = { "Oceania": 0, "SudAmerica": 0, "Europa": 0, "Africa": 0, "NordAmerica": 0, "Asia": 0 };
        
        for (let tId in territori) {
            if (territori[tId].proprietario === proprietari[giocatoreDiTurno].id) {
                totTerritori++;
                let cont = territori[tId].continente;
                if (conteggioPerContinente[cont] !== undefined) conteggioPerContinente[cont]++;
            }
        }

        if (totTerritori === 0) {
            window.passaProssimoGiocatoreRegolamentare();
            return;
        }

        let rinforzoBase = Math.max(3, 3 + Math.floor((totTerritori - 3) / 2));
        let continentiOccupati = [];
        let totaleBonusCont = 0;

        for (let nomeCont in configurazioneContinenti) {
            if (conteggioPerContinente[nomeCont] === configurazioneContinenti[nomeCont].totale) {
                continentiOccupati.push(nomeCont);
                totaleBonusCont += configurazioneContinenti[nomeCont].bonus;
            }
        }

        rinforziDisponibiliTurno = rinforzoBase + totaleBonusCont; 

        if (typeof aggiornaInterfacciaPartitaReale === "function") aggiornaInterfacciaPartitaReale();
        window.aggiornaLogRinforziTurno(totTerritori, rinforzoBase, continentiOccupati, totaleBonusCont);
        window.aggiornaPulsantiAreaComandi();
    } else {
        if (areaBottoni) areaBottoni.innerHTML = "";
        if (typeof aggiornaInterfacciaPartitaReale === "function") aggiornaInterfacciaPartitaReale();

        setTimeout(function() {
            if (typeof eseguiRinforziBot === "function") eseguiRinforziBot(giocatoreDiTurno);
        }, 800);
    }
};

window.aggiornaLogRinforziTurno = function(totTerritori, rinforzoBase, continentiOccupati, totaleBonusCont) {
    var areaLog = document.getElementById("log-messages");
    if (!areaLog) return;

    var testoContinenti = "Nessuno";
    if (continentiOccupati.length > 0) {
        testoContinenti = continentiOccupati.join(", ") + ` (+${totaleBonusCont} armate)`;
    }

    areaLog.innerHTML = `<b>&Egrave; il tuo Turno! (${proprietari[giocatoreDiTurno].nick})</b><br><br>` +
                        `Territori posseduti: <b>${totTerritori}</b> (Rinforzo base: +${rinforzoBase})<br>` +
                        `Continenti occupati: <span style="color:#FFFF33;"><b>${testoContinenti}</b></span><br><br>` +
                        `Hai in totale <b>${rinforziDisponibiliTurno}</b> armate da piazzare.<br><br>` +
                        `<i>Clicca sui tuoi territori colorati sulla mappa per distribuirle.</i>`;
};

window.aggiornaPulsantiAreaComandi = function() {
    var areaBottoni = document.getElementById("dynamic-buttons");
    if (!areaBottoni) return;
    areaBottoni.innerHTML = "";

    if (window.sottoFaseAttuale === 'fase_rinforzi') {
        var btnRinforzi = document.createElement("button");
        btnRinforzi.className = "btn-azione btn-attacco";
        if (rinforziDisponibiliTurno > 0) {
            btnRinforzi.textContent = `Piazza Rinforzi (${rinforziDisponibiliTurno})`;
            btnRinforzi.style.opacity = "0.5";
            btnRinforzi.disabled = true;
        } else {
            btnRinforzi.innerHTML = "VAI AD ATTACCO &raquo;";
            btnRinforzi.style.opacity = "1";
            btnRinforzi.style.backgroundColor = "#33FF33";
            btnRinforzi.style.color = "#000000";
            btnRinforzi.disabled = false;
            btnRinforzi.onclick = function() { window.avviaFaseAttaccoUfficiale(); };
        }
        areaBottoni.appendChild(btnRinforzi);
    }
    else if (window.sottoFaseAttuale === 'fase_attacco') {
        var infoFase = document.createElement("div");
        infoFase.innerHTML = "<span style='color:#FFFF33; font-weight:bold; display:block; text-align:center; margin-bottom:5px;'>Scegli sulla Mappa:</span>";
        areaBottoni.appendChild(infoFase);

        var btnManovra = document.createElement("button");
        btnManovra.textContent = "VAI A MANOVRA / SPOSTAMENTO";
        btnManovra.className = "btn-azione btn-passa";
        btnManovra.style.backgroundColor = "#FFA500"; 
        btnManovra.onclick = function() { window.avviaFaseManovraUfficiale(); };
        areaBottoni.appendChild(btnManovra);
    }
    else if (window.sottoFaseAttuale === 'fase_manovra') {
        var btnFineTurno = document.createElement("button");
        btnFineTurno.textContent = "PASSA IL TURNO DEFINITIVO";
        btnFineTurno.className = "btn-azione btn-passa";
        btnFineTurno.style.backgroundColor = "#333333";
        btnFineTurno.onclick = function() { window.passaProssimoGiocatoreRegolamentare(); };
        areaBottoni.appendChild(btnFineTurno);
    }
};

/**
 * FASI_GIOCO.JS - PARTE 2
 */

window.avviaFaseAttaccoUfficiale = function() {
    window.sottoFaseAttuale = 'fase_attacco';
    territorioAttaccanteSelezionato = null;
    territorioDifensoreSelezionato = null;
    window.aggiornaPulsantiAreaComandi();

    var areaLog = document.getElementById("log-messages");
    if (areaLog) {
        areaLog.innerHTML = `<b>Fase di Attacco! (${proprietari[giocatoreDiTurno].nick})</b><br><br>` +
                            `Ora puoi sferrare i tuoi attacchi.<br><br>` +
                            `<i>Fai clic su un tuo territorio per sceglierlo come attaccante.</i>`;
    }
};

window.gestisciClicFaseAttacco = function(codice) {
    var dati = territori[codice];
    var areaLog = document.getElementById("log-messages");
    if (!areaLog) return;

    if (territorioAttaccanteSelezionato === null) {
        if (dati.proprietario !== giocatoreDiTurno) {
            areaLog.innerHTML = `<span style="color:#FF3333; font-weight:bold;">&times; Errore: Puoi attaccare solo partendo da un tuo territorio!</span>`;
            return;
        }
        if (dati.armate < 2) {
            areaLog.innerHTML = `<span style="color:#FF3333; font-weight:bold;">&times; Errore: Servono almeno 2 armate per sferrare un attacco!</span>`;
            return;
        }

        territorioAttaccanteSelezionato = codice;
        areaLog.innerHTML = `<b>Territorio Attaccante: <span style="color:#33FF33;">${codice}</span></b> (Armate: ${dati.armate})<br><br>` +
                            `<i>Ora fai clic su un territorio CONFINANTE NEMICO o NEUTRALE.</i><br><br>` +
                            `<button class="btn-azione btn-passa" style="padding:5px; font-size:11px;" onclick="window.annullaSelezioneAttacco()">Annulla</button>`;
    }
    else {
        if (codice === territorioAttaccanteSelezionato) {
            window.annullaSelezioneAttacco();
            return;
        }

        if (dati.proprietario === giocatoreDiTurno) {
            areaLog.innerHTML = `<b>Territorio Attaccante: <span style="color:#33FF33;">${territorioAttaccanteSelezionato}</span></b><br><br>` +
                                `<span style="color:#FF3333; font-weight:bold;">&times; Errore: Non puoi attaccare un tuo stesso territorio!</span>`;
            return;
        }

        var datiAttaccante = territori[territorioAttaccanteSelezionato];
        if (!datiAttaccante.confini.includes(codice)) {
            areaLog.innerHTML = `<b>Territorio Attaccante: <span style="color:#33FF33;">${territorioAttaccanteSelezionato}</span></b><br><br>` +
                                `<span style="color:#FF3333; font-weight:bold;">&times; Errore: ${codice} non confina con ${territorioAttaccanteSelezionato}!</span>`;
            return;
        }

        territorioDifensoreSelezionato = codice;
        areaLog.innerHTML = `<b>BATTAGLIA DICHIARATA!</b><br><br>` +
                            `Attaccante: <b style="color:#33FF33;">${territorioAttaccanteSelezionato}</b> (Armate: ${datiAttaccante.armate})<br><br>` +
                            `Difensore: <b style="color:#FF3333;">${territorioDifensoreSelezionato}</b> (Armate: ${dati.armate})<br><br>` +
                            `<i>Clicca su "LANCIA DADI" per combattere!</i>`;

        window.mostraPulsanteLancioDadi();
    }
};

window.annullaSelezioneAttacco = function() {
    territorioAttaccanteSelezionato = null;
    territorioDifensoreSelezionato = null;
    window.avviaFaseAttaccoUfficiale();
};

window.mostraPulsanteLancioDadi = function() {
    var areaBottoni = document.getElementById("dynamic-buttons");
    if (!areaBottoni) return;
    areaBottoni.innerHTML = "";

    var btnLancia = document.createElement("button");
    btnLancia.textContent = "LANCIA DADI";
    btnLancia.className = "btn-azione btn-attacco";
    btnLancia.style.backgroundColor = "#FFFF33";
    btnLancia.style.color = "#000000";
    btnLancia.onclick = function() { if (typeof eseguiBattagliaDadi === "function") eseguiBattagliaDadi(); };

    var btnAnnulla = document.createElement("button");
    btnAnnulla.textContent = "ANNULLA ATTACCO";
    btnAnnulla.className = "btn-azione btn-passa";
    btnAnnulla.onclick = function() { window.annullaSelezioneAttacco(); };

    areaBottoni.appendChild(btnLancia);
    areaBottoni.appendChild(btnAnnulla);
};

window.piazzaRinforzoRegolamentareSuTerritorio = function(codice, giaPiazzato) {
    if (!giaPiazzato) {
        var dati = territori[codice];
        if (dati.proprietario === giocatoreDiTurno && rinforziDisponibiliTurno > 0) {
            dati.armate += 1;
            rinforziDisponibiliTurno -= 1;
            var elementoArmate = document.getElementById("armate-num-" + codice);
            if (elementoArmate) elementoArmate.textContent = dati.armate;
        }
    }

    window.aggiornaPulsantiAreaComandi();

    let totTerritori = 0;
    for (let tId in territori) {
        if (territori[tId].proprietario === giocatoreDiTurno) totTerritori++;
    }
    let rinforzoBase = Math.max(3, 3 + Math.floor((totTerritori - 3) / 2));

    var areaLog = document.getElementById("log-messages");
    if (areaLog) {
        if (rinforziDisponibiliTurno > 0) {
            areaLog.innerHTML = `<b>&Egrave; il tuo Turno! (${proprietari[giocatoreDiTurno].nick})</b><br><br>` +
                                `Territori posseduti: <b>${totTerritori}</b> (Rinforzo base: +${rinforzoBase})<br><br>` +
                                `Hai ancora <b>${rinforziDisponibiliTurno}</b> armate da piazzare.<br><br>` +
                                `<i>Clicca sui tuoi territori per distribuirle.</i>`;
        } else {
            areaLog.innerHTML = `<b>Rinforzi esauriti!</b><br><br>` +
                                `Il pulsante nell'area comandi &egrave; diventato verde.<br><br>` +
                                `Clicca su <b style="color:#33FF33;">"VAI AD ATTACCO &raquo;"</b> per sferrare i tuoi attacchi sulla mappa!`;
        }
    }
};

window.avviaFaseManovraUfficiale = function() {
    window.sottoFaseAttuale = 'fase_manovra';
    territorioAttaccanteSelezionato = null; 
    territorioDifensoreSelezionato = null;  
    window.aggiornaPulsantiAreaComandi();

    var areaLog = document.getElementById("log-messages");
    if (areaLog) {
        areaLog.innerHTML = `<b>Fase Spostamento Strategico!</b><br><br>` +
                            `Puoi effettuare spostamenti multipli tra tuoi territori confinanti.<br><br>` +
                            `<i>Fai clic sul tuo territorio da cui vuoi PRELEVARE le armate.</i>`;
    }
};

window.gestisciClicFaseManovra = function(codice) {
    var dati = territori[codice];
    var areaLog = document.getElementById("log-messages");
    if (!areaLog) return;

    if (territorioAttaccanteSelezionato === null) {
        if (dati.proprietario !== giocatoreDiTurno) {
            areaLog.innerHTML = `<b>Fase Spostamento</b><br><br><span style="color:#FF3333; font-weight:bold;">&times; Errore: Puoi prelevare armate solo da un tuo territorio!</span>`;
            return;
        }
        if (dati.armate < 2) {
            areaLog.innerHTML = `<b>Fase Spostamento</b><br><br><span style="color:#FF3333; font-weight:bold;">&times; Errore: Deve rimanere almeno 1 armata di presidio! Servono almeno 2 armate per spostare.</span>`;
            return;
        }

        territorioAttaccanteSelezionato = codice;
        areaLog.innerHTML = `<b>Partenza Spostamento: <span style="color:#33FF33;">${codice}</span></b> (Disponibili: ${dati.armate - 1})<br><br>` +
                            `<i>Ora fai clic su un TUO territorio CONFINANTE dove trasferire le truppe.</i><br><br>` +
                            `<button class="btn-azione btn-passa" style="padding:5px; font-size:11px;" onclick="window.avviaFaseManovraUfficiale()">Annulla</button>`;
    }
    else {
        if (codice === territorioAttaccanteSelezionato) {
            window.avviaFaseManovraUfficiale();
            return;
        }

        if (dati.proprietario !== giocatoreDiTurno) {
            areaLog.innerHTML = `<b>Partenza Spostamento: <span style="color:#33FF33;">${territorioAttaccanteSelezionato}</span></b><br><br>` +
                                `<span style="color:#FF3333; font-weight:bold;">&times; Errore: Puoi spostare truppe solo verso un altro TUO territorio!</span>`;
            return;
        }

        var datiPartenza = territori[territorioAttaccanteSelezionato];
        if (!datiPartenza.confini.includes(codice)) {
            areaLog.innerHTML = `<b>Partenza Spostamento: <span style="color:#33FF33;">${territorioAttaccanteSelezionato}</span></b><br><br>` +
                                `<span style="color:#FF3333; font-weight:bold;">&times; Errore: ${codice} non confina con ${territorioAttaccanteSelezionato}!</span>`;
            return;
        }

        territorioDifensoreSelezionato = codice;
        let massimoSpostabile = datiPartenza.armate - 1;
        let inputUtente = prompt(`Quante armate vuoi spostare da ${territorioAttaccanteSelezionato} a ${territorioDifensoreSelezionato}?\n(Massimo spostabile: ${massimoSpostabile})`, massimoSpostabile);
        
        if (inputUtente === null || inputUtente.trim() === "") {
            window.avviaFaseManovraUfficiale();
            return;
        }

        let armateDaSpostare = parseInt(inputUtente, 10);
        if (isNaN(armateDaSpostare) || armateDaSpostare <= 0 || armateDaSpostare > massimoSpostabile) {
            alert(`Numero non valido! Inserisci un valore compreso tra 1 e ${massimoSpostabile}.`);
            window.avviaFaseManovraUfficiale();
            return;
        }
        
        datiPartenza.armate -= armateDaSpostare;
        dati.armate += armateDaSpostare;

        var graficAtt = document.getElementById("armate-num-" + territorioAttaccanteSelezionato);
        var graficDif = document.getElementById("armate-num-" + territorioDifensoreSelezionato);
        if (graficAtt) graficAtt.textContent = datiPartenza.armate;
        if (graficDif) graficDif.textContent = dati.armate;

        territorioAttaccanteSelezionato = null;
        territorioDifensoreSelezionato = null;

        areaLog.innerHTML = `<b>SPOSTAMENTO COMPLETATO!</b><br><br>` +
                            `Trasferite <b>${armateDaSpostare}</b> armate.<br><br>` +
                            `<i>Puoi selezionare un altro territorio per un nuovo spostamento oppure premere il pulsante in basso per passare il turno.</i>`;

        window.aggiornaPulsantiAreaComandi();
    }
};

window.passaProssimoGiocatoreRegolamentare = function() {
    territorioAttaccanteSelezionato = null;
    territorioDifensoreSelezionato = null;

    giocatoreDiTurno++;
    let nuovoGiro = false;

    if (giocatoreDiTurno > 6) {
        giocatoreDiTurno = 1;
        nuovoGiro = true; // È finito il giro completo, sta per iniziare il turno del Giocatore 1
    }

    const proseguiConTurno = function() {
        var pannelloLaterale = document.getElementById("side-panel");
        if (pannelloLaterale && proprietari[giocatoreDiTurno]) {
            pannelloLaterale.style.backgroundColor = proprietari[giocatoreDiTurno].colore;
        }
        window.avviaTurnoRegolamentare();
    };

    // La rivolta viene controllata SOLO all'inizio di un nuovo giro (quando tocca al Giocatore 1)
    if (nuovoGiro && typeof window.controllaEScattaRivoluzione === "function") {
        window.controllaEScattaRivoluzione(proseguiConTurno);
    } else {
        proseguiConTurno();
    }
};
