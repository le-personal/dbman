Run with:

sudo docker run -d \
--name dbman \
-v /home/someuser/.ssh:/root/.ssh \
-v /var/files:/var/files \
-v /var/log/docker/dbman:/var/log/supervisor \
-p 3001:3000 \
-e MONGODB_DATABASE=dbman \
-e SECRET="The monkey is on the tree" \
-e MONGODB_PORT_27017_TCP_ADDR=139.111.0.206 \
-e MONGODB_PORT_27017_TCP_PORT=27017 \
-e REDIS_PORT_6379_TCP_ADDR=139.111.0.206 \
-e REDIS_PORT_6379_TCP_PORT=6379 \
-e PORT=3000 \
-e NODE_ENV=production \
iiieperobot/dbman 

# To purge expired backups run from the root directory



