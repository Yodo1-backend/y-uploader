<template>
  <el-upload
    class="avatar-uploader"
    :show-file-list="false"
    :accept="accept"
    :action="uploadUrl"
    :headers="uploadHeaders"
    :http-request="innerUpload"
    :auto-upload="true"
    :before-upload="innerBeforeUpload"
    :before-remove="innerAbort"
    :on-error="innerOnError"
    :on-remove="innerRemove"
    :name="name"
    :data="data"
  >
    <img v-if="url" :src.sync="url" class="avatar">
    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    <div slot="tip" class="tips">{{tips}}</div>
  </el-upload>
</template>
<script>
  import OSS from 'ali-oss';
  function noop () {}

  export default {
    name: 'y-upload',
    props: {
      beforeUpload: {
        type: Function,
        default: noop
      },
      onSuccess: {
        type: Function,
        default: noop
      },
      onError: {
        type: Function,
        default: noop
      },
      ossBucketName: {
        type: String,
        default: ''
      },
      ossRegion: {
        type: String,
        default: ''
      },
      ossPath: {
        type: String,
        default: ''
      },
      accept: {
        type: String,
        default: ''
      },
      tips: {
        type: String,
        default: ''
      },
      url: {
        type: String,
        default: ''
      },
      name: {
        type: String,
        default: ''
      },
      data: {
        type: Object
      },
      la: {
        type: String,
        default: 'zh'
      }
    },
    data () {
      return {
        currentClient: null,
        uploadUrl: '',
        uploadHeaders: {
          authorization: ''
        },
        message: {
          en: {
            oss_auth_timeout: 'Oss Auth Timeout',
            oss_auth_error: 'Oss Auth Error',
            upload_success: 'Upload Success',
            upload_failed: 'Upload Failed',
            upload_cancel: 'Upload Cancel'
          },
          zh: {
            oss_auth_timeout: 'OSS授权超时',
            oss_auth_error: 'OSS授权错误',
            upload_success: '上传成功',
            upload_failed: '上传失败',
            upload_cancel: '取消上传'
          }
        }
      }
    },
    methods: {
      setUploadPath (path) {
        this.ossPath = path;
      },
      innerBeforeUpload (file) {
        return this.beforeUpload(file, this.data);
      },
      innerOnSuccess (response, file) {
        return this.onSuccess(response, file, this.data);
      },
      innerOnError (err, file, fileList) {
        this.onError(err, file, fileList);
      },
      innerAbort (file, filelist) {
        console.log('file ', file);
        if (file.status !== 'success') {
          if (this.currentClient) {
            this.currentClient.cancel();
          }
          return false;
        }
      },
      innerRemove (file, fileList) {
        if (this.currentClient) {
          this.currentClient.delete(this.ossPath + file.name);
        }
      },
      async innerUpload (option) {
        let vm = this;
        vm.disabled = true;
        // 获取OSS配置信息
        let ret = await this.$jsonp('https://support.yodo1api.com/oss/getToken').then(json => {
          // Success.
          return json;
        }).catch(err => {
          // Failed.
          option.onError(this.message[this.la].oss_auth_timeout, option.file);
        });
        if (!(ret.AccessKeyId && ret.AccessKeySecret && ret.SecurityToken)) {
          option.onError(this.message[this.la].oss_auth_error, option.file);
          return;
        }
        let client = new OSS({
          region: this.ossRegion,
          accessKeyId: ret.AccessKeyId,
          accessKeySecret: ret.AccessKeySecret,
          stsToken: ret.SecurityToken,
          bucket: this.ossBucketName
        });
        this.currentClient = client;
        let file = option.file;
        let fileNames = this.ossPath + file.name;
        if (this.name) {
          fileNames = this.ossPath + this.name;
        }
        const progress = async function progress (p, checkpoint) {
          let e = {};
          e.percent = p * 100;
          option.onProgress(e)
        };
        const ossOptions = {
          progress,
          partSize: 200 * 1024
        };
        // 分片上传文件
        var _this = this;
        await client.multipartUpload(fileNames, file, ossOptions).then(function (result) {
          vm.disabled = false;
          if (result.res.statusCode === 200) {
            option.onSuccess(_this.message[_this.la].upload_success);
            _this.innerOnSuccess(result, file);
          } else {
            _this.innerOnError(result, file);
            option.onError(_this.message[_this.la].upload_failed)
          }
        }).catch(async function (err) {
          vm.disabled = false;
          if (err.name === 'cancel') {
            option.onError(_this.message[_this.la].upload_cancel)
          } else {
            option.onError(_this.message[_this.la].upload_failed)
          }
        });
      }
    },
    updated () {
    }
  }
</script>

<style>
  .avatar-uploader .el-upload {
    display: block;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 148px;
    height: 148px;
    line-height: 146px !important;
    text-align: center;
  }
  .avatar {
    width: 148px;
    height: 148px;
    display: block;
  }
  .tips {
    font-size: 12px;
    color: #606266;
    margin-top: 7px;
  }
</style>
