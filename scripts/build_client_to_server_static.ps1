# Define the paths
$clientFolder = "..\client"
$buildOutputFolder = "$clientFolder\build"
$serverStaticFolder = "..\server\static"

# Navigate to the client folder
Set-Location -Path $clientFolder

# Run npm build
npm run build

Start-Sleep -Seconds 1

# Clean up the static folder
Remove-Item -Path "$serverStaticFolder\*" -Recurse -Force

Start-Sleep -Seconds 1

# Move the build output to the server's static folder
Get-ChildItem -Path $buildOutputFolder -Recurse | Move-Item -Destination $serverStaticFolder -Force

Start-Sleep -Seconds 1

# # Move files from $serverStaticFolder/static to its parent directory
$staticSubFolder = "$serverStaticFolder\static"
Get-ChildItem -Path $staticSubFolder -Recurse | Move-Item -Destination $serverStaticFolder -Force

Start-Sleep -Seconds 1

# Optionally, remove the now-empty static subfolder
Remove-Item -Path $staticSubFolder -Force

# Replace favicon.ico path in index.html
$indexPath = "$serverStaticFolder\index.html"
(Get-Content -Path $indexPath) -replace 'favicon.ico', 'static/favicon.ico' | Set-Content -Path $indexPath
