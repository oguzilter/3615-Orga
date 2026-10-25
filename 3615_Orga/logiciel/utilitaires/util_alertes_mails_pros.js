const UtilitaireAlertesMailsPros = {
    interfaceGeneree: false,

    nettoyerTexte: function(chaine) {
        if (!chaine) return "";
        return chaine.toString().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");
    },

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);
        if (!conteneur) return;
        
        conteneur.innerHTML = `
            <h2>AFFICHAGE DE L'UTILISATION DES ADRESSES MAILS PROFESSIONNELLES</h2>
            <div class="barre-actions">
                <div class="groupe-actions-gauche">
                    <button onclick="UtilitaireAlertesMailsPros.lancerAnalyse()" class="bouton-action">LANCER L'ANALYSE</button>
                    <button id="btn-fullscreen-mails" onclick="UtilitaireAlertesMailsPros.basculerPleinEcran()" class="bouton-action">PLEIN ÉCRAN</button>
                </div>
                <div class="groupe-actions-droite">
                    <button id="btn-cci-mails" onclick="UtilitaireAlertesMailsPros.envoyerMailGroupe()" class="bouton-action bouton-bleu">ENVOI GROUPÉ (CCI)</button>
                    <button onclick="UtilitaireAlertesMailsPros.exporterExcel()" class="bouton-action bouton-export">EXPORT EXCEL (.csv)</button>
                </div>
            </div>
            <div id="statut-analyse-mails" class="statut-analyse"></div>
            <div id="conteneur-table-mails" class="conteneur-table">
                <table id="table-mails" class="table-cgt">
                    <thead>
                        <tr onclick="UtilitaireAlertesMailsPros.trierTable(event)">
                            <th data-col="0">CAMARADE ⬍</th>
                            <th data-col="1">SOURCE(S) ⬍</th>
                            <th data-col="2">EMAIL PRO (SNCF) ⬍</th>
                        </tr>
                    </thead>
                    <tbody id="table-body-mails"></tbody>
                </table>
            </div>
        `;
        this.interfaceGeneree = true;
    },

    basculerPleinEcran: function() {
        const wrap = document.getElementById('conteneur-table-mails');
        const btn = document.getElementById('btn-fullscreen-mails');
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

    envoyerMailGroupe: function() {
        if (typeof UtilitaireModalCci !== "undefined") {
            UtilitaireModalCci.ouvrir();
        }
    },

    lancerAnalyse: function() {
        const tbody = document.getElementById('table-body-mails');
        const statut = document.getElementById('statut-analyse-mails');
        if (!tbody) return;
        tbody.innerHTML = '';

        const sourcesChargees = Object.keys(UtilitaireExcel.sources).filter(k => UtilitaireExcel.sources[k].donnees && UtilitaireExcel.sources[k].donnees.length > 0);

        if (sourcesChargees.length === 0) {
            if (statut) statut.innerText = "Pense à charger au moins un fichier dans « Imports Exports Excel » camarade.";
            return;
        }

        const agentsMap = new Map();

        sourcesChargees.forEach(nomSource => {
            const data = UtilitaireExcel.sources[nomSource];
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
                const mail = (ligne[idxEmail] || "").toString().trim().toLowerCase();
                const partiesMail = mail.split('@');
                
                if (partiesMail.length > 1 && partiesMail[1].includes('sncf')) {
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

        const listeAgents = Array.from(agentsMap.values());

        if (listeAgents.length === 0) {
            if (statut) statut.innerText = "Aucune adresse mail SNCF trouvée.";
            return;
        }

        listeAgents.sort((a, b) => a.nom.localeCompare(b.nom));

        listeAgents.forEach(agent => {
            const sourcesJointes = Array.from(agent.sources).join(' + ');
            this.ajouterLigne(agent.nom, sourcesJointes, agent.email);
        });

        if (statut) {
            statut.innerText = `${listeAgents.length} camarade(s) avec une adresse mail SNCF.`;
        }
    },

    ajouterLigne: function(nom, sources, mail) {
        const tbody = document.getElementById('table-body-mails');
        if (!tbody) return;

        const tr = document.createElement('tr');

        const tdNom = document.createElement('td');
        tdNom.textContent = nom;

        const tdSources = document.createElement('td');
        tdSources.textContent = sources;

        const tdMail = document.createElement('td');
        const lien = document.createElement('a');
        lien.href = `mailto:${mail}`;
        lien.textContent = mail;
        tdMail.appendChild(lien);

        tr.appendChild(tdNom);
        tr.appendChild(tdSources);
        tr.appendChild(tdMail);
        tbody.appendChild(tr);
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
        let csv = "\ufeff" + "CAMARADE;SOURCE;EMAIL\n";
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