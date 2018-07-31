let gameEngin = new GameEngin()//游戏引擎，将棋子加入对象，并且判断是否结束游戏
let canClick = false;//是否可以开始游戏

$('.btn').click((e)=>{
    
    window.originUser = $('.user').val()
    window.originRoom = $('.room').val()
    if( !originUser || !originRoom ){
        alert('请输入用户名或者房间号...')
        return;
    }
    $.ajax({
        url:'http://127.0.0.1:8000?room=' + originRoom + '&user=' + originUser,
        success:function(e){
            if(!e.success){
                alert( e.message )
                return;
            }
            let room = originRoom;
            window.role = e.role;//保存系统分配的角色（棋子的颜色）
            window.socket = io.connect('http://127.0.0.1:8088');

            //自己和对手棋子移动的监听
            socket.on('moveInfo', function (data) {
                console.log(data)
                let roleColor = data.role;
                let id = data.id;
                //将棋盘影藏的棋子显示，并且赋予颜色
                $('[data-id="'+ id +'"]').css({
                    backgroundColor: roleColor
                })
                setTimeout(()=>{
                    //在棋盘引擎加入该棋子的颜色和坐标，便于判断输赢
                    let chess = new Chess( roleColor ,id )
                    gameEngin.add ( chess )
                    gameEngin.win( chess,function(){
                        resetChessBorad()//清空棋盘
                        gameEngin.reset()//将引擎数据清空
                    } )
                },200)
            });

            //监听该房间的用户信息，左边显示房间用户数量
            socket.on('userInfo', function (data) {
                
                if( data.full ){
                    canClick = true
                }
                $('.userInfo').html('')
                for (var user in data){
                    if( user!== 'full' && user!=='event' ){
                        let curretUser = data[user]
                        console.log(user)
                        let html = $(`<div class="user-item">${user}<div>`)
                        html.css({
                            backgroundColor: curretUser['role']
                        })
                        $('.userInfo').append(html)
                    }
                }
            });

            //提示当前谁落子
            socket.on('who', function (data) {
                for( var user in data){
                    if ( user !== 'full' && user!=='event' ){
                        let curretUser = data[user]
                        if( curretUser.canDown ){
                            tipWho( user )
                            return;
                        }
                    }
                }
            });

            //通知对手逃跑
            socket.on('escap', function () {
                canClick = false;//对手逃跑棋盘不给点击
                resetChessBorad()//清空棋盘
                gameEngin.reset()//将引擎数据清空
                clearUserInfoAndTip()
                alert('对手逃跑,请重新链接邀请别人...')
            });

            //用户进入，发送后端，后端信息保存
            socket.on('connect', function () {
                socket.emit( 'welcome',{ room:room, user:originUser } );
            });

            //报错之后关闭链接
            socket.on('error', function () {
                socket.disconnect(originRoom)
            });
            //断开链接回调
            socket.on('disconnect', function () {
                socket.disconnect(originRoom)
            });
           
        }
    })
})

function checkLeave(){
    socket.emit('closeRoom',originRoom)
}

//情况该房间成员和提示字体
function clearUserInfoAndTip(){
    $('.userInfo').html('')
    $('.tip').html('')
}
//提示哪个用户落子
function tipWho(user){
    $('.tip').html('')
    $('.tip').html(`等待用户${user}落子...`)
}

$('.bordContainer').on('click','.item',function(){
    if( !canClick ){//棋盘准备好才能开始游戏
        return;
    }
    let id = $(this).data('id')
    if(gameEngin.allChess.includes( id )){//棋盘引擎防止一个地方多次点击
        return;
    }
    //想后端提交落子的坐标
    socket.emit('move', { room:originRoom, id:id, role:role, user:originUser });
})