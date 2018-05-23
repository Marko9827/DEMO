document.getElementById("valid1").style = "display:none;";

//aefeafea
function valid() {
    var validtxt = document.getElementById("back1");
    var btn131 = document.getElementById("btn13");
    var valid_F = document.getElementById("valid"); //dole
    var valid_D = document.getElementById("valid1"); //gore


    if (validtxt.value == "139") {

        
        valid_F.style = "display: none;";
        valid_D.src = "1399/";
        valid_D.style = "display:block;";
     
    }
    else {
        validtxt.style = "border: 1px rgba(255, 33, 33, 0.80) solid; ";
        btn131.style = "background-color: rgba(255, 33, 33, 0.80);";
        btn131.textContent = "Kod nije validan! Probaj ponovo. | Pokreni DEMO";
     
   
     
    
    }

    if (validtxt.value == "439698") {


        valid_F.style = "display: none;";
        valid_D.src = "4396981/";
        valid_D.style = "display:block;";

    }
    else {
        validtxt.style = "border: 1px rgba(255, 33, 33, 0.80) solid; ";
        btn131.style = "background-color: rgba(255, 33, 33, 0.80);";
        btn131.textContent = "Kod nije validan! Probaj ponovo. | Pokreni DEMO";




    }
   
} /*rgba(218, 165, 32, 0.80)*/
