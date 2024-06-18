<template>
      <div id="search" class="search-page">
            <div class="search-sidebar">
                  <!-- Sidebar content can be added here if needed -->
            </div>
            <div class="search-results">
                  <v-alert prominent class="mx-auto" type="error" v-if="errored">
                        <v-row align="center">
                              <v-col class="grow">
                                    <div class="title">Error!</div>
                                    <div>
                                          Something went wrong, but don't fret — let's give it another
                                          shot.
                                    </div>
                              </v-col>
                              <v-col class="shrink">
                                    <v-btn @click="getSearchResults">Take action</v-btn>
                              </v-col>
                        </v-row>
                  </v-alert>
                  <template v-if="results.length === 0 && !loading">
                        <p class="text-center">Oops! No search results</p>
                  </template>
                  <div v-else v-for="result in results" :key="result._id" class="search-result-item">
                        <v-skeleton-loader class="mx-auto" type="list-item-three-line" :loading="loading" tile>
                              <div v-if="result" class="result-content" @click="navigateToResult(result)">
                                    <div class="thumbnail">
                                          <v-img v-if="result.thumbnailUrl" :src="result.thumbnailUrl"
                                                :alt="`${getChannelName(result)} thumbnail`" aspect-ratio="16/9"
                                                width="320" height="180" contain @error="logImageError"></v-img>
                                          <v-avatar v-else-if="result.photoUrl" size="180" class="channel-avatar">
                                                <v-img :src="result.photoUrl" :alt="`${getChannelName(result)} avatar`"
                                                      @error="logImageError"></v-img>
                                          </v-avatar>
                                          <v-avatar v-else size="180" class="channel-avatar">
                                                <span class="white--text headline">
                                                      {{ getChannelInitial(result) }}
                                                </span>
                                          </v-avatar>
                                    </div>
                                    <div class="result-details">
                                          <h3 class="result-title">{{ getResultTitle(result) }}</h3>
                                          <template v-if="isVideo(result)">
                                                <p class="result-meta">
                                                      <span v-if="result.views">{{ result.views }} views</span>
                                                      <span v-if="result.views && result.createdAt"> • </span>
                                                      <span v-if="result.createdAt">{{ formatDate(result.createdAt)
                                                            }}</span>
                                                </p>
                                                <div class="channel-info">
                                                      <v-avatar size="36" class="mr-2">
                                                            <v-img v-if="result.userId && result.userId.photoUrl"
                                                                  :src="result.userId.photoUrl"
                                                                  :alt="`${getChannelName(result)} avatar`"></v-img>
                                                            <span v-else class="white--text caption">
                                                                  {{ getChannelInitial(result) }}
                                                            </span>
                                                      </v-avatar>
                                                      <span class="channel-name">{{ getChannelName(result) }}</span>
                                                </div>
                                          </template>
                                          <template v-else>
                                                <p class="result-meta">
                                                      <span>{{ result.subscribers }} subscribers</span>
                                                </p>
                                          </template>
                                          <p class="result-description">{{ truncateDescription(result.description) }}
                                          </p>
                                    </div>
                              </div>
                        </v-skeleton-loader>
                  </div>
                  <infinite-loading :identifier="infiniteId" @infinite="getSearchResults">
                        <div slot="spinner">
                              <v-progress-circular indeterminate color="red"></v-progress-circular>
                        </div>
                        <div slot="no-results"></div>
                        <span slot="no-more"></span>
                        <div slot="error" slot-scope="{ trigger }">
                              <v-alert prominent type="error">
                                    <v-row align="center">
                                          <v-col class="grow">
                                                <div class="title">Error!</div>
                                                <div>
                                                      Something went wrong, but don't fret — let's give it
                                                      another shot.
                                                </div>
                                          </v-col>
                                          <v-col class="shrink">
                                                <v-btn @click="trigger">Take action</v-btn>
                                          </v-col>
                                    </v-row>
                              </v-alert>
                        </div>
                  </infinite-loading>
            </div>
      </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
import { mapGetters } from 'vuex'
import SearchService from '@/services/SearchService'

export default {
      name: 'Search',
      data() {
            return {
                  errored: false,
                  loading: true,
                  loaded: false,
                  page: 1,
                  results: [],
                  text: '',
                  infiniteId: +new Date(),
            }
      },
      computed: {
            ...mapGetters(['getUrl'])
      },
      methods: {
            async getSearchResults($state) {
                  if (!this.text) {
                        if ($state) $state.complete();
                        return;
                  }

                  this.errored = false;
                  if (!this.loaded) {
                        this.loading = true;
                  }

                  try {
                        const response = await SearchService.search(this.page, {
                              text: this.text
                        });

                        console.log('Search response:', response.data);

                        const { data, success } = response.data;

                        if (success && data && data.length) {
                              const uniqueData = data.filter(item => !this.results.some(existingItem => existingItem._id === item._id));
                              console.log('Unique data:', uniqueData);
                              this.page += 1;
                              this.results.push(...uniqueData);
                              if ($state) {
                                    $state.loaded();
                              }
                              this.loaded = true;
                        } else {
                              if ($state) {
                                    $state.complete();
                              }
                        }
                  } catch (err) {
                        console.error('Error searching videos:', err);
                        this.errored = true;
                        if ($state) {
                              $state.error();
                        }
                  } finally {
                        this.loading = false;
                  }
            },
            resetSearch() {
                  this.page = 1;
                  this.results = [];
                  this.infiniteId += 1;
                  this.getSearchResults();
            },
            updateSearchText() {
                  const newQuery = this.$route.query['search-query'] || '';
                  if (this.text !== newQuery) {
                        this.text = newQuery;
                        this.resetSearch();
                  }
            },
            navigateToResult(result) {
                  if (!result) return;
                  const route = this.isVideo(result) ? `/watch/${result._id}` : `/channels/${result._id}`;
                  this.$router.push(route);
            },
            logImageError(error) {
                  console.error('Image failed to load:', error.target.src);
            },
            truncateDescription(description) {
                  if (!description) return '';
                  const maxLength = 150;
                  if (description.length <= maxLength) return description;
                  return description.substr(0, maxLength) + '...';
            },
            getChannelName(result) {
                  if (!result) return 'N/A';
                  return this.isVideo(result) ? result.userId.channelName : result.channelName || 'N/A';
            },
            getResultTitle(result) {
                  if (!result) return 'N/A';
                  return result.title || result.channelName || 'N/A';
            },
            getChannelInitial(result) {
                  const channelName = this.getChannelName(result);
                  return channelName ? channelName.charAt(0).toUpperCase() : 'N/A';
            },
            isVideo(result) {
                  return result && result.userId;
            },
            formatDate(dateString) {
                  const date = new Date(dateString);
                  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }
      },
      components: {
            InfiniteLoading
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
            this.updateSearchText();
      }
}
</script>

<style scoped>
.search-page {
      display: flex;
      background-color: #f9f9f9;
}

.search-sidebar {
      width: 300px;
      padding: 24px;
}

.search-results {
      flex-grow: 1;
      padding: 24px;
}

.search-result-item {
      margin-bottom: 30px;
}

.result-content {
      display: flex;
      cursor: pointer;
}

.thumbnail {
      margin-right: 24px;
      flex-shrink: 0;
}

.channel-avatar {
      width: 180px !important;
      height: 180px !important;
      background-color: #e5e5e5;
}

.result-details {
      flex-grow: 1;
}

.result-title {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #030303;
}

.result-meta {
      font-size: 16px;
      color: #606060;
      margin-bottom: 8px;
}

.channel-info {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #606060;
      margin-bottom: 12px;
}

.channel-name {
      margin-right: 8px;
}

.result-description {
      font-size: 16px;
      color: #606060;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
}
</style>
