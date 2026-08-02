import React from "react";
import styles from './page.module.css';
import PrintMethodsScreen from "@/components/pages-components/main-page/print-methods-screen/print-methods-screen";
import Breadcrumbs from '@/components/shared-components/breadcrumbs/Breadcrumbs';







const Page: React.FC = () => {

    return (
        <Breadcrumbs items={[{label: 'Главная', href: '/'}, {label: 'Текстиль', href: '/textile'}]} />
    )
}

export default Page;