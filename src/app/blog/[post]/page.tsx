import React from 'react';
import styles from './page.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import testPic from '../../../../public/changelog.jpg';
import { apiBaseUrl, getPosts } from '@/app/utils/constants';
const cx = classNames.bind(styles);
export const generateStaticParams = async () => {
    const { posts } = await getPosts();

    return posts.map((item) => { return { post: item.slug }})
}
export const dynamicParams = false;



const PostPage = async ({ params }: { params: { post: string }}) => {
    const { posts } = await getPosts();
    const post = posts.filter((post) => post.slug === params.post)[0];

    return (
        <>
        {post &&
        <section className={cx('postPage')}>
            <div className={cx('postPage__head')}>
                <div className={cx('postPage__head-block', 'postPage__head-block_left')}>
                    <div className="">
                        <p className={cx('postPage__post-info-text')}># 00{post.post_id}</p>
                        <h1 className={cx('postPage__post-title')}>{post.title}</h1>
                        <p className={cx('postPage__post-subtitle')}>{post.subtitle}</p>
                    </div>
                    <div className="">
                        <p className={cx('postPage__post-info-text')}>{'>> '}</p>
                        <p className={cx('postPage__post-info-text')}>{post.createdAt}</p>
                        <p className={cx('postPage__post-info-text')}>Автор: {post.author}</p>
                        {/* <p className={cx('postPage__post-info-text')}>🖤 {post.likes}</p> */}
                        <p className={cx('postPage__post-info-text')}>{post.hashtags}</p>
                    </div>
                </div>
                <div className={cx('postPage__head-block', 'postPage__head-block_right')}>
                    <div>
                        <img src={post.cover} alt='Обложка поста'/>
                    </div>
                </div>                
            </div>

            <div className={cx('postPage__main-text-block')} dangerouslySetInnerHTML={post.blog}>
            </div>
        </section>
        }
        </>
    )
}

export default PostPage;