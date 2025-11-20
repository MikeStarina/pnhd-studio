import React from 'react';
import styles from './page.module.scss';
import classnames from 'classnames/bind';
import Link from 'next/link';
import Image from 'next/image';
import testPic from '../../../public/changelog.jpg';
import { getPosts } from '../utils/constants';
import { apiBaseUrl } from '../utils/constants';
import { Metadata } from 'next';
import button_arrow_right from "../../../public/button_arrow_right.svg";
import ArticleTagButton from "@/components/pages-components/blog/article-tag/article-tag";

const cx = classnames.bind(styles);


export async function generateMetadata (): Promise<Metadata> {

    return {
      title: ` Пошив и печать на одежде — статьи от PNHD>STUDIO для бизнеса и клиентов`,
      description: `PNHD>STUDIO — это блог о создании мерча. Отвечаем на важные вопросы о пошиве одежды и нанесении принтов: как выбрать ткань, технологию печати, рассчитать бюджет. Помогаем заказчикам принимать взвешенные решения.`,
      keywords: ['Печать на текстиле', "Мерч"],
    //   openGraph: {
    //     images: `${apiBaseUrl}${currItem?.image_url}`,
    //     type: 'website',
    //     url: `https://studio.pnhd.ru/shop/${params.slug}?id=${searchParams.id}`,
    //     description: currItem?.description,
    //     siteName: 'PINHEAD STUDIO',
    //     title: currItem?.name,
    //   }
    }
}


const Blog = async () => {
    let {posts} = await getPosts();
    posts = posts.sort((a,b) => (b.post_id - a.post_id))

    let postTags:Array<string> = [];
    let txtThumbToPost:Array<string> = [];
    if (posts && posts.length>0){
        for (let postIndex in posts){
            let post = posts[postIndex]
            let textContent = post.blog.__html
                .replace(/<[^>]*>/g, '')
                .slice(0, 110)
                .replace(/[,:;\s]$/s, '')+'...';
            txtThumbToPost[postIndex] = textContent
            if(!post['hashtags'] || post['hashtags'].length<1){
                continue;
            }
            for (let tag of post['hashtags']){
                postTags.push(tag)
            }
        }
    }

    const h1:string = 'Блог';

    let tagList = [
        'Пошив', 'печать', 'вышивка', 'бланк', 'мерч', 'маркетинг'
    ];

    return (
        <>
        { posts && posts.length > 0 &&
        <section className={cx('blogPage')}>
            <div className="breadcrumbs">
                <a className={'breadcrumb-item'} href="/">Главная</a>
                <span className={'breadcrumb-item'}>{h1}</span>
            </div>
            <h1 className={cx('blogPage__title')}>{h1}</h1>
            <div className={cx('articles-tag-list')}>
                {tagList.map((item, index) => (
                    <ArticleTagButton tag={item}/>
                ))}
            </div>
            <div className={cx('blogPage__posts')}>
                {posts.map((post, index) => (
                <Link href={`/blog/${post.slug}`} className={cx('blogPage__card')} key={post.post_id}>
                    <div className={cx('blogPage__card-wrapper')}>
                        <img src={post.cover} alt='Обложка поста' className={cx('blogPage__card-cover')}/>
                        <div className={cx('blogPage__card-title-wrapper')}>
                            <div className={cx('blogPage__card-subtext')}>
                                <div className={cx('blogPage__card-tag-list')}>
                                    <div className={cx('blogPage__card-tag')}>Пошив</div>
                                </div>
                                <div className={cx('blogPage__card-plain-text')}>{post.createdAt}</div>
                            </div>
                            <h2 className={cx('blogPage__card-title')}>{post.title}</h2>
                            <div className={cx('blogPage__card-txt')}>{txtThumbToPost[index]}</div>
                            {false && <div className={cx('blogPage__card-subtext')}>
                                <div className={cx('blogPage__hashtags-wrapper')}>
                                    {post.hashtags.map((tag, index) => (
                                        <div className={cx('blogPage__card-plain-text')} key={index}>{tag}</div>
                                    ))}
                                </div>
                                {/* <p className={cx('blogPage__card-plain-text')}>🖤 {post.likes}</p> */}
                            </div>}
                            <button type="button" className={cx('blogPage__card-more')}>
                                <Image src={button_arrow_right} alt="стрелка вправо"/>
                            </button>
                        </div>

                    </div>
                </Link>)
                )}
            </div>
        </section>
        }
        </>
    )
}

export default Blog;
