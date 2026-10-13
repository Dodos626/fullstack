import { buildUrl } from './apps';

const helloUrl = buildUrl('hello');

const subApps = [
    {
        id: 'hello',
        name: 'Hello World',
        description: 'The first standalone app in the chlktheo.com application collection.',
        url: helloUrl,
        host: new URL(helloUrl).host,
    },
];

export { subApps };