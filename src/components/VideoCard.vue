<template>
      <v-card
        class="content-bg card mx-auto"
        :max-width="cardMaxWidth"
        flat
        tile
        router
        :to="`/watch/${video._id}`"
      >
        <img
          :src="thumbnailUrl"
          :alt="video.title"
          style="width: 100%; height: auto; aspect-ratio: 16/9;"
        >
        <v-row no-gutters>
          <v-col cols="auto" v-if="card.type != 'noAvatar'">
            <v-list-item class="pl-0 pt-3" router :to="`/channels/${channel._id}`">
              <v-list-item-avatar size="36">
                <v-img
                  v-if="channel.photoUrl && channel.photoUrl !== 'no-photo.jpg'"
                  :src="channel.photoUrl"
                ></v-img>
                <v-avatar v-else color="red" size="36">
                  <span class="white--text body-2">
                    {{ channel.channelName ? channel.channelName.charAt(0).toUpperCase() : '' }}
                  </span>
                </v-avatar>
              </v-list-item-avatar>
            </v-list-item>
          </v-col>
          <v-col>
            <div class="video-info-container">
              <div class="video-title">{{ video.title }}</div>
              <div class="channel-name">{{ channel.channelName }}</div>
              <div class="video-stats">
                {{ video.views }} views<v-icon small>mdi-circle-small</v-icon>{{ dateFormatter(video.createdAt) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </template>

    <script>
    import moment from "moment";
    import VideoService from '@/services/VideoService'

    export default {
      name: "VideoCard",
      props: {
        video: {
          type: Object,
          required: true,
        },
        channel: {
          type: Object,
          required: true,
        },
        card: {
          type: Object,
          default: () => ({})
        },
      },
      computed: {
        thumbnailUrl() {
          return VideoService.getThumbnailUrl(this.video.thumbnailUrl);
        },
        cardMaxWidth() {
          return this.card && this.card.maxWidth ? this.card.maxWidth : 300;
        }
      },
      methods: {
        dateFormatter(date) {
          return moment(date).fromNow();
        }
      },
      mounted() {
        console.log('VideoCard mounted for video:', this.video._id, 'Thumbnail:', this.thumbnailUrl);
      }
    };
    </script>

    <style scoped>
    .video-info-container {
      padding: 12px 12px 16px 0;
    }
    .video-title {
      font-size: 15.5px;
      font-weight: 500;
      line-height: 1.4;
      max-height: 2.8em;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 4px;
    }
    .channel-name, .video-stats {
      font-size: 13.5px;
      color: #606060;
      line-height: 1.4;
    }
    .channel-name {
      margin-bottom: 2px;
    }
    .v-list-item__avatar {
      margin-right: 12px !important;
    }
    </style>
