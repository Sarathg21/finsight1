const fs = require("fs");
let code = fs.readFileSync("src/pages/BalanceSheet.jsx", "utf8");

// Replace import
code = code.replace(
  "import MultiSelectDropdown from '../components/Filters/MultiSelectDropdown';",
  "// MultiSelectDropdown replaced by inline MultiSelect (matches Sales Revenue style)"
);

// Replace the 4 MultiSelectDropdown usages with MultiSelect + style={{width:105}}
code = code.replace(
  `<MultiSelectDropdown placeholder="All" options={filterOptions.legalGroups} value={filters.legalGroup} onChange={v => { setFilters(prev => ({ ...prev, legalGroup: v, legalEntity: [], parentDivision: [], subdivision: [] })); }} disabled={loading.filters} />`,
  `<MultiSelect options={filterOptions.legalGroups} value={filters.legalGroup} onChange={v => { setFilters(prev => ({ ...prev, legalGroup: v, legalEntity: [], parentDivision: [], subdivision: [] })); }} style={{width:105}} />`
);
code = code.replace(
  `<MultiSelectDropdown placeholder="All" options={filterOptions.legalEntities} value={filters.legalEntity} onChange={v => setFilters(prev => ({ ...prev, legalEntity: v, parentDivision: [], subdivision: [] }))} disabled={loading.filters} />`,
  `<MultiSelect options={filterOptions.legalEntities} value={filters.legalEntity} onChange={v => setFilters(prev => ({ ...prev, legalEntity: v, parentDivision: [], subdivision: [] }))} style={{width:105}} />`
);
code = code.replace(
  `<MultiSelectDropdown placeholder="All" options={filterOptions.parentDivisions} value={filters.parentDivision} onChange={v => setFilters(prev => ({ ...prev, parentDivision: v, subdivision: [] }))} disabled={loading.filters} />`,
  `<MultiSelect options={filterOptions.parentDivisions} value={filters.parentDivision} onChange={v => setFilters(prev => ({ ...prev, parentDivision: v, subdivision: [] }))} style={{width:105}} />`
);
code = code.replace(
  `<MultiSelectDropdown placeholder="All" options={filterOptions.subdivisions} value={filters.subdivision} onChange={v => setFilters(prev => ({ ...prev, subdivision: v }))} disabled={loading.filters} />`,
  `<MultiSelect options={filterOptions.subdivisions} value={filters.subdivision} onChange={v => setFilters(prev => ({ ...prev, subdivision: v }))} style={{width:105}} />`
);

fs.writeFileSync("src/pages/BalanceSheet.jsx", code);
console.log("Done");
