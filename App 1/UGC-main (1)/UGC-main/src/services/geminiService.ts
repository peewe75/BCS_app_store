import { GoogleGenAI, Type } from "@google/genai";

// We create a new instance for every call to ensure we grab the latest key if it changes via window.aistudio
const getAIClient = async (apiKey?: string): Promise<GoogleGenAI> => {
  // 1. Prefer manual key if provided
  if (apiKey) {
    return new GoogleGenAI({ apiKey });
  }

  // 2. Check for AI Studio environment
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      throw new Error("API Key not selected. Please select a paid API key using the button.");
    }
  }

  // 3. Fallback to process.env (for local dev .env or baked in key)
  if (process.env.API_KEY || process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
  }

  throw new Error("No API Key found. Please enter one.");
};

/**
 * Step 1: Analyze product images (up to 3) and generate a lifestyle image prompt.
 * Now supports multiple images to improve accuracy on logos and text.
 */
export const generateLifestylePrompt = async (
  imagesBase64: string[],
  style: string = 'Realistic Lifestyle',
  chaos: number = 50,
  targetAudience: string = 'General Audience',
  platform: string = 'Social Media',
  ugcStyle: string = 'Product Showcase',
  language: string = 'English',
  dimensions: { width: string, height: string, unit: string } = { width: '', height: '', unit: 'cm' },
  promptLanguage: string = 'English',
  apiKey?: string
): Promise<string> => {
  const ai = await getAIClient(apiKey);

  // Prepare all images as parts
  const imageParts = imagesBase64.map(img => {
    const data = img.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    return {
      inlineData: {
        mimeType: 'image/png',
        data: data
      }
    };
  });

  // Determine creativity instruction based on chaos level
  let creativityInstruction = "Balance creativity with product clarity.";
  if (chaos < 30) {
    creativityInstruction = "Be conservative. Focus strictly on a traditional product showcase. Keep the composition simple.";
  } else if (chaos > 70) {
    creativityInstruction = "Be highly creative and dynamic. Use unexpected angles or dramatic lighting.";
  }

  // Construct dimension string if provided
  const dimensionContext = (dimensions.width && dimensions.height)
    ? `Physical Size: ${dimensions.width}x${dimensions.height} ${dimensions.unit}.`
    : "Physical Size: Not specified.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        ...imageParts,
        {
          text: `You are an expert Creative Director for high-end advertising. 
          Analyze these product images deeply. You have been provided with multiple angles/details of the SAME product.
          Combine visual information from all provided images to ensure maximum accuracy regarding logos, text, labels, and material textures.
          
          Create a detailed image generation prompt to place THIS EXACT PRODUCT into a realistic, aspirational lifestyle scene.
          
          **CRITICAL STRICT CONSTRAINTS:**
          1. **IDENTICAL PRODUCT:** The final image MUST look exactly like the reference product. Preserve all logos, text, fonts, colors, and material textures found in the reference images. The prompt must explicitly state to "Keep the product exactly as shown in the reference image".
          2. **ACCURATE SCALE:** ${dimensionContext} Use these dimensions to ensure the product is sized correctly relative to props and the environment.
          
          **Campaign Strategy:**
          - **Target Audience:** ${targetAudience}
          - **Target Video Audio Language:** ${language}
          - **Platform:** ${platform}
          - **UGC Style:** ${ugcStyle}
          
          **Visual Configuration:**
          - **Target Art Style:** ${style}
          - **Creativity:** ${creativityInstruction} (Level ${chaos}/100)

          **Instructions:**
          1. Describe the scene environment to fit '${ugcStyle}'.
          2. Explicitly describe the placement of the product.
          3. Add a specific instruction: "The object in the provided reference image must be composited into this scene unchanged."
          4. Ensure lighting matches '${style}'.
          5. **IMPORTANT:** Write the final output prompt in **${promptLanguage}** so the user can easily read and edit it.
          
          Output ONLY the image generation prompt text.`
        }
      ]
    }
  });

  return response.text || "A high quality photo of the product.";
};

/**
 * Step 2: Generate the lifestyle image.
 * Uses the primary image as the main reference for structure.
 */
export const generateLifestyleImage = async (
  prompt: string,
  referenceImageBase64: string | null,
  mode: 'quality' | 'speed' = 'quality',
  aspectRatio: string = '16:9',
  apiKey?: string
): Promise<string> => {
  const ai = await getAIClient(apiKey);

  // Select model based on mode
  const modelName = mode === 'quality' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  // Config differs by model. ImageSize is ONLY for 3-pro.
  const imageConfig: any = {
    aspectRatio: aspectRatio,
  };

  if (mode === 'quality') {
    imageConfig.imageSize = "1K";
  }

  console.log(`Generating image using model: ${modelName} with aspect ratio: ${aspectRatio}`);

  const parts: any[] = [];

  // 1. Add Reference Image (Critical for preserving product identity)
  if (referenceImageBase64) {
    const cleanData = referenceImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    parts.push({
      inlineData: {
        mimeType: 'image/png', // Simplified assumption, generally safe for data URLs
        data: cleanData
      }
    });
  }

  // 2. Add Prompt
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts },
    config: {
      imageConfig: imageConfig
    }
  });

  // Extract base64 image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated by the model.");
};

/**
 * Step 3: Create a video prompt based on the generated lifestyle image.
 * Now supports promptLanguage.
 */
export const generateVideoPrompt = async (
  generatedImageBase64: string,
  ugcStyle: string = 'Cinematic',
  platform: string = 'Social Media',
  language: string = 'English',
  promptLanguage: string = 'English',
  apiKey?: string
): Promise<string> => {
  const ai = await getAIClient(apiKey);
  const data = generatedImageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: data
          }
        },
        {
          text: `Analyze this lifestyle image. Create a video generation prompt for Veo 3.1.
          
          **Context:**
          - **Format:** ${ugcStyle}
          - **Platform:** ${platform} (Adjust pacing/movement accordingly)
          - **Target Content Language:** ${language}
          - **Output Prompt Language:** ${promptLanguage}

          **Instructions:**
          1. Describe a video movement of roughly 8 seconds.
          2. **AUDIO / SPEECH:** The prompt MUST explicitly request audio. If there are people, they **MUST SPEAK IN ${language}**.
          3. **TIMING & ENDING:** The video duration is roughly 8 seconds. The subject **MUST STOP SPEAKING AND MOVING completely by the 7th second**. The last second (7s-8s) must show the subject static and silent to ensure a clean ending without abrupt cuts.
          4. **IMPORTANT:** Write the description of the visual and audio elements in **${promptLanguage}** so the user can easily read and edit it.
          
          Output ONLY the prompt text.`
        }
      ]
    }
  });

  return response.text || "Cinematic slow motion shot with audio.";
};

/**
 * Step 4: Generate video using Veo 3.1.
 */
export const generateVeoVideo = async (imageBase64: string, prompt: string, apiKey?: string): Promise<string> => {
  const ai = await getAIClient(apiKey);
  const data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  console.log("Starting Veo generation...");

  // Veo currently supports specific aspect ratios. We default to 16:9 in this function
  // as the upstream logic doesn't strictly pass aspect ratio to this specific function yet,
  // but Veo is flexible with input images.
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: data,
      mimeType: 'image/png'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9' // Defaulting to landscape for now, typically safe
    }
  });

  // Enhanced Polling with Timeout
  // Veo can take 60-90 seconds. We poll every 5s. 
  // Max attempts: 40 (~3.5 minutes) to prevent infinite loops.
  const MAX_ATTEMPTS = 40;
  let attempts = 0;

  while (!operation.done) {
    attempts++;
    console.log(`Polling Veo status... Attempt ${attempts}/${MAX_ATTEMPTS}`);

    if (attempts > MAX_ATTEMPTS) {
      throw new Error("Video generation timed out. The server is taking too long to respond.");
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });

    // Check for explicit error in the operation during polling
    if (operation.error) {
      console.error("Veo Operation Error:", operation.error);
      throw new Error(`Veo API Error: ${operation.error.message || 'Unknown error occurred during generation'}`);
    }
  }

  // Double check error state after completion
  if (operation.error) {
    console.error("Veo Operation Error (Final):", operation.error);
    throw new Error(`Veo API Error: ${operation.error.message}`);
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!videoUri) {
    // Log full operation for debugging
    console.error("Veo Operation completed without URI. Full Object:", JSON.stringify(operation, null, 2));
    throw new Error("Video generation completed but no video URI returned. This may be due to safety filters or a model error.");
  }

  // Fetch the video content to create a local blob URL
  // Use the manual key if provided, otherwise fallback to env
  const keyToUse = apiKey || process.env.API_KEY;
  const response = await fetch(`${videoUri}&key=${keyToUse}`);

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};