/** Additional small menu entries */
export default ({ projectId }) => [
  {
    text: `About ${projectId}`,
    children: [
      {
        text: `What is ${projectId}?`,
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About'
      },
      {
        text: 'Publications on EuPathDB sites',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs'
      },
      {
        liClassName: 'eupathdb-SmallMenuDivider',
        text: `------ Data in ${projectId}`
      },
      {
        text: 'Organisms',
        webAppUrl: '/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes'
      },
      {
        text: `${projectId} Gene Metrics`,
        webAppUrl: '/processQuestion.do?questionFullName=OrganismQuestions.GeneMetrics'
      },
      {
        liClassName: 'eupathdb-SmallMenuDivider',
        text: `------ Submitting data to ${projectId}`
      },
      {
        text: 'How to submit data to us',
        webAppUrl: '/dataSubmission.jsp'
      },
      {
        text: 'EuPathDB Data Submission & Release Policies',
        url: '/EuPathDB_datasubm_SOP.pdf'
      },
      {
        liClassName: 'eupathdb-SmallMenuDivider',
        text: '------ Usage and Citation'
      },
      {
        text: 'How to site us',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#citing'
      },
      {
        text: 'Citing Data Providers',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#citingproviders'
      },
      {
        text: 'Publications that Use our Resources',
        url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en'
      },
      {
        text: 'Data Access Policy',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#use'
      },
      {
        liClassName: 'eupathdb-SmallMenuDivider',
        text: '------ Who are we?'
      },
      {
        text: 'Scientific Working Group',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.AboutAll#swg'
      },
      {
        text: 'Scientific Advisory Team',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#advisors'
      },
      {
        text: 'Acknowledgements',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.AboutAll#acks'
      },
      {
        text: 'Funding',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#funding'
      },
      {
        text: 'EuPathDB Brochure',
        url: 'http://eupathdb.org/tutorials/eupathdbFlyer.pdf'
      },
      {
        text: 'EuPathDB Brochure in Chinese',
        url: 'http://eupathdb.org/tutorials/eupathdbFlyer_Chinese.pdf'
      },
      {
        liClassName: 'eupathdb-SmallMenuDivider',
        text: '------ Technical'
      },
      {
        text: 'Accessibility VPAT',
        url: '/documents/EuPathDB_Section_508.pdf'
      },
      {
        text: 'EuPathDB Infrastructure',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.Infrastructure'
      },
      {
        text: 'Website Usage Statistics',
        url: '/awstats/awstats.pl'
      }
    ]
  },
  {
    text: 'Help',
    children: [
      {
        text: `Reset ${projectId} Session`,
        webAppUrl: '/resetSession.jsp',
        title: 'Login first to keep your work.'
      },
      {
        text: 'YouTube Tutorials Channel',
        url: 'http://www.youtube.com/user/EuPathDB/videos?sort=dd&flow=list&view=1'
      },
      {
        text: 'Web Tutorials',
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.Tutorials'
      },
      {
        text: 'EuPathDB Workshop',
        url: 'http://workshop.eupathdb.org/current/'
      },
      {
        text: 'Exercises from Workshop',
        url: 'http://workshop.eupathdb.org/current/index.php?page=schedule'
      },
      {
        text: `NCBI's Glossary of Terms`,
        url: 'http://www.genome.gov/Glossary/'
      },
      {
        text: `Our Glossary`,
        webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.Glossary'
      },
      {
        text: 'Contact Us',
        url: '/contact.do',
        target: '_blank'
      }
    ]
  }
]
