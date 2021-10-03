echo "1--loading accounts_large.json in mongo collection accounts"
mongoimport --db accounts --collection accounts --drop --jsonArray --file /docker-entrypoint-initdb.d/accounts_large.json
