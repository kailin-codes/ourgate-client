import Api from '@/services/Api'

const STOCK_THUMBNAIL_URL = 'https://res.cloudinary.com/di38cp0gv/image/upload/v1722044739/172196810362008095_1_hm988x.png';

export default {
  getAll(status, params) {
    console.log('VideoService: Calling getAll with status:', status, 'and params:', params);
    return Api().get(`videos/${status}`, { params });
  },
  getById(id) {
    console.log('VideoService: Calling getById with id:', id);
    return Api().get(`videos/${id}`);
  },
  uploadVideo(data, optional) {
    console.log('VideoService: Calling uploadVideo');
    return Api().post('videos', data, optional);
  },
  updateVideo(id, data) {
    console.log('VideoService: Calling updateVideo for id:', id);
    return Api().put(`videos/${id}`, data);
  },
  updateViews(id) {
    console.log('VideoService: Calling updateViews for id:', id);
    return Api().put(`videos/${id}/views`);
  },
  uploadThumbnail(id, data) {
    console.log('VideoService: Calling uploadThumbnail for id:', id);
    return Api().put(`videos/${id}/thumbnails`, data);
  },
  deleteById(id) {
    console.log('VideoService: Calling deleteById for id:', id);
    return Api().delete(`videos/${id}`);
  },
  getAllVideos(params) {
      console.log('API URL:', process.env.VUE_APP_API_URL);
      console.log('Calling getAllVideos with params:', params);
      return Api().get('videos/public', { params })
        .then(response => {
          console.log('getAllVideos response:', response);
          return response;
        })
        .catch(error => {
          console.error('Error in getAllVideos:', error);
          throw error;
        });
    },
  getThumbnailUrl(thumbnailUrl) {
    console.log('VideoService: Getting thumbnail URL for:', thumbnailUrl);
    if (!thumbnailUrl) {
      console.warn('VideoService: Thumbnail URL is missing, using stock thumbnail');
      return STOCK_THUMBNAIL_URL;
    }
    return thumbnailUrl;
  },
  getVideoUrl(videoUrl) {
    console.log('VideoService: Getting video URL for:', videoUrl);
    if (!videoUrl) {
      console.warn('VideoService: Video URL is missing');
      return null;
    }
    if (videoUrl.startsWith('https://res.cloudinary.com')) {
      console.log('VideoService: Returning Cloudinary URL directly');
      return videoUrl;
    }
    const fullUrl = `${process.env.VUE_APP_URL}/uploads/videos/${videoUrl}`;
    console.log('VideoService: Returning full video URL:', fullUrl);
    return fullUrl;
  }
}
