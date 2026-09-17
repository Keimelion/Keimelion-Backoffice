#!/bin/bash

BASE_URL="http://localhost:3000"

# 1. Login
echo "=== LOGIN ==="
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@keimelion.com","password":"password"}')

TOKEN=$(echo "$LOGIN_RESP" | jq -r '.accessToken')
echo "Token: ${TOKEN:0:30}..."

# 2. List occasion types
echo -e "\n=== LIST OCCASION TYPES ==="
curl -s "$BASE_URL/v1/admin/occasion-types" \
  -H "Authorization: Bearer $TOKEN" | jq '.items[0:2]'

# 3. Create
echo -e "\n=== CREATE OCCASION TYPE ==="
CREATE_SLUG="test-$(date +%s)"
CREATE_RESP=$(curl -s -X POST "$BASE_URL/v1/admin/occasion-types" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"slug\": \"$CREATE_SLUG\",
    \"emoji\": \"🎉\",
    \"sortOrder\": 999,
    \"isActive\": true,
    \"labels\": {
      \"en\": \"Test Occasion EN\",
      \"fr\": \"Test Occasion FR\"
    }
  }")

CREATED_ID=$(echo "$CREATE_RESP" | jq -r '.id // .data.id // empty')
echo "Created ID: $CREATED_ID"
echo "Response: $(echo "$CREATE_RESP" | jq .)"

if [ -z "$CREATED_ID" ]; then
  echo "⚠ Create failed"
  exit 1
fi

# 4. Update
echo -e "\n=== UPDATE OCCASION TYPE ==="
UPDATE_RESP=$(curl -s -X PATCH "$BASE_URL/v1/admin/occasion-types/$CREATED_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "labels": {
      "en": "Updated Test EN",
      "fr": null
    }
  }')

echo "Update response: $(echo "$UPDATE_RESP" | jq .)"

# 5. Delete
echo -e "\n=== DELETE OCCASION TYPE ==="
DELETE_RESP=$(curl -s -X DELETE "$BASE_URL/v1/admin/occasion-types/$CREATED_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Delete status: $(echo "$DELETE_RESP" | jq -r '.success // .status // "unknown"')"

# 6. Test permissions: Moderator
echo -e "\n=== MODERATOR PERMISSIONS TEST ==="
MOD_LOGIN=$(curl -s -X POST "$BASE_URL/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"moderator@example.com","password":"password"}')

MOD_TOKEN=$(echo "$MOD_LOGIN" | jq -r '.accessToken')

MOD_CREATE=$(curl -s -X POST "$BASE_URL/v1/admin/occasion-types" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -d '{"slug":"test","emoji":"🎉","labels":{"en":"Test"}}')

MOD_STATUS=$(echo "$MOD_CREATE" | jq -r '.statusCode // .error // .message // "ok"')
echo "Moderator create attempt: $MOD_STATUS (expected: 403)"

