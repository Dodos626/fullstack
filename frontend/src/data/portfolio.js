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
        projectName: 'Gahenn-Plains',
        description:
            'A configurable solar system simulation in Unity, implementing custom physics logic for orbital mechanics, system scaling, and real-time visualization.',
        technologies: ['Unity', 'C#'],
        github: 'https://github.com/Dodos626/Gahenn-Plains',
        selected: true,
    },
    {
        projectName: 'Sonic Game',
        description:
            'Developed collaboratively from scratch with a C++ engine, shaders, and advanced optimization techniques.',
        technologies: ['C++'],
        github: 'https://github.com/SoultatosStefanos/Sonic-the-Hedgehog',
        selected: true,
    },
    {
        projectName: 'Alpha Language Compiler and Virtual Machine',
        description:
            'JavaScript-like programming language with garbage collection, developed in C using Yacc and Lex.',
        technologies: ['C++', 'Yacc', 'Bison'],
        github: 'https://github.com/aangelakis/AlphaCompiler',
        selected: true,
    },
    {
        projectName: 'A full stack application',
        description:
            'The application you are currently browsing, containing my CV and other small applications for learning purposes.',
        technologies: ['JavaScript', 'React', 'Node'],
        github: 'https://github.com/Dodos626/fullstack',
        selected: true,
    },
    {
        projectName: 'Databases',
        description: 'A university project building a functioning banking-like system.',
        technologies: ['Java', 'SQL'],
        github: 'https://github.com/Dodos626/fullstack',
        selected: false,
    },
    {
        projectName: 'Web dev class',
        description:
            'A full-stack doctor appointment platform with multiple roles, plus the exercises completed for the course.',
        technologies: ['Java', 'SQL', 'HTML', 'JavaScript'],
        github: 'https://github.com/Dodos626/fullstack',
        selected: false,
    },
];

export { education, experience, projects };
