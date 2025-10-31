document.addEventListener("DOMContentLoaded", () => {
  // AOSライブラリの初期化
  AOS.init();

  /**
   * ユーティリティ：シード値に基づく疑似乱数生成器を作成
   * @param {number} seed - 乱数のシード値
   * @returns {function(): number} 0から1の間の乱数を返す関数
   */
  function createSeededRandom(seed) {
    let state = seed;
    return function () {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  /**
   * ダークモードの切り替え機能をセットアップ
   */
  function setupThemeToggle() {
    const toggleDarkButton = document.getElementById("toggleDark");
    if (!toggleDarkButton) return;

    // テーマを適用する共通関数
    const applyTheme = (theme) => {
      if (theme === "dark") {
        document.body.classList.add("dark-mode");
        toggleDarkButton.textContent = "☀️";
      } else {
        document.body.classList.remove("dark-mode");
        toggleDarkButton.textContent = "🌙";
      }
    };

    // ページ読み込み時に保存されたテーマを適用
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    // ボタンクリック時のイベント
    toggleDarkButton.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";
      applyTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  /**
   * 「トップへ戻る」ボタンの機能をセットアップ
   */
  function setupScrollTopButton() {
    const scrollBtn = document.getElementById("scrollTopBtn");
    if (!scrollBtn) return;

    window.addEventListener("scroll", () => {
      scrollBtn.style.display = window.scrollY > 100 ? "block" : "none";
    });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /**
   * ギャラリーのフィルター機能をセットアップ
   */
  function setupGalleryFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");

    // フィルターボタンがない場合は何もしない
    if (filterButtons.length === 0) return;

    const galleryItems = document.querySelectorAll(".gallery-item");

    const filterImages = (category) => {
      galleryItems.forEach((item) => {
        const isVisible =
          category === "all" || item.dataset.category === category;
        item.style.display = isVisible ? "block" : "none";
      });
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // 全てのボタンから 'active' クラスを削除
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        // クリックされたボタンに 'active' クラスを追加
        button.classList.add("active");

        const category = button.getAttribute("data-category");
        filterImages(category);
      });
    });
  }

  /**
   * ギャラリーの画像を非同期で読み込む
   */
  async function loadGallery() {
    const galleryContainer = document.getElementById("galleryContainer");
    if (!galleryContainer) return;

    try {
      const response = await fetch("gallery.json"); // あなたのJSONファイルを指定
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const images = await response.json();

      // --- ▼ 修正箇所 ▼ ---

      // 重複をチェック（original_srcを基準にする）
      const seenUrls = new Set();
      const uniqueImages = images.filter((img) => {
        // original_srcをユニークなキーとして使用
        const uniqueKey = img.original_src;
        // キーが存在しないか、既にSetにあれば除外
        if (!uniqueKey || seenUrls.has(uniqueKey)) {
          return false;
        } else {
          seenUrls.add(uniqueKey);
          return true;
        }
      });

      galleryContainer.innerHTML = ""; // コンテナをクリア
      const seededRandom = createSeededRandom(Date.now());
      const fragment = document.createDocumentFragment();

      uniqueImages.forEach((img) => {
        const col = document.createElement("div");

        const r = seededRandom();
        let sizeClass = "";
        if (r < 0.1) sizeClass = "is-large";
        else if (r < 0.2) sizeClass = "is-wide";
        else if (r < 0.4) sizeClass = "is-tall";

        col.className = `gallery-item ${sizeClass}`.trim();
        col.dataset.category = img.category;
        col.dataset.aos = "zoom-in";

        // JSONのキーに合わせてパスを割り当てる
        const thumbnailUrl = img.src; // <img>タグ用の圧縮画像パス
        const fullUrl = img.original_src; // <a>タグ用のオリジナル画像パス

        col.innerHTML = `
        <a href="${fullUrl}" data-lightbox="gallery" data-title="${img.title}">
          <img src="${thumbnailUrl}" class="img-fluid" alt="${img.title}" loading="lazy" decoding="async" />
        </a>
      `;
        fragment.appendChild(col);
      });

      galleryContainer.appendChild(fragment);
      // フィルター機能のセットアップを忘れずに呼び出す
      setupGalleryFilters();

      // --- ▲ 修正ここまで ▲ ---
    } catch (error) {
      console.error("ギャラリーの読み込みに失敗しました:", error);
      galleryContainer.innerHTML =
        '<p class="text-danger">ギャラリーの読み込みに失敗しました。</p>';
    }
  }

  /**
   * ブログ記事一覧を非同期で読み込む
   */
  async function loadBlogs() {
    const blogList = document.getElementById("blogList");
    if (!blogList) return;

    try {
      const response = await fetch("blogs.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blogs = await response.json();

      blogList.innerHTML = ""; // リストをクリア

      const fragment = document.createDocumentFragment();
      blogs.forEach((blog, idx) => {
        const a = document.createElement("a");
        a.className = "list-group-item list-group-item-action";
        a.href = `blog-post.html?id=${blog.id}`;
        a.dataset.aos = "fade-right";
        a.dataset.aosDelay = idx * 100;
        a.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${blog.title}</h5>
            <small>${blog.date}</small>
          </div>
          <p class="mb-1">${blog.desc}</p>
        `;
        fragment.appendChild(a);
      });
      blogList.appendChild(fragment);
    } catch (error) {
      console.error("ブログ記事の読み込みに失敗しました:", error);
      blogList.innerHTML =
        '<p class="text-danger">ブログ記事の読み込みに失敗しました。</p>';
    }
  }

  /**
   * プロフィールカードの表示制御をセットアップ
   */
  function setupProfileCard() {
    const profileCard = document.getElementById('profileCard');
    if (!profileCard) return;

    let lastScrollY = window.scrollY;
    const showThreshold = 300; // スクロール開始位置

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > showThreshold) {
        profileCard.style.display = 'block';
        if (currentScrollY > lastScrollY) {
          // 下スクロール時
          profileCard.style.transform = 'translateY(20px)';
          profileCard.style.opacity = '0';
        } else {
          // 上スクロール時
          profileCard.style.transform = 'translateY(0)';
          profileCard.style.opacity = '1';
        }
      } else {
        profileCard.style.display = 'none';
      }
      
      lastScrollY = currentScrollY;
    });
  }

  // 各機能の初期化
  setupThemeToggle();
  setupScrollTopButton();
  setupProfileCard();
  loadGallery();
  loadBlogs();
});
