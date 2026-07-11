/**
 * AI Prompt for CRM field extraction from arbitrary CSV data.
 * 
 * This prompt is carefully engineered to:
 * 1. Understand any CSV column naming convention
 * 2. Map fields intelligently to CRM schema
 * 3. Handle edge cases (multiple emails, phones, messy data)
 * 4. Enforce enum constraints
 * 5. Produce clean, structured output
 */

export function buildExtractionPrompt(
  headers: string[],
  sampleRows: Record<string, string>[],
  batchRows: Record<string, string>[]
): string {
  const headerList = headers.map((h) => `"${h}"`).join(', ');
  const sampleData = JSON.stringify(sampleRows.slice(0, 3), null, 2);
  const batchData = JSON.stringify(batchRows, null, 2);

  return `You are an expert data extraction AI for a CRM system called GrowEasy. Your task is to intelligently map CSV data with arbitrary column names into a standardized CRM format.

## CSV CONTEXT
The uploaded CSV has these column headers: [${headerList}]

Here are a few sample rows to understand the data structure:
${sampleData}

## YOUR TASK
Extract and map each record below into the GrowEasy CRM format. You must return a JSON array of objects.

## CRM FIELD DEFINITIONS
Map the CSV data to these fields. Use intelligent matching — column names may vary wildly:

| Field | Description | Mapping Hints |
|-------|-------------|---------------|
| created_at | Lead creation date/time | Look for: date, created, timestamp, submission date, form date, entry date. Format: "YYYY-MM-DD HH:mm:ss" |
| name | Full name of the lead | Look for: name, full name, first name + last name, contact name, customer name. Combine first+last if separate. |
| email | Primary email address | Look for: email, email address, e-mail, contact email. If multiple emails exist, use the FIRST one and put the rest in crm_note. |
| country_code | Phone country code | Look for: country code, phone code, dial code. Extract from phone number if embedded (e.g., "+91" from "+919876543210"). Format: "+XX" |
| mobile_without_country_code | Mobile number WITHOUT country code | Look for: phone, mobile, cell, telephone, contact number. Strip the country code. If multiple numbers exist, use the FIRST one and put the rest in crm_note. |
| company | Company/organization name | Look for: company, organization, business, firm, employer, agency |
| city | City | Look for: city, town, locality, location |
| state | State/province | Look for: state, province, region |
| country | Country | Look for: country, nation, location |
| lead_owner | Email of the person managing this lead | Look for: owner, assigned to, agent, sales rep, manager, handled by |
| crm_status | Lead status | Must be EXACTLY one of: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE". Infer from status/disposition columns. If unsure, use "GOOD_LEAD_FOLLOW_UP". |
| crm_note | Notes and extra information | Look for: notes, remarks, comments, description, follow-up. ALSO append: extra emails, extra phone numbers, any useful info that doesn't fit other fields. |
| data_source | Source of the lead | Must be EXACTLY one of: "leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots". Look for: source, campaign, channel, medium, lead source. If no confident match, leave as empty string "". |
| possession_time | Property possession timeline | Look for: possession, timeline, delivery date, handover, move-in |
| description | Additional description | Look for: description, details, about, summary, property details |

## CRITICAL RULES

1. **SKIP RULE**: If a record has NEITHER an email NOR a mobile number, mark it with "_skip": true and "_skip_reason": "No email or mobile number found".

2. **MULTIPLE CONTACTS**: If multiple emails exist, use the first as "email" and append others to "crm_note" like: "Additional emails: email2@x.com, email3@x.com". Same for phone numbers.

3. **PHONE NUMBER PARSING**: 
   - If a phone number includes country code (e.g., "+919876543210"), split into country_code: "+91" and mobile: "9876543210".
   - If country code is obvious from context (e.g., Indian numbers starting with 91), extract it.
   - Common country codes: +91 (India), +1 (US/Canada), +44 (UK), +971 (UAE).

4. **DATE HANDLING**: Convert any date format to "YYYY-MM-DD HH:mm:ss". If only a date is available (no time), use "00:00:00". If no date exists, use empty string "".

5. **CRM STATUS INFERENCE**: 
   - "interested", "follow up", "hot lead", "qualified" → "GOOD_LEAD_FOLLOW_UP"
   - "no answer", "not reachable", "busy", "voicemail" → "DID_NOT_CONNECT"
   - "not interested", "junk", "spam", "irrelevant", "wrong number" → "BAD_LEAD"
   - "converted", "won", "closed", "purchased", "deal done" → "SALE_DONE"
   - If no status column or unclear → "GOOD_LEAD_FOLLOW_UP"

6. **DATA SOURCE**: Only use one of the 5 allowed values. Match based on campaign names, project names, or source fields. If no confident match, use empty string "".

7. **EMPTY FIELDS**: Use empty string "" for any field you cannot find data for. Never use null or undefined.

8. **NAME CONSTRUCTION**: If first name and last name are separate columns, combine them as "FirstName LastName".

## RECORDS TO PROCESS
${batchData}

## OUTPUT FORMAT
Return a JSON array. Each element must have ALL CRM fields plus optional "_skip" and "_skip_reason":
[
  {
    "created_at": "2026-05-13 14:20:48",
    "name": "John Doe",
    "email": "john@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9876543210",
    "company": "GrowEasy",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "lead_owner": "",
    "crm_status": "GOOD_LEAD_FOLLOW_UP",
    "crm_note": "",
    "data_source": "",
    "possession_time": "",
    "description": "",
    "_skip": false,
    "_skip_reason": ""
  }
]

Process ALL records provided. Return ONLY the JSON array, no additional text.`;
}
