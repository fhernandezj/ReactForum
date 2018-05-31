import React from 'react';
import firebase from 'firebase';
import MetaTags from 'react-meta-tags';

class Posts extends React.Component {
	
	constructor(){
		super();
		this.state = {
			posts: []
		}
		
		this.getPostList = this.getPostList.bind(this);
		this.openProfile = this.openProfile.bind(this);
	}
	
	componentDidMount(){
		this.getPostList();
	}
	
	openProfile(key){
		window.location.href='/profile?user=' + key;
	}
	
	getPostList(){
		const postsRef = firebase.database().ref().child('posts');
        postsRef.on('value', (snapshot) => {
            let posts = snapshot.val();
            let newState = [];
            for (let post in posts) {
                newState.push({
                    id: post,
                    title: posts[post].title,
                    description: posts[post].description,
                    date: posts[post].date,
                    author: posts[post].author,
                    comments: posts[post].comments
                });
            }
            this.setState({
                posts: newState
            });
        });
	}
	
	render() {
		return(
			<div>
			<MetaTags>
	            <title>CSBW Forum</title>
	            <meta id="meta-description" name="description" content="The most amazing forum ever" />
	            <meta id="meta-author" name="author" content="Francisco Hernandez" />
	            <meta id="meta-keywords" name="keywords" content="forum, uninorte, react, firebase" />
            </MetaTags>
			{this.state.posts.map((post) => {
	            return (
			        <div key={post.id}>
						<div className="row eachpost">
							 <div className="media comment-box">
					            <div className="media-left">
					                <img src={post.author.avatar ? post.author.avatar : '/avatar.jpg'} className="img-circle" height="65" width="65" alt="Avatar"/>
					            </div>
					            <div className="media-body">
					                <h4 className="media-heading"><a href={'/post?post=' + post.id}>{post.title}</a> <small>by <a href={'/profile?user=' + post.author.key}>{post.author.name}</a></small></h4>
					                <p>{post.description}</p>
					                <small>{post.date}</small>
					            </div>
					        </div>
						</div>
					</div>
	            )
	          })}
	          </div>
			);
	}
}

export default Posts;

