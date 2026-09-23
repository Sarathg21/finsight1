import re

with open("src/pages/BalanceSheet.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Change DEFAULT_FILTERS to use string 'All' instead of array []
code = re.sub(
    r"legalGroup:\s*\[\],\s*legalEntity:\s*\[\],\s*parentDivision:\[\],\s*subdivision:\s*\[\],",
    "legalGroup:    'All',\n    legalEntity:   'All',\n    parentDivision:'All',\n    subdivision:   'All',",
    code
)

# Remove MultiSelectDropdown import if we are replacing it
# code = re.sub(r"import MultiSelectDropdown.*?\n", "", code)

def make_select(name, id_attr, state_key, cascade_resets):
    cascade_code = ""
    if cascade_resets:
        cascade_code = ", ".join([f"{k}: 'All'" for k in cascade_resets])
        cascade_code = f", {cascade_code}"
    
    # We remove 'All' from filterOptions manually inside the map if it exists, since we hardcode it
    return f"""<select
              id="{id_attr}"
              style={{selStyle}}
              value={{filters.{state_key}}}
              onChange={{e => setFilters(prev => ({{ ...prev, {state_key}: e.target.value{cascade_code} }}))}}
              disabled={{loading.filters}}
            >
              <option value="All">All</option>
              {{filterOptions.{name}.filter(o => o !== 'All' && o.id !== 'All' && o.name !== 'All').map(o => {{
                const val = typeof o === 'object' ? (o.id !== undefined ? o.id : o.name) : o;
                const label = typeof o === 'object' ? (o.name !== undefined ? o.name : o.label) : o;
                return <option key={{val}} value={{val}}>{{label}}</option>;
              }})}}
            </select>"""

replacement = f"""<FilterField label="Legal Group">
            {make_select('legalGroups', 'filter-bs-legal-group', 'legalGroup', ['legalEntity', 'parentDivision', 'subdivision'])}
          </FilterField>

          <FilterField label="Legal Entity">
            {make_select('legalEntities', 'filter-bs-legal-entity', 'legalEntity', ['parentDivision', 'subdivision'])}
          </FilterField>

          <FilterField label="Parent Division">
            {make_select('parentDivisions', 'filter-bs-parent-division', 'parentDivision', ['subdivision'])}
          </FilterField>

          <FilterField label="Sub-Division">
            {make_select('subdivisions', 'filter-bs-subdivision', 'subdivision', [])}
          </FilterField>"""

# Replace the block of MultiSelectDropdowns
pattern = r'<FilterField label="Legal Group">.*?</FilterField>\s*<FilterField label="Legal Entity">.*?</FilterField>\s*<FilterField label="Parent Division">.*?</FilterField>\s*<FilterField label="Sub-Division">.*?</FilterField>'
code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open("src/pages/BalanceSheet.jsx", "w", encoding="utf-8") as f:
    f.write(code)
