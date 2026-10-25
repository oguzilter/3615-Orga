const UtilitaireAlertesEcarts = {
    interfaceGeneree: false,

    nettoyerTexte: function(chaine) {
        if (!chaine) return "";
        return chaine.toString().toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^A-Z0-9]/g, ""); 
    },

    nettoyerTel: function(chaine) {
        if (!chaine) return "";
        return chaine.toString().replace(/\D/g, ''); 
    },

    normaliserCivilite: function(val) {
        if (!val) return "";
        let s = val.toString().toUpperCase();
        if (s.includes('HOMME') || s.includes('M.')) return 'M';
        if (s.includes('FEMME') || s.includes('MME')) return 'F';
        return s;
    },

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);
        if (!conteneur) return;

        conteneur.innerHTML = `
            <h2>ANALYSE DES ÉCARTS D'INFORMATIONS (LORGA, COGITIEL ET COGETISE)</h2>
            <div class="barre-actions">
                <div class="groupe-actions-gauche">
                    <button onclick="UtilitaireAlertesEcarts.lancerAnalyse()" class="bouton-action">LANCER L'ANALYSE</button>
                    <button id="btn-fullscreen-ecarts" onclick="UtilitaireAlertesEcarts.basculerPleinEcran()" class="bouton-action">PLEIN ÉCRAN</button>
                </div>
                <div class="groupe-actions-droite">
                    <button onclick="UtilitaireAlertesEcarts.exporterExcel()" class="bouton-action bouton-export">EXPORT EXCEL (.csv)</button>
                </div>
            </div>
            <div id="statut-analyse-ecarts" class="statut-analyse"></div>
            <div id="conteneur-table-ecarts" class="conteneur-table">
                <table id="table-ecarts" class="table-cgt">
                    <thead>
                        <tr onclick="UtilitaireAlertesEcarts.trierTable(event)">
                            <th data-col="0">CAMARADE ⬍</th>
                            <th data-col="1">ÉCART ⬍</th>
                            <th data-col="2">VALEUR LORGA ⬍</th>
                            <th data-col="3">VALEUR COGITIEL ⬍</th>
                        </tr>
                    </thead>
                    <tbody id="table-body-ecarts"></tbody>
                </table>
            </div>
        `;
        this.interfaceGeneree = true;
    },

    basculerPleinEcran: function() {
        const wrap = document.getElementById('conteneur-table-ecarts');
        const btn = document.getElementById('btn-fullscreen-ecarts');
        if (!wrap || !btn) return;
        
        wrap.classList.toggle('plein-ecran');
        if (wrap.classList.contains('plein-ecran')) {
            btn.classList.add('bouton-plein-ecran-flottant');
            btn.innerText = "QUITTER PLEIN ÉCRAN";
        } else {
            btn.classList.remove('bouton-plein-ecran-flottant');
            btn.innerText = "PLEIN ÉCRAN";
        }
    },

    indexerSource: function(nomSource) {
        const sourceData = UtilitaireExcel.sources[nomSource];
        if (!sourceData) return null;

        const map = new Map();
        const enTetes = sourceData.enTetes.map(h => this.nettoyerTexte(h));

        sourceData.donnees.forEach(ligne => {
            let nomComplet, email, tel, adresse, sexeCivilit;

            if (nomSource === 'lorga') {
                nomComplet = ligne[enTetes.indexOf('SYNDIQUE')] || "";
                email = ligne[enTetes.indexOf('EMAIL')] || "";
                tel = ligne[enTetes.indexOf('TEL')] || "";
                adresse = ligne[enTetes.indexOf('ADR3')] || "";
                sexeCivilit = ligne[enTetes.indexOf('SEXE')] || "";
            } else {
                const idxNom = enTetes.findIndex(h => h.includes('NOM'));
                const idxPre = enTetes.findIndex(h => h.includes('PR'));
                nomComplet = (ligne[idxNom] || "") + " " + (ligne[idxPre] || "");
                email = ligne[enTetes.indexOf('EMAILRESPONSABLE')] || "";
                tel = ligne[enTetes.indexOf('TELEPHONEPERSONNELRESPONSABLE')] || "";
                adresse = ligne[enTetes.indexOf('ADRESSERESPONSABLE')] || "";
                sexeCivilit = ligne[enTetes.findIndex(h => h.includes('CIVILIT'))] || "";
            }

            const cle = this.nettoyerTexte(nomComplet);
            if (cle.length > 2) {
                map.set(cle, { 
                    nomOriginal: nomComplet.trim(), 
                    email: email.toString().trim(), 
                    tel: tel.toString().trim(), 
                    adresse: adresse.toString().trim(),
                    sexe: sexeCivilit.toString().trim()
                });
            }
        });
        return map;
    },

    lancerAnalyse: function() {
        const tbody = document.getElementById('table-body-ecarts');
        const statut = document.getElementById('statut-analyse-ecarts');
        if (!tbody) return;
        tbody.innerHTML = '';

        const aLorga = UtilitaireExcel.sources.lorga && UtilitaireExcel.sources.lorga.donnees.length > 0;
        const aCogitiel = UtilitaireExcel.sources.cogitiel && UtilitaireExcel.sources.cogitiel.donnees.length > 0;

        if (!aLorga || !aCogitiel) {
            if (statut) statut.innerText = "Pense à charger au moins Lorga et Cogitiel dans « Imports Exports Excel » camarade.";
            return;
        }

        const mapLorga = this.indexerSource('lorga');
        const mapCogitiel = this.indexerSource('cogitiel');

        const tousLesAgents = Array.from(new Set([...mapLorga.keys(), ...mapCogitiel.keys()]));
        
        tousLesAgents.sort((a, b) => {
            const nomA = (mapLorga.get(a) || mapCogitiel.get(a)).nomOriginal;
            const nomB = (mapLorga.get(b) || mapCogitiel.get(b)).nomOriginal;
            return nomA.localeCompare(nomB);
        });

        tousLesAgents.forEach(cle => {
            const dataL = mapLorga.get(cle);
            const dataC = mapCogitiel.get(cle);

            if (!dataL) { this.ajouterLigne(dataC.nomOriginal, "ABSENT DE LORGA", "N/A", "Présent"); return; }
            if (!dataC) { this.ajouterLigne(dataL.nomOriginal, "ABSENT DE COGITIEL", "Présent", "N/A"); return; }

            this.comparerChamp(dataL.nomOriginal, "Email", dataL.email, dataC.email);
            this.comparerChamp(dataL.nomOriginal, "Téléphone", this.nettoyerTel(dataL.tel), this.nettoyerTel(dataC.tel));
            this.comparerChamp(dataL.nomOriginal, "Adresse", dataL.adresse, dataC.adresse);
            this.comparerChamp(dataL.nomOriginal, "Civilité", this.normaliserCivilite(dataL.sexe), this.normaliserCivilite(dataC.sexe));
        });

        const totalLignes = tbody.rows.length;
        if (statut) {
            statut.innerText = totalLignes > 0 ? `${totalLignes} écart(s) détecté(s).` : "Aucun écart détecté entre les fichiers.";
        }
    },

    comparerChamp: function(nom, type, valL, valC) {
        const vL = (valL === "" || valL === undefined) ? "(Vide)" : valL;
        const vC = (valC === "" || valC === undefined) ? "(Vide)" : valC;
        
        if (this.nettoyerTexte(vL) !== this.nettoyerTexte(vC)) {
            this.ajouterLigne(nom, type + " différent", vL, vC);
        }
    },

    ajouterLigne: function(nom, type, valL, valC) {
        const tbody = document.getElementById('table-body-ecarts');
        if (!tbody) return;

        const tr = document.createElement('tr');

        const tdNom = document.createElement('td');
        tdNom.textContent = nom;

        const tdType = document.createElement('td');
        tdType.className = "cellule-ecart";
        tdType.textContent = type;

        const tdValL = document.createElement('td');
        tdValL.textContent = valL;

        const tdValC = document.createElement('td');
        tdValC.textContent = valC;

        tr.appendChild(tdNom);
        tr.appendChild(tdType);
        tr.appendChild(tdValL);
        tr.appendChild(tdValC);
        tbody.appendChild(tr);
    },

    trierTable: function(event) {
        const table = document.getElementById("table-ecarts");
        const colIndex = event.target.getAttribute("data-col");
        if (colIndex === null) return;
        const rows = Array.from(table.tBodies[0].rows);
        const direction = table.dataset.sortDir === "asc" ? -1 : 1;
        rows.sort((a, b) => a.cells[colIndex].innerText.toLowerCase().localeCompare(b.cells[colIndex].innerText.toLowerCase()) * direction);
        table.dataset.sortDir = direction === 1 ? "asc" : "desc";
        rows.forEach(row => table.tBodies[0].appendChild(row));
    },

    exporterExcel: function() {
        let csv = "\ufeff" + "CAMARADE;ÉCART;LORGA;COGITIEL\n";
        document.querySelectorAll("#table-body-ecarts tr").forEach(row => {
            const cols = Array.from(row.cells).map(c => `"${c.innerText.replace(/"/g, '""')}"`);
            csv += cols.join(";") + "\n";
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = "analyse_ecarts.csv";
        link.click();
    }
};