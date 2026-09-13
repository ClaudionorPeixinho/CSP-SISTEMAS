' Creates a Windows .lnk shortcut. Used by Instalar.bat — batch files can't
' create shortcuts on their own, but every Windows install ships the VBScript
' engine (cscript/wscript), so this needs no extra tool.
'
' Usage: cscript //nologo create_shortcut.vbs <FolderKey> <ShortcutName> <TargetPath> <WorkingDirectory> <IconPath>
'   FolderKey: "Desktop" or "StartMenu"

Dim folderKey, shortcutName, targetPath, workingDir, iconPath
folderKey = WScript.Arguments(0)
shortcutName = WScript.Arguments(1)
targetPath = WScript.Arguments(2)
workingDir = WScript.Arguments(3)
If WScript.Arguments.Count > 4 Then
  iconPath = WScript.Arguments(4)
Else
  iconPath = ""
End If

Dim shell, targetFolder
Set shell = CreateObject("WScript.Shell")

If folderKey = "StartMenu" Then
  targetFolder = shell.SpecialFolders("Programs")
Else
  targetFolder = shell.SpecialFolders("Desktop")
End If

Dim link
Set link = shell.CreateShortcut(targetFolder & "\" & shortcutName & ".lnk")
link.TargetPath = targetPath
link.WorkingDirectory = workingDir
link.WindowStyle = 1
link.Description = "CSP Sistemas Digitais"
If iconPath <> "" Then
  link.IconLocation = iconPath
End If
link.Save
