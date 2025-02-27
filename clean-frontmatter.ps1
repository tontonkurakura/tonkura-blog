# Neurologyディレクトリ内のすべてのMarkdownファイルのYAMLフロントマターをクリーンアップするスクリプト
# last_edited以外のすべてのフィールドを削除します

# 処理するディレクトリのパス
$directoryPath = "content/neurology"

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