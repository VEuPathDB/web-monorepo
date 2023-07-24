export default function smallMenuItems(props, defaultMenuItems) {
  return [
    {
      id: 'about',
      text: 'About OrthoMCL',
      webAppUrl: '/about.do',
      children: [
        {
          id: 'current-release',
          text: 'Current Release',
          webAppUrl: '/about.do#release',
        },
        {
          id: 'methods',
          text: 'Methods',
          webAppUrl: '/about.do#methods',
        },
        {
          id: 'background',
          text: 'Background',
          webAppUrl: '/about.do#background',
        },
        {
          id: 'faq',
          text: 'Frequently Asked Questions',
          webAppUrl: '/about.do#faq',
        },
        {
          id: 'software',
          text: 'Software',
          webAppUrl: '/about.do#software',
        },
        {
          id: 'publications',
          text: 'Publications mentioning OrthoMCL',
          url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en',
        },
        {
          id: 'acknowledgements',
          text: 'Acknowledgements',
          webAppUrl: '/about.do#acknowledge',
        },
        {
          id: 'brochure',
          text: 'EuPathDB Brochure',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer.pdf',
        },
        {
          id: 'usage',
          text: 'Website Usage Statistics',
          url: '/proxystats/awstats.pl?config=orthomcl.org',
        },
        {
          id: 'contact',
          text: 'Contact',
          webAppUrl: '/about.do#contact',
        },
      ],
    },
    {
      id: 'help',
      text: 'Help',
      children: [
        {
          id: 'tutorials',
          text: 'Web Tutorials',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.Tutorials',
        },
        {
          id: 'workshop',
          text: 'EuPathDB Workshop',
          url: 'http://workshop.eupathdb.org/current/',
        },
        {
          id: 'exercises',
          text: 'Exercises from Workshop',
          url: 'http://workshop.eupathdb.org/current/index.php?page=schedule',
        },
        {
          id: 'glossary',
          text: "NCBI's Glossary of Terms",
          url: 'http://www.genome.gov/Glossary/',
        },
        {
          text: 'Contact Us',
          url: '/a/app/contact-us',
          target: '_blank',
        },
      ],
    },
    defaultMenuItems.profileOrLogin,
    defaultMenuItems.registerOrLogout,
    defaultMenuItems.contactUs,
    defaultMenuItems.twitter,
    defaultMenuItems.facebook,
    defaultMenuItems.youtube,
  ];
}
