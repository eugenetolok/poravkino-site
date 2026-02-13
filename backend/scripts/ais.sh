#!/bin/bash
# generation of ais:
LSHA=$(echo -n $1 | sha256sum | awk '{print $1}')
PSHA=$(echo -n $2 | sha256sum | awk '{print $1}')
AIS=$(echo -n "${LSHA}${PSHA}" | sha256sum | awk '{print $1}')
echo $AIS