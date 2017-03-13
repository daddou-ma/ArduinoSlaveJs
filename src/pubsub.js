
class PubSub {
    constructor() {
        this.events = {}
    }
    
    on(event, callback) {
        this.events[event] = this.events[event] || []
        this.events[event].push(callback)
    }
    
    emit(event, data) {
        if (this.events[event] == undefined) {
            return
        }
        this.events[event].forEach((callback) => {
            callback(data)
        })
    }
}

module.exports = PubSub