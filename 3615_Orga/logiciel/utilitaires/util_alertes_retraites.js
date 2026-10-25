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
        
        conteneur.innerHTML = `
            <h2>FUTURS DÉPARTS EN RETRAITES POUR LA CONTINUITE SYNDICALE</h2>
            <div style="margin-bottom:15px; display:flex; gap:10px;">
                <button onclick="UtilitaireAlertesRetraites.lancerAnalyse()" class="bouton-action">LANCER L'ANALYSE</button>
                <button onclick="UtilitaireAlertesRetraites.exporterExcel()" class="bouton-action" style="background-color:#28a745;">EXPORT EXCEL (.csv)</button>
            </div>
            <table id="table-retraites" class="table-cgt" style="width:100%; cursor:pointer;">
                <thead>
                    <tr onclick="UtilitaireAlertesRetraites.trierTable(event)">
                        <th data-col="0">AGENT ⬍</th>
                        <th data-col="1">DATE NAISSANCE ⬍</th>
                        <th data-col="2">ÂGE ⬍</th>
                    </tr>
                </thead>
                <tbody id="table-body-retraites"></tbody>
            </table>
        `;
        this.interfaceGeneree = true;
    },

    lancerAnalyse: function() {
        const tbody = document.getElementById('table-body-retraites');
        tbody.innerHTML = '';
        const anneeActuelle = new Date().getFullYear();
        const resultats = [];

        Object.keys(UtilitaireExcel.sources).forEach(nomSource => {
            const data = UtilitaireExcel.sources[nomSource];
            if (!data.donnees || data.donnees.length === 0) return;

            const enTetes = data.enTetes.map(h => this.normaliser(h));
            const idxNom = enTetes.findIndex(h => h.includes('SYNDIQUE') || h.includes('NOM'));
            const idxDate = enTetes.findIndex(h => h.includes('NELE') || h.includes('NAISSANCE'));
            const idxRetraite = enTetes.findIndex(h => h.includes('RETRAITE'));

            if (idxNom === -1 || idxDate === -1) return;

            data.donnees.forEach(ligne => {
                const nom = ligne[idxNom] || "Inconnu";
                const valDate = ligne[idxDate];
                const valRetraite = idxRetraite !== -1 ? ligne[idxRetraite] : null;

                if (valRetraite && valRetraite.toString().trim() !== "") return;

                const anneeNaiss = this.getAnneeExcel(valDate);
                
                if (anneeNaiss) {
                    const age = anneeActuelle - anneeNaiss;
                    if (age >= 49) {
                        resultats.push({ nom, date: this.convertirDateExcel(valDate), age });
                    }
                }
            });
        });

        if (resultats.length === 0) {
            alert("Aucun agent actif de 49 ans ou plus trouvé.");
            return;
        }

        resultats.sort((a, b) => b.age - a.age);

        resultats.forEach(r => this.ajouterLigne(r.nom, r.date, r.age));
    },

    ajouterLigne: function(nom, date, age) {
        const tbody = document.getElementById('table-body-retraites');
        tbody.innerHTML += `<tr><td>${nom}</td><td>${date}</td><td style="font-weight:bold;">${age} ans</td></tr>`;
    },

    trierTable: function(event) {
        const table = document.getElementById("table-retraites");
        const colIndex = event.target.getAttribute("data-col");
        if (colIndex === null) return;
        const rows = Array.from(table.tBodies[0].rows);
        const direction = table.dataset.sortDir === "asc" ? -1 : 1;
        
        rows.sort((a, b) => {
            const valA = a.cells[colIndex].innerText.toLowerCase();
            const valB = b.cells[colIndex].innerText.toLowerCase();
            return valA.localeCompare(valB, undefined, {numeric: true}) * direction;
        });

        table.dataset.sortDir = direction === 1 ? "asc" : "desc";
        rows.forEach(row => table.tBodies[0].appendChild(row));
    },

    exporterExcel: function() {
        let csv = "\ufeff" + "AGENT;DATE NAISSANCE;AGE\n";
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
