"use strict";

let SerialPort  = require('serialport')
let PubSub      = require('./pubsub')
let Code        = require('./code')
let BoardHelper = require('./board.helper')
let Pin         = require('./pin')


let Delimiter = SerialPort.parsers.byteDelimiter;


class Board {
    constructor(arduino, channel) {
        this._serialNumber   = arduino.serialNumber
        this._port           = arduino.comName
        this._pins           = []
        this._channel        = channel
        
        this._serial = new SerialPort(this._port, {
            parser: SerialPort.parsers.byteDelimiter([0x23, 0x2E])
        })
        
        this.initDataListener()
        
        for (let i = 2; i < 14; i++) {
            this.addPin(new Pin(this, i, Code.type.analog))
        }
        
        this._channel.emit('connect', this)
        
        this._serial.on('disconnect', this.disconnect.bind(this))
        this._serial.on('error', this.disconnect.bind(this))
        
        let p = true
        setTimeout((() => {
            this.enable()
            
            this.getPin(13).pinMode(Code.pinMode.digitalOutput)
            setInterval((() => {
                p = !p
                this.getPin(13).digitalWrite(p)
            }).bind(this), 1000)

        }).bind(this), 3000)
    }
    
    write(data) {
        this._serial.write(data)
    }
    
    enable() {
        this.write([Code.Begin, 0x00, Code.Command.enable, 0x01, Code.End])
    }
    
    addPin(pin) {
        if (this._pins[pin._number] != undefined)
        {
            throw new Error('Pin Already defined')
        }
        this._pins[pin._number] = pin
    }
    
    getPin(number) {
        if (this._pins[number] == undefined) {
            throw new Error('Undefined Pin')
        }
        return this._pins[number]
    }
    
    initDataListener() {
        this._serial.on('data', (data) => {
            let response = BoardHelper.parseResponse(data.map((byte) => {
                return parseInt(byte)
            }))
            
            // TODO : i will see if we have to handle error here !
                        
            if (response && response.command == Code.Command.enable) {
                this.emit('enabled', this, response)
            }
            
            else if (response && response.pin && this._pins[response.pin]) {
                this._pins[response.pin].emit('data', response)
            }
        })
    }
    
    on(event, callback) {
        this._channel.on(event, callback)
    }
    
    emit(event, ...data) {
        this._channel.emit(event, ...data)
    }
    
    disconnect(data) {
        this._channel.emit('disconnect', this)
    }
}

module.exports =  Board