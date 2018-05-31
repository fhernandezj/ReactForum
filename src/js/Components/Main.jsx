import React from 'react';
import firebase from 'firebase'
import { Modal, Button } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  Switch
} from 'react-router-dom';


import {login} from './../helpers.jsx';
import {logout} from './../helpers.jsx';
import {auth} from './../helpers.jsx';
import {verify} from './../helpers.jsx';

import Profile from './Pages/Profile.jsx';
import Posts from './Pages/Posts.jsx';
import Post from './Pages/Post.jsx';
import Top from './Pages/Top.jsx';

class Main extends React.Component {
	constructor(){
		super();
		this.state = {  
			isAuthenticated: false,
			user: '',
			userRefId: '',
			showRegisterModal: false,
			showLoginModal: false,
			showPostModal: false,
			errorVis: 'none',
			emailLogin: '',
			pwdLogin: '',
			nameRegister: '',
			emailRegister: '',
			pwdRegister: '',
			pwdConfirm: '',
			postTitle: '',
			postDescr: ''
		}
		
		this.login = this.login.bind(this);
		this.verifyUser = this.verifyUser.bind(this);
		this.register = this.register.bind(this);
		this.logout = this.logout.bind(this);
		this.sendPost = this.sendPost.bind(this);
		this.handleChange = this.handleChange.bind(this);
		
		this.openRegisterModal = this.openRegisterModal.bind(this);
		this.closeRegisterModal = this.closeRegisterModal.bind(this);
		this.openLoginModal = this.openLoginModal.bind(this);
		this.closeLoginModal = this.closeLoginModal.bind(this);
		this.openPostModal = this.openPostModal.bind(this);
		this.closePostModal = this.closePostModal.bind(this);

	}
	
	componentDidMount(){
		this.verifyUser();
	}
	
	verifyUser(){
		//To don't get problems with promises :(
		var self = this;
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
		  	//Save the current user
		    self.setState({isAuthenticated: true, user: user});
		    //Get the user reference in the Database
		    var ref = firebase.database().ref('users');
		    ref.orderByChild("email").equalTo(self.state.user.email).on("child_added", function(snapshot) {
		      self.setState({userRefId:snapshot.val()});
		      self.state.userRefId.key = snapshot.key;
		    });
		  } else {
		    self.setState({isAuthenticated: false});
		  }
		});
	}

	openPostModal() {
	  this.setState({showPostModal: true});
	}
	
	closePostModal() {
		this.setState({errorVis:'none'});
		this.setState({postTitle: '', postDescr: ''});
		this.setState({showPostModal: false});
	}
	
	openRegisterModal() {
	  this.setState({showRegisterModal: true});
	}
	
	closeRegisterModal() {
		this.setState({errorVis:'none'});
		this.setState({nameRegister: '', emailRegister: '', pwdRegister: '', pwdConfirm: ''});
		this.setState({showRegisterModal: false});
	}
	
	openLoginModal() {
	  this.setState({showLoginModal: true});
	}
	
	closeLoginModal() {
		this.setState({errorVis:'none'});
		this.setState({pwdLogin: '', emailLogin: ''});
		this.setState({showLoginModal: false});
	}
	
	login(){
		this.setState({errorVis:'none'});//Hide the error label
		var self = this;
		//Do login!
	    login(this.state.emailLogin,this.state.pwdLogin)
	    .then((user) => {
	      this.setState({isAuthenticated: true, user: user});//Authenticate the user in the app
	      //Get the user referernce in the database
	      var ref = firebase.database().ref('users');
	      ref.orderByChild("email").equalTo(this.state.user.email).on("child_added", function(snapshot) {
	        self.setState({userRefId:snapshot.val()});
	        self.state.userRefId.key = snapshot.key;
	      });
	      this.closeLoginModal();
	    })
	    .catch((error) => {
	      this.setState({message: error.message, errorVis:'inline'});
	    })
	}
	
	logout() {
		logout()
		.then(()=>{
			this.setState({isAuthenticated: false});
		})
	}
	
	//Get the current date in format dd/mm/yyyy
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
    
    register(){
    	//Get the current date
    	var today = this.currentDate();
    	this.setState({errorVis:'none'});//Hide the error label
    	//Verify that passwords match
    	if(this.state.pwdRegister != this.state.pwdConfirm){
    		this.setState({message:'Passwords don\'t match', errorVis:'inline'});
    		return false;
    	}
    	//Create the new user in the Authentication Module
    	auth(this.state.emailRegister, this.state.pwdRegister)
    	.then((user) => {
    		this.setState({isAuthenticated: true});//Authentc¿icate the user in the app
    		//Save the user data in the database
    		const usersRef = firebase.database().ref().child('users');
    		const newUser = {
    			email: this.state.emailRegister,
    			name: this.state.nameRegister,
    			date: today
    		}
    		usersRef.push(newUser);
    		this.closeRegisterModal();
    	})
    	.catch((error) => {
    		this.setState({message: error.message, errorVis:'inline'});
    	})
    }
	
	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
	
	sendPost(){
		console.log(this.state.userRefId);
		//Verify that all fields were filled
		if(this.state.postTitle=='' || this.state.postDescr==''){
			this.setState({message: 'Fill all fields!', errorVis:'inline'});
			return false;
		}
		var today = this.currentDate();//Get the current date
		//Save the post
		const postRef = firebase.database().ref().child('posts');
	    const newPost = {
	        title: this.state.postTitle,
	        description: this.state.postDescr,
	        date: today,
	        author: this.state.userRefId,
	        comments:0
	    }
	    postRef.push(newPost);
	    this.closePostModal();
	}
	
	render() {
		return (<main>
			<nav className="navbar navbar-inverse">
			  <div className="container-fluid">
			    <div className="navbar-header">
			      <a className="navbar-brand" href="/">Home</a>
			    </div>
			    <div className="collapse navbar-collapse" id="myNavbar">
			      {this.state.isAuthenticated===false ?
				      <ul className="nav navbar-nav navbar-right">
				        <li><a onClick={()=>this.openLoginModal()}><span className="glyphicon glyphicon-log-in"></span> Login</a></li>
				        <li><a onClick={()=>this.openRegisterModal()}><span className="glyphicon glyphicon-user"></span> Register</a></li>
				      </ul>
			      :
			      	<ul className="nav navbar-nav navbar-right">
			      		<li><a onClick={()=>this.openPostModal()}><span className="glyphicon glyphicon-pencil"></span> New Post</a></li>
				        <li><a href="/profile"><span className="glyphicon glyphicon-user"></span> Profile</a></li>
				        <li><a onClick={()=>this.logout()}><span className="glyphicon glyphicon-log-out"></span> Logout</a></li>
				      </ul>
			      }
			    </div>
			  </div>
			</nav>

			  <div>
		        <Modal className="modal-container" show={this.state.showLoginModal} onHide={this.closeLoginModal} animation={true} bsSize="small">
		          <Modal.Header closeButton>
		            <Modal.Title>Login into your account</Modal.Title>
		          </Modal.Header>
		          <Modal.Body>
					  <form>
						  <div className="form-group">
						    <label>Email:</label>
						    <input className="form-control" type="text" name="emailLogin" placeholder="Email" value={this.state.emailLogin} onChange={this.handleChange} />
						  </div>
						  <div className="form-group">
						    <label>Password:</label>
						    <input className="form-control" type="password" name="pwdLogin" placeholder="Password" value={this.state.pwdLogin} onChange={this.handleChange} />
						  </div>
						  <strong className="error-label" style={{display:this.state.errorVis}}>{this.state.message}</strong>
							<button type="button" className="loginmodal-submit" onClick={()=>this.login()} >Login</button>
					  </form>
		          </Modal.Body>       
		        </Modal> 
		      </div>
		      
		      
		      <div>
		        <Modal className="modal-container" show={this.state.showPostModal} onHide={this.closePostModal} animation={true} bsSize="small">
		          <Modal.Header closeButton>
		            <Modal.Title>Write a new post</Modal.Title>
		          </Modal.Header>
		          <Modal.Body>
					  <form>
						  <div className="form-group">
						    <label>Title:</label>
						    <input className="form-control" type="text" name="postTitle" placeholder="Title" value={this.state.postTitle} onChange={this.handleChange} />
						  </div>
						  <div className="form-group">
						    <label>Description:</label>
						    <textarea className="form-control" rows="5" maxLength="230" name="postDescr" placeholder="Description" value={this.state.postDescr} onChange={this.handleChange} />
						  </div>
						  <strong className="error-label" style={{display:this.state.errorVis}}>{this.state.message}</strong>
							<button type="button" className="loginmodal-submit" onClick={()=>this.sendPost()} >Send</button>
					  </form>
		          </Modal.Body>       
		        </Modal> 
		      </div>
		      

			<div>
		        <Modal className="modal-container" show={this.state.showRegisterModal} onHide={this.closeRegisterModal} animation={true} bsSize="small">
		          <Modal.Header closeButton>
		            <Modal.Title>Create a new account</Modal.Title>
		          </Modal.Header>
		          <Modal.Body>
					  <form>
					  	<div className="form-group">
						    <label>Name:</label>
						    <input className="form-control" type="text" name="nameRegister" placeholder="Name" value={this.state.nameRegister} onChange={this.handleChange} />
						  </div>
						  <div className="form-group">
						    <label>Email:</label>
						    <input className="form-control" type="text" name="emailRegister" placeholder="Email" value={this.state.emailRegister} onChange={this.handleChange} />
						  </div>
						  <div className="form-group">
						    <label>Password:</label>
						    <input className="form-control" type="password" name="pwdRegister" placeholder="Password" value={this.state.pwdRegister} onChange={this.handleChange} />
						  </div>
						  <div className="form-group">
						    <label>Confirm Password:</label>
						    <input className="form-control" type="password" name="pwdConfirm" placeholder="Confirm password" value={this.state.pwdConfirm} onChange={this.handleChange} />
						  </div>
							<strong className="error-label" style={{display:this.state.errorVis}}>{this.state.message}</strong>
							<button type="button" className="loginmodal-submit" onClick={()=>this.register()} >Sign up</button>
					  </form>
		          </Modal.Body>       
		        </Modal> 
		      </div>
						
			<section className="container-fluid">
			  <div className="row content">
			  
		      <div className="col-sm-9">
		    	<Router>
		    		<div>
			        	<Route path='/profile' component={Profile}/>
			        	<Route path='/post' component={Post}/>
			        	<Route exact path='/' component={Posts}/>
			    	</div>
			    </Router>
		      </div>
		      
			  <aside className="col-sm-3 sidenav">
				<Top />
			  </aside>
			    
			  </div>
			</section>
			
			<footer className="container-fluid">
			  <p>Footer Text</p>
			</footer>
		
		</main>);
	}
}

export default Main;
