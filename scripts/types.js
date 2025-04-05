// Tableau des multiplicateurs de dégâts pour chaque type
const typeChart = {
  normal: {
    fighting: 2,
    ghost: 0
  },
  fire: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    ice: 0.5,
    ground: 2,
    bug: 0.5,
    rock: 2,
    steel: 0.5,
    fairy: 0.5
  },
  water: {
    fire: 0.5,
    water: 0.5,
    electric: 2,
    grass: 2,
    ice: 0.5,
    steel: 0.5
  },
  electric: {
    electric: 0.5,
    ground: 2,
    flying: 0.5,
    steel: 0.5
  },
  grass: {
    fire: 2,
    water: 0.5,
    electric: 0.5,
    grass: 0.5,
    ice: 2,
    poison: 2,
    ground: 0.5,
    flying: 2,
    bug: 2
  },
  ice: {
    fire: 2,
    ice: 0.5,
    fighting: 2,
    rock: 2,
    steel: 2
  },
  fighting: {
    flying: 2,
    psychic: 2,
    bug: 0.5,
    rock: 0.5,
    dark: 0.5,
    fairy: 2
  },
  poison: {
    grass: 0.5,
    fighting: 0.5,
    poison: 0.5,
    ground: 2,
    psychic: 2,
    bug: 0.5,
    fairy: 0.5
  },
  ground: {
    water: 2,
    electric: 0,
    grass: 2,
    ice: 2,
    poison: 0.5,
    rock: 0.5
  },
  flying: {
    electric: 2,
    grass: 0.5,
    ice: 2,
    fighting: 0.5,
    ground: 0,
    bug: 0.5,
    rock: 2
  },
  psychic: {
    fighting: 0.5,
    psychic: 0.5,
    bug: 2,
    ghost: 2,
    dark: 2
  },
  bug: {
    fire: 2,
    grass: 0.5,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    rock: 2
  },
  rock: {
    normal: 0.5,
    fire: 0.5,
    water: 2,
    grass: 2,
    fighting: 2,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    steel: 2
  },
  ghost: {
    normal: 0,
    fighting: 0,
    poison: 0.5,
    bug: 0.5,
    ghost: 2,
    dark: 2
  },
  dragon: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    grass: 0.5,
    ice: 2,
    dragon: 2,
    fairy: 2
  },
  dark: {
    fighting: 2,
    psychic: 0,
    bug: 2,
    ghost: 0.5,
    dark: 0.5,
    fairy: 2
  },
  steel: {
    normal: 0.5,
    fire: 2,
    grass: 0.5,
    ice: 0.5,
    fighting: 2,
    poison: 0,
    ground: 2,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 0.5,
    dragon: 0.5,
    steel: 0.5,
    fairy: 0.5
  },
  fairy: {
    fighting: 0.5,
    poison: 2,
    bug: 0.5,
    dragon: 0,
    dark: 0.5,
    steel: 2
  }
};

// Fonction pour calculer les faiblesses et résistances d'un Pokémon
function calculateTypeEffectiveness(types) {
  const effectiveness = {
    x4: [],    // Double faiblesse
    x2: [],    // Faiblesse simple
    x05: [],   // Résistance simple
    x025: [],  // Double résistance
    x0: []     // Immunité
  };

  const multipliers = {};
  const allTypes = Object.keys(typeChart);

  // Calcul des multiplicateurs comme avant
  types.forEach(type => {
    allTypes.forEach(attackType => {
      if (typeChart[type][attackType] !== undefined) {
        multipliers[attackType] = (multipliers[attackType] || 1) * typeChart[type][attackType];
      }
    });
  });

  // Classement selon les nouveaux multiplicateurs
  Object.entries(multipliers).forEach(([type, multiplier]) => {
    if (multiplier === 4) {
      effectiveness.x4.push(type);
    } else if (multiplier === 2) {
      effectiveness.x2.push(type);
    } else if (multiplier === 0.5) {
      effectiveness.x05.push(type);
    } else if (multiplier === 0.25) {
      effectiveness.x025.push(type);
    } else if (multiplier === 0) {
      effectiveness.x0.push(type);
    }
  });

  return effectiveness;
}

// Fonction pour formater le nom d'un type
function formatTypeName(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Fonction pour créer le contenu de la popup
function createTypePopupContent(types) {
  const effectiveness = calculateTypeEffectiveness(types);
  
  let content = '<div class="type-popup">';
  content += '<button class="popup-close">&times;</button>';
  
  // Double faiblesses (x4)
  if (effectiveness.x4.length > 0) {
    content += '<div class="popup-section">';
    content += '<h4>Very Weak (×4)</h4>';
    content += '<div class="type-list">';
    effectiveness.x4.forEach(type => {
      content += `
        <div class="type-badge ${type}">
          <img src="images/types/${type}.png" alt="${type}" class="type-icon">
          <span>${formatTypeName(type)}</span>
        </div>`;
    });
    content += '</div></div>';
  }
  
  // Faiblesses simples (x2)
  if (effectiveness.x2.length > 0) {
    content += '<div class="popup-section">';
    content += '<h4>Weak (×2)</h4>';
    content += '<div class="type-list">';
    effectiveness.x2.forEach(type => {
      content += `
        <div class="type-badge ${type}">
          <img src="images/types/${type}.png" alt="${type}" class="type-icon">
          <span>${formatTypeName(type)}</span>
        </div>`;
    });
    content += '</div></div>';
  }
  
  // Résistances simples (x0.5)
  if (effectiveness.x05.length > 0) {
    content += '<div class="popup-section">';
    content += '<h4>Resist (×0.5)</h4>';
    content += '<div class="type-list">';
    effectiveness.x05.forEach(type => {
      content += `
        <div class="type-badge ${type}">
          <img src="images/types/${type}.png" alt="${type}" class="type-icon">
          <span>${formatTypeName(type)}</span>
        </div>`;
    });
    content += '</div></div>';
  }
  
  // Doubles résistances (x0.25)
  if (effectiveness.x025.length > 0) {
    content += '<div class="popup-section">';
    content += '<h4>Strongly Resist (×0.25)</h4>';
    content += '<div class="type-list">';
    effectiveness.x025.forEach(type => {
      content += `
        <div class="type-badge ${type}">
          <img src="images/types/${type}.png" alt="${type}" class="type-icon">
          <span>${formatTypeName(type)}</span>
        </div>`;
    });
    content += '</div></div>';
  }
  
  // Immunités (x0)
  if (effectiveness.x0.length > 0) {
    content += '<div class="popup-section">';
    content += '<h4>Immune (×0)</h4>';
    content += '<div class="type-list">';
    effectiveness.x0.forEach(type => {
      content += `
        <div class="type-badge ${type}">
          <img src="images/types/${type}.png" alt="${type}" class="type-icon">
          <span>${formatTypeName(type)}</span>
        </div>`;
    });
    content += '</div></div>';
  }

  content += '</div>';
  return content;
}

// Fonction pour fermer la popup
function closePopup() {
    const popup = document.querySelector('.type-popup');
    const overlay = document.querySelector('.popup-overlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
}

// Fonction pour initialiser les popups
function initTypeTooltips() {
    // Sélectionner tous les conteneurs de types
    const typeContainers = document.querySelectorAll('.pokemon-types');
    
    typeContainers.forEach(container => {
        container.addEventListener('click', () => {
            // Récupérer les types du Pokémon
            const types = Array.from(container.querySelectorAll('img')).map(img => {
                const src = img.src;
                return src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));
            });

            // Créer l'overlay
            const overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
            document.body.appendChild(overlay);

            // Créer le contenu de la popup
            const popupContent = createTypePopupContent(types);
            document.body.insertAdjacentHTML('beforeend', popupContent);

            // Ajouter l'événement de fermeture
            const closeButton = document.querySelector('.popup-close');
            closeButton.addEventListener('click', closePopup);
            overlay.addEventListener('click', closePopup);

            // Empêcher la propagation du clic sur la popup
            const popup = document.querySelector('.type-popup');
            popup.addEventListener('click', (e) => e.stopPropagation());
        });
    });
}