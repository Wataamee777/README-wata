function copy(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`${text} をコピーしました！`);
  });
}

function toggleSites() {
  const siteList = document.getElementById("siteList");
  siteList.classList.toggle("hidden");
}
