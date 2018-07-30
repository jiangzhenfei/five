class GameEngin{
    constructor(){
        this.red = [];
        this.black = [];
        this.allChess = []
    }
    add( Chess ){
        this.allChess.push( Chess.index )
        this[Chess.color].push( Chess.index )
    }
    //判断是否胜利
    win ( Chess, callback) {
        let kind = [1,10,11,12]
        for ( let x of kind){
            if(this.winFour( Chess,x )){
                alert( Chess.color + '赢了')
                callback()
            }
        }
        
    }
    winFour( Chess, index ){//index 1,10,11,12
        let curren = Chess.index;
        let winMap = {
            '0':[ curren, curren - index, curren - 2*index, curren - 3*index, curren - 4*index],
            '1':[ curren + index, curren, curren - index, curren - 2*index, curren - 3*index],
            '3':[ curren + 2*index, curren + index,curren, curren - index, curren - 2*index],
            '4':[ curren + 3*index, curren + 2*index, curren + index,curren, curren - index],
            '5':[ curren + 4*index, curren + 3*index, curren + 2*index, curren + index,curren],
        }
        
        let length = this[Chess.color].length
        for( var i = 0;i < length; i++ ){
            for (var item in winMap){
                let c = winMap[item]
                if( 
                    this[Chess.color].includes( c[0]) && 
                    this[Chess.color].includes( c[1]) && 
                    this[Chess.color].includes( c[2]) &&
                    this[Chess.color].includes( c[3]) &&
                    this[Chess.color].includes( c[4])
                ){
                    return true
                }
            }
        }
        return false
    }
    //情况之前的数据
    reset(){
        this.red.length = 0;
        this.black.length = 0;
        this.allChess.length = 0
    }
}

class Chess{
    constructor(color,index){
        this.color = color;
        this.index = index
    }
}