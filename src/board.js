let SerialPort  = require('serialport')
let PubSub      = require('./pubsub')
let Code        = require('./code')
let BoardHelper = require('./board.helper')

let Delimiter = SerialPort.parsers.byteDelimiter;


class Board {
    constructor(arduino) {
        this._serialNumber   = arduino.serialNumber
        this._port           = arduino.comName
        this._pins           = []
        this._pubsub         = new PubSub()
        
        this._serial = new SerialPort(this._port, {
            parser: SerialPort.parsers.byteDelimiter([0x23, 0x2E])
        })
        this._serial.on('disconnect', this.disconnect.bind(this))
        this._serial.on('error', this.disconnect.bind(this))
        
        this.initDataListener()
        
        setTimeout((() => {
            this.enable()
            
            setInterval((() => {
                this.analogWrite(0xA1, 0x101)
            }).bind(this), 1000)

        }).bind(this), 3000)
            
    }
    
    enable() {
        this._serial.write([Code.Begin, 0x00, Code.Command.enable, 0x01, Code.End])
    }
    
    pinMode(number, type) {
        this._serial.write([Code.Begin, 0x00, Code.Command.pinMode, number, type, Code.End])
    }
    
    digitalWrite(number, value) {
        this._serial.write([Code.Begin, 0x00, Code.Command.digitalWrite, number, value, Code.End])
    }
    
    digitalRead(number) {
        this._serial.write([Code.Begin, 0x00, Code.Command.digitalRead, number, Code.End])
    }
    
    analogWrite(number, value) {
        this._serial.write([Code.Begin, 0x00, Code.Command.analogWrite, number, ...BoardHelper.intToBytes(value), Code.End])
    }
    
    analogRead(number) {
        this._serial.write([Code.Begin, 0x00, Code.Command.analogRead, number, Code.End])
    }
    
    initDataListener() {
        this._serial.on('data', (data) => {
            let response = BoardHelper.parseResponse(data.map((byte) => {
                return parseInt(byte)
            }))
            
            // TODO : i will see if we have to handle error here !
            
            console.log(data)
            
            /*if (response && response.pin) {
                this._pins[pin].emit('data', response)
            }*/
        })
    }
    
    on(event, callback) {
        this._pubsub.on(event, callback)
    }
    
    emit(event, data) {
        this._pubsub.emit(event, data)
    }
    
    disconnect(data) {
        this._pubsub.emit('disconnect', data)
    }
}

module.exports =  Board