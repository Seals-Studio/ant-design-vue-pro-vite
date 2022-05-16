import Vue from 'vue'

// base library
import Antd from 'ant-design-vue'
// import Viser from 'viser-vue'
import VueCropper from 'vue-cropper'
import 'ant-design-vue/dist/antd.less'

// ext library
import VueClipboard from 'vue-clipboard2'
import MultiTab from '/src/components/MultiTab'
import PageLoading from '/src/components/PageLoading'
import PermissionHelper from '/src/core/permission/permission'
// import '/src/components/use'
import './directives/action'

VueClipboard.config.autoSetContainer = true

Vue.use(Antd)
// Vue.use(Viser)
Vue.use(MultiTab)
Vue.use(PageLoading)
Vue.use(VueClipboard)
Vue.use(PermissionHelper)
Vue.use(VueCropper)

import.meta.env.MODE !== 'production' && console.warn('[antd-pro] WARNING: Antd now use fulled imported.')
