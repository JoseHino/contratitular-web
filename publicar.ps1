# Sube la web a GitHub (cuenta JoseHino) y activa GitHub Pages.
# Uso: powershell -ExecutionPolicy Bypass -File C:/Users/josem/dev/contratitular-web/publicar.ps1
Set-Location $PSScriptRoot
gh auth switch -u JoseHino | Out-Null
if (-not (Test-Path .git)) { git init -q -b main }
git add -A
git commit -q -m "Web de lanzamiento de la skill Contratitular" 2>$null
if (-not (git remote)) { gh repo create JoseHino/contratitular-web --public --source . --push } else { git push -q origin main }
gh api -X POST repos/JoseHino/contratitular-web/pages -f "source[branch]=main" -f "source[path]=/" 2>$null | Out-Null
if (Test-Path CNAME) { gh api -X PUT repos/JoseHino/contratitular-web/pages -f "cname=$((Get-Content CNAME).Trim())" 2>$null | Out-Null }
gh auth switch -u AMMAConsulting | Out-Null
"Listo. Web: https://josehino.github.io/contratitular-web/ (tarda 1-2 minutos la primera vez)"
