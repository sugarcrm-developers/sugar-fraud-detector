const debug = require('debug')('sugar:frauddetector:api')
const { S3 } = require("@aws-sdk/client-s3");
const path = require('path');
const fs = require('fs');

/** Wrapper class for S3 API integration */
module.exports = class SugarS3 {
  constructor(config) {
    this.config = config;
    this.s3Client = new S3({ region: this.config.region });
    this.bucket = config.s3.training.bucketName;
  }

  /**
   * Upload an entire folder content to an S3 bucket
   * 
   * @param {folder} full path to upload
   * @returns 
   */
  async uploadFolder(folder) {
    const uploads = fs.readdirSync(folder).map((name) => {
      if (name.endsWith('csv')) {
        return this.uploadFile(`${folder}/${name}`);
      }
    })
    return Promise.all(uploads)
  }

  /**
   * Upload a file to an S3 bucket
   * 
   * @param {file} file name to be uploaded
   * @returns 
   */
  async uploadFile(file) {
    debug(`Uploading file [${this.config.s3.training.datasetFolder}/${file}]`)
    const fullpath = `${this.config.s3.training.datasetFolder}/${file}`;
    const fileName = path.basename(fullpath);
    const fileStream = fs.createReadStream(fullpath);
    const uploadParams = {
      //get from config which bucket to send this to
      Bucket:this.bucket,
      //add the filename as key
      Key: fileName,
      Body: fileStream,
    };

    return this.s3Client.putObject(uploadParams);
  }

  /**
   * Tries to create a bucket in S3. 
   * If fails, we assume the folder already exists
   * @returns 
   */
  async createBucketIfNotExists() {
    try {
      const Bucket = this.bucket;
      const bucketParams = { Bucket, ACL: "private" };
      const data = await this.s3Client.createBucket(bucketParams);

      const tagging = {
        Bucket,
        Tagging: {
          TagSet: this.config.s3.tags
        }
      }

      await this.s3Client.putBucketTagging(tagging);

      debug("Success", data);
      return data; // For unit tests.
    } catch (err) {
      debug("Error", err);
    }
  }

  /**
   * Deletes an object from an S3 bucket
   * 
   * @param {key} Key object name to be deleted
   * @returns 
   */
  async deleteObject(Key) {
    const bucketParams = { Bucket:this.bucket, Key };
    return this.s3Client.deleteObject(bucketParams);
  }

  /**
   * Tears down a bucket (delete bucket and objects within)
   * @returns 
   */
  async teardownBucket() {
    const bucketParams = { Bucket:this.bucket };
    return this.s3Client.deleteBucket(bucketParams);
  }
}
