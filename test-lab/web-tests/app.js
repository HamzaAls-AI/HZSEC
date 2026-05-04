const userInput = location.hash.slice(1);

document.getElementById("output").innerHTML = userInput;

eval("console.log('unsafe eval test')");

localStorage.setItem("authToken", "fake_frontend_token_123");

fetch("http://api.example.com/data")
  .then(res => res.json())
  .then(data => console.log(data));
