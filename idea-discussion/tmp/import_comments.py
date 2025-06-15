import csv
import json
import html
import os
import requests
# 実際のファイル名に変更してください。
# csvのヘッダーはcontent, sourceType,sourceUrl(任意)です。
csv_file = "driving.csv"
theme_id = "aaaaaaa"

# 実際のthemeIdに変更してください。
api_url = os.getenv("API_URL")
if api_url is None:
    raise ValueError("API_URL is not set")
endpoint = f"{api_url}/api/themes/{theme_id}/import/generic"

with open(csv_file, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        content = html.unescape(row["content"]).replace("<br>", "\n")
        source_type = row["sourceType"]
        source_url = row["sourceUrl"]

        payload = {
            "sourceType": source_type,
            "content": content,
            "metadata": {
                "url": source_url
            }
        }

        headers = {
            "Content-Type": "application/json"
        }

        response = requests.post(endpoint, headers=headers, data=json.dumps(payload))

        print(f"Sent: {source_url} → Status {response.status_code}")
        if response.status_code != 200:
            print("  Response:", response.text)
