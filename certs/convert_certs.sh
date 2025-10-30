#!/bin/bash

# Function to convert PEM to C header format
pem_to_c_header() {
    local input_file=$1
    local var_name=$2
    
    echo "const char* $var_name = "
    awk '{
        if (NR > 1) printf "  "
        printf "\"%s\\n\"\n", $0
    }' "$input_file"
    echo ";"
    echo ""
}

echo "// Auto-generated certificates"
echo "// Generated on: $(date)"
echo ""

echo "// CA Certificate"
pem_to_c_header ca/ca-cert.pem "CA_CERT"

echo "// Device 1 Certificate"
pem_to_c_header esp32-device1/device1-cert.pem "DEVICE1_CERT"

echo "// Device 1 Private Key"
pem_to_c_header esp32-device1/device1-key.pem "DEVICE1_KEY"

echo "// Device 2 Certificate"
pem_to_c_header esp32-device2/device2-cert.pem "DEVICE2_CERT"

echo "// Device 2 Private Key"
pem_to_c_header esp32-device2/device2-key.pem "DEVICE2_KEY"
