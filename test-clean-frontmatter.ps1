# 1つのファイルでフロントマターのクリーンアップをテストするスクリプト

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

        # 現在のYAMLフロントマターを表示
        Write-Host "`n現在のYAMLフロントマター:"
        Write-Host $yaml

        # last_editedフィールドの値を抽出
        $lastEditedValue = ""
        if ($yaml -match "last_edited:\s*([^\r\n]*)") {
            $lastEditedValue = $Matches[1].Trim()
            Write-Host "既存のlast_edited値を使用: $lastEditedValue"
        } elseif ($yaml -match "Last edited time:\s*'([^']*)'") {
            # Last edited timeから日付部分を抽出
            $lastEditedTime = $Matches[1]
            if ($lastEditedTime -match "^(\d{4}-\d{2}-\d{2})") {
                $lastEditedValue = $Matches[1]
            } else {
                $lastEditedValue = Get-Date -Format "yyyy-MM-dd"
            }
            Write-Host "Last edited timeから抽出した日付: $lastEditedValue"
        } else {
            # どちらも存在しない場合は現在の日付を使用
            $lastEditedValue = Get-Date -Format "yyyy-MM-dd"
            Write-Host "日付情報が見つからないため、現在の日付を使用: $lastEditedValue"
        }

        # 新しいYAMLフロントマターを作成（last_editedのみ）
        $newYaml = "last_edited: $lastEditedValue"

        # 更新されたコンテンツを作成
        $updatedContent = "---`n$newYaml`n---`n$restOfContent"

        # 更新後のYAMLを表示
        Write-Host "`n更新後のYAMLフロントマター:"
        Write-Host $newYaml

        # 実際にファイルを更新する
        Set-Content -Path $filePath -Value $updatedContent -NoNewline
        Write-Host "`nファイルを更新しました: $filePath"
    } else {
        Write-Host "YAMLフロントマターが見つかりませんでした"
    }
} catch {
    Write-Host "エラーが発生しました: $_" -ForegroundColor Red
} 