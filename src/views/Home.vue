<template>
      <div class="home">
        <v-container fluid>
          <v-row>
            <v-col cols="12">
              <v-sheet class="mx-auto" max-width="100%">
                <v-slide-group
                  v-model="selectedCategory"
                  class="pa-4"
                  show-arrows
                >
                  <v-slide-item>
                    <v-btn
                      class="mx-2"
                      :input-value="!selectedCategoryId"
                      active-class="primary"
                      depressed
                      rounded
                      @click="selectCategory(null)"
                    >
                      All
                    </v-btn>
                  </v-slide-item>
                  <v-slide-item
                    v-for="category in sortedCategories"
                    :key="category._id"
                    v-slot="{ active }"
                  >
                    <v-btn
                      class="mx-2"
                      :input-value="active"
                      active-class="primary"
                      depressed
                      rounded
                      @click="selectCategory(category._id)"
                    >
                      {{ category.title }}
                    </v-btn>
                  </v-slide-item>
                </v-slide-group>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-sheet min-height="70vh" rounded="lg">
                <v-row v-if="loading && videos.length === 0">
                  <v-col class="text-center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    v-for="(video, i) in filteredVideos"
                    :key="i"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <video-card :video="video" :channel="video.userId"></video-card>
                  </v-col>
                </v-row>
                <v-row v-if="!loading && filteredVideos.length === 0">
                  <v-col class="text-center">
                    No videos found
                  </v-col>
                </v-row>
              </v-sheet>
            </v-col>
          </v-row>
        </v-container>
        <infinite-loading @infinite="infiniteHandler" :identifier="infiniteId">
          <template #spinner>
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </template>
          <template #no-more>
            <span>No more videos</span>
          </template>
          <template #no-results>
            <span>No results found</span>
          </template>
        </infinite-loading>
      </div>
    </template>

    <script>
    import { mapGetters } from 'vuex'
    import VideoCard from '@/components/VideoCard'
    import VideoService from '@/services/VideoService'
    import CategoryService from '@/services/CategoryService'
    import InfiniteLoading from 'vue-infinite-loading'

    export default {
      name: 'Home',
      components: {
        VideoCard,
        InfiniteLoading
      },
      data: () => ({
        videos: [],
        categories: [],
        loading: false,
        errored: false,
        selectedCategory: null,
        selectedCategoryId: null,
        params: {
          page: 1,
          limit: 12
        },
        infiniteId: +new Date(),
      }),
      computed: {
        ...mapGetters(['isAuthenticated', 'currentUser']),
        isChannelPage() {
          return !!this.$route.params.id;
        },
        filteredVideos() {
          if (this.selectedCategoryId) {
            return this.videos.filter(video => video.categoryId && video.categoryId._id === this.selectedCategoryId);
          }
          return this.videos;
        },
        sortedCategories() {
          const order = [
            "General Health & Wellness",
            "Specialized Medical Procedures",
            "Mental Health & Psychology",
            "Nutrition & Dietetics",
            "Physical Therapy & Rehabilitation",
            "Public Health & Epidemiology",
            "Pharmacology & Drug Research",
            "Alternative & Complementary Medicine",
            "Medical Ethics & Patient Care",
            "Healthcare Technology & Innovations"
          ];
          return [...this.categories].sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
        }
      },
      methods: {
        selectCategory(categoryId) {
          this.selectedCategoryId = categoryId;
          console.log('Selected category:', categoryId);
          this.resetAndRefetch();
        },
        async infiniteHandler($state) {
          this.loading = true;
          try {
            const response = await VideoService.getAllVideos(this.params);
            console.log('All videos:', response.data);
            const newVideos = response.data.data;
            if (newVideos.length > 0) {
              newVideos.forEach(video => {
                console.log(`Video ${video._id} thumbnail:`, video.thumbnailUrl);
              });
              this.videos = [...this.videos, ...newVideos];
              this.params.page += 1;
              $state.loaded();
            } else {
              $state.complete();
            }
          } catch (error) {
            console.error('Error fetching videos:', error);
            this.errored = true;
            $state.error();
          } finally {
            this.loading = false;
          }
        },
        async getCategories() {
          try {
            const response = await CategoryService.getAll();
            console.log('All categories:', response.data);
            this.categories = response.data.data;
          } catch (error) {
            console.error('Error fetching categories:', error);
            this.errored = true;
          }
        },
        resetAndRefetch() {
          this.videos = [];
          this.params.page = 1;
          this.infiniteId += 1;
        }
      },
      async mounted() {
        await this.getCategories();
      }
    }
    </script>

    <style scoped>
    .home {
      padding-top: 20px;
    }
    </style>
