# 管理者権限を要求するスクリプト
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "管理者権限が必要です。管理者として再実行します..."
    $arguments = "& '" + $MyInvocation.MyCommand.Definition + "'"
    Start-Process powershell -Verb RunAs -ArgumentList $arguments
    Exit
}

# スクリプトのディレクトリを取得
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "スクリプトの場所: $scriptDir"

# 以下は元のclean-frontmatter.ps1の内容
# Neurologyディレクトリ内のすべてのMarkdownファイルのYAMLフロントマターをクリーンアップするスクリプト
# last_edited以外のすべてのフィールドを削除します

# 処理するディレクトリのパス（絶対パスを使用）
$directoryPath = Join-Path $scriptDir "content\neurology"
Write-Host "処理するディレクトリ: $directoryPath"

# ディレクトリが存在するか確認
if (-not (Test-Path $directoryPath)) {
    Write-Error "ディレクトリが見つかりません: $directoryPath"
    Write-Host "Enterキーを押すと終了します..."
    Read-Host
    Exit
}

# すべてのMarkdownファイルを再帰的に取得
$mdFiles = Get-ChildItem -Path $directoryPath -Recurse -Filter "*.md"

# 処理したファイル数をカウント
$processedCount = 0
$errorCount = 0

foreach ($file in $mdFiles) {
    try {
        # ファイルの内容を読み込む
        $content = Get-Content -Path $file.FullName -Raw

        # YAMLフロントマターがあるか確認（---で囲まれたセクション）
        if ($content -match "(?s)^---\s*(.*?)\s*---") {
            $yaml = $Matches[1]
            $restOfContent = $content.Substring($Matches[0].Length)

            # last_editedフィールドの値を抽出
            $lastEditedValue = ""
            if ($yaml -match "last_edited:\s*([^\r\n]*)") {
                $lastEditedValue = $Matches[1].Trim()
            } elseif ($yaml -match "Last edited time:\s*'([^']*)'") {
                # Last edited timeから日付部分を抽出
                $lastEditedTime = $Matches[1]
                if ($lastEditedTime -match "^(\d{4}-\d{2}-\d{2})") {
                    $lastEditedValue = $Matches[1]
                } else {
                    $lastEditedValue = Get-Date -Format "yyyy-MM-dd"
                }
            } else {
                # どちらも存在しない場合は現在の日付を使用
                $lastEditedValue = Get-Date -Format "yyyy-MM-dd"
            }

            # 新しいYAMLフロントマターを作成（last_editedのみ）
            $newYaml = "last_edited: $lastEditedValue"

            # 更新されたコンテンツを作成
            $updatedContent = "---`n$newYaml`n---`n$restOfContent"

            # ファイルに書き込む
            Set-Content -Path $file.FullName -Value $updatedContent -NoNewline

            $processedCount++
            Write-Host "更新しました: $($file.FullName)"
        } else {
            # YAMLフロントマターがない場合は、新しく作成
            $today = Get-Date -Format "yyyy-MM-dd"
            $newYaml = "---`nlast_edited: $today`n---`n"
            $updatedContent = $newYaml + $content

            # ファイルに書き込む
            Set-Content -Path $file.FullName -Value $updatedContent -NoNewline

            $processedCount++
            Write-Host "YAMLフロントマターを追加しました: $($file.FullName)"
        }
    } catch {
        $errorCount++
        Write-Host "エラーが発生しました: $($file.FullName) - $_" -ForegroundColor Red
    }
}

Write-Host "`n処理完了！"
Write-Host "処理したファイル数: $processedCount"
Write-Host "エラーが発生したファイル数: $errorCount" 

# 処理が完了したら一時停止（ウィンドウが閉じないようにする）
Write-Host "`nEnterキーを押すと終了します..."
Read-Host 