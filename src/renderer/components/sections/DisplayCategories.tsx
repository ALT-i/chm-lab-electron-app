import React from "react";
import { useEffect, useState } from "react";

import server from "../../utils";





function DisplayCategories (props: any) {
    const categories = props.categories


    return (
            categories && categories.map((category: any) => (
                <option value={category.category_id} key={category.category_id}>
                    {category.type}
                </option>
            ))
     );
}

export default DisplayCategories;
