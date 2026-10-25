const UtilitaireAlertesRetraites = {
    interfaceGeneree: false,

    convertirDateExcel: function(serial) {
        if (!serial || isNaN(serial) || serial < 10000) return "N/A";
        const date = new Date((serial - 25569) * 86400 * 1000);
        return date.toLocaleDateString('fr-FR');
    },

    getAnneeExcel: function(serial) {
        if (!serial || isNaN(serial) || serial < 10000) return null;
        return new Date((serial - 25569) * 86400 * 1000).getFullYear();
    },

    normaliser: function(chaine) {
        if (!chaine) return "";
        return chaine.toString().trim().toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]/g, "");
    },

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);
        if (!conteneur) return;

        conteneur.innerHTML = `
            <h2>FUTURS DÉPARTS EN RETRAITE POUR LA CONTINUITÉ SYNDICALE</h2>
            <div class="barre-actions">
                <div class="groupe-actions-gauche">
                    <button onclick="UtilitaireAlertesRetraites.lancerAnalyse()" class="bouton-action">LANCER L'ANALYSE</button>
                    <button id="btn-fullscreen-retraites" onclick="UtilitaireAlertesRetraites.basculerPleinEcran()" class="bouton-action">PLEIN ÉCRAN</button>
                </div>
                <div class="groupe-actions-droite">
                    <button onclick="UtilitaireAlertesRetraites.exporterExcel()" class="bouton-action bouton-export">EXPORT EXCEL (.csv)</button>
                </div>
            </div>
            <div id="statut-analyse-retraites" class="statut-analyse"></div>
            <div id="conteneur-table-retraites" class="conteneur-table">
                <table id="table-retraites" class="table-cgt">
                    <thead>
                        <tr onclick="UtilitaireAlertesRetraites.trierTable(event)">
                            <th data-col="0">CAMARADE ⬍</th>
                            <th data-col="1">DATE NAISSANCE ⬍</th>
                            <th data-col="2">ÂGE ⬍</th>
                        </tr>
                    </thead>
                    <tbody id="table-body-retraites"></tbody>
                </table>
            </div>
        `;
        this.interfaceGeneree = true;
    },

    basculerPleinEcran: function() {
        const wrap = document.getElementById('conteneur-table-retraites');
        const btn = document.getElementById('btn-fullscreen-retraites');
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

    lancerAnalyse: function() {
        const tbody = document.getElementById('table-body-retraites');
        const statut = document.getElementById('statut-analyse-retraites');
        if (!tbody) return;
        tbody.innerHTML = '';

        const sourcesChargees = Object.keys(UtilitaireExcel.sources).filter(k => UtilitaireExcel.sources[k].donnees && UtilitaireExcel.sources[k].donnees.length > 0);

        if (sourcesChargees.length === 0) {
            if (statut) statut.innerText = "Pense à charger au moins le fichier Lorga dans « Imports Exports Excel » camarade.";
            return;
        }

        const anneeActuelle = new Date().getFullYear();
        const agentsMap = new Map();

        sourcesChargees.forEach(nomSource => {
            const data = UtilitaireExcel.sources[nomSource];
            const enTetes = data.enTetes.map(h => this.normaliser(h));
            const idxNom = enTetes.findIndex(h => h.includes('SYNDIQUE') || h.includes('NOM'));
            const idxDate = enTetes.findIndex(h => h.includes('NELE') || h.includes('NAISSANCE'));
            const idxRetraite = enTetes.findIndex(h => h.includes('RETRAITE'));

            if (idxNom === -1 || idxDate === -1) return;

            data.donnees.forEach(ligne => {
                const nom = (ligne[idxNom] || "Inconnu").toString().trim();
                const valDate = ligne[idxDate];
                const valRetraite = idxRetraite !== -1 ? ligne[idxRetraite] : null;

                if (valRetraite && valRetraite.toString().trim() !== "") return;

                const anneeNaiss = this.getAnneeExcel(valDate);

                if (anneeNaiss) {
                    const age = anneeActuelle - anneeNaiss;
                    if (age >= 49) {
                        const cle = this.normaliser(nom);
                        if (cle.length > 2 && !agentsMap.has(cle)) {
                            agentsMap.set(cle, { nom, date: this.convertirDateExcel(valDate), age });
                        }
                    }
                }
            });
        });

        const resultats = Array.from(agentsMap.values());

        if (resultats.length === 0) {
            if (statut) statut.innerText = "Aucun camarade de 49 ans ou plus trouvé.";
            return;
        }

        resultats.sort((a, b) => b.age - a.age);
        resultats.forEach(r => this.ajouterLigne(r.nom, r.date, r.age));

        if (statut) {
            statut.innerText = `${resultats.length} camarade(s) de 49 ans ou plus trouvé(s).`;
        }
    },

    ajouterLigne: function(nom, date, age) {
        const tbody = document.getElementById('table-body-retraites');
        if (!tbody) return;

        const tr = document.createElement('tr');

        const tdNom = document.createElement('td');
        tdNom.textContent = nom;

        const tdDate = document.createElement('td');
        tdDate.textContent = date;

        const tdAge = document.createElement('td');
        tdAge.className = "cellule-gras";
        tdAge.textContent = `${age} ans`;

        tr.appendChild(tdNom);
        tr.appendChild(tdDate);
        tr.appendChild(tdAge);
        tbody.appendChild(tr);
    },

    trierTable: function(event) {
        const table = document.getElementById("table-retraites");
        const colIndex = event.target.getAttribute("data-col");
        if (colIndex === null) return;
        const rows = Array.from(table.tBodies[0].rows);
        const direction = table.dataset.sortDir === "asc" ? -1 : 1;

        rows.sort((a, b) => {
            const valA = a.cells[colIndex].innerText.trim();
            const valB = b.cells[colIndex].innerText.trim();

            if (colIndex === "1") {
                const datePartsA = valA.split('/');
                const datePartsB = valB.split('/');
                const timeA = datePartsA.length === 3 ? new Date(datePartsA[2], datePartsA[1] - 1, datePartsA[0]).getTime() : 0;
                const timeB = datePartsB.length === 3 ? new Date(datePartsB[2], datePartsB[1] - 1, datePartsB[0]).getTime() : 0;
                return (timeA - timeB) * direction;
            }

            return valA.toLowerCase().localeCompare(valB.toLowerCase(), undefined, {numeric: true}) * direction;
        });

        table.dataset.sortDir = direction === 1 ? "asc" : "desc";
        rows.forEach(row => table.tBodies[0].appendChild(row));
    },

    exporterExcel: function() {
        let csv = "\ufeff" + "CAMARADE;DATE NAISSANCE;ÂGE\n";
        document.querySelectorAll("#table-body-retraites tr").forEach(row => {
            const cols = Array.from(row.cells).map(c => `"${c.innerText.replace(/"/g, '""')}"`);
            csv += cols.join(";") + "\n";
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = "analyse_retraites.csv";
        link.click();
    }
};