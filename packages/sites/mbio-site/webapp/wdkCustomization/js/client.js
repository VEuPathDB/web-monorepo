import 'eupathdb/wdkCustomization/css/client.css';
import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';

initialize({
  isPartOfEuPathDB: false,
  flattenSearches: true,
  includeQueryGrid: false,
  additionalMenuEntries: () => [
    {
      id: 'datasets',
      text: 'Data Sets',
      route: 'search/dataset/AllDatasets/result'
    }
  ],
  smallMenuEntries: ({ projectId }) => [
    {
      text: `About ${projectId}`,
      webAppUrl: `about.jsp`,
      children: [
        {
          text: `What is it?`,
          webAppUrl: `about.jsp#what-is-it`
        },
        {
          text: `How was it made?`,
          webAppUrl: `about.jsp#how-was-it-made`
        },
        {
          text: `How do I use it? <i style="font-size: smaller;" class="fa fa-external-link">&nbsp;</i>`,
          url: `https://docs.google.com/document/u/1/d/1a_9lPf5lV0fTW1VcA48pGsnFAcwhMOWqCTQlyHEVoAQ/pub`
        },
        {
          text: `Who is behind this?`,
          webAppUrl: `about.jsp#who-is-behind-this`
        }
      ]
    },
    {
      text: `Help`,
      children: [
        {
          text: `Reset ${projectId} Session`,
          webAppUrl: `resetSession.jsp`
        },
        {
          text: `Contact Us`,
          webAppUrl: `contact.do`
        }
      ]
    }
  ]
});
