function generateTOC() {
  const articleBody = document.getElementById("article-body");
  const headings = articleBody.querySelectorAll("h2, h3");
  if (headings.length === 0) return;
  const tocContainer = document.createElement("nav");
  tocContainer.className = "mb-4 toc"; 
  tocContainer.innerHTML = "<h3>目次</h3>";
  const ul = document.createElement("ul");
  ul.className = "list-unstyled";
  headings.forEach((heading, i) => {
    const id = `toc-${i}`;
    heading.id = id;
    const li = document.createElement("li");
    li.style.marginLeft = heading.tagName === "H3" ? "1rem" : "0";
    li.innerHTML = `<a href="#${id}">${heading.textContent}</a>`;
    ul.appendChild(li);
  });
  tocContainer.appendChild(ul);
  const articleElement = document.getElementById("blog-article-content");
  const dateElem = document.getElementById("article-date");
  if (articleElement && dateElem && dateElem.parentNode === articleElement) {
    articleElement.insertBefore(tocContainer, dateElem.nextSibling);
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  const toggleDarkButtonBlog = document.getElementById("toggleDarkBlog");
  const currentThemeBlog = localStorage.getItem("theme");
  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      if (toggleDarkButtonBlog) toggleDarkButtonBlog.textContent = "☀️";
    } else {
      document.body.classList.remove("dark-mode");
      if (toggleDarkButtonBlog) toggleDarkButtonBlog.textContent = "🌙";
    }
  }
  applyTheme(currentThemeBlog);
  if (toggleDarkButtonBlog) {
    toggleDarkButtonBlog.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      let theme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";
      localStorage.setItem("theme", theme);
      applyTheme(theme);
    });
  }
  const params = new URLSearchParams(window.location.search);
  const mdFileId = params.get("id");
  if (mdFileId) {
    try {
      const responseMeta = await fetch("blogs.json");
      if (!responseMeta.ok) throw new Error("Blog metadata not found");
      const blogs = await responseMeta.json();
      const postMeta = blogs.find((blog) => blog.id === mdFileId);
      if (!postMeta) throw new Error("Post not found");
      document.title = postMeta.title + " - 写真ポートフォリオ";
      document.getElementById("blog-title-breadcrumb").textContent = postMeta.title;
      document.getElementById("article-title").textContent = postMeta.title;
      document.getElementById("article-date").textContent = "公開日: " + postMeta.date;
      const responseMd = await fetch(`blog/md/${postMeta.mdFile}`);
      if (!responseMd.ok) throw new Error(`Markdown file not found`);
      const markdownText = await responseMd.text();
      const rawHtml = marked.parse(markdownText);
      const articleBody = document.getElementById("article-body");
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = rawHtml;
      tempDiv.querySelectorAll('img').forEach(img => {
        if (img.src.includes('/images/')) {
            try {
                const originalUrl = new URL(img.src);
                const imageName = originalUrl.pathname.split('/').pop();
                const baseName = imageName.substring(0, imageName.lastIndexOf('.'));
                const hash = originalUrl.hash;
                originalUrl.pathname = `/images_compressed/${baseName}.webp`;
                img.src = originalUrl.pathname + hash;
            } catch (e) {
                const srcParts = img.src.split('#');
                const pathWithoutHash = srcParts[0];
                const hash = srcParts.length > 1 ? '#' + srcParts[1] : '';
                const pathPartsBasedOnImages = pathWithoutHash.split('images/');
                if (pathPartsBasedOnImages.length > 1) {
                    const imageName = pathPartsBasedOnImages[1];
                    const baseName = imageName.substring(0, imageName.lastIndexOf('.'));
                    img.src = `images_compressed/${baseName}.webp` + hash;
                }
            }
        }
        img.loading = 'lazy';
        img.decoding = 'async';
        try {
          const url = new URL(img.src);
          const hash = url.hash;
          if (hash.startsWith('#width=')) {
            const width = hash.substring('#width='.length);
            if (width && !isNaN(width)) {
              img.style.maxWidth = `${width}px`;
              img.style.height = 'auto';
              img.style.display = 'block'; 
              img.style.marginLeft = 'auto';
              img.style.marginRight = 'auto';
            }
          }
        } catch (e) {
          const srcParts = img.src.split('#');
          if (srcParts.length > 1) {
            const hash = srcParts[1];
            if (hash.startsWith('width=')) {
              const width = hash.substring('width='.length);
              if (width && !isNaN(width)) {
                img.style.maxWidth = `${width}px`;
                img.style.height = 'auto';
                img.style.display = 'block';
                img.style.marginLeft = 'auto';
                img.style.marginRight = 'auto';
              }
            }
          }
        }
      });
      articleBody.innerHTML = tempDiv.innerHTML;
      generateTOC();
    } catch (error) {
      console.error("Error loading article:", error);
      document.getElementById("article-body").innerHTML = `<p class="text-danger">記事の読み込み中にエラーが発生しました: ${error.message}</p>`;
    }
  } else {
    document.getElementById("article-body").innerHTML = '<p class="text-warning">表示する記事が指定されていません。</p>';
  }
});