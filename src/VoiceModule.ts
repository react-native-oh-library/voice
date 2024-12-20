/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

type Callback = (error: string) => void;
type RecognizingCallback = (isRecognizing: boolean) => void;
type SpeechAvailableCallback = (isAvailable: boolean, error: string) => void;

export interface Spec extends TurboModule {
  // 开始语音识别
  startSpeech: (locale: string, callback: Callback) => void;
  // 停止语音识别
  stopSpeech: (callback: Callback) => void;
  // 取消语音识别
  cancelSpeech: (callback: Callback) => void;
  // 销毁语音识别
  destroySpeech: (callback: Callback) => void;
  // 语音是否在识别
  isRecognizing: (Callback: RecognizingCallback) => void;
  // 语音服务是否可用
  isSpeechAvailable: (callback: SpeechAvailableCallback) => void;
}

export default TurboModuleRegistry.get<Spec>(
  'VoiceNativeModule',
) as Spec | null;
