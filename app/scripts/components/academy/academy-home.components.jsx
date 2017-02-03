import React from 'react';
import {Link} from 'react-router';
import ReactMarkdown from 'react-markdown';
import TutorialContent from 'tutorial-content';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';


export default class AcademyHome extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			academyProgress: {},
		};
		this.tutorials = new TutorialContent();
		this.courses = [];
		this.getPartsDone = this.getPartsDone.bind(this);
	}
	componentWillMount() {
		let academyProgress = {};

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
				this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				academyProgress = head.toJS().d.infos.academyProgress || {};
				this.setState({
					academyProgress: head.toJS().d.infos.academyProgress || {},
				});
			});
		// Map through the course to :
		// Get title, header and slug
		// Get part count from progress or init the progress
		this.tutorials.content.map((tutorial) => {
			let partCount = 0;

			if (academyProgress[tutorial.slug]) {
				partCount = academyProgress[tutorial.slug].partCount;
			}
			else {
				partCount = tutorial.content.split("## ").length - 1;
				this.client.dispatchAction(
					'/create-course-progress',
					{
						course: tutorial.slug,
						partCount,
					}
				);
				academyProgress[tutorial.slug] = {
					parts: [],
					partCount,
					rewarded: false,
				};
				this.setState({academyProgress});
			}
			this.courses.push({
				title: tutorial.title,
				header: tutorial.header,
				slug: tutorial.slug,
				partCount,
			});
		});
	}
	getPartsDone(slug) {
		return this.state.academyProgress[slug].parts.length;
	}
	render() {
		let partsDone = false;

		return (
			<div className="academy-base academy-home">
				<h1>Hi there !</h1>

				<p>
					Welcome to the academy. <br/>
					Texte d'intro qui montre à quel point l'academy est cool, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</p>

				<p>
					<center>
						Just getting started with prototypo ?
						<Link className="academy-button inline" to={`/academy/course/${this.courses[0].slug}`} >Take our intro course</Link>
					</center>
				</p>

				<h1>Course list</h1>

			{
					this.courses.map((tutorial) => {
						partsDone = this.getPartsDone(tutorial.slug);
						return (
							<div key={tutorial.title} className="academy-course-list">
								<Link to={`/academy/course/${tutorial.slug}`}><h2>{tutorial.title}</h2></Link>
								<ReactMarkdown source={tutorial.header} />
								<Link className="academy-button academy-validation-button" to={`/academy/course/${tutorial.slug}`} >➝</Link>
								<div className="academy-button academy-part-count">
									{
										partsDone === tutorial.partCount ? '✓' : `${partsDone}/${tutorial.partCount}`
									}
								</div>
							</div>
						);
					})
				}
			</div>
		);
	}
}
