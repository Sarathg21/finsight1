import api from './api';

const toIsoDate = (d) => {
  if (!d) return '';
  if (typeof d === 'string') return d;
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

const extractArr = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const k of ['data', 'items', 'results', 'records', 'rows']) {
    if (Array.isArray(data[k])) return data[k];
  }
  return [];
};

const serializeRepeatedParams = (params) => {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v === '' || v === null || v === undefined) return;
        sp.append(key, String(v));
      });
      return;
    }
    sp.append(key, String(value));
  });
  return sp.toString();
};

const mapDropdownOptions = (raw) => {
  const arr = extractArr(raw);
  return arr
    .map((x) => {
      const value =
        x?.value ??
        x?.id ??
        x?.task_id ??
        x?.parent_task_id ??
        x?.sub_task_id ??
        x?.emp_id ??
        x?.employee_id;
      const label =
        x?.label ??
        x?.name ??
        x?.title ??
        x?.task_title ??
        x?.parent_task_title ??
        x?.sub_task_title ??
        x?.emp_name ??
        x?.employee_name;
      if (!value || !label) return null;
      return { value: String(value), label: String(label) };
    })
    .filter(Boolean);
};

export const listOkrActions = async ({
  parent_task_id,
  sub_task_id,
  manager_emp_id,
  assigned_to_emp_id,
  status,
  from_date,
  to_date,
  search,
  page,
  limit,
} = {}) => {
  const params = {
    parent_task_id,
    sub_task_id,
    manager_emp_id: manager_emp_id || [],
    assigned_to_emp_id: assigned_to_emp_id || [],
    status: status || [],
    from_date: toIsoDate(from_date),
    to_date: toIsoDate(to_date),
    search,
    page,
    limit,
  };

  const res = await api.get('/okr-actions', {
    params,
    paramsSerializer: { serialize: serializeRepeatedParams },
  });
  return res.data || {};
};

export const fetchParentTasksDropdown = async ({ exclude_closed = true } = {}) => {
  const res = await api.get('/okr-actions/dropdowns/parent-tasks', {
    params: { exclude_closed },
  });
  return mapDropdownOptions(res.data);
};

export const fetchSubTasksDropdown = async ({ parent_task_id, exclude_closed = true } = {}) => {
  if (!parent_task_id) return [];
  const res = await api.get('/okr-actions/dropdowns/sub-tasks', {
    params: { parent_task_id, exclude_closed },
  });
  return mapDropdownOptions(res.data);
};

export const fetchManagersDropdown = async ({ parent_task_id, exclude_closed = true } = {}) => {
  if (!parent_task_id) return [];
  const res = await api.get('/okr-actions/dropdowns/managers', {
    params: { parent_task_id, exclude_closed },
  });
  return mapDropdownOptions(res.data);
};

export const fetchAssignedEmployeesDropdown = async ({
  parent_task_id,
  sub_task_id,
  manager_emp_id,
  exclude_closed = true,
} = {}) => {
  if (!parent_task_id) return [];
  const res = await api.get('/okr-actions/dropdowns/assigned-employees', {
    params: { parent_task_id, sub_task_id, manager_emp_id, exclude_closed },
  });
  return mapDropdownOptions(res.data);
};

