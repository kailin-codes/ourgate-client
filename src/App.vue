<template>
      <v-app>
        <div v-if="debugInfo">
          <p>Current route: {{ $route.name }}</p>
          <p>isAuthenticated: {{ isAuthenticated }}</p>
        </div>
        <router-view name="NavBar"></router-view>
        <router-view name="StudioNavBar"></router-view>
        <v-content
          :class="{
            'content-bg': ![
              'SignIn',
              'SignUp',
              'Dashboard',
              'Video',
              'Detail'
            ].includes($route.name)
          }"
        >
          <router-view></router-view>
        </v-content>
      </v-app>
    </template>

    <script>
    import { mapGetters } from 'vuex'

    export default {
      name: 'App',
      data: () => ({
        debugInfo: true
      }),
      computed: {
        ...mapGetters('auth', ['isAuthenticated'])
      },
      watch: {
        $route(to, from) {
          console.log('Route changed:', from.name, '->', to.name);
        }
      },
      mounted() {
        console.log('App component mounted');
        console.log('Current route:', this.$route.name);
        console.log('isAuthenticated:', this.isAuthenticated);
      }
    }
    </script>

    <style lang="scss">
    .content-bg {
      background-color: #ffffff;
    }
    .card {
      background: #ffffff !important;
    }
    </style>
// Final changes
<!-- Final tweaks before deployment -->
