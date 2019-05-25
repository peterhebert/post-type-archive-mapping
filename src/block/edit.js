/**
 * External dependencies
 */
import moment from 'moment';
import classnames from 'classnames';
import axios from 'axios';
var HtmlToReactParser = require('html-to-react').Parser;

const { Component, Fragment } = wp.element;

const { __ } = wp.i18n;

const { decodeEntities } = wp.htmlEntities;

const {
	PanelBody,
	Placeholder,
	QueryControls,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl,
	Toolbar,
} = wp.components;

const {
	InspectorControls,
	BlockAlignmentToolbar,
	BlockControls,
} = wp.editor;


const MAX_POSTS_COLUMNS = 6;

class PTAM_Custom_Posts extends Component {
	constructor() {
		super( ...arguments );

		this.toggleDisplayPostDate = this.toggleDisplayPostDate.bind( this );
		this.toggleDisplayPostExcerpt = this.toggleDisplayPostExcerpt.bind( this );
		this.toggleDisplayPostAuthor = this.toggleDisplayPostAuthor.bind( this );
		this.toggleDisplayPostImage = this.toggleDisplayPostImage.bind( this );
		this.toggleDisplayPostLink = this.toggleDisplayPostLink.bind( this );
		this.toggleDisplayPagination = this.toggleDisplayPagination.bind(this);
		this.get_latest_data = this.get_latest_data.bind(this);
		this.get_latest_posts = this.get_latest_posts.bind(this);
		this.get_term_list = this.get_term_list.bind(this);

		this.state = {
			loading: true,
			postType: 'post',
			taxonomy: 'category',
			term: 0,
			latestPosts: [],
			postTypeList: [],
			taxonomyList: [],
			termsList: [],
			imageSizes: [],
			userTaxonomies: [],
			userTerms: [],
			imageLocation: this.props.attributes.imageLocation
		};

		this.get_latest_data();
	}

	get_latest_posts ( object = {} ) {
		this.setState( { 'loading': true } );
		const props = jQuery.extend({}, this.props.attributes, object);
		const { postType, order, orderBy, taxonomy, avatarSize, imageType, imageTypeSize,term, postsToShow, imageCrop } = props;
		axios.get(ptam_globals.rest_url + `ptam/v1/get_posts/${postType}/${order}/${orderBy}/${taxonomy}/${term}/${postsToShow}/${imageCrop}/${avatarSize}/${imageType}/${imageTypeSize}`).then( ( response ) => {
			// Now Set State
			this.setState( {
				loading: false,
				latestPosts: response.data.posts,
				imageSizes: response.data.image_sizes,
				userTaxonomies: response.data.taxonomies,
				userTerms: response.data.terms
			} );
		} );
	}

	get_term_list( object = {} ) {
		let termsList = [];
		const props = jQuery.extend({}, this.props.attributes, object);
		const { postType, taxonomy } = props;
		axios.get( ptam_globals.rest_url + `ptam/v1/get_terms/${taxonomy}/${postType}` ).then( ( response ) => {
			if( Object.keys(response.data).length > 0 ) {
				termsList.push( { 'value': 0, 'label': __('All',  'post-type-archive-mapping') } );
				$.each( response.data, function( key, value ) {
					termsList.push( { 'value': value.term_id, 'label': value.name } );
				} );
			}
			this.setState( {
				'loading': false,
				'termsList': termsList,
			} );
		} );
	}

	get_latest_data( object = {} ) {
		this.setState( { 'loading': true } );
		let latestPosts = [];
		let imageSizes = [];
		let postTypeList = [];
		let taxonomyList = [];
		let termsList = [];
		let userTaxonomies = [];
		let userTerms = [];
		const props = jQuery.extend({}, this.props.attributes, object);
		const { postType, order, orderBy, avatarSize,imageType,imageTypeSize,taxonomy, term, postsToShow, imageCrop } = props;

		// Get Latest Posts and Chain Promises
		axios.get(ptam_globals.rest_url + `ptam/v1/get_posts/${postType}/${order}/${orderBy}/${taxonomy}/${term}/${postsToShow}/${imageCrop}/${avatarSize}/${imageType}/${imageTypeSize}`).then( ( response ) => {
				latestPosts = response.data.posts;
				imageSizes = response.data.image_sizes;
				userTaxonomies = response.data.taxonomies;

				// Get Post Types
				axios.get(ptam_globals.rest_url + 'wp/v2/types').then( ( response ) => {
					$.each( response.data, function( key, value ) {
						if( 'attachment' != key && 'wp_block' != key ) {
							postTypeList.push( { 'value': key, 'label': value.name } );
						}
					} );

					// Get Terms
					axios.get(ptam_globals.rest_url + `ptam/v1/get_terms/${taxonomy}/${postType}` ).then( ( response ) => {
						if( Object.keys(response.data).length > 0 ) {
							termsList.push( { 'value': 0, 'label': __('All',  'post-type-archive-mapping') } );
							$.each( response.data, function( key, value ) {
								termsList.push( { 'value': value.term_id, 'label': value.name } );
							} );
						}

						// Get Taxonomies
						axios.get(ptam_globals.rest_url + `ptam/v1/get_taxonomies/${postType}`).then( ( response ) => {
							if( Object.keys(response.data).length > 0 ) {
								taxonomyList.push( { 'value': 'none', 'label': __('Select a Taxonomy',  'post-type-archive-mapping') } );
								$.each( response.data, function( key, value ) {
									taxonomyList.push( { 'value': key, 'label': value.label } );
								} );
							}

							// Now Set State
							this.setState( {
								'loading': false,
								'imageSizes': imageSizes,
								'latestPosts': latestPosts,
								'postTypeList': postTypeList,
								'taxonomyList': taxonomyList,
								'termsList': termsList,
								'userTaxonomies': userTaxonomies,
								'userTerms': userTerms,
							} );
						});

					});
				} );
			});
	}

	toggleDisplayPostDate() {
		const { displayPostDate } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostDate: ! displayPostDate } );
	}

	toggleDisplayPostExcerpt() {
		const { displayPostExcerpt } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostExcerpt: ! displayPostExcerpt } );
	}

	toggleDisplayPostAuthor() {
		const { displayPostAuthor } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostAuthor: ! displayPostAuthor } );
	}

	toggleDisplayPostImage() {
		const { displayPostImage } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostImage: ! displayPostImage } );
	}

	toggleDisplayPostLink() {
		const { displayPostLink } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostLink: ! displayPostLink } );
	}

	toggleDisplayPagination() {
		const { pagination } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { pagination: ! pagination } );
	}

	toggleCapitilization = () => {
		const { changeCapitilization } = this.props.attributes;
		const { setAttributes } = this.props;
		setAttributes( { changeCapitilization: ! changeCapitilization } );
	}

	toggleTaxonomyDisplay = () => {
		const { displayTaxonomies } = this.props.attributes;
		const { setAttributes } = this.props;
		setAttributes( { displayTaxonomies: ! displayTaxonomies } );
	}

	trimWords = ( value ) => {
		const { setAttributes } = this.props;
		setAttributes( { trimWords: value } );
	}

	customizeReadMoreText() {
		const { readMoreText } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { readMoreText: ! readMoreText } );
	}

	onChangeLocation = (value) => {
		this.setState( {
			imageLocation: value
		});
	}

	onImageTypeChange = ( imageType ) => {
		this.setState( {
			loading: true
		} );

		let latestPosts = [];
		let imageSizes = [];

		const { postType, order, orderBy, taxonomy, term, terms, imageTypeSize, avatarSize,postsToShow, imageCrop } = this.props.attributes;

		// Get Latest Posts and Chain Promises
		axios.get(ptam_globals.rest_url + `ptam/v1/get_images/${postType}/${order}/${orderBy}/${taxonomy}/${term}/${postsToShow}/${imageCrop}/${avatarSize}/${imageType}/${imageTypeSize}`).then( ( response ) => {
				latestPosts = response.data.posts;
				imageSizes = response.data.image_sizes;
				this.setState( {
					loading: false,
					latestPosts: latestPosts,
					imageSizes: imageSizes,
				} );

		} );

	}

	onImageSizeChange = ( value ) => {
		this.setState( {
			loading: true
		} );

		let latestPosts = [];
		let imageSizes = [];

		const { postType, order, orderBy, taxonomy, term, avatarSize,postsToShow, imageCrop } = this.props.attributes;

		// Get Latest Posts and Chain Promises
		axios.get(ptam_globals.rest_url + `ptam/v1/get_images/${postType}/${order}/${orderBy}/${taxonomy}/${term}/${postsToShow}/${imageCrop}/${avatarSize}/regular/${value}`).then( ( response ) => {
			latestPosts = response.data.posts;
			imageSizes = response.data.image_sizes;
			this.setState( {
				loading: false,
				latestPosts: latestPosts,
				imageSizes: imageSizes,
			} );

		} );

	}

	excerptParse = ( excerpt ) => {
		let htmlToReactParser = new HtmlToReactParser();
		const { trimWords } = this.props.attributes;

		excerpt = excerpt.split(' ').slice(0, trimWords);
		excerpt = excerpt.join(' ');

		return htmlToReactParser.parse(excerpt);
	}

	onAvatarSizeChange = ( value ) => {
		let classRef = this;
		this.setState( {
			loading: true
		} );
		setTimeout(function(){
			let latestPosts = [];
			let imageSizes = [];

			const { postType, order, orderBy, taxonomy, term, postsToShow, imageCrop, imageTypeSize, imageType } = classRef.props.attributes;

			// Get Latest Posts and Chain Promises
			axios.get(ptam_globals.rest_url + `ptam/v1/get_images/${postType}/${order}/${orderBy}/${taxonomy}/${term}/${postsToShow}/${imageCrop}/${value}/${imageType}/${imageTypeSize}`).then( ( response ) => {
				latestPosts = response.data.posts;
				imageSizes = response.data.image_sizes;
				classRef.setState( {
					loading: false,
					latestPosts: latestPosts,
					imageSizes: imageSizes,
				} );

			} );
		}, 3000);
	}

	render() {
		let htmlToReactParser = new HtmlToReactParser();
		const { attributes, setAttributes } = this.props;
		const { postType, term, taxonomy, displayPostDate, displayPostExcerpt, displayPostAuthor, displayPostImage,displayPostLink, align, postLayout, columns, order, pagination, orderBy, postsToShow, readMoreText, imageLocation, imageType, imageTypeSize, avatarSize, changeCapitilization, displayTaxonomies, trimWords } = attributes;

		let userTaxonomies = this.state.userTaxonomies;
		let userTaxonomiesArray = [];
		for (var key in userTaxonomies) {
			userTaxonomiesArray.push({value: key, label: userTaxonomies[key].label});
		};
		let latestPosts = this.state.latestPosts;

		// Thumbnail options
		const imageLocationOptions = [
			{ value: 'regular', label: __('Regular placement', 'post-type-archive-mapping' ) },
			{ value: 'below_title', label: __('Image Below Title', 'post-type-archive-mapping' ) },
			{ value: 'below_title_and_meta', label: __('Below title and post meta', 'post-type-archive-mapping' ) },
			{ value: 'bottom', label: __('Image on bottom', 'post-type-archive-mapping' ) }
		];
		let imageSizeOptions = [];
		let imageSizes = this.state.imageSizes;
		for ( var key in imageSizes ) {
			imageSizeOptions.push( { value: key, label: key })
		}

		let imageDisplayOptionsTypes = [];
		imageDisplayOptionsTypes.push( { label: __('Gravatar', 'post-type-archive-mapping' ), value: 'gravatar' } );
		imageDisplayOptionsTypes.push( { label: __('Featured Image', 'post-type-archive-mapping' ), value: 'regular' } );

		const capitilization = changeCapitilization ? "ptam-text-lower-case" : '';

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Custom Posts Settings', 'post-type-archive-mapping' ) }>

					<SelectControl
							label={ __( 'Post Type', 'post-type-archive-mapping' ) }
							options={ this.state.postTypeList }
							value={ postType }
							onChange={ ( value ) => { this.props.setAttributes( { postType: value, taxonomy: 'none', term: 0 } ); this.get_latest_data({ postType: value, taxonomy: 'none', term: 0 }); } }
					/>
					<SelectControl
							label={ __( 'Taxonomy',  'post-type-archive-mapping' ) }
							options={ this.state.taxonomyList }
							value={ taxonomy }
							onChange={ ( value ) => { this.props.setAttributes( { taxonomy: value } ); this.get_term_list( { taxonomy: value } ); this.get_latest_posts({ taxonomy: value }); } }
					/>
					<SelectControl
							label={ __( 'Terms',  'post-type-archive-mapping' ) }
							options={ this.state.termsList }
							value={ term }
							onChange={ ( value ) => { this.props.setAttributes( { term: value } ); this.get_latest_posts({ term: value }); } }
					/>
					<QueryControls
						{ ...{ order, orderBy } }
						numberOfItems={ postsToShow }
						onOrderChange={ ( value ) => { this.props.setAttributes( { order: value } ); this.get_latest_posts({order: value }); } }
						onOrderByChange={ ( value ) => { this.props.setAttributes( { orderBy: value } ); this.get_latest_posts({orderBy: value }); } }
						onNumberOfItemsChange={ ( value ) => { this.props.setAttributes( { postsToShow: value } ); this.get_latest_posts({ postsToShow: value } ); } }
					/>
					{ postLayout === 'grid' &&
						<RangeControl
							label={ __( 'Columns',  'post-type-archive-mapping' ) }
							value={ columns }
							onChange={ ( value ) => this.props.setAttributes( { columns: value } ) }
							min={ 2 }
							max={ ! hasPosts ? MAX_POSTS_COLUMNS : Math.min( MAX_POSTS_COLUMNS, latestPosts.length ) }
						/>
					}
					<ToggleControl
						label={ __( 'Display Featured Image',  'post-type-archive-mapping' ) }
						checked={ displayPostImage }
						onChange={ this.toggleDisplayPostImage }
					/>
					{ displayPostImage &&
						<Fragment>
							<SelectControl
								label={ __( 'Image Type',  'post-type-archive-mapping' ) }
								options={ imageDisplayOptionsTypes}
								value={ imageType }
								onChange={ ( value ) => { this.props.setAttributes( { imageType: value } ); this.onImageTypeChange( value ); } }
							/>
							{ 'gravatar' === imageType ?
								<div>
									<RangeControl
										label={ __( 'Avatar Size',  'post-type-archive-mapping' ) }
										value={ avatarSize }
										onChange={ ( value ) => { this.props.setAttributes( { avatarSize: value } ); this.onAvatarSizeChange( value ); } }
										min={ 16 }
										max={ 512 }
									/>
								</div>
								: ''
							}
							{ 'regular' === imageType ?
								<SelectControl
									label={ __( 'Featured Image Size',  'post-type-archive-mapping' ) }
									options={ imageSizeOptions }
									value={ imageTypeSize }
									onChange={ ( value ) => { this.props.setAttributes( { imageTypeSize: value } ); this.onImageSizeChange( value ); }}/>
								: ''
							}
							<SelectControl
								label={ __( 'Image location',  'post-type-archive-mapping' ) }
								options={ imageLocationOptions }
								value={ this.state.imageLocation }
								onChange={ ( value ) => {this.onChangeLocation(value); this.props.setAttributes( { imageLocation: value } ) } }
							/>
						</Fragment>
					}
					<ToggleControl
						label={ __( 'Display Taxonomies',  'post-type-archive-mapping' ) }
						checked={ displayTaxonomies }
						onChange={ this.toggleTaxonomyDisplay }
					/>
					<ToggleControl
						label={ __( 'Display Post Author',  'post-type-archive-mapping' ) }
						checked={ displayPostAuthor }
						onChange={ this.toggleDisplayPostAuthor }
					/>
					<ToggleControl
						label={ __( 'Display Post Date',  'post-type-archive-mapping' ) }
						checked={ displayPostDate }
						onChange={ this.toggleDisplayPostDate }
					/>
					<ToggleControl
						label={ __( 'Display Post Excerpt',  'post-type-archive-mapping' ) }
						checked={ displayPostExcerpt }
						onChange={ this.toggleDisplayPostExcerpt }
					/>
					{ displayPostExcerpt &&
						<TextControl
							label={ __( 'Maximum Word Length of Excerpt',  'post-type-archive-mapping' ) }
							type="number"
							value={ trimWords }
							onChange={ ( value ) => this.trimWords( value ) }
						/>
					}
					<ToggleControl
						label={ __( 'Display Pagination',  'post-type-archive-mapping' ) }
						checked={ pagination }
						onChange={ this.toggleDisplayPagination }
					/>
					<ToggleControl
						label={ __( 'Change Capitilization',  'post-type-archive-mapping' ) }
						checked={ changeCapitilization }
						onChange={ this.toggleCapitilization }
					/>
					<ToggleControl
						label={ __( 'Display Continue Reading Link',  'post-type-archive-mapping' ) }
						checked={ displayPostLink }
						onChange={ this.toggleDisplayPostLink }
					/>
					{ displayPostLink &&
					<TextControl
						label={ __( 'Customize Read More Link',  'post-type-archive-mapping' ) }
						type="text"
						value={ readMoreText }
						onChange={ ( value ) => this.props.setAttributes( { readMoreText: value } ) }
					/>
					}
				</PanelBody>
			</InspectorControls>
		);
		if( this.state.loading ) {
			return (
				<Fragment>
					{ inspectorControls }
					<Placeholder
						icon="admin-post"
						label={ __( 'Custom Posts',  'post-type-archive-mapping' ) }
					>
						<Spinner />
					</Placeholder>
				</Fragment>
			)
		}
		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
		if ( ! hasPosts ) {
			return (
				<Fragment>
					{ inspectorControls }
					<Placeholder
						icon="admin-post"
						label={ __( 'Custom Posts',  'post-type-archive-mapping' ) }
					>
						{ ! Array.isArray( latestPosts ) ?
							<Spinner /> :
							__( 'No posts found.',  'post-type-archive-mapping' )
						}
					</Placeholder>
				</Fragment>
			);
		}

		// Removing posts from display should be instant.
		const displayPosts = latestPosts.length > postsToShow ?
			latestPosts.slice( 0, postsToShow ) :
			latestPosts;

		const layoutControls = [
			{
				icon: 'grid-view',
				title: __( 'Grid View',  'post-type-archive-mapping' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
			{
				icon: 'list-view',
				title: __( 'List View',  'post-type-archive-mapping' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
		];

		return (
			<Fragment>
				{ inspectorControls }
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ ( value ) => {
							setAttributes( { align: value } );
						} }
						controls={ [ 'center', 'wide' ] }
					/>
					<Toolbar controls={ layoutControls } />
				</BlockControls>
				<div
					className={ classnames(
						this.props.className,
						'ptam-block-post-grid',
					) }
				>
					<div
						className={ classnames( {
							'is-custom' : imageLocation !== 'regular',
							'is-grid': postLayout === 'grid',
							'is-list': postLayout === 'list',
							[ `columns-${ columns }` ]: postLayout === 'grid',
							'ptam-post-grid-items' : 'ptam-post-grid-items'
						} ) }
					>
						{ displayPosts.map( ( post, i ) =>
							<article
								key={ i }
								className={ classnames(
									post.featured_image_src && displayPostImage ? 'has-thumb' : 'no-thumb'
								) }
							>
								{
										displayPostImage && post.featured_image_src !== undefined && post.featured_image_src  && 'regular' === this.state.imageLocation ? (
											<div className="ptam-block-post-grid-image">
												<a href={ post.link } target="_blank" rel="bookmark">
												{htmlToReactParser.parse(post.featured_image_src)}
												</a>
											</div>
										) : (
											null
										)
								}

								<div className="ptam-block-post-grid-text">
									<h2 className="entry-title"><a href={ post.link } target="_blank" rel="bookmark">{ decodeEntities( post.post_title.trim() ) || __( '(Untitled)', 'post-type-archive-mapping' ) }</a></h2>
									{displayPostImage && post.featured_image_src !== undefined && post.featured_image_src  && 'below_title' === this.state.imageLocation ? (
											<div className="ptam-block-post-grid-image">
												<a href={ post.link } target="_blank" rel="bookmark">
												{htmlToReactParser.parse(post.featured_image_src)}
												</a>
											</div>
										) : (
											null
										)
									}

									<div className={`ptam-block-post-grid-byline ${capitilization}`}>
										{ displayPostAuthor && post.author_info.display_name !== 'undefined' && post.author_info.display_name &&
											<div className="ptam-block-post-grid-author"><a className="ptam-text-link" target="_blank" href={ post.author_info.author_link }>{ post.author_info.display_name }</a></div>
										}

										{ displayPostDate && post.post_date_gmt &&
											<time dateTime={ moment( post.post_date_gmt ).utc().format() } className={ 'ptam-block-post-grid-date' }>
												{ moment( post.post_date_gmt ).local().format( 'MMMM DD, Y' ) }
											</time>
										}
										{ userTaxonomiesArray.length > 0 && displayTaxonomies &&
											<div>
												{userTaxonomiesArray.map((key) => {
													if( post.terms[key.value] !== false ) {
														return (<div className="ptam-terms"><span className="ptam-term-label">{key.label}: </span><span className="ptam-term-values">{htmlToReactParser.parse(post.terms[key.value])}</span></div>);
													}
												})}
											</div>
										}
										{
										displayPostImage && post.featured_image_src !== undefined && post.featured_image_src  && 'below_title_and_meta' === this.state.imageLocation ? (
											<div className="ptam-block-post-grid-image">
												<a href={ post.link } target="_blank" rel="bookmark">
												{htmlToReactParser.parse(post.featured_image_src)}
												</a>
											</div>
											) : (
											null
											)
										}
									</div>

									<div className="ptam-block-post-grid-excerpt">
										{ displayPostExcerpt && '' !==  post.post_excerpt &&
											<Fragment>
												{this.excerptParse(post.post_excerpt)}
											</Fragment>
										}

										{ displayPostLink &&
											<p><a className="ptam-block-post-grid-link ptam-text-link" href={ post.link } target="_blank" rel="bookmark">{ readMoreText }</a></p>
										}
										{
										displayPostImage && post.featured_image_src !== undefined && post.featured_image_src  && 'bottom' === this.state.imageLocation ? (
												<div className="ptam-block-post-grid-image">
													<a href={ post.link } target="_blank" rel="bookmark">
													{htmlToReactParser.parse(post.featured_image_src)}
													</a>
												</div>
											) : (
												null
											)
										}
									</div>
								</div>
							</article>
						) }
					</div>
				</div>
			</Fragment>
		);
	}
}

export default PTAM_Custom_Posts;