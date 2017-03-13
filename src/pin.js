class Pin {
    
    constructor(board, number, type) {
        this._board  = board
        this._number = number
        this._type   = type
        
        this._value = 0;
    }
    
    get value() {
        return this._value
    }
    
    set value(value) {
        this._value = value
    }
}