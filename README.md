Run with:

sudo docker run -itd -v /var/files:/var/files -v /root/.ssh:/root/.ssh -v /var/www/dbman:/var/www --link mongodb:mongodb --link redis:redis -p 3000:3000 myimage/opendbman