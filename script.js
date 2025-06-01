function copy(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`${text} をコピーしました！`);
  });
}

function toggleSites() {
  const siteList = document.getElementById("siteList");
  siteList.classList.toggle("hidden");
}
function KaihatuLanguage() {
  const siteList = document.getElementById("KaihatuLanguageList");
  siteList.classList.toggle("hidden");
}
