document.addEventListener("DOMContentLoaded", () => {
  AOS.init();
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
  const scrollBtn = document.getElementById("scrollTopBtn");
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.style.display = window.scrollY > 100 ? "block" : "none";
    });
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  function createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
  async function loadGallery() {
    const galleryContainer = document.getElementById("galleryContainer");
    if (!galleryContainer) return;
    try {
      const response = await fetch("gallery.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const images = await response.json();
      galleryContainer.innerHTML = ""; 
      var now_tiem = new Date();
      const seededRandom = createSeededRandom(now_tiem.getMilliseconds()); 
      images.forEach((img, idx) => {
        const compressedSrc = img.src; 
        const col = document.createElement("div");
        let classList = ['gallery-item'];
        const r = seededRandom();
        if (r < 0.1) { 
          classList.push('is-large');
        } else if (r < 0.2) { 
          classList.push('is-wide');
        } else if (r < 0.4) { 
          classList.push('is-tall');
        }
        col.className = classList.join(' ');
        col.dataset.category = img.category;
        col.dataset.aos = "zoom-in";
        col.innerHTML = `
          <a href="${img.src || compressedSrc}" data-lightbox="gallery" data-title="${img.title}">
            <img src="${compressedSrc}" class="img-fluid" alt="${img.title}" loading="lazy" decoding="async" />
          </a>
        `;
        galleryContainer.appendChild(col);
      });
      filterImages("all"); 
    } catch (error) {
      console.error("ギャラリーの読み込みに失敗しました:", error);
      galleryContainer.innerHTML = '<p class="text-danger">ギャラリーの読み込みに失敗しました。</p>';
    }
  }
  function filterImages(category) {
    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.style.display =
        category === "all" || item.dataset.category === category
          ? "block"
          : "none";
    });
  }
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
  async function loadBlogs() {
    const blogList = document.getElementById("blogList");
    if (!blogList) return;
    try {
      const response = await fetch("blogs.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blogs = await response.json();
      blogList.innerHTML = ""; 
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
        blogList.appendChild(a);
      });
    } catch (error) {
      console.error("ブログ記事の読み込みに失敗しました:", error);
      if (blogList) {
        blogList.innerHTML =
          '<p class="text-danger">ブログ記事の読み込みに失敗しました。しばらくしてから再度お試しください。</p>';
      }
    }
  }
  loadGallery(); 
  loadBlogs(); 
});