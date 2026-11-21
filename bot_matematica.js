/**
 * BOT_MATEMATICA.JS
 * Profili caratteriali e calcolo probabilità di conquista.
 */

const UMORI_BOT = [
    { nome: "Aggressivo",    sogliaProb: 0.42, furia: 0.85, maxAttacchi: 6, focusContinente: 1.2 },
    { nome: "Stratega",      sogliaProb: 0.62, furia: 0.60, maxAttacchi: 4, focusContinente: 1.8 },
    { nome: "Prudente",      sogliaProb: 0.75, furia: 0.30, maxAttacchi: 2, focusContinente: 1.0 },
    { nome: "Imprevedibile", sogliaProb: 0.48, furia: 0.70, maxAttacchi: 5, focusContinente: 1.4 },
    { nome: "Conquistatore", sogliaProb: 0.55, furia: 0.80, maxAttacchi: 5, focusContinente: 2.0 }
];

var botUmoreCorrente = null;
var botAttacchiEffettuati = 0;

const ODDS_SINGOLO_LANCIO = {
    "1_1": [[15/36, 0, 1], [21/36, 1, 0]],
    "1_2": [[55/216, 0, 1], [161/216, 1, 0]],
    "1_3": [[225/1296, 0, 1], [1071/1296, 1, 0]],
    "2_1": [[125/216, 0, 1], [91/216, 1, 0]],
    "2_2": [[295/1296, 0, 2], [420/1296, 1, 1], [581/1296, 2, 0]],
    "2_3": [[979/7776, 0, 2], [1981/7776, 1, 1], [4816/7776, 2, 0]],
    "3_1": [[855/1296, 0, 1], [441/1296, 1, 0]],
    "3_2": [[2890/7776, 0, 2], [2611/7776, 1, 1], [2275/7776, 2, 0]],
    "3_3": [[6420/46656, 0, 3], [10017/46656, 1, 2], [12348/46656, 2, 1], [17871/46656, 3, 0]]
};

const cacheProbabilitaBot = {};

window.calcolaProbVittoriaBot = function(attacco, difesa) {
    if (difesa <= 0) return 1.0;
    if (attacco <= 1) return 0.0;
    const key = `${attacco}_${difesa}`;
    if (cacheProbabilitaBot[key] !== undefined) return cacheProbabilitaBot[key];

    const dA = Math.min(3, attacco - 1);
    const dD = Math.min(3, difesa);
    let probTot = 0;
    for (const [p, lA, lD] of ODDS_SINGOLO_LANCIO[`${dA}_${dD}`]) {
        probTot += p * window.calcolaProbVittoriaBot(attacco - lA, difesa - lD);
    }
    cacheProbabilitaBot[key] = probTot;
    return probTot;
};

window.valutaImportanzaContinenteBot = function(idTerritorio, idBot) {
    const infoT = territori[idTerritorio];
    if (!infoT) return 0;
    const nomeCont = infoT.continente;
    const confCont = configurazioneContinenti[nomeCont];
    if (!confCont) return 0;

    let mieiNelCont = 0;
    let proprietariNelCont = {};

    for (let cod in territori) {
        if (territori[cod].continente === nomeCont) {
            let p = territori[cod].proprietario;
            if (p === idBot) mieiNelCont++;
            if (p !== 0) proprietariNelCont[p] = (proprietariNelCont[p] || 0) + 1;
        }
    }

    const percMia = mieiNelCont / confCont.totale;
    let punteggio = confCont.bonus * 2;
    if (percMia >= 0.6) punteggio += confCont.bonus * 10;

    for (let pId in proprietariNelCont) {
        if (parseInt(pId) !== idBot && (proprietariNelCont[pId] / confCont.totale) >= 0.75) {
            punteggio += confCont.bonus * 9;
        }
    }
    return punteggio;
};
