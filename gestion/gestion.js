// JS pour la gestion du site (peut être complété plus tard) 

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

// Vérification de l'accès
const pseudo = sessionStorage.getItem('pseudo_minecraft');
const userRole = sessionStorage.getItem('user_role') || 'user';

if (!pseudo) {
    window.location.href = 'index.html';
}

if (userRole !== 'admin') {
    window.location.href = 'menu.html';
}

// Affichage du pseudo utilisateur
document.getElementById('user-pseudo').textContent = pseudo;

// Gestion du popup utilisateur
const userPseudo = document.getElementById('user-pseudo');
const userPopup = document.getElementById('user-popup');

userPseudo.addEventListener('click', function(e) {
    e.stopPropagation();
    userPopup.style.display = userPopup.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', function() {
    userPopup.style.display = 'none';
});

// Déconnexion
document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.clear();
    showCustomAlert('Déconnexion réussie !', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// Retour au menu
document.getElementById('retour-btn').addEventListener('click', function() {
    window.location.href = 'menu.html';
});

// Chargement des tickets
async function chargerTicketsAdmin() {
    const container = document.getElementById('tickets-list');
    if (!container) return;
    
    container.innerHTML = '<span style="color:#ffe066;"><i class="fas fa-spinner fa-spin"></i> Chargement...</span>';
    
    const { data, error } = await supabase
        .from('ticket')
        .select('*')
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
        const ticketElement = document.createElement('div');
        ticketElement.className = 'ticket-admin-item';
        ticketElement.innerHTML = `
            <div class="ticket-info">
                <div class="ticket-header">
                    <span class="ticket-user"><i class="fas fa-user"></i> ${ticket.user}</span>
                    <span class="ticket-date">${new Date(ticket.date_creation || Date.now()).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="ticket-title">${ticket.objet}</div>
                <div class="ticket-message">${ticket.msg}</div>
                <div class="ticket-status ${ticket.statue === 'Résolu' ? 'resolved' : ticket.statue === 'Refusé' ? 'refused' : 'pending'}">
                    <i class="fas fa-clock"></i> ${ticket.statue}
                </div>
            </div>
            <div class="ticket-actions">
                <button class="action-btn resolve-btn" onclick="resoudreTicket(${ticket.id})" ${ticket.statue === 'Résolu' ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> Résoudre
                </button>
                <button class="action-btn refuse-btn" onclick="refuserTicket(${ticket.id})" ${ticket.statue === 'Résolu' || ticket.statue === 'Refusé' ? 'disabled' : ''}>
                    <i class="fas fa-times"></i> Refuser
                </button>
                <button class="action-btn delete-btn" onclick="supprimerTicket(${ticket.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(ticketElement);
    });
}

// Chargement des utilisateurs
async function chargerUtilisateurs() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    container.innerHTML = '<span style="color:#ffe066;"><i class="fas fa-spinner fa-spin"></i> Chargement...</span>';
    
    const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .order('date_inscription', { ascending: false });
        
    if (error) {
        showCustomAlert('Erreur lors du chargement des utilisateurs.', 'error');
        container.innerHTML = '<span style="color:#ff9800;"><i class="fas fa-exclamation-triangle"></i> Erreur lors du chargement des utilisateurs.</span>';
        return;
    }
    
    if (!data || data.length === 0) {
        container.innerHTML = '<span style="color:#ffe066;"><i class="fas fa-users"></i> Aucun utilisateur pour le moment.</span>';
        return;
    }
    
    container.innerHTML = '';
    data.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-admin-item';
        userElement.innerHTML = `
            <div class="user-info">
                <div class="user-header">
                    <span class="user-pseudo"><i class="fas fa-user"></i> ${user.pseudo_minecraft}</span>
                    <span class="user-role ${user.role}">${user.role}</span>
                </div>
                <div class="user-email"><i class="fas fa-envelope"></i> ${user.email}</div>
                <div class="user-date">Inscrit le ${new Date(user.date_inscription).toLocaleDateString('fr-FR')}</div>
            </div>
            <div class="user-actions">
                <button class="action-btn role-btn" onclick="changerRole('${user.id}', '${user.role}')">
                    <i class="fas fa-user-cog"></i> Changer rôle
                </button>
                <button class="action-btn delete-btn" onclick="supprimerUtilisateur('${user.id}')" ${user.role === 'admin' ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(userElement);
    });
}

// Fonctions d'action pour les tickets
window.resoudreTicket = async function(ticketId) {
    const { error } = await supabase
        .from('ticket')
        .update({ statue: 'Résolu' })
        .eq('id', ticketId);
        
    if (error) {
        showCustomAlert('Erreur lors de la résolution du ticket.', 'error');
        return;
    }
    
    showCustomAlert('Ticket résolu avec succès !', 'success');
    chargerTicketsAdmin();
};

window.refuserTicket = async function(ticketId) {
    const { error } = await supabase
        .from('ticket')
        .update({ statue: 'Refusé' })
        .eq('id', ticketId);
    if (error) {
        showCustomAlert('Erreur lors du refus du ticket.', 'error');
        return;
    }
    showCustomAlert('Ticket refusé avec succès !', 'success');
    chargerTicketsAdmin();
};

// Fonctions d'action pour les utilisateurs
window.changerRole = async function(userId, currentRole) {
    const roles = ['admin', 'vip++', 'vip+', 'vip', 'membre'];
    const select = document.createElement('select');
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        if (role === currentRole) option.selected = true;
        select.appendChild(option);
    });
    // Structure du popup
    const popup = document.createElement('div');
    popup.className = 'user-popup-modal';
    popup.innerHTML = `
        <div class="user-popup-content">
            <h3>Gestion de l'utilisateur</h3>
            <label>Rôle :</label>
        </div>
    `;
    popup.querySelector('.user-popup-content').appendChild(select);
    // Boutons
    const btns = document.createElement('div');
    btns.className = 'user-popup-btns';
    const validerBtn = document.createElement('button');
    validerBtn.textContent = 'Valider';
    validerBtn.className = 'action-btn role-btn';
    btns.appendChild(validerBtn);
    // Bouton supprimer toujours visible
    const supprBtn = document.createElement('button');
    supprBtn.textContent = 'Supprimer';
    supprBtn.className = 'action-btn delete-btn';
    btns.appendChild(supprBtn);
    supprBtn.onclick = async function() {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        const { error } = await supabase
            .from('utilisateurs')
            .delete()
            .eq('id', userId);
        document.body.removeChild(popup);
        if (error) {
            showCustomAlert('Erreur lors de la suppression.', 'error');
            return;
        }
        showCustomAlert('Utilisateur supprimé !', 'success');
        chargerUtilisateurs();
    };
    const fermerBtn = document.createElement('button');
    fermerBtn.textContent = 'Fermer';
    fermerBtn.className = 'action-btn';
    btns.appendChild(fermerBtn);
    popup.querySelector('.user-popup-content').appendChild(btns);
    document.body.appendChild(popup);
    // Valider le changement de rôle
    validerBtn.onclick = async function() {
        const newRole = select.value;
        const { error } = await supabase
            .from('utilisateurs')
            .update({ role: newRole })
            .eq('id', userId);
        document.body.removeChild(popup);
        if (error) {
            showCustomAlert('Erreur lors du changement de rôle.', 'error');
            return;
        }
        showCustomAlert(`Rôle changé vers ${newRole} !`, 'success');
        chargerUtilisateurs();
    };
    // Fermer le popup
    fermerBtn.onclick = function() {
        document.body.removeChild(popup);
    };
    // Fermer si clic en dehors
    setTimeout(() => {
        document.addEventListener('mousedown', function handler(e) {
            if (!popup.contains(e.target)) {
                document.body.removeChild(popup);
                document.removeEventListener('mousedown', handler);
            }
        });
    }, 100);
};

// Fonction utilitaire pour confirmation stylisée
function showConfirmDialog(message, onConfirm) {
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    // Créer la boîte de dialogue
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
    // Focus sur Valider
    dialog.querySelector('.confirm-btn').focus();
    // Actions
    dialog.querySelector('.confirm-btn').onclick = () => {
        document.body.removeChild(overlay);
        onConfirm();
    };
    dialog.querySelector('.cancel-btn').onclick = () => {
        document.body.removeChild(overlay);
    };
    // Fermer avec Échap
    overlay.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') document.body.removeChild(overlay);
    });
    overlay.tabIndex = -1;
    overlay.focus();
}

// Remplace les confirm natifs par showConfirmDialog
window.supprimerUtilisateur = async function(userId) {
    showConfirmDialog('Êtes-vous sûr de vouloir supprimer cet utilisateur ?', async () => {
        const { error } = await supabase
            .from('utilisateurs')
            .delete()
            .eq('id', userId);
        if (error) {
            showCustomAlert('Erreur lors de la suppression de l\'utilisateur.', 'error');
            return;
        }
        showCustomAlert('Utilisateur supprimé avec succès !', 'success');
        chargerUtilisateurs();
    });
};
window.supprimerTicket = async function(ticketId) {
    showConfirmDialog('Êtes-vous sûr de vouloir supprimer ce ticket ?', async () => {
        const { error } = await supabase
            .from('ticket')
            .delete()
            .eq('id', ticketId);
        if (error) {
            showCustomAlert('Erreur lors de la suppression du ticket.', 'error');
            return;
        }
        showCustomAlert('Ticket supprimé avec succès !', 'success');
        chargerTicketsAdmin();
    });
};

// Chargement initial
chargerTicketsAdmin();
chargerUtilisateurs();

document.addEventListener('DOMContentLoaded', function() {
    const btnTickets = document.getElementById('btn-tickets');
    const btnUsers = document.getElementById('btn-users');
    const sectionTickets = document.getElementById('section-tickets');
    const sectionUsers = document.getElementById('section-users');
    if (btnTickets && btnUsers && sectionTickets && sectionUsers) {
        btnTickets.addEventListener('click', function() {
            btnTickets.classList.add('active');
            btnUsers.classList.remove('active');
            sectionTickets.style.display = '';
            sectionUsers.style.display = 'none';
        });
        btnUsers.addEventListener('click', function() {
            btnUsers.classList.add('active');
            btnTickets.classList.remove('active');
            sectionUsers.style.display = '';
            sectionTickets.style.display = 'none';
        });
    }
    // Délégation pour suppression utilisateur
    const usersList = document.getElementById('users-list');
    if (usersList) {
        usersList.addEventListener('click', function(e) {
            const btn = e.target.closest('.delete-btn');
            if (btn && btn.closest('.user-admin-item')) {
                const userId = btn.closest('.user-admin-item').querySelector('.action-btn.role-btn').getAttribute('onclick').match(/changerRole\('([^']+)'/)[1];
                if (userId) window.supprimerUtilisateur(userId);
            }
        });
    }
    // Délégation pour suppression ticket (si besoin)
    const ticketsList = document.getElementById('tickets-list');
    if (ticketsList) {
        ticketsList.addEventListener('click', function(e) {
            const btn = e.target.closest('.delete-btn');
            if (btn && btn.closest('.ticket-admin-item')) {
                const ticketId = btn.closest('.ticket-admin-item').querySelector('.action-btn.resolve-btn').getAttribute('onclick').match(/resoudreTicket\((\d+)\)/)[1];
                if (ticketId) window.supprimerTicket(Number(ticketId));
            }
        });
    }
}); 