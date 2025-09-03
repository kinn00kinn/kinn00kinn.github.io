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

  // Seeded random number generator function
  function createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  // ギャラリー生成
  async function loadGallery() {
    const galleryContainer = document.getElementById("galleryContainer");
    if (!galleryContainer) return;

    try {
      const response = await fetch("gallery.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const images = await response.json();
      galleryContainer.innerHTML = ""; // 既存のギャラリーをクリア

      const seededRandom = createSeededRandom(images.length); // Use image count as a seed

      images.forEach((img, idx) => {
        const compressedSrc = img.src.replace("images/", "images_compressed/").replace(/\.[^/.]+$/, "") + ".webp";
        const col = document.createElement("div");
        
        // Base class
        let classList = ['gallery-item'];

        // Add random size classes based on the seeded RNG
        const r = seededRandom();
        if (r < 0.1) { // 10% chance for large
          classList.push('is-large');
        } else if (r < 0.2) { // 10% chance for wide
          classList.push('is-wide');
        } else if (r < 0.4) { // 20% chance for tall
          classList.push('is-tall');
        }
        // Otherwise (60% chance), it remains a standard 1x1 tile

        col.className = classList.join(' ');
        col.dataset.category = img.category;
        col.dataset.aos = "zoom-in";

        col.innerHTML = `
          <a href="${compressedSrc}" data-lightbox="gallery" data-title="${img.title}">
            <img src="${compressedSrc}" class="img-fluid" alt="${img.title}" loading="lazy" />
          </a>
        `;
        galleryContainer.appendChild(col);
      });

      filterImages("all"); // 初期はすべての画像を表示
    } catch (error) {
      console.error("ギャラリーの読み込みに失敗しました:", error);
      galleryContainer.innerHTML = '<p class="text-danger">ギャラリーの読み込みに失敗しました。</p>';
    }
  }

  // フィルタリング関数
  function filterImages(category) {
    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.style.display =
        category === "all" || item.dataset.category === category
          ? "block"
          : "none";
    });
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

  loadGallery(); // ギャラリーをロード
  loadBlogs(); // ページ読み込み時にブログをロード
});
