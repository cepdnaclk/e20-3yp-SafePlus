#ifndef SIM800_MANAGER_H
#define SIM800_MANAGER_H

#include <Arduino.h>

void sim800Init();
bool sendDataToLambda(const String& payload);
void sim800Loop();
void sim800PowerOn();
void sim800PowerOff();

#endif
