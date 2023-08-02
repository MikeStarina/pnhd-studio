import React from "react";
import { useLocation,useHistory} from "react-router-dom";
import styles from "./cards-block.module.css";
import CardItem from "./card-item.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { apiBaseUrl } from "../../utils/constants";
import { SET_DEFAULTFILTER, SET_FIRSTSELECTEDITEM, SET_SECONDSELECTEDITEM, SET_THIRDSELECTEDITEM } from "../../services/actions/shop-data-actions";
// ?ff=man&woman?sf=tshirt&hoodie?tf=белый&черный?
const CardsBlock = () => {
  const dispatch = useDispatch();
  
  const history = useHistory();
  const { search } = useLocation();
  const {
    data,
    filter,
    firstFilterSelectedItem,
    firstFilterSelect,    
    firstCount,
    secondFilterSelectedItem,
    secondFilterSelect,
    secondCount,
    thirdFilterSelectedItem,
    thirdFilterSelect,
    thirdCount
  } = useSelector((store) => store.shopData);
/**/

const addressString = decodeURI(search);
const getAdressFilter = (string, filter)=>{
  let a ;
  const arrFilter = string.split('?');
  arrFilter.forEach((item)=>{
    if(item.indexOf(filter) != -1){
      a = item.slice(3).split('&');
    }
  })
  return a;
}

let frstFilter;
let secondFilter;
let thirdFilter;


let a = [];
let b = [];
let a2 = [];
let b2 = [];
let a3 = [];
let b3 = [];
console.log(firstFilterSelectedItem.length !=0 ||secondFilterSelectedItem.length !=0 || thirdFilterSelectedItem.length !=0)
React.useEffect(()=>{
  if(addressString ==='' && (firstFilterSelectedItem.length !=0 ||secondFilterSelectedItem.length !=0 || thirdFilterSelectedItem.length !=0)){
    
    history.push(`/shop`);
a = [];
b = [];
a2 = [];
b2 = [];
a3 = [];
b3 = [];
    dispatch({type: SET_DEFAULTFILTER})
    console.log('reload new page')
  }
})

  if(addressString !='' && (firstFilterSelectedItem.length ===0 &&secondFilterSelectedItem.length ===0 && thirdFilterSelectedItem.length ===0)){
    frstFilter = getAdressFilter(addressString, 'ff');
    secondFilter = getAdressFilter(addressString, 'sf');
    thirdFilter = getAdressFilter(addressString, 'tf');
    // console.log(frstFilter)
    if(frstFilter){
      a=firstFilterSelect;
      b=firstCount;
      frstFilter.forEach(item=>{
        a.forEach((select, index)=>{
          if(select.category === item){
            a[index].selected = true;
            b += 1;
          }
        })
      })
     
    }
    if(secondFilter){
      a2=secondFilterSelect;
      b2=secondCount;
      secondFilter.forEach(item=>{
        a2.forEach((select, index)=>{
          if(select.category === item){
            a2[index].selected = true;
            b2 += 1;
          }
        })
      })
    }
    if(thirdFilter){
      a3=thirdFilterSelect;
      b3=thirdCount;
      thirdFilter.forEach(item=>{
        a3.forEach((select, index)=>{
          if(select.category === item){
            a3[index].selected = true;
            b3 += 1;
          }
        })
      })
    }
    //console.log(frstFilter, secondFilter, thirdFilter)
    console.log(frstFilter, secondFilter,thirdFilter)
  }
 
  // console.log(addressString.indexOf('ff'));
  
React.useEffect(()=>{ 
  if(a.length>0){
  dispatch({type: SET_FIRSTSELECTEDITEM, payload: {a,b,frstFilter}})
  console.log('kurwa')
}
if(a2.length>0){
  dispatch({type: SET_SECONDSELECTEDITEM, payload: {a2,b2,secondFilter}})
  console.log('kurwa2')
}
if(a3.length>0){
  dispatch({type: SET_THIRDSELECTEDITEM, payload: {a3,b3,thirdFilter}})
  console.log('kurwa3')
}
},[a,a2,a3])

   
 

/**/
  let filteredData = [];
  if (filter) {
    filteredData = data.filter((item) => item.category === filter);
  } else {
    filteredData = data;
  }

  let resultArr = [];

  if (
    firstFilterSelectedItem.length === 0 ||
    secondFilterSelectedItem.length === 0 ||
    thirdFilterSelectedItem.length === 0
  ) {
    resultArr = data;
  }

  const firstArr = [];
  if (firstFilterSelectedItem.length != 0) {
    resultArr = [];
    firstFilterSelectedItem.forEach((item) => {
      data.forEach((elem) => {
        if (item === elem.category) {
          resultArr.push(elem);
        }
      });
    });
  }
  if (secondFilterSelectedItem.length != 0) {
    // if (firstFilterSelectedItem.length != 0) {
    //     let a = [...resultArr];
    //     resultArr = [];
    //   secondFilterSelectedItem.forEach((item) => {
    //     a.forEach((elem) => {
    //       if (item === elem.type) {
    //         resultArr.push(elem);
    //       }
    //     });
    //   });
    // }else{
    //     resultArr = [];
    // secondFilterSelectedItem.forEach((item) => {
    //   data.forEach((elem) => {
    //     if (item === elem.type) {
    //       resultArr.push(elem);
    //     }
    //   });
    // });
    // }
    let a = [...resultArr];
    resultArr = [];
    secondFilterSelectedItem.forEach((item) => {
      a.forEach((elem) => {
        if (item === elem.type) {
          resultArr.push(elem);
        }
      });
    });
  }
  if (thirdFilterSelectedItem != 0) {
    let a = [...resultArr];
    resultArr = [];
    thirdFilterSelectedItem.forEach((item) => {
      a.forEach((elem) => {
        if (item === elem.color) {
          resultArr.push(elem);
        }
      });
    });
  }
  //    data.forEach(item=>console.log(item.color))
  // console.log(search);
  // console.log(
  //   firstFilterSelectedItem,
  //   secondFilterSelectedItem,
  //   thirdFilterSelectedItem
  // );
  const teesArr = filteredData.filter((item) => item.type === "tshirt");
  const longsleevesArr = filteredData.filter(
    (item) => item.type === "longsleeve"
  );
  const sweatshirtsArr = filteredData.filter(
    (item) => item.type === "sweatshirt"
  );
  const hoodiesArr = filteredData.filter((item) => item.type === "hoodie");
  const accesorizeArr = filteredData.filter(
    (item) => item.category === "accesorize"
  );
  const friendsArr = filteredData.filter((item) => item.category === "friends");

  return (
    <section className={styles.screen}>
      {/* filteredData && filteredData.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
                ) */}
      {resultArr &&
        resultArr.map((item, index) => {
          const url = `${apiBaseUrl}${item.image_url}`;
          return (
            <Link
              to={{ pathname: `/shop/${item._id}` }}
              className={styles.link}
              key={index}
            >
              <CardItem
                title={item.name}
                price={item.price}
                img={url}
                sizes={item.sizes}
              />
            </Link>
          );
        })}
      {/* {firstArr.length != 0 &&
        firstArr.map((item, index) => {
          const url = `${apiBaseUrl}${item.image_url}`;
          return (
            <Link
              to={{ pathname: `/shop/${item._id}` }}
              className={styles.link}
              key={index}
            >
              <CardItem
                title={item.name}
                price={item.price}
                img={url}
                sizes={item.sizes}
              />
            </Link>
          );
        })} */}
      {/* {teesArr &&
        teesArr.map((item, index) => {
          const url = `${apiBaseUrl}${item.image_url}`;
          return (
            <Link
              to={{ pathname: `/shop/${item._id}` }}
              className={styles.link}
              key={index}
            >
              <CardItem
                title={item.name}
                price={item.price}
                img={url}
                sizes={item.sizes}
              />
            </Link>
          );
        })} */}
      {/* {longsleevesArr && longsleevesArr.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index + 1}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
            )}
            {sweatshirtsArr && sweatshirtsArr.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index + 2}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
            )}
            {hoodiesArr && hoodiesArr.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index + 3}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
            )}
             {friendsArr && friendsArr.map((item, index) => {


                    const url = `${apiBaseUrl}${item.image_url}`
                    return (
                    <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index + 4}>
                        <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                    </Link>
            )}
            )}
            {accesorizeArr && accesorizeArr.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index + 5}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
            )} */}
    </section>
  );
};

export default CardsBlock;
