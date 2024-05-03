'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { urlQueryStringToObject } from "@/app/utils/constants";

type TLinkProps = {
    children: React.ReactNode,
    style?: string,
    pathname: string,
    hash?: string,
    target?: string
}



const UtmLink: React.FC<TLinkProps> = ({ children, style, pathname, hash, target }) => {

    // const searchParams = useSearchParams().toString();
    // const query = urlQueryStringToObject(useSearchParams().toString());
    const [ queryState, setQueryState ] = useState<{}>({})

    useEffect(() => {
    
        const url = window.location.protocol + '//' +  window.location.host + window.location.pathname;
        let queryString = window.location.href.substring(url.length + 1);
        const utmQuery = queryString.length > 0 ? urlQueryStringToObject(window.location.href.substring(url.length + 1)) : {};
        
        setQueryState({...utmQuery});

    }, [])

    const href = {
        pathname,
        hash,
        query: queryState
    }

    return (
            <Link href={href} className={style} style={{ textDecoration: 'none' }} target={target}>{children}</Link>
    )
}

export default UtmLink;