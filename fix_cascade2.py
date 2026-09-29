import re

with open('src/pages/SalesRevenueReport.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_pattern = r"fetchFilterOptions\(\{\n      legalGroupId:\s*appliedFilters\.legalGroupId,\n      legalEntityId:\s*appliedFilters\.legalEntityId,\n      parentDivisionId:\s*appliedFilters\.parentDivisionId,\n      subdivisionId:\s*appliedFilters\.subdivisionId,\n      salesman:\s*appliedFilters\.salesman,\n      customerType:\s*appliedFilters\.customerType,\n    \}\)"
new_pattern = r"fetchFilterOptions({\n      legalGroupId:     filters.legalGroupId,\n      legalEntityId:    filters.legalEntityId,\n      parentDivisionId: filters.parentDivisionId,\n      subdivisionId:    filters.subdivisionId,\n      salesman:         filters.salesman,\n      customerType:     filters.customerType,\n    })"

content = re.sub(old_pattern, new_pattern, content)

old_dep = r"\[appliedFilters\.legalGroupId, appliedFilters\.legalEntityId, appliedFilters\.parentDivisionId, handle401\]; \/\/ subdivisionId excluded — leaf level, not a cascade trigger"
new_dep = r"[filters.legalGroupId, filters.legalEntityId, filters.parentDivisionId, handle401]; // cascade updates options immediately based on pending selections"

content = re.sub(old_dep, new_dep, content)

with open('src/pages/SalesRevenueReport.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
