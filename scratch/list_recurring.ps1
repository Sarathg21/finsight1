$content = Get-Content 'C:\Users\SARATH\Project UAE\RolebasedtaskMS\openapi.json' -Raw | ConvertFrom-Json
$content.paths.PSObject.Properties.Name | Select-String 'recurring'
