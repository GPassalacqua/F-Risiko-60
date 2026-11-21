/**
 * ANIMAZIONI.JS 
 * Gestione degli effetti visivi e del frullatore grafico dei dadi elastici.
 */
window.avviaFrullatoreDadiVisivo = function(dadiAttaccoArray, dadiDifesaArray, callbackFineAnimazione) {
    var elementoDadoBianco = document.getElementById("dice-white");
    var elementoDadoNero = document.getElementById("dice-black");
    var areaBottoni = document.getElementById("dynamic-buttons");

    // Sicurezza: se per qualche motivo non arrivano array, li trasformiamo in array
    if (!Array.isArray(dadiAttaccoArray)) dadiAttaccoArray = [dadiAttaccoArray];
    if (!Array.isArray(dadiDifesaArray)) dadiDifesaArray = [dadiDifesaArray];

    // 1. Blocchiamo i clic sui comandi per sicurezza durante il lancio
    if (areaBottoni) {
        areaBottoni.style.pointerEvents = "none";
        areaBottoni.style.opacity = "0.5";
    }

    var tempoAnimazione = 0;
    
    // 2. Il frullatore grafico scatta ogni 50 millisecondi
    var cicloAnimazione = setInterval(function() {
        
        // CORREZIONE GRAFICA: Generiamo i dadi finti affiancati durante il "frullamento"
        if (elementoDadoBianco) {
            let fintiAttacco = dadiAttaccoArray.map(() => Math.floor(Math.random() * 6) + 1);
            elementoDadoBianco.innerHTML = fintiAttacco.map(d => `<span class="mini-dado-attacco">${d}</span>`).join("");
            elementoDadoBianco.style.transform = `rotate(${Math.floor(Math.random() * 10) - 5}deg)`;
        }
        
        if (elementoDadoNero) {
            let fintiDifesa = dadiDifesaArray.map(() => Math.floor(Math.random() * 6) + 1);
            elementoDadoNero.innerHTML = fintiDifesa.map(d => `<span class="mini-dado-difesa">${d}</span>`).join("");
            elementoDadoNero.style.transform = `rotate(${Math.floor(Math.random() * 10) - 5}deg)`;
        }

        tempoAnimazione += 50;

        // 3. Dopo 1 secondo (1000ms) fermiamo l'effetto visivo e mostriamo i dadi veri ordinati
        if (tempoAnimazione >= 1000) {
            clearInterval(cicloAnimazione);
            
            // Stampiamo i dadi REALI finali (game.js ce li passa gi  ordinati dal pi  grande al pi  piccolo)
            if (elementoDadoBianco) {
                elementoDadoBianco.innerHTML = dadiAttaccoArray.map(d => `<span class="mini-dado-attacco">${d}</span>`).join("");
                elementoDadoBianco.style.transform = "rotate(0deg)";
            }
            if (elementoDadoNero) {
                elementoDadoNero.innerHTML = dadiDifesaArray.map(d => `<span class="mini-dado-difesa">${d}</span>`).join("");
                elementoDadoNero.style.transform = "rotate(0deg)";
            }

            // Sblocchiamo l'area comandi
            if (areaBottoni) {
                areaBottoni.style.pointerEvents = "auto";
                areaBottoni.style.opacity = "1";
            }

            // 4. Lanciamo la callback, dicendo a game.js che l'animazione   finita e pu  calcolare i danni!
            if (typeof callbackFineAnimazione === "function") {
                callbackFineAnimazione();
            }
        }
    }, 50);
};

/**
 * Genera fuochi d'artificio SVG sopra un territorio specifico
 */
window.lanciaFuochiTerritorio = function(codiceTerritorio, paletteColori) {
    let elTerritorio = document.getElementById(codiceTerritorio);
    if (!elTerritorio) return;

    // Calcola la posizione ESATTA in pixel sullo schermo, indipendente da SVG o zoom!
    let rect = elTerritorio.getBoundingClientRect();
    let cx = rect.left + rect.width / 2;
    let cy = rect.top + rect.height / 2;

    let colori = paletteColori || ["#FF3333", "#FFFF33", "#FFA500", "#FFFFFF"];

    for (let raffica = 0; raffica < 3; raffica++) {
        setTimeout(() => {
            let ox = cx + (Math.random() - 0.5) * 24;
            let oy = cy + (Math.random() - 0.5) * 24;
            let particelle = [];

            // Onda d'urto luminosa
            let onda = document.createElement("div");
            onda.style.cssText = `position:fixed; left:${ox}px; top:${oy}px; width:10px; height:10px; border-radius:50%; border:3px solid ${colori[raffica % colori.length]}; transform:translate(-50%,-50%); pointer-events:none; z-index:9999;`;
            document.body.appendChild(onda);

            // 18 Scintille brillanti
            for (let i = 0; i < 18; i++) {
                let angolo = (Math.PI * 2 * i) / 18 + (Math.random() * 0.25);
                let vel = 45 + Math.random() * 55;
                let col = colori[Math.floor(Math.random() * colori.length)];
                let sc = document.createElement("div");
                sc.style.cssText = `position:fixed; left:${ox}px; top:${oy}px; width:7px; height:7px; border-radius:50%; background:${col}; box-shadow:0 0 8px ${col}; transform:translate(-50%,-50%); pointer-events:none; z-index:9999;`;
                document.body.appendChild(sc);
                particelle.push({ el: sc, vx: Math.cos(angolo) * vel, vy: Math.sin(angolo) * vel });
            }

            let inizio = performance.now();
            let durata = 1200;

            function anima(adesso) {
                let t = (adesso - inizio) / durata;
                if (t >= 1) {
                    if (onda.parentNode) onda.parentNode.removeChild(onda);
                    particelle.forEach(p => { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); });
                    return;
                }

                let ease = 1 - Math.pow(1 - t, 3);
                let sizeOnda = 10 + ease * 90;
                onda.style.width = sizeOnda + "px";
                onda.style.height = sizeOnda + "px";
                onda.style.opacity = (1 - t).toFixed(2);

                particelle.forEach(p => {
                    p.el.style.left = (ox + p.vx * ease) + "px";
                    p.el.style.top = (oy + p.vy * ease) + "px";
                    p.el.style.opacity = (1 - t).toFixed(2);
                });

                requestAnimationFrame(anima);
            }
            requestAnimationFrame(anima);
        }, raffica * 350);
    }
};
