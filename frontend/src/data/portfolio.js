const experience = [
    {
        companyName: 'Who Cares Software',
        position: 'Product Owner',
        place: 'Remote',
        years: '2026 - Present',
        bullets: [
            'Led design and development of a full-stack web and mobile application, delivering tailored solutions for client workflows',
            'Defined system architecture and technology strategy across frontend, backend, and mobile platforms',
            'Owned client discovery, MVP planning, feature prioritization, and technical decision-making',
        ],
        link: 'https://whocaressoftware.com/',
    },
    {
        companyName: 'Alpha Omega Zed',
        position: 'Software Engineer',
        place: 'Heraklion, Greece (Hybrid)',
        years: '2023 - 2026',
        bullets: [
            'Built OCR/NLP digitization pipelines for large-scale document processing',
            'Architected distributed microservices handling petabyte-scale datasets',
            'Created reusable frontend infrastructure accelerating delivery velocity',
            'Mentored a team of 5 engineers',
        ],
        link: 'https://alphaomegazed.com/',
    },
    {
        companyName: 'Ballista, Carrera Group, Inc.',
        position: 'Junior Software Engineer',
        place: 'Remote',
        years: '2022 - 2023',
        bullets: [
            'Developed Scala-based CQL transpiler',
            'Designed parsing/transformation pipeline',
            'Collaborated on testing and reviews',
        ],
        link: 'https://www.linkedin.com/company/carrera-group-inc/posts/?feedView=all',
    },
];

const education = [
    {
        universityName: 'Master Of Science',
        position: 'Computer Science Department',
        place: 'University of Crete, Heraklion, Greece',
        years: '02/2024 - 02/2026',
        bullets: [
            'Major: Software Engineering and Programming Languages',
            'Minor: High Performance Distributed Systems',
            'CGPA 9.3/10',
        ],
        link: 'https://www.csd.uoc.gr/',
    },
    {
        universityName: 'Bachelor of Science',
        position: 'Computer Science Department',
        place: 'University of Crete, Heraklion, Greece',
        years: '09/2019 - 06/2023',
        bullets: ['Specialization: Software Engineering and Programming Languages', 'CGPA 8.05/10'],
        link: 'https://www.csd.uoc.gr/',
    },
];

const projects = [
    {
        slug: 'abadar',
        projectName: 'ABADAR',
        summary: 'A distributed, event-driven market simulation and trading platform.',
        description:
            'A real-time electronic exchange simulation with deterministic order matching, durable event processing, replayable projections, and live market updates.',
        details: [
            'ABADAR models the core infrastructure of a modern electronic exchange through a deterministic price-time-priority matching engine and per-symbol workers.',
            'Its ASP.NET Core backend combines PostgreSQL persistence, a transactional outbox, Kafka producers and consumers, idempotent projections, JWT authorization, SignalR updates, replay controls, and administration APIs.',
            'A Next.js frontend provides authentication, user administration, profile editing, market history, simulation controls, event status, and projection replay tools.',
        ],
        highlights: [
            'Built a deterministic event-driven matching engine with recovery and reset support',
            'Implemented durable Kafka workflows with a transactional outbox and replayable projections',
            'Containerized the exchange, PostgreSQL, Kafka, backend, and frontend with Docker Compose',
        ],
        technologies: ['C#', 'ASP.NET Core', 'Next.js', 'Kafka', 'PostgreSQL', 'Docker'],
        github: 'https://github.com/Dodos626/Abadar',
        selected: true,
    },
    {
        slug: 'gahenn-plains',
        projectName: 'Gahenn-Plains',
        summary: 'A configurable real-time orbital simulation built in Unity.',
        description:
            'A configurable solar system simulation in Unity, implementing custom physics logic for orbital mechanics, system scaling, and real-time visualization.',
        details: [
            'The project explores how orbital systems can be represented clearly while preserving useful physical behaviour and real-time interaction.',
            'It includes configurable celestial bodies, custom orbital calculations, scale handling, and visual feedback designed for experimentation.',
        ],
        highlights: [
            'Implemented custom orbital and gravity-related simulation logic',
            'Designed configurable systems for celestial bodies and scene scaling',
            'Balanced simulation accuracy with real-time Unity performance',
        ],
        technologies: ['Unity', 'C#'],
        github: 'https://github.com/Dodos626/Gahenn-Plains',
        selected: true,
    },
    {
        slug: 'sonic-game',
        projectName: 'Sonic Game',
        summary: 'A collaborative C++ game project with a custom engine and shaders.',
        description:
            'Developed collaboratively from scratch with a C++ engine, shaders, and advanced optimization techniques.',
        details: [
            'This team project recreated core Sonic-style movement and gameplay while building the supporting engine systems directly in C++.',
            'The work focused on responsive gameplay, rendering, shaders, asset handling, and performance-sensitive systems.',
        ],
        highlights: [
            'Collaborated on a custom C++ game engine',
            'Implemented rendering and shader-driven visual effects',
            'Applied performance optimizations for real-time gameplay',
        ],
        technologies: ['C++'],
        github: 'https://github.com/SoultatosStefanos/Sonic-the-Hedgehog',
        selected: true,
    },
    {
        slug: 'alpha-language-compiler',
        projectName: 'Alpha Language Compiler and Virtual Machine',
        summary: 'A compiler and virtual machine for a JavaScript-like language.',
        description:
            'JavaScript-like programming language with garbage collection, developed in C using Yacc and Lex.',
        details: [
            'The project implements the main stages of a programming-language toolchain, from lexical analysis and parsing to intermediate code and virtual-machine execution.',
            'It was developed as a systems-focused project with attention to language semantics, memory management, scopes, and runtime behaviour.',
        ],
        highlights: [
            'Built lexical and syntax analysis with Lex and Yacc/Bison',
            'Implemented intermediate-code generation and virtual-machine execution',
            'Added runtime memory management and garbage-collection concepts',
        ],
        technologies: ['C++', 'Yacc', 'Bison'],
        github: 'https://github.com/aangelakis/AlphaCompiler',
        selected: true,
    },
    {
        slug: 'full-stack-portfolio-platform',
        projectName: 'A full stack application',
        summary: 'This portfolio and role-aware full-stack application platform.',
        description:
            'The application you are currently browsing, containing my CV and other small applications for learning purposes.',
        details: [
            'This website combines a public portfolio with user, guest, and administrator applications selected through subdomains.',
            'It includes a React and Vite frontend, an Express API, PostgreSQL persistence, rotating JWT sessions, role-aware access control, Docker development, and automated deployment.',
        ],
        highlights: [
            'Designed one frontend that resolves multiple subdomain applications',
            'Implemented access-token refresh, role-aware routing, and secure session handling',
            'Added responsive portfolio components, Docker workflows, and production deployment',
        ],
        technologies: ['JavaScript', 'React', 'Node'],
        github: 'https://github.com/Dodos626/fullstack',
        selected: true,
    },
    {
        slug: 'banking-database-system',
        projectName: 'Databases',
        summary: 'A functioning banking-style information system backed by SQL.',
        description: 'A university project building a functioning banking-like system.',
        details: [
            'The project models common banking entities and workflows using a relational database and a Java application layer.',
            'Its focus was database design, SQL querying, data integrity, and connecting application behaviour to persistent state.',
        ],
        highlights: [
            'Designed a normalized relational data model',
            'Implemented transactional banking-style workflows',
            'Connected Java application logic to SQL persistence',
        ],
        technologies: ['Java', 'SQL'],
        github: 'https://github.com/Dodos626/fullstack',
        selected: false,
    },
    {
        slug: 'doctor-appointment-platform',
        projectName: 'Web dev class',
        summary: 'A multi-role doctor appointment platform and web-development coursework.',
        description:
            'A full-stack doctor appointment platform with multiple roles, plus the exercises completed for the course.',
        details: [
            'The application supports different user roles and the workflows needed to manage doctors, patients, and appointments.',
            'It was created alongside a broader collection of web-development exercises covering frontend, backend, and database fundamentals.',
        ],
        highlights: [
            'Implemented role-specific application workflows',
            'Built appointment and user-management features',
            'Integrated Java, SQL, HTML, and JavaScript',
        ],
        technologies: ['Java', 'SQL', 'HTML', 'JavaScript'],
        github: 'https://github.com/Dodos626/fullstack',
        selected: false,
    },
];

export { education, experience, projects };
