const DISABLED_GENRE_AND_TAG_VALUES = Object.freeze([
    'modern',
    'off-road',
    'offroad',
    'utilities',
    'animation-and-modeling',
    'audio-production',
    'design-and-illustration',
    'naval',
    'photo-editing',
    'video-production',
    'software-training',
    'touring',
]);

const disabledValues = new Set(DISABLED_GENRE_AND_TAG_VALUES);

const isRecommendationFacetEnabled = (type, value) => {
    if (type === 'category') return false;
    if (type === 'genre' || type === 'tag') return !disabledValues.has(value);
    return type === 'platform';
};

const filterRecommendationValues = (type, values = []) =>
    (Array.isArray(values) ? values : []).filter((value) =>
        isRecommendationFacetEnabled(type, value)
    );

module.exports = {
    DISABLED_GENRE_AND_TAG_VALUES,
    filterRecommendationValues,
    isRecommendationFacetEnabled,
};