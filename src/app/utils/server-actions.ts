import { revalidateTag } from "next/cache"
export const shopDataRevalidationFunc = () => {
'use server'
revalidateTag('shopDataTag')
}