"use server"

export async function generateImage(prompt: string, size: "256x256" | "512x512" | "1024x1024" = "512x512") {
  try {
    // Check if API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return {
        success: false,
        error: "OpenAI API key is not configured. Please add your OPENAI_API_KEY to the environment variables.",
      }
    }

    // Validate inputs
    if (!prompt) {
      return {
        success: false,
        error: "Prompt is required for image generation",
      }
    }

    // Validate size parameter
    const validSizes = ["256x256", "512x512", "1024x1024"]
    if (!validSizes.includes(size)) {
      return {
        success: false,
        error: `Size must be one of: ${validSizes.join(", ")}`,
      }
    }

    console.log(`Generating image for prompt: "${prompt}" with size: ${size}`)

    // Use direct fetch to OpenAI API
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        quality: "standard",
        response_format: "b64_json",
      }),
    })

    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // If we can't parse the error response, use the status
      }

      console.error("OpenAI API error:", errorMessage)

      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.",
        }
      }

      if (response.status === 429) {
        return {
          success: false,
          error: "OpenAI API rate limit exceeded. Please try again later.",
        }
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    // Get the response data
    const responseData = await response.json()
    
    if (!responseData.data || !responseData.data[0] || !responseData.data[0].b64_json) {
      return {
        success: false,
        error: "Invalid response from OpenAI API",
      }
    }

    console.log("Image generated successfully")

    return {
      success: true,
      imageData: responseData.data[0].b64_json,
      revisedPrompt: responseData.data[0].revised_prompt,
      originalPrompt: prompt,
      size: size,
    }
  } catch (error) {
    console.error("Image generation error:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    return {
      success: false,
      error: errorMessage,
    }
  }
}