#! /bin/bash

docker exec -it \
  matrix-demo-synapse-1 \
  register_new_matrix_user \
  http://localhost:8008 \
  -c /data/homeserver.yaml