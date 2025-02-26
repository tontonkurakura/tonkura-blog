# Next.jsプロジェクトのキャッシュクリーニングスクリプト

Write-Host "Next.jsプロジェクトのキャッシュをクリアしています..." -ForegroundColor Cyan

# .nextディレクトリを削除
if (Test-Path -Path ".next") {
    Write-Host "ビルドキャッシュ(.next)を削除しています..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
    Write-Host "ビルドキャッシュを削除しました。" -ForegroundColor Green
} else {
    Write-Host ".nextディレクトリは存在しません。" -ForegroundColor Gray
}

# .cacheディレクトリを削除
if (Test-Path -Path ".cache") {
    Write-Host "キャッシュディレクトリ(.cache)を削除しています..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .cache
    Write-Host "キャッシュディレクトリを削除しました。" -ForegroundColor Green
} else {
    Write-Host ".cacheディレクトリは存在しません。" -ForegroundColor Gray
}

# npmのキャッシュをクリア
Write-Host "npmのキャッシュをクリアしています..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "npmのキャッシュをクリアしました。" -ForegroundColor Green

Write-Host "キャッシュのクリーニングが完了しました。" -ForegroundColor Cyan
Write-Host "次のコマンドを実行してプロジェクトを再構築してください:" -ForegroundColor White
Write-Host "npm install" -ForegroundColor Magenta
Write-Host "npm run dev" -ForegroundColor Magenta 