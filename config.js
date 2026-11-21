// Array PROPRIETARI/COLORE (Posizioni da 0 a 6)
// Colore 0: Grigio chiaro. Colori 1-6 scelti per contrasto (evitando nero, bianco e azzurro aqua)
const proprietari = [
    { id: 0, nick: "Euno", colore: "#757575" },
    { id: 1, nick: "Robby 1",  colore: "#FF0000" },
    { id: 2, nick: "Robby 2",  colore: "#AD8000" },
    { id: 3, nick: "Robby 3",  colore: "#0077FF" },
    { id: 4, nick: "Robby 4",  colore: "#008000" },
    { id: 5, nick: "Robby 5",  colore: "#FF00FF" },
    { id: 6, nick: "Robby 6",  colore: "#8A4BE2" }
];

// Array TERRITORI (Da 1 a 66 - usiamo un array dove l'indice 0 è vuoto o partiamo da 0 mappando l'id)
var territori = {
// Oceania
    "OC1": {
        continente: "Oceania",
        proprietario: 0,
        armate: 2,
        confini: ["AS14", "OC2", "OC3", "OC5"]
    },
    "OC2": {
        continente: "Oceania",
        proprietario: 0,
        armate: 2,
        confini: ["OC1", "AS14", "OC4", "OC3"]
    },
    "OC3": {
        continente: "Oceania",
        proprietario: 0,
        armate: 2,
        confini: ["OC1", "OC2", "OC4", "OC5", "OC6"]
    },
    "OC4": {
        continente: "Oceania",
        proprietario: 0,
        armate: 2,
        confini: ["OC3", "OC2", "OC6"]
    },
    "OC5": {
        continente: "Oceania",
        proprietario: 0,
        armate: 2,
        confini: ["OC3", "OC6"]
    },
    "OC6": {
        continente: "Oceania",
        proprietario: 0,
        armate: 2,
        confini: ["OC5", "OC3", "OC4", "OC7"]
    },
    "OC7": {
        continente: "Oceania",
        proprietario: 0,
        armate: 2,
        confini: ["OC6", "SA7"]
    },

// Sud America
     "SA1": {
        continente: "SudAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA12", "NA11", "SA2"]
    },
     "SA2": {
        continente: "SudAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA12", "SA1", "SA3", "SA4"]
    },
     "SA3": {
        continente: "SudAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["SA2", "AF4", "SA5", "SA4"]
    },
     "SA4": {
        continente: "SudAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["SA2", "SA3", "SA5", "SA6"]
    },
     "SA5": {
        continente: "SudAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["SA6", "SA4", "SA3", "SA8", "SA7"]
    },
     "SA6": {
        continente: "SudAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["SA4", "SA5", "SA7"]
    },
     "SA7": {
        continente: "SudAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["OC7", "SA6", "SA5", "SA8"]
    },
     "SA8": {
        continente: "SudAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["SA7", "SA5"]
    },

// Europa
     "EU1": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["NA5", "EU2", "EU5", "EU4"]
    },
     "EU2": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["EU1", "NA5", "EU3", "EU6", "EU5"]
    },
     "EU3": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["EU6","EU2", "AS1", "AS5", "AS10", "AS9", "EU9"]
    },
     "EU4": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["EU1", "EU5", "EU8", "EU7"]
    },
     "EU5": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["EU1", "EU2", "EU6", "EU8", "EU4"]
    },
     "EU6": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["EU5", "EU2", "EU3", "EU9", "EU8"]
    },
     "EU7": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["EU4", "AF1", "NA9"]
    },
     "EU8": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["EU4", "EU5", "EU6", "EU9", "AF2"]
    },
     "EU9": {
        continente: "Europa",
        proprietario: 0,
        armate: 2,
        confini: ["EU8", "EU6", "EU3", "AS9"]
    },

// Africa
     "AF1": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["EU7", "AF2", "AF4"]
    },
     "AF2": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["AF1", "EU8", "AF3", "AF5", "AF4"]
    },
     "AF3": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["AF2", "AS9", "AS12", "AF6", "AF5"]
    },
     "AF4": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["SA3", "AF1", "AF2", "AF5", "AF7"]
    },
     "AF5": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["AF4", "AF2", "AF3", "AF6", "AF8", "AF7"]
    },
     "AF6": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["AF5", "AF3", "AS12", "AF8"]
    },
     "AF7": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["AF4", "AF5", "AF8", "AF9"]
    },
     "AF8": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["AF7", "AF5", "AF6", "AF10", "AF9"]
    },
     "AF9": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["AF7", "AF8", "AF10"]
    },
     "AF10": {
        continente: "Africa",
        proprietario: 0,
        armate: 2,
        confini: ["AF9", "AF8"]
    },

// Nord America
     "NA1": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["AS4", "NA2", "NA6"]
    },
     "NA2": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA1", "NA3", "NA6"]
    },
     "NA3": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA2", "NA4", "NA8", "NA7", "NA6"]
    },
     "NA4": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA3", "NA5", "NA9", "NA8"]
    },
     "NA5": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA4", "EU2", "EU1", "NA9"]
    },
     "NA6": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA1", "NA2", "NA3", "NA7", "NA10"]
    },
     "NA7": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA6", "NA3", "NA8", "NA11", "NA10"]
    },
     "NA8": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA7", "NA3", "NA4", "NA9", "NA11"]
    },
     "NA9": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA8", "NA4", "NA5", "EU7", "NA11"]
    },
     "NA10": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA6", "NA7", "NA11", "NA12"]
    },
     "NA11": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA10", "NA7", "NA8", "NA9", "SA1"]
    },
     "NA12": {
        continente: "NordAmerica",
        proprietario: 0,
        armate: 2,
        confini: ["NA10", "SA1", "SA2"]
    },

// Asia
     "AS1": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["EU3", "AS2", "AS5"]
    },
     "AS2": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS1", "AS3", "AS6", "AS5"]
    },
     "AS3": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS2", "AS4", "AS8", "AS7", "AS6"]
    },
     "AS4": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS3", "NA1", "AS8"]
    },
     "AS5": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["EU3", "AS1", "AS2", "AS6", "AS11", "AS10"]
    },
     "AS6": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS5", "AS2", "AS3", "AS7", "AS11"]
    },
     "AS7": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS6", "AS3", "AS8", "AS14", "AS11"]
    },
     "AS8": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS7", "AS3", "AS4", "AS14"]
    },
     "AS9": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["EU9", "EU3", "AS10", "AS12", "AF3"]
    },
     "AS10": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS9", "EU3", "AS5", "AS11", "AS13", "AS12"]
    },
     "AS11": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS10", "AS5", "AS6", "AS7", "AS14", "AS13"]
    },
     "AS12": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AF3", "AS9", "AS10", "AF6"]
    },
     "AS13": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS10", "AS11", "AS14"]
    },
     "AS14": {
        continente: "Asia",
        proprietario: 0,
        armate: 2,
        confini: ["AS13", "AS11", "AS7", "AS8", "OC2", "OC1"]
    }
};