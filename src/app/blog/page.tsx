import React from 'react';
import styles from './page.module.scss';
import classnames from 'classnames/bind';
import Link from 'next/link';
import Image from 'next/image';
import testPic from '../../../public/changelog.jpg';
import { getPosts } from '../utils/constants';
import { apiBaseUrl } from '../utils/constants';
import { Metadata } from 'next';

const cx = classnames.bind(styles);


export async function generateMetadata (): Promise<Metadata> {

    return {
      title: `БЛОГ | ПИНХЭД СТУДИЯ`,
      description: `Блог про мерч и печать на текстиле`,
      keywords: ['Печать на текстиле', "Мерч"],
    //   openGraph: {
    //     images: `${apiBaseUrl}${currItem?.image_url}`,
    //     type: 'website',
    //     url: `https://studio.pnhd.ru/shop/${params.slug}?id=${searchParams.id}`,
    //     description: currItem?.description,
    //     siteName: 'ПИНХЭД СТУДИЯ',
    //     title: currItem?.name,
    //   }
    }
  }


const Blog = async () => {
    let { posts } = await getPosts();
    posts = posts.sort((a,b) => (b.post_id - a.post_id))
    return (
        <>
        { posts && posts.length > 0 &&
        <section className={cx('blogPage')}>
            <div className={cx('blogPage__title-wrapper')}>
                <h1 className={cx('blogPage__title')}>{'> '}BLOG</h1>
                <p className={cx('blogPage__title')}>{'>> '}</p>
            </div>
            <div className={cx('blogPage__posts')}>
                {posts.map((post) => (
                <Link href={`/blog/${post.slug}`} className={cx('blogPage__card')} key={post.post_id}>
                    <div className={cx('blogPage__card-wrapper')}>
                        <div className={cx('blogPage__card-image-wrapper')}>
                            <div className={cx('blogPage__card-cover-container')}>
                                <img src={post.cover} alt='Обложка поста' className={cx('blogPage__card-cover')}/>
                            </div>                            
                        </div>
                        <div className={cx('blogPage__card-title-wrapper')}>
                            <div className={cx('blogPage__card-subtext')}>
                                <p className={cx('blogPage__card-plain-text')}>00{post.post_id}</p>
                                <p className={cx('blogPage__card-plain-text')}>{post.createdAt}</p>
                            </div>                            
                            <h2 className={cx('blogPage__card-title')}>{post.title}</h2>
                            <div className={cx('blogPage__card-subtext')}>
                                <div className={cx('blogPage__hashtags-wrapper')}>
                                    {post.hashtags.map((tag, index) => (
                                        <p className={cx('blogPage__card-plain-text')} key={index}>{tag}</p>
                                    ))}
                                </div>
                                {/* <p className={cx('blogPage__card-plain-text')}>🖤 {post.likes}</p> */}
                            </div>     
                            
                        </div>

                    </div>
                </Link>))}
            </div>
        </section>
        }
        </>
    )
}

export default Blog;
