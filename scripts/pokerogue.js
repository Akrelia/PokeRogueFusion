function getFusedSpeciesName(speciesAName, speciesBName) {
  const fragAPattern = /([a-z]{2}.*?[aeiou(?:y$)\-']+)(.*?)$/i;
  const fragBPattern = /([a-z]{2}.*?[aeiou(?:y$)\-'])(.*?)$/i;

  const speciesAPrefixMatch = /^(?:[^ ]+) /.exec(speciesAName);
  const speciesBPrefixMatch = /^(?:[^ ]+) /.exec(speciesBName);
  const speciesAPrefix = speciesAPrefixMatch ? speciesAPrefixMatch[0] : "";
  const speciesBPrefix = speciesBPrefixMatch ? speciesBPrefixMatch[0] : "";

  if (speciesAPrefix) speciesAName = speciesAName.slice(speciesAPrefix.length);
  if (speciesBPrefix) speciesBName = speciesBName.slice(speciesBPrefix.length);

  const speciesASuffixMatch = / (?:[^ ]+)$/.exec(speciesAName);
  const speciesBSuffixMatch = / (?:[^ ]+)$/.exec(speciesBName);
  const speciesASuffix = speciesASuffixMatch ? speciesASuffixMatch[0] : "";
  const speciesBSuffix = speciesBSuffixMatch ? speciesBSuffixMatch[0] : "";

  if (speciesASuffix) speciesAName = speciesAName.slice(0, -speciesASuffix.length);
  if (speciesBSuffix) speciesBName = speciesBName.slice(0, -speciesBSuffix.length);

  const splitNameA = speciesAName.split(/ /g);
  const splitNameB = speciesBName.split(/ /g);

  const fragAMatch = fragAPattern.exec(speciesAName);
  const fragBMatch = fragBPattern.exec(speciesBName);

  let fragA;
  let fragB;

  fragA = splitNameA.length === 1 ? (fragAMatch ? fragAMatch[1] : speciesAName) : splitNameA[splitNameA.length - 1];

  if (splitNameB.length === 1) {
    if (fragBMatch) {
      const lastCharA = fragA.slice(fragA.length - 1);
      const prevCharB = fragBMatch[1].slice(fragBMatch.length - 1);
      fragB = (/[-']/.test(prevCharB) ? prevCharB : "") + fragBMatch[2] || prevCharB;
      if (lastCharA === fragB[0]) {
        if (/[aiu]/.test(lastCharA)) {
          fragB = fragB.slice(1);
        } else {
          const newCharMatch = new RegExp(`[^${lastCharA}]`).exec(fragB);
          if (newCharMatch?.index !== undefined && newCharMatch.index > 0) {
            fragB = fragB.slice(newCharMatch.index);
          }
        }
      }
    } else {
      fragB = speciesBName;
    }
  } else {
    fragB = splitNameB[splitNameB.length - 1];
  }

  if (splitNameA.length > 1) {
    fragA = `${splitNameA.slice(0, splitNameA.length - 1).join(" ")} ${fragA}`;
  }

  fragB = `${fragB.slice(0, 1).toLowerCase()}${fragB.slice(1)}`;

  return `${speciesAPrefix || speciesBPrefix}${fragA}${fragB}${speciesBSuffix || speciesASuffix}`;
}
