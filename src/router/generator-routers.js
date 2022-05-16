// eslint-disable-next-line
import * as loginService from '/src/api/login'
// eslint-disable-next-line
import { BasicLayout, BlankLayout, PageView, RouteView } from '/src/layouts'

const modules = import.meta.glob('../views/**/*.vue')

// 前端路由表
const constantRouterComponents = {
  // 基础页面 layout 必须引入
  BasicLayout: BasicLayout,
  BlankLayout: BlankLayout,
  RouteView: RouteView,
  PageView: PageView,
  403: () => import(/* @vite-ignore */ '/src/views/exception/403'),
  404: () => import(/* @vite-ignore */ '/src/views/exception/404'),
  500: () => import(/* @vite-ignore */ '/src/views/exception/500'),

  // 你需要动态引入的页面组件
  Workplace: () => import('/src/views/dashboard/Workplace'),
  Analysis: () => import('/src/views/dashboard/Analysis'),

  // form
  BasicForm: () => import('/src/views/form/basicForm'),
  StepForm: () => import('/src/views/form/stepForm/StepForm'),
  AdvanceForm: () => import('/src/views/form/advancedForm/AdvancedForm'),

  // list
  TableList: () => import('/src/views/list/TableList'),
  StandardList: () => import('/src/views/list/BasicList'),
  CardList: () => import('/src/views/list/CardList'),
  SearchLayout: () => import('/src/views/list/search/SearchLayout'),
  SearchArticles: () => import('/src/views/list/search/Article'),
  SearchProjects: () => import('/src/views/list/search/Projects'),
  SearchApplications: () => import('/src/views/list/search/Applications'),
  ProfileBasic: () => import('/src/views/profile/basic'),
  ProfileAdvanced: () => import('/src/views/profile/advanced/Advanced'),

  // result
  ResultSuccess: () => import(/* @vite-ignore */ '/src/views/result/Success'),
  ResultFail: () => import(/* @vite-ignore */ '/src/views/result/Error'),

  // exception
  Exception403: () => import(/* @vite-ignore */ '/src/views/exception/403'),
  Exception404: () => import(/* @vite-ignore */ '/src/views/exception/404'),
  Exception500: () => import(/* @vite-ignore */ '/src/views/exception/500'),

  // account
  AccountCenter: () => import('/src/views/account/center'),
  AccountSettings: () => import('/src/views/account/settings/Index'),
  BasicSetting: () => import('/src/views/account/settings/BasicSetting'),
  SecuritySettings: () => import('/src/views/account/settings/Security'),
  CustomSettings: () => import('/src/views/account/settings/Custom'),
  BindingSettings: () => import('/src/views/account/settings/Binding'),
  NotificationSettings: () => import('/src/views/account/settings/Notification'),

  // 'TestWork': () => import(/* @vite-ignore */ '/src/views/dashboard/TestWork')
}

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*',
  redirect: '/404',
  hidden: true,
}

// 根级菜单
const rootRouter = {
  key: '',
  name: 'index',
  path: '',
  component: 'BasicLayout',
  redirect: '/dashboard',
  meta: {
    title: '首页',
  },
  children: [],
}

/**
 * 动态生成菜单
 * @param token
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = (token) => {
  return new Promise((resolve, reject) => {
    loginService
      .getCurrentUserNav(token)
      .then((res) => {
        console.log('generatorDynamicRouter response:', res)
        const { result } = res
        const menuNav = []
        const childrenNav = []
        //      后端数据, 根级树数组,  根级 PID
        listToTree(result, childrenNav, 0)
        rootRouter.children = childrenNav
        menuNav.push(rootRouter)
        console.log('menuNav', menuNav)
        const routers = generator(menuNav)
        routers.push(notFoundRouter)
        console.log('routers', routers)
        resolve(routers)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 *
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generator = (routerMap, parent) => {
  return routerMap.map((item) => {
    const { title, show, hideChildren, hiddenHeaderContent, target, icon } = item.meta || {}
    const currentRouter = {
      // 如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/workplace
      path: item.path || `${(parent && parent.path) || ''}/${item.key}`,
      // 路由名称，建议唯一
      name: item.name || item.key || '',
      // 该路由对应页面的 组件 :方案1
      // component: constantRouterComponents[item.component || item.key],
      // 该路由对应页面的 组件 :方案2 (动态加载)
      // component: constantRouterComponents[item.component || item.key] || (() => import(`/src/views/${item.component}`)),
      component: constantRouterComponents[item.component || item.key] || modules[`../views/${item.component}.vue`],

      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title: title,
        icon: icon || undefined,
        hiddenHeaderContent: hiddenHeaderContent,
        target: target,
        permission: item.name,
      },
    }
    // 是否设置了隐藏菜单
    if (show === false) {
      currentRouter.hidden = true
    }
    // 是否设置了隐藏子菜单
    if (hideChildren) {
      currentRouter.hideChildrenInMenu = true
    }
    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/')
    }
    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      // Recursion
      currentRouter.children = generator(item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 数组转树形结构
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
const listToTree = (list, tree, parentId) => {
  list.forEach((item) => {
    // 判断是否为父级菜单
    if (item.parentId === parentId) {
      const child = {
        ...item,
        key: item.key || item.name,
        children: [],
      }
      // 迭代 list， 找到当前菜单相符合的所有子菜单
      listToTree(list, child.children, item.id)
      // 删掉不存在 children 值的属性
      if (child.children.length <= 0) {
        delete child.children
      }
      // 加入到树中
      tree.push(child)
    }
  })
}
