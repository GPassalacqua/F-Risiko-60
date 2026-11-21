/**
 * RIVOLUZIONE.JS - PARTE 1
 * Gestisce gli Eventi del Giro (Rivolta, Appello di Euno, Tesoro di Enna, Carestia).
 */
window.controllaEScattaRivoluzione = function(callbackFineEvento) {
    // 45% di probabilità totale a inizio giro che accada un Evento Globale
    let tiro = Math.random();
    if (tiro > 0.45) {
        callbackFineEvento();
        return;
    }

    var areaLog = document.getElementById("log-messages");

    // EVENTO 1 (0.00 - 0.15): RIVOLTA INTERNA CLASSICA
    if (tiro <= 0.15) {
        let conteggio = {};
        for (var cod in territori) {
            let prop = territori[cod] ? territori[cod].proprietario : 0;
            if (prop >= 1 && prop <= 6) conteggio[prop] = (conteggio[prop] || 0) + 1;
        }

        let eleggibili = [];
        let affamatiEleggibili = [];

        for (var codice in territori) {
            let prop = territori[codice] ? territori[codice].proprietario : 0;
            // Evita di far ribellare l'ultimo territorio di un giocatore (e protegge le Capitali)
            if (prop >= 1 && prop <= 6 && conteggio[prop] > 1 && !territori[codice].isCapitale) {
                eleggibili.push(codice);
                if (territori[codice].isSazio === false) {
                    affamatiEleggibili.push(codice);
                }
            }
        }

        // Se ci sono territori AFFAMATI, la rivolta scoppia quasi sicuramente lì (85% di probabilità)!
        let listaScelta = (affamatiEleggibili.length > 0 && Math.random() < 0.85) ? affamatiEleggibili : eleggibili;
        if (listaScelta.length === 0) { callbackFineEvento(); return; }

        let focolaio = listaScelta[Math.floor(Math.random() * listaScelta.length)];
        let eraAffamato = (territori[focolaio].isSazio === false);

        let vecchioId = territori[focolaio].proprietario;
        let nomeVecchio = proprietari[vecchioId].nick;

        territori[focolaio].proprietario = 0;
        territori[focolaio].armate = 3;

        var grafFoc = document.getElementById("armate-num-" + focolaio);
        if (grafFoc) grafFoc.textContent = 3;

        var elPath = document.getElementById(focolaio);
        if (elPath) {
            elPath.setAttribute("fill", "#444444");
            elPath.style.fill = "#444444";
            if (typeof window.lanciaFuochiTerritorio === "function") {
               window.lanciaFuochiTerritorio(focolaio, ["#FF3333", "#FFFF33", "#FFA500", "#FFFFFF"]);
            }
        }

        if (areaLog) {
            areaLog.innerHTML = `<b style="color:#FF3333; font-size:15px;">&#9876; RIVOLTA INTERNA! &#9876;</b><br><br>` +
                                `Stremata dalla fame, la popolazione di <b>${focolaio}</b> &egrave; insorta strappando il controllo a <b>${nomeVecchio}</b>!<br><br>` +
                                `I ribelli hanno istituito un presidio di <b>3 armate neutrali</b>.`;
        }
        setTimeout(callbackFineEvento, 3200);
        return;
    }

    // EVENTO 2 (0.15 - 0.25): L'APPELLO DI EUNO (Rinforza i territori neutrali)
    if (tiro <= 0.25) {
        let neutrali = [];
        for (let c in territori) {
            if (territori[c] && territori[c].proprietario === 0) neutrali.push(c);
        }

        if (neutrali.length > 0) {
            neutrali.forEach(c => {
              if (typeof window.lanciaFuochiTerritorio === "function") {
                 window.lanciaFuochiTerritorio(c, ["#FFA500", "#FFFF33", "#FF4500"]);
              }
                territori[c].armate += 2;
                let g = document.getElementById("armate-num-" + c);
                if (g) g.textContent = territori[c].armate;
            });

            if (areaLog) {
                areaLog.innerHTML = `<b style="color:#FFA500; font-size:15px;">&#9733; L'APPELLO DI EUNO! &#9733;</b><br><br>` +
                                    `Euno chiama a raccolta gli schiavi ribelli in tutta la mappa!<br><br>` +
                                    `Tutti i <b>${neutrali.length} territori neutrali</b> ricevono <b>+2 armate</b> di difesa!`;
            }
            setTimeout(callbackFineEvento, 3200);
            return;
        }
    }

 /**
 * RIVOLUZIONE.JS - PARTE 2
 */

    // EVENTO 3 (0.25 - 0.35): IL TESORO DI ENNA (+3 armate bonus su un territorio)
    if (tiro <= 0.35) {
        let occupati = [];
        for (let c in territori) {
            if (territori[c] && territori[c].proprietario >= 1 && territori[c].proprietario <= 6) {
                occupati.push(c);
            }
        }

        if (occupati.length > 0) {
            let scelto = occupati[Math.floor(Math.random() * occupati.length)];
            let idProp = territori[scelto].proprietario;
            let nomeProp = proprietari[idProp].nick;

            territori[scelto].armate += 3;
            let g = document.getElementById("armate-num-" + scelto);
            if (g) g.textContent = territori[scelto].armate;
            if (typeof window.lanciaFuochiTerritorio === "function") {
               window.lanciaFuochiTerritorio(scelto, ["#33FF33", "#FFFF33", "#00FFFF"]);
            }
            if (areaLog) {
                areaLog.innerHTML = `<b style="color:#33FF33; font-size:15px;">&#9813; IL TESORO DI ENNA! &#9813;</b><br><br>` +
                                    `Il territorio <b>${scelto}</b> (controllato da <b>${nomeProp}</b>) vive una stagione di grande abbondanza!<br><br>` +
                                    `Ottiene subito <b>+3 armate</b> di rinforzo gratuite!`;
            }
            setTimeout(callbackFineEvento, 3200);
            return;
        }
    }

    // EVENTO 4 (0.35 - 0.45): CARESTIA NEGLI IMPERI (Bilancia chi ha più di 12 territori)
    let conteggioImp = {};
    for (let c in territori) {
        let p = territori[c] ? territori[c].proprietario : 0;
        if (p >= 1 && p <= 6) conteggioImp[p] = (conteggioImp[p] || 0) + 1;
    }

    let grandiImperi = Object.keys(conteggioImp).filter(id => conteggioImp[id] > 12);
    if (grandiImperi.length > 0) {
        let idColpito = parseInt(grandiImperi[Math.floor(Math.random() * grandiImperi.length)], 10);
        let nomeColpito = proprietari[idColpito].nick;

        // Trova il territorio più affollato di quel giocatore (con almeno 3 armate)
        let candidati = [];
        for (let c in territori) {
            if (territori[c].proprietario === idColpito && territori[c].armate >= 3) {
                candidati.push(c);
            }
        }

        if (candidati.length > 0) {
            candidati.sort((a, b) => territori[b].armate - territori[a].armate);
            let bersaglio = candidati.at(0);

            territori[bersaglio].armate -= 2;
            territori[bersaglio].isSazio = false;
            if (window.scorteCapitale && typeof window.scorteCapitale[idColpito] === "number") {
                window.scorteCapitale[idColpito] = Math.max(0, window.scorteCapitale[idColpito] - 5);
            }
            let g = document.getElementById("armate-num-" + bersaglio);
            if (g) g.textContent = territori[bersaglio].armate;

            if (areaLog) {
                areaLog.innerHTML = `<b style="color:#FFFF33; font-size:15px;">&#9888; CARESTIA NELL'IMPERO! &#9888;</b><br><br>` +
                                    `Le linee di rifornimento di <b>${nomeColpito}</b> sono allo stremo!<br><br>` +
                                    `La guarnigione di <b>${bersaglio}</b> perde <b>2 armate</b>.`;
            }
            setTimeout(callbackFineEvento, 3200);
            return;
        }
    }

    // Se nessuna condizione specifica era applicabile, prosegui regolarmente
    callbackFineEvento();
};
