const UtilitaireExcel = {
    sources: {
        lorga: { donnees: [], enTetes: [] },
        cogitiel: { donnees: [], enTetes: [] },
        cogetise: { donnees: [], enTetes: [] }
    },
    interfaceGeneree: false,

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);
        
        conteneur.innerHTML = `
            <h2>IMPORT DES FICHIERS EXCEL DE LORGA, COGITIEL ET COGETISE</h2>
            <div class="panneau-infos" style="display:flex; flex-direction:column; gap:10px;">
                
                <div style="display:flex; align-items:center; gap:10px;">
                    <label for="input-lorga" class="bouton-action">CHARGER LORGA</label>
                    <input type="file" id="input-lorga" accept=".xlsx, .xls" style="display:none;">
                    <span id="statut-lorga" style="font-weight:bold; color:gray;">Aucun fichier</span>
                </div>

                <div style="display:flex; align-items:center; gap:10px;">
                    <label for="input-cogitiel" class="bouton-action">CHARGER COGITIEL</label>
                    <input type="file" id="input-cogitiel" accept=".xlsx, .xls" style="display:none;">
                    <span id="statut-cogitiel" style="font-weight:bold; color:gray;">Aucun fichier</span>
                </div>

                <div style="display:flex; align-items:center; gap:10px;">
                    <button class="bouton-action" style="background-color:gray; cursor:not-allowed;" disabled>CHARGER COGETISE</button>
                    <span style="color:gray; font-size:0.8em;">(Indisponible)</span>
                </div>

                <div style="margin-top:10px;">
                    <button id="btn-vider" class="bouton-action" style="background-color:var(--rouge-cgt);">VIDER TOUT</button>
                </div>
            </div>
        `;

        document.getElementById('input-lorga').addEventListener('change', (e) => this.chargerFichier('lorga', e));
        document.getElementById('input-cogitiel').addEventListener('change', (e) => this.chargerFichier('cogitiel', e));
        document.getElementById('btn-vider').addEventListener('click', () => this.viderTout());
        
        this.interfaceGeneree = true;
    },

    chargerFichier: function(sourceKey, e) {
        const fichier = e.target.files[0];
        if (!fichier) return;

        const lecteur = new FileReader();
        lecteur.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const classeur = XLSX.read(data, { type: 'array' });
            const feuille = classeur.Sheets[classeur.SheetNames[0]];
            const donnees = XLSX.utils.sheet_to_json(feuille, { header: 1 });
            
            if (donnees.length > 0) {
                const s = this.sources[sourceKey];
                s.enTetes = donnees[0];
                s.donnees = donnees.slice(1).filter(l => l.length > 0);
                
                document.getElementById(`statut-${sourceKey}`).innerText = `${s.donnees.length} syndiqués chargés`;
                document.getElementById(`statut-${sourceKey}`).style.color = "var(--rouge-cgt)";
            }
        };
        lecteur.readAsArrayBuffer(fichier);
    },

    viderTout: function() {
        Object.keys(this.sources).forEach(key => {
            this.sources[key].donnees = [];
            this.sources[key].enTetes = [];
            
            const statutEl = document.getElementById(`statut-${key}`);
            if (statutEl) {
                statutEl.innerText = "Aucun fichier";
                statutEl.style.color = "gray";
            }
        });
        document.getElementById('input-lorga').value = '';
        document.getElementById('input-cogitiel').value = '';
    }
};
