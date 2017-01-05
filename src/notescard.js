import React from 'react';

export default class extends React.Component {
	constructor() {
		super();
		this.state = {
			editing: false
		};
		this.save = this.save.bind(this);
	}
	save(e){
		e.preventDefault();	
		const uid = firebase.auth().currentUser.uid;
		firebase.database().ref(`user/${uid}/notes/${this.props.note.key}`).update({
			title: this.noteTile.value,
			text: this.noteText.value
		});
		this.setState({
			editing: false
		});
	}
	render() {
		let editingTemplate = (
			<span>
				<h4>{this.props.note.title}</h4>
				<p>{this.props.note.text}</p>
			</span>
		);
		if(this.state.editing){
			editingTemplate = (
				<form onSubmit={this.save}>
					<div>
						<input type="text" defaultValue={this.props.note.title} name='title' ref={ref=> this.noteTile = ref}/>
					</div>
					<div>
						<input type="text" defaultValue={this.props.note.text} name='text' ref={ref => this.noteText = ref}/>
					</div>
					<input type="submit" value="Done Editing!"/>
				</form>
			);
		}
		return (
			<div className="noteCard" >
				<i className="fa fa-edit" onClick={() => this.setState({ editing: true })}></i>
				<i className="fa fa-times" onClick={() => this.props.removeNote(this.props.note.key)}></i>
				{editingTemplate}
			</div>
		);
	}
}