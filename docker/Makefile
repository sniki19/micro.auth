prepare.production:
	MODE=production sh ./prepare.sh

prepare.local:
	MODE=local sh ./prepare.sh

up.local:
	make prepare.local
	make -C ./build.local db.up app.up

down.local:
	make -C ./build.local db.down app.down
	rm -r ./build.local
