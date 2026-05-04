const q = new URLSearchParams(location.search).get("q");
document.getElementById("app").innerHTML = q;
