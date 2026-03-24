# Global Press レポート自動生成システム

## セットアップ手順

### ① GitHubにアップロードする方法

1. GitHub.com にログイン
2. 右上の「+」→「New repository」をクリック
3. Repository name: `globalpress-report`
4. 「Create repository」をクリック
5. 画面の指示に従ってファイルをアップロード
   - 「uploading an existing file」をクリック
   - このフォルダのファイルを全部ドラッグ＆ドロップ
   - 「Commit changes」をクリック

### ② Vercelにデプロイする方法

1. Vercel.com にログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリ「globalpress-report」を選択
4. 「Environment Variables」に以下を追加：
   - Name: `ANTHROPIC_API_KEY`
   - Value: あなたのAPIキー（sk-ant-api03-...）
5. 「Deploy」をクリック
6. 数分後にURLが発行されます！

### ③ 使い方

1. 発行されたURLをブラウザで開く
2. 配信概要を入力
3. CSVファイルをアップロード
4. スクリーンショット画像をアップロード
5. 「Wordレポートを生成」をクリック
6. 自動でダウンロードされます！

## ローカルで試す場合

```bash
npm install
npm run dev
```

http://localhost:3000 で確認できます。
