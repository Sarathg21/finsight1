$content = Get-Content 'C:\Users\SARATH\Project UAE\RolebasedtaskMS\openapi.json' -Raw | ConvertFrom-Json
$content.paths.PSObject.Properties.Name | Select-String 'recurring'
Write-Host "---"
$subtaskPatch = $content.paths.'/recurring-tasks/{recurring_task_id}/subtasks/{subtask_id}'
if ($subtaskPatch) {
    $subtaskPatch | ConvertTo-Json -Depth 10
} else {
    Write-Host "Path not found"
}
Write-Host "---"
Write-Host "Schemas for RecurringSubtask:"
$schemas = $content.components.schemas.PSObject.Properties | Where-Object { $_.Name -like '*Subtask*' -or $_.Name -like '*Recurring*' }
foreach ($s in $schemas) {
    Write-Host "SCHEMA:" $s.Name
    $s.Value | ConvertTo-Json -Depth 5
}
