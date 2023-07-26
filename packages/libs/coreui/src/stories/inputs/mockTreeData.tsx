export const tree = {
  field: {
    term: '@@root@@',
    display: '@@root@@',
  },
  children: [
    {
      field: {
        term: 'entity:PCO_0000024',
        display: 'Household',
      },
      children: [
        {
          field: {
            display: 'Geographic location',
            isRange: false,
            parent: 'entity:PCO_0000024',
            precision: 1,
            term: 'PCO_0000024/GAZ_00000448',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Country',
                isRange: false,
                parent: 'PCO_0000024/GAZ_00000448',
                precision: 1,
                term: 'PCO_0000024/ENVO_00000009',
                type: 'string',
                variableName: '["country"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Settlement',
                isRange: false,
                parent: 'PCO_0000024/GAZ_00000448',
                precision: 1,
                term: 'PCO_0000024/EUPATH_0022001',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::ramal"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Settlement, generalized',
                isRange: false,
                parent: 'PCO_0000024/GAZ_00000448',
                precision: 1,
                term: 'PCO_0000024/EUPATH_0022267',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::ramal2"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Household vector intervention',
            isRange: false,
            parent: 'entity:PCO_0000024',
            precision: 1,
            term: 'PCO_0000024/EUPATH_0000341',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Received ITN',
                isRange: false,
                parent: 'PCO_0000024/EUPATH_0000341',
                precision: 1,
                term: 'PCO_0000024/EUPATH_0022121',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::itn"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'ITN bednet count',
                isRange: true,
                parent: 'PCO_0000024/EUPATH_0000341',
                precision: 1,
                term: 'PCO_0000024/EUPATH_0041014',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::itn_qtd"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
      ],
    },
    {
      field: {
        term: 'entity:EUPATH_0000776',
        display: 'Household repeated measure',
      },
      children: [
        {
          field: {
            display: 'Household observation details',
            isRange: false,
            parent: 'entity:EUPATH_0000776',
            precision: 1,
            term: 'EUPATH_0000776/EUPATH_0011995',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Household study timepoint',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0011995',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0044122',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::wave"]',
                isFeatured: true,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Dwelling characteristics',
            isRange: false,
            parent: 'entity:EUPATH_0000776',
            precision: 1,
            term: 'EUPATH_0000776/EUPATH_0000303',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Floor material',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000303',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0000006',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::piso"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Wall material',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000303',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0000009',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::par"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Roof material',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000303',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0000003',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::cob"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Room count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000303',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0011593',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::com"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Bed count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000303',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022114',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::camas"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Bedroom enclosement',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000303',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022115',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::comdor"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Dwelling facilities',
            isRange: false,
            parent: 'entity:EUPATH_0000776',
            precision: 1,
            term: 'EUPATH_0000776/EUPATH_0000302',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Garbage disposal',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000302',
                precision: 1,
                term: 'EUPATH_0000776/ENVO_01001260',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::lixo"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Waste disposal',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000302',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0000596',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Sanitation system',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000596',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0022245',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::excreta"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
          ],
        },
        {
          field: {
            display: 'Household water',
            isRange: false,
            parent: 'entity:EUPATH_0000776',
            precision: 1,
            term: 'EUPATH_0000776/EUPATH_0000731',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Water source',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000731',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0021093',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::agua"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Drinking water treatment method',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000731',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0000700',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::tratagua"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Socioeconomic factors',
            isRange: false,
            parent: 'entity:EUPATH_0000776',
            precision: 1,
            term: 'EUPATH_0000776/EUPATH_0000304',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Persons living in house count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0000019',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::nummorad"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Socioeconomic status',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0011932',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Household wealth index, numerical',
                    isRange: true,
                    parent: 'EUPATH_0000776/EUPATH_0011932',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0000014',
                    type: 'number',
                    variableName: '["icemr1_brazil_hh_05jul18_st::i_riqueza"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
            {
              field: {
                display: 'Assets',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0000144',
                type: 'multiFilter',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Car or truck',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0000171',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::carro"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Cats',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0022028',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::gato"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Chainsaw',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0022257',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::motosser"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Dogs',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0022027',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::cachorro"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Generator',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0022256',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::gerador"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Motorcycle or scooter',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/ENVO_01000615',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::motocicl"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Radio',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/ENVO_01000577',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::radio"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Shotgun',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0022255',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::espingar"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Sofa',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/ENVO_01000588',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::sofa"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Television',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/ENVO_01000579',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::tela"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Well',
                    isRange: false,
                    parent: 'EUPATH_0000776/EUPATH_0000144',
                    precision: 1,
                    term: 'EUPATH_0000776/EUPATH_0022258',
                    type: 'string',
                    variableName: '["icemr1_brazil_hh_05jul18_st::poco"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
            {
              field: {
                display: 'Bicycle count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022266',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::biciclet"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Cattle count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022195',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::bovinos"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Chicken count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022197',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::galinhas"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Duck count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022198',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::patos"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Horse count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022196',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::cavalos"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Pig count',
                isRange: true,
                parent: 'EUPATH_0000776/EUPATH_0000304',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022199',
                type: 'integer',
                variableName: '["icemr1_brazil_hh_05jul18_st::porcos"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Household vector intervention',
            isRange: false,
            parent: 'entity:EUPATH_0000776',
            precision: 1,
            term: 'EUPATH_0000776/EUPATH_0000341',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'When received ITN',
                isRange: false,
                parent: 'EUPATH_0000776/EUPATH_0000341',
                precision: 1,
                term: 'EUPATH_0000776/EUPATH_0022122',
                type: 'string',
                variableName: '["icemr1_brazil_hh_05jul18_st::itn_mes"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
      ],
    },
    {
      field: {
        term: 'entity:EUPATH_0000096',
        display: 'Participant',
      },
      children: [
        {
          field: {
            display: 'Administrative information',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0010035',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Age at enrollment',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0010035',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0000120',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::idade_en"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Enrollment date',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0010035',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0000151',
                type: 'date',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::dtentr"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Enrollment study period',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0010035',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022166',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::cortentr"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time living in survey area',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0010035',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022162',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::v471_a"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Demographics',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0010981',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Participant wealth index',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022265',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::scoreriq"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Sex',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/PATO_0000047',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::sexo"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Birth date',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/EFO_0004950',
                type: 'date',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::datanasc2"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Birth place',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0012417',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::localnas"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Participant wealth index categorization',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022246',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::nscoreri"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Education level',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/OMRSE_00002045',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::grau"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'School year',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022105',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::serie"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Total education',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022103',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::anosinst"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Literacy level',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0010981',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022104',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::instrucao"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Employment',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0000342',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Occupation',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0000342',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0000359',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::ocupa"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Occupation location',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0000342',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022116',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::lococupa"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Occupation 2',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0000342',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0000355',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::ocupb"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Occupation 2 location',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0000342',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022117',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::lococupb"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Clinical history',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/OGMS_0000015',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Medical history',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0042161',
                type: 'multiFilter',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Asthma or bronchitis',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022106',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::asmabron"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Dengue',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022107',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::dengue"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Diabetes mellitus',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022108',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::diabetes"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Hanseniasis',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022109',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::hansenia"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Hepatitis',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022110',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::hepatite"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Hypertension',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022111',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::hiperten"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Leishmaniasis',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022113',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::leishman"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Malaria',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022112',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::jatevema"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Plasmodium falciparum malaria',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022086',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::malfalci"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Plasmodium vivax malaria',
                    isRange: false,
                    parent: 'EUPATH_0000096/EUPATH_0042161',
                    precision: 1,
                    term: 'EUPATH_0000096/EUPATH_0022087',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_participant_march2020_st::malvivax"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
            {
              field: {
                display: 'Hospitalized ever',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022080',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::internad"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization city',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022074',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::cidainta"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization city, 2',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022075',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::cidaintb"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization city, 3',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022076',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::cidaintc"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization reason',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022088',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::motinta"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization reason, 2',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022089',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::motintb"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization reason, 3',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022090',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::motintc"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization year',
                isRange: true,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022071',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::anointa"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization year, 2',
                isRange: true,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022072',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::anointb"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Hospitalization year, 3',
                isRange: true,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022073',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::anointc"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Lifetime malaria diagnoses count',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022094',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qtasmala"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria in state lived in previously',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022081',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::malar1an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria in state lived in previously, 2nd',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022082',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::malar2an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria in state lived in previously, 3rd',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022083',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::malar3an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria in state lived in previously, 4th',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022084',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::malar4an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria in state lived in previously, 5th',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022085',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::malar5an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria medication in last 30 days',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022133',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qualmed"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria thick blood smear date',
                isRange: true,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022123',
                type: 'date',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::datagota"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time since last malaria diagnosis',
                isRange: true,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0000427',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::ultimama"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria-positive blood smear treatment',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022145',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::tratamen"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Tried to treat malaria in last 30 days',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022131',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::medmala"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria treatment start date',
                isRange: true,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022268',
                type: 'date',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::iniciotr"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria treatment end date',
                isRange: true,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022135',
                type: 'date',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::termtrat"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Plasmodium species for last malaria diagnosis',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022079',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::especieu"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Condition requiring medicine',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022097',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::rempa"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Medicine',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022095',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qualrema"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Medicine frequency',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022092',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qdrema"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Condition requiring medicine, 2',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022098',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::rempb"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Medicine, 2',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022096',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qualremb"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Medicine frequency, 2',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022093',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qdremb"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Take medicine regularly',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022100',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::tomarem"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Treated for last malaria diagnosis',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022101',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::tratoult"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Treatment for malaria ongoing',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022146',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::tratmala"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Took medicine for worms in last 6 months',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022099',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::remverme"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display:
                  'Expelled worms after taking medicine in last 6 months',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022077',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::elimrem"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Expelled worms in last 6 months',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022078',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::elimverm"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Other condition',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0041060',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qualdoen"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Other medical history',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022091',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::outradoe"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Other home treatment',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022134',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::remcasei"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Other malaria treatment in last 30 days',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022136',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::tomouout"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Other malaria treatment type in last 30 days',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022132',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qrem"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Treatment for other condition ongoing',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022128',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::estaemtr"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Participant genotype',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0000306',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'ABO blood group',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0000306',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0012223',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::tiposang"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Duffy blood group',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0000306',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022163',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::duffy"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Rh blood group',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0000306',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0012224',
                type: 'string',
                variableName: '["icemr1_brazil_participant_march2020_st::rh"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Anthropometry',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0000649',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Weight',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0000649',
                precision: 1,
                term: 'EUPATH_0000096/IAO_0000414',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::peso"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Physical examination',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/OGMS_0000083',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Physical exam complete',
                isRange: false,
                parent: 'EUPATH_0000096/OGMS_0000083',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022170',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::examefis"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Personal vector intervention',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0021097',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Use bednet',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0021097',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0024142',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::usomosqu"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Use other personal vector interventions',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0021097',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022167',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::outrosmo"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Other personal vector interventions',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0021097',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022169',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qualmeto"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Activity',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0022066',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Bed time',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/NCIT_C64593',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::horadorm"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Sleep with window open',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022194',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::dormejan"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Sleep by river',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022249',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::dormerio"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Fish at river',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022253',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::pesca"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'In forest at night',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022248',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::ativmata"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Reason in forest at night',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022254',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::qualativ"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Clear new land plot',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022070',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::abrindo"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Out of bed time',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0020163',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::horaleva"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Bathing location',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022252',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::localban"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Bathing time',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022250',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::hrbanho1"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Bathing time, 2nd',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022066',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022251',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::hrbanho2"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Travel details',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/OMRSE_00000142',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Settlements visited in last 30 days',
                isRange: false,
                parent: 'EUPATH_0000096/OMRSE_00000142',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022243',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::desloc30d"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Settlements visited in last 6 months',
                isRange: false,
                parent: 'EUPATH_0000096/OMRSE_00000142',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022244',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::desloc6d"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Relocation',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0022068',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Time living in Amazon',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022160',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::temponaa"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time living in Amazon categorization',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022159',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::ntempona"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Migrant',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/SNOMEDCT_224619008',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::migrante"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time living in dwelling',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0000377',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::temponac"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time living in settlement',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0000378',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::temponal"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'First dwelling settlement',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022182',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::rama1in"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Second dwelling settlement',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022183',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::rama2md"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Third dwelling settlement',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022184',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::rama3md"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time living in state',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022161',
                type: 'number',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::temponoe"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'State lived in previously',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022177',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::estado1an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'State lived in previously, 2',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022178',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::estado2an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'State lived in previously, 3',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022179',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::estado3an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'State lived in previously, 4',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022180',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::estado4an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'State lived in previously, 5',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022181',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::estado5an"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Study period during move to 2nd dwelling',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022173',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::dom2ct"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Study period during move to 3rd dwelling',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022175',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::dom3ct"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Reside in multiple homes',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0024014',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::outracas"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in other home',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022187',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::tempoper"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Other home location',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022186',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::localout"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time per month in area',
                isRange: true,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022185',
                type: 'integer',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::diasperm"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Other home zone',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022188',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::zonaoutr"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Third household ID',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022176',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::dom3mud"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Second household ID',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0022068',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022174',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::dom2mud"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Household knowledge',
            isRange: false,
            parent: 'entity:EUPATH_0000096',
            precision: 1,
            term: 'EUPATH_0000096/EUPATH_0024219',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Bedroom characteristics',
                isRange: false,
                parent: 'EUPATH_0000096/EUPATH_0024219',
                precision: 1,
                term: 'EUPATH_0000096/EUPATH_0022120',
                type: 'string',
                variableName:
                  '["icemr1_brazil_participant_march2020_st::comdor"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
      ],
    },
    {
      field: {
        term: 'entity:EUPATH_0000738',
        display: 'Participant repeated measure',
      },
      children: [
        {
          field: {
            display: 'Observation details',
            isRange: false,
            parent: 'entity:EUPATH_0000738',
            precision: 1,
            term: 'EUPATH_0000738/EUPATH_0000310',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Age',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/OBI_0001169',
                type: 'number',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::idadeno"]',
                isFeatured: true,
              },
              children: [],
            },
            {
              field: {
                display: 'Observation date',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0004991',
                type: 'date',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::dtentrev"]',
                isFeatured: true,
              },
              children: [],
            },
            {
              field: {
                display: 'Present at visit',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022053',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::present"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Study timepoint',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/OBI_0001508',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::wave"]',
                isFeatured: true,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in January',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022151',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::jan"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in February',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022150',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::fev"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in March',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022155',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::mar"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in April',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022147',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::abr"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in May',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022154',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::mai"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in June',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022153',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::jun"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in July',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022152',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::jul"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in August',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022148',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::ago"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in September',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022158',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::set"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in October',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022157',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::out"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in November',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022156',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::nov"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Time in study area in December',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000310',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022149',
                type: 'integer',
                variableName: '["icemr1_brazil_observation_march2020_st::dez"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Clinical history',
            isRange: false,
            parent: 'entity:EUPATH_0000738',
            precision: 1,
            term: 'EUPATH_0000738/OGMS_0000015',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Malaria since last observation',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022130',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::malpac"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria since last observation date',
                isRange: true,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022125',
                type: 'date',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::dtmal1p"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria since last observation date 2',
                isRange: true,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022126',
                type: 'date',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::dtmal2p"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria since last observation date 3',
                isRange: true,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022127',
                type: 'date',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::dtmal3p"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display:
                  'Malaria since last observation date, from medical record',
                isRange: true,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022124',
                type: 'date',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::dtmal1c"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria since last observation, from medical record',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022129',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::malcad"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria treatment since last observation',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022142',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::trat1mp"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria treatment since last observation 2',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022143',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::trat2mp"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Malaria treatment since last observation 3',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022144',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::trat3mp"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display:
                  'Malaria treatment since last observation, from medical record',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022141',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::trat1mc"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display:
                  'Plasmodium species causing malaria since last observation',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022138',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::tp1malp"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display:
                  'Plasmodium species causing malaria since last observation 2',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022139',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::tp2malp"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display:
                  'Plasmodium species causing malaria since last observation 3',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022140',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::tp3malp"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display:
                  'Plasmodium species causing malaria since last observation, from medical record',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000015',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022137',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::tp1malc"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Signs and symptoms',
            isRange: false,
            parent: 'entity:EUPATH_0000738',
            precision: 1,
            term: 'EUPATH_0000738/EUPATH_0000309',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Symptoms',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0021002',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Anemia',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0021002',
                    precision: 1,
                    term: 'EUPATH_0000738/DOID_2355',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::anemia"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
            {
              field: {
                display: 'Any symptoms in last 7 days',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022237',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::sint7d"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Symptoms in the last 7 days',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0010356',
                type: 'multiFilter',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Abdominal pain',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022222',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::abdn7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Bleeding',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022236',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::sang7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Change in urine color',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022241',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::urin7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Chills',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022225',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::cala7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Cough',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022240',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::toss7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Diarrhea',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022228',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::diar7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Dizziness',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022239',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::tont7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Fever during last 7 days',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0015185',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::febr7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Headache',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022226',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::cefa7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Hypochondrium pain',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022231',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::hipo7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Jaundice',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022232',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::icte7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Joint pain',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022224',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::artr7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Loss of appetite',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022223',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::apet7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Lower back pain',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022233',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::lomb7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Mental confusion',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022227',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::cons7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Muscle aches',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022234',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::mial7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Nausea',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022235',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::naus7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Shortness of breath',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022230',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::ftar7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Sweating',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022238',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::sudo7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Vomiting',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022242',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::vomi7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Weakness',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0010356',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022229',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::fraq7d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
            {
              field: {
                display: 'Other symptoms in last 7 days',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022192',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::outr7d"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Symptoms in last 7 days order',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022190',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::ordsin"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Any symptoms in last 30 days',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022216',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::sint30d"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Symptoms in the last 30 days',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022069',
                type: 'multiFilter',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Abdominal pain',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022200',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::abdn30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Bleeding',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022215',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::sang30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Change in urine color',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022220',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::urin30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Chills',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022203',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::cala30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Cough',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022219',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::toss30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Diarrhea',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022206',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::diar30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Dizziness',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022218',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::tont30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Fever',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022207',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::febr30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Headache',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022204',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::cefa30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Hypochondrium pain',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022210',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::hipo30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Jaundice',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022211',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::icte30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Joint pain',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022202',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::artr30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Loss of appetite',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022201',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::apet30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Lower back pain',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022212',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::lomb30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Mental confusion',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022205',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::cons30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Muscle aches',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022213',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::mial30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Nausea',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022214',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::naus30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Shortness of breath',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022209',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::ftar30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Sweating',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022217',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::sudo30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Vomiting',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022221',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::vomi30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
                {
                  field: {
                    display: 'Weakness',
                    isRange: false,
                    parent: 'EUPATH_0000738/EUPATH_0022069',
                    precision: 1,
                    term: 'EUPATH_0000738/EUPATH_0022208',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::fraq30d"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
            {
              field: {
                display: 'Other symptoms in last 30 days',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022191',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::outr30d"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Symptom start date',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022189',
                type: 'date',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::inisint"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Symptom end date',
                isRange: true,
                parent: 'EUPATH_0000738/EUPATH_0000309',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022193',
                type: 'date',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::sintno"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Diagnosis',
            isRange: false,
            parent: 'entity:EUPATH_0000738',
            precision: 1,
            term: 'EUPATH_0000738/OGMS_0000073',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Malaria diagnosis',
                isRange: false,
                parent: 'EUPATH_0000738/OGMS_0000073',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0000090',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::resultto"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
        {
          field: {
            display: 'Personal vector intervention',
            isRange: false,
            parent: 'entity:EUPATH_0000738',
            precision: 1,
            term: 'EUPATH_0000738/EUPATH_0021097',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'ITN last night',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0021097',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0000216',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::uso_itn"]',
                isFeatured: false,
              },
              children: [],
            },
            {
              field: {
                display: 'Reason no ITN last night',
                isRange: false,
                parent: 'EUPATH_0000738/EUPATH_0021097',
                precision: 1,
                term: 'EUPATH_0000738/EUPATH_0022168',
                type: 'string',
                variableName:
                  '["icemr1_brazil_observation_march2020_st::pq_itn"]',
                isFeatured: false,
              },
              children: [],
            },
          ],
        },
      ],
    },
    {
      field: {
        term: 'entity:EUPATH_0000609',
        display: 'Sample',
      },
      children: [
        {
          field: {
            display: 'Laboratory test',
            isRange: false,
            parent: 'entity:EUPATH_0000609',
            precision: 1,
            term: 'EUPATH_0000609/OGMS_0000056',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Blood test',
                isRange: false,
                parent: 'EUPATH_0000609/OGMS_0000056',
                precision: 1,
                term: 'EUPATH_0000609/EUPATH_0011795',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Hemoglobin',
                    isRange: true,
                    parent: 'EUPATH_0000609/EUPATH_0011795',
                    precision: 1,
                    term: 'EUPATH_0000609/EUPATH_0000047',
                    type: 'number',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::hemog"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
            {
              field: {
                display: 'Blood microbiology test',
                isRange: false,
                parent: 'EUPATH_0000609/OGMS_0000056',
                precision: 1,
                term: 'EUPATH_0000609/OBI_0002649',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Eukaryota in blood',
                    isRange: false,
                    parent: 'EUPATH_0000609/OBI_0002649',
                    precision: 1,
                    term: 'EUPATH_0000609/EUPATH_0033307',
                    variableName: 'No Provider Label available',
                  },
                  children: [
                    {
                      field: {
                        display: 'Plasmodium in blood',
                        isRange: false,
                        parent: 'EUPATH_0000609/EUPATH_0033307',
                        precision: 1,
                        term: 'EUPATH_0000609/EUPATH_0033308',
                        variableName: 'No Provider Label available',
                      },
                      children: [
                        {
                          field: {
                            display: 'Plasmodium species, by microscopy',
                            isRange: false,
                            parent: 'EUPATH_0000609/EUPATH_0033308',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0000423',
                            type: 'string',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::gotares"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display: 'Plasmodium species, by qPCR',
                            isRange: false,
                            parent: 'EUPATH_0000609/EUPATH_0033308',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0000433',
                            type: 'string',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::pcrveft"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display:
                              'Plasmodium species, by microscopy and qPCR',
                            isRange: false,
                            parent: 'EUPATH_0000609/EUPATH_0033308',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022171',
                            type: 'string',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::consens"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display: 'Plasmodium species, by venous blood qPCR',
                            isRange: false,
                            parent: 'EUPATH_0000609/EUPATH_0033308',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022262',
                            type: 'string',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::pcrve"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display: 'Plasmodium species, by FTA qPCR',
                            isRange: false,
                            parent: 'EUPATH_0000609/EUPATH_0033308',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022259',
                            type: 'string',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::pcrft"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display: 'Plasmodium gametocytes, by qPCR',
                            isRange: false,
                            parent: 'EUPATH_0000609/EUPATH_0033308',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022172',
                            type: 'string',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::gametoci"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  field: {
                    display: 'Raw test result for blood',
                    isRange: false,
                    parent: 'EUPATH_0000609/OBI_0002649',
                    precision: 1,
                    term: 'EUPATH_0000609/EUPATH_0021143',
                    variableName: 'No Provider Label available',
                  },
                  children: [
                    {
                      field: {
                        display: 'Raw eukaryota data for blood',
                        isRange: false,
                        parent: 'EUPATH_0000609/EUPATH_0021143',
                        precision: 1,
                        term: 'EUPATH_0000609/EUPATH_0022270',
                        variableName: 'No Provider Label available',
                      },
                      children: [
                        {
                          field: {
                            display: 'Plasmodium falciparum, by FTA qPCR',
                            isRange: true,
                            parent: 'EUPATH_0000609/EUPATH_0022270',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022260',
                            type: 'number',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::pcrftfc"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display:
                              'Plasmodium falciparum, by qPCR calculation',
                            isRange: true,
                            parent: 'EUPATH_0000609/EUPATH_0022270',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022264',
                            type: 'number',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::pcrveftf"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display:
                              'Plasmodium falciparum, by venous blood qPCR',
                            isRange: true,
                            parent: 'EUPATH_0000609/EUPATH_0022270',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022263',
                            type: 'number',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::pcrvefc"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display: 'Plasmodium vivax, by FTA qPCR',
                            isRange: true,
                            parent: 'EUPATH_0000609/EUPATH_0022270',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022261',
                            type: 'number',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::pcrftvi"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                        {
                          field: {
                            display: 'Plasmodium vivax, by qPCR calculation',
                            isRange: true,
                            parent: 'EUPATH_0000609/EUPATH_0022270',
                            precision: 1,
                            term: 'EUPATH_0000609/EUPATH_0022247',
                            type: 'number',
                            variableName:
                              '["icemr1_brazil_observation_march2020_st::pcrveftv"]',
                            isFeatured: false,
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              field: {
                display: 'Stool microbiology test',
                isRange: false,
                parent: 'EUPATH_0000609/OGMS_0000056',
                precision: 1,
                term: 'EUPATH_0000609/EUPATH_0000724',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Eukaryota in stool',
                    isRange: false,
                    parent: 'EUPATH_0000609/EUPATH_0000724',
                    precision: 1,
                    term: 'EUPATH_0000609/EUPATH_0030117',
                    variableName: 'No Provider Label available',
                  },
                  children: [
                    {
                      field: {
                        display: 'Parasites, by microscopy',
                        isRange: false,
                        parent: 'EUPATH_0000609/EUPATH_0030117',
                        precision: 1,
                        term: 'EUPATH_0000609/EUPATH_0022118',
                        type: 'string',
                        variableName:
                          '["icemr1_brazil_participant_march2020_st::fezes"]',
                        isFeatured: false,
                      },
                      children: [],
                    },
                    {
                      field: {
                        display: 'Parasite species, by microscopy',
                        isRange: false,
                        parent: 'EUPATH_0000609/EUPATH_0030117',
                        precision: 1,
                        term: 'EUPATH_0000609/EUPATH_0022119',
                        type: 'string',
                        variableName:
                          '["icemr1_brazil_participant_march2020_st::parasita"]',
                        isFeatured: false,
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          field: {
            display: 'Sample collection process',
            isRange: false,
            parent: 'entity:EUPATH_0000609',
            precision: 1,
            term: 'EUPATH_0000609/OBI_0600005',
            variableName: 'No Provider Label available',
          },
          children: [
            {
              field: {
                display: 'Blood sample collection process',
                isRange: false,
                parent: 'EUPATH_0000609/OBI_0600005',
                precision: 1,
                term: 'EUPATH_0000609/EUPATH_0011482',
                variableName: 'No Provider Label available',
              },
              children: [
                {
                  field: {
                    display: 'Blood sample collected',
                    isRange: false,
                    parent: 'EUPATH_0000609/EUPATH_0011482',
                    precision: 1,
                    term: 'EUPATH_0000609/EUPATH_0033146',
                    type: 'string',
                    variableName:
                      '["icemr1_brazil_observation_march2020_st::particip"]',
                    isFeatured: false,
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
