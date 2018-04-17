
function cof(){
    
document.getElementById("IF3").style = "display:none;";
document.getElementById("ne").style = "display:block;"
}


document.addEventListener("contextmenu", function (e) { e.preventDefault(); }, false);
document.addEventListener("dragstart", function (e) { e.preventDefault() }, false);
document.addEventListener("selectstart", function (e) { e.preventDefault() }, false);



function topF(){
    document.body.scrollTop -= 1;
    document.documentElement.scrollTop = 0;
}



/*

margin-top: 20px;
  margin-left: 30px;
  margin-right: 30px;

   border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
*/
document.getElementById("MENU1").style = "margin-top: 168px; margin-left: 30px; margin-right: 30px;  border-top-left-radius: 30px; border-top-right-radius: 30px; border-bottom-right-radius: 30px;     border-bottom-left-radius: 30px;";

window.onscroll = function () { scrollFunction() };
document.body.scrollTop = 0;

function scrollFunction() {
   
    
    if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
    
         
       document.getElementById("MENU1").style = "margin-top:0px; margin-left: 0px; margin-right: 0px;  border-top-left-radius: 0px;border-top-right-radius: 0px;border-bottom-right-radius: 0px; border-bottom-left-radius: 0px;";
       
     
  } else {
    document.getElementById("MENU1").style = "margin-top: 168px; margin-left: 30px; margin-right: 30px;  border-top-left-radius: 30px; border-top-right-radius: 30px; border-bottom-right-radius: 30px;     border-bottom-left-radius: 30px;";
    }

    
}














