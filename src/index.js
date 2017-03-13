let SerialPort  = require('serialport')
let Board       = require('./board')

let boards = {}

let ArduinoModel = null
let PinModel = null

let scanPorts = () => {
    SerialPort.list((err, ports) => {
        ports.filter((obj) => {
            return (obj.manufacturer != undefined)
        }).forEach((arduino) => {
            let port = arduino.comName
            if (boards[port] == undefined)
            {
                console.log('connected : ' + port)
                boards[port] = new Board(arduino)

                boards[port].on('disconnect', (data) => {
                    delete boards[port]
                    console.log('disconnected')
                })
            }
        })
    })
}

let useArduinoModel = (model) => {
    ArduinoModel = model
}

let usePinModel = (model) => {
    PinModel = model
}

setInterval(scanPorts, 3000)