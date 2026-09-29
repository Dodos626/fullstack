const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
};

const sendEmail = () => {
    window.location = 'mailto:chlktheo@gmail.com';
};

export { openInNewTab, sendEmail };
