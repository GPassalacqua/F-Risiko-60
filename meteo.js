// =========================================================================
// METEO DINAMICO GLOBALE (meteo.js)
// =========================================================================

window.meteoAttuale = {
    id: "sereno",
    nome: "Cielo Sereno",
    icona: "&#9728;",
    colore: "#88FF88",
    descrizione: "Condizioni ottimali su tutta la mappa."
};

const TIPI_METEO = [
    {
        id: "sereno",
        nome: "Cielo Sereno",
        icona: "&#9728;",
        colore: "#88FF88",
        descrizione: "Condizioni ottimali su tutta la mappa."
    },
    {
        id: "tempesta_mare",
        nome: "Tempesta Oceanica",
        icona: "&#9928;",
        colore: "#00BFFF",
        descrizione: "Mare in burrasca! Le rotte navali tra i Porti sono bloccate per questo giro."
    },
    {
        id: "inverno_nord",
        nome: "Inverno Rigido al Nord",
        icona: "&#10052;",
        colore: "#AADDFF",
        descrizione: "Gelo in Nord America, Europa e Asia: -1 al dado di chi attacca in questi continenti."
    },
    {
        id: "tempesta_sud",
        nome: "Tempesta di Sabbia al Sud",
        icona: "&#127786;",
        colore: "#FFAA44",
        descrizione: "Visibilità zero in Sud America, Africa e Oceania: Generali e Fortezze disattivati al Sud!"
    }
];

// 1. Estrae un nuovo clima a inizio giro
window.cambiaMeteoGlobale = function() {
    let r = Math.random();
    if (r < 0.40) window.meteoAttuale = TIPI_METEO.at(0);
    else if (r < 0.60) window.meteoAttuale = TIPI_METEO.at(1);
    else if (r < 0.80) window.meteoAttuale = TIPI_METEO.at(2);
    else window.meteoAttuale = TIPI_METEO.at(3);

    var logBox = document.getElementById("log-messages");
    if (logBox) {
        logBox.innerHTML = `<b style="color:${window.meteoAttuale.colore};">${window.meteoAttuale.icona} METEO DEL GIRO: ${window.meteoAttuale.nome.toUpperCase()}!</b> ${window.meteoAttuale.descrizione}<br>` + logBox.innerHTML;
    }
};

// =========================================================================
// AGGANCIO AUTOMATICO A GIRI, DADI, PORTI E INTERFACCIA
// =========================================================================
window.addEventListener("load", function() {
    // 1. Cambia meteo a ogni nuovo giro completo
    var ultimoContatoreGiri = 0;
    setInterval(function() {
        if (typeof contatoreGiri !== "undefined" && contatoreGiri !== ultimoContatoreGiri) {
            ultimoContatoreGiri = contatoreGiri;
            if (contatoreGiri > 1) window.cambiaMeteoGlobale();
        }
    }, 600);

    // 2. Effetti del meteo sui dadi di battaglia
    if (typeof window.calcolaEsitoConfrontoDadi === "function") {
        var origDadiMeteo = window.calcolaEsitoConfrontoDadi;
        window.calcolaEsitoConfrontoDadi = function(dadoAtt, dadoDif, att, dif) {
            var dAtt = dadoAtt;
            var dDif = dadoDif;
            var contDif = (territori[dif] && territori[dif].continente) ? territori[dif].continente : "";

            // Inverno Rigido al Nord: penalità -1 all'attaccante
            if (window.meteoAttuale.id === "inverno_nord" &&
                (contDif === "NordAmerica" || contDif === "Europa" || contDif === "Asia")) {
                dAtt = Math.max(1, dAtt - 1);
            }

            // Tempesta di Sabbia al Sud: annulla i bonus extra di Generali/Fortezze riportando i dadi base
            if (window.meteoAttuale.id === "tempesta_sud" &&
                (contDif === "SudAmerica" || contDif === "Africa" || contDif === "Oceania")) {
                if (territori[dif] && territori[dif].isFortezza) dDif = Math.max(1, dDif - 1);
                var propAtt = territori[att] ? territori[att].proprietario : null;
                if (propAtt && window.posizioneGenerali && window.posizioneGenerali[propAtt] === att) {
                    dAtt = Math.max(1, dAtt - 1);
                }
            }

            return origDadiMeteo(dAtt, dDif, att, dif);
        };
    }

    // 3. Tempesta Oceanica: blocca attacchi via mare tra Porti non confinanti via terra
    if (typeof window.eseguiBattagliaDadi === "function") {
        var origBattMeteo = window.eseguiBattagliaDadi;
        window.eseguiBattagliaDadi = function() {
            if (window.meteoAttuale.id === "tempesta_mare" &&
                typeof territorioAttaccanteSelezionato !== "undefined" &&
                typeof territorioDifensoreSelezionato !== "undefined" &&
                territorioAttaccanteSelezionato && territorioDifensoreSelezionato) {

                var tAtt = territori[territorioAttaccanteSelezionato];
                var tDif = territori[territorioDifensoreSelezionato];
                if (tAtt && tDif && tAtt.isPorto && tDif.isPorto && tAtt.continente !== tDif.continente) {
                    alert("Tempesta Oceanica in corso! Le rotte navali tra i Porti sono bloccate per questo giro.");
                    return;
                }
            }
            return origBattMeteo.apply(this, arguments);
        };
    }

    // 4. Mostra il bollettino meteo nel riquadro Logistica
/*    setInterval(function() {
        var boxScorte = document.getElementById("info-logistica");
        if (!boxScorte || boxScorte.innerHTML.includes("Meteo:")) return;
        boxScorte.innerHTML += `<br>${window.meteoAttuale.icona} <b>Meteo:</b> <span style="color:${window.meteoAttuale.colore};">${window.meteoAttuale.nome}</span>`;
    }, 650); */
});
