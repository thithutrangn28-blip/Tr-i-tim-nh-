// src/utils/nsfwApiProxy.ts
// File này chuyên hỗ trợ NSFW, không thay thế file apiProxy.ts cũ

import { GoogleGenAI } from "@google/genai";
import { ApiProxySettings } from "./apiProxy";   // Import interface từ file cũ
import { NSFWCore } from "../core/nsfw/nsfw-core";   // Import NSFWCore

// ==================== NSFW VERSION OF SEND MESSAGE ====================
export const sendNSFWMessage = async (
  settings: ApiProxySettings, 
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  characterInfo?: string,
  intensity: 'cao' | 'trung bình' | 'nhẹ' = 'cao'   // Độ mạnh NSFW
) => {
  
  // Tạo system prompt NSFW mạnh
  const nsfwSystemPrompt = NSFWCore.getSystemPrompt(intensity);

  const fullSystemInstruction = [
    nsfwSystemPrompt,                                 // ← Thêm NSFW mạnh vào đây
    settings.systemPrompt || "",                      // Giữ system prompt cũ nếu có
    characterInfo ? `\n\nCHARACTER INFORMATION:\n${characterInfo}` : ""
  ].filter(Boolean).join("\n");

  // Gọi lại hàm cũ từ apiProxy.ts để tránh viết lại code
  const oldSendMessage = (await import('./apiProxy')).sendMessage;

  // Tạo settings mới với system prompt đã được nâng cấp NSFW
  const enhancedSettings = {
    ...settings,
    systemPrompt: fullSystemInstruction   // Ghi đè system prompt bằng phiên bản có NSFW
  };

  return oldSendMessage(enhancedSettings, messages, characterInfo);
};

// ==================== NSFW VERSION OF STREAM ====================
export const sendNSFWMessageStream = async (
  settings: ApiProxySettings, 
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  characterInfo?: string,
  intensity: 'cao' | 'trung bình' | 'nhẹ' = 'cao'
) => {

  const nsfwSystemPrompt = NSFWCore.getSystemPrompt(intensity);

  const fullSystemInstruction = [
    nsfwSystemPrompt,
    settings.systemPrompt || "",
    characterInfo ? `\n\nCHARACTER INFORMATION:\n${characterInfo}` : ""
  ].filter(Boolean).join("\n");

  const oldSendMessageStream = (await import('./apiProxy')).sendMessageStream;

  const enhancedSettings = {
    ...settings,
    systemPrompt: fullSystemInstruction
  };

  return oldSendMessageStream(enhancedSettings, messages, characterInfo);
};

// Export hàm force khi cần dùng thủ công
export { NSFWCore };