/**
 * 机器人对战算法
 */

//棋盘最小坐标
const minCoordinate = 0;
//棋子最大坐标
const maxCoordinate = 120;



class Robot{
    constructor(color,room){
        this.room = room
        this.color = color;
        this.allPot = []
        this.who = {
            black:[],
            red:[]
        }
       
    }
    init( socket ){
        this.socket = socket;
        initPot()

    }
    initPot(){
        for(var i = 0; i < 121; i++ ){
            this.allPot.push( i )
        }
    }
    //info { room:originRoom, id:id, role:role, user:originUser }
    exitPot( info ){
        this.who[info.role].push( info.id )
        this.allPot.splice( info.id, 1 )
       
        if( info.role !== this.color){
           let length = this.allPot.length;
           let math = parseInt(Math.random() * length)
           this.socket.emit('move', { room:this.room, id:math, role:this.color, user:'robot' });
            //this.win( info.color,role.id )

        }
    }
    win(color,id){
        let kind = [1,10,11,12]
        for ( let x of kind){
            this.findEnemy( color,id,x)
        }
    }
    findEnemy( color, curren, index ){
        let winMap = {
            '0':[ curren, curren - index, curren - 2*index, curren - 3*index, curren - 4*index],
            '1':[ curren + index, curren, curren - index, curren - 2*index, curren - 3*index],
            '2':[ curren + 2*index, curren + index,curren, curren - index, curren - 2*index],
            '3':[ curren + 3*index, curren + 2*index, curren + index,curren, curren - index],
            '4':[ curren + 4*index, curren + 3*index, curren + 2*index, curren + index,curren],
        }
        let Max = {
            '0':0,
            '1':0,
            '2':0,
            '3':0,
            '4':0
        }
        let length = this.who[color].length;
        let colorArr = this.who[color];
        for( var i = 0;i < length; i++ ){
            for (var item in winMap){
                let c = winMap[item]
                if( 
                    colorArr.includes( c[0]) ||
                    colorArr.includes( c[1]) ||
                    colorArr.includes( c[2]) ||
                    colorArr.includes( c[3]) ||
                    colorArr.includes( c[4])
                ){
                    Max[i]
                }
            }
        }
    }

}

module.exports = Robot;