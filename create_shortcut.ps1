$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$pwd\SubsMarket.lnk")
$Shortcut.TargetPath = "C:\Windows\System32\cmd.exe"
$Shortcut.Arguments = "/c ""$pwd\start_app.bat"""
$Shortcut.WorkingDirectory = "$pwd"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,238"
$Shortcut.Save()
Write-Host "Shortcut created: SubsMarket.lnk"
