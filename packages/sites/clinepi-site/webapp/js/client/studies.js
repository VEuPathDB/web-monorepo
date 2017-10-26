// This drives the menu on the homepage. Currenly, only one study can be
// active.
export default [
  { category: 'malaria', name: 'Ugandan ICEMR (PRISM)' },
  { category: 'malaria', name: 'Amazonian ICEMR' },
  { category: 'malaria', name: 'Indian ICEMR' },
  { category: 'malaria', name: <b>...</b> },
  {
    category: 'enteric',
    name: 'MAL-ED',
    route: 'record/dataset/DS_61ac5d073c',
    about: (
      <span>
        The MAL-ED project is a multinational and multidisciplinary study designed to elucidate the relationship between enteric pathogens, malnutrition, gut physiology, physical growth, cognitive development and immune responses, in infants and children up to 2 yr of age, in resource-poor environments. <em>Clin Infect Dis</em> <b>59S4:</b>193-206 (2014) PMID 235305287.
      </span>
    )
  },
  {
    category: 'enteric',
    name: 'GEMS',
    route: 'record/dataset/DS_841a9f5259',
    active: true,
    about: (
      <span>
        The Global Enterics Multi-Center Study (GEMS), funded by the Bill and Melinda Gates Foundation, was a prospective, multi-center, case-control study of acute diarrhea in children 0-59 months of age. It was conducted at seven sites in Africa and Asia, representing developing countries with moderate or high infant mortality rates; rural or urban settings; and high or low HIV and malaria prevalences. Each site recruited up to 880 children with severe diarrhea from hospitals or ambulatory facilities and 880 matched community controls in each of three age strata: 0-11 months, 12-23 months and 24-59 months.
      </span>
    )
  },
  { category: 'enteric', name: <b>...</b> }
];
