//DKDK sample legend
import React from 'react';
//DKDk import react-boostrap & css
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
//DKDK import legend css for positioning: place this at the end of other CSS to override pre-existing ones
import './legend-style.css'

interface LegendListDropDownProps {
  legendType: string,
  //DKDK add dropdown props for dynamic change
  dropdownTitle: string,
  dropdownHref: string[],
  dropdownItemText: string[],
}


export default function LegendListDropDown(props: LegendListDropDownProps) {
  //DKDK set ID for CSS styling
  let dropDownID = ''
  if (props.legendType === 'categorical') {
    dropDownID = 'legend-dropdown-category'
  } else {
    dropDownID = 'legend-dropdown-chart'
  }

  return (
    <>
      <Dropdown key={props.dropdownTitle}>
        <Dropdown.Toggle variant="success" id={dropDownID}>
          {props.dropdownTitle}
        </Dropdown.Toggle>
        <Dropdown.Menu className="legend-dropdown-menu">
          {props.dropdownItemText.map((item: string, index: number) => (
              <Dropdown.Item key={props.dropdownItemText[index]} href={props.dropdownHref[index]} className="legend-dropdown-item">{item}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <br />
    </>
  )
}

