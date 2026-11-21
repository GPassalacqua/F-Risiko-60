// =========================================================================
// FORTEZZE STRATEGICHE E PORTI NAVALI (fortezze_porti.js)
// =========================================================================

const ELENCO_FORTEZZE = ["OC3", "SA4", "EU5", "AF5", "NA7", "AS11"];

const ROTTE_PORTI = {
    "NA9":  ["EU7", "SA2"],
    "EU7":  ["NA9", "AF1"],
    "AF1":  ["EU7", "SA2"],
    "SA2":  ["NA9", "AF1"],
    "AS14": ["OC1"],
    "OC1":  ["AS14"]
};

// 1. Inizializza Fortezze, Porti e aggiunge le rotte navali ai confini dei territori
window.inizializzaFortezzeEPorti = function() {
    if (typeof territori === "undefined") return;

    ELENCO_FORTEZZE.forEach(function(cod) {
        if (territori[cod]) {
            territori[cod].isFortezza = true;
        }
    });

    Object.keys(ROTTE_PORTI).forEach(function(porto) {
        if (territori[porto]) {
            territori[porto].isPorto = true;
            ROTTE_PORTI[porto].forEach(function(destinazione) {
                if (territori[destinazione] && !territori[porto].confini.includes(destinazione)) {
                    territori[porto].confini.push(destinazione);
                }
            });
        }
    });
};

// 2. Aggiorna l'aspetto grafico dei cerchietti di Fortezze e Porti
window.aggiornaGraficaFortezzeEPorti = function() {
    if (typeof territori === "undefined") return;

    Object.keys(territori).forEach(function(cod) {
        var t = territori[cod];
        var testoArmate = document.getElementById("armate-num-" + cod);
        var cerchio = testoArmate ? testoArmate.previousElementSibling : null;

        if (cerchio && cerchio.tagName.toLowerCase() === "circle") {
            if (t.isFortezza) {
                cerchio.style.setProperty("stroke", "#0066FF", "important");
                cerchio.style.setProperty("stroke-width", "45px", "important");
            } else if (t.isPorto) {
                cerchio.style.setProperty("stroke", "#00AA88", "important");
                cerchio.style.setProperty("stroke-width", "40px", "important");
                cerchio.style.setProperty("stroke-dasharray", "80,40", "important");
            }
        }
    });
};

// 3. Bonus Bot per Fortezze e Porti
window.bonusFortezzePortiBot = function(cod) {
    if (!territori[cod]) return 0;
    let b = 0;
    if (territori[cod].isFortezza) b += 25;
    if (territori[cod].isPorto) b += 20;
    return b;
};

// =========================================================================
// AGGANCIO AUTOMATICO A DADI, LOGISTICA E INTERFACCIA
// =========================================================================
window.addEventListener("load", function() {
    setTimeout(function() {
        window.inizializzaFortezzeEPorti();
        window.aggiornaGraficaFortezzeEPorti();
    }, 600);

    setInterval(window.aggiornaGraficaFortezzeEPorti, 800);

    // Bonus Difensivo +1 al dado più alto quando si difende una Fortezza!
    if (typeof window.calcolaEsitoConfrontoDadi === "function") {
        var origDadi = window.calcolaEsitoConfrontoDadi;
        window.calcolaEsitoConfrontoDadi = function(dadoAtt, dadoDif, att, dif) {
            var dadoDifModificato = dadoDif;
            if (territori[dif] && territori[dif].isFortezza) {
                dadoDifModificato = Math.min(6, dadoDif + 1);
            }
            return origDadi(dadoAtt, dadoDifModificato, att, dif);
        };
    }

    // Potenzia la rete di rifornimento cibo della Capitale includendo le rotte navali
    if (typeof window.isCollegatoAllaCapitale === "function") {
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
    }
});
