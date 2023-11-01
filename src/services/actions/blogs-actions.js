import { apiBaseUrl } from '../../utils/constants';
import { checkResponse } from '../../utils/utils';

export const GET_BLOGS = 'GET_BLOGS';
export const GET_ONE_BLOG = 'GET_ONE_BLOG';
export const DEL_ONE_BLOG_MEMORY = 'DEL_ONE-BLOG_MEMORY';
export const GET_BLOG_MEMORY = 'GET_BLOG_MEMORY';

export const getBlogs = () => (dispatch) => {
  fetch(`${apiBaseUrl}/api/blogs`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(checkResponse)
    .then((res) => {
      dispatch({
        type: GET_BLOGS,
        payload: res.data,
      });
    });
};

export const getOneBlog = (payload) => ({
  type: GET_ONE_BLOG,
  payload,
});

export const delOneBlogMemory = () => ({
  type: DEL_ONE_BLOG_MEMORY,
});

export const getBlogMemory = () => ({
  type: GET_BLOG_MEMORY,
});
