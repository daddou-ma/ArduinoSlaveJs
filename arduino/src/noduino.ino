/**
 * Author : Mohamed El Amine Daddou, Ben Taimia HADDADI
 *
 */
#include <Arduino.h>


#define BEGIN   '#'
#define END     '.'

uint8_t commandId   = 0;
uint8_t cmdBuffer[10];
int  length   = 0;
bool enabled  = false;

enum Command:uint8_t {
  ENABLE        = 0x02,
  PIN_MODE      = 0x03,
  DIGITAL_READ  = 0x10,
  DIGITAL_WRITE = 0x11,
  ANALOG_READ   = 0x20,
  ANALOG_WRITE  = 0x21,
  DHT_READ      = 0x30
};

enum Response:uint8_t {
  R_ERROR         = 0x00,
  R_SUCCESS       = 0x01
};

enum PinMode:uint8_t {
  DIGITAL_OUTPUT  = 0x01,
  DIGITAL_INPUT   = 0x02,
  DHT             = 0x03
};

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    uint8_t caracter = (uint8_t) Serial.read();
    if (caracter == BEGIN)
    {
      int i = 0;
      commandId = (uint8_t) Serial.read();
      while (Serial.available() > 0 && caracter != END) {
        caracter = (uint8_t) Serial.read();
        if (caracter != END){
          cmdBuffer[i] = caracter;
          i++;
        }
      }

      length = i;

      if (caracter == END) {
        execute();
      }
    }
  }

  delay(50);
}

void execute() {

  uint8_t command = cmdBuffer[0];
  switch ((Command)command) {
    case ENABLE:
      _enable();
    break;
    case PIN_MODE:
      _setPinMode();
    break;
    case DIGITAL_READ:
      _digitalRead();
    break;
    case DIGITAL_WRITE:
      _digitalWrite();
    break;
    case ANALOG_READ:
      _analogRead();
    break;
    case ANALOG_WRITE:
      _analogWrite();
    break;
    default:
      // TODO : Error Msg
    break;
  }
}

void _enable() {
  uint8_t value = cmdBuffer[1];

  if (length != 2)
  {
    //enableResponse(R_ERROR, value);
    return;
  }

  if (value == 0x00) {
    enabled = false;
  }
  else {
    enabled = true;
  }
  enableResponse(R_SUCCESS, value);
}

void _setPinMode() {
  uint8_t number  = cmdBuffer[1];
  uint8_t value   = cmdBuffer[2];

  if (length != 3)
  {
    //pinModeResponse(R_ERROR, number, value);
    return;
  }

  switch (value) {
    case DIGITAL_OUTPUT:
      pinMode(number, OUTPUT);
    break;
    case DIGITAL_INPUT:
      pinMode(number, INPUT);
    break;
    default:
      pinModeResponse(R_ERROR, number, value);
      return;
    break;
  }
  pinModeResponse(R_SUCCESS, number, value);
}

void _digitalRead() {

  uint8_t number  = cmdBuffer[1];
  uint8_t value   = digitalRead(number);

  if (length != 2)
  {
    //digitalReadResponse(R_ERROR, number, value);
    return;
  }

  digitalReadResponse(R_SUCCESS, number, value);
}

void _digitalWrite() {
  uint8_t number  = cmdBuffer[1];
  uint8_t value   = cmdBuffer[2];

  if (length != 3)
  {
    //digitalWriteResponse(R_ERROR, number, value);
    return;
  }

  if (value == 0x00) {
    digitalWrite(number, LOW);
  }
  else {
    digitalWrite(number, HIGH);
  }
  digitalWriteResponse(R_SUCCESS, number, value);
}

void _analogRead() {
  uint8_t number  = cmdBuffer[1];
  int value       = analogRead(number);

  if (length != 2)
  {
    //analogReadResponse(R_ERROR, number, value);
    return;
  }

  analogReadResponse(R_SUCCESS, number, value);
}

void _analogWrite() {
  uint8_t number  = cmdBuffer[1];
  int value       = charsToInt(cmdBuffer+2);

  if (length != 6)
  {
    //analogWriteResponse(R_ERROR, number, value);
    return;
  }

  analogWrite(number, value);

  analogWriteResponse(R_SUCCESS, number, value);
}

void enableResponse(uint8_t response, uint8_t value) {
  char output[6];

  sprintf(output, "%c%c%c%c%c%c", BEGIN, commandId, response, ENABLE, value, END);

  Serial.write(output , sizeof(output));
}

void pinModeResponse(uint8_t response, uint8_t number, uint8_t value) {
  char output[7];

  sprintf(output, "%c%c%c%c%c%c%c", BEGIN, commandId, response, PIN_MODE, number, value, END);

  Serial.write(output , sizeof(output));
}

void digitalWriteResponse(uint8_t response, uint8_t number, uint8_t value) {
  char output[7];

  sprintf(output, "%c%c%c%c%c%c%c", BEGIN, commandId, response, DIGITAL_WRITE, number, value, END);

  Serial.write(output , sizeof(output));
}

void digitalReadResponse(uint8_t response, uint8_t number, uint8_t value) {
  char output[7];

  sprintf(output, "%c%c%c%c%c%c%c", BEGIN, commandId, response, DIGITAL_READ, number, value, END);

  Serial.write(output , sizeof(output));
}

void analogWriteResponse(uint8_t response, uint8_t number, int value) {
  char output[10];

  char buffer[4];

  buffer[3] = value & 0xFF;
  buffer[2] = (value >> 8) & 0xFF;
  buffer[1] = (value >> 16) & 0xFF;
  buffer[0] = (value >> 24) & 0xFF;

  sprintf(output, "%c%c%c%c%c%c%c%c%c%c", BEGIN, commandId, response, ANALOG_WRITE, number, buffer[0], buffer[1], buffer[2], buffer[3], END);

  Serial.write(output , sizeof(output));
}

void analogReadResponse(uint8_t response, uint8_t number, int value) {
  char output[10];

  char buffer[4];

  buffer[3] = value & 0xFF;
  buffer[2] = (value >> 8) & 0xFF;
  buffer[1] = (value >> 16) & 0xFF;
  buffer[0] = (value >> 24) & 0xFF;

  sprintf(output, "%c%c%c%c%c%c%c%c%c%c", BEGIN, commandId, response, ANALOG_READ, number, buffer[0], buffer[1], buffer[2], buffer[3], END);

  Serial.write(output , sizeof(output));
}

int charsToInt(char* buffer) {
  return  (unsigned char)(buffer[0]) << 24 |
          (unsigned char)(buffer[1]) << 16 |
          (unsigned char)(buffer[2]) << 8 |
          (unsigned char)(buffer[3]);
}
