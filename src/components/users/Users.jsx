import React, { useState } from "react";
import { stats } from "../data/dummyData";
import StatCard from "../components/StatCard";
import FilterBar from "../components/FilterBar";

const Users = () => {  
    const [search, setSearch] = useState("");
    const [activeOnly, setActiveOnly] = useState(false);

  return (
    <div className="grid grid-cols-5 gap-5">
     {userStats.map((item, index) => (
       <StatCard
         key={item.title}
         {...item}
         delay={index * 0.1}
       />
     ))}

     <FilterBar
      type="users"
      search={search}
      setSearch={setSearch}
      activeOnly={activeOnly}
      setActiveOnly={setActiveOnly}
    />;
    </div>
  )
}
export default Users
