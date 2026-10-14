import { projects } from '../data/portfolio';
import { buildUrl, getPublicUrl } from '../config/apps';

const SITE_NAME = 'Theodoros Chalkidis';
const DEFAULT_TITLE = 'Theodoros Chalkidis — Full-Stack & Distributed Systems Engineer';
const DEFAULT_DESCRIPTION =
    'Portfolio of Theodoros Chalkidis, a software engineer building full-stack products, distributed systems, compilers, developer tooling, and graphics applications.';
const DEFAULT_IMAGE_PATH = '/social-preview.png';
const DEFAULT_ROBOTS = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const NO_INDEX_ROBOTS = 'noindex,follow,noarchive';

const absoluteUrl = (path = '/') => getPublicUrl(path);
const absoluteImageUrl = (path = DEFAULT_IMAGE_PATH) => absoluteUrl(path);

const person = {
    '@type': 'Person',
    '@id': `${absoluteUrl('/')}#person`,
    name: 'Theodoros Chalkidis',
    url: absoluteUrl('/'),
    jobTitle: 'Software Engineer',
    email: 'mailto:chlktheo@gmail.com',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Heraklion',
        addressCountry: 'GR',
    },
    sameAs: [
        'https://github.com/dodos626',
        'https://www.linkedin.com/in/theodoros-chalkidis-a76879245/',
    ],
    knowsAbout: [
        'Full-stack development',
        'Distributed systems',
        'Software architecture',
        'Compilers',
        'Developer tooling',
        'Graphics programming',
    ],
};

const website = {
    '@type': 'WebSite',
    '@id': `${absoluteUrl('/')}#website`,
    url: absoluteUrl('/'),
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': person['@id'] },
};

const breadcrumbStructuredData = (items) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: absoluteUrl(path),
    })),
});

const projectStructuredData = (project) => ({
    '@type': 'SoftwareSourceCode',
    '@id': `${absoluteUrl(`/projects/${project.slug}`)}#project`,
    name: project.projectName,
    headline: project.summary,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    codeRepository: project.github,
    runtimePlatform: project.technologies.join(', '),
    programmingLanguage: project.technologies,
    author: { '@id': person['@id'] },
    creator: { '@id': person['@id'] },
    ...(project.liveUrl ? { sameAs: [project.liveUrl, project.github] } : {}),
});

const projectItemList = {
    '@type': 'ItemList',
    name: 'Software engineering projects by Theodoros Chalkidis',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: project.projectName,
        url: absoluteUrl(`/projects/${project.slug}`),
    })),
};

const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
        person,
        website,
        {
            '@type': 'ProfilePage',
            '@id': `${absoluteUrl('/')}#profile`,
            url: absoluteUrl('/'),
            name: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            inLanguage: 'en',
            mainEntity: { '@id': person['@id'] },
            isPartOf: { '@id': website['@id'] },
        },
    ],
};

const collectionStructuredData = (name, description, path, itemList) => ({
    '@context': 'https://schema.org',
    '@graph': [
        person,
        website,
        {
            '@type': 'CollectionPage',
            '@id': `${absoluteUrl(path)}#collection`,
            url: absoluteUrl(path),
            name,
            description,
            inLanguage: 'en',
            isPartOf: { '@id': website['@id'] },
            mainEntity: itemList,
        },
        breadcrumbStructuredData([
            { name: 'Home', path: '/' },
            { name, path },
        ]),
    ],
});

const getProjectStructuredData = (project) => ({
    '@context': 'https://schema.org',
    '@graph': [
        person,
        website,
        projectStructuredData(project),
        breadcrumbStructuredData([
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: project.projectName, path: `/projects/${project.slug}` },
        ]),
    ],
});

const projectsDescription =
    'Explore software engineering projects by Theodoros Chalkidis across full-stack development, distributed systems, real-time applications, compilers, databases, and graphics.';
const appsDescription =
    'Explore standalone web applications by Theodoros Chalkidis, including a real-time multiplayer Steam game recommendation and voting experience.';

const publicSeoRoutes = [
    {
        path: '/',
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        structuredData: homeStructuredData,
        index: true,
    },
    {
        path: '/about',
        title: 'About Theodoros Chalkidis — Software Engineer',
        description:
            'Learn about Theodoros Chalkidis, a software engineer in Heraklion focused on product engineering, full-stack architecture, distributed systems, and technical ownership.',
        structuredData: {
            '@context': 'https://schema.org',
            '@graph': [
                person,
                website,
                {
                    '@type': 'ProfilePage',
                    url: absoluteUrl('/about'),
                    name: 'About Theodoros Chalkidis',
                    mainEntity: { '@id': person['@id'] },
                    isPartOf: { '@id': website['@id'] },
                },
                breadcrumbStructuredData([
                    { name: 'Home', path: '/' },
                    { name: 'About', path: '/about' },
                ]),
            ],
        },
        index: true,
    },
    {
        path: '/projects',
        title: 'Software Engineering Projects — Theodoros Chalkidis',
        description: projectsDescription,
        structuredData: collectionStructuredData(
            'Software Engineering Projects',
            projectsDescription,
            '/projects',
            projectItemList
        ),
        index: true,
    },
    {
        path: '/apps',
        title: 'Web Applications — Theodoros Chalkidis',
        description: appsDescription,
        structuredData: collectionStructuredData('Web Applications', appsDescription, '/apps', {
            '@type': 'ItemList',
            numberOfItems: 1,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'What the Hell Are We Playing?',
                    url: buildUrl('gamefinder'),
                },
            ],
        }),
        index: true,
    },
    ...projects.map((project) => ({
        path: `/projects/${project.slug}`,
        title: `${project.projectName} — Software Project by Theodoros Chalkidis`,
        description: project.description,
        image: project.socialImage || DEFAULT_IMAGE_PATH,
        imageAlt: `${project.projectName} project by Theodoros Chalkidis`,
        type: 'article',
        structuredData: getProjectStructuredData(project),
        index: true,
    })),
    {
        path: '/forbidden',
        title: 'Forbidden — Theodoros Chalkidis',
        description: 'This page is not available with the current access permissions.',
        robots: NO_INDEX_ROBOTS,
        index: false,
    },
    {
        path: '/unauthorized',
        title: 'Unauthorized — Theodoros Chalkidis',
        description: 'Authentication is required to access this page.',
        robots: NO_INDEX_ROBOTS,
        index: false,
    },
    {
        path: '/not-available',
        title: 'Not Available — Theodoros Chalkidis',
        description: 'The requested application is not currently available.',
        robots: NO_INDEX_ROBOTS,
        index: false,
    },
    {
        path: '/not-found',
        output: '404.html',
        title: 'Page Not Found — Theodoros Chalkidis',
        description: 'The requested page could not be found.',
        robots: NO_INDEX_ROBOTS,
        index: false,
    },
];

const getSeoForPath = (path) =>
    publicSeoRoutes.find((route) => route.path === path) || publicSeoRoutes[0];

export {
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE_PATH,
    DEFAULT_ROBOTS,
    DEFAULT_TITLE,
    NO_INDEX_ROBOTS,
    SITE_NAME,
    absoluteImageUrl,
    absoluteUrl,
    getProjectStructuredData,
    getSeoForPath,
    publicSeoRoutes,
};
