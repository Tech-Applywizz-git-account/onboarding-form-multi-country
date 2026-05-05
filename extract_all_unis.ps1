# Extract universities for ALL countries from universitiesList.md
$content = Get-Content 'src/pages/Onboarding/universitiesList.md' -Raw

# ── Helper: find the Nth top-level JSON object in the file ──────────────────
function Get-JsonBlock($text, $skipCount) {
    $found = 0
    $i = 0
    while ($i -lt $text.Length) {
        if ($text[$i] -eq '{') {
            if ($found -eq $skipCount) {
                # Walk forward to find matching closing brace
                $depth = 0
                $j = $i
                while ($j -lt $text.Length) {
                    if ($text[$j] -eq '{') { $depth++ }
                    elseif ($text[$j] -eq '}') {
                        $depth--
                        if ($depth -eq 0) { return $text.Substring($i, $j - $i + 1) }
                    }
                    $j++
                }
            }
            $found++
        }
        $i++
    }
    return $null
}

# ── USA (block 0) ─────────────────────────────────────────────────────────────
Write-Host "Extracting USA..."
$usJson = Get-JsonBlock $content 0
$usObj  = $usJson | ConvertFrom-Json
$usNames = $usObj.Colleges | ForEach-Object { $_.institution } | Where-Object { $_ }
Write-Host "  USA: $($usNames.Count) institutions"
$usNames | ConvertTo-Json | Set-Content 'src/pages/Onboarding/us_universities.json'

# ── UK (block 1) ─────────────────────────────────────────────────────────────
Write-Host "Extracting UK..."
$ukJson = Get-JsonBlock $content 1
$ukObj  = $ukJson | ConvertFrom-Json
$ukNames = @()
$ukNames += $ukObj.categories.universities.institutions
$ukNames += $ukObj.categories.further_education_colleges.institutions_partial_list
$ukNames += $ukObj.categories.independent_higher_education.institutions
$ukNames += $ukObj.categories.specialist_and_land_based_colleges.institutions
$ukNames = $ukNames | Where-Object { $_ } | Select-Object -Unique
Write-Host "  UK: $($ukNames.Count) institutions"
$ukNames | ConvertTo-Json | Set-Content 'src/pages/Onboarding/uk_universities.json'

# ── Canada + Ireland (block 2: the countries array wrapper) ──────────────────
Write-Host "Extracting Canada & Ireland..."
$ciJson = Get-JsonBlock $content 2
$ciObj  = $ciJson | ConvertFrom-Json

foreach ($countryData in $ciObj.countries) {
    $cName = $countryData.country
    $cInstitutions = @()
    foreach ($cat in $countryData.categories) {
        $cInstitutions += $cat.institutions
    }
    $cInstitutions = $cInstitutions | Where-Object { $_ -and $_ -notmatch '^CEGEPs' } | Select-Object -Unique
    Write-Host "  ${cName}: $($cInstitutions.Count) institutions"

    if ($cName -eq 'Canada') {
        $cInstitutions | ConvertTo-Json | Set-Content 'src/pages/Onboarding/canada_universities.json'
    } elseif ($cName -eq 'Ireland') {
        $cInstitutions | ConvertTo-Json | Set-Content 'src/pages/Onboarding/ireland_universities.json'
    }
}

Write-Host "`nAll JSON files written successfully!"
