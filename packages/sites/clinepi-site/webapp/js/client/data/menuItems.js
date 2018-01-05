import studies from './studies.json';
import { menuItemsFromStudies } from 'Client/App/Studies/StudyUtils';

export default function menuItems (webappUrl) {

  const localStudies = studies.map(study => {
    const { searchUrls } = study;
    const newSearchUrls = {};
    for (let key in searchUrls) {
      newSearchUrls[key] = (webappUrl ? webappUrl : '') + searchUrls[key];
    };
    return Object.assign({}, study, { searchUrls: newSearchUrls });
  });

  return [
    {
      id: 'search',
      text: 'New Search',
      children: ({ appUrl }) => menuItemsFromStudies(localStudies)
    },
    {
      id: 'strategies',
      text: 'My Strategies',
      appUrl: '/showApplication.do'
    },
    {
      id: 'studies',
      text: 'Studies',
      appUrl: '/app/record/dataset/DS_841a9f5259'
    },
    // {
    //   id: 'help',
    //   text: 'Help',
    //   appUrl: ''
    // },
    {
      id: 'about',
      text: 'About',
      children: ({ projectId }) => ([
        // {
        //   className: 'division',
        //   text: `Submitting data to ${projectId}`
        // },
        // {
        //   text: 'How to submit data to us',
        //   appUrl: '/dataSubmission.jsp'
        // },
        // {
        //   text: 'EuPathDB Data Submission & Release Policies',
        //   url: '/EuPathDB_datasubm_SOP.pdf'
        // },
        {
          className: 'division',
          text: 'Usage and Citation'
        },
        {
          text: 'Publications that Use our Resources',
          url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=ClinEpiDB+OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en'
        },
        // {
        //   text: 'Data Access Policy',
        //   appUrl: '/showXmlDataContent.do?name=XmlQuestions.About#use'
        // },
        {
          text: 'Website Privacy Policy',
          url: '/documents/EuPathDB_Website_Privacy_Policy.shtml'
        },
        {
          className: 'division',
          text: 'Who are we?'
        },
        // {
        //   text: 'Scientific Working Group',
        //   appUrl: '/showXmlDataContent.do?name=XmlQuestions.AboutAll#swg'
        // },
        // {
        //   text: 'Scientific Advisory Team',
        //   appUrl: '/showXmlDataContent.do?name=XmlQuestions.About#advisors'
        // },
        // {
        //   text: 'Acknowledgements',
        //   appUrl: '/showXmlDataContent.do?name=XmlQuestions.AboutAll#acks'
        // },
        // {
        //   text: 'Funding',
        //   appUrl: '/showXmlDataContent.do?name=XmlQuestions.About#funding'
        // },
        {
          text: 'EuPathDB Brochure',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer.pdf'
        },
        {
          text: 'EuPathDB Brochure in Chinese',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer_Chinese.pdf'
        },
        {
          className: 'division',
          text: 'Technical'
        },
        {
          text: 'Accessibility VPAT',
          url: '/documents/EuPathDB_Section_508.pdf'
        },
        // {
        //   text: 'EuPathDB Infrastructure',
        //   appUrl: '/showXmlDataContent.do?name=XmlQuestions.Infrastructure'
        // },
        {
          text: 'Website Usage Statistics',
          url: '/awstats/awstats.pl'
        }
      ])
    },
    {
      id: 'community',
      text: 'Community',
      children: [
        // {
        //   text: 'EuPathDB Data Submission & Release Policies',
        //   url: '/EuPathDB_datasubm_SOP.pdf'
        // },
        // {
        //   text: 'Upcoming Events',
        //   appUrl: '/communityEvents.jsp'
        // },
        // {
        //   text: 'Related Sites',
        //   appUrl: '/showXmlDataContent.do?name=XmlQuestions.ExternalLinks'
        // },
        {
          text: 'Public Strategies',
          appUrl: '/showApplication.do?tab=public_strat'
        }
      ]
    }
  ];
};
