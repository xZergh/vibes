document.addEventListener('DOMContentLoaded', function() {
    // Get the post slug from the data attribute
    const postSlug = document.body.getAttribute('data-post-slug');
    if (!postSlug) {
        console.error('No post slug found');
        return;
    }

    // Elements
    const commentsContainer = document.getElementById('comments-container');
    const commentForm = document.getElementById('comment-form');
    const loginPrompt = document.getElementById('login-prompt');
    
    // API base URL - ensure this points to your backend server
    const API_BASE_URL = 'http://localhost:3000'; // Update this to match your backend URL
    
    // Check if user is logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            // User is logged in, show comment form
            commentForm.classList.remove('hidden');
            loginPrompt.classList.add('hidden');
            
            // Add event listener to the form
            commentForm.addEventListener('submit', submitComment);
        } else {
            // User is not logged in, show login prompt
            commentForm.classList.add('hidden');
            loginPrompt.classList.remove('hidden');
        }
    }
    
    // Fetch comments for the current post
    async function fetchComments() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/${postSlug}`);
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            commentsContainer.innerHTML = '<p>Failed to load comments. Please try again later.</p>';
        }
    }
    
    // Display comments in the container
    function displayComments(comments) {
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            return;
        }
        
        const commentsList = document.createElement('ul');
        commentsList.className = 'comments-list';
        
        comments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.className = 'comment';
            
            const commentHeader = document.createElement('div');
            commentHeader.className = 'comment-header';
            
            const username = document.createElement('span');
            username.className = 'comment-username';
            username.textContent = comment.username;
            
            const date = document.createElement('span');
            date.className = 'comment-date';
            date.textContent = new Date(comment.created_at).toLocaleDateString();
            
            const commentContent = document.createElement('div');
            commentContent.className = 'comment-content';
            commentContent.textContent = comment.content;
            
            // Add delete button if user is the author
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.username === comment.username) {
                        const deleteButton = document.createElement('button');
                        deleteButton.className = 'delete-comment';
                        deleteButton.textContent = 'Delete';
                        deleteButton.dataset.commentId = comment.id;
                        deleteButton.addEventListener('click', deleteComment);
                        commentHeader.appendChild(deleteButton);
                    }
                } catch (e) {
                    console.error('Error parsing token:', e);
                }
            }
            
            commentHeader.appendChild(username);
            commentHeader.appendChild(date);
            commentItem.appendChild(commentHeader);
            commentItem.appendChild(commentContent);
            commentsList.appendChild(commentItem);
        });
        
        commentsContainer.innerHTML = '';
        commentsContainer.appendChild(commentsList);
    }
    
    // Submit a new comment
    async function submitComment(event) {
        event.preventDefault();
        
        const contentTextarea = document.getElementById('comment-content');
        const content = contentTextarea.value.trim();
        
        if (!content) {
            alert('Please enter a comment');
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to comment');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    post_slug: postSlug,
                    content: content
                })
            });
            
            // Check for HTML response (error case)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Received HTML response instead of JSON. Check server configuration.');
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to post comment');
            }
            
            // Clear the form
            contentTextarea.value = '';
            
            // Show success message - updated to remove mention of approval
            alert('Comment submitted successfully!');
            
            // Refresh comments
            fetchComments();
        } catch (error) {
            console.error('Error posting comment:', error);
            alert(`Error: ${error.message}`);
        }
    }
    
    // Delete a comment
    async function deleteComment(event) {
        const commentId = event.target.dataset.commentId;
        if (!commentId) return;
        
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to delete comments');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Check for HTML response (error case)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Received HTML response instead of JSON. Check server configuration.');
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete comment');
            }
            
            // Refresh comments
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert(`Error: ${error.message}`);
        }
    }
    
    // Initialize
    checkAuthStatus();
    fetchComments();
    
    // Listen for auth changes
    window.addEventListener('auth-changed', checkAuthStatus);
});
