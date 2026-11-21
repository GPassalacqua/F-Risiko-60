// =========================================================================
// SPIONAGGIO, MERCATO NERO E DIPLOMAZIA (spionaggio_diplomazia.js)
// =========================================================================

window.pattiNonAggressione = []; // [{ g1: 1, g2: 3, turniRimasti: 2 }, ...]

// 1. Verifica se esiste un patto attivo tra due giocatori
window.esistePattoTra = function(idA, idB) {
    if (!idA || !idB || idA === idB) return false;
    return window.pattiNonAggressione.some(p =>
        p.turniRimasti > 0 && ((p.g1 === idA && p.g2 === idB) || (p.g1 === idB && p.g2 === idA))
    );
};

// 2. Aggiorna la durata dei patti a inizio turno
window.aggiornaPattiInizioTurno = function(idG) {
    window.pattiNonAggressione.forEach(p => {
        if (p.g1 === idG && p.turniRimasti > 0) {
            p.turniRimasti--;
        }
    });
    window.pattiNonAggressione = window.pattiNonAggressione.filter(p => p.turniRimasti > 0);
};

// 3. Azioni di Spionaggio (pagate in Cibo)
window.eseguiSpiaObiettivo = function(idBersaglio) {
    var mioId = giocatoreDiTurno;
    if ((window.scorteCapitale[mioId] || 0) < 8) return alert("Servono almeno 8 scorte di Cibo!");
    window.scorteCapitale[mioId] -= 8;

    var ob = (window.obiettiviGiocatori && window.obiettiviGiocatori[idBersaglio]) ? window.obiettiviGiocatori[idBersaglio] : null;
    var nomeB = proprietari[idBersaglio].nick;
    alert(ob ? `RAPPORTO SPIE su ${nomeB}:\n\nObiettivo: ${ob.titolo}\n"${ob.descrizione}"` : `Nessun obiettivo trovato per ${nomeB}.`);
};

window.eseguiSabotaggio = function(idBersaglio) {
    var mioId = giocatoreDiTurno;
    if ((window.scorteCapitale[mioId] || 0) < 10) return alert("Servono almeno 10 scorte di Cibo!");
    window.scorteCapitale[mioId] -= 10;

    var perso = Math.min(8, window.scorteCapitale[idBersaglio] || 0);
    window.scorteCapitale[idBersaglio] = Math.max(0, (window.scorteCapitale[idBersaglio] || 0) - perso);

    var logBox = document.getElementById("log-messages");
    if (logBox) {
        logBox.innerHTML = `<b style="color:#FF8800;">&#128163; SABOTAGGIO!</b> Le spie di ${proprietari[mioId].nick} distruggono <b>${perso} Cibo</b> nella Capitale di ${proprietari[idBersaglio].nick}!<br>` + logBox.innerHTML;
    }
    var m = document.getElementById("modale-spionaggio");
    if (m) m.remove();
};

window.eseguiCorruzioneEuno = function() {
    var mioId = giocatoreDiTurno;
    if ((window.scorteCapitale[mioId] || 0) < 12) return alert("Servono almeno 12 scorte di Cibo!");

    var candidati = Object.keys(territori).filter(c =>
        (territori[c].proprietario === 0 || territori[c].proprietario === "NEUTRALE") && territori[c].armate <= 2
    );
    if (candidati.length === 0) return alert("Nessun territorio di Euno con 1-2 armate disponibile!");

    window.scorteCapitale[mioId] -= 12;
    var scelto = candidati[Math.floor(Math.random() * candidati.length)];
    territori[scelto].proprietario = mioId;

    var pathEl = document.getElementById(scelto);
    if (pathEl && proprietari[mioId]) pathEl.style.fill = proprietari[mioId].colore;

    var logBox = document.getElementById("log-messages");
    if (logBox) {
        logBox.innerHTML = `<b style="color:#33FF33;">&#129309; CORRUZIONE RIUSCITA!</b> ${proprietari[mioId].nick} corrompe la guarnigione di <b>${scelto}</b> e lo annette!<br>` + logBox.innerHTML;
    }
    var m = document.getElementById("modale-spionaggio");
    if (m) m.remove();
};

// 4. Proposta Patto di Non Aggressione (2 turni)
window.proponiPatto = function(idAlleato) {
    var mioId = giocatoreDiTurno;
    if (window.esistePattoTra(mioId, idAlleato)) return alert("Avete gia un Patto attivo!");

    var isBot = (typeof window.isGiocatoreBot === "function") && window.isGiocatoreBot(idAlleato);
    var accetta = isBot ? (Math.random() < 0.65) : confirm(`${proprietari[mioId].nick} propone un Patto di Non Aggressione di 2 turni a ${proprietari[idAlleato].nick}. Accetti?`);

    if (accetta) {
        window.pattiNonAggressione.push({ g1: mioId, g2: idAlleato, turniRimasti: 2 });
        var logBox = document.getElementById("log-messages");
        if (logBox) {
            logBox.innerHTML = `<b style="color:#00FFFF;">&#128330; PATTO FIRMATO!</b> Tregua di 2 turni tra <b>${proprietari[mioId].nick}</b> e <b>${proprietari[idAlleato].nick}</b>!<br>` + logBox.innerHTML;
        }
    } else {
        alert(`${proprietari[idAlleato].nick} ha rifiutato il Patto di Non Aggressione!`);
    }
    var m = document.getElementById("modale-spionaggio");
    if (m) m.remove();
};

// 5. Finestra Modale Console Spionaggio & Diplomazia
window.mostraConsoleSpionaggio = function() {
    var mioId = giocatoreDiTurno;
    var cibo = (window.scorteCapitale && window.scorteCapitale[mioId]) ? window.scorteCapitale[mioId] : 0;

    var avversariHTML = "";
    for (let id = 1; id <= 6; id++) {
        if (id === mioId) continue;
        let haTerritori = Object.keys(territori).some(c => territori[c].proprietario === id);
        if (!haTerritori) continue;

        let pattoAttivo = window.esistePattoTra(mioId, id);
        avversariHTML += `
            <div style="background:rgba(255,255,255,0.08); padding:8px; border-radius:6px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:4px; flex-wrap:wrap;">
                <b style="color:${proprietari[id].colore};">${proprietari[id].nick}</b>
                <div>
                    <button onclick="window.eseguiSpiaObiettivo(${id})" style="font-size:11px; padding:4px 6px; cursor:pointer;">Spia (8 Cibo)</button>
                    <button onclick="window.eseguiSabotaggio(${id})" style="font-size:11px; padding:4px 6px; cursor:pointer;">Sabota (10 Cibo)</button>
                    ${pattoAttivo
                        ? `<span style="color:#00FFFF; font-size:11px; margin-left:4px;">[Patto Attivo]</span>`
                        : `<button onclick="window.proponiPatto(${id})" style="font-size:11px; padding:4px 6px; background:#004466; color:#FFF; cursor:pointer;">Patto 2T</button>`}
                </div>
            </div>`;
    }

    var modale = document.createElement("div");
    modale.id = "modale-spionaggio";
    modale.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.84); display:flex; align-items:center; justify-content:center; z-index:10001; font-family:Arial,sans-serif;";
    modale.innerHTML = `
        <div style="background:#1c1c1c; border:2px solid #00FFFF; border-radius:12px; padding:20px; max-width:480px; width:92%; color:#FFF;">
            <h3 style="color:#00FFFF; margin-top:0; text-align:center;">&#128373; Spionaggio &amp; Diplomazia (Cibo: ${cibo}/40)</h3>
            <div style="margin-bottom:12px; text-align:center;">
                <button onclick="window.eseguiCorruzioneEuno()" style="padding:8px 14px; background:#225522; color:#FFF; border:1px solid #33FF33; border-radius:6px; cursor:pointer; font-weight:bold;">
                    &#129309; Corrompi Territorio di Euno (12 Cibo)
                </button>
            </div>
            <div style="max-height:240px; overflow-y:auto;">${avversariHTML}</div>
            <div style="text-align:center; margin-top:14px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding:8px 22px; background:#444; color:#FFF; border:1px solid #FFF; border-radius:6px; cursor:pointer;">CHIUDI</button>
            </div>
        </div>
    `;
    document.body.appendChild(modale);
};

// =========================================================================
// AGGANCIO AUTOMATICO A TURNI, BATTAGLIE E INTERFACCIA
// =========================================================================
window.addEventListener("load", function() {
    setInterval(function() {
        var gameArea = document.getElementById("game-area");
        var controlArea = document.getElementById("control-area");
        if (!gameArea || gameArea.classList.contains("hidden") || !controlArea) return;

        let btnSpia = document.getElementById("btn-spionaggio-diplomazia");
        if (!btnSpia) {
            btnSpia = document.createElement("button");
            btnSpia.id = "btn-spionaggio-diplomazia";
            btnSpia.innerHTML = "&#128373; SPIONAGGIO &amp; PATTI";
            btnSpia.className = "btn-azione";
            btnSpia.style.cssText = "background-color:#1a2639; color:#88CCFF; border:1px solid #88CCFF; font-size:11px; padding:6px; margin-bottom:6px;";
            btnSpia.onclick = window.mostraConsoleSpionaggio;
            controlArea.insertBefore(btnSpia, document.getElementById("dynamic-buttons"));
        }

        if (typeof giocatoreDiTurno !== "undefined") {
            let isBot = (typeof window.isGiocatoreBot === "function") && window.isGiocatoreBot(giocatoreDiTurno);
            btnSpia.style.display = isBot ? "none" : "block";
        }
    }, 550);

    // Impedisce attacchi se esiste un Patto di Non Aggressione attivo
    if (typeof window.eseguiBattagliaDadi === "function") {
        var origBattaglia = window.eseguiBattagliaDadi;
        window.eseguiBattagliaDadi = function() {
            if (typeof territorioAttaccanteSelezionato !== "undefined" && typeof territorioDifensoreSelezionato !== "undefined" &&
                territorioAttaccanteSelezionato && territorioDifensoreSelezionato) {
                var pAtt = territori[territorioAttaccanteSelezionato].proprietario;
                var pDif = territori[territorioDifensoreSelezionato].proprietario;
                if (window.esistePattoTra(pAtt, pDif)) {
                    alert("Attacco bloccato: hai un Patto di Non Aggressione attivo con questo giocatore!");
                    return;
                }
            }
            return origBattaglia.apply(this, arguments);
        };
    }

    // Aggiorna la scadenza dei patti a inizio turno
    if (typeof window.avviaTurnoRegolamentare === "function") {
        var origTurnoPatto = window.avviaTurnoRegolamentare;
        window.avviaTurnoRegolamentare = function() {
            if (typeof giocatoreDiTurno !== "undefined") {
                window.aggiornaPattiInizioTurno(giocatoreDiTurno);
            }
            origTurnoPatto.apply(this, arguments);
        };
    }
});

// =========================================================================
// PROTEZIONE PRIVACY: NASCONDE I PULSANTI SEGRETI DURANTE IL TURNO DEI BOT
// =========================================================================
setInterval(function() {
    if (typeof giocatoreDiTurno === "undefined" || typeof proprietari === "undefined" || !proprietari[giocatoreDiTurno]) return;

    var nick = proprietari[giocatoreDiTurno].nick || "";
    var isBot = (typeof window.isGiocatoreBot === "function" && window.isGiocatoreBot(giocatoreDiTurno)) ||
                nick.toLowerCase().startsWith("robby") ||
                nick.toLowerCase().startsWith("robbi");

    var ids = ["btn-vedi-obiettivo", "btn-vedi-carte", "btn-spionaggio-diplomazia"];
    ids.forEach(function(idBtn) {
        var el = document.getElementById(idBtn);
        if (el) {
            el.style.setProperty("display", isBot ? "none" : "inline-block", "important");
        }
    });
}, 200);
