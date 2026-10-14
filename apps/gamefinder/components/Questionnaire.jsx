'use client';

import { useState } from 'react';
import MultiSelect from './MultiSelect';
import styles from './GameFinder.module.css';

const titleCase = (value) =>
    value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function FacetChoices({
    name,
    facet,
    selected,
    unavailable,
    onToggle,
    groupTags,
    selectionLimit,
    onSubmenuChange,
}) {
    const availableFacet = {
        ...facet,
        options: facet.options.filter((option) => !unavailable.includes(option.name)),
    };
    if (facet.control === 'multi-select') {
        return (
            <MultiSelect
                key={name}
                name={name}
                options={availableFacet.options}
                selected={selected}
                onToggle={onToggle}
                groupTags={groupTags}
                selectionLimit={selectionLimit}
                onSubmenuChange={onSubmenuChange}
            />
        );
    }
    const limitReached = selected.length >= selectionLimit;
    return (
        <div>
            <div className={styles.choiceSelectionHeading}>
                <span>
                    {selected.length} / {selectionLimit} selected
                </span>
            </div>
            {limitReached ? (
                <p className={styles.selectionLimitNotice} role="status">
                    Selection limit reached. Remove one choice before adding another.
                </p>
            ) : null}
            <div className={styles.choiceGrid}>
                {availableFacet.options.map((option) => (
                    <label className={styles.choice} key={option.name}>
                        <input
                            type="checkbox"
                            name={name}
                            value={option.name}
                            checked={selected.includes(option.name)}
                            disabled={limitReached && !selected.includes(option.name)}
                            onChange={() => onToggle(name, option.name)}
                        />
                        <span>
                            {titleCase(option.name)} <small>{option.count.toLocaleString()}</small>
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function Questionnaire({ onSubmit, pending, options }) {
    const priceMinimum = options.price.minimum;
    const priceMaximum = Math.max(options.price.maximum, options.price.step);
    const priceStep = options.price.step;
    const reviewOptions = options.reviews;
    const selectionLimit = options.selectionLimit || 50;
    const [step, setStep] = useState(0);
    const [tagSubmenuOpen, setTagSubmenuOpen] = useState(false);
    const [form, setForm] = useState({
        includedGenres: [],
        excludedGenres: [],
        includedTags: [],
        excludedTags: [],
        platforms: [],
        priceFilterEnabled: false,
        priceMinUsd: priceMinimum,
        priceMaxUsd: priceMaximum,
        ratingFilterEnabled: false,
        minimumRating: 70,
        ratingCountFilterEnabled: false,
        minimumRatingCount: 100,
    });

    const toggle = (name, value) => {
        setForm((current) => {
            if (!current[name].includes(value) && current[name].length >= selectionLimit) {
                return current;
            }
            const next = {
                ...current,
                [name]: current[name].includes(value)
                    ? current[name].filter((item) => item !== value)
                    : [...current[name], value],
            };
            const opposites = {
                includedGenres: 'excludedGenres',
                excludedGenres: 'includedGenres',
                includedTags: 'excludedTags',
                excludedTags: 'includedTags',
            };
            if (opposites[name])
                next[opposites[name]] = current[opposites[name]].filter((item) => item !== value);
            return next;
        });
    };

    const opposites = {
        includedGenres: 'excludedGenres',
        excludedGenres: 'includedGenres',
        includedTags: 'excludedTags',
        excludedTags: 'includedTags',
    };

    const facetStep = (title, description, name, facetName) => ({
        title,
        description,
        valid: true,
        content: (
            <FacetChoices
                name={name}
                facet={options.facets[facetName]}
                selected={form[name]}
                unavailable={form[opposites[name]] || []}
                onToggle={toggle}
                groupTags={facetName === 'tags'}
                selectionLimit={selectionLimit}
                onSubmenuChange={facetName === 'tags' ? setTagSubmenuOpen : undefined}
            />
        ),
    });

    const steps = [
        facetStep(
            'Which genres sound good?',
            'Optional boosts for games in the selected genres.',
            'includedGenres',
            'genres'
        ),
        facetStep(
            'Which genres should stay out?',
            'Selected genres become hard filters.',
            'excludedGenres',
            'genres'
        ),
        facetStep(
            'What tags are you looking for?',
            'Tags make the recommendation more specific.',
            'includedTags',
            'tags'
        ),
        facetStep(
            'Which tags should be avoided?',
            'Use this for themes or mechanics nobody wants.',
            'excludedTags',
            'tags'
        ),
        facetStep(
            'Which platforms must work?',
            'A game must support at least one selected platform.',
            'platforms',
            'platforms'
        ),
        {
            title: 'Price and review filters?',
            description:
                'All filters are optional. Games with missing data are excluded only when the related filter is enabled.',
            valid:
                form.priceMinUsd <= form.priceMaxUsd &&
                form.minimumRating >= reviewOptions.ratingMinimum &&
                form.minimumRating <= reviewOptions.ratingMaximum &&
                form.minimumRatingCount >= 0 &&
                form.minimumRatingCount <= reviewOptions.countMaximum,
            content: (
                <div className={styles.filterStack}>
                    <div className={styles.rangePanel}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={form.priceFilterEnabled}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        priceFilterEnabled: event.target.checked,
                                    }))
                                }
                            />
                            Only show games inside a price range
                        </label>
                        {form.priceFilterEnabled ? (
                            <>
                                <div className={styles.rangeValues}>
                                    <strong>${(form.priceMinUsd / 100).toFixed(0)}</strong>
                                    <span>to</span>
                                    <strong>${(form.priceMaxUsd / 100).toFixed(0)}</strong>
                                </div>
                                <label className={styles.rangeLabel}>
                                    Minimum
                                    <input
                                        type="range"
                                        min={priceMinimum}
                                        max={priceMaximum}
                                        step={priceStep}
                                        value={form.priceMinUsd}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                priceMinUsd: Math.min(
                                                    Number(event.target.value),
                                                    current.priceMaxUsd
                                                ),
                                            }))
                                        }
                                    />
                                </label>
                                <label className={styles.rangeLabel}>
                                    Maximum
                                    <input
                                        type="range"
                                        min={priceMinimum}
                                        max={priceMaximum}
                                        step={priceStep}
                                        value={form.priceMaxUsd}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                priceMaxUsd: Math.max(
                                                    Number(event.target.value),
                                                    current.priceMinUsd
                                                ),
                                            }))
                                        }
                                    />
                                </label>
                            </>
                        ) : null}
                    </div>
                    <div className={styles.rangePanel}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={form.ratingFilterEnabled}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        ratingFilterEnabled: event.target.checked,
                                    }))
                                }
                            />
                            Require a minimum positive Steam rating
                        </label>
                        {form.ratingFilterEnabled ? (
                            <label className={styles.rangeLabel}>
                                Minimum positive rating: <strong>{form.minimumRating}%</strong>
                                <input
                                    type="range"
                                    min={reviewOptions.ratingMinimum}
                                    max={reviewOptions.ratingMaximum}
                                    step={reviewOptions.ratingStep}
                                    value={form.minimumRating}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            minimumRating: Number(event.target.value),
                                        }))
                                    }
                                />
                            </label>
                        ) : null}
                    </div>
                    <div className={styles.rangePanel}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={form.ratingCountFilterEnabled}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        ratingCountFilterEnabled: event.target.checked,
                                    }))
                                }
                            />
                            Require a minimum number of Steam reviews
                        </label>
                        {form.ratingCountFilterEnabled ? (
                            <label className={styles.numberLabel}>
                                Minimum review count
                                <input
                                    type="number"
                                    min="0"
                                    max={reviewOptions.countMaximum}
                                    step="100"
                                    value={form.minimumRatingCount}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            minimumRatingCount: Number(event.target.value),
                                        }))
                                    }
                                />
                                <small>
                                    Catalog maximum: {reviewOptions.countMaximum.toLocaleString()}
                                </small>
                            </label>
                        ) : null}
                    </div>
                </div>
            ),
        },
    ];

    const current = steps[step];
    const isLastStep = step === steps.length - 1;
    const handleNext = () => {
        if (!current.valid || tagSubmenuOpen) return;
        if (isLastStep) onSubmit(form);
        else setStep((currentStep) => currentStep + 1);
    };

    return (
        <section className={styles.questionnaire}>
            <div className={styles.wizardHeader}>
                <div>
                    <span className={styles.kicker}>Private questionnaire</span>
                    <span className={styles.stepCount}>
                        Step {step + 1} of {steps.length}
                    </span>
                </div>
                <div
                    className={styles.stepProgress}
                    role="progressbar"
                    aria-valuemin="1"
                    aria-valuemax={steps.length}
                    aria-valuenow={step + 1}
                >
                    <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
                </div>
            </div>
            <div className={styles.wizardBody}>
                <h2>{current.title}</h2>
                <p>{current.description}</p>
                <div className={styles.wizardChoices}>{current.content}</div>
            </div>
            <div className={styles.wizardActions}>
                {tagSubmenuOpen ? (
                    <p className={styles.navigationNotice} role="status">
                        Return to the tag category menu before changing questionnaire steps.
                    </p>
                ) : null}
                <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={pending || step === 0 || tagSubmenuOpen}
                    onClick={() => setStep((currentStep) => currentStep - 1)}
                >
                    Back
                </button>
                <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={pending || !current.valid || tagSubmenuOpen}
                    onClick={handleNext}
                >
                    {pending && isLastStep
                        ? 'Saving…'
                        : isLastStep
                          ? 'Lock in my preferences'
                          : 'Next'}
                </button>
            </div>
        </section>
    );
}
