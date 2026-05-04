const output = document.getElementById("output");
output.textContent = "Safe rendering only";

fetch("https://api.example.com/data")
  .then(res => res.json())
  .then(data => console.log(data));
