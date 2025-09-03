## 📸 写真ポートフォリオ - キンキン

### 概要

このリポジトリは、写真家キンキンのポートフォリオサイトです。風景やポートレート作品のギャラリーに加え、撮影記録を綴るブログ、お問い合わせ機能も備えています。モバイルファーストなレスポンシブデザイン、パフォーマンス最適化、そして管理のしやすさを重視して全面的に改修されました。

---

### 🔧 機能一覧

-   ギャラリー表示（フィルター切り替え：全て / 風景 / ポートレート）
-   Lightbox による画像拡大表示
-   ブログ記事一覧および記事詳細表示
-   Markdownによるブログ執筆
-   お問い合わせリンク（mailto）
-   ダークモード切り替え
-   スクロールトップボタン
-   レスポンシブデザイン（PC・スマホ対応）

---

### 🐍 管理用スクリプト (`manage.py`)

日々のコンテンツ管理を効率化するため、Python製のCLIツール `manage.py` を導入しました。

#### 1. 画像の一括圧縮

`images` フォルダ内の元画像を圧縮し、`images_compressed` フォルダに`.webp`形式で保存します。サイトではこの圧縮後の画像が使用されます。

```bash
python manage.py compress
```

#### 2. 新規ブログ記事の追加

Markdownファイルから新しいブログ記事を簡単に追加できます。

**コマンド形式:**
```bash
python manage.py addpost "Markdownファイルのパス" "記事のタイトル" "記事の短い説明"
```

**実行例:**
```bash
python manage.py addpost "C:\Users\haruk\Documents\new-post.md" "新しい旅の記録" "先日訪れた場所での素晴らしい体験について。"
```
実行後、`blogs.json`が更新され、Markdownファイルは自動で`blog/md/`に移動します。

---

### 🛠️ 使用技術

-   HTML5 / CSS3
-   JavaScript (ES6+)
-   **Python** (コンテンツ管理用)
-   [**Pillow**](https://python-pillow.org/) (画像圧縮)
-   [Bootstrap 4.3.1](https://getbootstrap.com/)
-   [AOS - Animate On Scroll](https://michalsnik.github.io/aos/)
-   [Lightbox2](https://lokeshdhakar.com/projects/lightbox2/)
-   [marked.js](https://marked.js.org/) (Markdownパーサー)
-   Google Fonts（Noto Sans JP）

---

### 🚀 セットアップ手順

1.  このリポジリをクローンします。
    ```bash
    git clone https://github.com/kinn00kinn/portfolio.github.io
    cd portfolio.github.io
    ```

2.  管理スクリプト用のPythonライブラリをインストールします。
    ```bash
    pip install Pillow
    ```

3.  新しい画像は `images/` に追加し、`python manage.py compress` を実行して圧縮します。

4.  新しいブログ記事はMarkdownで作成し、`python manage.py addpost ...` で追加します。

5.  任意のローカルサーバーで `index.html` を開いて確認します。（例：VSCode + Live Server）

---

### 📈 パフォーマンス最適化

-   **画像最適化**: `manage.py`により画像を軽量なWebP形式に変換・圧縮。`images_compressed`フォルダから配信。
-   **遅延読み込み**: ギャラリー画像は`loading="lazy"`を使用し、初期表示を高速化。
-   **データ分離**: ギャラリーとブログのデータは`gallery.json`, `blogs.json`から非同期で読み込み、HTMLの肥大化を防止。
-   **CLS抑制**: 画像に`width`/`height`を明示的に指定し、レイアウトシフトを抑制。
-   **コード分割**: CSSとJSを機能ごとにファイル分割し、可読性とキャッシュ効率を向上。

---

## 📜 プロジェクトの歴史（開発の流れ）

| 日付 | 内容 |
| :--- | :--- |
| 2025年4月 | 初版のHTMLテンプレートを作成。静的な構造と簡単なギャラリーを実装。 |
| 2025年4月中旬 | ブログセクションとメール問い合わせ機能を追加。 |
| 2025年4月下旬 | ダークモード切り替え機能とスクロールトップボタンを追加。 |
| 2025年5月初旬 | モバイル対応・AOSアニメーション・Lightbox導入。 |
| 2025年5月上旬 | パフォーマンス改善（lazyload等）を実施。Lighthouseスコアを改善。 |
| **2025年9月** | **大規模改修を実施。**<br>- 画像圧縮・ブログ投稿の自動化スクリプト(`manage.py`)を導入。<br>- WebP形式への完全移行と非同期読み込みによる高速化。<br>- PC/スマホそれぞれに最適化したレスポンシブUIに刷新。<br>- プロジェクト全体のコード構造を整理・最適化。 |
| 今後の予定 | サービスワーカー導入によるPWA化を検討中。 |

---