const CONFIG_FAQ = [
    {
        categorie: "Généralités et Ergonomie",
        question: "À quoi sert le logiciel 3615 Orga ?",
        reponse: "3615 Orga est un outil militant conçu pour faciliter le travail d'organisation syndicale et le fonctionnement de l'orphelinat ONCF. Il permet de croiser les bases de données (Lorga, Cogitiel, et prochainement l'ONCF et Cogetise), de détecter les anomalies de coordonnées, d'anticiper les départs en retraite et de préparer les campagnes de contact en toute sécurité."
    },
    {
        categorie: "Généralités et Ergonomie",
        question: "Comment basculer entre l'univers CGT et l'univers ONCF ?",
        reponse: "Sur la page d'accueil, il suffit d'appuyer sur le bouton « CGT CHEMINOT·E·S » ou sur le bouton « ONCF » pour changer d'univers. L'interface s'adapte immédiatement."
    },
    {
        categorie: "Généralités et Ergonomie",
        question: "Comment masquer ou réafficher le menu latéral ?",
        reponse: "Cliquez sur le bouton « ☰ » situé tout en haut à gauche dans le bandeau supérieur. Le panneau latéral se replie pour offrir un maximum de visibilité sur vos tableaux. Cliquez à nouveau dessus pour faire réapparaître le menu."
    },
    {
        categorie: "Généralités et Ergonomie",
        question: "L'application fonctionne-t-elle sans connexion Internet ?",
        reponse: "Oui. Le logiciel intègre son propre décodeur Excel autonome et fonctionne à 100 % hors-ligne. Vous pouvez travailler sur vos bases de données sans connexion internet, que vous soyez en local syndical, chez vous ou en déplacement."
    },
    {
        categorie: "Imports et Fichiers Excel",
        question: "Comment importer mes données et vérifier le chargement ?",
        reponse: "Rendez-vous dans l'onglet « IMPORTS EXPORTS EXCEL », puis cliquez sur le bouton correspondant au fichier que vous souhaitez ouvrir (Lorga ou Cogitiel). Un message s'affiche directement pour indiquer le nombre d'adhérents chargés dans la base."
    },
    {
        categorie: "Imports et Fichiers Excel",
        question: "Pourquoi les boutons « CHARGER ONCF » et « CHARGER COGETISE » sont-ils grisés ?",
        reponse: "Ces deux sources d'importation sont en cours de développement et arriveront prochainement dans de futures versions. Au survol de la souris, l'infobulle « Fonctionnalité bientôt disponible camarade » s'affiche pour vous le rappeler."
    },
    {
        categorie: "Imports et Fichiers Excel",
        question: "Comment vider les données actuellement en mémoire ?",
        reponse: "Dans l'onglet « IMPORTS EXPORTS EXCEL », cliquez sur le bouton rouge « VIDER TOUT ». Cela réinitialise immédiatement l'application et vide toutes les données chargées en mémoire vive pour repartir à zéro."
    },
    {
        categorie: "Alertes et Tableaux",
        question: "À quoi sert le module « ALERTES ÉCARTS » ?",
        reponse: "Ce module compare automatiquement les fiches des camarades entre vos fichiers Lorga et Cogitiel (et prochainement avec Cogetise et l'ONCF). Il met en évidence les différences éventuelles d'adresses postales, de numéros de téléphone ou d'e-mails afin de faciliter la mise à jour de vos bases syndicales."
    },
    {
        categorie: "Alertes et Tableaux",
        question: "Comment fonctionne le module « ALERTES RETRAITES » ?",
        reponse: "Ce module prend directement les informations sur « LORGA ». Il classe les camarades proches de l'âge de départ par ordre chronologique pour anticiper la continuité syndicale."
    },
    {
        categorie: "Alertes et Tableaux",
        question: "À quoi sert le module « ALERTES MAILS PROS » ?",
        reponse: "Ce module trouve simplement les camarades qui utilisent une adresse mail professionnelle, afin de pouvoir leur demander une adresse personnelle pour les communications syndicales."
    },
    {
        categorie: "Alertes et Tableaux",
        question: "Comment exporter l'intégralité d'un tableau en Excel / CSV ?",
        reponse: "Directement au-dessus des tableaux d'alertes, le bouton « EXPORT EXCEL (.csv) » permet d'exporter l'intégralité du tableau affiché avec toutes ses colonnes."
    },
    {
        categorie: "Alertes et Tableaux",
        question: "Comment fonctionne l'envoi groupé en CCI ?",
        reponse: "La fenêtre « ENVOI GROUPÉ (CCI) » propose trois méthodes : cliquer pour envoyer le mail directement (via les boutons de messageries comme Gmail, Outlook Web, Orange, etc. ou le client local), copier pour coller dans le champ CCi (avec un bouton pour Outlook et un bouton pour les autres messageries), ou exporter uniquement les mails en fichier texte (.txt) ou tableau (.csv)."
    },
    {
        categorie: "Alertes et Tableaux",
        question: "Comment afficher un tableau en plein écran ?",
        reponse: "Dans chacun des modules d'alertes, cliquez sur le bouton « PLEIN ÉCRAN » situé au-dessus du tableau. Le tableau occupera l'intégralité de l'écran avec les en-têtes de colonnes figés en haut pour faciliter la lecture. Cliquez sur « QUITTER LE PLEIN ÉCRAN » pour revenir à l'affichage normal."
    },
    {
        categorie: "Modules en cours et Avenir",
        question: "Pourquoi les onglets « POINT ORGA » et « COM ORGA » affichent-ils « Codage en cours » ?",
        reponse: "Le développement et l'automatisation des modules Point Orga et Com Orga attendent la prochaine mise à jour 2027 de « LORGA ». Les emplacements et la structure sont d'ores et déjà prêts dans le logiciel pour accueillir les données dès le déploiement de cette version."
    },
    {
        categorie: "Sécurité et Mises à jour",
        question: "Mes données sont-elles protégées et le logiciel crée-t-il des fichiers temporaires ?",
        reponse: "Toutes les données sont traitées exclusivement dans la mémoire vive de votre navigateur avec une protection contre les injections de code. Le logiciel ne se connecte à aucun serveur externe pour traiter vos fichiers et ne crée absolument aucun fichier temporaire sur votre ordinateur. Dès que la page est fermée, toutes les informations en mémoire disparaissent."
    },
    {
        categorie: "Sécurité et Mises à jour",
        question: "Comment fonctionne la recherche de mises à jour ?",
        reponse: "Lorsque l'ordinateur est connecté à Internet, le logiciel vérifie automatiquement si une version plus récente est disponible sur GitHub et propose un lien de téléchargement. Sans connexion Internet, l'application reste utilisable à 100 %."
    },
    {
        categorie: "Sécurité et Mises à jour",
        question: "Qui contacter en cas de difficulté technique ou de suggestion ?",
        reponse: "Rendez-vous sur l'onglet « CONTACT & INFORMATIONS ». Vous y trouverez l'adresse électronique de contact, l'historique complet des versions et la liste des prochains chantiers prévus."
    }
];

const CONFIG_FAQ_NOTE = "Merci à la camarade Lucie pour la FAQ 🏳️‍🌈";