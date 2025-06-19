import csv
import json
import html
import os
import requests
# 実際のファイル名に変更してください。
# csvのヘッダーはcontent, sourceType,sourceUrl(任意)です。
csv_file = "driving.csv"
# 実際のthemeIdに変更してください。
theme_id = "aaaaaaa"
# 実際のエンドポイントに変更してください
endpoint = "http://localhost:3000/api/themes/{themeId}/import/generic"

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
