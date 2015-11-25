import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';

import DeleteParamGroup from './delete-param-group.components.jsx';
import EditParamGroupPanel from './edit-param-group-panel.components.jsx';
import GlyphGrid from './glyph-grid.components.jsx';

export default class EditParamGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: [],
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/individualizeStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					currentGroup: head.toJS().currentGroup,
					groups: head.toJS().groups,
					preDelete: head.toJS().preDelete,
					editGroup: head.toJS().editGroup,
					glyphs: head.toJS().glyphs,
					grid: head.toJS().glyphGrid,
					tagSelected: head.toJS().tagSelected,
				});
			})
			.onDelete(() => {
				this.setState(undefined)
			});

		this.client.getStore('/tagStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					tags: head.toJS().tags,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}
	
	componentWillUnmount() {
		this.lifespan.release();
	}

	selectGroup(e) {
		this.client.dispatchAction('/select-indiv-group', e.target.value);
	}

	render() {
		const options = _.map(this.state.groups, (group) => {
				return <option value={group}>{group}</option>
		});

		const deletePanel = this.state.preDelete ?
			<DeleteParamGroup glyphs={this.state.glyphs} groupName={this.state.currentGroup}/> :
			false;

		const editPanel = this.state.editGroup ?
			<EditParamGroupPanel glyphs={this.state.glyphs} groupName={this.state.currentGroup}/> :
			false;

		const glyphGrid = this.state.grid ? (
			<GlyphGrid 
				tagSelected={this.state.tagSelected}
				selected={this.state.glyphs} 
				tags={this.state.tags}/> 
		) : false;

		return (
			<div className="edit-param-group">
				Editing	
				<select onChange={(e) => { this.selectGroup(e) }} value={this.state.currentGroup} className="edit-param-group-select">
					{options}
				</select>
				<span className="edit-param-group-button" onClick={() => {this.client.dispatchAction('/pre-delete', true)}}>DELETE</span>
				<span className="edit-param-group-button" onClick={() => {this.client.dispatchAction('/edit-param-group', true)}}>EDIT</span>
				{deletePanel}
				{editPanel}
				{glyphGrid}
			</div>
		)
	}
}
