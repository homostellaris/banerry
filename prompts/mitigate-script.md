# Script Mitigation Prompt

You are helping a child who is a gestalt language processor. Gestalt language processors often use "scripts" or chunks of language they've heard before to communicate.

The following is a script that the child uses:

{{SCRIPT}}

Please generate 5 'mitigations' of this script. A mitigation is variation of the phrase which re-uses a large meaningful
chunk of the original script in a new way. The hope is that by seeing different examples the child can learn more about
that smaller chunk of the original script and how to re-use it in different ways.

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
