const UtilitaireInfos = {
    interfaceGeneree: false,

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);
        if (!conteneur || typeof CONFIG_INFOS === 'undefined') return;

        conteneur.innerHTML = `
            <h2>CONTACT ET INFORMATIONS</h2>
            <div class="panneau-infos">
                <h3>CONTACT</h3>
                <p><a href="mailto:${CONFIG_INFOS.contact_email}">${CONFIG_INFOS.contact_email}</a></p>
            </div>
            <div class="panneau-infos">
                <h3>HISTORIQUE</h3>
                <ul id="liste-historique"></ul>
            </div>
            <div class="panneau-infos">
                <h3>À VENIR</h3>
                <ul id="liste-majs"></ul>
            </div>
        `;

        const listeHist = document.getElementById('liste-historique');
        if (listeHist && CONFIG_INFOS.historique_versions) {
            CONFIG_INFOS.historique_versions.forEach(texte => {
                const li = document.createElement('li');
                li.textContent = texte;
                listeHist.appendChild(li);
            });
        }

        const listeMajs = document.getElementById('liste-majs');
        if (listeMajs && CONFIG_INFOS.mises_a_jour_a_venir) {
            CONFIG_INFOS.mises_a_jour_a_venir.forEach(texte => {
                const li = document.createElement('li');
                li.textContent = texte;
                listeMajs.appendChild(li);
            });
        }

        this.interfaceGeneree = true;
    }
};