<template>
      <nav id="navbar">
        <div v-if="debugInfo">
          <p>isAuthenticated: {{ isAuthenticated }}</p>
          <p>currentUser: {{ JSON.stringify(currentUser) }}</p>
        </div>
        <v-navigation-drawer v-model="drawer" app :clipped="$route.name !== 'Watch'"
          :temporary="$route.name === 'Watch'" id="nav">
          <div tag="div" class="v-navigation-drawer__content" v-bar>
            <v-list dense nav class="py-0" tag="div">
              <v-list-item :class="{
                'hidden-lg-and-up': $route.name === 'Watch' ? false : true
              }">
                <v-app-bar-nav-icon @click="drawer = !drawer" class="mr-5"></v-app-bar-nav-icon>
                <v-toolbar-title class="font-weight-bold">
                  <img src="@/assets/ourgate-logo.png" alt="OurGate Logo" height="40">
                </v-toolbar-title>
              </v-list-item>
              <v-divider class="hidden-lg-and-up"></v-divider>
              <div v-for="parentItem in items" :key="parentItem.header">
                <v-subheader v-if="parentItem.header"
                  class="pl-3 py-4 subtitle-1 font-weight-bold text-uppercase">
                  {{ parentItem.header }}
                </v-subheader>
                <v-list-item v-for="(item, i) in parentItem.header === 'Subscriptions'
                  ? items[2].pages.slice(0, channelLength)
                  : parentItem.pages" :key="item.title" class="mb-0" :to="parentItem.header === 'Subscriptions'
                    ? '/channels/' + item.channelId._id
                    : item.link
                    " exact active-class="active-item">
                  <v-list-item-icon v-if="parentItem.header !== 'Subscriptions'">
                    <v-icon>{{ item.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-avatar v-else class="mr-5">
                    {{ i }}
                    <v-avatar v-if="
                      item.channelId.photoUrl !== 'no-photo.jpg' && item.channelId
                    ">
                      <img :src="`${getUrl}/uploads/avatars/${item.channelId.photoUrl}`
                        " :alt="`${item.channelId.channelName} avatar`" />
                    </v-avatar>
                    <template v-else>
                      <v-avatar color="red">
                        <span class="white--text headline ">
                          {{
                            item.channelId.channelName.split('')[0].toUpperCase()
                          }}
                        </span>
                      </v-avatar>
                    </template>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class=" font-weight-medium subtitle-2">
                      {{
                        parentItem.header === 'Subscriptions'
                          ? item.channelId.channelName
                          : item.title
                      }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-btn id="showBtn" @click="moreChannels" v-if="
                  parentItem.header === 'Subscriptions' &&
                  isAuthenticated &&
                  items[2].length > 0
                " block text class="text-none">
                  <v-icon>
                    {{ channelLength === 3 ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
                  </v-icon>
                  {{
                    channelLength === 3
                      ? `Show ${items[2].pages.length - 3} more `
                      : 'Show less'
                  }}
                </v-btn>

                <v-divider v-if="parentItem.header !== false" class="mt-2 mb-2"></v-divider>
              </div>

              <span v-for="link in links" :key="link.text">
                <span v-if="link.text === 'Terms'" class="mb-2 d-block"> </span>
                <v-btn href router :to="link.link" text class="text-capitalize px-1" small>
                  {{ link.text }}
                </v-btn>
              </span>
            </v-list>
          </div>
        </v-navigation-drawer>

        <v-app-bar class="white" flat app clipped-left>
          <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
          <v-toolbar-title class="font-weight-bold">
            <router-link to="/" class="black--text" style="text-decoration: none">
              <img src="@/assets/ourgate-logo.png" alt="OurGate Logo" height="40">
            </router-link>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            flat
            hide-details
            append-icon="mdi-magnify"
            placeholder="Search"
            outlined
            dense
            v-model="searchText"
            @click:append="search"
            @keyup.enter="search"
          ></v-text-field>

          <v-spacer></v-spacer>

          <v-menu offsetY>
            <template v-slot:activator="{ on: menu }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn icon class="mr-7" v-on="{ ...tooltip, ...menu }">
                    <v-icon size="25">mdi-video-plus</v-icon>
                  </v-btn>
                </template>
                <span>Create a video and more</span>
              </v-tooltip>
            </template>
            <v-list>
              <v-list-item router to="/studio">
                <v-list-item-icon class="mr-3">
                  <v-icon>mdi-play-box-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Upload video</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn tile outlined color="blue" class="font-weight-bold" v-if="!isAuthenticated"
            router to="/signin">
            <v-icon left size="26">mdi-account-circle</v-icon> Sign in
          </v-btn>

          <v-menu offset-y left v-else>
            <template v-slot:activator="{ on }">
              <v-btn small color="red" depressed fab v-on="on" class="white--text">
                <v-avatar v-if="currentUser.photoUrl !== 'no-photo.jpg'">
                  <img :src="`${getUrl}/uploads/avatars/${currentUser.photoUrl}`"
                    :alt="`${currentUser.channelName} avatar`" />
                </v-avatar>
                <template v-else>
                  <span class="headline">
                    {{ currentUser.channelName.split('')[0].toUpperCase() }}
                  </span>
                </template>
              </v-btn>
            </template>

            <v-card>
              <v-list>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-avatar v-if="currentUser.photoUrl !== 'no-photo.jpg'">
                      <img :src="`${getUrl}/uploads/avatars/${currentUser.photoUrl}`"
                        :alt="`${currentUser.channelName} avatar`" />
                    </v-avatar>
                    <template v-else>
                      <v-avatar color="red">
                        <span class="white--text headline ">
                          {{
                            currentUser.channelName.split('')[0].toUpperCase()
                          }}
                        </span>
                      </v-avatar>
                    </template>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title class="text-capitalize">
                      {{ currentUser.channelName }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ currentUser.email }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list>
                <v-list-item router :to="`/channels/${currentUser._id}`">
                  <v-list-item-icon>
                    <v-icon>mdi-account-box</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Your channel</v-list-item-title>
                </v-list-item>
                <v-list-item router to="/studio">
                  <v-list-item-icon>
                    <v-icon>mdi-youtube-studio</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>OurGate Studio</v-list-item-title>
                </v-list-item>
                <v-list-item @click="signOut">
                  <v-list-item-icon>
                    <v-icon>mdi-login-variant</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Sign out</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-app-bar>
      </nav>
    </template>

    <script>
    import { mapGetters, mapActions } from 'vuex'
    import SubscriptionService from '@/services/SubscriptionService'
    import HistoryService from '@/services/HistoryService'

    export default {
      data: () => ({
        drawer: true,
        items: [
          {
            header: null,
            pages: [
              { title: 'Home', link: '/', icon: 'mdi-home' },
              { title: 'Trending', link: '/trending', icon: 'mdi-fire' },
              {
                title: 'Subscriptions',
                link: '/subscriptions',
                icon: 'mdi-youtube-subscription'
              }
            ]
          },
          {
            header: null,
            pages: [
              {
                title: 'History',
                link: '/history',
                icon: 'mdi-history'
              },
              {
                title: 'Liked videos',
                link: '/liked-videos',
                icon: 'mdi-thumb-up'
              }
            ]
          },
          {
            header: 'Subscriptions',
            pages: []
          },
          {
            header: 'MORE FROM OURGATE',
            pages: [
              {
                title: 'OurGate Premium',
                link: '#vp',
                icon: 'mdi-youtube'
              },
              {
                title: 'Gaming',
                link: '#g',
                icon: 'mdi-youtube-gaming'
              },
              {
                title: 'Live',
                link: '#li',
                icon: 'mdi-access-point'
              }
            ]
          },
          {
            header: null,
            pages: [
              {
                title: 'Setting',
                link: '#sg',
                icon: 'mdi-cog'
              },
              {
                title: 'Report history',
                link: '#rh',
                icon: 'mdi-flag'
              },
              {
                title: 'Help',
                link: '#hp',
                icon: 'mdi-help-circle'
              },
              {
                title: 'Send feedback',
                link: '#f',
                icon: 'mdi-message-alert'
              }
            ]
          }
        ],
        links: [
          { text: 'About', link: '#' },
          { text: 'Press', link: '#' },
          { text: 'Copyright', link: '#' },
          { text: 'Contact us', link: '#' },
          { text: 'Creators', link: '#' },
          { text: 'Advertise', link: '#' },
          { text: 'Developers', link: '#' },
          { text: 'Terms', link: '#' },
          { text: 'Privacy', link: '#' },
          { text: 'Policy & Safety', link: '#' },
          { text: 'Test new features', link: '#' }
        ],
        channelLength: 0,
        searchText: '',
        debugInfo: true  // Add this line for debugging
      }),
      computed: {
        ...mapGetters('auth', {
          isAuthenticatedFromGetter: 'isAuthenticated',
          currentUserFromGetter: 'currentUser'
        }),
        ...mapGetters(['getUrl']),
        isAuthenticated() {
          console.log('isAuthenticated computed property called');
          return this.$store.state.auth.isUserLoggedIn;
        },
        currentUser() {
          console.log('currentUser computed property called');
          return this.$store.state.auth.user;
        }
      },
      methods: {
        ...mapActions('auth', ['signOut']),
        async search() {
          if (!this.searchText.trim()) return;
          if (this.searchText.trim() === this.$route.query['search-query']) return;

          const data = {
            type: 'search',
            searchText: this.searchText.trim()
          };

          if (this.isAuthenticated) {
            await HistoryService.createHistory(data).catch((err) =>
              console.log(err)
            );
          }

          this.$router.push({
            name: 'Search',
            query: { 'search-query': this.searchText.trim() }
          });
        },
        async getSubscribedChannels() {
          const channels = await SubscriptionService.getSubscribedChannels(
            this.currentUser._id
          ).catch((err) => console.log(err));
          this.items[2].pages = channels.data.data;
          this.channelLength = 3;
        },
        moreChannels() {
          if (this.channelLength === 3)
            this.channelLength = this.items[2].pages.length;
          else this.channelLength = 3;
        },
        updateSearchText() {
          this.searchText = this.$route.query['search-query'] || '';
        }
      },
      watch: {
        $route: {
          immediate: true,
          handler() {
            this.updateSearchText();
          }
        }
      },
      mounted() {
        console.log('NavBar component mounted');
        console.log('isAuthenticatedFromGetter:', this.isAuthenticatedFromGetter);
        console.log('isAuthenticated:', this.isAuthenticated);
        console.log('currentUserFromGetter:', this.currentUserFromGetter);
        console.log('currentUser:', this.currentUser);
        console.log('getUrl:', this.getUrl);
        this.updateSearchText();
        if (this.currentUser) this.getSubscribedChannels();
        this.drawer = this.$vuetify.breakpoint.mdAndDown ? false : true;
        this.drawer = this.$route.name === 'Watch' ? false : this.drawer;
  },
  created() {
    console.log('NavBar component created');
    this.drawer = this.$route.name === 'Watch' ? false : this.drawer;

    if (!this.isAuthenticated) {
      this.items[2].header = false;
      this.items[0].pages.pop();
    }
  }
};
</script>

<style lang="scss">
.v-list-item__avatar {
  justify-content: center !important;
}

#showBtn {
  .v-btn__content {
    justify-content: flex-start;

    i {
      margin-right: 30px;
    }
  }
}

#navbar {
  .active-item {
    .v-list-item__icon {
      color: red !important;
    }
  }

  .v-navigation-drawer__border {
    width: 0 !important;
  }

  .vuebar-element {
    height: 250px;
    width: 100%;
    max-width: 500px;
    background: #dfe9fe;
  }

  .vb > .vb-dragger {
    z-index: 5;
    width: 10px;
    right: 0;
  }

  .vb > .vb-dragger > .vb-dragger-styler {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: rotate3d(0, 0, 0, 0);
    transform: rotate3d(0, 0, 0, 0);
    -webkit-transition: background-color 100ms ease-out, margin 100ms ease-out,
      height 100ms ease-out;
    transition: background-color 100ms ease-out, margin 100ms ease-out,
      height 100ms ease-out;

    margin: 5px 5px 5px 0;
    border-radius: 20px;
    height: calc(100% - 10px);
    display: block;
  }

  .v-navigation-drawer__content:hover .vb > .vb-dragger > .vb-dragger-styler {
    width: 10px;
    background-color: #e0e0e0;
  }

  .vb.vb-scrolling-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244, 0.3);
    background-color: rgba(255, 255, 255, 0.3);
  }

  .vb > .vb-dragger:hover > .vb-dragger-styler {
    margin: 0px;
    width: 10px;
  }

  .vb.vb-dragging > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244, 0.5);
    margin: 0px;
    height: 100%;
  }

  .vb.vb-dragging-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244, 0.5);
  }
}
</style>
