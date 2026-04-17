// src/services/nsfwService.ts
// File chuyên hỗ trợ NSFW - Không sửa file cũ, chỉ thêm file mới này

import { ApiProxySettings } from '../utils/apiProxy';
import { NSFWCore } from '../core/nsfw/nsfw-core';
import { sendMessage, sendMessageStream } from '../utils/apiProxy';

// ==================== GỬI TIN NHẮN CÓ NSFW ====================
export const sendNSFWMessage = async (
  settings: ApiProxySettings,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  characterInfo?: string,
  intensity: 'cao' | 'trung bình' | 'nhẹ' = 'cao'   // Độ mạnh NSFW
): Promise<string> => {

  // Tạo system prompt NSFW mạnh
  const nsfwPrompt = NSFWCore.getSystemPrompt(intensity);

  // Kết hợp với system prompt cũ (nếu có)
  const fullSystemInstruction = [
    nsfwPrompt,
    settings.systemPrompt || '',
    characterInfo ? `\n\nCHARACTER INFORMATION:\n${characterInfo}` : ''
  ].filter(Boolean).join('\n');

  // Tạo settings mới với system prompt đã có NSFW
  const enhancedSettings: ApiProxySettings = {
    ...settings,
    systemPrompt: fullSystemInstruction
  };

  // Gọi hàm cũ từ apiProxy
  return sendMessage(enhancedSettings, messages, characterInfo);
};

// ==================== PHIÊN BẢN STREAMING CÓ NSFW ====================
export const sendNSFWMessageStream = async (
  settings: ApiProxySettings,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  characterInfo?: string,
  intensity: 'cao' | 'trung bình' | 'nhẹ' = 'cao'
) => {

  const nsfwPrompt = NSFWCore.getSystemPrompt(intensity);

  const fullSystemInstruction = [
    nsfwPrompt,
    settings.systemPrompt || '',
    characterInfo ? `\n\nCHARACTER INFORMATION:\n${characterInfo}` : ''
  ].filter(Boolean).join('\n');

  const enhancedSettings: ApiProxySettings = {
    ...settings,
    systemPrompt: fullSystemInstruction
  };

  return sendMessageStream(enhancedSettings, messages, characterInfo);
};

// ==================== FORCE NSFW KHI CẦN ====================
export const forceNSFWMessage = async (
  settings: ApiProxySettings,
  userMessage: string,
  intensity: 'cao' | 'trung bình' | 'nhẹ' = 'cao'
) => {
  const forcePrompt = NSFWCore.getForcePrompt(userMessage);

  const messages = [
    { role: 'system' as const, content: NSFWCore.getSystemPrompt(intensity) },
    { role: 'user' as const, content: forcePrompt }
  ];

  return sendNSFWMessage(settings, messages, undefined, intensity);
};