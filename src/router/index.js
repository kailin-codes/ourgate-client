import Vue from 'vue'
import VueRouter from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import StudioNavBar from '@/components/StudioNavBar.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    components: {
      NavBar,
      default: () => import(/* webpackChunkName: "about" */ '../views/Home.vue')
    }
  },
  {
    path: '/subscriptions',
    name: 'Subscription',
    components: {
      NavBar,
      default: () => import(/* webpackChunkName: "about" */ '../views/Subscription.vue')
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/liked-videos',
    name: 'LikedVideos',
    components: {
      NavBar,
      default: () => import(/* webpackChunkName: "about" */ '../views/LikedVideo.vue')
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: () => import(/* webpackChunkName: "signin" */ '../views/Auth/SignIn.vue'),
    meta: { requiresVisitor: true }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import(/* webpackChunkName: "signup" */ '../views/Auth/SignUp.vue'),
    meta: { requiresVisitor: true }
  },
  {
    path: '/trending',
    name: 'Trending',
    components: {
      NavBar,
      default: () => import(/* webpackChunkName: "trending" */ '../views/Trending.vue')
    }
  },
  {
    path: '/studio',
    components: {
      StudioNavBar,
      default: () => import(/* webpackChunkName: "dashboard" */ '../views/Studio/Index.vue')
    },
    children: [
      {
        path: '/',
        name: 'Dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '../views/Studio/Dashboard.vue')
      },
      {
        path: 'videos',
        name: 'Video',
        component: () => import(/* webpackChunkName: "video" */ '../views/Studio/Video.vue')
      },
      {
        path: 'details/:id',
        name: 'Detail',
        component: () => import(/* webpackChunkName: "video" */ '../views/Studio/Details.vue')
      }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/channels/:id',
    components: {
      NavBar,
      default: () => import(/* webpackChunkName: "dashboard" */ '../views/Channel/Index.vue')
    },
    children: [
      {
        path: '/',
        name: 'ChannelHome',
        component: () => import(/* webpackChunkName: "dashboard" */ '../views/Channel/Home.vue')
      }
    ]
  },
  {
    path: '/watch/:id',
    name: 'Watch',
    components: {
      NavBar,
      default: () => import(/* webpackChunkName: "video" */ '../views/Watch.vue')
    }
  },
  {
    path: '/history',
    name: 'History',
    components: {
      NavBar,
      default: () => import(/* webpackChunkName: "video" */ '../views/History.vue')
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    components: {
      NavBar,
      default: () => import(/* webpackChunkName: "video" */ '../views/Search.vue')
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('user')
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresVisitor = to.matched.some((record) => record.meta.requiresVisitor)

  if (requiresAuth && !loggedIn) {
    next('/')
  } else if (requiresVisitor && loggedIn) {
    next('/')
  } else {
    // If the route has a 'search-query' parameter, set it in the query
    if (to.params['search-query']) {
      to.query['search-query'] = to.params['search-query']
    }
    next()
  }
})

export default router
