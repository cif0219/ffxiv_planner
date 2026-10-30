# Publish Echo Raid Lab to the cif0219/ffxiv_planner GitHub repository.
# Run from PowerShell in this folder: .\deploy-github.ps1
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$repository = 'https://github.com/cif0219/ffxiv_planner.git'

# Git for Windows is installed, but some PowerShell sessions do not inherit its PATH.
# Add only for this PowerShell process, without changing Windows system settings.
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $gitDirectory = 'C:\Program Files\Git\cmd'
    if (Test-Path -LiteralPath (Join-Path $gitDirectory 'git.exe')) {
        $env:Path = "$gitDirectory;$env:Path"
        Write-Host 'Found Git for Windows; configured PATH for this session.' -ForegroundColor Cyan
    }
}

function RunGit {
    & git @args
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed (exit $LASTEXITCODE): git $($args -join ' ')"
    }
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Cannot find git.exe. Expected C:\Program Files\Git\cmd\git.exe or Git on PATH.'
}

# Never silently replace a remote configured for a different repository.
$remotes = @(& git remote)
if ($remotes -contains 'origin') {
    $existing = (& git remote get-url origin).Trim()
    if ($existing -ne $repository -and $existing -ne 'https://github.com/cif0219/ffxiv_planner' -and $existing -ne 'git@github.com:cif0219/ffxiv_planner.git') {
        throw "origin points to an unexpected repository: $existing"
    }
} else {
    RunGit remote add origin $repository
}

# Set repository-only commit identity if the machine has never configured Git.
# This uses a GitHub no-reply address so no personal email is required.
if (-not (& git config --get user.name)) {
    RunGit config user.name 'cif0219'
}
if (-not (& git config --get user.email)) {
    RunGit config user.email '21020160+cif0219@users.noreply.github.com'
}

Write-Host 'Checking the current website...' -ForegroundColor Cyan
& npm run check
if ($LASTEXITCODE -ne 0) { throw 'JavaScript syntax checks failed.' }
& npm test
if ($LASTEXITCODE -ne 0) { throw 'Mechanic engine tests failed.' }
RunGit status --short
Write-Host 'Staging the updated static website and deployment settings...' -ForegroundColor Cyan
RunGit add -- README.md dist tests .github deploy-github.ps1 package.json server.mjs .gitignore
& git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    RunGit commit -m 'Update Echo Raid Lab and GitHub Pages'
} elseif ($LASTEXITCODE -ne 0) {
    throw 'Unable to inspect staged changes.'
} else {
    Write-Host 'No new local changes to commit.'
}

Write-Host 'Checking the remote main branch...' -ForegroundColor Cyan
$remoteMain = @(& git ls-remote --heads origin refs/heads/main)
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to check the GitHub repository. Verify its URL and your connection.'
}
if ($remoteMain.Count -gt 0 -and $remoteMain[0]) {
    # Refuse to overwrite or silently merge remote changes.
    RunGit fetch origin main
    & git merge-base --is-ancestor origin/main HEAD
    if ($LASTEXITCODE -eq 1) {
        throw 'Remote main contains changes that must be reviewed and merged before deployment.'
    } elseif ($LASTEXITCODE -ne 0) {
        throw 'Unable to compare local and remote history.'
    }
} else {
    Write-Host 'The new repository has no main branch yet; uploading its first commit.' -ForegroundColor Cyan
}

Write-Host 'Pushing website to GitHub...' -ForegroundColor Cyan
RunGit push -u origin main
Write-Host ''
Write-Host 'Source uploaded successfully.' -ForegroundColor Green
Write-Host 'GitHub Actions will test and publish the dist/ directory to Pages.'
Write-Host 'Then visit: https://cif0219.github.io/ffxiv_planner/'
