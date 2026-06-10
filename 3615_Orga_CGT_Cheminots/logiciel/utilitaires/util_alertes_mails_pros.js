const UtilitaireAlertesMailsPros = {
    interfaceGeneree: false,

    nettoyerTexte: function(chaine) {
        if (!chaine) return "";
        return chaine.toString().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");
    },

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);
        
        conteneur.innerHTML = `
            <h2>AFFICHAGE DE L'UTILISATION DES ADRESSES MAILS PROFESSIONNELLES</h2>
            <div style="margin-bottom:15px; display:flex; gap:10px;">
                <button onclick="UtilitaireAlertesMailsPros.lancerAnalyse()" class="bouton-action">LANCER L'ANALYSE</button>
                <button onclick="UtilitaireAlertesMailsPros.exporterExcel()" class="bouton-action" style="background-color:#28a745;">EXPORT EXCEL (.csv)</button>
            </div>
            <table id="table-mails" class="table-cgt" style="width:100%; cursor:pointer;">
                <thead>
                    <tr onclick="UtilitaireAlertesMailsPros.trierTable(event)">
                        <th data-col="0">AGENT ⬍</th>
                        <th data-col="1">SOURCE(S) ⬍</th>
                        <th data-col="2">EMAIL PROS (SNCF) ⬍</th>
                    </tr>
                </thead>
                <tbody id="table-body-mails"></tbody>
            </table>
        `;
        this.interfaceGeneree = true;
    },

    lancerAnalyse: function() {
        const tbody = document.getElementById('table-body-mails');
        tbody.innerHTML = '';
        const agentsMap = new Map();

        Object.keys(UtilitaireExcel.sources).forEach(nomSource => {
            const data = UtilitaireExcel.sources[nomSource];
            if (!data.donnees || data.donnees.length === 0) return;

            const enTetes = data.enTetes.map(h => this.nettoyerTexte(h));
            
            let idxEmail = -1, idxNom = -1, idxPrenom = -1;

            if (nomSource === 'cogitiel') {
                idxEmail = enTetes.findIndex(h => h.includes('EMAILRESPONSABLE'));
                idxNom = enTetes.findIndex(h => h.includes('NOMDURESPONSABLE'));
                idxPrenom = enTetes.findIndex(h => h.includes('PRENOM'));
            } else {
                idxEmail = enTetes.findIndex(h => h.includes('EMAIL'));
                idxNom = enTetes.findIndex(h => h.includes('SYNDIQUE'));
            }

            if (idxEmail === -1) return;

            data.donnees.forEach(ligne => {
                const mail = (ligne[idxEmail] || "").toString().toLowerCase();
                
                if (mail.includes('sncf')) {
                    let nomComplet = "";
                    if (nomSource === 'cogitiel') {
                        const nom = (ligne[idxNom] || "").toString().trim();
                        const prenom = (ligne[idxPrenom] || "").toString().trim();
                        nomComplet = `${nom} ${prenom}`.toUpperCase();
                    } else {
                        nomComplet = (ligne[idxNom] || "Inconnu").toString().trim().toUpperCase();
                    }

                    const cle = this.nettoyerTexte(nomComplet);
                    
                    if (!agentsMap.has(cle)) {
                        agentsMap.set(cle, { nom: nomComplet, sources: new Set(), email: mail });
                    }
                    agentsMap.get(cle).sources.add(nomSource.toUpperCase());
                }
            });
        });

        // Conversion en tableau et Tri alphabétique par nom
        const listeAgents = Array.from(agentsMap.values());
        listeAgents.sort((a, b) => a.nom.localeCompare(b.nom));

        // Affichage après tri
        listeAgents.forEach(agent => {
            const sourcesJointes = Array.from(agent.sources).join(' + ');
            this.ajouterLigne(agent.nom, sourcesJointes, agent.email);
        });
    },

    ajouterLigne: function(nom, sources, mail) {
        const tbody = document.getElementById('table-body-mails');
        tbody.innerHTML += `<tr><td>${nom}</td><td>${sources}</td><td>${mail}</td></tr>`;
    },

    trierTable: function(event) {
        const table = document.getElementById("table-mails");
        const colIndex = event.target.getAttribute("data-col");
        if (colIndex === null) return;
        const rows = Array.from(table.tBodies[0].rows);
        const direction = table.dataset.sortDir === "asc" ? -1 : 1;
        rows.sort((a, b) => a.cells[colIndex].innerText.toLowerCase().localeCompare(b.cells[colIndex].innerText.toLowerCase()) * direction);
        table.dataset.sortDir = direction === 1 ? "asc" : "desc";
        rows.forEach(row => table.tBodies[0].appendChild(row));
    },

    exporterExcel: function() {
        let csv = "\ufeff" + "AGENT;SOURCE;EMAIL\n";
        document.querySelectorAll("#table-body-mails tr").forEach(row => {
            const cols = Array.from(row.cells).map(c => `"${c.innerText.replace(/"/g, '""')}"`);
            csv += cols.join(";") + "\n";
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = "analyse_mails_sncf.csv";
        link.click();
    }
};
