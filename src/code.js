module.exports = {
    Begin   : 0x23,
    End     : 0x2E,
    Command: {
        enable      : 0x02,
        pinMode     : 0x03,
        digitalRead : 0x10,
        digitalWrite: 0x11,
        analogRead  : 0x20,
        analogWrite : 0x21
    },
    Response: {
        error       : 0x00,
        success     : 0x01,
        enable      : 0x02,
        pinMode     : 0x03,
        digitalRead : 0x12,
        digitalWrite: 0x13,
        analogRead  : 0x22,
        analogWrite : 0x23
    },
    type: {
        digital : 0x01,
        analog  : 0x02,
        dht     : 0x03
    },
    pinMode: {
        digitalOutput   : 0x01,
        digitalInput    : 0x02
    }
}