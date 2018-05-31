import React from 'react';
import firebase from 'firebase'

import {currentUser} from './../../helpers.jsx';

class Profile extends React.Component {
    
    constructor(){
        super();
        this.state = {  
			isAuthenticated: false,
			userExist: false,
			mail: '',
			name: '',
			photo: '',
			date: '',
			file: '',
			uid: '',
			userRefId: '',
			avatar: 'url("/avatar.jpg")',
			postCount: 0,
			comCount: 0
		}
		
		this.verify = this.verify.bind(this);
		this.getUserKey = this.getUserKey.bind(this);
		this.getUserInfoByKey = this.getUserInfoByKey.bind(this);
		this.uploadImage = this.uploadImage.bind(this);
		this.getFile = this.getFile.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
    }
    
    componentDidMount(){
        this.getUserKey();
    }
    
    getUserKey(){
       var key = window.location.href.split('user=')[1];
       if(key){
           this.getUserInfoByKey(key);
       }else{
           this.verify();
       }
    }
    
    verify(){
		var self = this;
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
		    self.setState({isAuthenticated: true, userExist: true, mail: user.email, uid: user.uid});
		    self.getUserInfo(user.email);
		  } else {
		    self.setState({isAuthenticated: false});
		  }
		});
	}
	
	getUserInfo(email){
	    var self = this;
        var ref = firebase.database().ref('users');
        ref.orderByChild("email").equalTo(email).on("child_added", function(snapshot) {
            
            self.setState({name: snapshot.val().name, date: snapshot.val().date, userRefId:snapshot.key});
            if(snapshot.val().avatar){
                self.setState({avatar: 'url(' + snapshot.val().avatar + ')'});
            }
            var ref = firebase.database().ref("posts");
            ref.orderByChild("author/key").equalTo(self.state.userRefId).on("child_added", function(snapshot) {
              self.setState({postCount: self.state.postCount+1});
            });
            var ref2 = firebase.database().ref("comments");
            ref2.orderByChild("author/id").equalTo(self.state.userRefId).on("child_added", function(snapshot) {
              self.setState({comCount: self.state.comCount+1});
            });
        });
	}
	
	getUserInfoByKey(key){
	    var self = this;
	    var ref = firebase.database().ref('/users/' + key)
        .once('value')
        .then(function(snapshot) {
          if(!snapshot.val()){
              return;
          }
          self.setState({name: snapshot.val().name, date: snapshot.val().date, userRefId:snapshot.key, userExist:true, mail: snapshot.val().email});
          if(snapshot.val().avatar){
              self.setState({avatar: 'url(' + snapshot.val().avatar + ')'});
          }
          var ref = firebase.database().ref("posts");
            ref.orderByChild("author/key").equalTo(self.state.userRefId).on("child_added", function(snapshot) {
              self.setState({postCount: self.state.postCount+1});
            });
            var ref2 = firebase.database().ref("comments");
            ref2.orderByChild("author/id").equalTo(self.state.userRefId).on("child_added", function(snapshot) {
              self.setState({comCount: self.state.comCount+1});
            });
          firebase.auth().onAuthStateChanged(function(user) {
    		  if (user) {
    		      if(user.email == self.state.mail){
    		          self.setState({isAuthenticated: true, mail: user.email, uid: user.uid});
    		      }
    		  }
    		});
        });
	}
	
	getFile() {
        var name = document.getElementById('imagePicker');
        this.state.file = name.files.item(0);
    }

    uploadImage() {
        var fileName = this.state.uid + ".jpg";
        var storageRef = firebase.storage().ref('/images/' + fileName);
        var uploadTask = storageRef.put(this.state.file);
        var self = this;

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on('state_changed', function(snapshot) {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded

        }, function(error) {
            // Handle unsuccessful uploads
            console.log(error);
        }, function() {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            var downloadURL = uploadTask.snapshot.downloadURL;
            self.setState({avatar: 'url(' + downloadURL + ')'});
            firebase.database().ref().child('/users/' + self.state.userRefId)
            .update({ avatar: downloadURL});
        });
    }
    
	render() {
		return (
		    <div className="container">
		    {this.state.userExist===true?
                <div className="row profile">
                    <div className="col-xs-12 col-sm-6 col-md-6">
                        <div className="well well-sm">
                            <div className="row">
                                <div className="col-sm-6 col-md-4">
                                    <div  className="ratio img-responsive img-circle" style={{backgroundImage: this.state.avatar}}></div>
                                </div>
                                <div className="col-sm-6 col-md-8">
                                    <h4>
                                        {this.state.name}</h4>
                                    <p>
                                        <i className="glyphicon glyphicon-envelope"></i>{this.state.mail}
                                        <br />
                                        <i className="glyphicon glyphicon-calendar"></i>Date of join: {this.state.date}</p>
                                        <span className=" badge badge-warning">{this.state.postCount} posts</span> <span className=" badge badge-info">{this.state.comCount} comments</span>
                                        <p></p>
                                        {this.state.isAuthenticated===true ?
                                            <form>
                                                <input type="file" id="imagePicker" accept="image/*" onChange={this.getFile}/>
                                                <button type="button" onClick={this.uploadImage}>Upload</button>
                                            </form>
                                        :
                                            ''
                                        }
                                </div>
                                
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

export default Profile;

