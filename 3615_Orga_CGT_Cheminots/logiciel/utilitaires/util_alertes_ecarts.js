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
        conteneur.innerHTML = `
            <h2>ANALYSE DES ECARTS D'INFORMATIONS (LORGA, COGITIEL et COGETISE)</h2>
            <div style="margin-bottom:15px; display:flex; gap:10px;">
                <button onclick="UtilitaireAlertesEcarts.lancerAnalyse()" class="bouton-action">LANCER L'ANALYSE</button>
                <button onclick="UtilitaireAlertesEcarts.exporterExcel()" class="bouton-action" style="background-color:#28a745;">EXPORT EXCEL (.csv)</button>
            </div>
            <div id="statut-analyse" style="margin-bottom:10px; font-weight:bold;"></div>
            <table id="table-ecarts" class="table-cgt" style="width:100%; cursor:pointer;">
                <thead>
                    <tr onclick="UtilitaireAlertesEcarts.trierTable(event)">
                        <th data-col="0">AGENT ⬍</th>
                        <th data-col="1">ÉCART ⬍</th>
                        <th data-col="2">VALEUR LORGA ⬍</th>
                        <th data-col="3">VALEUR COGITIEL ⬍</th>
                    </tr>
                </thead>
                <tbody id="table-body-ecarts"></tbody>
            </table>
        `;
        this.interfaceGeneree = true;
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
        const mapLorga = this.indexerSource('lorga');
        const mapCogitiel = this.indexerSource('cogitiel');
        const tbody = document.getElementById('table-body-ecarts');
        tbody.innerHTML = '';

        if (!mapLorga || !mapCogitiel) {
            alert("Erreur : Chargez deux fichiers sources minimum.");
            return;
        }

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
        tbody.innerHTML += `<tr><td>${nom}</td><td style="color:red; font-weight:bold;">${type}</td><td>${valL}</td><td>${valC}</td></tr>`;
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
        let csv = "\ufeff" + "AGENT;ECART;LORGA;COGITIEL\n";
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
