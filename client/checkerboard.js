var canvas = document.getElementById("canvas");

var context = canvas.getContext('2d');

//棋盘每条线距离
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
/**
 * 以下是给每个交点位置加上透明的div
 * 给每个div设置点击事件
 */
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
//清空棋盘的棋子
function resetChessBorad(){
    $('.bordContainer .item').css({
        backgroundColor: 'transparent'
    })
}
//设置棋盘的线颜色
context.strokeStyle = "green";
context.stroke();