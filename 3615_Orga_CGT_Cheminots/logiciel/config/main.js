document.addEventListener("DOMContentLoaded", () => {
    initInfos();
    genererMenu();
    verifierMiseAJour();
});

function initInfos() {
    if (typeof CONFIG_INFOS === 'undefined') return;
    
    const verEl = document.getElementById('version-display');
    const contactEl = document.getElementById('contact-email');
    if (verEl) verEl.innerText = CONFIG_INFOS.version_actuelle;
    if (contactEl) contactEl.innerText = CONFIG_INFOS.contact_email;

    const listeHist = document.getElementById('liste-historique');
    if (listeHist) {
        listeHist.innerHTML = '';
        CONFIG_INFOS.historique_versions.forEach(texte => {
            const li = document.createElement('li');
            li.innerText = texte;
            listeHist.appendChild(li);
        });
    }

    const listeMajs = document.getElementById('liste-majs');
    if (listeMajs) {
        listeMajs.innerHTML = '';
        CONFIG_INFOS.mises_a_jour_a_venir.forEach(texte => {
            const li = document.createElement('li');
            li.innerText = texte;
            listeMajs.appendChild(li);
        });
    }
}

function genererMenu() {
    const menuContainer = document.getElementById('menu-lateral');
    if (!menuContainer) return;

    menuContainer.innerHTML = '';

    CONFIG_MENU.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'bouton-menu';
        if (item.id === 'accueil') btn.classList.add('actif');
        btn.innerText = item.nom;

        if (item.id === 'util_point_orga') {
            btn.classList.add('disabled');
            btn.disabled = true;
        }
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bouton-menu').forEach(b => b.classList.remove('actif'));
            btn.classList.add('actif');
            
            document.querySelectorAll('.vue-section').forEach(section => section.style.display = 'none');
            
            const sectionCible = document.getElementById(item.id);
            if (sectionCible) {
                sectionCible.style.display = item.id === 'accueil' ? 'flex' : 'block';
                
                if (item.id === 'util_excel') UtilitaireExcel.genererInterface(item.id);
                else if (item.id === 'util_alertes_ecarts') UtilitaireAlertesEcarts.genererInterface(item.id);
                else if (item.id === 'util_alertes_mails_pros') UtilitaireAlertesMailsPros.genererInterface(item.id);
                else if (item.id === 'util_alertes_retraites') UtilitaireAlertesRetraites.genererInterface(item.id);
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
            versionBadge.innerHTML =
            `<a href="${data.zipball_url}" style="color:var(--jaune-cgt); text-decoration:none;">
            v${CONFIG_INFOS.version_actuelle}, TELECHARGER LA MISE A JOUR DISPONIBLE VERS V${data.tag_name}</a>`;
            versionBadge.style.backgroundColor = 'var(--rouge-cgt)';
            versionBadge.style.border = '1px solid var(--jaune-cgt)';
            versionBadge.style.cursor = 'pointer';
        } else {
            versionBadge.innerText = `v${CONFIG_INFOS.version_actuelle}`;
            versionBadge.style.backgroundColor = 'var(--noir)';
            versionBadge.style.color = 'var(--jaune-cgt)';
        }
    } catch (err) {
        versionBadge.innerText = `v${CONFIG_INFOS.version_actuelle} - HORS LIGNE`;
        versionBadge.style.backgroundColor = 'var(--noir)';
        versionBadge.style.color = '#777';
        console.error("Mise à jour automatique indisponible :", err);
    }
}
