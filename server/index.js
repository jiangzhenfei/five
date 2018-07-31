http  = require('http')
const querystring = require("querystring");
const url = require('url')
let io = require('socket.io')(8088);
let Event = require('./subscrible')

/**
 * 记录链接的房间信息
 * 1.一个房间只能登入两个用户
 * 2.两个用户的名字不能相同
 */
let connectRoom = {}

//交换落子权利
function changeAuth( currenRoom, curentUser ){
    for( var user in currenRoom ){
        if( user!=='full' && user !=='event' ){
            if( user === curentUser ){
                //当前的用户失去落子权利
                currenRoom[user].canDown = false
                //对手拥有落子权利
            }else{
                currenRoom[user].canDown = true
            }
        }
    }
}

//长连接
io.on('connection', function (socket) {
    console.log('connection...')
  
    socket.on('move', function ( from ) {
        let room = from.room;//房间号
        let user = from.user;//谁在页面点击了落子键
        if( connectRoom[room].full ){//如果满员，则可以进行游戏
            if( connectRoom[room][user].canDown ){//如果拥有落子权利则落子
                connectRoom[room].event.trigger('moveInfo',from)//将点击的棋盘信息传给前端，配置前端渲染棋盘上的棋子
            }
            changeAuth ( connectRoom[room],user )  //交换落子权利
            connectRoom[room].event.trigger('who') //通知前端谁先落棋
        }
    });
  
    //用户进入链接（这里可以做更多的事）
    socket.on('welcome', function (data) {
        /* 该房号，为后期该房间订阅各种信息 */
        let room = data.room;
        /* 房间用户连接id，方便给该房间连接同步消息 */
        let id = socket.id;
        /* 该房间订阅用户信息 */
        connectRoom[room].event.listen('userInfo',()=>{
            io.sockets.to(id).emit('userInfo', connectRoom[room]); 
        })
        /* 该房间订阅更新当前谁落子 */
        connectRoom[room].event.listen('who',()=>{
            io.sockets.to(id).emit('who', connectRoom[room]); 
        })
        /* 该房间订阅棋子落子坐标，信息，颜色 */
        connectRoom[room].event.listen('moveInfo',( from )=>{
            io.sockets.to(id).emit('moveInfo', from ); 
        })
        /* 该房间订阅棋子落子坐标，信息，颜色 */
        connectRoom[room].event.listen('escap',( room )=>{
            io.sockets.to(id).emit('escap', room ); 
        })
        /* 任何连接都出发该房间的前端用户提示，包括谁进来了，谁退出了 */
        connectRoom[room].event.trigger('userInfo')
         /* 当满员通知前端谁先落棋 */
        if(  connectRoom[room].full ){
            connectRoom[room].event.trigger('who')
        }
    });

    //断开连接(清除该房间号)
    socket.on('disconnect', function ( e ) {
        console.log( '-----' + e )
    });

    //关闭该房间，浏览器关闭则关闭该房间(清除该房间号)
    socket.on('closeRoom', function ( room ) {
        if( connectRoom[room] ){
            connectRoom[room].event.trigger('escap')//通知对手逃跑
            delete connectRoom[ room ] 
        }
        
    });
});

let app = http.createServer ( function(request,response){
    var arg = url.parse(request.url).query;
    var query = querystring.parse(arg); 
    response.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*'
      })
    if(request.url!=='/favicon.ico'){//清除第二次访问
        let room = query.room
        let user = query.user;
        //相同的用户不允许
        if( connectRoom[room] && connectRoom[room][user] ){
            let json = {
                success:false,
                message:user + '已经连接,可以等待对手进行游戏...'
            }
            response.end( JSON.stringify(json) )
            return;
        }
        //满员
        if( connectRoom[room] && connectRoom[room].full){
            let json = {
                success:false,
                message:room + '已经满员,请更换房间号...'
            }
            response.end( JSON.stringify(json) )
            return;
        }
        //第一次链接（第一个用户）
        if( !connectRoom[room] ){
            connectRoom[room] = {
                full:false,
                event:Event(),
            }
            connectRoom[room][user] = {
                role:'black',//用户棋子颜色
                canDown:false,//用户是否有权限落子
            }
        }else{ //第二次链接 （第二个用户）
            connectRoom[room].full = true
            connectRoom[room][user] = {
                role:'red',//用户棋子颜色
                canDown:true,//用户是否有权限落子
            }
        }
        let json = {
            success: true,
            room:    room,
            role:    connectRoom[room][user]['role']
        }
        response.end( JSON.stringify(json) )
        
    }
} ) 
app.listen(8000)