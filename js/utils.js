/**
 * Fonctions utilitaires partagées
 * Contient les helpers et fonctions réutilisables
 */

import { sections, toast } from './elements.js';

// ============================================================================
// NAVIGATION & UI
// ============================================================================

/**
 * Scroll vers le haut de la page
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Affiche une section et cache les autres
 * @param {string} name - Nom de la section à afficher
 */
export function showSection(name) {
  // Obtenir toutes les sections
  const sectionIds = ['landing', 'createAgent', 'mainPage', 'competencesView'];
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) section.classList.remove('active-page');
  });
  
  const targetSection = document.getElementById(name);
  if (targetSection) targetSection.classList.add('active-page');
  
  scrollToTop();

  // Cacher les boutons de navigation si on n'est pas sur la page principale
  if (name !== 'mainPage') {
    const logoutBtn = document.getElementById('logoutBtn');
    const homeBtn = document.getElementById('homeBtn');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (homeBtn) homeBtn.classList.add('hidden');
  }
}

/**
 * Affiche un toast notification
 * @param {string} message - Message à afficher
 * @param {number} [duration=2400] - Durée en ms
 */
export function showToast(message, duration = 2400) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  
  toastEl.textContent = message;
  toastEl.classList.add('show');
  
  // Clear existing timeout
  if (showToast.timeout) {
    window.clearTimeout(showToast.timeout);
  }
  
  showToast.timeout = window.setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

// ============================================================================
// SANITIZATION & TEXT
// ============================================================================

/**
 * Sanitize text to prevent XSS
 * @param {string} text - Texte à sanitizer
 * @returns {string} Texte sécurisé
 */
export function sanitizeText(text) {
  return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Normalize string for use as object key
 * @param {string} name - Nom à normaliser
 * @returns {string} Nom normalisé
 */
export function normalizeKey(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/é/gi, 'e')
    .replace(/è/gi, 'e')
    .replace(/ê/gi, 'e');
}

// ============================================================================
// MODALS
// ============================================================================

/**
 * Affiche une modale
 * @param {HTMLElement} modal - Élément modal à afficher
 */
export function showModal(modal) {
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Cache une modale
 * @param {HTMLElement} modal - Élément modal à cacher
 */
export function hideModal(modal) {
  if (modal) {
    modal.classList.remove('active');
  }
}

// ============================================================================
// ICONS & EFFETS
// ============================================================================

import { EFFECT_ICONS } from './config.js';

/**
 * Récupère l'icône pour un effet donné
 * @param {string} effect - Nom de l'effet
 * @returns {string} Icône correspondante
 */
export function getEffectIcon(effect) {
  if (!effect) return '⚠️';
  return EFFECT_ICONS[effect.toLowerCase()] || '⚠️';
}

// ============================================================================
// ARRAY & OBJECT UTILITIES
// ============================================================================

/**
 * Deep merge two objects
 * @param {Object} target - Objet cible
 * @param {Object} source - Objet source
 * @returns {Object} Objet mergé
 */
export function deepMerge(target, source) {
  if (!target || !source) return target || source;
  
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

/**
 * Deep clone an object
 * @param {*} obj - Objet à cloner
 * @returns {*} Clone profond
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Vérifie si une valeur est un nombre valide
 * @param {*} value - Valeur à vérifier
 * @returns {boolean}
 */
export function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Vérifie si une valeur est une chaîne non vide
 * @param {*} value - Valeur à vérifier
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// ============================================================================
// FORMATTAGE
// ============================================================================

/**
 * Formate un nombre avec un nombre de décimales
 * @param {number} value - Nombre à formater
 * @param {number} [decimals=2] - Nombre de décimales
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
  if (!isValidNumber(value)) return '0';
  return Number(value).toFixed(decimals);
}

/**
 * Formate un poids en kg
 * @param {number} weight - Poids à formater
 * @returns {string}
 */
export function formatWeight(weight) {
  if (!isValidNumber(weight)) return '—';
  return `${formatNumber(weight, 1)} kg`;
}
