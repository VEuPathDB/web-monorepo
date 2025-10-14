import React from "react";
import Banner from "@veupathdb/coreui/lib/components/banners/Banner";

export function ErrorMessage({ errors }: { errors: string[] }): React.ReactElement {
  return (
    <Banner
      banner={{
        type: "error",
        message: (
          <div style={{ lineHeight: 1.5 }}>
            <span>Could not upload data set</span>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        ),
      }}
    />
  );
}
