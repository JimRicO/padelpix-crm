

## Update CRM_API_KEY Secret

### Objective
Update the `CRM_API_KEY` secret to `PadelpixCode1_` so both the CRM and enrichment app use matching credentials.

### Steps

1. **Update the secret value**
   - Set `CRM_API_KEY` = `PadelpixCode1_`
   - This will prompt you to confirm/enter the new value

2. **Verify the update**
   - Test the `api-get-clubs` endpoint with the new key
   - Confirm successful authentication (200 response instead of 401)

3. **Confirm integration readiness**
   - Ensure the enrichment app is configured with the same key value
   - Both apps will then be able to communicate securely

### Expected Result
After approval, the API will accept requests with the `x-api-key: PadelpixCode1_` header, enabling the enrichment platform to pull and push club data.

