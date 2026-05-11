param(
    [Parameter(Mandatory = $true)]
    [string]$FrontendUrl,

    [Parameter(Mandatory = $true)]
    [string]$BackendUrl,

    [string]$Username,
    [string]$Password,
    [int]$LessonId
)

$ErrorActionPreference = "Stop"

function Write-CheckResult {
    param(
        [string]$Label,
        [bool]$Success,
        [string]$Detail
    )

    if ($Success) {
        Write-Host "[PASS] $Label - $Detail" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $Label - $Detail" -ForegroundColor Red
    }
}

function Get-Json {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers,
        [object]$Body
    )

    if ($Body) {
        return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10)
    }

    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers
}

$frontendBase = $FrontendUrl.TrimEnd("/")
$backendBase = $BackendUrl.TrimEnd("/")
$apiBase = "$backendBase/api"
$originHeader = @{ Origin = $frontendBase }

try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendBase -UseBasicParsing
    Write-CheckResult "Frontend" ($frontendResponse.StatusCode -eq 200) "HTTP $($frontendResponse.StatusCode)"
} catch {
    Write-CheckResult "Frontend" $false $_.Exception.Message
}

try {
    $backendResponse = Invoke-WebRequest -Uri "$apiBase/test/" -Headers $originHeader -UseBasicParsing
    Write-CheckResult "Backend health" ($backendResponse.StatusCode -eq 200) "HTTP $($backendResponse.StatusCode)"
} catch {
    Write-CheckResult "Backend health" $false $_.Exception.Message
}

try {
    $corsResponse = Invoke-WebRequest -Method Options -Uri "$apiBase/test/" -Headers @{
        Origin = $frontendBase
        "Access-Control-Request-Method" = "GET"
    } -UseBasicParsing
    $allowOrigin = $corsResponse.Headers["Access-Control-Allow-Origin"]
    Write-CheckResult "CORS preflight" ($allowOrigin -eq $frontendBase) "Allow-Origin=$allowOrigin"
} catch {
    Write-CheckResult "CORS preflight" $false $_.Exception.Message
}

if ($Username -and $Password) {
    try {
        $tokenPayload = @{
            username = $Username
            password = $Password
        }
        $tokens = Get-Json -Method Post -Url "$apiBase/token/" -Headers @{} -Body $tokenPayload
        $accessToken = $tokens.access
        $authHeaders = @{
            Authorization = "Bearer $accessToken"
            Origin = $frontendBase
        }
        Write-CheckResult "Authentication" ([string]::IsNullOrWhiteSpace($accessToken) -eq $false) "JWT issued"

        $dashboard = Get-Json -Method Get -Url "$apiBase/dashboard/" -Headers $authHeaders -Body $null
        Write-CheckResult "Dashboard API" ([string]::IsNullOrWhiteSpace($dashboard.username) -eq $false) "User=$($dashboard.username)"

        if ($LessonId -gt 0) {
            $progressPayload = @{
                progress = 15
                completed = $false
            }
            $progressResponse = Get-Json -Method Post -Url "$apiBase/lessons/$LessonId/progress/" -Headers $authHeaders -Body $progressPayload
            $saved = $progressResponse.progress -eq 15
            Write-CheckResult "Database write" $saved "Saved progress=$($progressResponse.progress)"
        }
    } catch {
        Write-CheckResult "Authenticated checks" $false $_.Exception.Message
    }
} else {
    Write-Host "[SKIP] Authenticated checks skipped. Pass -Username and -Password to test JWT, protected endpoints, and DB writes." -ForegroundColor Yellow
}
