/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export class Constants {
  /**
   * 语种 当前仅支持"zh-CN"中文
   */
  public static readonly ENGINE_PARAM_LANGUAGE_ZH_CN: string = 'zh-CN';
  /**
   * 区域信息，不设置时默认为“CN”，当前仅支持“CN”
   */
  public static readonly ENGINE_PARAM_LOCATE_CN: string = 'CN';
  /**
   * 识别器模式
   */
  public static readonly ENGINE_PARAM_RECOGNIZER_Mode: string = 'short';
  /**
   * 模式 1为离线 当前仅支持离线模式
   */
  public static readonly ENGINE_PARAM_ONLINE: number = 1;
  /**
   * 音频类型 当前仅支持“pcm”
   */
  public static readonly AUDIO_TYPE: string = 'pcm';
  /**
   * 音频的采样率 当前仅支持16000采样率
   */
  public static readonly SAMPLE_RATE: number = 16000;
  /**
   * 音频返回的通道数信息 当前仅支持通道1
   */
  public static readonly SOUND_CHANNEL: number = 1;
  /**
   * 音频返回的采样位数 当前仅支持16位
   */
  public static readonly SAMPLE_BIT: number = 16;
  /**
   * 实时语音识别模式:
   * 0：实时录音识别（需应用开启录音权限：ohos.permission.MICROPHONE），若需结束录音，则调用finish方法
   * 1：实时音频转文字识别，开启此模式时需要额外调用writeAudio方法，传入待识别音频流；可选，不传参时默认为1
   */
  public static readonly RECOGNITION_MODE: number = 0;
  /**
   * Voice Activity Detection(VAD)前端点设置 可选，不传参时默认为10000ms
   */
  public static readonly VAD_BEGIN: number = 2000;
  /**
   * Voice Activity Detection(VAD)后端点设置 可选，不传参时默认为800ms
   */
  public static readonly VAD_END: number = 3000;
  /**
   * 最大支持音频时长 支持范围[20000-60000]，单位ms，不传参时默认20000ms
   */
  public static readonly MAX_AUDIO_DURATION: number = 60000;
  /**
   * 每次发送的音频大小
   */
  public static readonly SEND_SIZE: number = 1280;
}