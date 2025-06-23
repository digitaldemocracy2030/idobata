# environments/stg/terraform.tfvars.example
project_id = "daikibo-jyukugi-cdp"
region     = "asia-northeast1"
team_name  = "cdp-team"
# Sensitive values - DO NOT COMMIT REAL VALUES
python_api_url     = "https://stg.api.daikibo-jyukugi-cdp.jp"

# User サービス用
user_image_tag = "latest"
vite_frontend_allowed_hosts = "stg.daikibo-jyukugi-cdp.jp"
user_min_instances = 0
user_max_instances = 10

# Admin サービス用
admin_image_tag = "latest"
admin_frontend_allowed_hosts = "stg.admin.daikibo-jyukugi-cdp.jp"
admin_min_instances = 0
admin_max_instances = 10

# API サービス用
api_image_tag      = "latest"
api_base_url       = "https://stg.api.daikibo-jyukugi-cdp.jp"
idea_cors_origin   = "https://stg.daikibo-jyukugi-cdp.jp"
allow_delete_theme = "false"
api_min_instances  = 1
api_max_instances  = 10

# Python サービス用
python_image_tag = "latest"
python_min_instances = 0
python_max_instances = 5
