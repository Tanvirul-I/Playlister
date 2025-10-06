const obscenity = require("obscenity");

let obscenityMatcher = null;
let obscenityCensor = null;

const { RegExpMatcher, TextCensor, englishDataset, englishRecommendedTransformers } = obscenity;

if (
  typeof RegExpMatcher === "function" &&
  typeof TextCensor === "function" &&
  englishDataset &&
  typeof englishDataset.build === "function"
) {
  const datasetConfig = englishDataset.build();
  const matcherConfig = { ...datasetConfig };

  if (Array.isArray(englishRecommendedTransformers)) {
    matcherConfig.transformers = englishRecommendedTransformers;
  }

  obscenityMatcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  obscenityCensor = new TextCensor();
}

const getProfanityMatches = (text = "") => {
  return typeof obscenityMatcher.getAllMatches === "function"
    ? obscenityMatcher.getAllMatches(text)
    : [];
};

const filterProfanity = (text = "") => {
  const matches = getProfanityMatches(text);

  return Array.isArray(matches) && matches.length > 0;
};

const sanitizeText = (text, { trim = false } = {}) => {
  const normalizedText = typeof text === "string" ? text : "";
  const workingText = trim ? normalizedText.trim() : normalizedText;
  const sanitizedText =
    typeof obscenityCensor.applyTo === "function"
      ? obscenityCensor.applyTo(text, getProfanityMatches(text))
      : text;

  return {
    sanitizedText,
    containsProfanity: filterProfanity(workingText),
  };
};

module.exports = {
  filterProfanity,
  sanitizeText,
};
