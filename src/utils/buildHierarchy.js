export default function buildHierarchy(
    legalGroups = [],
    legalEntities = [],
    parentDivisions = [],
    subdivisions = [],
    businessUnits = [],
    analysisCodes = []
) {

    return legalGroups.map((group) => ({

        id: `LG_${group.legal_group_id}`,
        type: "LEGAL_GROUP",
        label: group.legal_group_name,

        children: legalEntities
            .filter(
                entity =>
                    entity.legal_group_id === group.legal_group_id
            )
            .map((entity) => ({

                id: `LE_${entity.legal_entity_id}`,
                type: "LEGAL_ENTITY",
                label: entity.legal_entity_name,

                children: parentDivisions
                    .filter(
                        division =>
                            division.legal_entity_id === entity.legal_entity_id
                    )
                    .map((division) => ({

                        id: `PD_${division.parent_division_id}`,
                        type: "PARENT_DIVISION",
                        label: division.parent_division_name,

                        children: subdivisions
                            .filter(
                                subdivision =>
                                    subdivision.parent_division_id ===
                                    division.parent_division_id
                            )
                            .map((subdivision) => ({

                                id: `SD_${subdivision.subdivision_id}`,
                                type: "SUBDIVISION",
                                label: subdivision.subdivision_name,

                                children: businessUnits
                                    .filter(
                                        bu =>
                                            bu.subdivision_id ===
                                            subdivision.subdivision_id
                                    )
                                    .map((bu) => ({

                                        id: `BU_${bu.business_unit_id}`,
                                        type: "BUSINESS_UNIT",
                                        label: bu.business_unit_name,

                                        children: analysisCodes
                                            .filter(
                                                analysis =>
                                                    analysis.business_unit_id ===
                                                    bu.business_unit_id
                                            )
                                            .map((analysis) => ({

                                                id: `AC_${analysis.analysis_code_id}`,
                                                type: "ANALYSIS_CODE",
                                                label: analysis.analysis_name,
                                                children: []

                                            }))

                                    }))

                            }))

                    }))

            }))

    }));

}