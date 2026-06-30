## ショートカット（自分のよく使うものを登録すると便利）
default: containers-start
lint: policy-edit-frontend-lint policy-edit-backend-lint frontend-lint idea-discussion-backend-lint admin-lint
format: policy-edit-frontend-format policy-edit-backend-format frontend-format idea-discussion-backend-format admin-format
test: policy-edit-frontend-test policy-edit-backend-test frontend-test idea-discussion-backend-test admin-test

# ターゲット定義（makefile は薄いラッパーとして使う。複雑な処理を書かずシンプルに保つこと）
containers-start:
	docker compose up

containers-stop:
	docker compose down

idea-discussion-containers-start:
	docker compose up frontend idea-backend mongo admin

idea-discussion-containers-build:
	docker compose up frontend idea-backend mongo admin --build

policy-edit-containers-start:
	docker compose up policy-frontend policy-backend

policy-edit-containers-build:
	docker compose up policy-frontend policy-backend --build

policy-edit-frontend-lint:
	cd policy/frontend && npm run lint

policy-edit-frontend-format:
	cd policy/frontend && npm run format

policy-edit-frontend-test:
	cd policy/frontend && npm run test

policy-edit-backend-lint:
	cd policy/backend && npm run lint

policy-edit-backend-format:
	cd policy/backend && npm run format

policy-edit-backend-test:
	cd policy/backend && npm run test

frontend-lint:
	cd vision/frontend && npm run lint

frontend-format:
	cd vision/frontend && npm run format

frontend-test:
	cd vision/frontend && npm run test

idea-discussion-backend-lint:
	cd vision/idea-discussion/backend && npm run lint

idea-discussion-backend-format:
	cd vision/idea-discussion/backend && npm run format

idea-discussion-backend-test:
	cd vision/idea-discussion/backend && npm run test

# Admin panel commands
admin-containers-start:
	docker compose up admin

admin-lint:
	cd vision/admin && npm run lint

admin-format:
	cd vision/admin && npm run format

admin-test:
	cd vision/admin && npm run test

admin-build:
	cd vision/admin && npm run build
