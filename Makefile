.PHONY: clean build

build: node_modules
	npm run build

node_modules: leaf/pkg package.json
	npm install

leaf/pkg: leaf/src/*.rs leaf/Cargo.toml
	cd leaf && wasm-pack build --target web

clean:
	@rm -rf ./node_modules ./leaf/target ./leaf/pkg
