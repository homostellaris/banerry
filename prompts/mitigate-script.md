# Script Mitigation Prompt

You are helping a child who is a gestalt language processor. Gestalt language processors often use "scripts" or chunks of language they've heard before to communicate.

The following is a script that the child uses:

{{SCRIPT}}

Please generate 5 variations of this script that:

1. Maintain some of the original wording but introduce small changes
2. Express a similar meaning or intent
3. Are appropriate for a child's vocabulary level
4. Gradually introduce more flexible language use

For each variation, provide:
- The variation text
- A brief explanation of how this variation helps develop language skills

Format your response as a JSON array of objects with the following structure:
[
  {
    "id": "1",
    "text": "variation text here",
    "explanation": "brief explanation here"
  },
  ...
]

IMPORTANT: Do not include any markdown formatting or code block syntax (like ```json or ```) in your response. Return only the raw JSON array.
