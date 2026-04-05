import React from 'react';
import { HeartIcon } from '../icons/HeartIcon';

export function CommentAvatar({ src, alt = 'User' }) {
  return (
    <div className="_comment_image">
      <a href="profile.html" className="_comment_image_link">
        <img src={src || "assets/images/txt_img.png"} alt={alt} className="_comment_img1" />
      </a>
    </div>
  );
}

export function CommentHeader({ name }) {
  return (
    <div className="_comment_details_top">
      <div className="_comment_name">
        <a href="#">
          <h4 className="_comment_name_title">{name || 'Unknown'}</h4>
        </a>
      </div>
    </div>
  );
}

export function CommentContent({ content }) {
  return (
    <div className="_comment_status">
      <p className="_comment_status_text">
        <span>{content || 'No content'}</span>
      </p>
    </div>
  );
}

export function CommentActions({ onLike, onReply, onShare, timestamp, isLiked }) {
  return (
    <div className="_comment_reply" style={{ minWidth: 250 }}>
      <div className="_comment_reply_num">
        <ul className="_comment_reply_list">
          <li><span onClick={onLike}>{isLiked ? 'Liked' : 'Like'}.</span></li>
          <li><span onClick={onReply}> Reply.</span></li>
          <li><span onClick={onShare}>Share</span></li>
          <li><span className="_time_link">.{timestamp || '1m'}</span></li>
        </ul>
      </div>
    </div>
  );
}

export function CommentReactions({ isLiked, likesCount }) {
  return (
    <div className="_total_reactions">
      <div className="_total_react">
        <span className={isLiked ? "_reaction_heart liked" : "_reaction_heart"}>
          {isLiked ? <HeartIcon filled /> : <HeartIcon />}
        </span>
      </div>
      <span className="_total">{likesCount}</span>
    </div>
  );
}

export function RepliesLink({ count, onClick, loading, showReplies }) {
  if (count <= 0) return null;
  
  return (
    <div className="_replies_link" style={{marginLeft: 25}}>
      <span onClick={onClick} className="_replies_text">
        {loading ? 'Loading...' : `${showReplies ? 'Hide' : 'Show'} ${count} ${count === 1 ? 'reply' : 'replies'}`}
      </span>
    </div>
  );
}

export function HideRepliesLink({ onClick }) {
  return (
    <div className="_hide_replies">
      <span onClick={onClick} className="_hide_replies_text">
        Hide replies
      </span>
    </div>
  );
}

export function LoadMoreReplies({ onClick }) {
  return (
    <div className="_load_more_replies">
      <span onClick={onClick} className="_load_more_text">
        Load more replies
      </span>
    </div>
  );
}
