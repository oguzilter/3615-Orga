const UtilitaireFaq = {
    interfaceGeneree: false,

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);
        if (!conteneur) return;

        conteneur.innerHTML = `
            <h2>FOIRE AUX QUESTIONS (FAQ)</h2>
            <div class="panneau-infos">
                <input type="text" id="recherche-faq" class="recherche-faq" placeholder="Rechercher une question ou un mot-clé...">
                <div id="liste-faq"></div>
                <div id="note-faq" class="faq-note"></div>
            </div>
        `;

        const donneesFaq = (typeof CONFIG_FAQ !== 'undefined') ? CONFIG_FAQ : [];
        this.afficherFaq(donneesFaq);

        const conteneurNote = document.getElementById('note-faq');
        if (conteneurNote && typeof CONFIG_FAQ_NOTE !== 'undefined' && CONFIG_FAQ_NOTE) {
            conteneurNote.textContent = CONFIG_FAQ_NOTE;
        }

        const champRecherche = document.getElementById('recherche-faq');
        if (champRecherche) {
            champRecherche.addEventListener('input', (e) => this.filtrerFaq(e.target.value));
        }

        this.interfaceGeneree = true;
    },

    afficherFaq: function(liste) {
        const conteneurListe = document.getElementById('liste-faq');
        if (!conteneurListe) return;

        conteneurListe.innerHTML = '';

        if (!liste || liste.length === 0) {
            conteneurListe.innerHTML = '<p>Aucune question ne correspond à votre recherche camarade.</p>';
            return;
        }

        const categoriesMap = new Map();
        liste.forEach(item => {
            const cat = item.categorie || "Général";
            if (!categoriesMap.has(cat)) {
                categoriesMap.set(cat, []);
            }
            categoriesMap.get(cat).push(item);
        });

        categoriesMap.forEach((questions, categorie) => {
            const titreCat = document.createElement('h3');
            titreCat.className = 'faq-categorie';
            titreCat.textContent = categorie;
            conteneurListe.appendChild(titreCat);

            questions.forEach(q => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'faq-item';

                const questionDiv = document.createElement('div');
                questionDiv.className = 'faq-question';

                const spanQuestion = document.createElement('span');
                spanQuestion.textContent = q.question;

                const spanFleche = document.createElement('span');
                spanFleche.textContent = '▼';

                questionDiv.appendChild(spanQuestion);
                questionDiv.appendChild(spanFleche);

                const reponseDiv = document.createElement('div');
                reponseDiv.className = 'faq-reponse';

                const pReponse = document.createElement('p');
                pReponse.textContent = q.reponse;
                reponseDiv.appendChild(pReponse);

                questionDiv.addEventListener('click', () => {
                    itemDiv.classList.toggle('ouvert');
                    spanFleche.textContent = itemDiv.classList.contains('ouvert') ? '▲' : '▼';
                });

                itemDiv.appendChild(questionDiv);
                itemDiv.appendChild(reponseDiv);
                conteneurListe.appendChild(itemDiv);
            });
        });
    },

    filtrerFaq: function(texte) {
        if (typeof CONFIG_FAQ === 'undefined') return;

        const saisie = texte.toLowerCase().trim();
        if (!saisie) {
            this.afficherFaq(CONFIG_FAQ);
            return;
        }

        const resultat = CONFIG_FAQ.filter(item => {
            const q = (item.question || "").toLowerCase();
            const r = (item.reponse || "").toLowerCase();
            const c = (item.categorie || "").toLowerCase();
            return q.includes(saisie) || r.includes(saisie) || c.includes(saisie);
        });

        this.afficherFaq(resultat);
    }
};