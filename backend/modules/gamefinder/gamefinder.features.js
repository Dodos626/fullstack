const { GAMEFINDER_ALGORITHM_CONFIG } = require('./gamefinder.algorithm-config');
const { filterRecommendationValues } = require('./gamefinder.facet-policy');

const featureWeight = (feature, featureWeights = new Map()) => featureWeights.get(feature) || 1;

const recommendationFeatures = (game) => {
    const genres = [...new Set(filterRecommendationValues('genre', game?.genres))];
    const genreNames = new Set(genres);
    const tags = [...new Set(filterRecommendationValues('tag', game?.tags))].filter(
        (tag) => !genreNames.has(tag)
    );
    return {
        genre: genres.map((value) => `genre:${value}`),
        tag: tags.map((value) => `tag:${value}`),
    };
};

const normalizedChannel = (features, budget, featureWeights) => {
    const weighted = features.map((feature) => ({
        feature,
        sourceWeight: featureWeight(feature, featureWeights),
    }));
    const total = weighted.reduce((sum, value) => sum + value.sourceWeight, 0);
    if (!total) return [];
    return weighted.map(({ feature, sourceWeight }) => ({
        feature,
        weight: (sourceWeight / total) * budget,
    }));
};

const recommendationFeatureVector = (game, featureWeights = new Map()) => {
    const channels = recommendationFeatures(game);
    const activeTypes = Object.keys(channels).filter((type) => channels[type].length);
    const activeBudget = activeTypes.reduce(
        (sum, type) => sum + GAMEFINDER_ALGORITHM_CONFIG.featureBudgets[type],
        0
    );
    if (!activeBudget) return [];

    return activeTypes.flatMap((type) =>
        normalizedChannel(
            channels[type],
            GAMEFINDER_ALGORITHM_CONFIG.featureBudgets[type] / activeBudget,
            featureWeights
        )
    );
};

const weightedJaccardSimilarity = (leftGame, rightGame, featureWeights = new Map()) => {
    const left = new Map(
        recommendationFeatureVector(leftGame, featureWeights).map(({ feature, weight }) => [
            feature,
            weight,
        ])
    );
    const right = new Map(
        recommendationFeatureVector(rightGame, featureWeights).map(({ feature, weight }) => [
            feature,
            weight,
        ])
    );
    const features = new Set([...left.keys(), ...right.keys()]);
    let intersection = 0;
    let union = 0;
    for (const feature of features) {
        const leftWeight = left.get(feature) || 0;
        const rightWeight = right.get(feature) || 0;
        intersection += Math.min(leftWeight, rightWeight);
        union += Math.max(leftWeight, rightWeight);
    }
    return union ? intersection / union : 0;
};

module.exports = {
    featureWeight,
    recommendationFeatures,
    recommendationFeatureVector,
    weightedJaccardSimilarity,
};