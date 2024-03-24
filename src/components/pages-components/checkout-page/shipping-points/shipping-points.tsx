'use client';
import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/redux-hooks";
import { useGetCdekPointsQuery } from "@/api/api";
import { useGetCdekDeliveryPriceQuery } from "@/api/api";
import { packagesWeightCalcFunc } from "@/app/utils/cart-utils";
import DeliveryMap from "../delivery-map/delivery-map";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { cartSummaryFunc } from "@/app/utils/cart-utils";
import { ACQUIRE_RATIO } from "@/app/utils/constants";



const ShippingPoints: React.FC = () => {

    const dispatch = useAppDispatch();
    const { order, deliveryParams } = useAppSelector(store => store.cart);
    const totalPrice = cartSummaryFunc(order!)
    const orderWeightArr = packagesWeightCalcFunc(order!);
    const { data: cdekPointsData } = useGetCdekPointsQuery(deliveryParams.validCityTo!.code);
    const { data: cdekDeliveryPrice} = useGetCdekDeliveryPriceQuery({ orderWeightArr, cityTo: deliveryParams.validCityTo!, totalPrice})

    useEffect(() => {
        cdekDeliveryPrice && dispatch(cartActions.setDeliveryPrice(Math.round(cdekDeliveryPrice.total_sum / ACQUIRE_RATIO)));
    }, [cdekDeliveryPrice])

    return (
        <>        
            {cdekPointsData && <DeliveryMap points={cdekPointsData} />}
        </>
    )
} 

export default ShippingPoints;