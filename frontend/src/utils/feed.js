export function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function transformPost(post, postComments = [], postLikes = []) {
  return {
    id: post.id,
    author: {
      id: post.authorId || post.author?.id,
      name: post.author?.name || `${post.authorFirstName || ''} ${post.authorLastName || ''}`.trim(),
      avatar: 'assets/images/post_img.png',
    },
    timestamp: formatTimeAgo(post.createdAt),
    visibility: post.visibility,
    title: post.content || '',
    image: null,
    reactions: [],
    likesCount: post.likesCount || 0,
    isLiked: post.isLiked || false,
    likedBy: postLikes.map(u => ({
      id: u.user.id,
      name: `${u.user.firstName} ${u.user.lastName}`.trim()
    })),
    commentCount: post.commentsCount || 0,
    shareCount: 0,
    comments: postComments.map(c => ({
      id: c.id,
      postId: c.postId,
      author: {
        id: c.author.id,
        name: `${c.author.firstName} ${c.author.lastName}`.trim()
      },
      content: c.content,
      timestamp: formatTimeAgo(c.createdAt),
      likes: 0,
      isLiked: false,
      repliesCount: 0
    })),
  };
}

export function transformComment(comment) {
  let postId = null;
  if (comment.postId) {
    postId = comment.postId;
  } else if (comment.parentId) {
    if (comment.parent && typeof comment.parent === 'object' && comment.parent.postId) {
      postId = comment.parent.postId;
    }
  }
  
  return {
    id: comment.id,
    postId,
    parentId: comment.parentId || null,
    author: {
      name: comment.author?.name || 'User',
      avatar: comment.author?.avatar || 'assets/images/comment_img.png',
    },
    content: comment.content,
    likes: comment.likes || 0,
    isLiked: comment.isLiked || false,
    timestamp: comment.timestamp || '1m',
    repliesCount: comment.repliesCount || 0,
    replies: comment.replies || [],
  };
}

export function buildCurrentUser(user) {
  return user ? {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: 'assets/images/comment_img.png',
  } : null;
}
