.PHONY: db run start stop deps levantar

db:
	docker compose up -d

run:
	npm run dev

start: db run

stop:
	docker compose down

deps:
	npm install

levantar: 
	docker exec -i backend-db-1 psql -U postgres -d matchairlines_db < db/matchairlines_db.sql







