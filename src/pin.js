"use strict";

let PubSub      = require('./pubsub')
let Code        = require('./code')
class Pin {
    
    constructor(board, number, type) {
        this._board  = board
        this._number = number
        this._type   = type
        this._pubsub = new PubSub()
        this._promise = {}
            
        this._value = 0
        
        this._board.emit('createPin', this)
        
        this.on('data', (function(data) {
            if (data.success == false) {
                this._board.emit('pinError', this, data)
                return
            }
            switch(data.command) {
                    case Code.Command.pinMode:
                        this._type = data.type
                        this._board.emit('pinMode', this, data)
                    break
                    case Code.Command.digitalRead:
                        this._value = data.value
                        this._board.emit('digitalRead', this, data)
                    break
                    case Code.Command.digitalWrite:
                        this._value = data.value
                        this._board.emit('digitalWrite', this, data)
                    break
                    case Code.Command.analogRead:
                        this._value = data.value
                        this._board.emit('analogRead', this, data)
                    break
                    case Code.Command.analogWrite:
                        this._value = data.value
                        this._board.emit('analogWrite', this, data)
                    break
                    default:
                        // TODO: error Response
                        this._board.emit('pinError', this, data)
                    break
            }
        }).bind(this))
    }
    
    pinMode(type) {
        let request = [Code.Begin, 0x00, Code.Command.pinMode, this._number, type, Code.End]
        this._board.write(request)
    }
    
    digitalWrite(value) {
        let request = [Code.Begin, 0x00, Code.Command.digitalWrite, this._number, value, Code.End]
        this._board.write(request)
    }
    
    digitalRead(number) {
        let request = [Code.Begin, 0x00, Code.Command.digitalRead, this._number, Code.End]
        this._board.write(request)
    }
    
    analogWrite(value) {
        let request = [Code.Begin, 0x00, Code.Command.analogWrite, this._number, ...BoardHelper.intToBytes(value), Code.End]
        this._board.write(request)
    }
    
    analogRead() {
        let request = [Code.Begin, 0x00, Code.Command.analogRead, this._number, Code.End]
        this._board.write(request)
    }
    
    on(event, callback) {
        this._pubsub.on(event, callback)
    }
    
    emit(event, data) {
        this._pubsub.emit(event, data)
    }
}

module.exports = Pin