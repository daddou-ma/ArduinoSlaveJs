let Code        = require('./code')

const parseResponse = (data) => {
    if ((data[0] != Code.Begin) || (data[data.length - 1] != Code.End))
    {
        return null
    }
    
    let response    = {}
    let responseId  = data[1]
    let command     = data[3]
    
    switch(command) {
            case Code.Command.enable:
                response = {
                    success : !!(data[2]),
                    command : command,
                    enabled : data[4]
                }
            break
            case Code.Command.pinMode:
                response = {
                    success : !!(data[2]),
                    command : command,
                    pin     : data[4],
                    mode    : data[5] 
                }
            break
            case Code.Command.digitalWrite:
                response = {
                    success : !!(data[2]),
                    command : command,
                    pin     : data[4],
                    value   : data[5] 
                }
            break
            case Code.Command.digitalRead:
                response = {
                    success : !!(data[2]),
                    command : command,
                    pin     : data[4],
                    value   : data[5] 
                }
            break
            case Code.Command.analogWrite:
                response = {
                    success : !!(data[2]),
                    command : command,
                    pin     : data[4],
                    value   : bytesToInt(data.slice(5, 9))
                }
            break
            case Code.Command.analogRead:
                response = {
                    success : !!(data[2]),
                    command : command,
                    pin     : data[4],
                    value   : bytesToInt(data.slice(5, 9))
                }
            break
    }
    return response
}

const intToBytes = (num) => {
    return [
        (num >> 24) & 255,
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255,
    ]
}

const bytesToInt = (array) => {
    return (
        (array[0] << 24) |
        (array[1] << 16) |
        (array[2] << 8) |
        array[3] & 255
    )
}

module.exports = {
    parseResponse,
    intToBytes,
    bytesToInt
}