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

import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from '@rnoh/react-native-openharmony/generated/ts';
import { speechRecognizer } from '@kit.CoreSpeechKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { util } from '@kit.ArkTS';
import { Constants } from './Constants';
import { abilityAccessCtrl, Permissions } from '@kit.AbilityKit';
import Logger from './Logger';

const TAG = 'RNVoiceTurboModule';
const permissions: Array<Permissions> = ['ohos.permission.MICROPHONE'];

export class RNVoiceTurboModule extends TurboModule implements TM.VoiceNativeModule.Spec {
  private asrEngine: speechRecognizer.SpeechRecognitionEngine;
  private sessionId: string = util.generateRandomUUID(false);
  private locate: string;
  private language: string;
  private ifRecognizing: boolean = false;

  startSpeech(locale: string, callback: (error: string) => void): void {
    // 初始化地区和语言
    this.initLocalAndLanguage(locale);
    // 申请录音权限  申请成功后开始进行创建引擎进行识别
    let manager = abilityAccessCtrl.createAtManager();
    manager.requestPermissionsFromUser(this.ctx.uiAbilityContext, permissions).then((data) => {
      const authResults = data.authResults;
      // 有录音权限
      if (authResults.includes(0)) {
        // 创建引擎
        this.createEngineAndStartListening(callback);
      } else {
        callback(`data: ${JSON.stringify(data)}, data permissions: ${data.permissions}, data authResults: ${data.authResults}`);
      }
      Logger.info(TAG,
        `data: ${JSON.stringify(data)}, data permissions: ${data.permissions}, data authResults: ${data.authResults}`);
    }).catch((err: BusinessError) => {
      callback(JSON.stringify(err));
      Logger.info(TAG, 'data:' + JSON.stringify(err));
    });
  }

  async stopSpeech(callback: (error: string) => void) {
    try {
      this.asrEngine.finish(this.sessionId);
      this.onSpeechEndEvent({ 'sessionId': this.sessionId });
      this.ifRecognizing = false;
    } catch (err) {
      this.onSpeechEndEvent({ 'error': err });
      callback(JSON.stringify(err));
    }
  }

  cancelSpeech(callback: (error: string) => void): void {
    try {
      this.asrEngine.cancel(this.sessionId);
      this.onSpeechEndEvent({ 'sessionId': this.sessionId });
      this.ifRecognizing = false;
    } catch (err) {
      this.onSpeechEndEvent({ 'error': err });
      callback(JSON.stringify(err));
    }
  }

  destroySpeech(callback: (error: string) => void): void {
    try {
      this.asrEngine.shutdown();
      this.ifRecognizing = false;
    } catch (err) {
      callback(JSON.stringify(err));
    }
  }

  // 语音是否在识别
  isRecognizing(callback: (isRecognizing: boolean) => void): void {
    callback(this.ifRecognizing);
  }

  // 是否有语音识别服务
  isSpeechAvailable(callback: (isAvailable: boolean, error: string) => void): void {
    try {
      const isSpeechAvailable = canIUse('SystemCapability.AI.SpeechRecognizer');
      callback(isSpeechAvailable, null);
    } catch (err) {
      callback(false, JSON.stringify(err));
    }
  }

  // 初始化地区和语言  当前仅支持中文
  initLocalAndLanguage(locale: string) {
    this.locate = Constants.ENGINE_PARAM_LOCATE_CN;
    this.language = Constants.ENGINE_PARAM_LANGUAGE_ZH_CN;
  }

  // 创建引擎实例 设置相关参数 引擎创建完后启动识别
  private createEngineAndStartListening(callback: (error: string) => void) {
    // 设置创建引擎参数
    let extraParam: Record<string, Object> =
      { "locate": this.locate, "recognizerMode": Constants.ENGINE_PARAM_RECOGNIZER_Mode };
    let initParamsInfo: speechRecognizer.CreateEngineParams = {
      language: this.language,
      online: Constants.ENGINE_PARAM_ONLINE,
      extraParams: extraParam
    };
    // 调用createEngine方法
    if (this.asrEngine != null) {
      this.asrEngine.shutdown();
      this.asrEngine = null;
    }
    speechRecognizer.createEngine(initParamsInfo, (err: BusinessError, speechRecognitionEngine:
      speechRecognizer.SpeechRecognitionEngine) => {
      if (!err) {
        Logger.info(TAG, 'Succeeded in creating engine.');
        // 接收创建引擎的实例
        this.asrEngine = speechRecognitionEngine;
        // 启动语音识别
        this.startListening();
      } else {
        // 无法创建引擎时返回错误码1002200001，原因：语种不支持、模式不支持、初始化超时、资源不存在等导致创建引擎失败
        // 无法创建引擎时返回错误码1002200006，原因：引擎正在忙碌中，一般多个应用同时调用语音识别引擎时触发
        // 无法创建引擎时返回错误码1002200008，原因：引擎正在销毁中
        callback(JSON.stringify(err));
        Logger.error(TAG, `Failed to create engine. Code: ${err.code}, message: ${err.message}.`);
      }
    });
  }

  // 设置回调
  private setListener() {
    const voiceTurboModule = this;
    // 创建回调对象
    let setListener: speechRecognizer.RecognitionListener = {
      // 开始识别成功回调
      onStart(sessionId: string, eventMessage: string) {
        voiceTurboModule.ifRecognizing = true;
        voiceTurboModule.onSpeechStartEvent(`sessionId: ${sessionId} eventMessage: ${eventMessage}`);
        Logger.info(TAG, `onStart, sessionId: ${sessionId} eventMessage: ${eventMessage}`);
      },
      // 事件回调
      onEvent(sessionId: string, eventCode: number, eventMessage: string) {
        if (1 == eventCode) {
          voiceTurboModule.onSpeechRecognizedEvent(`onEvent, sessionId: ${sessionId} eventCode: ${eventCode} eventMessage: ${eventMessage}`)
        }
        Logger.info(TAG, `onEvent, sessionId: ${sessionId} eventCode: ${eventCode} eventMessage: ${eventMessage}`);
      },
      // 识别结果回调，包括中间结果和最终结果
      onResult(sessionId: string, result: speechRecognizer.SpeechRecognitionResult) {
        voiceTurboModule.onSpeechPartialResultsEvent({ 'value': [result.result] });
        // 最终识别结果
        if (result.isFinal) {
          voiceTurboModule.onSpeechResultsEvent({ 'value': [result.result] });
        }
        Logger.info(TAG, `onResult, sessionId: ${sessionId} sessionId: ${JSON.stringify(result)}`);
      },
      // 识别完成回调
      onComplete(sessionId: string, eventMessage: string) {
        voiceTurboModule.ifRecognizing = false;
        Logger.info(TAG, `onComplete, sessionId: ${sessionId} eventMessage: ${eventMessage}`);
      },
      // 错误回调，错误码通过本方法返回
      onError(sessionId: string, errorCode: number, errorMessage: string) {
        const error = { 'message': errorMessage, 'code': errorCode };
        voiceTurboModule.onSpeechErrorEvent({ 'message': errorMessage, 'code': errorCode });
        Logger.error(TAG, `onError, sessionId: ${sessionId} errorCode: ${errorCode} errorMessage: ${errorMessage}`);
      },
    }
    // 设置回调
    this.asrEngine.setListener(setListener);
  };

  // 启动语音识别
  private async startListening() {
    this.setListener();
    // 音频配置信息
    let audioInfo: speechRecognizer.AudioInfo = {
      audioType: Constants.AUDIO_TYPE,
      sampleRate: Constants.SAMPLE_RATE,
      soundChannel: Constants.SOUND_CHANNEL,
      sampleBit: Constants.SAMPLE_BIT
    }
    // 音频识别配置
    let extraParams: Record<string, Object> = {
      "recognitionMode": Constants.RECOGNITION_MODE,
      "vadBegin": Constants.VAD_BEGIN,
      "vadEnd": Constants.VAD_END,
      "maxAudioDuration": Constants.MAX_AUDIO_DURATION
    }
    // 启动语音识别的相关参数
    let recognizerParams: speechRecognizer.StartParams = {
      sessionId: this.sessionId,
      audioInfo: audioInfo,
      extraParams: extraParams
    }
    //调用开始识别方法
    this.asrEngine.startListening(recognizerParams);
  };

  private onSpeechStartEvent(event: any) {
    this.sendEvent('onSpeechStart', event);
  }

  private onSpeechRecognizedEvent(event: any) {
    this.sendEvent('onSpeechRecognized', event);
  }

  private onSpeechEndEvent(event: any) {
    this.sendEvent('onSpeechEnd', event);
  }

  private onSpeechErrorEvent(event: any) {
    this.sendEvent('onSpeechError', event);
  }

  private onSpeechResultsEvent(event: any) {
    this.sendEvent('onSpeechResults', event);
  }

  private onSpeechPartialResultsEvent(event: any) {
    this.sendEvent('onSpeechPartialResults', event);
  }

  // 向react native发送事件
  private sendEvent(eventName: string, payload: any) {
    this.ctx.rnInstance.emitDeviceEvent(eventName, payload);
  }
}