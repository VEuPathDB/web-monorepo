/* DKDK a test component for tab home content
*/

import React from "react";

//DKDK props are not decided so just use any for now
export default function TabHomeConent(props: any) {
  return (
    <>
        <br />
        <div>
            <p>This is a test for making a sidebar tab contents to be a sub-comopnent of Tab-Home</p>
            <p>Testing props (for example, id & header):<br />props.id = {props.id}<br />props.header = {props.header}</p>
        </div>
    </>
  );
}

