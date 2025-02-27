# 1つのファイルでテストするスクリプト

# テスト用のファイルパス
$filePath = "content/neurology/Symptoms/しびれ.md"

try {
    # ファイルの内容を読み込む
    $content = Get-Content -Path $filePath -Raw
    
    # ファイルの内容を表示（デバッグ用）
    Write-Host "ファイルの内容（最初の100文字）:"
    Write-Host ($content.Substring(0, [Math]::Min(100, $content.Length)))
    
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
            
            Write-Host "抽出した日付: $lastEditedDate"
        } else {
            $lastEditedDate = $today
            Write-Host "Last edited timeが見つからないため、現在の日付を使用: $lastEditedDate"
        }

        # last_editedフィールドが既に存在するか確認
        if ($yaml -match "last_edited: ") {
            # 既存のlast_editedフィールドを更新
            $newYaml = $yaml -replace "last_edited: .*", "last_edited: $lastEditedDate"
            Write-Host "既存のlast_editedフィールドを更新しました"
        } else {
            # last_editedフィールドを追加
            $newYaml = $yaml + "`nlast_edited: $lastEditedDate"
            Write-Host "last_editedフィールドを追加しました"
        }

        # 更新されたコンテンツを作成
        $updatedContent = "---`n$newYaml`n---`n$restOfContent"

        # 更新前と更新後のYAMLを表示
        Write-Host "`n更新前のYAML:"
        Write-Host $yaml
        Write-Host "`n更新後のYAML:"
        Write-Host $newYaml

        # 実際にファイルを更新する場合はコメントを外す
        # Set-Content -Path $filePath -Value $updatedContent -NoNewline
        # Write-Host "`nファイルを更新しました: $filePath"
    } else {
        Write-Host "YAMLフロントマターが見つかりませんでした"
    }
} catch {
    Write-Host "エラーが発生しました: $_" -ForegroundColor Red
} 