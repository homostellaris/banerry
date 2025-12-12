"use server";

import fs from "fs";
import path from "path";

export interface Mitigation {
  id: string;
  text: string;
  explanation: string;
}

// Function to clean the AI response of any markdown formatting
function cleanJsonResponse(text: string): string {
  // Remove markdown code block syntax if present
  let cleaned = text.trim();

  // Remove \`\`\`json or \`\`\` at the beginning
  cleaned = cleaned.replace(/^```json\s*|^```\s*/i, "");

  // Remove \`\`\` at the end
  cleaned = cleaned.replace(/\s*```$/i, "");

  // Trim any extra whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

export async function generateMitigations(
  scriptText: string
): Promise<Mitigation[]> {
  // Add a small delay to ensure the loading state is visible
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    // Check if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OpenAI API key is not configured. Please add your OPENAI_API_KEY to the environment variables."
      );
    }

    // Read the prompt template from the markdown file
    const promptPath = path.join(
      process.cwd(),
      "app",
      "_mitigations",
      "prompt.md"
    );
    const promptTemplate = fs.readFileSync(promptPath, "utf8");

    // Replace the placeholder with the actual script
    const prompt = promptTemplate.replace("{{SCRIPT}}", scriptText);

    console.log("Generating mitigations for script:", scriptText);

    // Use direct fetch to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // If we can't parse the error response, use the status
      }

      console.error("OpenAI API error:", errorMessage);

      if (response.status === 401) {
        throw new Error(
          "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable."
        );
      }

      if (response.status === 429) {
        throw new Error(
          "OpenAI API rate limit exceeded. Please try again later."
        );
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from OpenAI");
    }

    // Clean the response of any markdown formatting
    const cleanedResponse = cleanJsonResponse(text);

    // Parse the response as JSON
    try {
      const mitigations = JSON.parse(cleanedResponse);
      console.log("Successfully generated mitigations");
      return mitigations;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.log("Raw AI response:", text);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Error generating mitigations:", error);
    throw new Error(
      `Failed to generate mitigations: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
