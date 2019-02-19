/**
 * @author XiaChengxing
 * @date 19/2/13 下午3:32
 */
import upload from './y-upload.vue'

const comment = {
  install: function (Vue) {
    Vue.component(upload.name, upload)
  }
}
// global 情况下 自动安装
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(comment)
}

export default comment
