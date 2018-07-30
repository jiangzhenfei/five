var canvas = document.getElementById("canvas");

var context = canvas.getContext('2d');

var space = 60;
//画图x线
for( var i = 0; i < 9; i++ ){
    context.moveTo( 0, space * (i+1) );
    context.lineTo( 600, space * (i+1) );
}
//画图y线
for( var i = 0; i < 9; i++ ){
    context.moveTo( space * (i+1), 0 );
    context.lineTo( space * (i+1),600 );
}
let x = 0;
let y = 0;
let index = 0;
while (x < 11 && y < 11 ){
    let html = $('<div class="item" data-id="' + index + '"></div>')
    html.css({
        left:x * space - 15,
        top: y * space - 15
    })
    $('.bordContainer').append(html)
    x++;
    index++;
    if( x >= 11){
        x = 0;
        y++
    }
}

function resetChessBorad(){
    $('.bordContainer .item').css({
        backgroundColor: 'transparent'
    })
}

context.strokeStyle = "green";
context.stroke();