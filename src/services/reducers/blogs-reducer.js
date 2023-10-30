import {
  GET_BLOGS,
  GET_ONE_BLOG,
  DEL_ONE_BLOG_MEMORY,
  GET_BLOG_MEMORY,
} from '../actions/blogs-actions';

const initialState = {
  blogs: [],
  item: {},
};

const blogsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_BLOGS: {
      const data = action.payload.reverse();
      return {
        ...state,
        blogs: data,
      };
    }
    case GET_ONE_BLOG: {
      // let viewBlog = state.blogSave;
      const viewBlog = action.payload;

      sessionStorage.setItem('blog', JSON.stringify(viewBlog));

      return {
        ...state,
        item: JSON.parse(sessionStorage.getItem('blog')),
      };
    }
    case GET_BLOG_MEMORY: {
      return {
        ...state,
        item: JSON.parse(sessionStorage.getItem('blog')),
      };
    }
    case DEL_ONE_BLOG_MEMORY: {
      sessionStorage.setItem('blog', '');
      return {
        ...state,
        item: {},
      };
    }
    default:
      return state;
  }
};

export default blogsReducer;
