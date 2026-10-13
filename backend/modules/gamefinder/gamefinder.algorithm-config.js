const GAMEFINDER_ALGORITHM_CONFIG = Object.freeze({
    version: 'evidence-v2',
    featureBudgets: Object.freeze({ genre: 0.45, tag: 0.55 }),
    evidenceSmoothing: 1.5,
    learningSignals: Object.freeze({
        like: Object.freeze({ signed: 1, evidence: 1 }),
        maybe: Object.freeze({ signed: 0.1, evidence: 0.35 }),
        dislike: Object.freeze({ signed: -1, evidence: 1 }),
        skipped: Object.freeze({ signed: 0, evidence: 0 }),
    }),
    learnedBlendPerVote: 0.1625,
    maximumLearnedBlend: 0.65,
    groupUtilityWeights: Object.freeze({ mean: 0.55, minimum: 0.3, disagreement: 0.15 }),
    exploration: Object.freeze({ initialWeight: 0.18, relevanceFloor: 0.25 }),
    diversity: Object.freeze({ weight: 0.12, recentGameCount: 3 }),
    finalResultWeights: Object.freeze({
        meanVote: 0.5,
        minimumVote: 0.2,
        questionnaire: 0.2,
        steamQuality: 0.1,
    }),
});

module.exports = { GAMEFINDER_ALGORITHM_CONFIG };