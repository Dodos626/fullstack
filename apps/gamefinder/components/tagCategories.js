const TAG_GROUPS = [
    {
        name: 'Gameplay & Mechanics',
        tags: [
            'action', 'adventure', 'action-adventure', 'action-rpg', 'rpg', 'jrpg', 'crpg',
            'strategy-rpg',
            'tactical-rpg', 'party-based-rpg', 'simulation', 'strategy', 'casual', 'indie',
            'free-to-play', 'early-access', 'arcade', 'puzzle', 'platformer', '2d-platformer',
            '3d-platformer', 'precision-platformer', 'puzzle-platformer', 'metroidvania',
            'roguelike', 'roguelite', 'traditional-roguelike', 'action-roguelike',
            'dungeon-crawler', 'open-world', 'open-world-survival-craft', 'sandbox', 'survival',
            'exploration', 'collectathon', 'crafting', 'building', 'base-building', 'loot',
            'resource-management', 'inventory-management', 'procedural-generation', 'physics',
            'level-editor', 'quick-time-events', 'time-manipulation', 'time-management',
            'hidden-object', 'escape-room', 'minigames', 'runner', 'stealth', 'score-attack',
            'time-attack', 'time-travel',
            'match-3', 'word-game', 'typing', 'farming', 'mining', 'fishing', 'cooking',
            'cleaning', 'decorating', 'organizing', 'hacking', 'programming', 'automation',
            'rhythm', 'music-based-procedural-generation', 'character-customization',
            'creature-collector', 'perma-death', 'multiple-endings', 'choices-matter',
            'choose-your-own-adventure', 'replay-value', 'nonlinear', 'linear', 'difficult',
            'fast-paced', 'souls-like', 'walking-simulator', 'idler', 'incremental',
            'bullet-heaven', 'falling-blocks', 'sokoban', 'lemmings', 'god-game',
        ],
    },
    {
        name: 'Combat & Action',
        tags: [
            'combat', 'shooter', 'fps', 'third-person-shooter', 'top-down-shooter',
            'twin-stick-shooter', 'arena-shooter', 'hero-shooter', 'boomer-shooter',
            'extraction-shooter', 'looter-shooter', 'on-rails-shooter', 'shoot-em-up',
            'bullet-hell', 'hack-and-slash', 'beat-em-up', 'fighting', '2d-fighter',
            '3d-fighter', 'spectacle-fighter', 'character-action-game', 'swordplay',
            'martial-arts', 'archery', 'sniper', 'gun-customization', 'vehicular-combat',
            'combat-racing', 'boss-rush', 'battle-royale', 'destruction', 'bullet-time',
            'assassins', 'ninja', 'samurai', 'musou',
        ],
    },
    {
        name: 'Strategy & Management',
        tags: [
            'management', 'economy', 'capitalism', 'trading', 'shop-keeper', 'city-builder',
            'colony-sim', 'life-sim', 'farming-sim', 'political-sim', 'outbreak-sim',
            'grand-strategy', '4x', 'rts', 'action-rts', 'real-time-tactics',
            'turn-based-strategy', 'turn-based-tactics', 'turn-based-combat', 'turn-based',
            'tower-defense', 'tactical', 'wargame', 'auto-battler', 'team-based',
            'class-based', 'grid-based-movement', 'hex-grid', 'diplomacy',
            'real-time', 'real-time-with-pause',
        ],
    },
    {
        name: 'Simulation & Activities',
        tags: [
            'immersive-sim', 'automobile-sim', 'space-sim', 'job-simulator', 'medical-sim',
            'hobby-sim', 'flight', 'driving', 'transportation', 'agriculture', 'hunting',
            'tabletop', 'board-game', 'card-game', 'card-battler', 'deckbuilding',
            'roguelike-deckbuilder', 'trading-card-game', 'solitaire', 'chess', 'mahjong',
            'poker', 'gambling', 'dice', 'trivia', 'logic',
        ],
    },
    {
        name: 'Multiplayer & Social',
        tags: [
            'singleplayer', 'multiplayer', 'massively-multiplayer', 'mmorpg', 'moba', 'pve',
            'pvp', 'co-op', 'online-co-op', 'local-co-op', 'co-op-campaign',
            'local-multiplayer', 'asynchronous-multiplayer', 'split-screen', '4-player-local',
            'party', 'party-game', 'competitive', 'esports', 'social-deduction',
        ],
    },
    {
        name: 'Perspective, Movement & Controls',
        tags: [
            '2d', '2-5d', '3d', 'first-person', 'third-person', 'top-down', 'isometric',
            'side-scroller', 'point-and-click', 'parkour', '6dof', 'controller', 'mouse-only',
            'touch-friendly', 'voice-control', 'intentionally-awkward-controls', 'trackir',
            'asymmetric-vr', 'vr',
        ],
    },
    {
        name: 'Graphics & Visual Style',
        tags: [
            'pixel-graphics', 'colorful', 'stylized', 'realistic', 'cartoony', 'cartoon',
            'anime', 'hand-drawn', 'minimalist', 'abstract', 'comic-book', 'voxel',
            'psychedelic', 'cinematic', 'beautiful', 'fmv', 'retro', 'old-school',
            'classic', 'experimental',
        ],
    },
    {
        name: 'Story, Characters & Relationships',
        tags: [
            'story-rich', 'narrative', 'interactive-fiction', 'visual-novel', 'text-based',
            'dialogue-heavy', 'dynamic-narration', 'lore-rich', 'mystery', 'investigation',
            'detective', 'romance', 'dating-sim', 'otome', 'female-protagonist',
            'silent-protagonist', 'villain-protagonist', 'family-friendly', 'lgbtq',
            'based-on-a-novel', 'episodic', 'sequel', 'remake', 'reboot',
        ],
    },
    {
        name: 'World, Setting & Themes',
        tags: [
            'fantasy', 'dark-fantasy', 'sci-fi', 'space', 'futuristic', 'cyberpunk',
            'steampunk', 'post-apocalyptic', 'dystopian', 'medieval', 'historical',
            'alternate-history', 'world-war-i', 'world-war-ii', 'cold-war', 'war', 'military',
            'western', 'crime', 'heist', 'espionage', 'pirates', 'vikings', 'rome', 'underground',
            'underwater', 'mars', 'nature', 'snow', 'mythology', 'magic', 'supernatural',
            'demons', 'dragons', 'vampires', 'werewolves', 'zombies', 'aliens', 'robots',
            'mechs', 'dinosaurs', 'dwarves', 'elves', 'animals', 'cats', 'dogs', 'birds',
            'foxes', 'wolves', 'capybaras', 'horses', 'faith', 'cult', 'conspiracy',
            'transhumanism', 'science', 'superhero', 'xianxia', 'wuxia',
        ],
    },
    {
        name: 'Mood & Vibe',
        tags: [
            'atmospheric', 'relaxing', 'cozy', 'cute', 'funny', 'comedy', 'dark-comedy',
            'dark-humor', 'parody', 'satire', 'memes', 'wholesome', 'emotional', 'dark',
            'horror', 'psychological-horror', 'survival-horror', 'psychological', 'thriller',
            'lovecraftian', 'gothic', 'noir', 'surreal', 'philosophical', 'mystery-dungeon',
            'jump-scare', 'nostalgia', 'immersive', 'epic', 'addictive', 'short', '1980s',
            '1990-s', 'music', 'great-soundtrack', 'soundtrack', 'electronic-music',
            'rock-music', 'instrumental-music', '8-bit-music',
        ],
    },
    {
        name: 'Sports, Racing & Vehicles',
        tags: [
            'sports', 'racing', 'football-soccer', 'football-american', 'basketball',
            'baseball', 'hockey', 'golf', 'mini-golf', 'tennis', 'volleyball', 'rugby',
            'cricket', 'boxing', 'wrestling', 'billiards', 'bowling', 'pinball', 'cycling',
            'bikes', 'bmx', 'motorbike', 'motocross', 'atv', 'skateboarding', 'skating',
            'skiing', 'snowboarding', 'tanks', 'trains', 'sailing', 'naval-combat', 'submarine',
            'spaceships',
        ],
    },
    {
        name: 'Mature Content',
        tags: ['violent', 'gore', 'nudity', 'sexual-content', 'hentai'],
    },
    {
        name: 'Technology, Tools & Other',
        tags: [
            'artificial-intelligence', 'moddable', 'mod', 'software', 'hardware',
            'game-development', 'desktop-companion', 'benchmark', 'gaming', 'tutorial',
            'education', 'language-learning', 'spelling', '360-video', 'zoo',
        ],
    },
];

const TAG_TO_GROUP = new Map();
for (const group of TAG_GROUPS) {
    for (const tag of group.tags) {
        if (!TAG_TO_GROUP.has(tag)) TAG_TO_GROUP.set(tag, group.name);
    }
}

export const groupTagOptions = (options) => {
    const groups = new Map(TAG_GROUPS.map((group) => [group.name, []]));
    const uncategorized = [];

    for (const option of options) {
        const groupName = TAG_TO_GROUP.get(option.name);
        if (groupName) groups.get(groupName).push(option);
        else uncategorized.push(option);
    }

    if (uncategorized.length) groups.get('Technology, Tools & Other').push(...uncategorized);
    return [...groups.entries()].map(([name, values]) => ({ name, options: values }));
};