import csv
import json
import html
import requests

# ファイル名
csv_file = "driving.csv"
endpoint = "http://localhost:3000/api/import/generic"

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
