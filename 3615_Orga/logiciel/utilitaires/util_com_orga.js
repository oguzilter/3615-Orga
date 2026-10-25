const UtilitaireComOrga = {
    interfaceGeneree: false,

    genererInterface: function(conteneurId) {
        if (this.interfaceGeneree) return;
        const conteneur = document.getElementById(conteneurId);
        if (!conteneur) return;

        conteneur.innerHTML = `
            <div class="vue-centree">
                <h2 class="texte-codage-en-cours">Codage en cours</h2>
            </div>
        `;

        this.interfaceGeneree = true;
    }
};