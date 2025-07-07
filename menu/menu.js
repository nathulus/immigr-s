// JS pour le menu principal (peut être complété plus tard) 

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = 'https://vqsubaffcgtsjnjengub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxc3ViYWZmY2d0c2puamVuZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzExNjAsImV4cCI6MjA2NzQwNzE2MH0.NtfjUeRmn6fzwFVmC8vhMOSXECqMbTK_YUnDgdOsuYc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour créer des alertes personnalisées
function showCustomAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('hide');
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 1500);
}

// Fonction pour initialiser l'affichage du pseudo
function initializeUserDisplay() {
    const pseudo = sessionStorage.getItem('pseudo_minecraft');
    const userRole = sessionStorage.getItem('user_role') || 'user';

    if (!pseudo) {
        window.location.href = 'index.html';
        return;
    }

    // Affichage du pseudo utilisateur
    const userPseudoElement = document.getElementById('user-pseudo');
    if (userPseudoElement) {
        userPseudoElement.innerHTML = `<i class="fas fa-user"></i> ${pseudo}`;
    } else {
        console.error('Élément user-pseudo non trouvé');
    }

    // Afficher le bouton gestion seulement pour les admins
    const gestionBtn = document.getElementById('gestion-btn');
    if (gestionBtn) {
        if (userRole === 'admin') {
            gestionBtn.style.display = 'inline-flex';
        } else {
            gestionBtn.style.display = 'none';
        }
    }
}

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUserDisplay);
} else {
    initializeUserDisplay();
}

// Affichage et édition du profil utilisateur au centre de la page (corrigé)
async function showProfileEditInMain() {
    const mainCenter = document.querySelector('.main-center');
    if (!mainCenter) return;
    const pseudo = sessionStorage.getItem('pseudo_minecraft');
    if (!pseudo) return;
    // Charger les infos depuis la base
    const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('pseudo_minecraft', pseudo)
        .single();
    if (error || !data) {
        showCustomAlert('Impossible de charger le profil', 'error');
        return;
    }
    // Sauvegarder l'ancien contenu pour pouvoir revenir
    const oldContent = mainCenter.innerHTML;
    // Afficher le formulaire au centre, stylé et éditable
    mainCenter.innerHTML = `
        <div class="profile-form-container">
            <h1 class="minecraft-font"><i class="fas fa-user-cog"></i> Mon profil</h1>
            <form id='profile-edit-form' class='profile-form'>
                <label for='edit-pseudo'>Pseudo</label>
                <div class='input-group'>
                    <i class='fas fa-user input-icon'></i>
                    <input type='text' id='edit-pseudo' value='${data.pseudo_minecraft}' required autocomplete='username'>
                </div>
                <label for='edit-email'>Email</label>
                <div class='input-group'>
                    <i class='fas fa-envelope input-icon'></i>
                    <input type='email' id='edit-email' value='${data.email || ''}' required autocomplete='email'>
                </div>
                <label for='edit-password'>Mot de passe</label>
                <div class='input-group'>
                    <i class='fas fa-lock input-icon'></i>
                    <input type='password' id='edit-password' value='${data.mot_de_passe || ''}' required autocomplete='new-password'>
                </div>
                <button type='submit' class='action-btn confirm-btn'><i class='fas fa-save'></i> Enregistrer</button>
                <button type='button' class='action-btn cancel-btn' id='cancel-profile-edit'><i class='fas fa-arrow-left'></i> Retour</button>
            </form>
        </div>
    `;
    // Focus automatique sur le pseudo
    setTimeout(() => { document.getElementById('edit-pseudo').focus(); }, 100);
    // Gestion du submit
    document.getElementById('profile-edit-form').onsubmit = async function(e) {
        e.preventDefault();
        const newPseudo = document.getElementById('edit-pseudo').value.trim();
        const newEmail = document.getElementById('edit-email').value.trim();
        const newPassword = document.getElementById('edit-password').value;
        if (!newPseudo || !newEmail || !newPassword) {
            showCustomAlert('Tous les champs sont obligatoires', 'error');
            return;
        }
        const { error: updateError } = await supabase
            .from('utilisateurs')
            .update({ pseudo_minecraft: newPseudo, email: newEmail, mot_de_passe: newPassword })
            .eq('id', data.id);
        if (updateError) {
            showCustomAlert('Erreur lors de la mise à jour', 'error');
            return;
        }
        sessionStorage.setItem('pseudo_minecraft', newPseudo);
        showCustomAlert('Profil mis à jour !', 'success');
        initializeUserDisplay();
        // Retour à l'affichage normal
        mainCenter.innerHTML = oldContent;
        chargerTickets();
    };
    // Bouton retour
    document.getElementById('cancel-profile-edit').onclick = function() {
        mainCenter.innerHTML = oldContent;
        chargerTickets();
    };
}

// Remplacement du pop-up profil par une vraie modale moderne
function openUserProfileModal() {
    // Si déjà ouvert, ne rien faire
    if (document.querySelector('.user-popup-modal')) return;
    const pseudo = sessionStorage.getItem('pseudo_minecraft') || '';
    const userRole = sessionStorage.getItem('user_role') || 'user';
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'user-popup-modal';
    // Contenu
    const content = document.createElement('div');
    content.className = 'user-popup-content';
    content.innerHTML = `
        <h3><i class='fas fa-user'></i> ${pseudo}</h3>
        <div class='user-popup-btns'>
            <button id='modal-profil-link' class='action-btn'><i class='fas fa-user-cog'></i> Profil</button>
            <button id='modal-logout-link' class='action-btn'><i class='fas fa-sign-out-alt'></i> Déconnexion</button>
            ${userRole === 'admin' ? "<button id='modal-gestion-link' class='action-btn'><i class='fas fa-cog'></i> Gestion</button>" : ''}
        </div>
        <button class='action-btn' id='close-user-popup' style='margin-top:18px;'><i class='fas fa-times'></i> Fermer</button>
    `;
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    // Fermeture croix ou clic dehors
    document.getElementById('close-user-popup').onclick = () => document.body.removeChild(overlay);
    overlay.addEventListener('mousedown', function(e) {
        if (e.target === overlay) document.body.removeChild(overlay);
    });
    // Fermeture Échap
    overlay.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') document.body.removeChild(overlay);
    });
    overlay.tabIndex = -1;
    overlay.focus();
    // Actions boutons
    document.getElementById('modal-profil-link').onclick = function(e) {
        e.preventDefault();
        document.body.removeChild(document.querySelector('.user-popup-modal'));
        showProfileEditInMain();
    };
    document.getElementById('modal-logout-link').onclick = function(e) {
        e.preventDefault();
        sessionStorage.clear();
        localStorage.removeItem('remember_pseudo');
        localStorage.removeItem('remember_role');
        showCustomAlert('Déconnexion réussie !', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    };
    if (userRole === 'admin') {
        document.getElementById('modal-gestion-link').onclick = function(e) {
            e.preventDefault();
            window.location.href = 'gestion.html';
        };
    }
}
// Ouvre la modale au clic sur le pseudo
const userPseudo = document.getElementById('user-pseudo');
userPseudo.addEventListener('click', function(e) {
    e.stopPropagation();
    openUserProfileModal();
});

// Gestion des boutons
const ticketBtn = document.getElementById('ticket-btn');
const boutiqueBtn = document.getElementById('boutique-btn');
const gestionBtn = document.getElementById('gestion-btn');
const mainCenter = document.querySelector('.main-center');
let showingForm = false;
let showingBoutique = false;
let showingGestion = false;

// Fonction pour récupérer le pseudo (à utiliser dans les fonctions)
function getCurrentPseudo() {
    return sessionStorage.getItem('pseudo_minecraft');
}

ticketBtn.addEventListener('click', function() {
    if (showingBoutique || showingGestion) {
        // Si on est dans la boutique ou gestion, retourner aux tickets
        showTicketsView();
        boutiqueBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Boutique';
        gestionBtn.innerHTML = '<i class="fas fa-cog"></i> Gestion';
        showingBoutique = false;
        showingGestion = false;
    } else if (showingForm) {
        // Retour à l'affichage des tickets
        showTicketsView();
        ticketBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Tickets';
    } else {
        // Afficher le formulaire de création
        showTicketForm();
        ticketBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Retour';
    }
    showingForm = !showingForm;
});

boutiqueBtn.addEventListener('click', function() {
    if (showingForm || showingGestion) {
        // Si on est dans le formulaire ou gestion, retourner aux tickets
        showTicketsView();
        ticketBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Tickets';
        gestionBtn.innerHTML = '<i class="fas fa-cog"></i> Gestion';
        showingForm = false;
        showingGestion = false;
    } else if (showingBoutique) {
        // Retour à l'affichage des tickets
        showTicketsView();
        boutiqueBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Boutique';
    } else {
        // Afficher la boutique
        showBoutique();
        boutiqueBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Retour';
    }
    showingBoutique = !showingBoutique;
});

gestionBtn.addEventListener('click', function() {
    const userRole = sessionStorage.getItem('user_role') || 'user';
    if (userRole !== 'admin') {
        showCustomAlert('Accès réservé aux administrateurs.', 'error');
        return;
    }
    if (showingForm || showingBoutique) {
        showTicketsView();
        ticketBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Tickets';
        boutiqueBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Boutique';
        showingForm = false;
        showingBoutique = false;
    } else if (showingGestion) {
        showTicketsView();
        gestionBtn.innerHTML = '<i class="fas fa-cog"></i> Gestion';
    } else {
        window.location.href = 'gestion.html';
    }
    showingGestion = !showingGestion;
});

function showTicketForm() {
    mainCenter.innerHTML = `
        <div class="ticket-form">
            <h3><i class="fas fa-plus-circle"></i> Créer un ticket</h3>
            <form id="new-ticket-form">
                <label for="objet"><i class="fas fa-tag"></i> Objet :</label>
                <input type="text" id="objet" name="objet" required>
                
                <label for="msg"><i class="fas fa-comment"></i> Message :</label>
                <textarea id="msg" name="msg" required></textarea>
                
                <button type="submit"><i class="fas fa-paper-plane"></i> Créer le ticket</button>
            </form>
        </div>
    `;
    
    // Gestion du formulaire
    document.getElementById('new-ticket-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const objet = document.getElementById('objet').value;
        const msg = document.getElementById('msg').value;
        
        const currentPseudo = getCurrentPseudo();
        if (!currentPseudo) {
            showCustomAlert('Erreur : Pseudo non trouvé', 'error');
            return;
        }
        
        const { error } = await supabase
            .from('ticket')
            .insert([{
                "user": currentPseudo,
                objet: objet,
                msg: msg,
                statue: 'En cours de traitement'
            }]);
            
        if (error) {
            showCustomAlert('Erreur lors de la création du ticket : ' + error.message, 'error');
            return;
        }
        
        showCustomAlert('Ticket créé avec succès !', 'success');
        showTicketsView();
        chargerTickets();
        ticketBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Tickets';
        showingForm = false;
    });
}

function showTicketsView() {
    mainCenter.innerHTML = `
        <h1 class="main-title minecraft-font">LES IMMIGRÉS</h1>
        <div class="main-frame">
            <div class="sub-frame">
                <span class="sub-label"><i class="fas fa-server"></i> IP du serveur :</span>
                <span class="sub-value">Immigrs.aternos.me</span>
            </div>
            <div class="sub-frame">
                <span class="sub-label"><i class="fas fa-code-branch"></i> Version :</span>
                <span class="sub-value">+1.8.8</span>
            </div>
        </div>
        <h2 class="subtitle"><i class="fas fa-ticket-alt"></i> Mes tickets</h2>
        <div class="tickets-container" id="tickets-container">
            <!-- Les tuiles de tickets seront insérées ici dynamiquement -->
        </div>
    `;
    chargerTickets();
}

function showBoutique() {
    mainCenter.innerHTML = `
        <h1 class="main-title minecraft-font">BOUTIQUE VIP</h1>
        <div class="boutique-container">
            <div class="vip-card vip-basic">
                <div class="vip-header">
                    <i class="fas fa-crown"></i>
                    <h3>VIP</h3>
                </div>
                <div class="vip-features">
                    <div class="vip-feature">
                        <i class="fas fa-check"></i>
                        <span>/fly</span>
                    </div>
                </div>
                <button class="vip-btn" onclick="acheterVIP('VIP')">
                    <i class="fas fa-shopping-cart"></i> Acheter
                </button>
            </div>
            
            <div class="vip-card vip-plus">
                <div class="vip-header">
                    <i class="fas fa-crown"></i>
                    <h3>VIP+</h3>
                </div>
                <div class="vip-features">
                    <div class="vip-feature">
                        <i class="fas fa-check"></i>
                        <span>/fly</span>
                    </div>
                    <div class="vip-feature">
                        <i class="fas fa-check"></i>
                        <span>/trade</span>
                    </div>
                </div>
                <button class="vip-btn" onclick="acheterVIP('VIP+')">
                    <i class="fas fa-shopping-cart"></i> Acheter
                </button>
            </div>
            
            <div class="vip-card vip-premium">
                <div class="vip-header">
                    <i class="fas fa-crown"></i>
                    <h3>VIP++</h3>
                </div>
                <div class="vip-features">
                    <div class="vip-feature">
                        <i class="fas fa-check"></i>
                        <span>/fly</span>
                    </div>
                    <div class="vip-feature">
                        <i class="fas fa-check"></i>
                        <span>/trade</span>
                    </div>
                    <div class="vip-feature">
                        <i class="fas fa-check"></i>
                        <span>/craft</span>
                    </div>
                </div>
                <button class="vip-btn" onclick="acheterVIP('VIP++')">
                    <i class="fas fa-shopping-cart"></i> Acheter
                </button>
            </div>
        </div>
    `;
}

// Fonction utilitaire pour confirmation stylisée (même style que gestion)
function showConfirmDialog(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'custom-confirm-box';
    dialog.innerHTML = `
        <div class="custom-confirm-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>
        <div class="custom-confirm-btns">
            <button class="action-btn confirm-btn">Valider</button>
            <button class="action-btn cancel-btn">Annuler</button>
        </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    dialog.querySelector('.confirm-btn').focus();
    dialog.querySelector('.confirm-btn').onclick = () => {
        document.body.removeChild(overlay);
        onConfirm();
    };
    dialog.querySelector('.cancel-btn').onclick = () => {
        document.body.removeChild(overlay);
    };
    overlay.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') document.body.removeChild(overlay);
    });
    overlay.tabIndex = -1;
    overlay.focus();
}

// Affichage des tickets de l'utilisateur
async function chargerTickets() {
    const container = document.getElementById('tickets-container');
    if (!container) return;
    
    const currentPseudo = getCurrentPseudo();
    if (!currentPseudo) return;
    
    container.innerHTML = '<span style="color:#ffe066;"><i class="fas fa-spinner fa-spin"></i> Chargement...</span>';
    const { data, error } = await supabase
        .from('ticket')
        .select('*')
        .eq('user', currentPseudo)
        .order('id', { ascending: false });
    if (error) {
        showCustomAlert('Erreur lors du chargement des tickets.', 'error');
        container.innerHTML = '<span style="color:#ff9800;"><i class="fas fa-exclamation-triangle"></i> Erreur lors du chargement des tickets.</span>';
        return;
    }
    if (!data || data.length === 0) {
        container.innerHTML = '<span style="color:#ffe066;"><i class="fas fa-inbox"></i> Aucun ticket pour le moment.</span>';
        return;
    }
    container.innerHTML = '';
    data.forEach(ticket => {
        const tile = document.createElement('div');
        tile.className = 'ticket-tile';
        tile.innerHTML = `
            <div class="ticket-title"><i class="fas fa-ticket-alt"></i> ${ticket.objet}</div>
            <div class="ticket-msg">${ticket.msg}</div>
            <div class="ticket-status">${renderTicketStatus(ticket.statue)}</div>
            <div class="ticket-tile-actions" style="display:flex;justify-content:flex-end;margin-top:10px;">
                <button class="ticket-delete-btn" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        // Supprimer le ticket au clic sur la poubelle
        tile.querySelector('.ticket-delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            showConfirmDialog('Supprimer ce ticket ?', async () => {
                const { error } = await supabase
                    .from('ticket')
                    .delete()
                    .eq('id', ticket.id);
                if (error) {
                    showCustomAlert('Erreur lors de la suppression du ticket.', 'error');
                    return;
                }
                showCustomAlert('Ticket supprimé !', 'success');
                chargerTickets();
            });
        });
        // Ajouter l'événement de clic pour ouvrir la modal
        tile.addEventListener('click', () => openTicketModal(ticket));
        container.appendChild(tile);
    });
}

function renderTicketStatus(statue) {
    if (statue === 'Résolu' || statue === 'Accepté') {
        return '<span class="ticket-status-menu resolved">Accepté</span>';
    } else if (statue === 'Refusé') {
        return '<span class="ticket-status-menu refused">Refusé</span>';
    } else {
        return '<span class="ticket-status-menu pending">En cours</span>';
    }
}

// Fonction pour ouvrir la modal de ticket
function openTicketModal(ticket) {
    // Créer la modal si elle n'existe pas
    let modal = document.getElementById('ticket-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticket-modal';
        modal.className = 'ticket-modal';
        modal.innerHTML = `
            <div class="ticket-modal-content">
                <button class="ticket-modal-close" onclick="closeTicketModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="ticket-modal-title"></div>
                <div class="ticket-modal-message"></div>
                <div class="ticket-modal-info">
                    <div class="ticket-modal-status"></div>
                    <div class="ticket-modal-date"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Fermer la modal en cliquant sur l'overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeTicketModal();
            }
        });
    }
    
    // Remplir le contenu de la modal
    modal.querySelector('.ticket-modal-title').textContent = ticket.objet;
    modal.querySelector('.ticket-modal-message').textContent = ticket.msg;
    modal.querySelector('.ticket-modal-status').innerHTML = renderTicketStatus(ticket.statue);
    
    // Formater la date
    const date = new Date(ticket.date_creation || Date.now());
    const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    modal.querySelector('.ticket-modal-date').textContent = `Créé le ${formattedDate}`;
    
    // Afficher la modal avec animation
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêcher le scroll
}

// Fonction pour fermer la modal
function closeTicketModal() {
    const modal = document.getElementById('ticket-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Réactiver le scroll
    }
}

// Fonction pour acheter un VIP
function acheterVIP(type) {
    showCustomAlert(`Fonctionnalité d'achat ${type} à venir !`, 'warning');
}

// Rendre les fonctions accessibles globalement
window.closeTicketModal = closeTicketModal;
window.acheterVIP = acheterVIP;

chargerTickets();

document.addEventListener('DOMContentLoaded', function() {
    initializeUserDisplay();
    // Affichage du lien Gestion dans le pop-up du profil si admin
    const userRole = sessionStorage.getItem('user_role') || 'membre';
    const gestionLink = document.getElementById('gestion-link');
    if (gestionLink) {
        if (userRole === 'admin') {
            gestionLink.style.display = 'block';
            gestionLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'gestion.html';
            });
        } else {
            gestionLink.style.display = 'none';
        }
    }
    const ipElem = document.getElementById('server-ip');
    if (ipElem) {
        ipElem.addEventListener('click', function() {
            navigator.clipboard.writeText(ipElem.textContent.trim());
            showCustomAlert('IP copiée dans le presse-papier !', 'success');
        });
    }
}); 