export const GET_DATA = 'GET_DATA';



export const getShopData = () => {
    return function (dispatch) {
        fetch('http://localhost:1337/api/products', {
            headers: { "Content-Type": "application/json" }
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