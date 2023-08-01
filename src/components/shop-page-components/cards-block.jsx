import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./cards-block.module.css";
import CardItem from "./card-item.jsx";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { apiBaseUrl } from "../../utils/constants";

const CardsBlock = () => {
  const { search } = useLocation();
  const {
    data,
    filter,
    firstFilterSelectedItem,
    secondFilterSelectedItem,
    thirdFilterSelectedItem,
  } = useSelector((store) => store.shopData);
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
  if(thirdFilterSelectedItem != 0){
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
  console.log(search);
  console.log(
    firstFilterSelectedItem,
    secondFilterSelectedItem,
    thirdFilterSelectedItem
  );
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
