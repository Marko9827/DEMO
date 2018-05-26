





var color1;
color1 = ['rgba(0, 134, 196,alp)', 'rgba(218, 165, 32,alp)', 'rgba(255,255,255,alp)'];



var w = dotty.width = window.innerWidth,
    h = dotty.height = window.innerHeight,
    sum = w + h,
    ctx = dotty.getContext('2d'),

    opts = {

        side: 15,
        picksParTick: 2,
        baseTime: 40,
        addedTime: 10,

        colors: ['rgba(0, 134, 196,alp)', 'rgba(218, 165, 32,alp)', 'rgba(255,255,255,alp)'],


        addedAlpha: 20,
        strokeColor: 'rgb(232, 232, 232)',

        hueSpeed: .2,
        repaintAlpha: 1
    },

    difX = Math.sqrt(3) * opts.side / 2, // height of a equilateral triangle 
    difY = opts.side * 3 / 2, // side of a triangle ( because it goes down to a vertex ) then half a side of the triangle in the hex below: s + s/2 = s*3/2
    rad = Math.PI / 6, // TAU / 6 = PI / 3 I thought, but apparently this way works better
    cos = Math.cos(rad) * opts.side,
    sin = Math.sin(rad) * opts.side,

    hexs = [],
    tick = 0;

function loop() {

    window.requestAnimationFrame(loop);

    tick += opts.hueSpeed;

    ctx.shadowBlur = 0;
    // ctx.fillStyle = 'rgba(41,53,64,alp)'.replace( 'alp', opts.repaintAlpha );
    ctx.fillStyle = 'rgba(225,225,225,alp)'.replace('alp', opts.repaintAlpha);
    ctx.fillRect(0, 0, w, h);

    for (var i = 0; i < opts.picksParTick; ++i)
        hexs[(Math.random() * hexs.length) | 0].pick();

    hexs.map(function (hex) { hex.step(); });
}
function Hex(x, y) {

    this.x = x;
    this.y = y;
    this.sum = this.x + this.y;
    this.picked = false;
    this.time = 0;
    this.targetTime = 0;

    this.xs = [this.x + cos, this.x, this.x - cos, this.x - cos, this.x, this.x + cos];
    this.ys = [this.y - sin, this.y - opts.side, this.y - sin, this.y + sin, this.y + opts.side, this.y + sin];
}
Hex.prototype.pick = function () {

    this.color = opts.colors[(Math.random() * opts.colors.length) | 0];
    this.picked = true;
    this.time = this.time || 0;
    this.targetTime = this.targetTime || (opts.baseTime + opts.addedTime * Math.random()) | 0;
}
Hex.prototype.step = function () {

    var prop = this.time / this.targetTime;

    ctx.beginPath();
    ctx.moveTo(this.xs[0], this.ys[0]);
    for (var i = 1; i < this.xs.length; ++i)
        ctx.lineTo(this.xs[i], this.ys[i]);
    ctx.lineTo(this.xs[0], this.ys[0]);

    if (this.picked) {

        ++this.time;

        if (this.time >= this.targetTime) {

            this.time = 0;
            this.targetTime = 0;
            this.picked = false;
        }

        ctx.fillStyle = ctx.shadowColor = this.color.replace('alp', Math.sin(prop * Math.PI));
        ctx.fill();
    } else {

        ctx.strokeStyle = ctx.shadowColor = opts.strokeColor;
        ctx.stroke();
    }
}

for (var x = 0; x < w; x += difX * 2) {
    var i = 0;

    for (var y = 0; y < h; y += difY) {
        ++i;
        hexs.push(new Hex(x + difX * (i % 2), y));

    }
}
loop();

window.addEventListener('resize', function () {

    w = dotty.width = window.innerWidth;
    h = dotty.height = window.innerHeight;
    sum = w + h;

    hexs.length = 0;
    for (var x = 0; x < w; x += difX * 2) {
        var i = 0;

        for (var y = 0; y < h; y += difY) {
            ++i;
            hexs.push(new Hex(x + difX * (i % 2), y));

        }
    }
})








document.onkeydown = function (e) {
    e = e || window.event;//Get event
    if (e.ctrlKey) {
        var c = e.which || e.keyCode;//Get key code
        switch (c) {
            case 83://Block Ctrl+S
            case 87://Block Ctrl+W --Not work in Chrome
                e.preventDefault();
                e.stopPropagation();
                break;
        }
    }
};




    document.getElementById("valid1").style = "display:none;";



function valid() {
    var validtxt = document.getElementById("back1");
    var btn131 = document.getElementById("btn13");
    var valid_F = document.getElementById("valid"); //dole
    var valid_D = document.getElementById("valid1"); //gore


    if (validtxt.value == "139") {


        //valid_F.style = "display: none;";
        //valid_D.src = "1399/";
        //valid_D.style = "display:block;";

        opts.colors = ['rgba(123, 0, 255, alp)', 'rgba(218, 165, 32,alp)', 'rgba(255,255,255,alp)'];
        btn131.textContent = "SESIJA ISTEKLA. | Pokreni DEMO";
        validtxt.style = "border: 1px rgba(123, 0, 255, 0.80) solid; ";
        btn131.style = "background-color: rgba(123, 0, 255, 0.80);";
        return false;
    }
    else {
        //32
        //validtxt.style = "border: 1px rgba(255, 33, 33, 0.80) solid; ";
        //btn131.style = "background-color: rgba(255, 33, 33, 0.80);";
        //btn131.textContent = "Kod nije validan! Probaj ponovo. | Pokreni DEMO";

        ////1
        //opts.colors = ['rgba(255, 33, 33, alp)', 'rgba(218, 165, 32,alp)', 'rgba(255,255,255,alp)'];




    }

  


    if (validtxt.value == "439698") {


        valid_F.style = "display: none;";
        valid_D.src = "439698/";
          valid_D.style = "display:block;";



        //#
     
   
        //#
    }
    else {
        validtxt.style = "border: 1px rgba(255, 33, 33, 0.80) solid; ";
        btn131.style = "background-color: rgba(255, 33, 33, 0.80);";
        btn131.textContent = "Kod nije validan! Probaj ponovo. | Pokreni DEMO";


        //1
        opts.colors = ['rgba(255, 33, 33, alp)', 'rgba(218, 165, 32,alp)', 'rgba(255,255,255,alp)'];


    }

} /*rgba(218, 165, 32, 0.80)*/


