// =========================================================================
// CARTE TERRITORIO E TRIS RINFORZI (carte.js)
// =========================================================================

window.mazzoCarte = [];
window.maniGiocatori = {}; // { 1: [...], 2: [...], ... }
window.conquistaNelTurno = false;

const SIMBOLI_CARTE = ["Fante", "Cavaliere", "Cannone"];

// 1. Crea e mescola il mazzo da 62 carte (60 territori + 2 Jolly)
window.inizializzaMazzoCarte = function() {
    if (typeof territori === "undefined") return;
    window.mazzoCarte = [];
    window.maniGiocatori = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    let codici = Object.keys(territori);
    codici.forEach(function(cod, idx) {
        window.mazzoCarte.push({
            territorio: cod,
            simbolo: SIMBOLI_CARTE[idx % 3]
        });
    });

    // Aggiunge 2 Jolly
    window.mazzoCarte.push({ territorio: "JOLLY", simbolo: "Jolly" });
    window.mazzoCarte.push({ territorio: "JOLLY", simbolo: "Jolly" });

    // Mescola il mazzo
    window.mazzoCarte.sort(() => Math.random() - 0.5);
};

// 2. Pesca una carta a fine turno se c'è stata almeno una conquista
window.pescaCartaSeConquistato = function(idG) {
    if (!window.conquistaNelTurno || !idG || idG === 0 || idG === "NEUTRALE") return;
    window.conquistaNelTurno = false;

    if (window.mazzoCarte.length === 0) {
        // Ricrea carte se il mazzo dovesse esaurirsi
        let codici = Object.keys(territori);
        codici.forEach((c, i) => window.mazzoCarte.push({ territorio: c, simbolo: SIMBOLI_CARTE[i % 3] }));
        window.mazzoCarte.sort(() => Math.random() - 0.5);
    }

    let carta = window.mazzoCarte.pop();
    if (!window.maniGiocatori[idG]) window.maniGiocatori[idG] = [];
    window.maniGiocatori[idG].push(carta);

    let logBox = document.getElementById("log-messages");
    if (logBox && typeof proprietari !== "undefined" && proprietari[idG]) {
        let isBot = (typeof window.isGiocatoreBot === "function") && window.isGiocatoreBot(idG);
        let dettaglio = isBot ? "una Carta Territorio segreta" : `<b>${carta.simbolo}</b> (${carta.territorio})`;
        logBox.innerHTML = `<span style="color:#00FFFF;">&#127183; ${proprietari[idG].nick} pesca ${dettaglio}!</span><br>` + logBox.innerHTML;
    }
};

// 3. Trova il miglior Tris giocabile nella mano di un giocatore
window.trovaMigliorTris = function(mano) {
    if (!mano || mano.length < 3) return null;

    let fanti = mano.map((c, i) => ({ c, i })).filter(x => x.c.simbolo === "Fante");
    let cav = mano.map((c, i) => ({ c, i })).filter(x => x.c.simbolo === "Cavaliere");
    let can = mano.map((c, i) => ({ c, i })).filter(x => x.c.simbolo === "Cannone");
    let jolly = mano.map((c, i) => ({ c, i })).filter(x => x.c.simbolo === "Jolly");

    // Priorità dal bonus più alto al più basso
    if (jolly.length >= 1 && fanti.length >= 2) return { indici: [jolly.at(0).i, fanti.at(0).i, fanti.at(1).i], bonus: 12, nome: "Jolly + 2 Fanti" };
    if (jolly.length >= 1 && cav.length >= 2)   return { indici: [jolly.at(0).i, cav.at(0).i, cav.at(1).i],     bonus: 12, nome: "Jolly + 2 Cavalieri" };
    if (jolly.length >= 1 && can.length >= 2)   return { indici: [jolly.at(0).i, can.at(0).i, can.at(1).i],     bonus: 12, nome: "Jolly + 2 Cannoni" };

    if (fanti.length >= 1 && cav.length >= 1 && can.length >= 1) {
        return { indici: [fanti.at(0).i, cav.at(0).i, can.at(0).i], bonus: 10, nome: "Tris Misto (Fante+Cav+Can)" };
    }
    if (cav.length >= 3)   return { indici: [cav.at(0).i, cav.at(1).i, cav.at(2).i],       bonus: 8, nome: "3 Cavalieri" };
    if (fanti.length >= 3) return { indici: [fanti.at(0).i, fanti.at(1).i, fanti.at(2).i], bonus: 6, nome: "3 Fanti" };
    if (can.length >= 3)   return { indici: [can.at(0).i, can.at(1).i, can.at(2).i],       bonus: 4, nome: "3 Cannoni" };
    return null;
};

// 4. Gioca il Tris e assegna le armate di rinforzo
window.giocaTrisGiocatore = function(idG, chiudiModale) {
    let mano = window.maniGiocatori[idG];
    let tris = window.trovaMigliorTris(mano);
    if (!tris) return false;

    // Calcola eventuale bonus +2 per territori posseduti sulle carte giocate
    let bonusTerritori = 0;
    let carteGiocate = tris.indici.map(idx => mano[idx]);
    carteGiocate.forEach(function(carta) {
        if (carta.territorio !== "JOLLY" && territori[carta.territorio] && territori[carta.territorio].proprietario === idG) {
            bonusTerritori += 2;
        }
    });

    // Rimuove le 3 carte dalla mano (in ordine decrescente di indice)
    tris.indici.sort((a, b) => b - a).forEach(idx => mano.splice(idx, 1));

    let totaleBonus = tris.bonus + bonusTerritori;
    if (typeof rinforziDaPiazzare !== "undefined") {
        rinforziDaPiazzare += totaleBonus;
        if (typeof aggiornaInterfacciaRinforzi === "function") aggiornaInterfacciaRinforzi();
    }

    let logBox = document.getElementById("log-messages");
    if (logBox && typeof proprietari !== "undefined") {
        logBox.innerHTML = `<b style="color:#33FF33;">&#9733; TRIS GIOCATO da ${proprietari[idG].nick}!</b> (${tris.nome}) &rarr; <b>+${totaleBonus} Armate!</b><br>` + logBox.innerHTML;
    }

    if (chiudiModale) {
        let m = document.getElementById("modale-carte-giocatore");
        if (m) m.remove();
    }
    return true;
};

// 5. Finestra modale per vedere le proprie carte e giocare un Tris
window.mostraFinestraCarte = function() {
    if (typeof giocatoreDiTurno === "undefined") return;
    let mano = window.maniGiocatori[giocatoreDiTurno] || [];
    let g = proprietari[giocatoreDiTurno];
    let tris = window.trovaMigliorTris(mano);
    let puoGiocare = (typeof faseAttuale !== "undefined" && faseAttuale === "RINFORZI" && tris !== null);

    let elencoHTML = mano.length === 0
        ? "<p style='color:#AAA;'>Non hai ancora carte. Conquista almeno un territorio nel tuo turno per pescarne una!</p>"
        : mano.map(c => {
            let posseduto = (c.territorio !== "JOLLY" && territori[c.territorio] && territori[c.territorio].proprietario === giocatoreDiTurno);
            return `<div style="background:rgba(255,255,255,0.1); padding:8px 12px; border-radius:6px; margin:5px 0; display:flex; justify-content:space-between;">
                <span><b>${c.simbolo}</b> &mdash; ${c.territorio}</span>
                ${posseduto ? "<span style='color:#33FF33; font-size:12px;'>(+2 Bonus)</span>" : ""}
            </div>`;
        }).join("");

    let modale = document.createElement("div");
    modale.id = "modale-carte-giocatore";
    modale.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.82); display:flex; align-items:center; justify-content:center; z-index:10001; font-family:Arial,sans-serif;";
    modale.innerHTML = `
        <div style="background:#1c1c1c; border:3px solid ${g.colore}; border-radius:12px; padding:24px; max-width:440px; width:90%; color:#FFF; text-align:center;">
            <h2 style="color:#00FFFF; margin-top:0;">&#127183; Carte di ${g.nick} (${mano.length})</h2>
            <div style="max-height:220px; overflow-y:auto; margin:15px 0; text-align:left;">${elencoHTML}</div>
            ${puoGiocare
                ? `<button onclick="window.giocaTrisGiocatore(giocatoreDiTurno, true)" style="width:100%; padding:12px; background:#33FF33; color:#000; font-weight:bold; border:none; border-radius:6px; cursor:pointer; margin-bottom:10px;">GIOCA TRIS: ${tris.nome} (+${tris.bonus} Armate)</button>`
                : (tris ? "<p style='color:#FFD700; font-size:12px;'>Hai un Tris pronto! Potrai giocarlo all'inizio della tua prossima Fase Rinforzi.</p>" : "")
            }
            <button onclick="this.parentElement.parentElement.remove()" style="padding:8px 22px; background:#444; color:#FFF; border:1px solid #FFF; border-radius:6px; cursor:pointer;">CHIUDI</button>
        </div>
    `;
    document.body.appendChild(modale);
};

// =========================================================================
// AGGANCIO AUTOMATICO AL FLUSSO DI GIOCO
// =========================================================================
window.addEventListener("load", function() {
    setInterval(function() {
        var gameArea = document.getElementById("game-area");
        var controlArea = document.getElementById("control-area");
        if (!gameArea || gameArea.classList.contains("hidden") || !controlArea) return;

        if (window.mazzoCarte.length === 0 && Object.keys(window.maniGiocatori).length === 0) {
            window.inizializzaMazzoCarte();
        }

        let btnCarte = document.getElementById("btn-vedi-carte");
        if (!btnCarte) {
            btnCarte = document.createElement("button");
            btnCarte.id = "btn-vedi-carte";
            btnCarte.className = "btn-azione";
            btnCarte.style.cssText = "background-color:#112233; color:#00FFFF; border:1px solid #00FFFF; font-size:12px; padding:6px; margin-bottom:6px;";
            btnCarte.onclick = window.mostraFinestraCarte;
            controlArea.insertBefore(btnCarte, document.getElementById("dynamic-buttons"));
        }

        if (typeof giocatoreDiTurno !== "undefined") {
            let num = (window.maniGiocatori[giocatoreDiTurno] || []).length;
            btnCarte.innerHTML = `&#127183; LE MIE CARTE (${num})`;
            let isBot = (typeof window.isGiocatoreBot === "function") && window.isGiocatoreBot(giocatoreDiTurno);
            btnCarte.style.display = isBot ? "none" : "block";
        }
    }, 500);

    // Registra la conquista quando scatta la logistica post-battaglia
    if (typeof window.registraBattagliaLogistica === "function") {
        var origReg = window.registraBattagliaLogistica;
        window.registraBattagliaLogistica = function(att, dif, conquistato, vecchioProp) {
            if (conquistato) window.conquistaNelTurno = true;
            return origReg.apply(this, arguments);
        };
    }

    // Pesca la carta a fine turno e gioca automaticamente il Tris per i Bot
    if (typeof window.avviaTurnoRegolamentare === "function") {
        var origTurno = window.avviaTurnoRegolamentare;
        var ultimoGiocatoreTurno = null;

        window.avviaTurnoRegolamentare = function() {
            if (ultimoGiocatoreTurno !== null) {
                window.pescaCartaSeConquistato(ultimoGiocatoreTurno);
            }
            window.conquistaNelTurno = false;
            origTurno.apply(this, arguments);

            if (typeof giocatoreDiTurno !== "undefined") {
                ultimoGiocatoreTurno = giocatoreDiTurno;
                if (typeof window.isGiocatoreBot === "function" && window.isGiocatoreBot(giocatoreDiTurno)) {
                    window.giocaTrisGiocatore(giocatoreDiTurno, false);
                }
            }
        };
    }
});

