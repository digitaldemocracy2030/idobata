import LocalStorageService from "./localStorageService.js";

/**
 * 設定に基づいて適切なストレージサービスを作成する
 * @param {string} type - ストレージのタイプ（'local', 's3'など）
 * @param {Object} config - 設定オブジェクト
 * @returns {StorageServiceInterface} ストレージサービスのインスタンス
 */
export function createStorageService(type = 'local', config = {}) {
  switch (type) {
    case 'local':
      return new LocalStorageService(config.baseUrl || '');
    default:
      throw new Error(`Unsupported storage type: ${type}`);
  }
}
