with open("src/pages/MasterDataDashboard.jsx", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace('"../components/Common/PageHeader"', '"../components/common/PageHeader"')
code = code.replace('"../components/Common/FilterBar"', '"../components/common/FilterBar"')
code = code.replace('"../components/Common/PageSkeleton"', '"../components/common/PageSkeleton"')
code = code.replace('"../components/Common/ConfirmationModel"', '"../components/common/ConfirmationModel"')

with open("src/pages/MasterDataDashboard.jsx", "w", encoding="utf-8") as f:
    f.write(code)
