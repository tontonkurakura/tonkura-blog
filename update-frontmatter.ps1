# Neurologyディレクトリ内のすべてのMarkdownファイルのYAMLフロントマターを更新するスクリプト

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

            # 現在の日付を取得（YYYY-MM-DD形式）
            $today = Get-Date -Format "yyyy-MM-dd"

            # 既存のLast edited timeがあるか確認
            if ($yaml -match "Last edited time: '([^']*)'") {
                $lastEditedTime = $Matches[1]
                # 日付部分だけを抽出（YYYY-MM-DDTxx:xx形式から）
                if ($lastEditedTime -match "^(\d{4}-\d{2}-\d{2})") {
                    $lastEditedDate = $Matches[1]
                } else {
                    $lastEditedDate = $today
                }
            } else {
                $lastEditedDate = $today
            }

            # last_editedフィールドが既に存在するか確認
            if ($yaml -match "last_edited: ") {
                # 既存のlast_editedフィールドを更新
                $newYaml = $yaml -replace "last_edited: .*", "last_edited: $lastEditedDate"
            } else {
                # last_editedフィールドを追加
                $newYaml = $yaml + "`nlast_edited: $lastEditedDate"
            }

            # 更新されたコンテンツを作成
            $updatedContent = "---`n$newYaml`n---`n$restOfContent"

            # ファイルに書き込む
            Set-Content -Path $file.FullName -Value $updatedContent -NoNewline

            $processedCount++
            Write-Host "更新しました: $($file.FullName)"
        } else {
            # YAMLフロントマターがない場合は、新しく作成
            $today = Get-Date -Format "yyyy-MM-dd"
            $newYaml = "---`nlast_edited: $today`nlastmod: '2025-02-26'`n---`n"
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