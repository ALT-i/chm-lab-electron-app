import React from "react";

import ClassSelector from "renderer/components/ClassSelector";
import SectionSidePanel from "renderer/components/sections/SectionSidePanel";


export function ClassSelectionView () {
    return (
        <div className="class-selector-component">
            <SectionSidePanel />
            <ClassSelector />
        </div>
     );
}
