<template>
      <div id="watch" ref="watch">
        <v-container fluid>
          <v-row>
            <v-alert prominent class="mx-auto" type="error" v-if="errored">
              <v-row align="center">
                <v-col class="grow">
                  <div class="title">Error!</div>
                  <div>
                    Something went wrong, but don't fret — let's give it another shot.
                  </div>
                </v-col>
                <v-col class="shrink">
                  <v-btn @click="actions">Take action</v-btn>
                </v-col>
              </v-row>
            </v-alert>
            <v-col v-else cols="11" class="mx-auto">
              <v-row>
                <v-col cols="12" sm="12" md="8" lg="8">
                  <v-skeleton-loader type="card-avatar, article, actions"
                    :loading="videoLoading" tile large>
                    <div ref="hello">
                      <v-responsive aspect-ratio="16/9">
                        <video ref="videoPlayer" :src="getVideoUrl(video.url)" class="video-js"
                          controls preload="auto" width="100%" height="100%"
                          @loadedmetadata="onVideoLoad"></video>
                      </v-responsive>

                      <v-card flat tile class="card">
                        <v-card-title class="pl-0 pb-0">{{ video.title }}</v-card-title>
                        <div class="d-flex flex-wrap justify-space-between" id="btns">
                          <v-card-subtitle class="pl-0 pt-0 pb-0 subtitle-1"
                            style="line-height: 2.4em;">
                            {{ video.views }}
                            views<v-icon>mdi-circle-small</v-icon>{{ dateFormatter(video.createdAt) }}
                          </v-card-subtitle>
                          <v-card-actions class="pt-0 pl-0">
                            <v-btn text @click="createFeeling('like')">
                              <v-icon
                                :class="`pr-2${feeling !== 'like' ? ' grey--text text--darken-1' : ''}`">
                                mdi-thumb-up
                              </v-icon>
                              {{ video.likes }}
                            </v-btn>
                            <v-btn text @click="createFeeling('dislike')">
                              <v-icon
                                :class="`pr-2${feeling !== 'dislike' ? ' grey--text text--darken-1' : ''}`">
                                mdi-thumb-down
                              </v-icon>
                              {{ video.dislikes }}
                            </v-btn>
                            <v-btn :href="getVideoUrl(video.url)" text class="grey--text text--darken-1">
                              <v-icon>mdi-download</v-icon> Download
                            </v-btn>
                          </v-card-actions>
                        </div>
                      </v-card>

                      <v-row class="justify-space-between">
                        <v-col cols="12" sm="6" md="5" lg="5">
                          <v-card class="transparent" flat>
                            <v-list-item three-line>
                              <router-link v-if="video.userId" :to="`/channels/${video.userId._id}`">
                                <v-list-item-avatar size="50">
                                  <img v-if="video.userId && video.userId.photoUrl && video.userId.photoUrl !== 'no-photo.jpg'"
                                    :src="getAvatarUrl(video.userId.photoUrl)"
                                    :alt="`${video.userId.channelName} avatar`" />
                                  <v-avatar v-else color="red">
                                    <span class="white--text headline">
                                      {{ video.userId ? video.userId.channelName.split("")[0].toUpperCase() : '' }}
                                    </span>
                                  </v-avatar>
                                </v-list-item-avatar>
                              </router-link>
                              <v-list-item-content v-if="video.userId" class="align-self-auto">
                                <v-list-item-title class="font-weight-medium mb-1">
                                  <router-link :to="`/channels/${video.userId._id}`">
                                    {{ video.userId.channelName }}
                                  </router-link>
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                  {{ video.userId.subscribers }} subscribers
                                </v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                          </v-card>
                        </v-col>
                        <v-col cols="12" sm="6" md="4" lg="4">
                          <div class="d-flex justify-end align-center" v-if="video.userId">
                            <v-btn v-if="showSubBtn" :class="[
                              { 'red white--text': !subscribed },
                              { 'grey grey--text lighten-3 text--darken-3': subscribed },
                              'mt-6'
                            ]" tile large depressed :loading="subscribeLoading" @click="handleSubscribe">
                              {{ !subscribed ? "Subscribe" : "Subscribed" }}
                            </v-btn>
                          </div>
                        </v-col>
                        <v-col class="pl-11" offset="1" cols="11" md="11">
                          <p>
                            {{ truncate ? truncateText(video.description, 150) : video.description }}
                          </p>
                          <v-btn text @click="toggleDescription" class="remove-hover-bg">
                            {{ truncate ? 'Show More' : 'Show Less' }}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </div>
                  </v-skeleton-loader>

                  <v-row>
                    <v-col v-if="video && video.status === 'public'">
                      <p class="mb-0">
                        {{ video.comments }} Comments
                      </p>
                      <v-text-field v-if="isAuthenticated" v-model="commentText"
                        label="Add a comment..." @click:append="addComment"
                        append-icon="mdi-send"></v-text-field>
                      <v-btn v-else text @click="showSignInDialog('comment')">
                        Add a comment...
                      </v-btn>
                      <CommentList
                        ref="commentList"
                        @videoCommentLength="video.comments--"
                        @commentAdded="video.comments++"
                        :videoId="video._id"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="12" sm="12" md="4" lg="4">
              <hr class="grey--text" />
              <h4 class="mb-3 mt-3">Up next</h4>
              <div v-if="uniqueVideos.length === 0 && !loading">No recommended videos available.</div>
              <div v-for="relatedVideo in uniqueVideos" :key="relatedVideo._id" class="mb-5">
                <v-card class="card" tile flat :to="`/watch/${relatedVideo._id}`">
                  <v-row no-gutters>
                    <v-col class="mx-auto" cols="12" sm="12" md="5" lg="5">
                      <v-img class="align-center" height="110" :src="getThumbnailUrl(relatedVideo.thumbnailUrl)"></v-img>
                    </v-col>
                    <v-col>
                      <div class="ml-2">
                        <v-card-title class="pl-2 pt-0 subtitle-1 font-weight-bold" style="line-height: 1">
                          {{ relatedVideo.title }}
                        </v-card-title>
                        <v-card-subtitle class="pl-2 pt-2 pb-0" style="line-height: 1">
                          {{ relatedVideo.userId ? relatedVideo.userId.channelName : '' }}<br />
                          {{ relatedVideo.views }}
                          views<v-icon>mdi-circle-small</v-icon>
                          {{ dateFormatter(relatedVideo.createdAt) }}
                        </v-card-subtitle>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
              <div v-if="loading" class="text-center my-3">
                <v-progress-circular indeterminate color="red"></v-progress-circular>
              </div>
              <infinite-loading :identifier="infiniteId" @infinite="getVideos" :distance="100">
                <div slot="no-results">No more videos available.</div>
                <span slot="no-more"></span>
                <div slot="error" slot-scope="{ trigger }">
                  <v-alert prominent type="error">
                    <v-row align="center">
                      <v-col class="grow">
                        <div class="title">Error!</div>
                        <div>
                          Something went wrong, but don't fret — let's give it another shot.
                        </div>
                      </v-col>
                      <v-col class="shrink">
                        <v-btn @click="trigger">Take action</v-btn>
                      </v-col>
                    </v-row>
                  </v-alert>
                </div>
              </infinite-loading>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <signin-modal :openModal="signinDialog" :details="details" @closeModal="signinDialog = false" />
  </div>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";

import VideoService from "@/services/VideoService";
import SubscriptionService from "@/services/SubscriptionService";
import FeelingService from "@/services/FeelingService";
import HistoryService from "@/services/HistoryService";
import CommentService from "@/services/CommentService";

import SigninModal from "@/components/SigninModal";
import CommentList from "@/components/comments/CommentList";

export default {
  name: 'Watch',
  components: {
    CommentList,
    SigninModal,
    InfiniteLoading
  },
  data: () => ({
    loading: false,
    errored: false,
    videoLoading: true,
    subscribed: false,
    subscribeLoading: false,
    showSubBtn: false,
    feeling: "",
    video: {},
    videoId: "",
    videos: [],
    page: 1,
    infiniteId: +new Date(),
    truncate: true,
    url: process.env.VUE_APP_URL,
    signinDialog: false,
    details: {},
    allVideosLoaded: false,
    commentText: '',
  }),
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'currentUser']),
    ...mapGetters(['getUrl']),
    uniqueVideos() {
      return Array.from(new Map(this.videos.map(video => [video._id, video])).values());
    }
  },
  methods: {
    async getVideo(id) {
      this.errored = false;
      this.videoLoading = true;
      this.video = {};
      try {
        const response = await VideoService.getById(id);
        if (!response || !response.data || !response.data.data) {
          throw new Error('Invalid video data');
        }
        this.video = response.data.data;
        console.log('Video data:', this.video);
        console.log('Video URL:', this.getVideoUrl(this.video.url));
        if (this.video && this.video.userId) {
          await this.checkSubscription(this.video.userId._id);
          await this.checkFeeling(this.video._id);
        }
      } catch (err) {
        this.errored = true;
        console.error(err);
      } finally {
        this.videoLoading = false;
      }

      if (this.currentUser && this.video && this.video.userId) {
        this.showSubBtn = this.currentUser._id !== this.video.userId._id;
      } else {
        this.showSubBtn = true; // Show subscribe button for non-authenticated users
      }

      if (!this.isAuthenticated) return;

      if (this.video && this.video.userId && this.currentUser &&
          this.video.userId._id.toString() !== this.currentUser._id.toString() &&
          this.video.status !== "public") {
        return this.$router.push("/");
      }

      if (this.video && this.video._id) {
        const data = {
          type: "watch",
          videoId: this.video._id
        };
        await HistoryService.createHistory(data).catch(err => console.error(err));
      }
    },
    async getVideos($state) {
      if (this.allVideosLoaded) {
        $state.complete();
        return;
      }

      this.loading = true;
      try {
        console.log('Fetching videos with params:', {
          page: this.page,
          limit: 10,
          excludeId: this.$route.params.id
        });
        const response = await VideoService.getAllVideos({
          page: this.page,
          limit: 10,
          excludeId: this.$route.params.id
        });

        console.log('Fetched videos response:', response);

        if (response && response.data && response.data.data && response.data.data.length) {
          console.log('Received videos:', response.data.data);
          const newVideos = response.data.data.filter(video =>
            !this.videos.some(existingVideo => existingVideo._id === video._id)
          );

          console.log('New unique videos:', newVideos);

          if (newVideos.length > 0) {
            this.videos.push(...newVideos);
            this.page += 1;
            $state.loaded();
          } else {
            this.allVideosLoaded = true;
            $state.complete();
          }
        } else {
          console.log('No videos received or empty data array');
          this.allVideosLoaded = true;
          $state.complete();
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        this.errored = true;
        $state.error();
      } finally {
        this.loading = false;
        console.log('Current videos array:', this.videos);
      }
    },
    async checkSubscription(id) {
      if (!this.isAuthenticated) return;

      try {
        const sub = await SubscriptionService.checkSubscription({ channelId: id });
        if (sub && sub.data && sub.data.data) {
          this.subscribed = !!sub.data.data._id;
        } else {
          this.subscribed = false;
        }
      } catch (err) {
        console.error(err);
      }
    },
    async checkFeeling(id) {
      if (!this.isAuthenticated || !FeelingService) return;

      try {
        const feeling = await FeelingService.checkFeeling({ videoId: id });
        if (feeling && feeling.data && feeling.data.data) {
          this.feeling = feeling.data.data.feeling;
        } else {
          this.feeling = "";
        }
      } catch (err) {
        console.error(err);
      }
    },
    async createFeeling(type) {
      if (!this.isAuthenticated) {
        this.showSignInDialog('feeling');
        return;
      }
      switch (true) {
        case type === "like" && this.feeling === "":
          this.feeling = "like";
          this.video.likes++;
          break;
        case type === "like" && this.feeling === type:
          this.feeling = "";
          this.video.likes--;
          break;
        case type === "like" && this.feeling === "dislike":
          this.feeling = "like";
          this.video.dislikes--;
          this.video.likes++;
          break;
        case type === "dislike" && this.feeling === "":
          this.feeling = "dislike";
          this.video.dislikes++;
          break;
        case type === "dislike" && this.feeling === type:
          this.feeling = "";
          this.video.dislikes--;
          break;
        case type === "dislike" && this.feeling === "like":
          this.feeling = "dislike";
          this.video.likes--;
          this.video.dislikes++;
          break;
      }

      try {
        await FeelingService.createFeeling({
          videoId: this.video._id,
          type
        });
      } catch (err) {
        console.error(err);
      }
    },
    handleSubscribe() {
      if (!this.isAuthenticated) {
        this.showSignInDialog('subscribe');
      } else {
        this.subscribe();
      }
    },
    async subscribe() {
      this.subscribeLoading = true;
      try {
        const sub = await SubscriptionService.createSubscription({
          channelId: this.video.userId._id
        });
        if (sub && sub.data && sub.data.data) {
          this.subscribed = !!sub.data.data._id;
          if (this.subscribed) {
            this.video.userId.subscribers++;
          } else {
            this.video.userId.subscribers--;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.subscribeLoading = false;
      }
    },
    async updateViews(id) {
      try {
        await VideoService.updateViews(id);
        this.video.views++;
      } catch (err) {
        console.error(err);
      }
    },
    actions() {
      this.getVideo(this.$route.params.id);
    },
    toggleDescription() {
      this.truncate = !this.truncate;
    },
    truncateText(string = "", num) {
      if (string.length <= num) {
        return string;
      }
      return string.slice(0, num) + "...";
    },
    dateFormatter(date) {
      return moment(date).format('MMMM D, YYYY');
    },
    onVideoLoad() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.play();
      }
    },
    getVideoUrl(url) {
      return VideoService.getVideoUrl(url);
    },
    getThumbnailUrl(url) {
      return VideoService.getThumbnailUrl(url);
    },
    getAvatarUrl(photoUrl) {
      if (photoUrl.startsWith('http')) {
        return photoUrl;
      }
      return `${this.getUrl}/uploads/avatars/${photoUrl}`;
    },
    showSignInDialog(action) {
      this.signinDialog = true;
      switch (action) {
        case 'subscribe':
          this.details = {
            title: "Want to subscribe to this channel?",
            text: "Sign in to subscribe to this channel."
          };
          break;
        case 'comment':
          this.details = {
            title: "Want to comment on this video?",
            text: "Sign in to leave a comment."
          };
          break;
        case 'feeling':
          this.details = {
            title: "Like this video?",
            text: "Sign in to make your opinion count."
          };
          break;
        default:
          this.details = {
            title: "Sign in required",
            text: "Please sign in to perform this action."
          };
      }
    },
    async addComment() {
      if (!this.isAuthenticated) {
        this.showSignInDialog('comment');
        return;
      }
      if (!this.commentText.trim()) return;

      try {
        const response = await CommentService.createComment({
          videoId: this.video._id,
          text: this.commentText
        });
        if (response && response.data && response.data.data) {
          const newComment = response.data.data;
          this.video.comments++;
          this.commentText = '';

          // Add the new comment to the CommentList component
          if (this.$refs.commentList && typeof this.$refs.commentList.addNewComment === 'function') {
            this.$refs.commentList.addNewComment(newComment);
          }
        }
      } catch (err) {
        console.error("Error adding comment:", err);
      }
    },
  },
  mounted() {
    console.log('Watch component mounted');
    this.getVideo(this.$route.params.id);
    if (this.isAuthenticated) this.updateViews(this.$route.params.id);
  },
  beforeRouteUpdate(to, from, next) {
    console.log('Route update detected');
    this.page = 1;
    this.videos = [];
    this.allVideosLoaded = false;
    this.infiniteId += 1;
    this.getVideo(to.params.id);
    next();
  }
};
</script>

<style lang="scss">
video {
  max-width: 100%;
}

.grey-color {
  color: #7f7f7f !important;
}

#btns {
  border-bottom: 1px solid #e0d8d8;
}

button.v-btn.remove-hover-bg {
  background-color: initial !important;

  &:hover {
    background-color: #f9f9f9;
  }
}

.v-list-item__avatar {
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}
</style>
