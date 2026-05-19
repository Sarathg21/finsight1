import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import ManagerRecurringTasksView from '../components/ManagerRecurring/ManagerRecurringTasksView';

const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    return (
        payload.data ||
        payload.items ||
        payload.results ||
        payload.branches ||
        payload.records ||
        []
    );
};

const unwrapList = (res) => {
    const body = res?.data ?? res;
    if (!body) return [];
    if (Array.isArray(body)) return body;
    return normalizeArray(body);
};

const TEMPLATE_PAGE_SIZE = 10;

const toNonNegativeDayCount = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const buildBranchRecord = ({
    recurring_id,
    subtask_template_id,
    parent_title,
    child_title,
    frequency = '',
    due_in_days = 0,
    start_date = '',
    end_date = '',
    is_active = true,
    active_action_count = null,
    raw = {},
}) => {
    if (!recurring_id || !subtask_template_id) return null;
    return {
        id: `${recurring_id}-${subtask_template_id}`,
        recurring_id,
        subtask_template_id,
        parent_title: parent_title || `Recurring Task RT-${recurring_id}`,
        child_title: child_title || 'Untitled Branch',
        frequency,
        due_in_days: due_in_days ?? 0,
        start_date: start_date || '',
        end_date: end_date || '',
        is_active: is_active !== false,
        active_action_count,
        raw,
    };
};

const mapManagerBranchRow = (row) => {
    if (!row || typeof row !== 'object') return null;

    const recurring_id =
        row.recurring_id ??
        row.recurring_task_id ??
        row.parent_recurring_id ??
        row.parent_id;

    const subtask_template_id =
        row.subtask_template_id ??
        row.subtask_id ??
        row.recurring_subtask_id ??
        row.child_subtask_template_id;

    const status = String(row.status || row.branch_status || '').toUpperCase();
    const is_active =
        row.is_active ??
        row.active ??
        (status ? status !== 'INACTIVE' : undefined) ??
        true;

    return buildBranchRecord({
        recurring_id,
        subtask_template_id,
        parent_title:
            row.parent_title ||
            row.parent_task_title ||
            row.recurring_title ||
            row.parent_name ||
            row.parent?.title,
        child_title:
            row.child_title ||
            row.subtask_title ||
            row.child_task_title ||
            row.subtask_name ||
            row.title ||
            row.child?.title,
        frequency: row.frequency || row.recurring_frequency || row.parent_frequency || '',
        due_in_days: row.due_in_days ?? row.dueDays ?? row.due_in_days_count ?? 0,
        start_date: row.start_date || row.parent_start_date || '',
        end_date: row.end_date || row.parent_end_date || '',
        is_active,
        active_action_count:
            row.active_action_template_count ??
            row.active_employee_action_count ??
            row.action_template_count ??
            row.employee_action_count ??
            null,
        raw: row,
    });
};

const ManagerRecurringTasksPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [profile, setProfile] = useState(null);
    const departmentId =
        profile?.department_id ||
        profile?.dept_id ||
        profile?.department ||
        user?.department_id ||
        user?.dept_id ||
        user?.department;
    const managerId = profile?.emp_id || profile?.id || user?.emp_id || user?.id;

    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [branchLoading, setBranchLoading] = useState(true);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [employeeLoading, setEmployeeLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formMode, setFormMode] = useState('create');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        department_id: departmentId || '',
        assigned_to_emp_id: '',
        priority: 'MEDIUM',
        sequence_no: 1,
        due_in_days: 0,
        is_active: true,
    });
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [templatePage, setTemplatePage] = useState(1);
    const [viewBranch, setViewBranch] = useState(null);

    const departmentLabel = useMemo(() => {
        const code = departmentId || formData.department_id || '';
        const name = profile?.department_name || user?.department_name || user?.department || profile?.department || '';
        if (code && name && !String(name).includes(String(code))) return `${code} - ${name}`;
        return name || code || '—';
    }, [departmentId, formData.department_id, profile, user]);

    const paginatedTemplates = useMemo(() => {
        const start = (templatePage - 1) * TEMPLATE_PAGE_SIZE;
        return templates.slice(start, start + TEMPLATE_PAGE_SIZE);
    }, [templates, templatePage]);

    const templatePageCount = Math.max(1, Math.ceil(templates.length / TEMPLATE_PAGE_SIZE));

    const selectedBranch = useMemo(() => {
        const branch = branches.find(b => b.id === selectedBranchId);
        return branch || branches[0] || null;
    }, [branches, selectedBranchId]);

    useEffect(() => {
        if (branches.length === 0) {
            if (selectedBranchId) setSelectedBranchId(null);
            return;
        }
        const stillValid = branches.some(b => String(b.id) === String(selectedBranchId));
        if (!selectedBranchId || !stillValid) {
            setSelectedBranchId(branches[0].id);
        }
    }, [branches, selectedBranchId]);

    useEffect(() => {
        if (!managerId) return;
        fetchProfile();
    }, [managerId]);

    useEffect(() => {
        if (!managerId) return;
        fetchBranches();
        fetchEmployees();
    }, [managerId, searchParams]);

    useEffect(() => {
        if (departmentId) {
            setFormData(prev => ({ ...prev, department_id: departmentId }));
        }
    }, [departmentId]);

    useEffect(() => {
        if (selectedBranch) {
            fetchTemplates();
        } else {
            setTemplates([]);
        }
        setTemplatePage(1);
    }, [selectedBranch]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setProfile(res.data || null);
        } catch (err) {
            console.warn('Could not refresh manager profile', err);
        }
    };

    const branchFromSearchParams = () => {
        const recurringId = searchParams.get('recurring_id') || searchParams.get('recurringId') || searchParams.get('id');
        const subtaskTemplateId =
            searchParams.get('subtask_template_id') ||
            searchParams.get('subtaskTemplateId') ||
            searchParams.get('subtask_id');
        if (!recurringId || !subtaskTemplateId) return null;
        return buildBranchRecord({
            recurring_id: recurringId,
            subtask_template_id: subtaskTemplateId,
            parent_title: searchParams.get('parent_title') || undefined,
            child_title: searchParams.get('child_title') || undefined,
            frequency: searchParams.get('frequency') || '',
            due_in_days: Number(searchParams.get('due_in_days') || 0),
            start_date: searchParams.get('start_date') || '',
            end_date: searchParams.get('end_date') || '',
        });
    };

    const mergeUniqueBranches = (branchList, urlBranch) => {
        const merged = [urlBranch, ...branchList].filter(Boolean);
        return merged.filter(
            (branch, index, arr) => arr.findIndex(item => String(item.id) === String(branch.id)) === index
        );
    };

    const fetchBranches = async () => {
        setBranchLoading(true);
        const urlBranch = branchFromSearchParams();

        try {
            const res = await api.get('/recurring-tasks/manager/branches', {
                params: { only_active: false },
                timeout: 15000,
            });
            const mapped = unwrapList(res).map(mapManagerBranchRow).filter(Boolean);
            const finalBranches = mergeUniqueBranches(mapped, urlBranch);

            setBranches(finalBranches);

            const urlId = urlBranch?.id;
            if (urlId && finalBranches.some(b => String(b.id) === String(urlId))) {
                setSelectedBranchId(urlId);
            }
        } catch (err) {
            console.error('Failed to fetch manager recurring branches', err);
            if (urlBranch) {
                setBranches([urlBranch]);
                setSelectedBranchId(urlBranch.id);
            } else {
                toast.error('Could not load assigned recurring branches.');
                setBranches([]);
            }
        } finally {
            setBranchLoading(false);
        }
    };

    const fetchEmployees = async () => {
        setEmployeeLoading(true);
        try {
            const res = await api.get('/employees', {
                params: departmentId ? { department_id: departmentId } : {},
            });
            const raw = normalizeArray(res.data || res);
            const filtered = raw
                .filter(emp => {
                    const role = String(emp.role || emp.user_role || '').toUpperCase();
                    const empDept = String(emp.department_id || emp.dept_id || emp.department || '').trim();
                    return (
                        (role === 'EMPLOYEE' || role === 'STAFF' || !emp.role) &&
                        (!departmentId || empDept === String(departmentId).trim())
                    );
                })
                .map(emp => ({
                    id: emp.emp_id || emp.id || emp.employee_id || '',
                    name: emp.name || emp.full_name || emp.employee_name || 'Unknown',
                    department_id: emp.department_id || emp.dept_id || emp.department || departmentId,
                }));
            setEmployees(filtered);
        } catch (err) {
            console.warn('Failed to fetch employees', err);
            setEmployees([]);
        } finally {
            setEmployeeLoading(false);
        }
    };

    const fetchTemplates = async () => {
        if (!selectedBranch?.recurring_id || !selectedBranch?.subtask_template_id) {
            setTemplates([]);
            return;
        }

        setTemplateLoading(true);
        try {
            const res = await api.get('/manager/recurring-action-templates', {
                params: {
                    recurring_id: selectedBranch.recurring_id,
                    subtask_template_id: selectedBranch.subtask_template_id,
                },
            });
            const items = normalizeArray(res.data?.items || res.data);
            setTemplates(
                items.map(item => ({
                    action_template_id: item.action_template_id || item.id || item.template_id,
                    title: item.title || item.name || 'Untitled',
                    description: item.description || item.summary || '',
                    department_id: item.department_id || item.dept_id || departmentId,
                    assigned_to_emp_id: item.assigned_to_emp_id || item.assignee_emp_id || item.assigned_to || '',
                    assigned_to_name: item.assigned_to_name || item.assignee_name || item.employee_name || '',
                    priority: item.priority || item.severity || 'MEDIUM',
                    sequence_no: (item.sequence_no ?? item.sequence) || 1,
                    due_in_days: item.due_in_days ?? item.dueDays ?? item.due_in_days_count ?? 0,
                    is_active: item.is_active ?? item.active ?? true,
                    created_by_emp_id: item.created_by_emp_id || item.approver_emp_id || item.created_by || '',
                }))
            );
        } catch (err) {
            console.error('Failed to load recurring employee templates', err);
            toast.error('Could not load employee recurring templates.');
            setTemplates([]);
        } finally {
            setTemplateLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            department_id: departmentId || '',
            assigned_to_emp_id: '',
            priority: 'MEDIUM',
            sequence_no: 1,
            due_in_days: 0,
            is_active: true,
        });
        setEditingTemplateId(null);
        setFormMode('create');
    };

    const ensureBranchSelected = () => {
        if (branches.length === 0) {
            toast.error('No recurring branches are assigned to you yet. Ask your CFO to assign a child branch.');
            return null;
        }
        const active =
            branches.find(b => String(b.id) === String(selectedBranchId)) ||
            branches.find(b => String(b.id) === String(selectedBranch?.id)) ||
            branches[0];
        if (active && String(active.id) !== String(selectedBranchId)) {
            setSelectedBranchId(active.id);
        }
        return active;
    };

    const handleOpenCreate = () => {
        const branch = ensureBranchSelected();
        if (!branch) return;
        resetForm();
    };

    const handleOpenEdit = (template) => {
        setFormMode('edit');
        setEditingTemplateId(template.action_template_id || template.id);
        setFormData({
            title: template.title || '',
            description: template.description || '',
            department_id: departmentId || template.department_id || '',
            assigned_to_emp_id: template.assigned_to_emp_id || '',
            priority: template.priority || 'MEDIUM',
            sequence_no: template.sequence_no ?? 1,
            due_in_days: template.due_in_days ?? 0,
            is_active: template.is_active ?? true,
        });
    };

    const handleCloseForm = () => {
        resetForm();
    };

    const handleSelectBranch = (branch) => {
        if (!branch) return;
        setSelectedBranchId(branch.id);
        resetForm();
        setViewBranch(null);
    };

    const handleSave = async () => {
        const branch = ensureBranchSelected();
        if (!branch) return;
        if (!formData.title.trim()) {
            toast.error('Task title is required.');
            return;
        }
        if (!formData.assigned_to_emp_id) {
            toast.error('Select an employee to assign.');
            return;
        }
        if (!formData.priority) {
            toast.error('Select a priority.');
            return;
        }
        if (!formData.sequence_no || Number(formData.sequence_no) < 1) {
            toast.error('Sequence number must be at least 1.');
            return;
        }

        const childDueInDays = toNonNegativeDayCount(branch.due_in_days);
        const actionDueInDays = toNonNegativeDayCount(formData.due_in_days);
        if (actionDueInDays > childDueInDays) {
            toast.error(`Action template due days must be less than or equal to child template due days (${childDueInDays}).`);
            return;
        }

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            department_id: departmentId || formData.department_id,
            assigned_to_emp_id: formData.assigned_to_emp_id,
            priority: formData.priority,
            sequence_no: Number(formData.sequence_no),
            due_in_days: actionDueInDays,
        };

        if (formMode === 'edit') {
            payload.is_active = formData.is_active;
        }

        setActionLoading(true);
        try {
            if (formMode === 'create') {
                await api.post(
                    `/manager/recurring-action-templates/${branch.recurring_id}/${branch.subtask_template_id}`,
                    payload
                );
                toast.success('Recurring employee action task created successfully.');
            } else {
                const templateId = editingTemplateId;
                if (!templateId) {
                    toast.error('Unable to identify the template to update.');
                    return;
                }
                await api.patch(`/manager/recurring-action-templates/${templateId}`, payload);
                toast.success('Recurring employee action task updated successfully.');
            }
            fetchTemplates();
            fetchBranches();
            resetForm();
        } catch (err) {
            console.error('Save failed', err);
            toast.error('Could not save the task. Please check the input and try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteCandidate) return;
        const templateId = deleteCandidate.action_template_id || deleteCandidate.id;
        if (!templateId) {
            toast.error('Unable to identify the task to delete.');
            return;
        }

        setActionLoading(true);
        try {
            await api.delete(`/manager/recurring-action-templates/${templateId}`);
            toast.success('Recurring employee task deleted successfully.');
            setDeleteCandidate(null);
            fetchTemplates();
            fetchBranches();
        } catch (err) {
            console.error('Delete failed', err);
            toast.error('Could not delete the task.');
        } finally {
            setActionLoading(false);
        }
    };

    const templateRangeStart = templates.length === 0 ? 0 : (templatePage - 1) * TEMPLATE_PAGE_SIZE + 1;
    const templateRangeEnd = Math.min(templatePage * TEMPLATE_PAGE_SIZE, templates.length);

    return (
        <ManagerRecurringTasksView
            branches={branches}
            branchLoading={branchLoading}
            selectedBranch={selectedBranch}
            selectedBranchId={selectedBranchId}
            onSelectBranch={handleSelectBranch}
            onViewBranch={setViewBranch}
            viewBranch={viewBranch}
            templates={templates}
            paginatedTemplates={paginatedTemplates}
            templateLoading={templateLoading}
            templatePage={templatePage}
            templatePageCount={templatePageCount}
            templateRangeStart={templateRangeStart}
            templateRangeEnd={templateRangeEnd}
            onTemplatePageChange={setTemplatePage}
            onOpenCreate={handleOpenCreate}
            onOpenEdit={handleOpenEdit}
            onDeleteRequest={setDeleteCandidate}
            formMode={formMode}
            formData={formData}
            setFormData={setFormData}
            departmentLabel={departmentLabel}
            employees={employees}
            employeeLoading={employeeLoading}
            actionLoading={actionLoading}
            onCloseForm={handleCloseForm}
            onCancelEdit={resetForm}
            onSave={handleSave}
            deleteCandidate={deleteCandidate}
            onCloseDelete={() => setDeleteCandidate(null)}
            onConfirmDelete={handleDelete}
        />
    );
};

export default ManagerRecurringTasksPage;
