
let Vue = null

class HistoryRoute {
    constructor() {
        this.current = null
    }
}

class VueRouter {
    constructor(options) {
        this.mode = options.mode || 'hash'
        this.routes = options.routes || []
        this.routesMap = this.createMap(this.routes) // 将数组转化为对象
        this.history = new HistoryRoute()
        this.init() // 初始化
    }
    init() {
        if(this.mode === 'hash') {
            // 先判断用户打开时有没有hash值，没有跳转到 #/
            location.hash ? '' : location.hash = '/'

            // 第一次加载不触发hashChange,因此用load来监听
            window.addEventListener('load',() => {
                this.history.current = location.hash.slice(1)
            })
            window.addEventListener('hashchange',() => {
                this.history.current = location.hash.slice(1)
            })
        } else {
            location.pathname ? '' : location.pathname = '/'
            window.addEventListener('load',() => {
                this.history.current = location.pathname
            })
            window.addEventListener('popstate',() => {
                this.history.current = location.pathname
            })
        }

        
    }
    createMap(routes) {
        return routes.reduce((pre, cur) => {
            pre[cur.path] = cur.component
            return pre
        },{})
    }
}

VueRouter.install = function(_vue) {
    Vue = _vue
    console.log('instance',_vue)

    // 为组件增加路由对象
    Vue.mixin({
        beforeCreate() {
            if(this.$options && this.$options.router) {
                this._root = this // 把当前实例挂在到_root 上
                this._router = this.$options.router

                Vue.util.defineReactive(this,"xxx",this._router.history)
            } else {
                // 若是子组件
                this._root = this.$parent && this.$parent._root
            }

            Object.defineProperty(this, "$router", {
                get() {
                    return this._root._router
                }
            })

            Object.defineProperty(this, "$route", {
                get() {
                    return this._root._router.history.current
                }
            })
        },
    })


    // vue-router 的两个核心组件
    Vue.component('router-link',{
        props: {
            to: String
        },
        render(h) {
            let mode = this._self._root._router.mode
            let to = mode === 'hash' ? '#'+this.to : this.to
            return h('a',{ attrs: { href: to }}, this.$slots.default)
        }
    })

    Vue.component('router-view',{
        render(h){
            let current = this._self._root._router.history.current
            let routeMap = this._self._root._router.routesMap;
            return h(routeMap[current])
        }
    })
} 



export default VueRouter