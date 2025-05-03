/**
 * Storage Service Interface - ファイル保存操作の基本インターフェース
 */
export default class StorageServiceInterface {
  /**
   * ファイルを保存する
   * @param {Object} file - Multerのファイルオブジェクト
   * @param {string} destination - 保存先ディレクトリ
   * @returns {Promise<string>} 保存されたファイルのパス
   */
  async saveFile(file, destination) {
    throw new Error("Method 'saveFile' must be implemented");
  }

  /**
   * ファイルを削除する
   * @param {string} filePath - 削除するファイルのパス
   * @returns {Promise<boolean>} 削除成功したかどうか
   */
  async deleteFile(filePath) {
    throw new Error("Method 'deleteFile' must be implemented");
  }

  /**
   * ファイルのURLを取得する
   * @param {string} filePath - ファイルのパス
   * @returns {string} ファイルのURL
   */
  getFileUrl(filePath) {
    throw new Error("Method 'getFileUrl' must be implemented");
  }
}
