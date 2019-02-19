<template>
  <div id="app">
    <upload
      style="margin-right: 10px; float: left"
      :ossRegion="ossRegion"
      :ossBucketName="ossBucketName"
      :ossPath="ossPath"
      :before-upload="beforeUpload"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :url="url"
      tips="something"
      :accept="limit.toString()"
    >
    </upload>
  </div>
</template>

<script>
import upload from './lib/y-upload'
export default {
  name: 'app',
  components: {
    upload
  },
  data () {
    return {
      ossRegion: 'oss-cn-beijing',
      ossBucketName: 'bj-ali-opp-portal-common-test',
      ossPath: 'pluginTest/',
      url: '',
      limit: ['image/png','image/jpeg'],
      size: 3145728 // 3m
    }
  },
  methods: {
    uploadSuccess (response, file, upload) {
      if (response.res.status === 200) {
        this.url = 'https://' + response.bucket + '.oss-cn-beijing.aliyuncs.com/' + response.name + '?x-oss-process=image/resize,h_300';
        this.$message.success('上传成功');
      }
    },
    uploadError (err) {
      if (err) {
        this.$message.error(err)
      }
    },
    beforeUpload (file, data) {
      // 检测类型
      if (this.limit.indexOf(file.type) < 0) {
        this.$message.error('类型错误');
        return false;
      }
      // 检测大小
      if (file.size > this.size) {
        this.$message.error('大小错误');
        return false;
      }
    }
  }
}
</script>
