import { ssOptions } from "@/app/utils/method-options-data"
export const dynamicParams = false;
export const generateStaticParams = async () => {
    return ssOptions.map((item) => ({ slug: item.slug }))
}


export default function Layout ({ children }: { children : React.ReactNode}) {

    return (
        <>
        {children}
        </>
    )
}