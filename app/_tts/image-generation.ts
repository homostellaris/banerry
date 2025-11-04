"use server";

export async function generateImage(prompt: string) {
  try {
    // Check if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "OpenAI API key is not configured. Please add your OPENAI_API_KEY to the environment variables.",
      };
    }

    // Validate input
    if (!prompt) {
      return {
        success: false,
        error: "Prompt is required for image generation",
      };
    }

    console.log(`Generating image for prompt: "${prompt}"`);

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
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
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
        return {
          success: false,
          error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.",
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          error: "OpenAI API rate limit exceeded. Please try again later.",
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Get the image data
    const data = await response.json();
    const imageBase64 = data.data[0].b64_json;

    console.log("Image generated successfully");

    return {
      success: true,
      imageData: `data:image/png;base64,${imageBase64}`,
      prompt: prompt,
    };
  } catch (error) {
    console.error("Image generation error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}