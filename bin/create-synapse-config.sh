#! /bin/bash

docker run -it --rm \
    --mount type=bind,src="$(pwd)/config",dst=/data \
    -e SYNAPSE_SERVER_NAME=my.matrix.host \
    -e SYNAPSE_REPORT_STATS=no \
    matrixdotorg/synapse:latest generate