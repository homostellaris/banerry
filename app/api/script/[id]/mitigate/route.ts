import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Hard-coded list of scripts - same as in the other route
const scripts = [
  {
    id: "1",
    text: "Want to go to the park",
    meanings: [
      { id: "1", text: "I want to go to the park", context: "When looking out the window" },
      { id: "2", text: "Can we go to the park?", context: "When bored at home" },
    ],
    dateAdded: "2023-05-10T10:30:00Z",
  },
  {
    id: "2",
    text: "More juice please",
    meanings: [
      { id: "1", text: "I would like more juice", context: "During meal times" },
      { id: "2", text: "I am thirsty", context: "When playing" },
    ],
    dateAdded: "2023-05-12T14:20:00Z",
  },
  {
    id: "3",
    text: "Let it go, let it go",
    meanings: [
      { id: "1", text: "I want to watch Frozen", context: "When near the TV" },
      { id: "2", text: "I am feeling overwhelmed", context: "During stressful situations" },
    ],
    dateAdded: "2023-05-15T09:45:00Z",
  },
  {
    id: "4",
    text: "To infinity and beyond",
    meanings: [
      { id: "1", text: "I want to play with my Buzz Lightyear toy", context: "When in playroom" },
      { id: "2", text: "I want to watch Toy Story", context: "When looking at the TV" },
    ],
    dateAdded: "2023-05-18T16:10:00Z",
  },
  {
    id: "5",
    text: "Not feeling good",
    meanings: [
      { id: "1", text: "I am sick or in pain", context: "When touching stomach or head" },
      { id: "2", text: "I am tired", context: "When rubbing eyes" },
    ],
    dateAdded: "2023-05-20T11:30:00Z",
  },
]

// Function to clean the AI response of any markdown formatting
function cleanJsonResponse(text: string): string {
  // Remove markdown code block syntax if present
  let cleaned = text.trim()

  // Remove ```json or ``` at the beginning
  cleaned = cleaned.replace(/^```json\s*|^```\s*/i, "")

  // Remove ``` at the end
  cleaned = cleaned.replace(/\s*```$/i, "")

  // Trim any extra whitespace
  cleaned = cleaned.trim()

  return cleaned
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Find the script directly from our data
    const script = scripts.find((s) => s.id === params.id)

    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    // Read the prompt template from the markdown file
    const promptPath = path.join(process.cwd(), "prompts", "mitigate-script.md")
    const promptTemplate = fs.readFileSync(promptPath, "utf8")

    // Replace the placeholder with the actual script
    const prompt = promptTemplate.replace("{{SCRIPT}}", script.text)

    // Call ChatGPT with the prompt
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
    })

    // Clean the response of any markdown formatting
    const cleanedResponse = cleanJsonResponse(text)
    console.log("Cleaned response:", cleanedResponse.substring(0, 100) + "...")

    // Parse the response as JSON
    try {
      const mitigations = JSON.parse(cleanedResponse)
      return NextResponse.json(mitigations)
    } catch (error) {
      console.error("Error parsing AI response:", error)
      console.log("Raw AI response:", text)
      return NextResponse.json({ error: "Failed to parse AI response", rawResponse: text }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating mitigations:", error)
    return NextResponse.json(
      { error: "Failed to generate mitigations", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
