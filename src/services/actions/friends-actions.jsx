import { apiBaseUrl } from '../../utils/constants';
import { checkResponse } from '../../utils/utils';
import { openPopup } from './utility-actions';

export const GET_FRIEND_PRODUCT = 'GET_FRIEND_PRODUCT';

export const getFriendProduct = (friendName) => function (dispatch) {
  function getFriendProduct(elem) {
    dispatch({
      type: GET_FRIEND_PRODUCT,
      payload: elem,
    });
  }
  fetch(`${apiBaseUrl}/api/friends/friend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-length': '',
    },
    body: JSON.stringify({ friend: friendName }),
  })
    .then(checkResponse)
    .then((res) => {
      getFriendProduct(res);
    })
    .catch((err) => {
      dispatch(
        openPopup([
          'Не удалось загрузить товары. Попробуйте обновить страницу.',
        ]),
      );
    });
};
