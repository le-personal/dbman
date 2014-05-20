Run with:

# Create data-only container for files
sudo docker run -v /var/files --name DBMAN_FILES busybox true
sudo docker run -v /data/db --name DBMAN_DBDATA busybox true

# Create container
sudo docker run -itd --volumes-from=DBMAN_FILES -v /root/.ssh:/root/.ssh -v /var/www/dbman:/var/www --link mongodb:mongodb --link redis:redis -p 3000:3000 myimage/opendbman

# Or go to the docker directory inside the project and run
fig up