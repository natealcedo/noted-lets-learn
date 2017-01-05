import React from 'react';
import ReactDom from 'react-dom';
import NoteCard from './notescard.js';

const config = {
	apiKey: 'AIzaSyCOgBc4Rp7qeEPXbkVAlVI9BgZk4S1o-UI',
	authDomain: 'noted-3ab56.firebaseapp.com',
	databaseURL: 'https://noted-3ab56.firebaseio.com',
	storageBucket: 'noted-3ab56.appspot.com',
	messagingSenderId: '596456101379'
};
firebase.initializeApp(config);

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			notes: [],
			loggedin: false
		};
		this.showSideBar = this.showSideBar.bind(this);
		this.addNote = this.addNote.bind(this);
		this.showCreate = this.showCreate.bind(this);
		this.createUser = this.createUser.bind(this);
		this.showLogin = this.showLogin.bind(this);
		this.loginUser = this.loginUser.bind(this);
		this.logoutUser = this.logoutUser.bind(this);
	}
	componentDidMount() {
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				firebase.database().ref(`user/${user.uid}/notes`).on('value', res => {
					const dataArray = [];
					const userData = res.val();
					for (let key in userData) {
						userData[key].key = key;
						dataArray.push(userData[key]);

					}
					this.setState({
						notes: dataArray,
						loggedin: true
					});
				});
			}
		});
	}
	showSideBar(e) {
		e.preventDefault();
		this.sidebar.classList.toggle('show');
	}
	addNote(e) {
		e.preventDefault();
		const note = {
			title: this.noteTitle.value,
			text: this.noteText.value
		};
		const uid = firebase.auth().currentUser.uid;
		const dbRef = firebase.database().ref(`user/${uid}/notes`);
		dbRef.push(note);

		this.noteTitle.value = '';
		this.noteText.value = '';
		this.sidebar.classList.toggle('show');
	}
	removeNote(noteId) {
		const uid = firebase.auth().currentUser.uid;
		firebase.database().ref(`user/${uid}/notes/${noteId}`).remove();
	}
	showCreate(e) {
		e.preventDefault();
		this.overlay.classList.toggle('show');
		this.createUserModal.classList.toggle('show');
	}
	createUser(e) {
		e.preventDefault();
		// Check passwords match
		const password = this.createPassword.value;
		const confirm = this.confirmPassword.value;
		const email = this.createEmail.value;
		if (password === confirm) {
			firebase.auth()
				.createUserWithEmailAndPassword(email, password)
				.then(res => this.showCreate(e))
				.catch(err => alert(err.message));
		} else {
			alert('Passwords must match!');
		}
	}
	showLogin(e) {
		e.preventDefault();
		this.overlay.classList.toggle('show');
		this.loginModal.classList.toggle('show');
	}
	loginUser(e) {
		e.preventDefault();
		const email = this.userEmail.value;
		const password = this.userPassword.value;

		firebase.auth()
			.signInWithEmailAndPassword(email, password)
			.catch(err => alert(err.message))
			.then(res => this.showLogin(e));

	}
	logoutUser(e) {
		e.preventDefault();
		firebase.auth().signOut();
		this.setState({
			notes: [],
			loggedin: false
		});
	}
	renderCards() {
		if (this.state.loggedin) {
			return this.state.notes.map((note, i) => {
				return (
					<NoteCard note={note} key={`note-${i}`} removeNote={this.removeNote} />
				);
			}).reverse();
		} else {
			return (<h2>Login to add notes!</h2>);
		}
 
	}
	render() {

		return (
			<div>
				<header className="mainHeader">
					<h1>Noted</h1>
					{
						(() => {
							if (!this.state.loggedin) {
								return (
									<nav>
										<a href="" onClick={this.showCreate}>Create Account</a>
										<a href="" onClick={this.showLogin}>Login</a>
									</nav>
								);
							} else {
								const email = firebase.auth().currentUser.providerData[0].email;
								return (
									<nav>
										<span>{email}</span>
										<a href="" onClick={this.showSideBar}>Add New note</a>
										<a href="" onClick={this.logoutUser}>Logout</a>
									</nav>
								);
							}
						})()

					}
				</header>
				<div className="overlay" ref={ref => this.overlay = ref}></div>
				<section className="notes">
					{this.renderCards()}
				</section>

				<aside className="sidebar" ref={ref => this.sidebar = ref} >
					<form onSubmit={this.addNote}>
						<h3>Add New Note</h3>
						<div className="close-btn" onClick={this.showSideBar}>
							<i className="fa fa-times"></i>
						</div>
						<label htmlFor="note-title">Title:</label>
						<input type="text" name="note-title" ref={ref => this.noteTitle = ref} />
						<label htmlFor="note-text">Text:</label>
						<textarea name='note-text' ref={ref => this.noteText = ref}></textarea>
						<input type="submit" value='Add New Note' />
					</form>
				</aside>

				<div className="loginModal modal" ref={ref => this.loginModal = ref}>
					<div className="close" >
						<i className="fa fa-times" onClick={this.showLogin}></i>
					</div>
					<form action="" onSubmit={this.loginUser}>
						<div>
							<label htmlFor="email">Email:</label>
							<input type="text" name="email" ref={ref => this.userEmail = ref} />
						</div>
						<div>
							<label htmlFor="password">Password:</label>
							<input type="password" name="password" ref={ref => this.userPassword = ref} />
						</div>
						<div>
							<input type="submit" value="Login" />
						</div>
					</form>
				</div>

				<div className="createUserModal modal" ref={ref => this.createUserModal = ref}>
					<div className="close">
						<i className="fa fa-times" onClick={this.showCreate}></i>
					</div>
					<form action="" onSubmit={this.createUser}>
						<div>
							<label htmlFor="createEmail">Email:</label>
							<input type="text" name="createEmail" ref={ref => this.createEmail = ref} />
						</div>
						<div>
							<label htmlFor="password">Password:</label>
							<input type="password" name="createPassword" ref={ref => this.createPassword = ref} />
						</div>
						<div>
							<label htmlFor="confirmPassword">Confirm Password:</label>
							<input type="password" name="confirmPassword" ref={ref => this.confirmPassword = ref} />
						</div>
						<div>
							<input type="submit" value="Create" />
						</div>
					</form>
				</div>
			</div>
		);
	}
}

ReactDom.render(<App />, document.getElementById('app'));