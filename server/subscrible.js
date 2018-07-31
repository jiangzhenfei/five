/**
 * 发布-订阅模式
 * 
 * 常用的地方，网站登入成功后同时更新头部，脚步，导航的信息
 */

var Event = function() {

    var clientList = {},
        listen,
        trigger,
        remove;
    
    /**
     * 添加订阅者，在某类订阅中
     */
    listen = function( key, fn ){
        if( !clientList[ key ] ){
            clientList[ key ] = [];
        }
        clientList[ key ].push( fn ) //订阅的消息添加进该类缓存列表，房子是房子类，车是车类
    };

    /**
     * 发布消息
     */
    trigger = function(){
        //arguments 的第一个参数必须是触发哪一类订阅，比如今天创达所有卖房子的消息
        var key = Array.prototype.shift.call( arguments )
        fns = clientList[ key ]
        if( !fns || fns.length === 0 ){
            return false
        }
        for( var i = 0, fn; fn = fns[ i++ ]; ){
            fn.apply( this, arguments )//发布消息带上的参数，比如今天的房子价格7000
        }
    };

    /**
     * 取消订阅事件
     * 
     * key 代表取消哪种订阅，可能是买房，可能是通知学车
     * fn  代表取消某种订阅某个函数，可能只是取消该房子给小红的通知，其他人正常
     * fn  不传表示取消所有key类的所有订阅
     */
    remove = function( key, fn ){
        var fns = clientList[ key ];
        if( !fns ){
            return false
        }
        if( !fn ){
            //fns = 0；是为了以后还可以添加订阅
            fns && ( fns.length = 0 );
        }else{
            for ( var l = fns.length-1; l >=0; l-- ){
                var _fn = fns[ l ];
                if( _fn === fn ){
                    fns.splice( l, 1);
                }
            }
        }
    };

    return {
        listen:  listen,
        trigger: trigger,
        remove:  remove,
        clientList:clientList
    }

} 

module.exports = Event;
