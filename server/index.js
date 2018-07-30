http  = require('http')
const querystring = require("querystring");
const url = require('url')
var io = require('socket.io')(8088);

/**
 * 记录链接的房间信息
 * 1.一个房间只能登入两个用户
 * 2.两个用户的名字不能相同
 */
let connectRoom = {}

//交换落子权利
function changeAuth( currenRoom, curentUser ){
    for( var user in currenRoom ){
        if( user!=='full' ){
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
  
    socket.on('move', function (from, msg) {
        let room = from.room;//房间号
        let user = from.user;//谁在页面点击了落子键
        if( connectRoom[room].full ){//如果满员，则可以进行游戏
            if( connectRoom[room][user].canDown ){//如果拥有落子权利则落子，并且交换落子权利
                io.emit('moveInfo',from);//将点击的棋盘信息传给前端，配置前端渲染棋盘上的棋子
            }
            changeAuth ( connectRoom[room],user )  //交换落子权利
            io.emit('who',connectRoom[room]) //通知前端谁先落棋
        }
    });
  
    //用户进入链接
    socket.on('welcome', function (data) {
        let id = socket.id;
        let room = data.room;
        let user = data.user;
        connectRoom[room][user]['id'] = id;
        io.emit('userInfo',connectRoom[room]);//通知前端用户信息
        if(  connectRoom[room].full ){
            io.emit('who',connectRoom[room]);//当满员通知前端谁先落棋
        }
    });

    //断开连接(清除该房间号)
    socket.on('disconnect', function (e,rgd) {
        console.log(e,rgd)
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
                message:user + '已经存在'
            }
            response.end( JSON.stringify(json) )
            return;
        }
        //满员
        if( connectRoom[room] && connectRoom[room].full){
            let json = {
                success:false,
                message:room + '已经满员'
            }
            response.end( JSON.stringify(json) )
            return;
        }
        //第一次链接（第一个用户）
        if( !connectRoom[room] ){
            connectRoom[room] = {
                full:false,
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