import React from 'react';
import firebase from 'firebase';


class Top extends React.Component {
    constructor(){
        super();
        this.state = {
            posts : [],
            comments: []
        }
        this.getPosts = this.getPosts.bind(this);
        this.getComments = this.getComments.bind(this);
        this.srt = this.srt.bind(this);
        this.keysrt = this.keysrt.bind(this);
    }
    
    componentDidMount(){
        this.getPosts();
        this.getComments();
    }
    
    getPosts(){
        var self = this;
        var ref = firebase.database().ref("posts");
        ref.orderByChild("comments").limitToFirst(10).on("child_added", function(snapshot) {
          var post = snapshot.val();
          post.id = snapshot.key;
          var temp = [];
          temp.push(post);
          if(self.state.posts.length<10){
              self.setState({posts: temp.concat(self.state.posts)});
                self.setState({posts: self.state.posts.sort(self.keysrt('comments'))});
          }
        });
    }
    
    getComments(){
        var self = this;
        var ref = firebase.database().ref("comments");
        ref.orderByKey().limitToLast(10).on("child_added", function(snapshot) {
          var com = snapshot.val();
          com.id = snapshot.key;
          var temp = [];
          temp.push(com);
          if(self.state.comments.length<10){
              self.setState({comments: temp.concat(self.state.comments)});
          }
        });
    }
    
    // sort on values
    srt(desc) {
      return function(a,b){
       return desc ? ~~(a > b) : ~~(a < b);
      };
    }
    
    // sort on key values
    keysrt(key,desc) {
      return function(a,b){
       return desc ? ~~(a[key] > b[key]) : ~~(a[key] < b[key]);
      }
    }
    
	render() {
		return (
		    <div>
		        <h4>Top 10 most commented Posts</h4>
		        <div className="list-group">
                    <div className="list-group">
                    
                        {this.state.posts.map((post) => {
            	            return (
            			        <a key={post.id} href={'/post?post=' + post.id} className="list-group-item">{post.title + ' '}<span className="label label-primary">{post.comments}</span></a>
            	            )
            	          })}
                    </div>
                </div>
                <h4>Top 10 most recent Comments</h4>
		        <div className="list-group">
                    <div className="list-group">
                    
                        {this.state.comments.map((comment) => {
            	            return (
            			        <a key={comment.id} href={'/post?post=' + comment.post} className="list-group-item">{comment.description + ' '}<span className="label label-primary">{comment.date}</span></a>
            	            )
            	          })}
                    </div>
                </div>
		    </div>
		    );
	}
}

export default Top;

