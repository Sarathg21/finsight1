import React, { useState } from "react";
import { roleStats } from "../data/roleStats";
import StatCard from "../components/StatCard";
import FilterBar from "../components/FilterBar";


const Roles = () => {
    const [search, setSearch] = useState("");
    const [activeOnly, setActiveOnly] = useState(true);
    return (
        <div className="grid grid-cols-5 gap-5">
            {roleStats.map((item, index) => (
                <StatCard
                    key={item.title}
                    {...item}
                    delay={index * 0.1}
                />
            ))}
            <FilterBar
                type="roles"
                search={search}
                setSearch={setSearch}
                activeOnly={activeOnly}
                setActiveOnly={setActiveOnly}
            />;
        </div>

    )
}

export default Roles

