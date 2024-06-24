<template>
      <div id="channel-home">
        <v-parallax
          height="230"
          src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
        ></v-parallax>
        <div class="nav-bgcolor">
          <div id="channel-header">
            <v-container class="py-0">
              <v-row class="justify-space-between">
                <v-col cols="12" sm="5" md="5" lg="5" offset-md="1">
                  <v-skeleton-loader
                    type="list-item-avatar-two-line"
                    :loading="loading"
                    class="mr-1"
                  >
                    <v-card class="transparent" flat>
                      <v-list-item three-line>
                        <v-list-item-avatar size="80">
                          <v-img
                            v-if="channel.photoUrl !== 'no-photo.jpg'"
                            :src="channel.photoUrl"
                          ></v-img>
                          <v-avatar v-else color="red" size="60">
                            <span class="white--text headline">
                              {{ channel.channelName.split('')[0].toUpperCase() }}
                            </span>
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-content class="align-self-auto">
                          <v-list-item-title class="headline mb-1">
                            {{ channel.channelName }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ channel.subscribers }} subscribers
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-card>
                  </v-skeleton-loader>
                </v-col>
                <v-col cols="12" sm="5" md="3" lg="3" v-if="!loading">
                  <v-btn
                    v-if="currentUser && channel._id !== currentUser._id"
                    :class="[
                      { 'red white--text': !subscribed },
                      { 'grey grey--text lighten-3 text--darken-3': subscribed },
                      'mt-6'
                    ]"
                    tile
                    large
                    depressed
                    :loading="subscribeLoading"
                    @click="subscribe"
                  >
                    {{ !subscribed ? 'subscribe' : 'subscribed' }}
                  </v-btn>
                  <v-btn
                    v-else-if="showSubBtn"
                    :class="[
                      { 'red white--text': !subscribed },
                      { 'grey grey--text lighten-3 text--darken-3': subscribed },
                      'mt-6'
                    ]"
                    tile
                    large
                    depressed
                    :loading="subscribeLoading"
                    @click="subscribe"
                  >
                    {{ !subscribed ? 'subscribe' : 'subscribed' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </div>
          <v-card flat class="transparent">
            <v-tabs
              v-model="tab"
              background-color="transparent"
              show-arrows
              centered
              center-active
            >
              <v-tab v-for="(item, i) in items" :key="i">
                {{ item }}
              </v-tab>
            </v-tabs>
            <v-container fluid @scroll="handleScroll">
              <v-tabs-items v-model="tab" class="transparent">
                <v-tab-item>
                  <v-card class="transparent" flat>
                    <v-card-title>Uploads</v-card-title>
                    <v-slide-group class="pa-4" multiple show-arrows>
                      <v-slide-item
                        v-for="(video, i) in loading ? 5 : videos"
                        :key="i"
                      >
                        <v-skeleton-loader
                          type="card-avatar"
                          :loading="loading"
                          width="250px"
                          class="mr-1"
                        >
                          <video-card
                            :card="{ maxWidth: 250, type: 'noAvatar' }"
                            :video="video"
                            :channel="video.userId"
                          ></video-card>
                        </v-skeleton-loader>
                      </v-slide-item>
                    </v-slide-group>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card class="transparent" flat>
                    <v-card-title>Uploads</v-card-title>
                    <v-row>
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="3"
                        v-for="(video, i) in loading ? 10 : videos"
                        :key="i"
                        class="mx-xs-auto"
                      >
                        <v-skeleton-loader type="card-avatar" :loading="loading">
                          <video-card
                            :card="{ maxWidth: 350 }"
                            :video="video"
                            :channel="video.userId"
                          ></video-card>
                        </v-skeleton-loader>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-container>
          </v-card>
        </div>
        <signin-modal
          :openModal="signinDialog"
          :details="details"
          @closeModal="signinDialog = false"
        />
      </div>
    </template>

    <script>
    import { mapGetters } from 'vuex'
    import debounce from 'lodash/debounce'
    import UserService from '@/services/UserService'
    import VideoService from '@/services/VideoService'
    import SubscriptionService from '@/services/SubscriptionService'
    import VideoCard from '@/components/VideoCard'
    import SigninModal from '@/components/SigninModal'

    export default {
      data: () => ({
        tab: null,
        loading: false,
        errored: false,
        subscribed: false,
        subscribeLoading: false,
        showSubBtn: true,
        url: process.env.VUE_APP_URL,
        items: ['Home', 'Videos', 'Playlists', 'Community', 'Channels', 'about'],
        videos: [],
        channel: {},
        signinDialog: false,
        details: {},
        allVideosLoaded: false,
        page: 1,
      }),
      computed: {
        ...mapGetters(['isAuthenticated', 'currentUser'])
      },
      components: {
        VideoCard,
        SigninModal
      },
      methods: {
        async getChannel(id) {
          this.loading = true;
          this.errored = false;
          this.videos = []; // Reset videos array
          this.page = 1; // Reset page number
          this.allVideosLoaded = false; // Reset allVideosLoaded flag
          console.log("Getting channel:", id);
          const channel = await UserService.getById(id)
            .catch((err) => {
              this.errored = true;
              console.error("Error fetching channel:", err);
              this.$router.push('/');
            })
            .finally(() => (this.loading = false));
          if (!channel) return;
          this.channel = channel.data.data;
          console.log("Channel data:", this.channel);
          if (this.currentUser && this.currentUser._id === this.channel._id) {
            this.showSubBtn = false;
          } else {
            this.showSubBtn = true;
          }
          this.getVideos();
          this.checkSubscription(this.channel._id);
        },
        async getVideos() {
          if (this.allVideosLoaded || this.loading) return;
          this.loading = true;
          console.log("Fetching videos for channel:", this.channel._id);
          const videos = await VideoService.getAll('public', {
            userId: this.channel._id,
            page: this.page
          })
            .catch((err) => {
              console.error("Error fetching videos:", err);
              this.errored = true;
            })
            .finally(() => (this.loading = false));

          console.log("Received videos:", videos?.data?.data);

          if (!videos || !videos.data || !videos.data.data) return;
          if (videos.data.data.length) {
            this.page += 1;
            const newVideos = videos.data.data.filter(video =>
              !this.videos.some(existingVideo => existingVideo._id === video._id)
            );
            console.log("New videos to add:", newVideos.length);
            this.videos.push(...newVideos);
          }
          if (videos.data.data.length < 12) {
            this.allVideosLoaded = true;
          }
          console.log("Current videos array:", this.videos);
        },
        debouncedGetVideos: debounce(function() {
          this.getVideos();
        }, 300),
        handleScroll(e) {
          const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
          if (bottom) {
            this.debouncedGetVideos();
          }
        },
        async checkSubscription(id) {
          if (!this.currentUser) return;
          this.loading = true;
          const sub = await SubscriptionService.checkSubscription({ channelId: id })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              this.loading = false;
            });
          if (!sub) return;
          if (!sub.data.data._id) this.subscribed = false;
          else this.subscribed = true;
        },
        async subscribe() {
          if (!this.isAuthenticated) {
            this.signinDialog = true;
            this.details = {
              title: 'Want to subscribe to this channel?',
              text: 'Sign in to subscribe to this channel.'
            };
            return;
          }
          this.subscribeLoading = true;
          const sub = await SubscriptionService.createSubscription({
            channelId: this.channel._id
          })
            .catch((err) => console.log(err))
            .finally(() => {
              this.subscribeLoading = false;
            });
          if (!sub) return;
          if (!sub.data.data._id) {
            this.subscribed = false;
            this.channel.subscribers--;
          } else {
            this.subscribed = true;
            this.channel.subscribers++;
          }
        }
      },
      mounted() {
        this.getChannel(this.$route.params.id);
      },
      beforeRouteUpdate(to, from, next) {
        this.getChannel(to.params.id);
        next();
      }
    }
    </script>

    <style>
    .nav-bgcolor {
      background: #f9f9f9;
    }
    .card {
      background: #f9f9f9 !important;
    }
    .v-tab {
      margin-right: 4em;
    }
    #channel-home .v-list-item--link:before {
      background-color: transparent;
    }
    </style>
