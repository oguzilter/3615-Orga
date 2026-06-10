const CONFIG_MENU = [

    { id: "accueil", nom: "ACCUEIL" },
    { id: "util_excel", nom: "IMPORT EXCEL LORGA, COGITIEL ET COGETISE" },
    { id: "util_point_orga", nom: "POINT ORGA" },
    { id: "util_alertes_ecarts", nom: "ALERTES ECARTS" },
    { id: "util_alertes_retraites", nom: "ALERTES RETRAITES" },
    { id: "util_alertes_mails_pros", nom: "ALERTES MAILS PROS" },
    { id: "infos", nom: "INFORMATIONS & VERSIONS" }
];

const nav = document.getElementById('menu-lateral');

CONFIG_MENU.forEach(item => {
    const btn = document.createElement('button');
    btn.textContent = item.nom;

    if (item.id === "util_point_orga") {
        btn.disabled = true;
    } else {
        btn.onclick = () => afficherSection(item.id);
    }

    nav.appendChild(btn);
});
