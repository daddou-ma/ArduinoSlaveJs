let SerialPort  = require('serialport')
let Board       = require('./src/board')
let PubSub      = require('./src/pubsub')

let boards  = {}
let channel = new PubSub()


let scanPorts = () => {
    SerialPort.list((err, ports) => {
        ports.filter((obj) => {
            return (obj.manufacturer != undefined)
        }).forEach((arduino) => {
            let port = arduino.comName
            if (boards[port] == undefined)
            {
                boards[port] = new Board(arduino, channel)
            }
        })
    })
}


channel.on('connect', (board) => {
    console.log('connected : ' + board._port)
})

channel.on('enabled', (board, res) => {
    console.log('enabled : ' + board._port)
})

channel.on('disconnect', (board) => {
    delete boards[board._port]
    console.log('disconnected')
})

channel.on('pinMode', (board, res) => {
    console.log('Set PinMode: ' + res.pin + ' : ' + res.mode)
})

channel.on('digitalRead', (board, res) => {
    console.log('digitalRead : ' + res.pin + ' : ' + res.value)
})

channel.on('digitalWrite', (board, res) => {
    console.log('digitalWrite : ' + res.pin + ' : ' + res.value)
})

channel.on('analogRead', (board, res) => {
    console.log('digitalRead : ' + res.pin + ' : ' + res.value)
})

channel.on('analogWrite', (board, res) => {
    console.log('digitalWrite : ' + res.pin + ' : ' + res.value)
})

channel.on('pinError', (board, res) => {
    console.log('Set Value : ' + res.pin + ' : ' + res.value)
})

let on = (event, callback) => {
    pubsub.on(event, callback)
}

let emit = (event, data) => {
    pubsub.emit(event, callback)
}

setInterval(scanPorts, 3000)

module.exports = {
    boards,
    channel,
    scanPorts,
    on,
    emit
}