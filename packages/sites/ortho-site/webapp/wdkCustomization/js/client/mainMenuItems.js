export default function mainMenuItems(props, defaultMenuItems) {
  return [
    defaultMenuItems.home,
    defaultMenuItems.search,
    defaultMenuItems.strategies,
    defaultMenuItems.basket,
    {
      id: 'tools',
      text: 'Tools',
      children: [
        {
          id: 'blast',
          text: 'BLAST',
          webAppUrl:
            '/showQuestion.do?questionFullName=SequenceQuestions.ByBlast',
        },
        {
          id: 'assign-to-groups',
          text: 'Assign your proteins to groups',
          webAppUrl: '/proteomeUpload.do',
        },
        {
          id: 'download-software',
          text: 'Download OrthoMCL software',
          url: '/common/downloads/software',
        },
        {
          id: 'web-services',
          text: 'Web Services',
          webAppUrl: '/serviceList.jsp',
        },
        {
          id: 'pubs',
          text: 'Publications mentioning OrthoMCL',
          url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en',
        },
      ],
    },
    {
      id: 'data-summary',
      text: 'Data Summary',
      children: [
        {
          id: 'genome-statistics',
          text: 'Genome Statistics',
          webAppUrl: '/getDataSummary.do?summary=release',
        },
        {
          id: 'genome-sources',
          text: 'Genome Sources',
          webAppUrl: '/getDataSummary.do?summary=data',
        },
      ],
    },
    {
      id: 'downloads',
      text: 'Downloads',
      url: '/common/downloads',
    },
    {
      id: 'community',
      text: 'Community',
      children: [
        {
          id: 'public-strats',
          text: 'Public Strategies',
          webAppUrl: '/showApplication.do?tab=public_strat',
        },
        {
          id: 'twitter',
          text: 'Follow us on Twitter!',
          url: 'https://twitter.com/EuPathDB',
          target: '_blank',
        },
        {
          id: 'facebook',
          text: 'Follow us on Facebook!',
          url: 'https://facebook.com/pages/EuPathDB/133123003429972',
          target: '_blank',
        },
        {
          id: 'youtube',
          text: 'Follow us on YouTube!',
          url: 'https://youtube.com/user/EuPathDB/videos?sort=dd&flow=list&view=1',
          target: '_blank',
        },
      ],
    },
    defaultMenuItems.favorites,
  ];
}
