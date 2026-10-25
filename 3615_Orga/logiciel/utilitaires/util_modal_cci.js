const UtilitaireModalCci = {
    modalId: "modale-cci-cgt",

    recupererMails: function() {
        const mails = [];
        document.querySelectorAll("#table-body-mails tr").forEach(tr => {
            const lienMail = tr.querySelector("td:nth-child(3) a");
            if (lienMail && lienMail.textContent.trim()) {
                mails.push(lienMail.textContent.trim());
            }
        });
        return Array.from(new Set(mails));
    },

    recupererSeparateurAuto: function() {
        return (navigator.userAgent.indexOf("Win") !== -1) ? ";" : ",";
    },

    ouvrir: function() {
        const mails = this.recupererMails();
        if (mails.length === 0) {
            alert("Aucune adresse mail disponible dans le tableau camarade !");
            return;
        }

        let modal = document.getElementById(this.modalId);
        if (!modal) {
            modal = document.createElement("div");
            modal.id = this.modalId;
            modal.className = "fond-modale-cci";
            document.body.appendChild(modal);
        }

        const nbMails = mails.length;
        const separateur = this.recupererSeparateurAuto();
        const chaineMails = mails.join(separateur + " ");

        modal.innerHTML = `
            <div class="boite-modale-cci">
                <div class="entete-modale-cci">
                    <h3>PRÉPARATION DE L'ENVOI GROUPÉ (${nbMails} DESTINATAIRE${nbMails > 1 ? 'S' : ''})</h3>
                    <button class="bouton-fermer-modale" onclick="UtilitaireModalCci.fermer()">✕</button>
                </div>

                <div class="corps-modale-cci">
                    <p class="avertissement-cci">
                        ⚠️ Attention camarade, pour des raisons de discrétion évidentes, copie-colle ces e-mails dans le champ Cci. En cas de doute, n'hésite pas à demander l'avis d'un professionnel.
                    </p>

                    <div class="bloc-methode">
                        <div class="titre-methode">MÉTHODE 1 : OUVERTURE DIRECTE DU SERVICE DE MESSAGERIE</div>
                        <div class="boutons-services-webmail">
                            <button class="bouton-action" onclick="UtilitaireModalCci.lancerClient('gmail')">GMAIL</button>
                            <button class="bouton-action" onclick="UtilitaireModalCci.lancerClient('outlook')">OUTLOOK WEB</button>
                            <button class="bouton-action" onclick="UtilitaireModalCci.lancerClient('orange')">ORANGE</button>
                            <button class="bouton-action" onclick="UtilitaireModalCci.lancerClient('sfr')">SFR</button>
                            <button class="bouton-action" onclick="UtilitaireModalCci.lancerClient('proton')">PROTON MAIL</button>
                            <button class="bouton-action" onclick="UtilitaireModalCci.lancerClient('yahoo')">YAHOO MAIL</button>
                            <button class="bouton-action bouton-bleu" onclick="UtilitaireModalCci.lancerClient('mailto')">CLIENT LOCAL (MAILTO)</button>
                        </div>
                    </div>

                    <div class="separateur-modale"></div>

                    <div class="bloc-methode">
                        <div class="titre-methode">MÉTHODE 2 : COPIE DIRECTE DANS LE PRESSE-PAPIERS</div>
                        <div class="zone-champ-modale">
                            <label>LISTE DES DESTINATAIRES :</label>
                            <textarea id="zone-texte-mails-cci" readonly rows="5">${chaineMails}</textarea>
                        </div>
                        <div class="actions-copie-modale">
                            <button class="bouton-action" onclick="UtilitaireModalCci.copierPressePapier(';')">COPIER TOUT POUR OUTLOOK</button>
                            <button class="bouton-action" onclick="UtilitaireModalCci.copierPressePapier(',')">COPIER TOUT POUR LES AUTRES</button>
                        </div>
                        <div id="confirmation-copie-cci" class="confirmation-copie"></div>
                    </div>

                    <div class="separateur-modale"></div>

                    <div class="bloc-methode">
                        <div class="titre-methode">MÉTHODE 3 : EXPORTS DU FICHIER DESTINATAIRES</div>
                        <div class="boutons-exports-modale">
                            <button class="bouton-action bouton-export" onclick="UtilitaireModalCci.exporterFichier('txt')">EXPORT FORMAT TEXTE (.txt)</button>
                            <button class="bouton-action bouton-export" onclick="UtilitaireModalCci.exporterFichier('csv')">EXPORT LISTE (.csv)</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = "flex";
    },

    fermer: function() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.style.display = "none";
        }
    },

    copierPressePapier: function(sep) {
        const mails = this.recupererMails();
        const texte = mails.join(sep + " ");
        navigator.clipboard.writeText(texte).then(() => {
            const notif = document.getElementById("confirmation-copie-cci");
            if (notif) {
                notif.innerText = `✓ ${mails.length} adresses copiées dans le presse-papiers avec le séparateur « ${sep} » !`;
                setTimeout(() => {
                    const el = document.getElementById("confirmation-copie-cci");
                    if (el) el.innerText = "";
                }, 4000);
            }
        });
    },

    lancerClient: function(service) {
        const mails = this.recupererMails();
        const sep = (service === "outlook" || navigator.userAgent.indexOf("Win") !== -1) ? ";" : ",";
        const bccStr = mails.join(sep);

        const objet = typeof CONFIG_MODELE_MAIL !== "undefined" ? CONFIG_MODELE_MAIL.objet : "";
        const corps = typeof CONFIG_MODELE_MAIL !== "undefined" ? CONFIG_MODELE_MAIL.corps : "";

        const objEnc = encodeURIComponent(objet);
        const corpsEnc = encodeURIComponent(corps);
        const bccEnc = encodeURIComponent(bccStr);

        this.copierPressePapier(sep);

        let url = "";

        if (service === "gmail") {
            url = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&bcc=${bccEnc}&su=${objEnc}&body=${corpsEnc}`;
        } else if (service === "outlook") {
            url = `https://outlook.live.com/mail/0/deeplink/compose?bcc=${bccEnc}&subject=${objEnc}&body=${corpsEnc}`;
        } else if (service === "yahoo") {
            url = `https://compose.mail.yahoo.com/?bcc=${bccEnc}&subject=${objEnc}&body=${corpsEnc}`;
        } else if (service === "proton") {
            url = `https://mail.proton.me/u/0/`;
        } else if (service === "orange") {
            url = `https://messagerie.orange.fr/`;
        } else if (service === "sfr") {
            url = `https://webmail.sfr.fr/`;
        } else if (service === "mailto") {
            window.location.href = `mailto:?bcc=${bccEnc}&subject=${objEnc}&body=${corpsEnc}`;
            return;
        }

        if (url) {
            window.open(url, "_blank");
        }
    },

    exporterFichier: function(format) {
        const mails = this.recupererMails();
        let contenu = "";
        let mime = "text/plain;charset=utf-8;";
        let ext = "txt";

        if (format === "csv") {
            contenu = "\ufeff" + "EMAIL\n" + mails.map(m => `"${m}"`).join("\n");
            mime = "text/csv;charset=utf-8;";
            ext = "csv";
        } else {
            contenu = mails.join("\r\n");
        }

        const blob = new Blob([contenu], { type: mime });
        const lien = document.createElement("a");
        lien.href = URL.createObjectURL(blob);
        lien.download = `destinataires_cci.${ext}`;
        lien.click();
    }
};