// =========================================================================
// CARTE OBIETTIVO SEGRETE (obiettivi.js)
// =========================================================================

window.obiettiviGiocatori = {}; // Salva l'obiettivo assegnato a ogni giocatore (1..6)

const MAZZO_OBIETTIVI = [
    {
        id: "conquista_24",
        titolo: "Egemonia Globale",
        descrizione: "Conquista almeno 24 territori qualsiasi sulla mappa.",
        verifica: function(idG) {
            return Object.keys(territori).filter(c => territori[c].proprietario === idG).length >= 24;
        }
    },
    {
        id: "conquista_20_presidio",
        titolo: "Impero Fortificato",
        descrizione: "Conquista almeno 20 territori e mantieni su ciascuno almeno 2 armate.",
        verifica: function(idG) {
            let validi = Object.keys(territori).filter(c => territori[c].proprietario === idG && territori[c].armate >= 2);
            return validi.length >= 20;
        }
    },
    {
        id: "eu_oc",
        titolo: "Asse Euro-Oceanico",
        descrizione: "Conquista la totalità di Europa (9) e Oceania (7), più altri 4 territori a scelta.",
        verifica: function(idG) {
            let miei = Object.keys(territori).filter(c => territori[c].proprietario === idG);
            let eu = miei.filter(c => territori[c].continente === "Europa").length === 9;
            let oc = miei.filter(c => territori[c].continente === "Oceania").length === 7;
            return eu && oc && miei.length >= 20;
        }
    },
    {
        id: "na_sa",
        titolo: "Padrone delle Americhe",
        descrizione: "Conquista la totalità di Nord America (12) e Sud America (8).",
        verifica: function(idG) {
            let miei = Object.keys(territori).filter(c => territori[c].proprietario === idG);
            let na = miei.filter(c => territori[c].continente === "NordAmerica").length === 12;
            let sa = miei.filter(c => territori[c].continente === "SudAmerica").length === 8;
            return na && sa;
        }
    },
    {
        id: "as_sa",
        titolo: "Conquista Oriente e Sud",
        descrizione: "Conquista la totalità di Asia (14) e Sud America (8).",
        verifica: function(idG) {
            let miei = Object.keys(territori).filter(c => territori[c].proprietario === idG);
            let as = miei.filter(c => territori[c].continente === "Asia").length === 14;
            let sa = miei.filter(c => territori[c].continente === "SudAmerica").length === 8;
            return as && sa;
        }
    },
    {
        id: "af_eu",
        titolo: "Impero del Mediterraneo",
        descrizione: "Conquista la totalità di Africa (10) ed Europa (9), più altri 3 territori a scelta.",
        verifica: function(idG) {
            let miei = Object.keys(territori).filter(c => territori[c].proprietario === idG);
            let af = miei.filter(c => territori[c].continente === "Africa").length === 10;
            let eu = miei.filter(c => territori[c].continente === "Europa").length === 9;
            return af && eu && miei.length >= 22;
        }
    },
    {
        id: "as_oc",
        titolo: "Dominio del Pacifico",
        descrizione: "Conquista la totalità di Asia (14) e Oceania (7).",
        verifica: function(idG) {
            let miei = Object.keys(territori).filter(c => territori[c].proprietario === idG);
            let as = miei.filter(c => territori[c].continente === "Asia").length === 14;
            let oc = miei.filter(c => territori[c].continente === "Oceania").length === 7;
            return as && oc;
        }
    },
    {
        id: "af_na",
        titolo: "Signore dell'Atlantico",
        descrizione: "Conquista la totalità di Africa (10) e Nord America (12).",
        verifica: function(idG) {
            let miei = Object.keys(territori).filter(c => territori[c].proprietario === idG);
            let af = miei.filter(c => territori[c].continente === "Africa").length === 10;
            let na = miei.filter(c => territori[c].continente === "NordAmerica").length === 12;
            return af && na;
        }
    },
    {
        id: "abbondanza",
        titolo: "Granaio del Mondo",
        descrizione: "Accumula almeno 35 scorte di Cibo nella tua Capitale e controlla almeno 18 territori sazi.",
        verifica: function(idG) {
            let cibo = (window.scorteCapitale && window.scorteCapitale[idG]) ? window.scorteCapitale[idG] : 0;
            let sazi = Object.keys(territori).filter(c => territori[c].proprietario === idG && territori[c].isSazio !== false).length;
            return cibo >= 35 && sazi >= 18;
        }
    },
    {
        id: "tre_continenti",
        titolo: "Triplice Alleanza",
        descrizione: "Conquista interamente almeno 3 continenti qualsiasi.",
        verifica: function(idG) {
            if (typeof configurazioneContinenti === "undefined") return false;
            let contCompletati = 0;
            for (let nomeCont in configurazioneContinenti) {
                let tot = configurazioneContinenti[nomeCont].totale;
                let posseduti = Object.keys(territori).filter(c => territori[c].proprietario === idG && territori[c].continente === nomeCont).length;
                if (posseduti === tot) contCompletati++;
            }
            return contCompletati >= 3;
        }
    }
];

// 1. Distribuisce un obiettivo segreto unico a ciascuno dei 6 giocatori
window.assegnaObiettiviSegreti = function() {
    window.obiettiviGiocatori = {};
    let mazzoMescolato = [...MAZZO_OBIETTIVI].sort(() => Math.random() - 0.5);

    for (let id = 1; id <= 6; id++) {
        window.obiettiviGiocatori[id] = mazzoMescolato[(id - 1) % mazzoMescolato.length];
    }
};

// 2. Mostra una finestra modale segreta con l'obiettivo del giocatore umano di turno
window.mostraFinestraObiettivo = function() {
    if (typeof giocatoreDiTurno === "undefined" || !window.obiettiviGiocatori[giocatoreDiTurno]) return;

    let ob = window.obiettiviGiocatori[giocatoreDiTurno];
    let g = proprietari[giocatoreDiTurno];

    let modale = document.createElement("div");
    modale.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:10001; font-family:Arial,sans-serif;";
    modale.innerHTML = `
        <div style="background:#1c1c1c; border:3px solid ${g.colore}; border-radius:12px; padding:25px 30px; max-width:420px; text-align:center; color:#FFF; box-shadow:0 0 25px #000;">
            <div style="font-size:13px; text-transform:uppercase; color:#AAA; letter-spacing:1px;">Missione Segreta di ${g.nick}</div>
            <h2 style="color:#FFD700; margin:10px 0;">&#127919; ${ob.titolo}</h2>
            <p style="font-size:16px; line-height:1.5; margin:15px 0; background:rgba(255,255,255,0.08); padding:12px; border-radius:8px;">${ob.descrizione}</p>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top:10px; padding:10px 25px; background:${g.colore}; color:#FFF; border:2px solid #FFF; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px;">HO CAPITO (NASCONDI)</button>
        </div>
    `;
    document.body.appendChild(modale);
};

// 3. Controlla se il giocatore ha completato il suo Obiettivo Segreto
window.verificaVittoriaObiettivo = function(idGiocatore) {
    let ob = window.obiettiviGiocatori[idGiocatore];
    if (!ob || typeof ob.verifica !== "function") return false;

    if (ob.verifica(idGiocatore)) {
        let vincitore = proprietari[idGiocatore];
        let overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.88); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10002; color:#FFF; text-align:center; font-family:sans-serif; padding:20px;";

        overlay.innerHTML = `
            <div style="border:4px solid ${vincitore.colore}; background:#1a1a1a; padding:35px 45px; border-radius:16px; box-shadow:0 0 40px ${vincitore.colore}; max-width:520px;">
                <div style="font-size:48px; margin-bottom:10px;">&#127942;</div>
                <h1 style="color:#FFD700; margin:0 0 10px 0; font-size:30px;">OBIETTIVO RAGGIUNTO!</h1>
                <p style="font-size:20px; margin:12px 0;"><b style="color:${vincitore.colore}; font-size:26px;">${vincitore.nick}</b> ha vinto la partita!</p>
                <div style="background:rgba(255,255,255,0.1); padding:12px; border-radius:8px; margin:15px 0;">
                    <b style="color:#FFFF33;">${ob.titolo}:</b><br>${ob.descrizione}
                </div>
                <button onclick="location.reload()" style="margin-top:15px; padding:12px 28px; font-size:16px; font-weight:bold; background:#33FF33; color:#000; border:none; border-radius:8px; cursor:pointer;">NUOVA PARTITA</button>
            </div>
        `;
        document.body.appendChild(overlay);

        let listaCodici = Object.keys(territori);
        setInterval(() => {
            if (typeof window.lanciaFuochiTerritorio === "function" && listaCodici.length > 0) {
                let randCod = listaCodici[Math.floor(Math.random() * listaCodici.length)];
                window.lanciaFuochiTerritorio(randCod, [vincitore.colore, "#FFD700", "#FFFFFF", "#33FF33"]);
            }
        }, 800);

        return true;
    }
    return false;
};


// =========================================================================
// INTELLIGENZA BOT PER GLI OBIETTIVI SEGRETI
// =========================================================================
window.bonusObiettivoBot = function(codiceTerritorio, idBot) {
    let ob = window.obiettiviGiocatori[idBot];
    let info = territori[codiceTerritorio];
    if (!ob || !info) return 0;

    let cont = info.continente;
    let bonus = 0;

    // Il Bot dà altissima priorità ai continenti richiesti dal suo obiettivo segreto!
    if (ob.id === "eu_oc" && (cont === "Europa" || cont === "Oceania")) bonus += 45;
    if (ob.id === "na_sa" && (cont === "NordAmerica" || cont === "SudAmerica")) bonus += 45;
    if (ob.id === "as_sa" && (cont === "Asia" || cont === "SudAmerica")) bonus += 45;
    if (ob.id === "af_eu" && (cont === "Africa" || cont === "Europa")) bonus += 45;
    if (ob.id === "as_oc" && (cont === "Asia" || cont === "Oceania")) bonus += 45;
    if (ob.id === "af_na" && (cont === "Africa" || cont === "NordAmerica")) bonus += 45;

    // Se ha obiettivi di numero territori o 3 continenti, spinge di più sull'espansione
    if (ob.id === "conquista_24" || ob.id === "conquista_20_presidio" || ob.id === "tre_continenti") {
        bonus += 20;
    }

    return bonus;
};

// =========================================================================
// AGGANCIO AUTOMATICO AL GIOCO (senza toccare i file esistenti!)
// =========================================================================
window.addEventListener("load", function() {
    // 1. Aggiunge il pulsante "IL MIO OBIETTIVO" nel pannello comandi durante la partita
    setInterval(function() {
        var gameArea = document.getElementById("game-area");
        var controlArea = document.getElementById("control-area");
        if (!gameArea || gameArea.classList.contains("hidden") || !controlArea) return;

        if (Object.keys(window.obiettiviGiocatori).length === 0) {
            window.assegnaObiettiviSegreti();
        }

        let btnEsistente = document.getElementById("btn-vedi-obiettivo");
        if (!btnEsistente) {
            let btn = document.createElement("button");
            btn.id = "btn-vedi-obiettivo";
            btn.innerHTML = "&#127919; IL MIO OBIETTIVO";
            btn.className = "btn-azione";
            btn.style.cssText = "background-color:#222; color:#FFD700; border:1px solid #FFD700; font-size:12px; padding:6px; margin-bottom:6px;";
            btn.onclick = window.mostraFinestraObiettivo;
            controlArea.insertBefore(btn, document.getElementById("dynamic-buttons"));
        }

        // Nasconde il pulsante quando gioca un Bot
        if (typeof window.isGiocatoreBot === "function" && typeof giocatoreDiTurno !== "undefined") {
            btnEsistente = document.getElementById("btn-vedi-obiettivo");
            if (btnEsistente) {
                btnEsistente.style.display = window.isGiocatoreBot(giocatoreDiTurno) ? "none" : "block";
            }
        }
    }, 500);

    // 2. Controlla la vittoria per obiettivo dopo ogni conquista
    if (typeof window.controllaVittoriaPartita === "function") {
        var origVittoria = window.controllaVittoriaPartita;
        window.controllaVittoriaPartita = function(idVincitore) {
            if (window.verificaVittoriaObiettivo(idVincitore)) return true;
            return origVittoria.apply(this, arguments);
        };
    }

    // 3. Controlla la vittoria per obiettivo anche all'inizio del turno
    if (typeof window.avviaTurnoRegolamentare === "function") {
        var origAvviaTurno = window.avviaTurnoRegolamentare;
        window.avviaTurnoRegolamentare = function() {
            if (typeof giocatoreDiTurno !== "undefined" && window.verificaVittoriaObiettivo(giocatoreDiTurno)) return;
            origAvviaTurno.apply(this, arguments);
        };
    }
});
