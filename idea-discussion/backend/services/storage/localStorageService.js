import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import StorageServiceInterface from "./storageServiceInterface.js";

/**
 * ローカルファイルシステムでのストレージサービス実装
 */
export default class LocalStorageService extends StorageServiceInterface {
  constructor(baseUrl = "") {
    super();
    this.baseUrl = baseUrl;
  }

  /**
   * ファイルを保存する
   * @param {Object} file - Multerのファイルオブジェクト
   * @param {string} destination - 保存先ディレクトリ
   * @returns {Promise<string>} 保存されたファイルのパス
   */
  async saveFile(file, destination) {
    await fs.mkdir(destination, { recursive: true });

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(destination, fileName);

    await fs.copyFile(file.path, filePath);

    await fs.unlink(file.path);

    return filePath;
  }

  /**
   * ファイルを削除する
   * @param {string} filePath - 削除するファイルのパス
   * @returns {Promise<boolean>} 削除成功したかどうか
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * ファイルのURLを取得する
   * @param {string} filePath - ファイルのパス
   * @returns {string} ファイルのURL
   */
  getFileUrl(filePath) {
    if (!filePath) return null;

    const relativePath = path.relative(process.cwd(), filePath);

    const urlPath = relativePath.split(path.sep).join("/");

    return `${this.baseUrl}/${urlPath}`;
  }
}
