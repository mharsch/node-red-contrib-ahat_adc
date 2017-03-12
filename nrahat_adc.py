#!/usr/bin/python

# copy the pattern from 'nrgpio.py' where we open a connection to the hardware
# and listen for input and respond with analog conversion values
#
# Unlike nrgpio, this command takes no arguments when invoked.  Once running
# it accepts analog input port numbers (1, 2, 3, or 4) on <stdin> and responds
# with the analog conversion value associated with the underlying adc channel.

import automationhat
import sys

while True:
    try:
        data = raw_input()
        print(automationhat.analog.read())
    except (EOFError, SystemExit):
        sys.exit(0)

