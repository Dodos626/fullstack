const openInNewTab = (url) => {
    window.open(url, '_blank');
};

const sendEmail = () => {
    window.location = 'mailto:chlktheo@gmail.com';
};

export { openInNewTab, sendEmail };
