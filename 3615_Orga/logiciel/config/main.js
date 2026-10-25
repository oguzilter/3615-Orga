let universActuel = "cgt";

document.addEventListener("DOMContentLoaded", () => {
    initToggleMenu();
    initSelecteurUnivers();
    basculerUnivers("cgt");
    verifierMiseAJour();
});

function initToggleMenu() {
    const btn = document.getElementById('btn-toggle-menu');
    const menu = document.getElementById('menu-lateral');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.toggle('menu-masque');
    });
}

function initSelecteurUnivers() {
    const btnCgt = document.getElementById('btn-choix-cgt');
    const btnOncf = document.getElementById('btn-choix-oncf');

    if (btnCgt) {
        btnCgt.addEventListener('click', () => basculerUnivers("cgt"));
    }
    if (btnOncf) {
        btnOncf.addEventListener('click', () => basculerUnivers("oncf"));
    }
}

function basculerUnivers(mode) {
    universActuel = mode;

    const themeCgt = document.getElementById('theme-cgt');
    const themeOncf = document.getElementById('theme-oncf');
    const titre = document.getElementById('titre-principal');
    const logo = document.getElementById('logo-principal');
    const btnCgt = document.getElementById('btn-choix-cgt');
    const btnOncf = document.getElementById('btn-choix-oncf');

    if (mode === "oncf") {
        if (themeCgt) themeCgt.disabled = true;
        if (themeOncf) themeOncf.disabled = false;
        if (titre) titre.innerText = "3615 ORGA ONCF";
        if (logo) {
            logo.src = "logiciel/medias/oncf.jpg";
            logo.className = "logo-ONCF";
        }
        if (btnCgt) btnCgt.classList.remove('actif');
        if (btnOncf) btnOncf.classList.add('actif');
    } else {
        if (themeOncf) themeOncf.disabled = true;
        if (themeCgt) themeCgt.disabled = false;
        if (titre) titre.innerText = "3615 ORGA CGT CHEMINOT·E·S";
        if (logo) {
            logo.src = "logiciel/medias/logo_cgt_cdw.gif";
            logo.className = "logo-CGT";
        }
        if (btnOncf) btnOncf.classList.remove('actif');
        if (btnCgt) btnCgt.classList.add('actif');
    }

    genererMenu();
}

function genererMenu() {
    const menuContainer = document.getElementById('menu-lateral');
    if (!menuContainer) return;

    const listeMenu = (universActuel === "oncf" && typeof CONFIG_MENU_ONCF !== 'undefined') 
        ? CONFIG_MENU_ONCF 
        : (typeof CONFIG_MENU_CGT !== 'undefined' ? CONFIG_MENU_CGT : []);

    menuContainer.innerHTML = '';

    listeMenu.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'bouton-menu';
        if (item.id === 'accueil') btn.classList.add('actif');
        btn.innerText = item.nom;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.bouton-menu').forEach(b => b.classList.remove('actif'));
            btn.classList.add('actif');

            document.querySelectorAll('.vue-section').forEach(section => {
                section.classList.add('section-cachee');
            });

            const sectionCible = document.getElementById(item.id);
            if (sectionCible) {
                sectionCible.classList.remove('section-cachee');

                if (item.id === 'util_excel' && typeof UtilitaireExcel !== 'undefined') {
                    UtilitaireExcel.genererInterface(item.id);
                } else if (item.id === 'util_point_orga' && typeof UtilitairePointOrga !== 'undefined') {
                    UtilitairePointOrga.genererInterface(item.id);
                } else if (item.id === 'util_com_orga' && typeof UtilitaireComOrga !== 'undefined') {
                    UtilitaireComOrga.genererInterface(item.id);
                } else if (item.id === 'util_alertes_ecarts' && typeof UtilitaireAlertesEcarts !== 'undefined') {
                    UtilitaireAlertesEcarts.genererInterface(item.id);
                } else if (item.id === 'util_alertes_mails_pros' && typeof UtilitaireAlertesMailsPros !== 'undefined') {
                    UtilitaireAlertesMailsPros.genererInterface(item.id);
                } else if (item.id === 'util_alertes_retraites' && typeof UtilitaireAlertesRetraites !== 'undefined') {
                    UtilitaireAlertesRetraites.genererInterface(item.id);
                } else if (item.id === 'faq' && typeof UtilitaireFaq !== 'undefined') {
                    UtilitaireFaq.genererInterface(item.id);
                } else if (item.id === 'infos' && typeof UtilitaireInfos !== 'undefined') {
                    UtilitaireInfos.genererInterface(item.id);
                }
            }
        });

        menuContainer.appendChild(btn);
    });
}

async function verifierMiseAJour() {
    if (typeof CONFIG_INFOS === 'undefined' || !CONFIG_INFOS.repo_github) return;
    const urlApi = `https://api.github.com/repos/${CONFIG_INFOS.repo_github}/releases/latest`;
    const versionBadge = document.getElementById('version-display');

    if (!versionBadge) return;

    try {
        const response = await fetch(urlApi);
        const data = await response.json();

        if (data.tag_name && data.tag_name > CONFIG_INFOS.version_actuelle) {
            versionBadge.innerHTML = `<a href="${data.zipball_url}" class="lien-maj">v${CONFIG_INFOS.version_actuelle}, TÉLÉCHARGER LA MISE À JOUR DISPONIBLE VERS V${data.tag_name}</a>`;
            versionBadge.classList.add('maj-dispo');
            versionBadge.classList.remove('hors-ligne');
        } else {
            versionBadge.innerText = `v${CONFIG_INFOS.version_actuelle}`;
            versionBadge.classList.remove('maj-dispo', 'hors-ligne');
        }
    } catch (err) {
        versionBadge.innerText = `v${CONFIG_INFOS.version_actuelle} - HORS LIGNE`;
        versionBadge.classList.add('hors-ligne');
        versionBadge.classList.remove('maj-dispo');
    }
}