
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DailyLesson } from "../types";

// Custom base64 decoder
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Custom PCM decoder
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const fetchDailyLesson = async (): Promise<DailyLesson> => {
  // Always use process.env.API_KEY directly when initializing the GoogleGenAI client instance
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const today = new Date().toLocaleDateString();
  
  // 날짜를 포함하여 매번 새로운 주제를 유도하는 프롬프트
  const prompt = `Today is ${today}. Generate a unique daily travel English lesson with a specific theme.
  The theme should be one of many travel situations (e.g., Booking a flight, Checking into a hostel, Ordering street food, Asking for directions, Rental car issues, Museum tours, Beach activities, etc.).
  Ensure the content is different every time.
  Provide:
  1. A "theme" name.
  2. 5 vocabulary words relevant to the theme (with Korean meaning, phonetic, and example).
  3. 5 essential travel sentences (with Korean meaning and context).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING },
          words: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                word: { type: Type.STRING },
                meaning: { type: Type.STRING },
                phonetic: { type: Type.STRING },
                example: { type: Type.STRING }
              },
              required: ["id", "word", "meaning", "phonetic", "example"]
            }
          },
          sentences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                english: { type: Type.STRING },
                korean: { type: Type.STRING },
                situation: { type: Type.STRING }
              },
              required: ["id", "english", "korean", "situation"]
            }
          }
        },
        required: ["theme", "words", "sentences"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as DailyLesson;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Could not load daily lesson. Please try again.");
  }
};

export const speakText = async (text: string): Promise<void> => {
  // Always use process.env.API_KEY directly when initializing the GoogleGenAI client instance
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioData = decodeBase64(base64Audio);
  const audioBuffer = await decodeAudioData(audioData, audioContext, 24000, 1);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};
