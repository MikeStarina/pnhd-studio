import { apiBaseUrl } from "../../utils/constants";

export const GET_DATA = 'GET_DATA';
export const SET_FILTER = 'SET_FILTER';



export const getShopData = () => {
    return function (dispatch) {
        fetch(`${apiBaseUrl}/api/products`, {
            headers: { 
                "Content-Type": "application/json",
            }
            })
            .then(res => res.json())
            .then((res) => {
                //console.log(res);
                dispatch({
                    type: GET_DATA,
                    payload: res.data
                });
            });
  
    }
}