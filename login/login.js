function showForm(formId) {
    document.getElementById('loginForm').style.display = formId === 'loginForm' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = formId === 'registerForm' ? 'block' : 'none';
}
window.showForm = showForm;

// Remplace ces valeurs par celles de ton projet Supabase :
const supabaseUrl = 'https://vqsubaffcgtsjnjengub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxc3ViYWZmY2d0c2puamVuZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzExNjAsImV4cCI6MjA2NzQwNzE2MH0.NtfjUeRmn6fzwFVmC8vhMOSXECqMbTK_YUnDgdOsuYc';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
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

// Au chargement, si localStorage contient les infos, on restaure la session
const savedPseudo = localStorage.getItem('remember_pseudo');
const savedRole = localStorage.getItem('remember_role');
if (savedPseudo && savedRole) {
    sessionStorage.setItem('pseudo_minecraft', savedPseudo);
    sessionStorage.setItem('user_role', savedRole);
    window.location.href = 'menu.html';
}

document.addEventListener('DOMContentLoaded', function() {
    // Connexion
    const loginForm = document.querySelector('#loginForm form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const identifiant = this.querySelector('input[type="text"]').value;
            const motDePasse = this.querySelector('input[type="password"]').value;
            const rememberMe = this.querySelector('#rememberMe').checked;

            // Recherche par pseudo Minecraft OU email
            const { data, error } = await supabase
                .from('utilisateurs')
                .select('*')
                .or(`pseudo_minecraft.eq.${identifiant},email.eq.${identifiant}`)
                .single();

            if (error || !data) {
                showCustomAlert('Utilisateur non trouvé', 'error');
                return;
            }

            // ATTENTION : Pour la sécurité, il faut comparer un hash côté backend !
            if (data.mot_de_passe !== motDePasse) {
                showCustomAlert('Mot de passe incorrect', 'error');
                return;
            }

            showCustomAlert('Connexion réussie !', 'success');
            sessionStorage.setItem('pseudo_minecraft', data.pseudo_minecraft);
            sessionStorage.setItem('user_role', (data.role || 'user').toLowerCase());
            if (rememberMe) {
                localStorage.setItem('remember_pseudo', data.pseudo_minecraft);
                localStorage.setItem('remember_role', (data.role || 'user').toLowerCase());
            } else {
                localStorage.removeItem('remember_pseudo');
                localStorage.removeItem('remember_role');
            }
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        });
    }

    // Inscription
    const registerForm = document.querySelector('#registerForm form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const pseudo = this.querySelector('input[placeholder="Pseudo Minecraft"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const motDePasse = this.querySelector('input[type="password"]').value;

            // Vérifier si l'utilisateur existe déjà
            const { data: exist, error: existError } = await supabase
                .from('utilisateurs')
                .select('id')
                .or(`pseudo_minecraft.eq.${pseudo},email.eq.${email}`)
                .maybeSingle();
            if (exist) {
                showCustomAlert('Un utilisateur avec ce pseudo ou cet email existe déjà.', 'error');
                return;
            }

            // Créer l'utilisateur
            const { error } = await supabase
                .from('utilisateurs')
                .insert([
                    {
                        pseudo_minecraft: pseudo,
                        email: email,
                        mot_de_passe: motDePasse // Pour la sécurité, il faut hasher côté backend !
                    }
                ]);
            if (error) {
                showCustomAlert('Erreur lors de l\'inscription : ' + error.message, 'error');
                return;
            }
            showCustomAlert('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
            // Optionnel : basculer vers le formulaire de connexion
            if (typeof showForm === 'function') showForm('loginForm');
        });
    }
}); 