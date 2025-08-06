### 実行方法
各々環境の下に行って下記を実行

#### dev

```
cd terraform/environments/dev
terraform plan \
  -var="mongodb_uri=$MONGODB_URI" \
  -var="password_pepper=$PASSWORD_PEPPER" \
  -var="openrouter_api_key=$OPENROUTER_API_KEY" \
  -var="jwt_secret=$JWT_SECRET" \
  -var="openai_api_key=$OPENAI_API_KEY"
```
問題なかったらapply