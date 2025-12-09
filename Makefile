.PHONY: db run move start stop deps levantar

db:
	docker compose up -d


run:
	cd backend && npm run dev

start: db run

stop:
	docker compose down

deps:
	npm install

levantar: 
	docker exec -i tp-final_ids-db-1 psql -U postgres -d matchairlines_db < backend/db/matchairlines_db.sql







