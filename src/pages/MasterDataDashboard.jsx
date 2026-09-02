
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import PageHeader from "../components/Common/PageHeader";
import StatCard from "../components/StatCard";
import FilterBar from "../components/Common/FilterBar";
import FooterNote from "../components/FooterNote";
import MasterDataTabs from "../components/masterdata/MasterDataTabs";
import LegalGroupsTable from "../components/masterdata/LegalGroupsTable";
import LegalGroupDetails from "../components/masterdata/LegalGroupDetails";
import LegalEntitiesMasterTable from "../components/masterdata/LegalEntitiesMasterTable";
import LegalEntityDetails from "../components/masterdata/LegalEntityDetails";
import MasterDataModal from "../components/masterdata/MasterDataModal";
import ParentDivisionTable from "../components/masterdata/ParentDivisionTable";
import ParentDivisionDetails from "../components/masterdata/ParentDivisionDetails";
import BusinessUnitDetails from "../components/masterdata/BusinessUnitDetails";
import SubDivisionTable from "../components/masterdata/SubDivisionTable";
import BusinessUnitTable from "../components/masterdata/BusinessUnitTable";
import AnalysisCodeTable from "../components/masterdata/AnalysisCodeTable";
import SubDivisionDetails from "../components/masterdata/SubDivisionDetails";
import AnalysisCodeDetails from "../components/masterdata/AnalysisCodeDetails";
import CurrencyTable from "../components/masterdata/CurrencyTable";
import CurrencyDetails from "../components/masterdata/CurrencyDetails";
import PageSkeleton from "../components/common/PageSkeleton";

import { masterCards } from "../data/masterData";
import ConfirmationModel from "../components/Common/ConfirmationModel";
import { statuses } from "../data/dummyData";

import {
  addLegalGroup,
  updateLegalGroup,
  getLegalGroups,
  getLegalEntities,
  updateLegalEntities,
  addLegalEntities,
  getParentDivision,
  addParentDivision,
  updateParentDivision,
  getSubDivision,
  addSubDivision,
  updateSubDivision,
  getBusinessunits,
  addBusinessunits,
  updateBusinessunits,
  getAnalysisCodes,
  addAnalysisCodes,
  updateAnalysisCodes,
  getParentDivisionLegalEntities,
  updateParentDivisionLegalEntities,
  getCurrencies,
  addCurrency,
  updateCurrency,
} from "../api/masterLegalApi";

export default function MasterDataDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLegalGroup, setEditLegalGroup] = useState(null);

  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const [showEntityModal, setShowEntityModal] = useState(false);
  const [editLegalEntity, setEditLegalEntity] = useState(null);
  const [activeTab, setActiveTab] = useState("legal-groups");

  const [legalGroups, setLegalGroups] = useState([]);
  const [legalEntities, setLegalEntities] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);

  const [showParentDivisionModal, setShowParentDivisionModal] =
    useState(false);
  const [editParentDivision, setEditParentDivision] = useState(null);
  const [parentDivisions, setParentDivisions] = useState([]);
  const [selectedParentDivision, setSelectedParentDivision] = useState(null);

  const [parentDivisionLegalEntities, setParentDivisionLegalEntities] =
    useState([]);

  const [loadingParentDivisionEntities, setLoadingParentDivisionEntities] =
    useState(false);

  const [showSubDivisionModal, setShowSubDivisionModal] = useState(false);
  const [editSubDivision, setEditSubDivision] = useState(null);
  const [SubDivisions, setSubDivisions] = useState([]);
  const [selectedSubDivision, setSelectedSubDivision] = useState(null);

  const [showBusinessUnitModal, setShowBusinessUnitModal] = useState(false);
  const [editBusinessUnit, setEditBusinessUnit] = useState(null);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showAnalysisCodeModal, setShowAnalysisCodeModal] = useState(false);
  const [editAnalysisCode, setEditAnalysisCode] = useState(null);
  const [analysisCodes, setAnalysisCodes] = useState([]);
  const [selectedAnalysisCode, setSelectedAnalysisCode] = useState(null);

  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [editCurrency, setEditCurrency] = useState(null);

  const [selectedEditItem, setSelectedEditItem] = useState(null);

  const [tabFilters, setTabFilters] = useState({
    "legal-groups": {
      search: "",
      status: "All",
    },
    "legal-entities": {
      search: "",
      status: "All",
    },
    "parent-divisions": {
      search: "",
      status: "All",
    },
    "sub-divisions": {
      search: "",
      status: "All",
    },
    "business-units": {
      search: "",
      status: "All",
    },
    "analysis-codes": {
      search: "",
      status: "All",
    },
    currencies: {
      search: "",
      status: "All",
    },
  });

  const currentFilter = tabFilters[activeTab];

  const search = currentFilter?.search || "";
  const status = currentFilter?.status || "All";

  const updateTabFilter = (key, value) => {
    setTabFilters((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value,
      },
    }));
  };

  const dynamicMasterCards = [
    {
      id: "legal-groups",
      title: "Legal Groups",
      value: legalGroups.filter((item) => item.active === true).length,
      description: "Active",
      icon: masterCards[0].icon,
      color: masterCards[0].color,
    },

    {
      id: "legal-entities",
      title: "Legal Entities",
      value: legalEntities.filter((group) => group.active === true).length,
      description: "Active",
      icon: masterCards[1].icon,
      color: masterCards[1].color,
    },

    {
      id: "parent-divisions",
      title: "Parent Divisions",
      value: parentDivisions.filter((item) => item.active).length,
      description: "Active",
      icon: masterCards[2].icon,
      color: masterCards[2].color,
    },

    {
      id: "sub-divisions",
      title: "Sub Divisions",
      value: SubDivisions.filter((item) => item.active).length,
      description: "Active",
      icon: masterCards[3].icon,
      color: masterCards[3].color,
    },

    {
      id: "business-units",
      title: "Business Units",
      value: businessUnits.filter((item) => item.active).length,
      description: "Active",
      icon: masterCards[4].icon,
      color: masterCards[4].color,
    },

    {
      id: "analysis-codes",
      title: "Analysis Codes",
      value: analysisCodes.filter((item) => item.active).length,
      description: "Active",
      icon: masterCards[5].icon,
      color: masterCards[5].color,
    },

    {
      id: "currencies",
      title: "Currencies",
      value: currencies.filter((item) => item.active === true).length,
      description: "Active",
      icon: masterCards[6]?.icon,
      color: masterCards[6]?.color,
    },
  ];

  /* -------------------- LOAD KPI CARDS -------------------- */

  const loadMasterData = async () => {
    try {
      await Promise.all([
        fetchLegalGroups(),
        fetchLegalEntities(),
        fetchParentDivisions(),
        fetchSubDivisions(),
        fetchBusinessUnits(),
        fetchAnalysisCodes(),
        fetchCurrencies(),
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  /* -------------------- FETCH LEGAL GROUPS -------------------- */

  const fetchLegalGroups = async () => {
    try {
      const response = await getLegalGroups();

      const data = response.data.data || response.data;

      const updatedGroups = data.map((group) => ({
        ...group,
        active: group.active ?? true,
      }));

      setLegalGroups(updatedGroups);

      setSelectedGroup((prev) => {
        if (!updatedGroups.length) {
          return null;
        }

        if (!prev) {
          return updatedGroups[0];
        }

        return (
          updatedGroups.find(
            (item) =>
              Number(item.legal_group_id) ===
              Number(prev.legal_group_id)
          ) || updatedGroups[0]
        );
      });
    } catch (error) {
      console.error("Legal Group Load Error:", error);
    }
  };

  /* -------------------- FETCH LEGAL ENTITIES -------------------- */

  const fetchLegalEntities = async () => {
    try {
      const response = await getLegalEntities();

      const data = response.data.data || response.data;

      const updatedEntities = data.map((entity) => ({
        ...entity,
        active: entity.active ?? true,
      }));

      setLegalEntities(updatedEntities);

      if (updatedEntities.length > 0) {
        setSelectedEntity(updatedEntities[0]);
      } else {
        setSelectedEntity(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* -------------------- FETCH PARENT DIVISIONS -------------------- */

  const fetchParentDivisions = async () => {
    try {
      const response = await getParentDivision();

      const data = response.data.data || response.data || [];

      console.log("Parent Division API:", data);

      const updatedDivisions = data.map((item) => ({
        ...item,
        active: item.active ?? true,
      }));

      setParentDivisions(updatedDivisions);

      setSelectedParentDivision((prev) => {
        if (!updatedDivisions.length) {
          return null;
        }

        if (!prev) {
          return updatedDivisions[0];
        }

        return (
          updatedDivisions.find(
            (item) =>
              Number(item.parent_division_id) ===
              Number(prev.parent_division_id)
          ) || updatedDivisions[0]
        );
      });
    } catch (error) {
      console.error("Parent Division Load Error:", error);
    }
  };

  const fetchParentDivisionLegalEntities = async (parentDivisionId) => {
    if (!parentDivisionId) {
      setParentDivisionLegalEntities([]);
      return;
    }

    try {
      setLoadingParentDivisionEntities(true);

      const response = await getParentDivisionLegalEntities(
        parentDivisionId
      );

      const data = response.data.data || response.data || [];

      setParentDivisionLegalEntities(data);
    } catch (error) {
      console.error(
        "Parent Division Legal Entities Load Error:",
        error?.response?.data || error
      );

      setParentDivisionLegalEntities([]);
    } finally {
      setLoadingParentDivisionEntities(false);
    }
  };

  useEffect(() => {
    if (selectedParentDivision?.parent_division_id) {
      fetchParentDivisionLegalEntities(
        selectedParentDivision.parent_division_id
      );
    } else {
      setParentDivisionLegalEntities([]);
    }
  }, [selectedParentDivision?.parent_division_id]);

  /* -------------------- FETCH SUB DIVISIONS -------------------- */

  const fetchSubDivisions = async (selectedId = null) => {
    try {
      const response = await getSubDivision();

      const data = response.data.data || response.data || [];

      const updatedDivisions = data.map((item) => ({
        ...item,
        active: item.active ?? true,
      }));

      setSubDivisions(updatedDivisions);

      setSelectedSubDivision((prev) => {
        const targetId = selectedId ?? prev?.subdivision_id;

        if (!updatedDivisions.length) {
          return null;
        }

        if (targetId != null) {
          return (
            updatedDivisions.find(
              (item) =>
                Number(item.subdivision_id) === Number(targetId)
            ) || updatedDivisions[0]
          );
        }

        return updatedDivisions[0];
      });
    } catch (error) {
      console.error("Sub Division Load Error:", error);
    }
  };

  /* -------------------- FETCH BUSINESS UNITS -------------------- */

  const fetchBusinessUnits = async () => {
    try {
      const response = await getBusinessunits();

      const data = response.data.data || response.data || [];

      const updatedUnits = data.map((item) => ({
        ...item,
        active: item.active ?? true,
      }));

      setBusinessUnits(updatedUnits);

      setSelectedBusinessUnit((prev) => {
        if (!updatedUnits.length) {
          return null;
        }

        if (!prev) {
          return updatedUnits[0];
        }

        return (
          updatedUnits.find(
            (item) =>
              Number(item.business_unit_id) ===
              Number(prev.business_unit_id)
          ) || updatedUnits[0]
        );
      });
    } catch (error) {
      console.error("Business Unit Load Error:", error);
    }
  };

  /* -------------------- FETCH ANALYSIS CODES -------------------- */

  const fetchAnalysisCodes = async () => {
    try {
      const response = await getAnalysisCodes();

      const data = response.data.data || response.data || [];

      const updatedCodes = data.map((item) => ({
        ...item,
        active: item.active ?? true,
      }));

      setAnalysisCodes(updatedCodes);

      setSelectedAnalysisCode((prev) => {
        if (!updatedCodes.length) {
          return null;
        }

        if (!prev) {
          return updatedCodes[0];
        }

        return (
          updatedCodes.find(
            (item) =>
              Number(item.analysis_code_id) ===
              Number(prev.analysis_code_id)
          ) || updatedCodes[0]
        );
      });
    } catch (error) {
      console.error("Analysis Code Load Error:", error);
    }
  };

  /* -------------------- FETCH CURRENCIES -------------------- */

  const fetchCurrencies = async () => {
    try {
      const response = await getCurrencies();

      const data = response.data.data || response.data || [];

      const updatedCurrencies = data.map((item) => ({
        ...item,
        active:
          item.active === true ||
          item.active === 1 ||
          item.active === "1" ||
          item.active === "true",
      }));

      setCurrencies(updatedCurrencies);

      setSelectedCurrency((prev) => {
        if (!updatedCurrencies.length) {
          return null;
        }

        if (!prev) {
          return updatedCurrencies[0];
        }

        return (
          updatedCurrencies.find(
            (item) =>
              Number(item.currency_id) === Number(prev.currency_id)
          ) || updatedCurrencies[0]
        );
      });
    } catch (error) {
      console.error(
        "Currency Load Error:",
        error?.response?.data || error
      );
    }
  };

  const selectedGroupEntities = legalEntities.filter((entity) =>
    entity.legal_groups?.some(
      (group) =>
        Number(group.legal_group_id) ===
        Number(selectedGroup?.legal_group_id)
    )
  );

  const selectedSubDivisionAnalysisCodes = analysisCodes.filter(
    (item) =>
      Number(item.subdivision_id) ===
      Number(selectedSubDivision?.subdivision_id)
  );

  /* -------------------- FILTER LEGAL ENTITY -------------------- */

  const filteredLegalEntities = legalEntities.filter((entity) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      entity.legal_entity_code?.toLowerCase().includes(keyword) ||
      entity.legal_entity_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      status === "All" ||
      (status === "Active" && entity.active) ||
      (status === "Inactive" && !entity.active);

    return matchesSearch && matchesStatus;
  });

  /* -------------------- FILTER LEGAL GROUPS -------------------- */

  const filteredLegalGroups = legalGroups.filter((group) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      group.legal_group_code?.toLowerCase().includes(keyword) ||
      group.legal_group_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      status === "All" ||
      (status === "Active" && group.active) ||
      (status === "Inactive" && !group.active);

    return matchesSearch && matchesStatus;
  });

  /* -------------------- FILTER PARENT DIVISIONS -------------------- */

  const filteredParentDivisions = parentDivisions.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.parent_division_code?.toLowerCase().includes(keyword) ||
      item.parent_division_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      status === "All" ||
      (status === "Active" && item.active === true) ||
      (status === "Inactive" && item.active === false);

    return matchesSearch && matchesStatus;
  });

  /* -------------------- FILTER SUB DIVISIONS -------------------- */

  const filteredSubDivisions = SubDivisions.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.subdivision_code?.toLowerCase().includes(keyword) ||
      item.subdivision_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      status === "All" ||
      (status === "Active" && item.active === true) ||
      (status === "Inactive" && item.active === false);

    return matchesSearch && matchesStatus;
  });

  const selectedParentDivisionSubDivisions = SubDivisions.filter(
    (item) =>
      Number(item.parent_division_id) ===
      Number(selectedParentDivision?.parent_division_id)
  );

  const selectedEntityParentDivisions = parentDivisions.filter(
    (division) =>
      division.legal_entities?.some(
        (legalEntity) =>
          Number(legalEntity.legal_entity_id) ===
          Number(selectedEntity?.legal_entity_id)
      )
  );

  const selectedSubDivisionBusinessUnits = businessUnits.filter(
    (item) =>
      Number(item.subdivision_id) ===
      Number(selectedSubDivision?.subdivision_id)
  );

  /* -------------------- FILTER BUSINESS UNITS -------------------- */

  const filteredBusinessUnits = businessUnits.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch = item.business_unit_name
      ?.toLowerCase()
      .includes(keyword);

    const matchesStatus =
      status === "All" ||
      (status === "Active" && item.active === true) ||
      (status === "Inactive" && item.active === false);

    return matchesSearch && matchesStatus;
  });

  /* -------------------- FILTER ANALYSIS CODES -------------------- */

  const filteredAnalysisCodes = analysisCodes.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.analysis_code?.toLowerCase().includes(keyword) ||
      item.analysis_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      status === "All" ||
      (status === "Active" && item.active === true) ||
      (status === "Inactive" && item.active === false);

    return matchesSearch && matchesStatus;
  });

  /* -------------------- FILTER CURRENCIES -------------------- */

  const filteredCurrencies = currencies.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.currency_code?.toLowerCase().includes(keyword) ||
      item.currency_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      status === "All" ||
      (status === "Active" && item.active === true) ||
      (status === "Inactive" && item.active === false);

    return matchesSearch && matchesStatus;
  });

  /* -------------------- ADD PARENT DIVISION -------------------- */

  const handleAddParentDivision = async (data) => {
    try {
      console.log("ADD PARENT DIVISION DATA:", data);

      const response = await addParentDivision({
        parent_division_code: data.parent_division_code,
        parent_division_name: data.parent_division_name,
        active: data.active,
      });

      console.log("CREATE PARENT DIVISION RESPONSE:", response);

      const createdParentDivision =
        response?.data?.data ?? response?.data ?? response;

      const parentDivisionId =
        createdParentDivision?.parent_division_id;

      if (!parentDivisionId) {
        throw new Error(
          "Parent Division created but ID was not returned"
        );
      }

      await updateParentDivisionLegalEntities(
        parentDivisionId,
        data.legal_entity_ids || []
      );

      toast.success("Parent Division created successfully");

      await fetchParentDivisions();
    } catch (error) {
      console.error(
        "Parent Division create error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to create Parent Division"
      );

      throw error;
    }
  };

  /* -------------------- LEGAL GROUP STATUS -------------------- */

  const handleStatusToggle = async (group) => {
    if (!group?.legal_group_id) {
      toast.error("Legal Group ID is missing");
      return;
    }

    const nextActive = !group.active;

    try {
      await updateLegalGroup(group.legal_group_id, {
        legal_group_code: group.legal_group_code,
        legal_group_name: group.legal_group_name,
        active: nextActive,
      });

      toast.success(
        `Legal Group ${
          nextActive ? "activated" : "deactivated"
        } successfully`
      );

      await fetchLegalGroups();
    } catch (error) {
      console.error(
        "Legal Group status error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Unable to update Legal Group status"
      );
    }
  };

  /* -------------------- LEGAL ENTITY STATUS -------------------- */

  const handleEntityStatusToggle = async (entity) => {
    try {
      await updateLegalEntities(entity.legal_entity_id, {
        legal_entity_code: entity.legal_entity_code,
        legal_entity_name: entity.legal_entity_name,
        active: !entity.active,
        legal_group_ids:
          entity.legal_group_ids ??
          entity.legal_groups?.map(
            (group) => group.legal_group_id
          ) ??
          [],
      });

      toast.success(
        `Legal Entity ${
          entity.active ? "deactivated" : "activated"
        } successfully`
      );

      await fetchLegalEntities();
    } catch (error) {
      console.error(
        "Legal Entity status error:",
        error?.response?.data || error
      );

      toast.error("Unable to update Legal Entity status");
    }
  };

  /* -------------------- PARENT DIVISION STATUS -------------------- */

  const handleParentDivisionStatusToggle = async (item) => {
    if (!item?.parent_division_id) {
      toast.error("Parent Division ID is missing");
      return;
    }

    const nextActive = !item.active;

    try {
      console.log("PARENT DIVISION STATUS UPDATE:", {
        id: item.parent_division_id,
        currentActive: item.active,
        nextActive,
      });

      await updateParentDivision(item.parent_division_id, {
        parent_division_code: item.parent_division_code,
        parent_division_name: item.parent_division_name,
        active: nextActive,
        legal_entity_ids:
          item.legal_entity_ids ??
          item.legal_entities?.map(
            (entity) => entity.legal_entity_id
          ) ??
          [],
      });

      toast.success(
        `Parent Division ${
          nextActive ? "activated" : "deactivated"
        } successfully`
      );

      await fetchParentDivisions();
    } catch (error) {
      console.error(
        "Parent Division status error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Unable to update Parent Division status"
      );
    }
  };

  /* -------------------- UPDATE PARENT DIVISION -------------------- */

  const handleUpdateParentDivision = async (data) => {
    try {
      const parentDivisionId = data.parent_division_id;

      const response = await updateParentDivision(
        parentDivisionId,
        {
          parent_division_code: data.parent_division_code,
          parent_division_name: data.parent_division_name,
          active: data.active,
        }
      );

      await updateParentDivisionLegalEntities(
        parentDivisionId,
        data.legal_entity_ids || []
      );

      await fetchParentDivisions();

      return response;
    } catch (error) {
      console.error(
        "Parent Division update error:",
        error?.response?.data || error
      );

      throw error;
    }
  };

  /* -------------------- SUB DIVISION STATUS -------------------- */

  const handleSubDivisionStatusToggle = async (division) => {
    try {
      const id = division?.subdivision_id;

      if (id === undefined || id === null || id === "") {
        toast.error("Sub Division ID is missing");
        console.error("Missing subdivision_id:", division);
        return;
      }

      const payload = {
        active: !division.active,
      };

      console.log("STATUS UPDATE ID:", id);
      console.log("STATUS UPDATE PAYLOAD:", payload);

      await updateSubDivision(id, payload);

      toast.success(
        division.active
          ? "Sub Division deactivated successfully"
          : "Sub Division activated successfully"
      );

      await fetchSubDivisions();
    } catch (error) {
      console.error(
        "Sub Division status update error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Unable to update Sub Division status"
      );
    }
  };

  /* -------------------- BUSINESS UNIT STATUS -------------------- */

  const handleBusinessUnitStatusToggle = async (unit) => {
    if (!unit?.business_unit_id) {
      console.error("Business Unit ID missing:", unit);
      return;
    }

    try {
      console.log(
        "Business Unit status update:",
        unit.business_unit_id,
        !unit.active
      );

      await updateBusinessunits(unit.business_unit_id, {
        active: !unit.active,
      });

      toast.success(
        unit.active
          ? "Business Unit deactivated successfully"
          : "Business Unit activated successfully"
      );

      await fetchBusinessUnits();
    } catch (error) {
      console.error(
        "Business Unit status update error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail?.[0]?.msg ||
          error?.response?.data?.message ||
          "Unable to update Business Unit status"
      );
    }
  };

  /* -------------------- ANALYSIS CODE STATUS -------------------- */

  const handleAnalysisCodeStatusToggle = async (item) => {
    try {
      await updateAnalysisCodes(item.analysis_code_id, {
        analysis_code: item.analysis_code,
        analysis_name: item.analysis_name,
        subdivision_id: Number(item.subdivision_id),
        subdivision_code: item.subdivision_code,
        subdivision_name: item.subdivision_name,
        parent_division_id: item.parent_division_id
          ? Number(item.parent_division_id)
          : null,
        parent_division_code: item.parent_division_code,
        parent_division_name: item.parent_division_name,
        active: !item.active,
      });

      toast.success(
        `Analysis Code ${
          item.active ? "deactivated" : "activated"
        } successfully`
      );

      await fetchAnalysisCodes();
    } catch (error) {
      console.error(
        "Analysis Code status error:",
        error?.response?.data || error
      );

      toast.error("Unable to update Analysis Code status");
    }
  };

  /* -------------------- CURRENCY STATUS -------------------- */

  const handleCurrencyStatusToggle = async (
    item,
    newStatus = null
  ) => {
    if (!item) return;

    const nextActive =
      newStatus !== null
        ? newStatus === "Active"
        : !item.active;

    try {
      await updateCurrency(item.currency_id, {
        currency_code: item.currency_code,
        currency_name: item.currency_name,
        conversion_rate_to_aed: Number(
          item.conversion_rate_to_aed
        ),
        active: nextActive,
      });

      toast.success(
        `Currency ${
          nextActive ? "activated" : "deactivated"
        } successfully`
      );

      await fetchCurrencies();
    } catch (error) {
      console.error(
        "Currency status error:",
        error?.response?.data || error
      );

      toast.error("Unable to update Currency status");
    }
  };

  /* -------------------- EDIT -------------------- */

  const handleEdit = (item) => {
    if (!item) {
      toast.error("Unable to edit: item not selected");
      return;
    }

    setSelectedEditItem(item);
    setShowEditConfirm(true);
  };

  const getMasterDataTitle = () => {
    const titles = {
      "legal-groups": "Legal Group",
      "legal-entities": "Legal Entity",
      "parent-divisions": "Parent Division",
      "sub-divisions": "Sub Division",
      "business-units": "Business Unit",
      "analysis-codes": "Analysis Code",
      currencies: "Currency",
    };

    return titles[activeTab] || "Master Data";
  };

  const selectedParentDivisionLegalEntities =
    parentDivisionLegalEntities.map((entity) => {
      const fullEntity = legalEntities.find(
        (item) =>
          Number(item.legal_entity_id) ===
          Number(entity.legal_entity_id)
      );

      return {
        ...entity,
        active:
          fullEntity?.active ??
          entity.active ??
          false,
      };
    });

  if (loading) {
    return (
      <div
        style={{
          height: "calc(100vh - 64px)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div style={{ padding: "16px" }}>
          <PageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 64px)",
        minHeight: 0,
        maxHeight: "calc(100vh - 64px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          flexShrink: 0,
          width: "100%",
        }}
      >
        <PageHeader
          title="Master Data"
          subtitle="Manage and maintain master data used across FinSight."
        />
      </div>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div
        style={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: "8px",
          width: "100%",
          alignItems: "stretch",
          marginTop: "8px",
          boxSizing: "border-box",
        }}
      >
        {dynamicMasterCards.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            style={{
              minWidth: 0,
              width: "100%",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                width: "100%",
                minWidth: 0,
                height: "100%",
              }}
            >
              <StatCard
                {...item}
                delay={index * 0.08}
              />
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div
        style={{
          flexShrink: 0,
          width: "100%",
          marginTop: "8px",
        }}
      >
        <MasterDataTabs
          tabs={dynamicMasterCards}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
          PAGE ITSELF DOES NOT SCROLL
      ===================================================== */}

      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)",
          gap: "8px",
          marginTop: "8px",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* =================================================
            LEFT SECTION
        ================================================= */}

        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* FILTER */}

          <div
            style={{
              width: "100%",
              flexShrink: 0,
            }}
          >
            <FilterBar
              compact
              search={search}
              setSearch={(value) =>
                updateTabFilter("search", value)
              }
              placeholder={`Search ${activeTab.replace(
                "-",
                " "
              )}...`}
              filters={[
                {
                  label: "Status",
                  options: statuses,
                  value: status,
                  onChange: (e) =>
                    updateTabFilter(
                      "status",
                      e.target.value
                    ),
                },
              ]}
              showMoreFilters
              onMoreFilters={() =>
                console.log("More Filters")
              }
              showAddButton
              addButtonLabel={
                activeTab === "legal-groups"
                  ? "Legal Group"
                  : activeTab === "legal-entities"
                  ? "Legal Entity"
                  : activeTab === "parent-divisions"
                  ? "Parent Division"
                  : activeTab === "sub-divisions"
                  ? "Sub Division"
                  : activeTab === "business-units"
                  ? "Business Unit"
                  : activeTab === "analysis-codes"
                  ? "Analysis Code"
                  : "Currency"
              }
              onAdd={() => {
                if (activeTab === "legal-groups") {
                  setEditLegalGroup(null);
                  setShowAddModal(true);
                }

                if (activeTab === "legal-entities") {
                  setEditLegalEntity(null);
                  setShowEntityModal(true);
                }

                if (activeTab === "parent-divisions") {
                  setEditParentDivision(null);
                  setShowParentDivisionModal(true);
                }

                if (activeTab === "sub-divisions") {
                  setEditSubDivision(null);
                  setShowSubDivisionModal(true);
                }

                if (activeTab === "business-units") {
                  setEditBusinessUnit(null);
                  setShowBusinessUnitModal(true);
                }

                if (activeTab === "analysis-codes") {
                  setEditAnalysisCode(null);
                  setShowAnalysisCodeModal(true);
                }

                if (activeTab === "currencies") {
                  setEditCurrency(null);
                  setShowCurrencyModal(true);
                }
              }}
            />
          </div>

          {/* =================================================
              TABLE
              TABLE COMPONENT HANDLES ITS OWN SCROLL
          ================================================= */}

          <div
            style={{
              width: "100%",
              minWidth: 0,
              minHeight: 0,
              flex: 1,
              marginTop: "8px",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {activeTab === "legal-groups" && (
              <LegalGroupsTable
                legalGroups={filteredLegalGroups}
                onSelect={setSelectedGroup}
                selectedGroup={selectedGroup}
                onEdit={handleEdit}
                onStatusToggle={handleStatusToggle}
              />
            )}

            {activeTab === "legal-entities" && (
              <LegalEntitiesMasterTable
                legalEntities={filteredLegalEntities}
                selectedEntity={selectedEntity}
                onSelect={setSelectedEntity}
                onEdit={handleEdit}
                onStatusToggle={handleEntityStatusToggle}
              />
            )}

            {activeTab === "parent-divisions" && (
              <ParentDivisionTable
                parentDivisions={filteredParentDivisions}
                selectedParentDivision={selectedParentDivision}
                onSelect={setSelectedParentDivision}
                onEdit={handleEdit}
                onStatusToggle={
                  handleParentDivisionStatusToggle
                }
              />
            )}

            {activeTab === "sub-divisions" && (
              <SubDivisionTable
                subDivisions={filteredSubDivisions}
                selectedSubDivision={selectedSubDivision}
                onSelect={setSelectedSubDivision}
                onEdit={handleEdit}
                onStatusToggle={
                  handleSubDivisionStatusToggle
                }
              />
            )}

            {activeTab === "business-units" && (
              <BusinessUnitTable
                businessUnits={filteredBusinessUnits}
                selectedBusinessUnit={selectedBusinessUnit}
                onSelect={setSelectedBusinessUnit}
                onEdit={handleEdit}
                onStatusToggle={
                  handleBusinessUnitStatusToggle
                }
              />
            )}

            {activeTab === "analysis-codes" && (
              <AnalysisCodeTable
                analysisCodes={filteredAnalysisCodes}
                selectedAnalysisCode={selectedAnalysisCode}
                onSelect={setSelectedAnalysisCode}
                onEdit={handleEdit}
                onStatusToggle={
                  handleAnalysisCodeStatusToggle
                }
              />
            )}

            {activeTab === "currencies" && (
              <CurrencyTable
                currencies={filteredCurrencies}
                selectedCurrency={selectedCurrency}
                onSelect={setSelectedCurrency}
                onEdit={handleEdit}
                onStatusToggle={
                  handleCurrencyStatusToggle
                }
              />
            )}
          </div>
        </div>

        {/* =================================================
            RIGHT SECTION
        ================================================= */}

        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {activeTab === "legal-groups" && (
            <LegalGroupDetails
              group={selectedGroup}
              entities={selectedGroupEntities}
              onEdit={() => {
                if (!selectedGroup) return;

                handleEdit(selectedGroup);
              }}
              onAnnotate={() =>
                console.log("Annotate")
              }
              onStatusChange={(value) => {
                if (!selectedGroup) return;

                handleStatusToggle({
                  ...selectedGroup,
                  active:
                    value === "Active"
                      ? false
                      : true,
                });
              }}
            />
          )}

          {activeTab === "legal-entities" && (
            <LegalEntityDetails
              entity={selectedEntity}
              parentDivisions={
                selectedEntityParentDivisions
              }
              onEdit={() => console.log("Edit")}
              onAnnotate={() =>
                console.log("Annotate")
              }
              onStatusChange={(value) =>
                console.log(value)
              }
            />
          )}

          {activeTab === "parent-divisions" && (
            <ParentDivisionDetails
              division={selectedParentDivision}
              subdivisions={
                selectedParentDivisionSubDivisions
              }
              legalEntities={
                selectedParentDivisionLegalEntities
              }
              onEdit={handleEdit}
              onAnnotate={() =>
                console.log("Annotate")
              }
              onStatusChange={(value) =>
                handleParentDivisionStatusToggle(
                  selectedParentDivision,
                  value
                )
              }
            />
          )}

          {activeTab === "sub-divisions" && (
            <SubDivisionDetails
              subdivision={selectedSubDivision}
              businessUnits={
                selectedSubDivisionBusinessUnits
              }
              analysisCodes={
                selectedSubDivisionAnalysisCodes
              }
              onEdit={handleEdit}
              onAnnotate={() =>
                console.log("Annotate")
              }
              onStatusChange={(value) =>
                console.log(value)
              }
            />
          )}

          {activeTab === "business-units" && (
            <BusinessUnitDetails
              businessUnit={selectedBusinessUnit}
              onEdit={handleEdit}
              onAnnotate={() =>
                console.log("Annotate")
              }
              onStatusChange={(value) =>
                console.log(value)
              }
            />
          )}

          {activeTab === "analysis-codes" && (
            <AnalysisCodeDetails
              analysisCode={selectedAnalysisCode}
              onEdit={handleEdit}
              onAnnotate={() =>
                console.log("Annotate")
              }
              onStatusChange={(value) =>
                console.log(value)
              }
            />
          )}

          {activeTab === "currencies" && (
            <CurrencyDetails
              currency={selectedCurrency}
              onEdit={handleEdit}
              onStatusChange={(value) =>
                handleCurrencyStatusToggle(
                  selectedCurrency,
                  value
                )
              }
            />
          )}
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "55px",
          right: 0,
          height: "32px",
          minHeight: "32px",
          zIndex: 50,
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          padding: "4px 12px",
          boxShadow: "0 -1px 3px rgba(0,0,0,0.05)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <FooterNote
          title="Note:"
          message="Master data changes will be reflected across FinSight reports and dashboards."
          lastUpdated="20 Jun 2026 10:15 AM"
          onRefresh={() =>
            console.log("Refresh clicked")
          }
        />
      </div>

      {/* =====================================================
          LEGAL GROUP MODAL
      ===================================================== */}

      {activeTab === "legal-groups" && (
        <MasterDataModal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditLegalGroup(null);
          }}
          onSuccess={fetchLegalGroups}
          title="Legal Group"
          editData={editLegalGroup}
          idField="legal_group_id"
          codeField="legal_group_code"
          nameField="legal_group_name"
          codeLabel="Legal Group Code"
          nameLabel="Legal Group Name"
          addApi={addLegalGroup}
          updateApi={updateLegalGroup}
        />
      )}

      {/* =====================================================
          LEGAL ENTITY MODAL
      ===================================================== */}

      {activeTab === "legal-entities" && (
        <MasterDataModal
          open={showEntityModal}
          onClose={() => {
            setShowEntityModal(false);
            setEditLegalEntity(null);
          }}
          onSuccess={fetchLegalEntities}
          title="Legal Entity"
          editData={editLegalEntity}
          idField="legal_entity_id"
          codeField="legal_entity_code"
          nameField="legal_entity_name"
          codeLabel="Legal Entity Code"
          nameLabel="Legal Entity Name"
          extraFields={[
            {
              name: "legal_group_ids",
              label: "Legal Groups",
              type: "multi-select",
              required: true,
              isId: true,
              idFields: [
                "legal_group_id",
                "id",
              ],
              options: legalGroups
                .filter(
                  (group) =>
                    group.active === true
                )
                .map((group) => ({
                  value:
                    group.legal_group_id,
                  label: `${group.legal_group_code} - ${group.legal_group_name}`,
                })),
            },
          ]}
          addApi={addLegalEntities}
          updateApi={updateLegalEntities}
        />
      )}

      {/* =====================================================
          PARENT DIVISION MODAL
      ===================================================== */}

      {activeTab === "parent-divisions" && (
        <MasterDataModal
          open={showParentDivisionModal}
          onClose={() => {
            setShowParentDivisionModal(false);
            setEditParentDivision(null);
          }}
          onSuccess={fetchParentDivisions}
          title="Parent Division"
          editData={editParentDivision}
          idField="parent_division_id"
          codeField="parent_division_code"
          nameField="parent_division_name"
          codeLabel="Parent Division Code"
          nameLabel="Parent Division Name"
          onCustomSave={
            handleUpdateParentDivision
          }
          extraFields={[
            {
              name: "legal_entity_ids",
              label: "Legal Entities",
              type: "multi-select",
              required: true,
              isId: true,
              options: legalEntities
                .filter(
                  (entity) =>
                    entity.active === true
                )
                .map((entity) => ({
                  value:
                    entity.legal_entity_id,
                  label: `${entity.legal_entity_code} - ${entity.legal_entity_name}`,
                })),
            },
          ]}
          addApi={handleAddParentDivision}
          updateApi={handleUpdateParentDivision}
        />
      )}

      {/* =====================================================
          SUB DIVISION MODAL
      ===================================================== */}

      {activeTab === "sub-divisions" && (
        <MasterDataModal
          open={showSubDivisionModal}
          onClose={() => {
            setShowSubDivisionModal(false);
            setEditSubDivision(null);
          }}
          onSuccess={(createdSubDivision) => {
            fetchSubDivisions(
              createdSubDivision?.subdivision_id
            );
          }}
          title="Sub Division"
          editData={editSubDivision}
          idField="subdivision_id"
          codeField="subdivision_code"
          nameField="subdivision_name"
          codeLabel="Subdivision Code"
          nameLabel="Subdivision Name"
          extraFields={[
            {
              name: "parent_division_id",
              label: "Parent Division",
              type: "select",
              required: true,
              isId: true,
              options: parentDivisions
                .filter(
                  (item) =>
                    item.active === true
                )
                .map((item) => ({
                  value:
                    item.parent_division_id,
                  label: `${item.parent_division_code} - ${item.parent_division_name}`,
                })),
            },
          ]}
          addApi={addSubDivision}
          updateApi={updateSubDivision}
        />
      )}

      {/* =====================================================
          BUSINESS UNIT MODAL
      ===================================================== */}

      {activeTab === "business-units" && (
        <MasterDataModal
          open={showBusinessUnitModal}
          onClose={() => {
            setShowBusinessUnitModal(false);
            setEditBusinessUnit(null);
          }}
          onSuccess={fetchBusinessUnits}
          title="Business Unit"
          editData={editBusinessUnit}
          idField="business_unit_id"
          codeField={null}
          nameField="business_unit_name"
          nameLabel="Business Unit Name"
          subDivisions={SubDivisions}
          parentDivisions={parentDivisions}
          compactLayout={true}
          extraFields={[
            {
              name: "subdivision_id",
              label: "Sub Division",
              type: "select",
              required: true,
              isId: true,
              options: SubDivisions
                .filter(
                  (item) =>
                    item.active === true
                )
                .map((item) => ({
                  value:
                    item.subdivision_id,
                  label: `${item.subdivision_code} - ${item.subdivision_name}`,
                })),
            },
            {
              name: "subdivision_code",
              label: "Sub Division Code",
              readOnly: true,
            },
            {
              name: "subdivision_name",
              label: "Sub Division Name",
              readOnly: true,
            },
            {
              name: "parent_division_id",
              label: "Parent Division ID",
              readOnly: true,
            },
            {
              name: "parent_division_code",
              label: "Parent Division Code",
              readOnly: true,
            },
            {
              name: "parent_division_name",
              label: "Parent Division Name",
              readOnly: true,
            },
          ]}
          addApi={addBusinessunits}
          updateApi={updateBusinessunits}
        />
      )}

      {/* =====================================================
          ANALYSIS CODE MODAL
      ===================================================== */}

      {activeTab === "analysis-codes" && (
        <MasterDataModal
          open={showAnalysisCodeModal}
          onClose={() => {
            setShowAnalysisCodeModal(false);
            setEditAnalysisCode(null);
          }}
          onSuccess={fetchAnalysisCodes}
          title="Analysis Code"
          editData={editAnalysisCode}
          idField="analysis_code_id"
          codeField="analysis_code"
          nameField="analysis_name"
          codeLabel="Analysis Code"
          nameLabel="Analysis Name"
          subDivisions={SubDivisions}
          parentDivisions={parentDivisions}
          compactLayout={true}
          extraFields={[
            {
              name: "subdivision_id",
              label: "Sub Division",
              type: "select",
              required: true,
              isId: true,
              options: SubDivisions
                .filter(
                  (item) =>
                    item.active === true
                )
                .map((item) => ({
                  value:
                    item.subdivision_id,
                  label: `${item.subdivision_code} - ${item.subdivision_name}`,
                })),
            },
            {
              name: "subdivision_code",
              label: "Sub Division Code",
              readOnly: true,
            },
            {
              name: "subdivision_name",
              label: "Sub Division Name",
              readOnly: true,
            },
            {
              name: "parent_division_id",
              label: "Parent Division ID",
              readOnly: true,
            },
            {
              name: "parent_division_code",
              label: "Parent Division Code",
              readOnly: true,
            },
            {
              name: "parent_division_name",
              label: "Parent Division Name",
              readOnly: true,
            },
          ]}
          addApi={addAnalysisCodes}
          updateApi={updateAnalysisCodes}
        />
      )}

      {/* =====================================================
          EDIT CONFIRMATION
      ===================================================== */}

      <ConfirmationModel
        open={showEditConfirm}
        title={`Edit ${getMasterDataTitle()}`}
        message={`Do you want to edit this ${getMasterDataTitle()}?`}
        confirmText="Edit"
        cancelText="Cancel"
        onCancel={() => {
          setShowEditConfirm(false);
          setSelectedEditItem(null);
        }}
        onConfirm={async () => {
          if (!selectedEditItem) return;

          switch (activeTab) {
            case "legal-groups": {
              setEditLegalGroup({
                ...selectedEditItem,
              });

              setShowAddModal(true);
              break;
            }

            case "legal-entities":
              setEditLegalEntity(
                selectedEditItem
              );
              setShowEntityModal(true);
              break;

            case "parent-divisions": {
              try {
                const response =
                  await getParentDivisionLegalEntities(
                    selectedEditItem.parent_division_id
                  );

                const data =
                  response.data.data ||
                  response.data ||
                  [];

                const legalEntityIds =
                  data.map(
                    (entity) =>
                      entity.legal_entity_id
                  );

                setEditParentDivision({
                  ...selectedEditItem,
                  legal_entity_ids:
                    legalEntityIds,
                });

                setShowParentDivisionModal(
                  true
                );
              } catch (error) {
                console.error(
                  "Parent Division Legal Entity mapping error:",
                  error?.response?.data ||
                    error
                );

                toast.error(
                  "Unable to load Legal Entities"
                );
              }

              break;
            }

            case "sub-divisions":
              setEditSubDivision(
                selectedEditItem
              );
              setShowSubDivisionModal(true);
              break;

            case "business-units":
              setEditBusinessUnit(
                selectedEditItem
              );
              setShowBusinessUnitModal(true);
              break;

            case "analysis-codes":
              setEditAnalysisCode(
                selectedEditItem
              );
              setShowAnalysisCodeModal(true);
              break;

            case "currencies":
              setEditCurrency(
                selectedEditItem
              );
              setShowCurrencyModal(true);
              break;

            default:
              break;
          }

          setShowEditConfirm(false);
          setSelectedEditItem(null);
        }}
      />

      {/* =====================================================
          CURRENCY MODAL
      ===================================================== */}

      {activeTab === "currencies" && (
        <MasterDataModal
          open={showCurrencyModal}
          onClose={() => {
            setShowCurrencyModal(false);
            setEditCurrency(null);
          }}
          onSuccess={fetchCurrencies}
          title="Currency"
          editData={editCurrency}
          idField="currency_id"
          codeField="currency_code"
          nameField="currency_name"
          codeLabel="Currency Code"
          nameLabel="Currency Name"
          extraFields={[
            {
              name: "conversion_rate_to_aed",
              label: "Conversion Rate to AED",
              type: "number",
              required: true,
            },
          ]}
          addApi={addCurrency}
          updateApi={updateCurrency}
        />
      )}
    </div>
  );
}