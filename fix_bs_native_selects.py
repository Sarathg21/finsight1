import re

with open("src/pages/BalanceSheet.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update DEFAULT_FILTERS
code = re.sub(r"legalGroup:\s*\[\],", "legalGroup:    'All',", code)
code = re.sub(r"legalEntity:\s*\[\],", "legalEntity:   'All',", code)
code = re.sub(r"parentDivision:\s*\[\],", "parentDivision:'All',", code)
code = re.sub(r"subdivision:\s*\[\],", "subdivision:   'All',", code)

def make_select(name, id_attr, state_key, cascade_resets):
    cascade_code = ""
    if cascade_resets:
        cascade_code = ", ".join([f"{k}: 'All'" for k in cascade_resets])
        cascade_code = f", {cascade_code}"
    
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

code = re.sub(
    r'<MultiSelectDropdown[^>]*?options=\{filterOptions\.legalGroups\}[^>]*?/>',
    make_select("legalGroups", "filter-bs-legal-group", "legalGroup", ["legalEntity", "parentDivision", "subdivision"]),
    code, flags=re.DOTALL
)
code = re.sub(
    r'<MultiSelectDropdown[^>]*?options=\{filterOptions\.legalEntities\}[^>]*?/>',
    make_select("legalEntities", "filter-bs-legal-entity", "legalEntity", ["parentDivision", "subdivision"]),
    code, flags=re.DOTALL
)
code = re.sub(
    r'<MultiSelectDropdown[^>]*?options=\{filterOptions\.parentDivisions\}[^>]*?/>',
    make_select("parentDivisions", "filter-bs-parent-division", "parentDivision", ["subdivision"]),
    code, flags=re.DOTALL
)
code = re.sub(
    r'<MultiSelectDropdown[^>]*?options=\{filterOptions\.subdivisions\}[^>]*?/>',
    make_select("subdivisions", "filter-bs-subdivision", "subdivision", []),
    code, flags=re.DOTALL
)

code = re.sub(r"import MultiSelectDropdown from '../components/Filters/MultiSelectDropdown';\n?", "", code)

with open("src/pages/BalanceSheet.jsx", "w", encoding="utf-8") as f:
    f.write(code)
