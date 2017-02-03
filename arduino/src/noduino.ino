/**
 * Author : Mohamed El Amine Daddou, Ben Taimia HADDADI
 *
 */
#include <Arduino.h>
#include <DHT.h>


#define BEGIN   '#'
#define END     '.'

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
  ERROR         = 0x01,
  SUCCESS       = 0x02,
  DIGITAL_VALUE = 0x12,
  ANALOG_VALUE  = 0x22
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

  delay(500);
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
      error();
    break;
  }
}

void _enable() {
  if (length != 2)
  {
    error();
    return;
  }

  uint8_t value = cmdBuffer[1];
  if (value == 0x00) {
    enabled = false;
  }
  else {
    enabled = true;
  }
  success();
}

void _setPinMode() {
  if (length != 3)
  {
    error();
    return;
  }

  uint8_t number  = cmdBuffer[1];
  uint8_t value   = cmdBuffer[2];

  switch (value) {
    case DIGITAL_OUTPUT:
      pinMode(number, OUTPUT);
    break;
    case DIGITAL_INPUT:
      pinMode(number, INPUT);
    break;
    default:
      error();
      return;
    break;
  }
  success();
}

void _digitalRead() {
  if (length != 2)
  {
    error();
    return;
  }

  uint8_t number  = cmdBuffer[1];
  uint8_t value   = digitalRead(number);

  digitalValue(value);
}

void _digitalWrite() {
  if (length != 3)
  {
    error();
    return;
  }

  uint8_t number  = cmdBuffer[1];
  uint8_t value   = cmdBuffer[2];

  if (value == 0x00) {
    digitalWrite(number, LOW);
  }
  else {
    digitalWrite(number, HIGH);
  }
  success();
}

void _analogRead() {
  if (length != 2)
  {
    error();
    return;
  }

  uint8_t number  = cmdBuffer[1];
  int value       = analogRead(number);
  analogValue(16);
}

void _analogWrite() {
  if (length != 6)
  {
    error();
    return;
  }

  uint8_t number  = cmdBuffer[1];
  int value       = charsToInt(cmdBuffer+2);

  analogWrite(number, value)

  success();
}

void success() {
  String output = "#";
  output = output +  (char) SUCCESS;
  output = output +  END;
  Serial.print(output);
}

void error() {
  String output = "#";
  output = output +  (char) ERROR;
  output = output +  END;
  Serial.print(output);
}

void digitalValue(uint8_t value) {
  char output[4];

  sprintf(output, "%c%c%c%c", BEGIN, ANALOG_VALUE, value, END);

  Serial.write(output , sizeof(output));
}

void analogValue(int value) {
  char output[7];

  char buffer[4];

  buffer[3] = value & 0xFF;
  buffer[2] = (value >> 8) & 0xFF;
  buffer[1] = (value >> 16) & 0xFF;
  buffer[0] = (value >> 24) & 0xFF;

  sprintf(output, "%c%c%c%c%c%c%c", BEGIN, ANALOG_VALUE, buffer[0], buffer[1], buffer[2], buffer[3], END);

  Serial.write(output , sizeof(output));
}

int charsToInt(char* buffer) {
  return  (unsigned char)(buffer[0]) << 24 |
          (unsigned char)(buffer[1]) << 16 |
          (unsigned char)(buffer[2]) << 8 |
          (unsigned char)(buffer[3]);
}
