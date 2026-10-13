import { buildUrl } from './apps';

const helloUrl = buildUrl('hello');
const gamefinderUrl = buildUrl('gamefinder');

const subApps = [
    {
        id: 'gamefinder',
        name: 'What the Hell Are We Playing?',
        description:
            'Create a room, discover everyone’s preferences privately, and let adaptive group voting find tonight’s Steam game.',
        url: gamefinderUrl,
        host: new URL(gamefinderUrl).host,
    },
    {
        id: 'hello',
        name: 'Hello World',
        description: 'The first standalone app in the chlktheo.com application collection.',
        url: helloUrl,
        host: new URL(helloUrl).host,
    },
];

export { subApps };