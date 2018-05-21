function valid() {
    var validtxt = document.getElementById("back1");
    var btn131 = document.getElementById("btn13");
    var valid_F = document.getElementById("valid");
    var valid_D = document.getElementById("valid1");

    if (validtxt.textContent == '139') {
        alert(validtxt.textContent);
        valid_F.style = "display:none;";
        valid_D.style = "display:block;";
        valid_D.src = "http://demo.eronelit.com/1399/";
    }
    else {
        validtxt.style = "border: 1px rgba(255, 33, 33, 0.80) solid; ";
        btn131.style = "background-color: rgba(255, 33, 33, 0.80);";
        btn131.textContent = "Kod nije validan! Probaj ponovo. | Pokreni DEMO";

   
     
        return false;
    }
} /*rgba(218, 165, 32, 0.80)*/