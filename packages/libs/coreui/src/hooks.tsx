import { useEffect } from 'react';

export const useCoreUIFonts = () =>
  useEffect(() => {
    const linkOne = document.createElement('link');
    linkOne.setAttribute('href', 'https://fonts.googleapis.com');
    linkOne.setAttribute('rel', 'preconnect');

    const linkTwo = document.createElement('link');
    linkTwo.setAttribute('href', 'https://fonts.gstatic.com');
    linkTwo.setAttribute('rel', 'preconnect');
    linkTwo.setAttribute('crossorigin', 'true');

    const linkThree = document.createElement('link');
    linkThree.setAttribute(
      'href',
      'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap'
    );

    linkThree.setAttribute('rel', 'stylesheet');
    document.head.appendChild(linkThree);
  }, []);
