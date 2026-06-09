$content = Get-Content 'C:\Users\SARATH\Project UAE\RolebasedtaskMS\openapi.json' -Raw | ConvertFrom-Json

# Get the subtask path
$pathKey = '/recurring-tasks/{recurring_id}/subtasks/{subtask_template_id}'
$pathObj = $content.paths.$pathKey
Write-Host "=== Methods on subtask endpoint ==="
$pathObj.PSObject.Properties.Name
Write-Host ""

# PATCH schema
if ($pathObj.patch) {
    Write-Host "=== PATCH details ==="
    $pathObj.patch | ConvertTo-Json -Depth 10
}

# Also get the request body schema ref
$schemaRef = $pathObj.patch.requestBody.content.'application/json'.schema.'$ref'
Write-Host "Schema Ref: $schemaRef"

if ($schemaRef) {
    $schemaName = $schemaRef -replace '#/components/schemas/', ''
    Write-Host "Schema name: $schemaName"
    $content.components.schemas.$schemaName | ConvertTo-Json -Depth 10
}
