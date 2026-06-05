. .\test_manager_apis.ps1; Invoke-RestMethod -Uri "/recurring-tasks/manager/branches" -Headers $H | ConvertTo-Json -Depth 5
