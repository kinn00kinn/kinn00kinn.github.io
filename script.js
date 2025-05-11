document.addEventListener("DOMContentLoaded", () => {
  AOS.init();

  // ダークモード切替
  const toggleDarkButton = document.getElementById("toggleDark");
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
    toggleDarkButton.textContent = "☀️";
  } else {
    toggleDarkButton.textContent = "🌙";
  }

  toggleDarkButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    let theme = "light";
    if (document.body.classList.contains("dark-mode")) {
      theme = "dark";
      toggleDarkButton.textContent = "☀️";
    } else {
      toggleDarkButton.textContent = "🌙";
    }
    localStorage.setItem("theme", theme);
  });

  // スクロールトップボタン制御
  const scrollBtn = document.getElementById("scrollTopBtn");
  if (scrollBtn) {
    // 要素が存在するか確認
    window.addEventListener("scroll", () => {
      scrollBtn.style.display = window.scrollY > 100 ? "block" : "none";
    });
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 画像情報 (将来的にはこれもJSONファイルから読み込むとより管理しやすくなります)
  const images = [
    { src: "images/IMG_7391.webp", title: "交通量の多いタイの道路", category: "landscape" },
    { src: "images/IMG_7406.webp", title: "雨が明けたタイの繁華街", category: "landscape" },
    { src: "images/IMG_7443.webp", title: "タイの古い寺院", category: "landscape" },
    { src: "images/IMG_7558.webp", title: "朝日とアンコールワット", category: "landscape" },
    { src: "images/IMG_7563.webp", title: "カンボジアの朝は早い", category: "landscape" },
    { src: "images/IMG_7596.webp", title: "正面に佇むアンコールワット", category: "landscape" },
    { src: "images/IMG_7852.webp", title: "ホーチミン広場", category: "landscape" },
    { src: "images/IMG_7889.webp", title: "ベトナム戦争博物館で展示されているかつて使われた戦闘機", category: "landscape" },
    {
      src: "images/IMG_7933.webp",
      title: "ニャチャンのビーチ",
      category: "portrait",
    },
  ];

  // ギャラリー生成
  const galleryContainer = document.getElementById("galleryContainer");
  if (galleryContainer) {
    // 要素が存在するか確認
    images.forEach((img, idx) => {
      const col = document.createElement("div");
      col.className = "col-12 col-sm-6 col-md-4 mb-4 gallery-item";
      col.dataset.category = img.category;
      col.dataset.aos = "zoom-in";
      col.dataset.aosDelay = idx * 100; // AOSのアニメーション遅延をインデックスに基づいて設定
      col.innerHTML = `
          <a href="${img.src}" data-lightbox="gallery" data-title="${img.title}">
            <img src="${img.src}" class="img-fluid" width="400" height="300" alt="${img.title}" loading="lazy" />
          </a>
        `;
      galleryContainer.appendChild(col);
    });
  }

  // 初期表示（すべて）とフィルタリング関数
  function filterImages(category) {
    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.style.display =
        category === "all" || item.dataset.category === category
          ? "block"
          : "none";
    });
  }

  if (galleryContainer) {
    // ギャラリーコンテナがある場合のみ実行
    filterImages("all"); // 初期はすべての画像を表示
  }

  // フィルタボタン制御
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const category = button.getAttribute("data-category");
      filterImages(category);
    });
  });

  // ブログ読み込み (JSONから)
  async function loadBlogs() {
    const blogList = document.getElementById("blogList");
    if (!blogList) return;

    try {
      const response = await fetch("blogs.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blogs = await response.json();
      blogList.innerHTML = ""; // 既存のリストをクリア

      blogs.forEach((blog, idx) => {
        const a = document.createElement("a");
        a.className = "list-group-item list-group-item-action";
        // hrefをblog-post.htmlへのリンクに変更し、クエリパラメータで記事IDを渡す
        a.href = `blog-post.html?id=${blog.id}`;
        // a.target = "_blank"; // 新しいタブで開きたい場合はコメント解除
        a.dataset.aos = "fade-right";
        a.dataset.aosDelay = idx * 100;
        a.innerHTML = `
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${blog.title}</h5>
                <small>${blog.date}</small>
              </div>
              <p class="mb-1">${blog.desc}</p>
            `;
        blogList.appendChild(a);
      });
    } catch (error) {
      console.error("ブログ記事の読み込みに失敗しました:", error);
      if (blogList) {
        // エラー時にもblogListがnullでないことを確認
        blogList.innerHTML =
          '<p class="text-danger">ブログ記事の読み込みに失敗しました。しばらくしてから再度お試しください。</p>';
      }
    }
  }

  loadBlogs(); // ページ読み込み時にブログをロード
});
