import React from 'react';
import firebase from 'firebase'
import MetaTags from 'react-meta-tags';

class Post extends React.Component {
    
    constructor(){
        super();
        this.state = {
            postExist : false,
            isAuthenticated: false,
            isAuthor: false,
            user: '',
            id : '',
            author : '',
            title: '',
            description : '',
            date: '',
            commentText: '',
            comments: [],
            commentsCount: 0
        }
        this.getPostKey = this.getPostKey.bind(this);
        this.getPostInfo = this.getPostInfo.bind(this);
        this.verify = this.verify.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.currentDate = this.currentDate.bind(this);
        this.sendComment = this.sendComment.bind(this);
        this.deletePost = this.deletePost.bind(this);
    }
    
    handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
    
    componentDidMount(){
        this.getPostKey();
    }
    
    currentDate(){
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();
		if(dd<10) {
		    dd = '0'+dd
		}
		if(mm<10) {
		    mm = '0'+mm
		}
		today = dd + '/' + mm + '/' + yyyy;
		return today;
	}
    
    getPostKey(){
       var key = window.location.href.split('post=')[1];
       if(key){
           this.getPostInfo(key);
       }
    }
    
    getPostInfo(key){
        var self = this;
	    var ref = firebase.database().ref('/posts/' + key)
        .once('value')
        .then(function(snapshot) {
          if(!snapshot.val()){
              return;
          }
          self.setState({
            postExist: true,
            author: snapshot.val().author, 
            date: snapshot.val().date, 
            id:snapshot.key, 
            title: snapshot.val().title, 
            description : snapshot.val().description
          });
          self.verify();
          var ref = firebase.database().ref("comments");
            ref.orderByChild("post").equalTo(self.state.id).on("child_added", function(snapshot) {
              self.setState({comments: self.state.comments.concat(snapshot.val())});
              self.setState({commentsCount: self.state.commentsCount+1});
            });
        });
    }
    
    verify(){
		var self = this;
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
		    self.setState({isAuthenticated: true});
		    if(user.email == self.state.author.email){
		        self.setState({isAuthor: true});
		    }
		    self.getUserInfo(user.email);
		    
		  }
		});
	}
	
	getUserInfo(email){
	    var self = this;
        var ref = firebase.database().ref('users');
        ref.orderByChild("email").equalTo(email).on("child_added", function(snapshot) {
          self.setState({user: snapshot.val()});
          self.state.user.id = snapshot.key;
        });
	}
	
	sendComment(){
	    if(this.state.commentText==''){
	        alert("You must write a comment");
	        return;
	    }
	    var today = this.currentDate();
	    const commentsRef = firebase.database().ref().child('comments');
		const newComment = {
		    post: this.state.id,
			author: this.state.user,
            description: this.state.commentText,
            date : today,
		}
		commentsRef.push(newComment);
		firebase.database().ref().child('/posts/' + this.state.id)
            .update({ comments: this.state.commentsCount+1});
            
		this.setState({commentText:''});
		if(this.state.comments){
            this.setState({comments: this.state.comments.concat(newComment)});
        }else{
            this.setState({comments: this.state.comments.concat(newComment)});
        }
	}
	
	deletePost(){
	    var r = confirm("Do you want to delete this post?");
        if (r == true) {
            const postRef = firebase.database().ref().child('posts').child(this.state.id);
            postRef.remove();
            const comRef = firebase.database().ref("/comments")
            const comToDelete = comRef.orderByChild("post").equalTo(this.state.id)
            comToDelete.once("value", snapshot => {
                var updates = {};
                snapshot.forEach(function(child) {
                    updates['/comments/' + child.key] = null;
                });
                firebase.database().ref().update(updates);
                window.location.href = '/';
            });
        }
	}
    
	render() {
		return (
		    <div>
    		    <MetaTags>
    	            <title>{this.state.title}</title>
    	            <meta id="meta-description" name="description" content={this.state.description} />
                </MetaTags>
    		    {this.state.postExist===true ?
        		    <div key={this.state.id}>
        				<div className="row eachpost">
        					 <div className="media comment-box">
        			            <div className="media-left">
        			                <img src={this.state.author.avatar ? this.state.author.avatar : '/avatar.jpg'} className="img-circle" height="65" width="65" alt="Avatar"/>
        			            </div>
        			            <div className="media-body">
        			                <h4 className="media-heading">{this.state.title} {this.state.isAuthor===true ? <a onClick={()=>this.deletePost()} className="close" data-dismiss="alert" aria-label="close">&times;</a> : '' }<small>by <a href={'/profile?user=' + this.state.author.key}>{this.state.author.name}</a></small></h4>
        			                <p>{this.state.description}</p>
        			                <small>{this.state.date}</small>
        			                
        			                {this.state.comments.length>0 ?
            			                this.state.comments.map((comment) => {
                            	            return (
                            			        <div key={comment.id}>
                            			            <br></br>
                            			            <div className="media">
                                                        <div className="media-left">
                                                            <img src={comment.author.avatar ? comment.author.avatar : '/avatar.jpg'} className="img-circle" height="65" width="65" alt="Avatar"/>
                                                        </div>
                                                        <div className="media-body">
                                                            <h4 className="media-heading"><a href={'/profile?user=' + comment.author.id}>{comment.author.name}</a></h4>
                                                            <p>{comment.description}</p>
                                                            <small>{comment.date}</small>
                                                        </div>
                                                    </div>
                            					</div>
                            	            )
                            	          })
                        	          : 
                        	            ''
        			                }
        			                
        			                {this.state.isAuthenticated===true ?
            			                <div>
                			                <br/>
                                            Leave a comment
                                            <div className="media">
                                                <div className="media-left">
                					                <img src={this.state.user.avatar ? this.state.user.avatar : '/avatar.jpg'} className="img-circle" height="65" width="65" alt="Avatar"/>
                					            </div>
                                                <div className="media-body">
                                                    <textarea className="form-control" rows="3" maxLength="230" name="commentText" placeholder="Description" value={this.state.commentText} onChange={this.handleChange} />
                                                    <br/>
                                                    <button className="btn btn-success" onClick={()=>this.sendComment()} >Send</button>
                                                </div>
                                            </div>
                                        </div>
                                    :
                                        ''
        			                }
        			            </div>
        			        </div>
        				</div>
        			</div>
    		    :
    		    ''
    		    }
		    </div>
		    );
	}
}

export default Post;

