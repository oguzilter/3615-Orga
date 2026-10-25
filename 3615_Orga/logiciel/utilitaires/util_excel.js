const UtilitaireExcel = {
    sources: {
        lorga: { donnees: [], enTetes: [] },
        cogitiel: { donnees: [], enTetes: [] },
        cogetise: { donnees: [], enTetes: [] },
        oncf: { donnees: [], enTetes: [] }
    },
    interfaceGeneree: false,

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);

        conteneur.innerHTML = `
            <h2>IMPORT DES FICHIERS EXCEL (LORGA, COGITIEL, COGETISE ET ONCF)</h2>
            <div class="panneau-infos panneau-import">

                <div class="ligne-import">
                    <label for="input-lorga" class="bouton-action">CHARGER LORGA</label>
                    <input type="file" id="input-lorga" accept=".xlsx, .xls" class="input-fichier-cache">
                    <span id="statut-lorga" class="statut-fichier">Aucun fichier</span>
                </div>

                <div class="ligne-import">
                    <label for="input-cogitiel" class="bouton-action">CHARGER COGITIEL</label>
                    <input type="file" id="input-cogitiel" accept=".xlsx, .xls" class="input-fichier-cache">
                    <span id="statut-cogitiel" class="statut-fichier">Aucun fichier</span>
                </div>

                <div class="ligne-import">
                    <button class="bouton-action" disabled title="Fonctionnalité bientôt disponible camarade">CHARGER COGETISE</button>
                    <span class="texte-indisponible">(Indisponible)</span>
                </div>

                <div class="ligne-import">
                    <button class="bouton-action" disabled title="Fonctionnalité bientôt disponible camarade">CHARGER ONCF</button>
                    <span class="texte-indisponible">(Indisponible)</span>
                </div>

                <div class="zone-vider">
                    <button id="btn-vider" class="bouton-action bouton-danger">VIDER TOUT</button>
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

                const statutEl = document.getElementById(`statut-${sourceKey}`);
                if (statutEl) {
                    statutEl.innerText = `${s.donnees.length} syndiqués chargés`;
                    statutEl.classList.add('charge');
                }
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
                statutEl.classList.remove('charge');
            }
        });
        const inputLorga = document.getElementById('input-lorga');
        const inputCogitiel = document.getElementById('input-cogitiel');
        if (inputLorga) inputLorga.value = '';
        if (inputCogitiel) inputCogitiel.value = '';
    }
};