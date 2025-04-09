const cachePokemons = {};
let fuseButton;
let selectedLanguage = "en";
let selectedAbilityIndices = { A: 0, B: 0 };

initialize();

function initialize() {
  document.addEventListener("DOMContentLoaded", () => {
    loadSavedLanguage();
    documentLoaded();
    updateUITranslations();
    updateWelcomeMessage();
  });
}

function loadSavedLanguage() {
  const savedLanguage = localStorage.getItem("selectedLanguage");
  if (savedLanguage) {
    selectedLanguage = savedLanguage;
    const languageSelect = document.querySelector(".language-selector select");
    languageSelect.value = savedLanguage;
  }
}

function updateWelcomeMessage() {
  const welcomeDiv = document.getElementById("welcome-message");
  const pokemonA = document.getElementById("pokemonA");
  const pokemonB = document.getElementById("pokemonB");
  const pokemonFused = document.getElementById("pokemonFused");

  if (!pokemonA.classList.contains("visible") && !pokemonB.classList.contains("visible") && !pokemonFused.classList.contains("visible")) {
    welcomeDiv.classList.add("visible");
    const currentTranslations = translations[selectedLanguage];
    welcomeDiv.querySelector("h1").innerHTML = `<b>${currentTranslations.welcomeTitle}</b>`;
    welcomeDiv.querySelector("p").innerHTML = `${currentTranslations.welcomeText}<br>${currentTranslations.welcomeOrText}`;
  } else {
    welcomeDiv.classList.remove("visible");
  }
}

function documentLoaded() {
  fuseButton = document.getElementById("fuse-button");
  updateFuseButton();
  loadTopFusions();
}

function changeLanguage() {
  const languageSelect = document.querySelector(".language-selector select");
  selectedLanguage = languageSelect.value;
  localStorage.setItem("selectedLanguage", selectedLanguage);
  updateUITranslations();

  if (cachePokemons["A"]) {
    selectPokemon("A", cachePokemons["A"].id);
  }
  if (cachePokemons["B"]) {
    selectPokemon("B", cachePokemons["B"].id);
  }
  updateWelcomeMessage();
}

function updateUITranslations() {
  const currentTranslations = translations[selectedLanguage];

  document.querySelector(".site-name").textContent = currentTranslations.siteTitle;

  document.getElementById("searchA").placeholder = currentTranslations.searchPlaceholderA;
  document.getElementById("searchB").placeholder = currentTranslations.searchPlaceholderB;

  const welcomeDiv = document.getElementById("welcome-message");
  welcomeDiv.querySelector("h1").innerHTML = `<b>${currentTranslations.welcomeTitle}</b>`;
  welcomeDiv.querySelector("p").innerHTML = `${currentTranslations.welcomeText}<br>${currentTranslations.welcomeOrText}`;

  document.querySelector(".top-fusions-container h2").textContent = currentTranslations.topFusionsTitle;

  document.querySelector("#pokemonA .pokemon-label").textContent = currentTranslations.pokemonLabelA;
  document.querySelector("#pokemonB .pokemon-label").textContent = currentTranslations.pokemonLabelB;
  document.querySelector("#pokemonFused .pokemon-label").textContent = currentTranslations.pokemonLabelFused;

  const fuseButton = document.getElementById("fuse-button");
  fuseButton.childNodes[0].textContent = currentTranslations.fuseButtonText;

  const footerSections = document.querySelectorAll(".footer-section");
  footerSections[0].querySelector("h3").textContent = currentTranslations.footerAboutTitle;
  footerSections[0].querySelector("p").textContent = currentTranslations.footerAboutText;
  footerSections[1].querySelector("h3").textContent = currentTranslations.footerLinksTitle;
  footerSections[1].querySelector("a").textContent = currentTranslations.footerContactLink;
  footerSections[2].querySelector("h3").textContent = currentTranslations.footerCreditsTitle;
  footerSections[2].querySelector("p").textContent = currentTranslations.footerCreditsText;
  // Copyright
  document.querySelector(".footer-bottom p").textContent = currentTranslations.footerCopyright;
}

function searchPokemon(pokemonId) {
  const searchInput = document.getElementById(`search${pokemonId}`).value;

  if (searchInput.length >= 3) {
    fetch(`https://pokeapi.crabdance.com/search/${selectedLanguage}/${searchInput}`)
      .then((response) => response.json())
      .then((data) => {
        displaySuggestions(pokemonId, data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else {
    clearSuggestions(pokemonId);
  }
}

function displaySuggestions(pokemonDivID, data) {
  const suggestionsDiv = document.getElementById(`pokemon${pokemonDivID}-suggestions`);

  suggestionsDiv.innerHTML = "";

  if (data && data.length > 0) {
    data.forEach((pokemon) => {
      const suggestion = document.createElement("div");
      const nameProperty = `name_${selectedLanguage}`;
      suggestion.textContent = pokemon[nameProperty] || pokemon.name_en;
      suggestion.onclick = () => selectPokemon(pokemonDivID, pokemon.id);
      suggestionsDiv.appendChild(suggestion);
    });
  } else {
    suggestionsDiv.innerHTML = "No Pokémon found";
  }
}

//======================
// CLEAR THE SUGGESTIONS
//======================
function clearSuggestions(pokemonId) {
  const suggestionsDiv = document.getElementById(`pokemon${pokemonId}-suggestions`);
  suggestionsDiv.innerHTML = "";
}

async function getPokemonSprite(pokemonId) {
  const showdownUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokemonId}.gif`;
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

  try {
    const response = await fetch(showdownUrl, { method: "HEAD" });
    return response.ok ? showdownUrl : fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}

function selectPokemon(pokemonDivID, pokemonID) {
  const searchBar = document.getElementById(`search${pokemonDivID}`);
  const pokemonCard = document.getElementById(`pokemon${pokemonDivID}`);
  const pokemonNameDiv = document.getElementById(`pokemon${pokemonDivID}-name`);
  const pokemonImageDiv = document.getElementById(`pokemon${pokemonDivID}-image`);
  const pokemonStatsDiv = document.getElementById(`pokemon${pokemonDivID}-stats`);
  const pokemonTypesDiv = document.getElementById(`pokemon${pokemonDivID}-types`);
  const pokemonAbilitiesDiv = document.getElementById(`pokemon${pokemonDivID}-abilities`);
  const pokemonHiddenAbilityDiv = document.getElementById(`pokemon${pokemonDivID}-hidden-ability`);

  return fetch(`https://pokeapi.crabdance.com/pokemons/${selectedLanguage}/${pokemonID}`)
    .then((response) => response.json())
    .then(async (data) => {
      const nameProperty = `name_${selectedLanguage}`;
      const pokemonName = data[nameProperty] || data.name_en;

      pokemonNameDiv.innerHTML = `${pokemonName} <span style="color:rgb(139, 149, 167); font-size: 0.8em; margin-left: 6px;">#${data.id}</span>`;
      pokemonStatsDiv.innerHTML = renderStats(data.stats);
      pokemonTypesDiv.innerHTML = renderTypes(data.types);

      pokemonAbilitiesDiv.innerHTML = renderAbilities(data.abilities, pokemonDivID);
      pokemonHiddenAbilityDiv.innerHTML = renderHiddenAbility(data.passive, pokemonDivID);

      const spriteUrl = await getPokemonSprite(pokemonID);
      pokemonImageDiv.innerHTML = `<img src="${spriteUrl}" alt="${data.name_en}" />`;

      cachePokemons[pokemonDivID] = data;
      pokemonCard.classList.add("visible");

      // Sélectionner automatiquement la première capacité
      if (data.abilities && data.abilities.length > 0) {
        toggleAbilityDescription(0, pokemonDivID);
      }

      // Sélectionner automatiquement l'ability cachée
      if (data.passive) {
        toggleHiddenAbilityDescription(data.passive.name, pokemonDivID);
      }

      updateFuseButton();
      updateFusionSymbols();
      updateWelcomeMessage();

      if (cachePokemons["A"] && cachePokemons["B"]) {
        fuseClick();
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);

      cachePokemons[pokemonDivID] = undefined;
      pokemonCard.classList.remove("visible");

      updateFuseButton();
      updateFusionSymbols();
      updateWelcomeMessage();
    })
    .finally(() => {
      searchBar.value = "";
      clearSuggestions(pokemonDivID);
    });
}

function updateFuseButton() {
  if (cachePokemons["A"] != undefined && cachePokemons["B"] != undefined) {
    fuseButton.disabled = false;
  } else {
    fuseButton.disabled = true;
  }
  updateFusionSymbols();
}

function updateFusionSymbols() {
  const plusSymbol = document.querySelector(".fusion-symbol:nth-child(2)");
  const equalsSymbol = document.querySelector(".fusion-symbol:nth-child(4)");

  plusSymbol.style.display = cachePokemons["A"] && cachePokemons["B"] ? "flex" : "none";

  equalsSymbol.style.display = document.getElementById("pokemonFused").classList.contains("visible") ? "flex" : "none";
}

function getColorFromString(colorString) {
  const colorMap = {
    red: "#FF0000",
    blue: "#0000FF",
    yellow: "#FFFF00",
    green: "#00FF00",
    black: "#000000",
    brown: "#A52A2A",
    purple: "#800080",
    gray: "#808080",
    white: "#FFFFFF",
    pink: "#FFC0CB",
  };
  return colorMap[colorString.toLowerCase()] || "#FFFFFF";
}

function fuseClick() {
  var fusion = fusePokemon(cachePokemons["A"], cachePokemons["B"]);

  const pokemonFusedCard = document.getElementById("pokemonFused");
  const pokemonFusedNameDiv = document.getElementById("pokemonFused-name");
  const pokemonFusedImageDiv = document.getElementById("pokemonFused-image");
  const pokemonFusedStatsDiv = document.getElementById("pokemonFused-stats");
  const pokemonFusedTypesDiv = document.getElementById("pokemonFused-types");
  const pokemonFusedAbilitiesDiv = document.getElementById("pokemonFused-abilities");
  const pokemonFusedHiddenAbilityDiv = document.getElementById("pokemonFused-hidden-ability");

  pokemonFusedNameDiv.innerHTML = fusion.name_en;
  pokemonFusedStatsDiv.innerHTML = renderStats(fusion.stats);
  pokemonFusedTypesDiv.innerHTML = renderTypes(fusion.types);
  pokemonFusedAbilitiesDiv.innerHTML = renderAbilities(
    [
      {
        name: fusion.ability,
        description: cachePokemons["A"].abilities[selectedAbilityIndices["A"]].description,
      },
    ],
    "Fused"
  );
  pokemonFusedHiddenAbilityDiv.innerHTML = renderHiddenAbility(fusion.passive, "Fused");

  toggleAbilityDescription(0, "Fused");

  if (fusion.passive) {
    toggleHiddenAbilityDescription(fusion.passive.name, "Fused");
  }

  const color = getColorFromString(cachePokemons["B"].color);

  let hueRotation = 0;
  switch (cachePokemons["B"].color.toLowerCase()) {
    case "red":
      hueRotation = 0;
      break;
    case "blue":
      hueRotation = 240;
      break;
    case "yellow":
      hueRotation = 60;
      break;
    case "green":
      hueRotation = 120;
      break;
    case "purple":
      hueRotation = 300;
      break;
    case "pink":
      hueRotation = 330;
      break;
    case "brown":
      hueRotation = 30;
      break;
    case "gray":
      hueRotation = 0;
      break;
    case "white":
      hueRotation = 0;
      break;
    case "black":
      hueRotation = 0;
      break;
  }

  getPokemonSprite(cachePokemons["A"].id).then((spriteUrl) => {
    pokemonFusedImageDiv.innerHTML = `
      <div style="position: relative; width: 130px; height: 130px;">
        <img src="${spriteUrl}" alt="${fusion.name_en}" style="position: absolute; width: 100%; height: 100%; object-fit: contain; filter: sepia(100%) saturate(300%) hue-rotate(${hueRotation}deg) brightness(90%);" />
      </div>
    `;
  });

  pokemonFusedCard.classList.add("visible");
  updateFusionSymbols();

  fetch(`https://pokeapi.crabdance.com/fusions/${cachePokemons["A"].id}/${cachePokemons["B"].id}`).catch((error) => {
    console.error("Error fetch fusions", error);
  });
}

function fusePokemon(pokemonA, pokemonB) {
  const nameProperty = `name_${selectedLanguage}`;
  const fusedAbility = pokemonA.abilities[selectedAbilityIndices["A"]][nameProperty] || pokemonA.abilities[selectedAbilityIndices["A"]].name;

  const fusedTypes = [];
  const typeA = pokemonA.types[0];
  const typeB = pokemonB.types.length > 1 ? pokemonB.types[1] : pokemonB.types[0];

  if (typeA === typeB) {
    fusedTypes.push(typeA);
  } else {
    fusedTypes.push(typeA, typeB);
  }

  const fusedStats = pokemonA.stats.map((statA, index) => {
    const statB = pokemonB.stats[index];
    const averageStat = Math.round((statA.base_stat + statB.base_stat) / 2);
    return {
      stat: statA.stat,
      base_stat: averageStat,
    };
  });

  const fusedPokemon = {
    id: `${pokemonA.id}-${pokemonB.id}`,
    name_en: getFusedSpeciesName(pokemonA[nameProperty] || pokemonA.name_en, pokemonB[nameProperty] || pokemonB.name_en),
    ability: fusedAbility,
    types: fusedTypes,
    stats: fusedStats,
    passive: pokemonB.passive,
  };

  return fusedPokemon;
}

function renderStats(stats) {
  return stats
    .map((stat) => {
      const statName = stat.stat.replace("-", " ");
      const statClass = stat.stat.replace("-", "-");
      const width = (stat.base_stat / 255) * 100; 

      let shortName = statName;
      switch (statName.toLowerCase()) {
        case "hp":
          shortName = "HP";
          break;
        case "attack":
          shortName = "ATK";
          break;
        case "defense":
          shortName = "DEF";
          break;
        case "special attack":
          shortName = "SPA";
          break;
        case "special defense":
          shortName = "SPD";
          break;
        case "speed":
          shortName = "SPE";
          break;
      }

      let statColor;
      if (stat.base_stat <= 30) statColor = "#FF0000";
      else if (stat.base_stat <= 60) statColor = "#FFA500";
      else if (stat.base_stat <= 90) statColor = "#FFD700";
      else if (stat.base_stat <= 120) statColor = "#90EE90";
      else if (stat.base_stat <= 150) statColor = "#32CD32";
      else if (stat.base_stat <= 180) statColor = "#006400";
      else statColor = "#19b3da";

      return `
      <div class="stat-bar stat-${statClass}">
        <div class="stat-name">${shortName}</div>
        <div class="stat-value">${stat.base_stat}</div>
        <div class="stat-bar-container">
          <div class="stat-bar-fill" style="width: ${width}%; background-color: ${statColor}"></div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Fonction pour afficher les types
function renderTypes(types) {
  return types
    .map((type) => {
      const typeName = type.charAt(0).toUpperCase() + type.slice(1);
      return `
      <div class="type-badge ${type}">
        <img src="images/types/${type}.png" alt="${typeName}" class="type-icon">
        ${typeName}
      </div>`;
    })
    .join("");
}

function formatAbilityName(name) {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatAbilityDescription(description) {
  return description.replace(/\r?\n/g, " ");
  //return description.split("\n")[0]; // Using short-description now
}

function renderAbilities(abilities, pokemonId) {
  return `
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
      ${abilities
        .map(
          (ability, index) => `
        <button class="ability-button" onclick="toggleAbilityDescription(${index}, '${pokemonId}')" style="
          background-color: #4b5563;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 6px;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.9rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        ">
          <span>${formatAbilityName(ability.name)}</span>
        </button>
      `
        )
        .join("")}
    </div>
    <div style="margin-top: 10px;">
      ${abilities
        .map(
          (ability, index) => `
        <div class="ability-description" id="ability-${index}" style="
          display: none;
          padding: 10px;
          background-color: #374151;
          border-radius: 4px;
          margin-top: 5px;
          font-size: 0.85rem;
          line-height: 1.4;
        ">${formatAbilityDescription(ability.description)}</div>
      `
        )
        .join("")}
    </div>
  `;
}

function toggleAbilityDescription(selectedIndex, pokemonId) {
  const card = document.getElementById(`pokemon${pokemonId}`);
  const buttons = card.querySelectorAll(".ability-button");
  const descriptions = card.querySelectorAll(".ability-description");

  buttons.forEach((button, index) => {
    if (index === selectedIndex) {
      button.style.backgroundColor = "#6b7280";
    } else {
      button.style.backgroundColor = "#4b5563";
    }
  });

  descriptions.forEach((description, index) => {
    description.style.display = index === selectedIndex ? "block" : "none";
  });

  selectedAbilityIndices[pokemonId] = selectedIndex;
}

function renderHiddenAbility(hiddenAbility, pokemonId) {
  return `
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
      <button class="ability-button" onclick="toggleHiddenAbilityDescription('${hiddenAbility.name}', '${pokemonId}')" style="
        background-color: #4b5563;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 6px;
        font-family: 'Quicksand', sans-serif;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        font-style: italic;
      ">
        <span>${formatAbilityName(hiddenAbility.name)} <span style="color: #fbbf24; margin-left: 4px;">★</span></span>
      </button>
    </div>
    <div style="margin-top: 10px;">
      <div class="ability-description" id="hidden-ability-description-${pokemonId}" style="
        display: none;
        padding: 10px;
        background-color: #374151;
        border-radius: 4px;
        margin-top: 5px;
        font-size: 0.85rem;
        line-height: 1.4;
      ">${formatAbilityDescription(hiddenAbility.description)}</div>
    </div>
  `;
}

function toggleHiddenAbilityDescription(abilityName, pokemonId) {
  const button = document.querySelector(`button[onclick="toggleHiddenAbilityDescription('${abilityName}', '${pokemonId}')"]`);
  const description = document.getElementById(`hidden-ability-description-${pokemonId}`);

  if (description.style.display === "none") {
    description.style.display = "block";
    button.style.backgroundColor = "#6b7280";
  } else {
    description.style.display = "none";
    button.style.backgroundColor = "#4b5563";
  }
}

function getFusedSpeciesName(nameA, nameB) {
  const halfLengthA = Math.floor(nameA.length / 2);
  const halfLengthB = Math.floor(nameB.length / 2);

  const firstHalf = nameA.substring(0, halfLengthA);
  const secondHalf = nameB.substring(halfLengthB);

  return firstHalf + secondHalf;
}

function swapPokemons() {
  const searchA = document.getElementById("searchA");
  const searchB = document.getElementById("searchB");
  const tempValue = searchA.value;
  searchA.value = searchB.value;
  searchB.value = tempValue;

  const tempPokemon = cachePokemons["A"];
  cachePokemons["A"] = cachePokemons["B"];
  cachePokemons["B"] = tempPokemon;

  if (cachePokemons["A"]) {
    selectPokemon("A", cachePokemons["A"].id);
  } else {
    document.getElementById("pokemonA").classList.remove("visible");
  }

  if (cachePokemons["B"]) {
    selectPokemon("B", cachePokemons["B"].id);
  } else {
    document.getElementById("pokemonB").classList.remove("visible");
  }

  const pokemonFusedCard = document.getElementById("pokemonFused");
  if (pokemonFusedCard.classList.contains("visible")) {
   // fuseClick();
  }

  updateFuseButton();
}

async function loadTopFusions() {
  try {
    const response = await fetch("https://pokeapi.crabdance.com/top-fusions");
    const topFusions = await response.json();
    displayTopFusions(topFusions);
  } catch (error) {
    console.error("Erreur lors du chargement des top fusions:", error);
  }
}

async function displayTopFusions(fusions) {
  const grid = document.getElementById("top-fusions-grid");
  grid.innerHTML = "";

  const fusionElements = await Promise.all(
    fusions.map(async (fusion, index) => {
      const spriteUrlA = await getPokemonSprite(fusion.PokemonA);
      const spriteUrlB = await getPokemonSprite(fusion.PokemonB);

      const fusionItem = document.createElement("div");
      fusionItem.className = "fusion-item";
      fusionItem.onclick = () => {
        document.getElementById("searchA").value = fusion.PokemonA;
        document.getElementById("searchB").value = fusion.PokemonB;
        selectPokemon("A", fusion.PokemonA);
        selectPokemon("B", fusion.PokemonB);
        window.scrollTo({ top: 0, behavior: "smooth" });
      };

      fusionItem.innerHTML = `
      <div class="fusion-rank">#${index + 1}</div>
      <div class="fusion-count">${fusion.Count}</div>
      <div class="fusion-pokemon">
        <img src="${spriteUrlA}" alt="${fusion.PokemonA}">
        <span>+</span>
        <img src="${spriteUrlB}" alt="${fusion.PokemonB}">
      </div>
    `;

      return fusionItem;
    })
  );

  grid.append(...fusionElements);
}
