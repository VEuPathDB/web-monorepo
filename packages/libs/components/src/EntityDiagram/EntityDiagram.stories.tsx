import React, {useState} from 'react';
import MiniDiagram from "./MiniDiagram";
import ExpandedDiagram from "./ExpandedDiagram";

export default {
  title: 'Entity Diagram'
};

export const EntityDiagram = () => {
  const [orientation, setOrientation] = useState<string>('vertical')
  const [expanded, setExpanded] = useState<boolean>(false)

  const studyData = {
      "id":"DS12385",
      "rootEntity":{
            "id":"GEMS_House",
            "displayName":"Household",
            "description":"Households from the study area",
            "children":[
          {
            "id":"GEMS_HouseObs",
            "displayName":"Household Observation",
            "description":"",
            "children":[

            ],
            "variables":[
              {
                "id":"var-19",
                "providerLabel":"_watersupply",
                "displayName":"Water supply",
                "type":"string"
              }
            ]
          },
          {
            "id":"GEMS_Part",
            "displayName":"Participant",
            "description":"Participants in the study",
            "children":[
              {
                "id":"GEMS_PartObs",
                "displayName":"Participant Observation",
                "description":"",
                "children":[
                  {
                    "id":"GEMS_Sample",
                    "displayName":"Sample",
                    "description":"",
                    "children":[

                    ],
                    "variables":[

                    ]
                  },
                  {
                    "id":"GEMS_Treat",
                    "displayName":"Treatment",
                    "description":"",
                    "children":[

                    ],
                    "variables":[

                    ]
                  }
                ],
                "variables":[
                  {
                    "id":"var-12",
                    "providerLabel":"_weight",
                    "displayName":"Weight",
                    "type":"number",
                    "isContinuous":true,
                    "precision":2,
                    "units":"pounds"
                  },
                  {
                    "id":"var-13",
                    "providerLabel":"_favnumber",
                    "displayName":"Favorite number",
                    "type":"number",
                    "isContinuous":false,
                    "precision":0,
                    "units":""
                  },
                  {
                    "id":"var-14",
                    "providerLabel":"_startdate",
                    "displayName":"Start date",
                    "type":"date",
                    "isContinuous":false
                  },
                  {
                    "id":"var-15",
                    "providerLabel":"_visitdate",
                    "displayName":"Visit date",
                    "type":"number",
                    "isContinuous":false,
                    "precision":0
                  },
                  {
                    "id":"var-16",
                    "providerLabel":"_mood",
                    "displayName":"Mood",
                    "type":"string"
                  }
                ]
              }
            ],
            "variables":[
              {
                "id":"var-10",
                "providerLabel":"_networth",
                "displayName":"Net worth",
                "type":"number",
                "isContinuous":true,
                "precision":2,
                "units":"dollars"
              },
              {
                "id":"var-11",
                "providerLabel":"_shoesize",
                "displayName":"Shoe size",
                "type":"number",
                "isContinuous":true,
                "precision":1,
                "units":"shoe size"
              },
              {
                "id":"var-17",
                "providerLabel":"_haircolor",
                "displayName":"Hair color",
                "type":"string"
              },
              {
                "id":"var-20",
                "providerLabel":"_name",
                "displayName":"Name",
                "type":"string"
              }
            ]
          }
        ],
            "variables":[
          {
            "id":"var-18",
            "providerLabel":"_address",
            "displayName":"City",
            "type":"string"
          }
        ]
      }
    }

  const shadingData = [
    {
      entityId: "GEMS_House",
      value: 1,
      color: "#e4c8c8"
    },
    {
      entityId: "GEMS_HouseObs",
      value: 2,
      color: "#e4c8c8"
    },
    {
      entityId: "GEMS_Part",
      value: 3,
      color: "#e4c8c8"
    },
    {
      entityId: "GEMS_PartObs",
      value: 4,
      color: "#e4c8c8"
    },
    {
      entityId: "GEMS_Treat",
      value: 5,
      color: "#e4c8c8"
    }
  ]

  return (
    <div style={{marginLeft: 40, marginTop: 40, width: 1000, height: 700, border: '1px black solid'}}>
      <button
        onClick={() =>
          orientation == 'horizontal'
            ? setOrientation('vertical')
            : setOrientation('horizontal')}
      >
        Switch Orientation
      </button>
      <button
        onClick={() =>
          expanded
            ? setExpanded(false)
            : setExpanded(true)}
      >
        Switch Size
      </button>

      {
        expanded
          ?
            <ExpandedDiagram
              treeData={studyData.rootEntity}
              orientation={orientation}
              highlightedEntityID={"Sample"}
              shadingData={shadingData}
            />
          :
            <MiniDiagram
              treeData={studyData.rootEntity}
              orientation={orientation}
              highlightedEntityID={"Sample"}
            />
      }
    </div>
  )
}